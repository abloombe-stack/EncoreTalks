-- seed.sql - Sample data for EncoreTalks platform
-- Run this after the schema migration

-- Insert sample categories
INSERT INTO categories (id, name, description, icon) VALUES
  ('cat-business', 'Business & Finance', 'Expert guidance on business strategy, finance, and entrepreneurship', '💼'),
  ('cat-tech', 'Technology', 'Software development, AI, cybersecurity, and tech trends', '💻'),
  ('cat-health', 'Health & Wellness', 'Fitness, nutrition, mental health, and medical advice', '🏥'),
  ('cat-career', 'Career Development', 'Resume help, interview prep, and career advancement', '📈'),
  ('cat-creative', 'Creative Arts', 'Design, writing, music, photography, and creative skills', '🎨'),
  ('cat-education', 'Education & Learning', 'Academic tutoring, language learning, and skill development', '📚'),
  ('cat-lifestyle', 'Lifestyle & Hobbies', 'Cooking, travel, relationships, and personal interests', '🌟'),
  ('cat-legal', 'Legal & Compliance', 'Legal advice, compliance, and regulatory guidance', '⚖️');

-- Insert sample user profiles
INSERT INTO profiles (id, role, first_name, last_name, avatar_url, bio, timezone, languages, verified) VALUES
  -- Clients
  ('client-1', 'client', 'Sarah', 'Johnson', 'https://images.unsplash.com/photo-1494790108755-2616b612c1d5?w=150', 'Marketing professional looking to advance my career', 'America/New_York', '{"en"}', true),
  ('client-2', 'client', 'Michael', 'Chen', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', 'Software engineer interested in AI and machine learning', 'America/Los_Angeles', '{"en", "zh"}', true),
  ('client-3', 'client', 'Emily', 'Rodriguez', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150', 'Entrepreneur building a sustainable fashion startup', 'America/Chicago', '{"en", "es"}', true),
  
  -- Experts
  ('expert-1', 'expert', 'Dr. James', 'Wilson', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', 'Former McKinsey partner with 20+ years in strategy consulting', 'America/New_York', '{"en"}', true),
  ('expert-2', 'expert', 'Lisa', 'Kumar', 'https://images.unsplash.com/photo-1494790108755-2616b612c1d5?w=150', 'Senior Software Engineer at Google, AI/ML specialist', 'America/Los_Angeles', '{"en", "hi"}', true),
  ('expert-3', 'expert', 'Dr. Maria', 'Santos', 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150', 'Licensed therapist specializing in workplace wellness', 'America/Denver', '{"en", "es", "pt"}', true),
  ('expert-4', 'expert', 'David', 'Thompson', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150', 'Y Combinator alumni, built and sold 3 startups', 'America/Los_Angeles', '{"en"}', true),
  ('expert-5', 'expert', 'Prof. Anna', 'Lee', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150', 'Harvard Business School professor, finance expert', 'America/New_York', '{"en", "ko"}', true),
  ('expert-6', 'expert', 'Carlos', 'Mendez', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', 'Creative director with 15 years at top agencies', 'America/New_York', '{"en", "es"}', true),
  
  -- Admin
  ('admin-1', 'admin', 'Admin', 'User', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', 'Platform administrator', 'America/New_York', '{"en"}', true);

-- Insert expert profiles
INSERT INTO expert_profiles (id, profile_id, headline, expertise_tags, intro_video_url, years_experience, rate_cents_per_minute, fixed_15m_cents, fixed_30m_cents, fixed_60m_cents, availability_json, rating_avg, rating_count) VALUES
  ('exp-1', 'expert-1', 'Strategic Business Consultant & Former McKinsey Partner', 
   '{"business strategy", "management consulting", "leadership", "market analysis", "digital transformation"}',
   'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
   20, 800, 1800, 3200, 5800,
   '{"1": [{"start": 9, "end": 17}], "2": [{"start": 9, "end": 17}], "3": [{"start": 9, "end": 17}], "4": [{"start": 9, "end": 17}], "5": [{"start": 9, "end": 17}]}',
   4.9, 127),
   
  ('exp-2', 'expert-2', 'Senior AI/ML Engineer at Google', 
   '{"artificial intelligence", "machine learning", "python", "tensorflow", "data science", "deep learning"}',
   'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
   12, 600, 1200, 2200, 4000,
   '{"1": [{"start": 18, "end": 22}], "2": [{"start": 18, "end": 22}], "3": [{"start": 18, "end": 22}], "4": [{"start": 18, "end": 22}], "5": [{"start": 18, "end": 22}]}',
   4.8, 89),
   
  ('exp-3', 'expert-3', 'Licensed Therapist & Workplace Wellness Expert', 
   '{"mental health", "workplace wellness", "stress management", "therapy", "mindfulness", "burnout prevention"}',
   null,
   15, 400, 900, 1600, 2800,
   '{"1": [{"start": 8, "end": 12}, {"start": 14, "end": 18}], "2": [{"start": 8, "end": 12}, {"start": 14, "end": 18}], "3": [{"start": 8, "end": 12}, {"start": 14, "end": 18}], "4": [{"start": 8, "end": 12}, {"start": 14, "end": 18}], "5": [{"start": 8, "end": 12}]}',
   4.95, 203),
   
  ('exp-4', 'expert-4', 'Serial Entrepreneur & Y Combinator Alumni', 
   '{"startups", "entrepreneurship", "fundraising", "product development", "venture capital", "scaling"}',
   'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
   18, 700, 1500, 2800, 5000,
   '{"1": [{"start": 10, "end": 16}], "3": [{"start": 10, "end": 16}], "5": [{"start": 10, "end": 16}]}',
   4.7, 156),
   
  ('exp-5', 'expert-5', 'Harvard Business School Professor - Finance', 
   '{"finance", "investment", "valuation", "corporate finance", "financial modeling", "economics"}',
   null,
   25, 900, 2000, 3600, 6500,
   '{"2": [{"start": 14, "end": 18}], "4": [{"start": 14, "end": 18}]}',
   4.85, 74),
   
  ('exp-6', 'expert-6', 'Creative Director & Brand Strategist', 
   '{"creative direction", "branding", "design thinking", "advertising", "marketing", "visual design"}',
   'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
   15, 500, 1100, 2000, 3600,
   '{"1": [{"start": 9, "end": 13}, {"start": 15, "end": 19}], "2": [{"start": 9, "end": 13}, {"start": 15, "end": 19}], "3": [{"start": 9, "end": 13}, {"start": 15, "end": 19}], "4": [{"start": 9, "end": 13}, {"start": 15, "end": 19}], "5": [{"start": 10, "end": 14}]}',
   4.6, 92);

-- Insert expert badges
INSERT INTO expert_badges (expert_id, badge, awarded_by, awarded_at) VALUES
  ('exp-1', 'verified_credentials', 'admin-1', NOW() - INTERVAL '30 days'),
  ('exp-1', 'background_checked', 'admin-1', NOW() - INTERVAL '25 days'),
  ('exp-1', 'notable', 'admin-1', NOW() - INTERVAL '20 days'),
  ('exp-2', 'verified_credentials', 'admin-1', NOW() - INTERVAL '15 days'),
  ('exp-2', 'background_checked', 'admin-1', NOW() - INTERVAL '10 days'),
  ('exp-3', 'verified_credentials', 'admin-1', NOW() - INTERVAL '12 days'),
  ('exp-3', 'background_checked', 'admin-1', NOW() - INTERVAL '8 days'),
  ('exp-4', 'verified_credentials', 'admin-1', NOW() - INTERVAL '22 days'),
  ('exp-4', 'notable', 'admin-1', NOW() - INTERVAL '18 days'),
  ('exp-5', 'verified_credentials', 'admin-1', NOW() - INTERVAL '35 days'),
  ('exp-5', 'background_checked', 'admin-1', NOW() - INTERVAL '32 days'),
  ('exp-5', 'notable', 'admin-1', NOW() - INTERVAL '28 days'),
  ('exp-6', 'verified_credentials', 'admin-1', NOW() - INTERVAL '14 days');

-- Insert sample bookings
INSERT INTO bookings (id, client_id, expert_id, category_id, mode, scheduled_start, scheduled_end, status, price_cents_total, commission_pct, expert_net_cents, stripe_payment_intent_id) VALUES
  ('booking-1', 'client-1', 'exp-1', 'cat-business', 'fixed', 
   NOW() + INTERVAL '2 days', NOW() + INTERVAL '2 days' + INTERVAL '30 minutes', 
   'confirmed', 3200, 20, 2560, 'pi_test_1'),
  ('booking-2', 'client-2', 'exp-2', 'cat-tech', 'per_minute', 
   NOW() + INTERVAL '1 day', NOW() + INTERVAL '1 day' + INTERVAL '45 minutes', 
   'confirmed', 2700, 20, 2160, 'pi_test_2'),
  ('booking-3', 'client-3', 'exp-3', 'cat-health', 'fixed', 
   NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days' + INTERVAL '30 minutes', 
   'completed', 1600, 20, 1280, 'pi_test_3'),
  ('booking-4', 'client-1', 'exp-4', 'cat-business', 'fixed', 
   NOW() - INTERVAL '1 week', NOW() - INTERVAL '1 week' + INTERVAL '60 minutes', 
   'completed', 5000, 20, 4000, 'pi_test_4'),
  ('booking-5', 'client-2', 'exp-5', 'cat-business', 'fixed', 
   NOW() - INTERVAL '2 weeks', NOW() - INTERVAL '2 weeks' + INTERVAL '30 minutes', 
   'completed', 3600, 20, 2880, 'pi_test_5');

-- Insert mentorship plans
INSERT INTO mentorship_plans (id, expert_id, title, description, minutes_per_week, monthly_price_cents, async_chat) VALUES
  ('plan-1', 'exp-1', 'Executive Leadership Mentorship', 
   'Monthly 1-on-1 sessions focused on developing executive presence and strategic thinking. Includes async messaging for ongoing support.',
   120, 149900, true),
  ('plan-2', 'exp-2', 'AI/ML Career Development', 
   'Weekly technical mentorship for engineers looking to advance in AI/ML. Code reviews, career guidance, and project feedback.',
   90, 99900, true),
  ('plan-3', 'exp-3', 'Workplace Wellness Coaching', 
   'Bi-weekly sessions focused on stress management, work-life balance, and mental health in professional settings.',
   60, 79900, true),
  ('plan-4', 'exp-4', 'Startup Founder Program', 
   'Comprehensive mentorship for early-stage founders. Covers fundraising, product development, team building, and scaling.',
   150, 199900, true);

-- Insert sample reviews
INSERT INTO reviews (booking_id, rater_id, ratee_id, rating, comment) VALUES
  ('booking-3', 'client-3', 'expert-3', 5, 
   'Dr. Santos was incredibly helpful and insightful. Her approach to workplace stress management has already made a huge difference in my daily routine. Highly recommend!'),
  ('booking-4', 'client-1', 'expert-4', 5, 
   'David provided excellent guidance on our Series A strategy. His experience really shows, and he gave us actionable insights that we implemented immediately.'),
  ('booking-5', 'client-2', 'expert-5', 4, 
   'Prof. Lee clearly knows her stuff when it comes to finance. The session was very informative, though I wished we had more time to dive deeper into valuation methods.');

-- Insert sample payments
INSERT INTO payments (booking_id, stripe_payment_intent_id, status, amount_cents, platform_fee_cents, expert_payout_cents, released_at) VALUES
  ('booking-3', 'pi_test_3', 'succeeded', 1600, 320, 1280, NOW() - INTERVAL '3 days'),
  ('booking-4', 'pi_test_4', 'succeeded', 5000, 1000, 4000, NOW() - INTERVAL '1 week'),
  ('booking-5', 'pi_test_5', 'succeeded', 3600, 720, 2880, NOW() - INTERVAL '2 weeks');

-- Insert sample affiliates
INSERT INTO affiliates (code, owner_profile_id, rate_pct, clicks, conversions) VALUES
  ('BIZEXPERT', 'expert-1', 10.00, 156, 23),
  ('TECHGURU', 'expert-2', 8.00, 89, 12),
  ('WELLNESS', 'expert-3', 12.00, 234, 45);

-- Insert sample referrals
INSERT INTO referrals (referrer_profile_id, referee_email, status, reward_cents, affiliate_code) VALUES
  ('client-1', 'friend1@example.com', 'sent', 0, 'BIZEXPERT'),
  ('client-2', 'colleague@example.com', 'signed_up', 2500, 'TECHGURU'),
  ('expert-1', 'network@example.com', 'booked', 5000, 'BIZEXPERT');

-- Insert audit logs (sample recent activity)
INSERT INTO audit_logs (actor_id, action, entity, entity_id, meta_json) VALUES
  ('admin-1', 'POST /api/admin/experts/verify', 'experts', 'exp-6', 
   '{"method": "POST", "path": "/api/admin/experts/verify", "status": 200, "ip": "192.168.1.1"}'),
  ('expert-1', 'PUT /api/experts/exp-1', 'experts', 'exp-1', 
   '{"method": "PUT", "path": "/api/experts/exp-1", "status": 200, "ip": "192.168.1.2"}'),
  ('client-1', 'POST /api/bookings', 'bookings', 'booking-1', 
   '{"method": "POST", "path": "/api/bookings", "status": 201, "ip": "192.168.1.3"}');

-- Update expert ratings based on reviews (this would normally be handled by triggers)
UPDATE expert_profiles SET 
  rating_avg = (
    SELECT ROUND(AVG(r.rating::numeric), 2)
    FROM reviews r
    JOIN bookings b ON r.booking_id = b.id
    WHERE b.expert_id = expert_profiles.id
  ),
  rating_count = (
    SELECT COUNT(*)
    FROM reviews r
    JOIN bookings b ON r.booking_id = b.id
    WHERE b.expert_id = expert_profiles.id
  )
WHERE id IN ('exp-3', 'exp-4', 'exp-5');

-- Insert additional sample data for testing various scenarios

-- Sample organization
INSERT INTO organizations (id, name, billing_email, sso_domain, plan, seats, owner_id) VALUES
  ('org-1', 'TechCorp Inc.', 'billing@techcorp.com', 'techcorp.com', 'enterprise', 100, 'client-2');

-- Organization members
INSERT INTO org_members (org_id, profile_id, role) VALUES
  ('org-1', 'client-2', 'org_admin'),
  ('org-1', 'client-1', 'org_member');

-- Sample messages for completed bookings
INSERT INTO messages (booking_id, sender_id, text, sent_at) VALUES
  ('booking-3', 'client-3', 'Hi Dr. Santos, I have some specific questions about managing team stress during our busy season.', NOW() - INTERVAL '3 days' + INTERVAL '5 minutes'),
  ('booking-3', 'expert-3', 'Of course! Let me share some strategies that have worked well for other teams in similar situations.', NOW() - INTERVAL '3 days' + INTERVAL '7 minutes'),
  ('booking-4', 'expert-4', 'Based on what you shared about your user growth, here are the key metrics investors will want to see...', NOW() - INTERVAL '1 week' + INTERVAL '15 minutes'),
  ('booking-4', 'client-1', 'This is incredibly helpful! Could you elaborate on the unit economics part?', NOW() - INTERVAL '1 week' + INTERVAL '17 minutes');

-- Sample recordings for completed sessions
INSERT INTO recordings (booking_id, media_url, transcript_url, ai_summary_md, consent_flags, processing_status) VALUES
  ('booking-3', 
   'https://example.com/recordings/booking-3.mp4',
   'https://example.com/transcripts/booking-3.txt',
   '# Session Summary\n\n## Key Topics Discussed\n- Workplace stress management techniques\n- Team communication strategies\n- Work-life balance best practices\n\n## Action Items\n- [ ] Implement daily team check-ins\n- [ ] Introduce mindfulness breaks\n- [ ] Review workload distribution\n\n## Key Insights\nThe expert emphasized the importance of proactive stress management and creating psychological safety within teams.',
   '{"client_consent": true, "expert_consent": true, "recording_enabled": true}',
   'completed'),
  ('booking-4', 
   'https://example.com/recordings/booking-4.mp4',
   'https://example.com/transcripts/booking-4.txt',
   '# Session Summary\n\n## Key Topics Discussed\n- Series A fundraising strategy\n- Investor pitch deck optimization\n- Unit economics and metrics\n- Market sizing and competition analysis\n\n## Action Items\n- [ ] Refine pitch deck based on feedback\n- [ ] Prepare detailed financial projections\n- [ ] Research target investors\n- [ ] Practice pitch presentation\n\n## Key Insights\nFocus on demonstrating clear product-market fit and sustainable unit economics. Investors prioritize scalable business models and strong founding teams.',
   '{"client_consent": true, "expert_consent": true, "recording_enabled": true}',
   'completed');

-- Add some future bookings for testing
INSERT INTO bookings (id, client_id, expert_id, category_id, mode, scheduled_start, scheduled_end, status, price_cents_total, commission_pct, expert_net_cents, stripe_payment_intent_id) VALUES
  ('booking-future-1', 'client-1', 'exp-5', 'cat-business', 'fixed', 
   NOW() + INTERVAL '3 hours', NOW() + INTERVAL '3 hours' + INTERVAL '30 minutes', 
   'confirmed', 3600, 20, 2880, 'pi_test_future_1'),
  ('booking-future-2', 'client-3', 'exp-2', 'cat-tech', 'per_minute', 
   NOW() + INTERVAL '1 day' + INTERVAL '2 hours', NOW() + INTERVAL '1 day' + INTERVAL '2 hours' + INTERVAL '60 minutes', 
   'confirmed', 3600, 20, 2880, 'pi_test_future_2');

-- Insert mentorship subscriptions
INSERT INTO mentorship_subscriptions (id, client_id, expert_id, plan_id, status, current_period_start, current_period_end, stripe_subscription_id) VALUES
  ('sub-1', 'client-1', 'exp-1', 'plan-1', 'active', 
   DATE_TRUNC('month', NOW()), DATE_TRUNC('month', NOW()) + INTERVAL '1 month', 'sub_test_1'),
  ('sub-2', 'client-2', 'exp-2', 'plan-2', 'active', 
   DATE_TRUNC('month', NOW()), DATE_TRUNC('month', NOW()) + INTERVAL '1 month', 'sub_test_2');

-- Insert mentorship messages
INSERT INTO messages (mentorship_id, sender_id, text, sent_at) VALUES
  ('sub-1', 'client-1', 'Hi James, I wanted to follow up on our discussion about delegation strategies.', NOW() - INTERVAL '2 days'),
  ('sub-1', 'expert-1', 'Great question! Here are some frameworks I recommend for effective delegation...', NOW() - INTERVAL '1 day'),
  ('sub-2', 'client-2', 'I am working on a new ML project and would love your feedback on the approach.', NOW() - INTERVAL '4 hours'),
  ('sub-2', 'expert-2', 'I would be happy to review it. Can you share the technical specifications?', NOW() - INTERVAL '2 hours');

-- Add some test data for different timezones and languages
INSERT INTO profiles (id, role, first_name, last_name, avatar_url, bio, timezone, languages, verified) VALUES
  ('expert-intl-1', 'expert', 'Yuki', 'Tanaka', 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150', 
   'International business consultant specializing in Japan market entry', 'Asia/Tokyo', '{"en", "ja"}', true),
  ('expert-intl-2', 'expert', 'Sophie', 'Mueller', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150', 
   'Sustainable business strategist based in Berlin', 'Europe/Berlin', '{"en", "de", "fr"}', true);

INSERT INTO expert_profiles (id, profile_id, headline, expertise_tags, years_experience, rate_cents_per_minute, fixed_15m_cents, fixed_30m_cents, fixed_60m_cents, availability_json, rating_avg, rating_count) VALUES
  ('exp-intl-1', 'expert-intl-1', 'Japan Market Entry Specialist', 
   '{"international business", "japan market", "cross-cultural", "business development", "market research"}',
   14, 550, 1200, 2200, 4000,
   '{"1": [{"start": 1, "end": 5}], "2": [{"start": 1, "end": 5}], "3": [{"start": 1, "end": 5}], "4": [{"start": 1, "end": 5}], "5": [{"start": 1, "end": 5}]}',
   4.7, 38),
  ('exp-intl-2', 'expert-intl-2', 'Sustainable Business Strategy Expert', 
   '{"sustainability", "ESG", "green business", "circular economy", "climate strategy"}',
   11, 650, 1400, 2500, 4500,
   '{"1": [{"start": 8, "end": 16}], "2": [{"start": 8, "end": 16}], "3": [{"start": 8, "end": 16}], "4": [{"start": 8, "end": 16}], "5": [{"start": 8, "end": 16}]}',
   4.8, 52);

-- Insert badges for international experts
INSERT INTO expert_badges (expert_id, badge, awarded_by, awarded_at) VALUES
  ('exp-intl-1', 'verified_credentials', 'admin-1', NOW() - INTERVAL '10 days'),
  ('exp-intl-2', 'verified_credentials', 'admin-1', NOW() - INTERVAL '8 days'),
  ('exp-intl-2', 'background_checked', 'admin-1', NOW() - INTERVAL '5 days');

-- Final update to ensure data consistency
UPDATE expert_profiles SET updated_at = NOW() WHERE id LIKE 'exp-%';
UPDATE profiles SET updated_at = NOW() WHERE id LIKE 'expert-%' OR id LIKE 'client-%';