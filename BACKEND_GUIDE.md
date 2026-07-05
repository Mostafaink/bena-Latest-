# 🎯 CANK APP - Backend Setup & Understanding Guide

## 📚 What You Have Now

### Frontend (What you built)
- ✅ React UI with pages: Account, Cards, Collect, Credit, Settings
- ✅ Admin Panel (for creating offers and testing flows)
- ✅ Tracking clicks, page views, user actions
- ✅ Demo user hardcoded: `00000000-0000-0000-0000-000000000001`

### Backend (What we're setting up NOW)
- ❌ No database tables yet → We'll create them!
- ❌ No data storage → We'll set it up!
- ❌ No authentication → We'll configure it!

---

## 🧠 Understanding Backend vs Frontend (Simple)

### Think of it like a Restaurant:

**Frontend = The Menu & Waiter**
- What customers see and interact with
- Takes orders (user clicks buttons)
- Shows information (displays data)
- In your case: The Cank app UI

**Backend = The Kitchen & Storage**
- Where data is stored (database)
- Where logic happens (calculations, security)
- Invisible to customers
- In your case: Supabase database

### Example from your app:

**When user accepts an offer:**
1. **Frontend**: User clicks "Accept" button → UI shows loading
2. **Backend**: Saves to database → Updates offer status to "accepted"
3. **Backend**: Records this click in "conversions" table for analytics
4. **Frontend**: Shows success message

---

## 📊 What is Supabase? (SIMPLE Explanation)

**Supabase = Your Database + Backend on the Cloud**

Instead of building your own server, database, authentication system (which takes months), Supabase gives you everything pre-built.

### What Supabase Provides:

1. **Database (PostgreSQL)**
   - Tables to store data (like Excel sheets, but powerful)
   - Your tables: profiles, balances, offers, conversions, analytics

2. **Authentication**
   - User signup/login
   - Password management
   - Session management

3. **Security (RLS = Row Level Security)**
   - Rules that prevent users from seeing each other's data
   - Example: User A cannot see User B's offers

4. **Real-time Updates** (optional)
   - When data changes, frontend updates instantly
   - Like WhatsApp: message appears immediately

5. **APIs** (Automatic)
   - Your frontend can fetch/save data easily
   - Example: `supabase.from('offers').select('*')`

---

## 🗄️ YOUR DATABASE TABLES (What We're Creating)

### 1. **profiles** - User Information
```
| Column      | Type   | Description                    |
|-------------|--------|--------------------------------|
| id          | UUID   | Unique user ID                 |
| email       | Text   | User email                     |
| role        | Text   | 'admin' or 'user'              |
| first_name  | Text   | First name                     |
| full_name   | Text   | Full name                      |
```

**What it's for**: Stores user account info, determines who's admin

---

### 2. **balances** - User Money/Points
```
| Column         | Type    | Description                    |
|----------------|---------|--------------------------------|
| user_id        | UUID    | Which user                     |
| cards_balance  | Number  | Balance from cards             |
| collect_balance| Number  | Balance from receivables       |
```

**What it's for**: Tracks how much money/points each user has

---

### 3. **offers** - Offers Sent to Users
```
| Column      | Type   | Description                       |
|-------------|--------|-----------------------------------|
| id          | UUID   | Unique offer ID                   |
| user_id     | UUID   | Which user received this offer    |
| type        | Text   | 'cash' or 'receivables'           |
| status      | Text   | 'available' or 'accepted'         |
| amount      | Number | Offer amount (e.g., 100 EGP)      |
| config      | JSON   | Details (combinations, schedules) |
```

**What it's for**: Every offer you create in Admin Panel goes here

**Example Row:**
```
id: abc-123
user_id: 00000000-0000-0000-0000-000000000001
type: cash
status: available
amount: 100
```

---

### 4. **offer_templates** - Reusable Offer Templates
```
| Column     | Type   | Description                        |
|------------|--------|------------------------------------|
| id         | UUID   | Template ID                        |
| name       | Text   | Template name                      |
| type       | Text   | 'cash' or 'receivables'            |
| amount     | Number | Default amount                     |
| config     | JSON   | Template configuration             |
| is_active  | Boolean| Can this template be used?         |
```

