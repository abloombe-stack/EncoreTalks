-- EncoreTalks Database Schema
-- Supabase/PostgreSQL with Row Level Security (RLS)

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Set search path to ensure proper table lookup
SET search_path = public;

-- Custom types
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('client', 'expert', 'admin', 'org_admin', 'org_manager', 'org_member');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE booking_mode AS ENUM ('fixed', 'per_minute');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE booking_status AS ENUM ('requested', 'confirmed', 'in_progress', 'completed', 'cancelled', 'refunded');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE mentorship_status AS ENUM ('active', 'paused', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('pending', 'succeeded', 'failed', 'refunded');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE referral_status AS ENUM ('sent', 'signed_up', 'booked');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE expert_badge AS ENUM ('verified_credentials', 'background_checked', 'notable');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE org_member_role AS ENUM ('org_admin', 'org_manager', 'org_member');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY,
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
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    icon TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Expert profiles with detailed information
CREATE TABLE IF NOT EXISTS expert_profiles (
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
    stripe_connect_enabled BOOLEAN DEFAULT FALSE,
    stripe_connect_requirements JSONB DEFAULT '{}',
    rating_avg DECIMAL(3,2) DEFAULT 0.00,
    rating_count INTEGER DEFAULT 0,
    inquiries_count INTEGER DEFAULT 0,
    inquiries_30d INTEGER DEFAULT 0,
    charity_enabled BOOLEAN DEFAULT FALSE,
    charity_pct DECIMAL(5,2) DEFAULT 0.00,
    charity_org TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(profile_id)
);

-- Expert badges for credibility
CREATE TABLE IF NOT EXISTS expert_badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    expert_id UUID NOT NULL REFERENCES expert_profiles(id) ON DELETE CASCADE,
    badge expert_badge NOT NULL,
    awarded_by UUID REFERENCES profiles(id),
    awarded_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(expert_id, badge)
);

