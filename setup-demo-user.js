import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://ezyjcnnhrlchdhsuzepj.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6eWpjbm5ocmxjaGRoc3V6ZXBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2NjIxMzQsImV4cCI6MjA3NzIzODEzNH0.2B9HFFVUn2g56fndh8Uw3IBZyAKjPRfM3FL1KpSzZ10'
);

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001';

async function setupDemoUser() {
  console.log('Setting up DEMO USER...\n');

  // Step 1: Create/Update demo profile
  console.log('1️⃣ Creating demo profile...');
  const { data: profileData, error: profileErr } = await supabase
    .from('profiles')
    .upsert({
      id: DEMO_USER_ID,
      email: 'demo@cank.com',
      first_name: 'Demo',
      full_name: 'Demo Admin User',
      role: 'admin',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }, { onConflict: 'id' })
    .select();

  if (profileErr) {
    console.error('❌ Error creating profile:', profileErr);
  } else {
    console.log('✅ Profile created/updated:', profileData);
  }

  // Step 2: Create/Update demo balance
  console.log('\n2️⃣ Creating demo balance...');
  const { data: balanceData, error: balanceErr } = await supabase
    .from('balances')
    .upsert({
      user_id: DEMO_USER_ID,
      cards_balance: 1000,
      collect_balance: 500,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' })
    .select();

  if (balanceErr) {
    console.error('❌ Error creating balance:', balanceErr);
  } else {
    console.log('✅ Balance created/updated:', balanceData);
  }

  // Step 3: Verify
  console.log('\n3️⃣ Verifying setup...');
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', DEMO_USER_ID)
    .single();

  const { data: balance } = await supabase
    .from('balances')
    .select('*')
    .eq('user_id', DEMO_USER_ID)
    .single();

  if (profile && balance) {
    console.log('✅ DEMO USER READY!');
    console.log('\n Profile:', profile);
    console.log('\n Balance:', balance);
    console.log('\n🚀 App should now work at http://localhost:5173');
  } else {
    console.log('❌ Setup incomplete');
    if (!profile) console.log('   - Profile missing');
    if (!balance) console.log('   - Balance missing');
  }
}

setupDemoUser().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
