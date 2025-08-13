-- EncoreTalks Database Schema
-- Supabase/PostgreSQL with Row Level Security (RLS)

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Custom types
CREATE TYPE user_role AS ENUM ('client', 'expert', 'admin', 'org_admin', 'org_manager', 'org_member');
CREATE TYPE booking_mode AS ENUM ('fixed', 'per_minute');
CREATE TYPE booking_status AS ENUM ('requested', 'confirmed', 'in_progress', 'completed', 'cancelled', 'refunded');
CREATE TYPE mentorship_status AS ENUM ('active', 'paused', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'succeeded', 'failed', 'refunded');
CREATE TYPE referral_status AS ENUM ('sent', 'signed_up', 'booked');
CREATE TYPE expert_badge AS ENUM ('verified_credentials', 'background_checked', 'notable');
CREATE TYPE org_member_role AS ENUM ('org_admin', 'org_manager', 'org_member');

-- Profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'client',
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    timezone TEXT DEFAULT 'UTC',
    languages TEXT[] DEFAULT '{"en"}',
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories for expertise areas
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    icon TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Expert profiles with detailed information
CREATE TABLE expert_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    headline TEXT NOT NULL,
    expertise_tags TEXT[] DEFAULT '{}',
    intro_video_url TEXT,
    years_experience INTEGER DEFAULT 0,
    rate_cents_per_minute INTEGER DEFAULT 0,
    fixed_15m_cents INTEGER DEFAULT 0,
    fixed_30m_cents INTEGER DEFAULT 0,
    fixed_60m_cents INTEGER DEFAULT 0,
    availability_json JSONB DEFAULT '{}',
    stripe_account_id TEXT,
    rating_avg DECIMAL(3,2) DEFAULT 0.00,
    rating_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(profile_id)
);

-- Expert badges for credibility
CREATE TABLE expert_badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    expert_id UUID NOT NULL REFERENCES expert_profiles(id) ON DELETE CASCADE,
    badge expert_badge NOT NULL,
    awarded_by UUID REFERENCES profiles(id),
    awarded_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(expert_id, badge)
);

-- Organizations for enterprise accounts
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    billing_email TEXT NOT NULL,
    sso_domain TEXT,
    plan TEXT DEFAULT 'basic',
    seats INTEGER DEFAULT 10,
    owner_id UUID NOT NULL REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Organization members
CREATE TABLE org_members (
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role org_member_role NOT NULL DEFAULT 'org_member',
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (org_id, profile_id)
);

-- Bookings - core transaction table
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES profiles(id),
    expert_id UUID NOT NULL REFERENCES expert_profiles(id),
    category_id UUID REFERENCES categories(id),
    mode booking_mode NOT NULL,
    scheduled_start TIMESTAMPTZ NOT NULL,
    scheduled_end TIMESTAMPTZ NOT NULL,
    actual_start TIMESTAMPTZ,
    actual_end TIMESTAMPTZ,
    status booking_status DEFAULT 'requested',
    meeting_url TEXT,
    price_cents_total INTEGER NOT NULL,
    commission_pct DECIMAL(5,2) DEFAULT 20.00,
    expert_net_cents INTEGER NOT NULL,
    org_id UUID REFERENCES organizations(id),
    stripe_payment_intent_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mentorship plans offered by experts
CREATE TABLE mentorship_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    expert_id UUID NOT NULL REFERENCES expert_profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    minutes_per_week INTEGER NOT NULL,
    monthly_price_cents INTEGER NOT NULL,
    async_chat BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mentorship subscriptions
CREATE TABLE mentorship_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES profiles(id),
    expert_id UUID NOT NULL REFERENCES expert_profiles(id),
    plan_id UUID NOT NULL REFERENCES mentorship_plans(id),
    status mentorship_status DEFAULT 'active',
    current_period_start TIMESTAMPTZ NOT NULL,
    current_period_end TIMESTAMPTZ NOT NULL,
    stripe_subscription_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages for in-session and mentorship chat
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    mentorship_id UUID REFERENCES mentorship_subscriptions(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES profiles(id),
    text TEXT NOT NULL,
    file_url TEXT,
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT messages_parent_check CHECK (
        (booking_id IS NOT NULL AND mentorship_id IS NULL) OR
        (booking_id IS NULL AND mentorship_id IS NOT NULL)
    )
);

-- Session recordings and AI processing
CREATE TABLE recordings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    media_url TEXT,
    transcript_url TEXT,
    ai_summary_md TEXT,
    consent_flags JSONB DEFAULT '{}',
    redaction_jsonb JSONB DEFAULT '{}',
    processing_status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment tracking
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(id),
    stripe_payment_intent_id TEXT NOT NULL,
    status payment_status DEFAULT 'pending',
    amount_cents INTEGER NOT NULL,
    platform_fee_cents INTEGER NOT NULL,
    expert_payout_cents INTEGER NOT NULL,
    released_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews and ratings
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(id),
    rater_id UUID NOT NULL REFERENCES profiles(id),
    ratee_id UUID NOT NULL REFERENCES profiles(id),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(booking_id, rater_id)
);

-- Affiliate program
CREATE TABLE affiliates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    owner_profile_id UUID NOT NULL REFERENCES profiles(id),
    rate_pct DECIMAL(5,2) DEFAULT 5.00,
    clicks INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Referral tracking
