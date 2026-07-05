# Fix: Create Test User via SQL (NOT UI)

Since the Supabase UI auth is having database issues, we'll create everything via SQL directly.

## Step 1: Verify tables exist
Go to: https://app.supabase.com/project/ezyjcnnhrlchdhsuzepj/sql

Click **New Query** and paste:

```sql
-- Check what tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

Click **Run** - you should see:
- balances
- conversions  
- offers
- profiles
- user_flows

If you don't see all of them, that's the problem.

---

## Step 2: Check if offers table has data
Click **New Query** and paste:

```sql
SELECT COUNT(*) as total_offers FROM offers;
```

This should show **24** (we know from backend-health.js they exist).

---

## Step 3: Create the demo user profile (MANUAL)
Click **New Query** and paste:

```sql
-- Create a demo profile
INSERT INTO profiles (
  id,
  email, 
  first_name,
  full_name,
  role,
  created_at,
  updated_at
) VALUES (
  'demo-user-001',  -- You can use any string ID for testing
  'demo@cank.com',
  'Demo',
  'Demo User',
  'admin',
  NOW(),
  NOW()
);

-- Create balance for demo user
INSERT INTO balances (
  user_id,
  cards_balance,
  collect_balance,
  created_at,
  updated_at
) VALUES (
  'demo-user-001',
  1000.00,
  500.00,
  NOW(),
  NOW()
);

-- Verify it worked
SELECT * FROM profiles WHERE id = 'demo-user-001';
SELECT * FROM balances WHERE user_id = 'demo-user-001';
```

Click **Run** - you should see the records appear.

---

## Step 4: Now check Table Editor
Click **Table Editor** (left sidebar)
- Click **profiles** - you should now see 1 row
- Click **balances** - you should now see 1 row  
- Click **offers** - you should see 24 rows

Tell me:
1. Do you see data in these tables now?
2. How many rows in offers?
3. How many rows in profiles?

---

## Step 5: If data appears, then we fix auth

If you see the data, the problem is the Supabase auth creation. 

The issue is: You're trying to create an auth user in Supabase UI, but something in the database schema is blocking it.

**For testing purposes**: We'll use a "mock" authentication approach until we fix the auth system.

Let me know what you see in Step 4 first.
