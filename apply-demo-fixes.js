// AUTOMATED FIX: Applies all demo setup via Supabase JS client
// This will fix profiles, balances, and verify everything is working

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ezyjcnnhrlchdhsuzepj.supabase.co';
// Use service role key if available, otherwise anon key
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6eWpjbm5ocmxjaGRoc3V6ZXBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2NjIxMzQsImV4cCI6MjA3NzIzODEzNH0.2B9HFFVUn2g56fndh8Uw3IBZyAKjPRfM3FL1KpSzZ10';

const supabase = createClient(supabaseUrl, supabaseKey);
const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001';

async function executeSQL(sql) {
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    // RPC might not exist, return error info
    return { success: false, error: err };
  }
}

async function applyFixes() {
  console.log('🔧 Starting automated demo fixes...\n');

  // Step 1: Try to add profiles RLS policies via SQL
  console.log('Step 1: Setting up profiles RLS policies...');
  const profilesRLS = await executeSQL(`
    ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "demo_profiles_read" ON profiles;
    DROP POLICY IF EXISTS "demo_profiles_manage" ON profiles;
    CREATE POLICY "demo_profiles_read" ON profiles FOR SELECT TO anon, authenticated USING (true);
    CREATE POLICY "demo_profiles_manage" ON profiles FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
  `);
  
  if (profilesRLS.success) {
    console.log('✅ Profiles RLS configured via SQL');
  } else {
    console.log('⚠️ Could not configure via RPC (expected if exec_sql not available)');
  }

  // Step 2: Try to add balances RLS policies via SQL
  console.log('\nStep 2: Setting up balances RLS policies...');
  const balancesRLS = await executeSQL(`
    ALTER TABLE balances ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "demo_balances_read" ON balances;
    DROP POLICY IF EXISTS "demo_balances_manage" ON balances;
    CREATE POLICY "demo_balances_read" ON balances FOR SELECT TO anon, authenticated USING (true);
    CREATE POLICY "demo_balances_manage" ON balances FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
  `);
  
  if (balancesRLS.success) {
    console.log('✅ Balances RLS configured via SQL');
  } else {
    console.log('⚠️ Could not configure via RPC (expected if exec_sql not available)');
  }

  // Step 3: Create demo profile via JS client
  console.log('\nStep 3: Creating/updating demo profile...');
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .upsert({
      id: DEMO_USER_ID,
      email: 'demo@cank.local',
      first_name: 'Demo',
      full_name: 'Demo User',
      role: 'admin',
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'id'
    })
    .select();
  
  if (profileError) {
    console.log('❌ Profile creation failed:', profileError.message);
    console.log('   This likely means RLS policies need to be fixed in Supabase SQL Editor');
  } else {
    console.log('✅ Demo profile created/updated:', profileData);
  }

  // Step 4: Create demo balance via JS client
  console.log('\nStep 4: Creating/updating demo balance...');
  const { data: balanceData, error: balanceError } = await supabase
    .from('balances')
    .upsert({
      user_id: DEMO_USER_ID,
      cards_balance: 1000.00,
      collect_balance: 500.00,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id'
    })
    .select();
  
  if (balanceError) {
    console.log('❌ Balance creation failed:', balanceError.message);
    console.log('   This likely means RLS policies need to be fixed in Supabase SQL Editor');
  } else {
    console.log('✅ Demo balance created/updated:', balanceData);
  }

  // Step 5: Verify everything
  console.log('\n📊 Verification Report:');
  console.log('========================');
  
  const { data: profile, error: profileCheckError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', DEMO_USER_ID)
    .maybeSingle();
  
  const { data: balance, error: balanceCheckError } = await supabase
    .from('balances')
    .select('*')
    .eq('user_id', DEMO_USER_ID)
    .maybeSingle();
  
  const { data: offers, error: offersError } = await supabase
    .from('offers')
    .select('id, type, status, amount')
    .eq('user_id', DEMO_USER_ID);

  console.log('\nProfile:', profile || 'MISSING ❌');
  console.log('Balance:', balance || 'MISSING ❌');
  console.log('Offers:', offers?.length || 0, 'total');

  if (profile && balance && offers) {
    console.log('\n✅ ✅ ✅ ALL SYSTEMS READY! ✅ ✅ ✅');
    console.log('\nYour demo user is fully configured:');
    console.log('  - ID:', DEMO_USER_ID);
    console.log('  - Role:', profile.role);
    console.log('  - Cards Balance:', balance.cards_balance);
    console.log('  - Collect Balance:', balance.collect_balance);
    console.log('  - Active Offers:', offers.length);
    console.log('\n🌐 Open http://localhost:5174 to see your app!');
  } else {
    console.log('\n⚠️ MANUAL FIX REQUIRED:');
    console.log('Please run /workspaces/bena/project 2/supabase/COMPLETE_DEMO_FIX.sql in Supabase SQL Editor');
  }
}

applyFixes().catch(err => {
  console.error('\n❌ Fatal error:', err);
  console.log('\n📝 Manual fix required: Run COMPLETE_DEMO_FIX.sql in Supabase SQL Editor');
  process.exit(1);
});
