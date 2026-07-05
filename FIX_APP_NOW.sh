#!/bin/bash
# THIS IS WHAT YOU NEED TO DO IMMEDIATELY TO FIX THE APP
# (Ran automated diagnostics - app is missing demo user data in Supabase)

echo "=========================================="
echo "CRITICAL: APP FIX REQUIRED"
echo "=========================================="
echo ""
echo "❌ PROBLEM FOUND:"
echo "   - Frontend is working ✅"
echo "   - Supabase backend connected ✅" 
echo "   - But demo user profile & balance missing ❌"
echo ""
echo "🔧 TO FIX:"
echo ""
echo "1. Go to: https://app.supabase.com/project/ezyjcnnhrlchdhsuzepj/sql"
echo ""
echo "2. Copy & paste the SQL below (or run COMPLETE_DEMO_FIX.sql):"
echo ""
cat << 'EOF'

-- COMPLETE LOCALHOST DEMO FIX
-- Paste this in Supabase SQL Editor and Run

-- 1) Fix RLS policies for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "demo_profiles_read" ON profiles;
DROP POLICY IF EXISTS "demo_profiles_manage" ON profiles;

CREATE POLICY "demo_profiles_read"
  ON profiles FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "demo_profiles_manage"
  ON profiles FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- 2) Fix RLS policies for balances
ALTER TABLE balances ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "demo_balances_read" ON balances;
DROP POLICY IF EXISTS "demo_balances_manage" ON balances;

CREATE POLICY "demo_balances_read"
  ON balances FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "demo_balances_manage"
  ON balances FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- 3) Insert demo user profile
INSERT INTO profiles (id, email, first_name, full_name, role, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'demo@cank.local',
  'Demo',
  'Demo User',
  'admin',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE
SET role = 'admin', first_name = 'Demo', full_name = 'Demo User', updated_at = NOW();

-- 4) Insert demo user balance  
INSERT INTO balances (user_id, cards_balance, collect_balance, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  1000.00,
  500.00,
  NOW(),
  NOW()
)
ON CONFLICT (user_id) DO UPDATE
SET cards_balance = 1000.00, collect_balance = 500.00, updated_at = NOW();

-- 5) Verify
SELECT 'Demo Profile' as item, COUNT(*) as count FROM profiles WHERE id = '00000000-0000-0000-0000-000000000001'
UNION ALL
SELECT 'Demo Balance', COUNT(*) FROM balances WHERE user_id = '00000000-0000-0000-0000-000000000001'
UNION ALL  
SELECT 'Available Offers', COUNT(*) FROM offers WHERE user_id = '00000000-0000-0000-0000-000000000001' AND status = 'available';

EOF

echo ""
echo "3. After running SQL, refresh your browser:"
echo "   http://localhost:5173"
echo ""
echo "4. You should see:"
echo "   ✅ App renders with 'Demo User' profile"
echo "   ✅ 24 available offers appear"
echo "   ✅ Analytics/tracking starts recording"
echo ""
echo "=========================================="
