import { createClient } from '@supabase/supabase-js';

const url = 'https://ezyjcnnhrlchdhsuzepj.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6eWpjbm5ocmxjaGRoc3V6ZXBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2NjIxMzQsImV4cCI6MjA3NzIzODEzNH0.2B9HFFVUn2g56fndh8Uw3IBZyAKjPRfM3FL1KpSzZ10';

const supabase = createClient(url, key);

async function testFrontendConnection() {
  console.log('Testing Supabase connection from Node (frontend simulation)...\n');
  
  try {
    // Test 1: Fetch offers like the app does
    console.log('Test 1: Fetching offers...');
    const { data: offers, error: offersError } = await supabase
      .from('offers')
      .select('*')
      .eq('user_id', '00000000-0000-0000-0000-000000000001')
      .eq('status', 'available')
      .order('created_at', { ascending: true });

    if (offersError) {
      console.error('❌ Error fetching offers:', offersError);
    } else {
      console.log(`✅ Successfully fetched ${offers?.length || 0} offers`);
      if (offers && offers.length > 0) {
        console.log('   First offer:', offers[0]);
      }
    }

    // Test 2: Check conversions table (for tracking)
    console.log('\nTest 2: Checking conversions table...');
    const { data: convData, error: convError } = await supabase
      .from('conversions')
      .select('*', { count: 'exact' })
      .limit(1);

    if (convError) {
      console.error('❌ Error reading conversions:', convError);
    } else {
      console.log('✅ Conversions table accessible');
    }

    // Test 3: Insert a test conversion (write permission)
    console.log('\nTest 3: Testing write permissions...');
    const { data: insertData, error: insertError } = await supabase
      .from('conversions')
      .insert({
        user_id: '00000000-0000-0000-0000-000000000001',
        action: 'test_insert',
        metadata: { test: true, timestamp: new Date().toISOString() }
      })
      .select();

    if (insertError) {
      console.error('❌ Error writing to conversions:', insertError);
    } else {
      console.log('✅ Write permissions working');
      if (insertData && insertData[0]) {
        console.log('   Inserted record ID:', insertData[0].id);
      }
    }

    // Test 4: Check profiles table
    console.log('\nTest 4: Checking profiles table...');
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);

    if (profileError) {
      console.error('❌ Error reading profiles:', profileError);
    } else {
      console.log('✅ Profiles table accessible');
    }

  } catch (err) {
    console.error('❌ Unexpected error:', err?.message || err);
  }
}

testFrontendConnection();
