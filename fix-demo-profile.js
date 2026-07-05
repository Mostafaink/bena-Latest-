// Fix script: ensure demo profile exists in Supabase
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ezyjcnnhrlchdhsuzepj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6eWpjbm5ocmxjaGRoc3V6ZXBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2NjIxMzQsImV4cCI6MjA3NzIzODEzNH0.2B9HFFVUn2g56fndh8Uw3IBZyAKjPRfM3FL1KpSzZ10';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function fixDemoProfile() {
  console.log('Checking demo profile...');
  
  const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001';
  
  // Check if profile exists
  const { data: existing } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', DEMO_USER_ID)
    .maybeSingle();
  
  if (existing) {
    console.log('✅ Demo profile exists:', existing);
    
    // Make sure it's admin
    if (existing.role !== 'admin') {
      const { error } = await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', DEMO_USER_ID);
      
      if (error) {
        console.error('❌ Failed to update role:', error);
      } else {
        console.log('✅ Updated role to admin');
      }
    }
  } else {
    console.log('⚠️ Demo profile missing, creating...');
    
    // Create demo profile (without phone columns for now)
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: DEMO_USER_ID,
        email: 'demo@cank.local',
        first_name: 'Demo',
        full_name: 'Demo User',
        role: 'admin'
      })
      .select();
    
    if (error) {
      console.error('❌ Failed to create profile:', error);
    } else {
      console.log('✅ Created demo profile:', data);
    }
  }

  // Check/create demo balance
  const { data: balance } = await supabase
    .from('balances')
    .select('*')
    .eq('user_id', DEMO_USER_ID)
    .maybeSingle();
  
  if (!balance) {
    console.log('⚠️ Demo balance missing, creating...');
    const { data, error } = await supabase
      .from('balances')
      .insert({
        user_id: DEMO_USER_ID,
        cards_balance: 1000,
        collect_balance: 500
      })
      .select();
    
    if (error) {
      console.error('❌ Failed to create balance:', error);
    } else {
      console.log('✅ Created demo balance:', data);
    }
  } else {
    console.log('✅ Demo balance exists:', balance);
  }

  // Final verification
  console.log('\n=== Final State ===');
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', DEMO_USER_ID).single();
  const { data: bal } = await supabase.from('balances').select('*').eq('user_id', DEMO_USER_ID).single();
  const { data: offers } = await supabase.from('offers').select('id, type, status, amount').eq('user_id', DEMO_USER_ID);
  
  console.log('Profile:', profile);
  console.log('Balance:', bal);
  console.log('Offers:', offers?.length, 'total');
  console.log('\n✅ Demo setup complete!');
}

fixDemoProfile().catch(console.error);
