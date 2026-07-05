// Quick test script to verify Supabase connection
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ezyjcnnhrlchdhsuzepj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6eWpjbm5ocmxjaGRoc3V6ZXBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2NjIxMzQsImV4cCI6MjA3NzIzODEzNH0.2B9HFFVUn2g56fndh8Uw3IBZyAKjPRfM3FL1KpSzZ10';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  console.log('Testing Supabase connection...');
  console.log('URL:', supabaseUrl);
  
  try {
    // Test 1: Check profiles table
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .limit(5);
    
    if (profileError) {
      console.error('❌ Profiles query error:', profileError);
    } else {
      console.log('✅ Profiles table accessible:', profiles?.length, 'rows');
      console.log('Profiles:', profiles);
    }

    // Test 2: Check offers table
    const { data: offers, error: offersError } = await supabase
      .from('offers')
      .select('*')
      .limit(5);
    
    if (offersError) {
      console.error('❌ Offers query error:', offersError);
    } else {
      console.log('✅ Offers table accessible:', offers?.length, 'rows');
      console.log('Offers:', offers);
    }

    // Test 3: Try to insert a test offer
    const testOffer = {
      user_id: '00000000-0000-0000-0000-000000000001',
      type: 'cash',
      status: 'available',
      amount: 100,
      config: { test: true }
    };

    const { data: insertData, error: insertError } = await supabase
      .from('offers')
      .insert(testOffer)
      .select();
    
    if (insertError) {
      console.error('❌ Insert error:', insertError);
    } else {
      console.log('✅ Insert successful:', insertData);
      
      // Clean up test offer
      if (insertData && insertData[0]) {
        await supabase.from('offers').delete().eq('id', insertData[0].id);
        console.log('✅ Test offer cleaned up');
      }
    }

  } catch (error) {
    console.error('❌ Connection test failed:', error);
  }
}

test();
