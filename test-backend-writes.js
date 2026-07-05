// Complete backend write test - tests all write operations
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://ezyjcnnhrlchdhsuzepj.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6eWpjbm5ocmxjaGRoc3V6ZXBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2NjIxMzQsImV4cCI6MjA3NzIzODEzNH0.2B9HFFVUn2g56fndh8Uw3IBZyAKjPRfM3FL1KpSzZ10'
);

async function testBackendWrites() {
  console.log('\n=== BACKEND WRITE TEST ===\n');

  // 1. Auth
  console.log('1. Authenticating...');
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'admin@cank.local',
    password: 'Admin123456'
  });

  if (authError) {
    console.log('❌ Auth failed:', authError.message);
    return;
  }

  const userId = authData.user?.id;
  console.log('✅ Authenticated as:', userId, '\n');

  // 2. Test READ
  console.log('2. Testing READ...');
  const { data: offers, error: readError } = await supabase
    .from('offers')
    .select('*')
    .eq('user_id', userId);

  if (readError) {
    console.log('❌ Read failed:', readError.message);
  } else {
    console.log('✅ Read successful:', offers?.length, 'offers found\n');
  }

  // 3. Test UPDATE (accept offer)
  if (offers && offers.length > 0) {
    console.log('3. Testing UPDATE (accept offer)...');
    const testOfferId = offers[0].id;
    
    const { error: updateError } = await supabase
      .from('offers')
      .update({
        status: 'accepted',
        accepted_at: new Date().toISOString()
      })
      .eq('id', testOfferId);

    if (updateError) {
      console.log('❌ Update failed:', updateError.message);
      console.log('   Error details:', JSON.stringify(updateError, null, 2));
    } else {
      console.log('✅ Update successful (offer', testOfferId, 'accepted)\n');
      
      // Revert the change
      await supabase
        .from('offers')
        .update({ status: 'available', accepted_at: null })
        .eq('id', testOfferId);
    }
  }

  // 4. Test INSERT
  console.log('4. Testing INSERT...');
  const { data: insertData, error: insertError } = await supabase
    .from('offers')
    .insert({
      user_id: userId,
      type: 'receivables',
      amount: 999,
      status: 'available',
      config: { test: true }
    })
    .select();

  if (insertError) {
    console.log('❌ Insert failed:', insertError.message);
    console.log('   Error details:', JSON.stringify(insertError, null, 2));
  } else {
    console.log('✅ Insert successful, ID:', insertData?.[0]?.id);
    
    // Clean up test insert
    if (insertData?.[0]?.id) {
      await supabase.from('offers').delete().eq('id', insertData[0].id);
      console.log('   (Test offer deleted)\n');
    }
  }

  // 5. Test balance UPDATE
  console.log('5. Testing BALANCE update...');
  const { error: balanceError } = await supabase
    .from('balances')
    .update({
      cards_balance: 12345,
      collect_balance: 6789
    })
    .eq('user_id', userId);

  if (balanceError) {
    console.log('❌ Balance update failed:', balanceError.message);
    console.log('   Error details:', JSON.stringify(balanceError, null, 2));
  } else {
    console.log('✅ Balance update successful');
    
    // Revert
    await supabase
      .from('balances')
      .update({ cards_balance: 10000, collect_balance: 5000 })
      .eq('user_id', userId);
    console.log('   (Balance reverted)\n');
  }

  // 6. Check RLS policies are allowing writes
  console.log('6. Checking RLS policy configuration...');
  const { data: policiesData } = await supabase
    .from('pg_policies')
    .select('*')
    .in('tablename', ['offers', 'balances']);

  if (policiesData) {
    console.log('   Policies found:', policiesData.length);
  }

  console.log('\n=== TEST COMPLETE ===\n');
}

testBackendWrites().catch(console.error);
