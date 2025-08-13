#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seedDatabase() {
  try {
    console.log('🌱 Seeding database with sample data...');
    
    // Insert sample profiles
    console.log('👥 Creating sample profiles...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .upsert([
        {
          id: '11111111-1111-1111-1111-111111111111',
          role: 'expert',
          first_name: 'Dr. Sarah',
          last_name: 'Wilson',
          avatar_url: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?w=150&h=150&fit=crop&crop=face',
          bio: 'Former McKinsey partner with 20+ years in strategy consulting. Specialized in digital transformation and leadership development.',
          timezone: 'America/New_York',
          languages: ['en'],
          verified: true
        },
        {
          id: '22222222-2222-2222-2222-222222222222',
          role: 'expert',
          first_name: 'Marcus',
          last_name: 'Chen',
          avatar_url: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?w=150&h=150&fit=crop&crop=face',
          bio: 'Senior AI Engineer at Google with expertise in machine learning, data science, and Python development.',
          timezone: 'America/Los_Angeles',
          languages: ['en', 'zh'],
          verified: true
        },
        {
          id: '33333333-3333-3333-3333-333333333333',
          role: 'client',
          first_name: 'Emily',
          last_name: 'Rodriguez',
          avatar_url: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?w=150&h=150&fit=crop&crop=face',
          bio: 'Marketing professional looking to advance my career and learn new skills.',
          timezone: 'America/Chicago',
          languages: ['en', 'es'],
          verified: true
        }
      ], { onConflict: 'id' });
    
    if (profilesError) {
      console.error('❌ Error creating profiles:', profilesError);
      throw profilesError;
    }
    
    // Insert expert profiles
    console.log('🎯 Creating expert profiles...');
    const { data: expertProfiles, error: expertError } = await supabase
      .from('expert_profiles')
      .upsert([
        {
          id: 'exp-1',
          profile_id: '11111111-1111-1111-1111-111111111111',
          headline: 'Strategic Business Consultant & Former McKinsey Partner',
          expertise_tags: ['business strategy', 'management consulting', 'leadership', 'digital transformation'],
          years_experience: 20,
          rate_cents_per_minute: 850,
          fixed_15m_cents: 1800,
          fixed_30m_cents: 3200,
          fixed_60m_cents: 5800,
          availability_json: {
            "1": [{"start": 9, "end": 17}],
            "2": [{"start": 9, "end": 17}],
            "3": [{"start": 9, "end": 17}],
            "4": [{"start": 9, "end": 17}],
            "5": [{"start": 9, "end": 17}]
          },
          rating_avg: 4.9,
          rating_count: 127,
          inquiries_count: 156,
          inquiries_30d: 23,
          charity_enabled: true,
          charity_pct: 5.0,
          charity_org: 'Doctors Without Borders',
          is_active: true
        },
        {
          id: 'exp-2',
          profile_id: '22222222-2222-2222-2222-222222222222',
          headline: 'Senior AI Engineer at Google',
          expertise_tags: ['artificial intelligence', 'machine learning', 'python', 'data science'],
          years_experience: 12,
          rate_cents_per_minute: 600,
          fixed_15m_cents: 1200,
          fixed_30m_cents: 2200,
          fixed_60m_cents: 4000,
          availability_json: {
            "1": [{"start": 18, "end": 22}],
            "2": [{"start": 18, "end": 22}],
            "3": [{"start": 18, "end": 22}],
            "4": [{"start": 18, "end": 22}],
            "5": [{"start": 18, "end": 22}]
          },
          rating_avg: 4.8,
          rating_count: 89,
          inquiries_count: 89,
          inquiries_30d: 12,
          charity_enabled: false,
          is_active: true
        }
      ], { onConflict: 'id' });
    
    if (expertError) {
      console.error('❌ Error creating expert profiles:', expertError);
      throw expertError;
    }
    
    // Insert expert badges
    console.log('🏆 Adding expert badges...');
    const { error: badgesError } = await supabase
      .from('expert_badges')
      .upsert([
        {
          expert_id: 'exp-1',
          badge: 'verified_credentials',
          awarded_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          expert_id: 'exp-1',
          badge: 'background_checked',
          awarded_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          expert_id: 'exp-1',
          badge: 'notable',
          awarded_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          expert_id: 'exp-2',
          badge: 'verified_credentials',
          awarded_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          expert_id: 'exp-2',
          badge: 'background_checked',
          awarded_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
        }
      ], { onConflict: 'expert_id,badge' });
    
    if (badgesError) {
      console.warn('⚠️  Warning creating badges:', badgesError);
    }
    
    // Update platform metrics
    console.log('📊 Updating platform metrics...');
    const { error: metricsError } = await supabase
      .from('platform_metrics')
      .upsert([
        { metric_name: 'total_sessions_booked', metric_value: 1248 },
        { metric_name: 'average_rating', metric_value: 49 }, // 4.9 * 10
        { metric_name: 'expert_earnings_range_min', metric_value: 100 },
        { metric_name: 'expert_earnings_range_max', metric_value: 800 },
        { metric_name: 'total_experts', metric_value: 156 }
      ], { onConflict: 'metric_name' });
    
    if (metricsError) {
      console.warn('⚠️  Warning updating metrics:', metricsError);
    }
    
    console.log('✅ Database seeded successfully!');
    
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    console.error('Full error:', err);
    process.exit(1);
  }
}

async function main() {
  console.log('🚀 Starting EncoreTalks database seeding...');
  console.log('🔗 Supabase URL:', supabaseUrl);
  
  await seedDatabase();
  
  console.log('🎉 Seeding completed successfully!');
}

main().catch(console.error);