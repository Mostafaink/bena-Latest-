#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL || 'https://ezyjcnnhrlchdhsuzepj.supabase.co';
const key = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6eWpjbm5ocmxjaGRoc3V6ZXBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2NjIxMzQsImV4cCI6MjA3NzIzODEzNH0.2B9HFFVUn2g56fndh8Uw3IBZyAKjPRfM3FL1KpSzZ10';
const demoUser = '00000000-0000-0000-0000-000000000001';

const sb = createClient(url, key);

async function main() {
  console.log('Supabase URL:', url);
  console.log('Demo user:', demoUser);

  const total = await sb.from('offers').select('id', { count: 'exact', head: true });
  const mine = await sb.from('offers').select('id', { count: 'exact', head: true }).eq('user_id', demoUser);
  const latest = await sb
    .from('offers')
    .select('id,user_id,type,status,amount,created_at')
    .eq('user_id', demoUser)
    .order('created_at', { ascending: false })
    .limit(5);

  if (total.error || mine.error || latest.error) {
    console.log('Error total:', total.error);
    console.log('Error mine:', mine.error);
    console.log('Error latest:', latest.error);
    process.exit(1);
  }

  console.log('Total offers:', total.count);
  console.log('Demo offers:', mine.count);
  console.log('Latest 5 offers:');
  for (const row of latest.data || []) {
    console.log(`- ${row.id} | ${row.type} | ${row.status} | ${row.amount} | ${row.created_at}`);
  }

  const probe = await sb
    .from('offers')
    .insert({ user_id: demoUser, type: 'cash', status: 'available', amount: 777001, config: { source: 'backend-health' } })
    .select('id,created_at')
    .single();

  if (probe.error) {
    console.log('Write probe failed:', probe.error);
    process.exit(1);
  }

  console.log('Write probe inserted:', probe.data.id, probe.data.created_at);

  const cleanup = await sb.from('offers').delete().eq('id', probe.data.id);
  if (cleanup.error) {
    console.log('Cleanup failed for probe row:', cleanup.error);
    process.exit(1);
  }

  console.log('Write probe cleaned up successfully. Backend is writable.');
}

main().catch((e) => {
  console.error('Unexpected error:', e);
  process.exit(1);
});