**What it's for**: Create once, assign to many users. Like a "Master Offer" you can reuse.

**Example**: "100 EGP Cash Offer" template → assign to 1000 users with one click

---

### 5. **conversions** - Tracking Every User Action
```
| Column      | Type      | Description                        |
|-------------|-----------|-------------------------------------|
| id          | UUID      | Unique action ID                    |
| user_id     | Text      | Which user did this action          |
| action      | Text      | What they did (click, view, accept) |
| metadata    | JSON      | Extra details (offer_id, etc.)      |
| created_at  | Timestamp | When it happened                    |
```

**What it's for**: Analytics! Every click, every view, every accept is recorded here.

**Example Rows:**
```
user_id: demo-user-id, action: 'offer_view', metadata: {offer_id: 'abc-123'}, created_at: 2026-03-05 10:30:00
user_id: demo-user-id, action: 'offer_click', metadata: {offer_id: 'abc-123'}, created_at: 2026-03-05 10:31:15
user_id: demo-user-id, action: 'offer_accept', metadata: {offer_id: 'abc-123'}, created_at: 2026-03-05 10:32:45
```

**This is GOLD for analysis!**
- How many users viewed the offer?
- How many clicked?
- How many accepted?
- Conversion rate = (accepts / views) × 100

---

### 6. **offer_analytics** - Aggregated Metrics (ADMIN ONLY)
```
| Column       | Type    | Description                     |
|--------------|---------|---------------------------------|
| offer_id     | UUID    | Which offer                     |
| user_id      | UUID    | Which user                      |
| views_count  | Number  | How many times viewed           |
| clicks_count | Number  | How many times clicked          |
| accepted     | Boolean | Did they accept?                |
```

**What it's for**: Pre-calculated analytics for admins. Instead of counting conversions every time, we calculate once and store the summary.

**Example Row:**
```
offer_id: abc-123
user_id: demo-user-id
views_count: 5
clicks_count: 3
accepted: true
```

**Why separate from conversions?**
- conversions = Raw data (every single action)
- offer_analytics = Summary (aggregated metrics)
- Faster for admin dashboard queries

---

## 🔐 Security (RLS = Row Level Security)

**Problem**: Without security, any user could see/modify anyone's data.

**Solution**: RLS Policies = Rules that PostgreSQL enforces automatically.

### Examples from your app:

**Offers Table - RLS Policy:**
```sql
CREATE POLICY "Users can read own offers"
  ON offers FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
```

**Translation**: Users can ONLY see offers where `user_id` matches their own ID.

**Result**: User A cannot see User B's offers. Automatic. No frontend code needed.

---

**Analytics Table - Admin Only:**
```sql
CREATE POLICY "Admins only - read all analytics"
  ON offer_analytics FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
```

**Translation**: Only users with `role = 'admin'` can access analytics.

**Result**: Regular users cannot see analytics. Only admins can.

---

## 🚀 SETUP INSTRUCTIONS (Step-by-Step)

### STEP 1: Run Database Setup

1. Open Supabase Dashboard: https://supabase.com/dashboard/project/ezyjcnnhrlchdhsuzepj
2. Click **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy/paste entire content from: `/workspaces/bena/project 2/supabase/COMPLETE_SETUP.sql`
5. Click **RUN** button
6. Wait ~10-15 seconds

✅ **Result**: All tables, policies, and functions created!

---

### STEP 2: Create Demo Admin User

1. Still in SQL Editor
2. Click **New Query**
3. Copy/paste content from: `/workspaces/bena/project 2/supabase/CREATE_DEMO_USER.sql`
4. Click **RUN**

✅ **Result**: Demo user created as admin!

---

### STEP 3: Test Your App

1. Open your app: http://localhost:5173 (should already be running)
2. You should see the Cank app
3. Press **Ctrl + Shift + A** (or **Cmd + Shift + A** on Mac)
4. Admin Panel should open! ✅

