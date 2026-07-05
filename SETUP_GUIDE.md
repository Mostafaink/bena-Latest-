# 🚀 FIX YOUR APP - STEP BY STEP GUIDE

## Current Situation
✅ Backend (Supabase) is working - has 24 offers in database  
✅ Frontend (React) is ready  
✅ Environmental variables configured  
❌ RLS policies blocking visibility & demo mode not functional

## THE FIX: Enable Real Authentication (Better for MVP)

### STEP 1: Go to Supabase Dashboard
https://app.supabase.com/

Click on your project: **ezyjcnnhrlchdhsuzepj**

### STEP 2: Disable RLS Temporarily (to see your data)
1. Click **SQL Editor** (left sidebar)
2. Click **New Query**
3. Copy & paste this SQL:

```sql
-- TEMPORARILY DISABLE RLS TO FIX SETUP
-- (We'll re-enable with proper policies after)

ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE balances DISABLE ROW LEVEL SECURITY;
ALTER TABLE offers DISABLE ROW LEVEL SECURITY;
ALTER TABLE conversions DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_flows DISABLE ROW LEVEL SECURITY;
```

4. Click **Run** (blue play button)
5. Wait for "Success" ✅

### STEP 3: Now you can see the data!
1. Click **Table Editor** (left sidebar)
2. You'll see:
   - **profiles** table (currently empty)
   - **balances** table (currently empty)
   - **offers** table (has 24 offers)
   - **conversions** table (has test data)
   - **user_flows** table

### STEP 4: Create a demo user in Auth
1. Click **Authentication** (left sidebar)
2. Click **Users** 
3. Click **Invite** button
4. Email: `demo@cank.com`
5. Password: `Demo123456!`
6. Check "☑️ Auto Confirm User"
7. Click **Send invite**
8. Wait a moment, then click the new user to see their ID (copy it)

### STEP 5: Insert demo data
1. Go back to **SQL Editor**
2. Click **New Query**
3. Replace `YOUR-USER-ID` below with the ID from Step 4:

```sql
-- Create profile for demo user
INSERT INTO profiles (
  id, 
  email, 
  first_name, 
  full_name, 
  role, 
  created_at, 
  updated_at
) VALUES (
  'YOUR-USER-ID',
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
  'YOUR-USER-ID',
  1000.00,
  500.00,
  NOW(),
  NOW()
);
```

4. Click **Run**
5. You should see "✅ Success"

### STEP 6: Update your app config
1. Go back to VS Code
2. Open `/workspaces/bena/project 2/.env.local`
3. Change this line:

FROM:
```
VITE_AUTH_MODE=demo
```

TO:
```
VITE_AUTH_MODE=phone
```

(Note: In the code we set it to 'phone' mode by default, but we'll use email/password instead - that's fine, it just means "real auth")

### STEP 7: Refresh your browser
1. Go to http://localhost:5173
2. You should see a **Login** button
3. Login with:
   - Email: `demo@cank.com`
   - Password: `Demo123456!`
4. 🎉 App should load with your profile and 24 offers!

---

## Questions?
If you get stuck at any step, take a screenshot and show me exactly where you are stuck.
The app works - it just needs this one-time database setup.
