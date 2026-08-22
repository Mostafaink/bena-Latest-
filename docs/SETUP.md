# Setup Guide for New Engineers

## Prerequisites

- Node.js 18+ and npm
- Git
- Supabase account and project credentials
- Code editor (VS Code recommended)

---

## Step 1: Clone and Install

```bash
# Clone repository
git clone https://github.com/Mostafaink/bena-Latest-.git
cd bena-Latest-

# Install dependencies
npm install

# Verify installation
npm run typecheck
```

---

## Step 2: Environment Setup

### Get Credentials from Supabase

1. Go to https://supabase.com/dashboard
2. Select your project
3. Click "Settings" → "API"
4. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **Anon Public Key** → `VITE_SUPABASE_ANON_KEY`

### Create .env File

```bash
# Copy template
cp .env.example .env

# Edit .env with your credentials
cat > .env << EOF
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_AUTH_MODE=demo
EOF
```

### Verify Environment

```bash
# Check that env variables are loaded
npm run dev
# You should see: "VITE v5.x.x ready in XXX ms"
# No errors about missing env vars
```

---

## Step 3: Database Setup

### Initialize Database Schema

```bash
# In Supabase dashboard:
# 1. Click "SQL Editor" in left sidebar
# 2. Click "New Query"
# 3. Open file: supabase/migrations/01_initial_schema.sql
# 4. Copy and paste entire content into SQL Editor
# 5. Click "RUN"
# 6. Wait for success message
```

### Verify Schema

```sql
-- Run in Supabase SQL Editor to verify tables exist
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- Should list: assignments, balances, events, items, profiles, templates
```

### Apply RLS Policies

```bash
# 1. In Supabase SQL Editor
# 2. Open file: supabase/policies/01_rls_policies.sql
# 3. Paste entire content
# 4. Click RUN
```

### Create Demo User (Development Only)

```sql
-- Run in Supabase SQL Editor

-- Create demo profile
INSERT INTO profiles (id, email, first_name, full_name, role)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'demo@app.local',
  'Demo',
  'Demo User',
  'admin'
)
ON CONFLICT (id) DO NOTHING;

-- Create demo balance
INSERT INTO balances (id, user_id, account_type, amount, currency)
VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000001',
  'primary',
  1000.00,
  'XXX'
)
ON CONFLICT DO NOTHING;
```

---

## Step 4: Start Development

```bash
# Start dev server
npm run dev

# Output should show:
# ➜  Local:   http://localhost:5173/
# ➜  press h to show help

# Open http://localhost:5173 in browser
```

### First-Time Checklist

- [ ] App loads without errors
- [ ] See main interface (not "Loading...")
- [ ] Admin panel opens (Ctrl+Shift+A)
- [ ] Can view balance information

---

## Step 5: Create Test Data

### Via Admin Panel

1. Open app: http://localhost:5173
2. Press `Ctrl+Shift+A` to open admin panel
3. Create a test item:
   - Name: "Test Item"
   - Amount: (any number)
   - Type: (select from dropdown)
4. Click "Create"

### Via Supabase SQL Editor

```sql
-- Create test item
INSERT INTO items (
  id, user_id, status, amount, created_at
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000001',
  'available',
  150.00,
  now()
);

-- Verify
SELECT * FROM items ORDER BY created_at DESC LIMIT 1;
```

---

## Step 6: Verify Data Flow

### Check Event Tracking

```bash
# 1. In app, perform an action (e.g., accept an item)
# 2. In Supabase SQL Editor, run:

SELECT * FROM events 
WHERE user_id = '00000000-0000-0000-0000-000000000001'
ORDER BY created_at DESC 
LIMIT 10;

# You should see your action recorded
```

### Check Database Updates

```bash
# After accepting an item in the app:

SELECT * FROM items 
WHERE user_id = '00000000-0000-0000-0000-000000000001'
ORDER BY created_at DESC 
LIMIT 1;

# Status should show 'accepted' and accepted_at should be recent
```

---

## Common Issues & Solutions

### Issue: "Connection refused" or "Network error"

**Solution:**
1. Check `.env` file has correct `VITE_SUPABASE_URL`
2. Verify Supabase project is active (not paused)
3. Restart dev server: `npm run dev`

### Issue: RLS policy violation (403 Forbidden)

**Solution:**
1. Verify RLS policies applied: Go to Supabase → Authentication → Policies
2. Check that demo user profile exists
3. Re-run `supabase/policies/01_rls_policies.sql`

### Issue: App shows "Loading..." indefinitely

**Solution:**
1. Open browser DevTools (F12) → Console
2. Look for errors related to `profiles` or `balances` queries
3. Verify demo user exists in `profiles` table
4. Verify demo balance exists in `balances` table

### Issue: TypeScript errors in IDE

**Solution:**
```bash
# Regenerate types from Supabase
npm run typecheck

# Or manually in Supabase dashboard:
# Settings → API → TypeScript Definitions → Generate types
# Copy and paste into src/types/supabase.ts
```

---

## Development Workflow

### Making Changes

```bash
# 1. Create a feature branch
git checkout -b feature/item-improvements

# 2. Make changes to code
# 3. Test locally (npm run dev)
# 4. Run linter
npm run lint

# 5. Run type check
npm run typecheck

# 6. Commit and push
git add .
git commit -m "feat: improve item display"
git push origin feature/item-improvements

# 7. Create Pull Request on GitHub
```

### Database Changes

```bash
# 1. Create new migration file
# supabase/migrations/03_add_new_feature.sql

# 2. Run in Supabase SQL Editor

# 3. Update TypeScript types if schema changed
# src/types/supabase.ts

# 4. Commit both files
git add supabase/migrations/03_add_new_feature.sql src/types/supabase.ts
git commit -m "feat: add new database feature"
```

---

## Building for Production

```bash
# Build optimized bundle
npm run build

# Output in dist/ folder (ready to deploy)

# Test production build locally
npm run preview

# Then deploy to hosting (Vercel, Netlify, etc.)
```

### Before Production Deploy

- [ ] Update `VITE_AUTH_MODE=phone` in deployment environment
- [ ] Apply production RLS policies: `supabase/policies/02_rls_production.sql`
- [ ] Set all environment variables in deployment platform
- [ ] Test all features in staging environment
- [ ] Set up monitoring and error tracking
- [ ] Configure Supabase backups

---

## Useful Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run typecheck    # TypeScript check

# Database (via Supabase CLI)
supabase db pull     # Pull latest schema
supabase db push     # Push migrations
supabase functions deploy  # Deploy Edge Functions
```

---

## Getting Help

### Documentation
- `docs/ARCHITECTURE.md` - System design overview
- `docs/BACKEND_GUIDE.md` - Database details
- Supabase Docs: https://supabase.com/docs
- React Docs: https://react.dev

### Debug Mode

```typescript
// In any service file, enable debug logging:
const DEBUG = true;

if (DEBUG) {
  console.log('Query:', { table, filters });
  console.log('Response:', data);
}
```

### Contact the Team

- Create GitHub Issue for bugs
- Start a Discussion for questions
- Check existing Issues/Discussions before posting

---

## Next Steps

1. ✅ Complete setup (you are here)
2. 📖 Read `docs/ARCHITECTURE.md` to understand system design
3. 🔍 Explore codebase: Start with `src/App.tsx`
4. 🎯 Pick a small feature to implement
5. 💬 Ask team for code review on your first PR

Welcome to the team! 🚀