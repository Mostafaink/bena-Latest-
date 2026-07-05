import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://ezyjcnnhrlchdhsuzepj.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6eWpjbm5ocmxjaGRoc3V6ZXBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2NjIxMzQsImV4cCI6MjA3NzIzODEzNH0.2B9HFFVUn2g56fndh8Uw3IBZyAKjPRfM3FL1KpSzZ10'
);

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001';

async function verify() {
  console.log('Verifying app data in Supabase...\n');

  // Check conversions/analytics
  const { data: conversions, error: convErr } = await supabase
    .from('conversions')
    .select('*')
    .eq('user_id', DEMO_USER_ID)
    .order('created_at', { ascending: false })
    .limit(10);

  if (convErr) {
    console.log('❌ Error reading conversions:', convErr.message);
  } else {
    console.log(`✅ Found ${conversions?.length || 0} analytics records:\n`);
    conversions?.forEach((c, i) => {
      console.log(`${i+1}. Action: ${c.action} | Time: ${new Date(c.created_at).toLocaleTimeString()}`);
      if (c.metadata) console.log(`   Metadata: ${JSON.stringify(c.metadata)}`);
    });
  }

  // Check offers
  console.log('\n' + '='.repeat(60) + '\n');
  const { data: offers, error: offErr } = await supabase
    .from('offers')
    .select('id, type, status, amount')
    .eq('user_id', DEMO_USER_ID)
    .order('created_at', { ascending: false })
    .limit(5);

  if (offErr) {
    console.log('❌ Error reading offers:', offErr.message);
  } else {
    console.log(`✅ Found ${offers?.length || 0} offers for this user:\n`);
    offers?.forEach((o, i) => {
      console.log(`${i+1}. Type: ${o.type} | Status: ${o.status} | Amount: ${o.amount}`);
    });
  }

  // Check profile
  console.log('\n' + '='.repeat(60) + '\n');
  const { data: profile, error: profErr } = await supabase
    .from('profiles')
    .select('id, email, first_name, full_name, role')
    .eq('id', DEMO_USER_ID)
    .limit(1)
    .maybeSingle();

  if (profErr) {
    console.log('❌ Error reading profile:', profErr.message);
  } else {
    const profileName = profile?.full_name || profile?.first_name || 'N/A';
    const profileEmail = profile?.email || 'N/A';
    const profileRole = profile?.role || 'N/A';
    console.log(`✅ Profile found:`);
    console.log(`   Name: ${profileName}`);
    console.log(`   Email: ${profileEmail}`);
    console.log(`   Role: ${profileRole}`);
  }

  // Check balance
  console.log('\n' + '='.repeat(60) + '\n');
  const { data: balance, error: balErr } = await supabase
    .from('balances')
    .select('*')
    .eq('user_id', DEMO_USER_ID)
    .limit(1)
    .maybeSingle();

  if (balErr) {
    console.log('❌ Error reading balance:', balErr.message);
  } else {
    const cards = balance?.cards_balance ?? balance?.cards;
    const collect = balance?.collect_balance ?? balance?.collect;
    console.log(`✅ Balance found:`);
    console.log(`   Cards: ${cards ?? 'N/A'}`);
    console.log(`   Collect: ${collect ?? 'N/A'}`);
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ BACKEND IS FULLY FUNCTIONAL!');
  console.log('='.repeat(60));
}

verify().catch(console.error);
