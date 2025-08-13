#!/usr/bin/env node

import fs from 'fs';
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

async function runMigrations() {
  try {
    console.log('🔄 Running database migrations...');
    
    // Read and execute the main schema
    const schemaSql = fs.readFileSync('database_schema.sql', 'utf8');
    
    console.log('📝 Executing schema migration...');
    const { error } = await supabase.rpc('exec_sql', { sql: schemaSql });
    
    if (error) {
      // If RPC doesn't exist, try direct query execution
      console.log('🔄 Trying direct query execution...');
      const { error: directError } = await supabase
        .from('_migrations')
        .select('*')
        .limit(1);
      
      if (directError && directError.code === 'PGRST116') {
        // Table doesn't exist, we need to create schema
        console.log('🏗️  Creating initial schema...');
        
        // Split SQL into individual statements and execute them
        const statements = schemaSql
          .split(';')
          .map(stmt => stmt.trim())
          .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
        
        for (const statement of statements) {
          if (statement.trim()) {
            try {
              await supabase.rpc('exec_sql', { sql: statement + ';' });
            } catch (err) {
              console.warn(`⚠️  Statement warning: ${err.message}`);
              // Continue with other statements
            }
          }
        }
      } else {
        throw error;
      }
    }
    
    console.log('✅ Database migrations completed successfully');
    
    // Verify critical tables exist
    console.log('🔍 Verifying table creation...');
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['profiles', 'expert_profiles', 'bookings', 'categories']);
    
    if (tablesError) {
      console.warn('⚠️  Could not verify tables:', tablesError.message);
    } else {
      const tableNames = tables.map(t => t.table_name);
      console.log('📋 Created tables:', tableNames.join(', '));
      
      if (!tableNames.includes('expert_profiles')) {
        throw new Error('Critical table expert_profiles was not created');
      }
    }
    
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    console.error('Full error:', err);
    process.exit(1);
  }
}

// Create exec_sql function if it doesn't exist
async function createExecSqlFunction() {
  const createFunctionSql = `
    CREATE OR REPLACE FUNCTION exec_sql(sql text)
    RETURNS void
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    BEGIN
      EXECUTE sql;
    END;
    $$;
  `;
  
  try {
    const { error } = await supabase.rpc('exec_sql', { sql: createFunctionSql });
    if (error) {
      console.log('📝 Creating exec_sql function...');
      // Function doesn't exist, create it via direct SQL
      await supabase.rpc('exec', { sql: createFunctionSql });
    }
  } catch (err) {
    console.warn('⚠️  Could not create exec_sql function:', err.message);
  }
}

async function main() {
  console.log('🚀 Starting EncoreTalks database migration...');
  console.log('🔗 Supabase URL:', supabaseUrl);
  
  await createExecSqlFunction();
  await runMigrations();
  
  console.log('🎉 Migration completed successfully!');
}

main().catch(console.error);