CREATE TABLE referrals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    referrer_profile_id UUID NOT NULL REFERENCES profiles(id),
    referee_email TEXT NOT NULL,
    referee_profile_id UUID REFERENCES profiles(id),
    status referral_status DEFAULT 'sent',
    reward_cents INTEGER DEFAULT 0,
    affiliate_code TEXT REFERENCES affiliates(code),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit logging for admin actions
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID REFERENCES profiles(id),
    action TEXT NOT NULL,
    entity TEXT NOT NULL,
    entity_id UUID NOT NULL,
    meta_json JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_expert_profiles_profile_id ON expert_profiles(profile_id);
CREATE INDEX idx_expert_profiles_rating ON expert_profiles(rating_avg DESC, rating_count DESC);
CREATE INDEX idx_bookings_client_id ON bookings(client_id);
CREATE INDEX idx_bookings_expert_id ON bookings(expert_id);
CREATE INDEX idx_bookings_scheduled_start ON bookings(scheduled_start);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_messages_booking_id ON messages(booking_id);
CREATE INDEX idx_messages_mentorship_id ON messages(mentorship_id);
CREATE INDEX idx_reviews_ratee_id ON reviews(ratee_id);
CREATE INDEX idx_audit_logs_actor_id ON audit_logs(actor_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity, entity_id);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE expert_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE expert_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentorship_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentorship_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Categories are public read, admin write
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories are publicly readable" ON categories FOR SELECT USING (true);
CREATE POLICY "Only admins can modify categories" ON categories FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Profiles: users can read public info, edit own profile
CREATE POLICY "Profiles are publicly readable" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Expert profiles: public read, own expert can edit
CREATE POLICY "Expert profiles are publicly readable" ON expert_profiles FOR SELECT USING (true);
CREATE POLICY "Experts can update own profile" ON expert_profiles FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND id = profile_id)
);
CREATE POLICY "Experts can create own profile" ON expert_profiles FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND id = profile_id)
);

-- Expert badges: public read, admin write
CREATE POLICY "Expert badges are publicly readable" ON expert_badges FOR SELECT USING (true);
CREATE POLICY "Only admins can manage badges" ON expert_badges FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Bookings: participants can see, experts/clients can create
CREATE POLICY "Users can see own bookings" ON bookings FOR SELECT USING (
    auth.uid() = client_id OR 
    EXISTS (SELECT 1 FROM expert_profiles WHERE id = expert_id AND profile_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Clients can create bookings" ON bookings FOR INSERT WITH CHECK (auth.uid() = client_id);
CREATE POLICY "Participants can update bookings" ON bookings FOR UPDATE USING (
    auth.uid() = client_id OR 
    EXISTS (SELECT 1 FROM expert_profiles WHERE id = expert_id AND profile_id = auth.uid())
);

-- Messages: booking participants can see and send
CREATE POLICY "Booking participants can see messages" ON messages FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM bookings b 
        WHERE b.id = booking_id AND (
            b.client_id = auth.uid() OR 
            EXISTS (SELECT 1 FROM expert_profiles ep WHERE ep.id = b.expert_id AND ep.profile_id = auth.uid())
        )
    ) OR
    EXISTS (
        SELECT 1 FROM mentorship_subscriptions ms
        WHERE ms.id = mentorship_id AND (
            ms.client_id = auth.uid() OR
            EXISTS (SELECT 1 FROM expert_profiles ep WHERE ep.id = ms.expert_id AND ep.profile_id = auth.uid())
        )
    )
);
CREATE POLICY "Booking participants can send messages" ON messages FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND (
        EXISTS (
            SELECT 1 FROM bookings b 
            WHERE b.id = booking_id AND (
                b.client_id = auth.uid() OR 
                EXISTS (SELECT 1 FROM expert_profiles ep WHERE ep.id = b.expert_id AND ep.profile_id = auth.uid())
            )
        ) OR
        EXISTS (
            SELECT 1 FROM mentorship_subscriptions ms
            WHERE ms.id = mentorship_id AND (
                ms.client_id = auth.uid() OR
                EXISTS (SELECT 1 FROM expert_profiles ep WHERE ep.id = ms.expert_id AND ep.profile_id = auth.uid())
            )
        )
    )
);

-- Reviews: public read, booking participants can write
CREATE POLICY "Reviews are publicly readable" ON reviews FOR SELECT USING (true);
CREATE POLICY "Booking participants can write reviews" ON reviews FOR INSERT WITH CHECK (
    auth.uid() = rater_id AND
    EXISTS (
        SELECT 1 FROM bookings b 
        WHERE b.id = booking_id AND (
            b.client_id = auth.uid() OR 
            EXISTS (SELECT 1 FROM expert_profiles ep WHERE ep.id = b.expert_id AND ep.profile_id = auth.uid())
        )
    )
);

-- Audit logs: admin only
CREATE POLICY "Only admins can see audit logs" ON audit_logs FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Functions for maintaining data integrity

-- Update expert rating when review is added
CREATE OR REPLACE FUNCTION update_expert_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE expert_profiles SET
        rating_avg = (
            SELECT ROUND(AVG(rating::numeric), 2)
            FROM reviews r
            JOIN bookings b ON r.booking_id = b.id
            WHERE b.expert_id = (
                SELECT expert_id FROM bookings WHERE id = NEW.booking_id
            )
        ),
        rating_count = (
            SELECT COUNT(*)
            FROM reviews r
            JOIN bookings b ON r.booking_id = b.id
            WHERE b.expert_id = (
                SELECT expert_id FROM bookings WHERE id = NEW.booking_id
            )
        )
    WHERE id = (
        SELECT expert_id FROM bookings WHERE id = NEW.booking_id
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_expert_rating
    AFTER INSERT ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_expert_rating();

-- Update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_expert_profiles_updated_at BEFORE UPDATE ON expert_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_organizations_updated_at BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_bookings_updated_at BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();