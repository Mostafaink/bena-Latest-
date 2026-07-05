import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || 'https://ezyjcnnhrlchdhsuzepj.supabase.co',
  process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6eWpjbm5ocmxjaGRoc3V6ZXBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2NjIxMzQsImV4cCI6MjA3NzIzODEzNH0.2B9HFFVUn2g56fndh8Uw3IBZyAKjPRfM3FL1KpSzZ10'
);

const userId = '00000000-0000-0000-0000-000000000001';

async function main() {
  const cashOffer = {
    user_id: userId,
    type: 'cash',
    status: 'available',
    amount: 100,
    config: { source: 'seed-demo-data' },
  };

  const receivablesOffer = {
    user_id: userId,
    type: 'receivables',
    status: 'available',
    amount: 120,
    config: {
      source: 'seed-demo-data',
      enabled_count: 1,
      schedule_enabled_count: 1,
      schedules: ['daily', 'weekly', 'monthly'],
      combinations: [{ label: '1S+1R', counts: { silver: 1, red: 1 } }],
    },
  };

  const { error: offerErr } = await supabase.from('offers').insert([cashOffer, receivablesOffer]);
  if (offerErr) {
    console.error('Failed seeding offers:', offerErr);
    process.exit(1);
  }

  const { error: convErr } = await supabase.from('conversions').insert({
    user_id: userId,
    action: 'seed_demo_data',
    metadata: { source: 'seed-demo-data.js', at: new Date().toISOString() },
  });
  if (convErr) {
    console.error('Failed seeding conversions:', convErr);
    process.exit(1);
  }

  const { count: offerCount } = await supabase
    .from('offers')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId);

  const { count: conversionCount } = await supabase
    .from('conversions')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId);

  console.log('Seed complete.');
  console.log('Offers for demo user:', offerCount ?? 0);
  console.log('Conversions for demo user:', conversionCount ?? 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