-- Organizations for enterprise accounts
CREATE TABLE IF NOT EXISTS organizations (
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
CREATE TABLE IF NOT EXISTS org_members (
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role org_member_role NOT NULL DEFAULT 'org_member',
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (org_id, profile_id)
);

-- Bookings - core transaction table
CREATE TABLE IF NOT EXISTS bookings (
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
    consent_recording BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mentorship plans offered by experts
CREATE TABLE IF NOT EXISTS mentorship_plans (
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
CREATE TABLE IF NOT EXISTS mentorship_subscriptions (
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
CREATE TABLE IF NOT EXISTS messages (
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
CREATE TABLE IF NOT EXISTS recordings (
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
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(id),
    stripe_payment_intent_id TEXT NOT NULL,
    stripe_charge_id TEXT,
    status payment_status DEFAULT 'pending',
    amount_cents INTEGER NOT NULL,
    platform_fee_cents INTEGER NOT NULL,
    expert_payout_cents INTEGER NOT NULL,
    released_at TIMESTAMPTZ,
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews and ratings
CREATE TABLE IF NOT EXISTS reviews (
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
CREATE TABLE IF NOT EXISTS affiliates (
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
CREATE TABLE IF NOT EXISTS referrals (
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

-- Webhook events for idempotency
CREATE TABLE IF NOT EXISTS webhook_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    idempotency_key TEXT UNIQUE NOT NULL,
    event_type TEXT NOT NULL,
    processed_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Platform metrics for social proof
CREATE TABLE IF NOT EXISTS platform_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    metric_name TEXT UNIQUE NOT NULL,
    metric_value INTEGER NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit logging for admin actions
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID REFERENCES profiles(id),
    action TEXT NOT NULL,
    entity TEXT NOT NULL,
    entity_id UUID NOT NULL,
    meta_json JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_expert_profiles_profile_id ON expert_profiles(profile_id);
CREATE INDEX IF NOT EXISTS idx_expert_profiles_rating ON expert_profiles(rating_avg DESC, rating_count DESC);
CREATE INDEX IF NOT EXISTS idx_expert_profiles_active ON expert_profiles(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_bookings_client_id ON bookings(client_id);
CREATE INDEX IF NOT EXISTS idx_bookings_expert_id ON bookings(expert_id);
CREATE INDEX IF NOT EXISTS idx_bookings_scheduled_start ON bookings(scheduled_start);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_messages_booking_id ON messages(booking_id);
CREATE INDEX IF NOT EXISTS idx_messages_mentorship_id ON messages(mentorship_id);
CREATE INDEX IF NOT EXISTS idx_reviews_ratee_id ON reviews(ratee_id);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_payment_intent ON payments(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_idempotency ON webhook_events(idempotency_key);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_id ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity, entity_id);

-- Row Level Security (RLS) Policies
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
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_metrics ENABLE ROW LEVEL SECURITY;

-- Categories are public read, admin write
DROP POLICY IF EXISTS "Categories are publicly readable" ON categories;
CREATE POLICY "Categories are publicly readable" ON categories FOR SELECT USING (true);
DROP POLICY IF EXISTS "Only admins can modify categories" ON categories;
CREATE POLICY "Only admins can modify categories" ON categories FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Platform metrics are public read, system write
DROP POLICY IF EXISTS "Platform metrics are publicly readable" ON platform_metrics;
CREATE POLICY "Platform metrics are publicly readable" ON platform_metrics FOR SELECT USING (true);
DROP POLICY IF EXISTS "Only system can modify platform metrics" ON platform_metrics;
CREATE POLICY "Only system can modify platform metrics" ON platform_metrics FOR ALL USING (false);

-- Profiles: users can read public info, edit own profile
DROP POLICY IF EXISTS "Profiles are publicly readable" ON profiles;
CREATE POLICY "Profiles are publicly readable" ON profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Expert profiles: public read, own expert can edit
DROP POLICY IF EXISTS "Expert profiles are publicly readable" ON expert_profiles;
CREATE POLICY "Expert profiles are publicly readable" ON expert_profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Experts can update own profile" ON expert_profiles;
CREATE POLICY "Experts can update own profile" ON expert_profiles FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND id = profile_id)
);
DROP POLICY IF EXISTS "Experts can create own profile" ON expert_profiles;
CREATE POLICY "Experts can create own profile" ON expert_profiles FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND id = profile_id)
);

-- Expert badges: public read, admin write
DROP POLICY IF EXISTS "Expert badges are publicly readable" ON expert_badges;
CREATE POLICY "Expert badges are publicly readable" ON expert_badges FOR SELECT USING (true);
DROP POLICY IF EXISTS "Only admins can manage badges" ON expert_badges;
CREATE POLICY "Only admins can manage badges" ON expert_badges FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Bookings: participants can see, experts/clients can create
DROP POLICY IF EXISTS "Users can see own bookings" ON bookings;
CREATE POLICY "Users can see own bookings" ON bookings FOR SELECT USING (
    auth.uid() = client_id OR 
    EXISTS (SELECT 1 FROM expert_profiles WHERE id = expert_id AND profile_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
DROP POLICY IF EXISTS "Clients can create bookings" ON bookings;
CREATE POLICY "Clients can create bookings" ON bookings FOR INSERT WITH CHECK (auth.uid() = client_id);
DROP POLICY IF EXISTS "Participants can update bookings" ON bookings;
CREATE POLICY "Participants can update bookings" ON bookings FOR UPDATE USING (
    auth.uid() = client_id OR 
    EXISTS (SELECT 1 FROM expert_profiles WHERE id = expert_id AND profile_id = auth.uid())
);

-- Messages: booking participants can see and send
DROP POLICY IF EXISTS "Booking participants can see messages" ON messages;
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
DROP POLICY IF EXISTS "Booking participants can send messages" ON messages;
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
DROP POLICY IF EXISTS "Reviews are publicly readable" ON reviews;
CREATE POLICY "Reviews are publicly readable" ON reviews FOR SELECT USING (true);
DROP POLICY IF EXISTS "Booking participants can write reviews" ON reviews;
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
DROP POLICY IF EXISTS "Only admins can see audit logs" ON audit_logs;
CREATE POLICY "Only admins can see audit logs" ON audit_logs FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Webhook events: system only
DROP POLICY IF EXISTS "System only webhook events" ON webhook_events;
CREATE POLICY "System only webhook events" ON webhook_events FOR ALL USING (false);

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

DROP TRIGGER IF EXISTS trigger_update_expert_rating ON reviews;
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

DROP TRIGGER IF EXISTS trigger_profiles_updated_at ON profiles;
CREATE TRIGGER trigger_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS trigger_expert_profiles_updated_at ON expert_profiles;
CREATE TRIGGER trigger_expert_profiles_updated_at BEFORE UPDATE ON expert_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS trigger_organizations_updated_at ON organizations;
CREATE TRIGGER trigger_organizations_updated_at BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS trigger_bookings_updated_at ON bookings;
CREATE TRIGGER trigger_bookings_updated_at BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Initialize platform metrics
INSERT INTO platform_metrics (metric_name, metric_value) VALUES
    ('total_sessions_booked', 1248),
    ('average_rating', 49), -- stored as 49 for 4.9
    ('expert_earnings_range_min', 100),
    ('expert_earnings_range_max', 800),
    ('total_experts', 156)
ON CONFLICT (metric_name) DO NOTHING;

-- Insert default categories
INSERT INTO categories (id, name, description, icon) VALUES
    ('cat-business', 'Business & Finance', 'Expert guidance on business strategy, finance, and entrepreneurship', '💼'),
    ('cat-tech', 'Technology', 'Software development, AI, cybersecurity, and tech trends', '💻'),
    ('cat-health', 'Health & Wellness', 'Fitness, nutrition, mental health, and medical advice', '🏥'),
    ('cat-career', 'Career Development', 'Resume help, interview prep, and career advancement', '📈'),
    ('cat-creative', 'Creative Arts', 'Design, writing, music, photography, and creative skills', '🎨'),
    ('cat-education', 'Education & Learning', 'Academic tutoring, language learning, and skill development', '📚'),
    ('cat-lifestyle', 'Lifestyle & Hobbies', 'Cooking, travel, relationships, and personal interests', '🌟'),
    ('cat-legal', 'Legal & Compliance', 'Legal advice, compliance, and regulatory guidance', '⚖️')
ON CONFLICT (id) DO NOTHING;

COMMIT;