---

### STEP 4: Create a Test Offer

**In Admin Panel:**
1. Click "Create Offer Template"
2. Name: "Test Cash Offer"
3. Type: Cash
4. Amount: 100
5. Click Create
6. Click "Assign to User"
7. User ID: `00000000-0000-0000-0000-000000000001`
8. Click Assign

**Now go to the CREDIT section of your app:**
- You should see the offer!
- Click through the flow
- Accept it

**Go back to Supabase:**
- Check `conversions` table → You'll see your clicks recorded!
- Check `offers` table → Status changed to "accepted"!

---

## 📊 How to View Your Data in Supabase

### Option 1: Table Editor (Visual)
1. Click **Table Editor** in left sidebar
2. Click any table name (offers, conversions, profiles, etc.)
3. See your data in a spreadsheet-like view
4. Can edit directly!

### Option 2: SQL Editor (Advanced)
```sql
-- See all offers
SELECT * FROM offers;

-- See all conversions
SELECT * FROM conversions ORDER BY created_at DESC;

-- See analytics
SELECT * FROM offer_analytics;

-- Count total offers
SELECT COUNT(*) FROM offers;

-- See accepted offers only
SELECT * FROM offers WHERE status = 'accepted';
```

---

## 🎯 How Your App Works (Complete Flow)

### Example: User Accepts Cash Offer

**Frontend (App.tsx):**
```typescript
// User clicks "Accept" button
const handleAccept = async () => {
  // 1. Track the click
  await trackOfferAccept(userId, offerId, 'cash', 100);
  
  // 2. Update offer status
  await acceptOffer(offerId);
  
  // 3. Show success message
  showToast('Offer accepted!');
};
```

**Backend (Supabase):**
1. `trackOfferAccept()` → Inserts row into `conversions` table
2. `acceptOffer()` → Updates `offers` table: status = 'accepted', accepted_at = NOW()
3. RLS checks: Is this user allowed to update this offer? (Yes, it's their offer)
4. Returns success

**Result:**
- Offer marked as accepted ✅
- Action recorded for analytics ✅
- User sees success toast ✅

---

## 🔄 What Happens When You Scale

**Now (Demo):**
- 1 user (demo user)
- Manual offer creation via Admin Panel

**Later (Production with 1000 users):**
- Users sign up → `profiles` table auto-populates
- You assign offers via templates → `offer_assignments` tracks it
- Every click tracked → `conversions` grows
- Run analytics → See which offers perform best
- A/B testing → Compare offer variations
- Segmentation → Offer A to Group 1, Offer B to Group 2

**All infrastructure ready NOW. Just scales automatically!**

---

## 🛠️ Next Steps (After Setup Complete)

### Phase 2: User Segmentation
- Group users by behavior
- Target offers to specific segments
- Example: "Users with balance > 500 EGP"

### Phase 3: Offer Scheduling
- Schedule offers to activate at specific times
- A/B testing variants
- Example: "Activate 100 EGP offer on Friday at 10 AM"

### Phase 4: Notifications
- Email/SMS when offer available
- Reminders
- Receipt after acceptance

### Phase 5: Real Authentication
- Replace demo user with real signup/login
- User management
- Password reset

---

## ❓ Common Questions

**Q: Where is my data physically stored?**
A: On Supabase servers (AWS cloud). Backed up automatically.

**Q: Can I export my data?**
A: Yes! Click any table → Export as CSV

**Q: What if Supabase goes down?**
A: They have 99.9% uptime. For production, you'd set up backups.

**Q: How much does Supabase cost?**
A: Free tier: 500MB database, 50,000 monthly active users. Plenty for MVP!

**Q: Can I switch from Supabase later?**
A: Yes, it's PostgreSQL. Export data, move to any PostgreSQL database.

---

## 🎉 You're Done!

You now have:
- ✅ Complete backend database
- ✅ All tables and security
- ✅ Demo admin user
- ✅ Working app with real data
- ✅ Analytics tracking
- ✅ Admin panel access

**Test it out and let me know if you have questions!**
