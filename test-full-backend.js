// Complete backend connectivity test
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ezyjcnnhrlchdhsuzepj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6eWpjbm5ocmxjaGRoc3V6ZXBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2NjIxMzQsImV4cCI6MjA3NzIzODEzNH0.2B9HFFVUn2g56fndh8Uw3IBZyAKjPRfM3FL1KpSzZ10';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function fullTest() {
  console.log('\n=== COMPLETE BACKEND TEST ===\n');

  // 1. Connection test
  console.log('1. Testing Supabase connection...');
  try {
    const { data, error } = await supabase.from('offers').select('count');
    if (error) {
      console.log('❌ Connection FAILED:', error.message);
      return;
    }
    console.log('✅ Connection OK\n');
  } catch (e) {
    console.log('❌ Connection ERROR:', e.message);
    return;
  }

  // 2. Auth test
  console.log('2. Testing authentication...');
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'admin@cank.local',
      password: 'Admin123456'
  });

  if (authError) {
    console.log('❌ Auth FAILED:', authError.message);
      console.log('   Error details:', JSON.stringify(authError, null, 2), '\n');
    return;
  }
  
  const userId = authData.user?.id;
  console.log('✅ Auth SUCCESS');
  console.log('   User ID:', userId);
  console.log('   Email:', authData.user?.email);
  console.log('   Expected ID: 86baee96-139c-4399-896f-04c0e134fe7d');
  console.log('   IDs match:', userId === '86baee96-139c-4399-896f-04c0e134fe7d', '\n');

  // 3. Profiles test
  console.log('3. Testing profiles query...');
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (profileError) {
    console.log('❌ Profiles FAILED:', profileError.message);
    console.log('   Error details:', JSON.stringify(profileError, null, 2));
  } else {
    console.log('✅ Profiles SUCCESS');
    console.log('   Data:', JSON.stringify(profileData, null, 2), '\n');
  }

  // 4. Balances test
  console.log('4. Testing balances query...');
  const { data: balanceData, error: balanceError } = await supabase
    .from('balances')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (balanceError) {
    console.log('❌ Balances FAILED:', balanceError.message);
    console.log('   Error details:', JSON.stringify(balanceError, null, 2));
  } else {
    console.log('✅ Balances SUCCESS');
    console.log('   Data:', JSON.stringify(balanceData, null, 2), '\n');
  }

  // 5. Offers test
  console.log('5. Testing offers query...');
  const { data: offersData, error: offersError } = await supabase
    .from('offers')
    .select('*')
    .eq('user_id', userId);

  if (offersError) {
    console.log('❌ Offers FAILED:', offersError.message);
  } else {
    console.log('✅ Offers SUCCESS');
    console.log('   Count:', offersData?.length || 0, '\n');
  }

  // 6. Check RLS policies
  console.log('6. Checking RLS policies...');
  const { data: policiesData, error: policiesError } = await supabase
    .rpc('exec_sql', { 
      sql: `
        select tablename, policyname, cmd, qual, with_check
        from pg_policies
        where schemaname = 'public'
        and tablename in ('profiles', 'balances')
        order by tablename, policyname;
      `
    });

  if (policiesError) {
    console.log('⚠️  Cannot check policies (RPC might not exist)');
    console.log('   This is OK - policies should still work\n');
  } else {
    console.log('✅ Policies found:', policiesData?.length || 0, '\n');
  }

  console.log('=== TEST COMPLETE ===\n');
}

fullTest().catch(console.error);
