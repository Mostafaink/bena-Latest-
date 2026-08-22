# Developer Guide

## Welcome! 👋

This guide helps software engineers get productive quickly.

---

## Quick Start (5 minutes)

```bash
# 1. Clone
git clone <repo>
cd project

# 2. Install
npm install

# 3. Configure
cp .env.example .env
# Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY

# 4. Run
npm run dev

# 5. Open http://localhost:5173
```

**Expected:** App loads with demo interface, no errors in console.

---

## Project Overview

### What This Does
Multi-user platform for managing items/offers with analytics tracking.

### Key Technologies
- **Frontend:** React 18 + TypeScript + Vite (lightning fast!)
- **Backend:** Supabase (PostgreSQL + Auth + RLS)
- **UI:** Tailwind CSS + Lucide Icons
- **Dev Tools:** ESLint, TypeScript, Vite

### Architecture
- Service layer abstracts Supabase calls
- Component layer handles UI
- RLS policies enforce security at database level

---

## Codebase Structure

```
project/
├── src/
│   ├── components/       UI building blocks
│   ├── pages/           Full page components
│   ├── services/        API/database layer
│   ├── types/           TypeScript definitions
│   ├── utils/           Helper functions
│   ├── App.tsx          Root component
│   └── main.tsx         Entry point
│
├── supabase/
│   ├── migrations/      Schema versions
│   └── policies/        RLS security rules
│
├── docs/
│   ├── ARCHITECTURE.md  System design
│   ├── SETUP.md        Initial setup
│   └── BACKEND_GUIDE.md Database details
│
├── public/             Static assets
├── vite.config.ts      Build config
├── tsconfig.json       TypeScript config
├── package.json        Dependencies
└── README.md           Project overview
```

---

## Common Development Tasks

### Adding a New Page

```typescript
// 1. Create component: src/pages/NewPage.tsx
import React from 'react';

export function NewPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold">New Page</h1>
      {/* Your content */}
    </div>
  );
}

// 2. Add to routing: src/App.tsx
// Import at top
import { NewPage } from './pages/NewPage';

// Add to navigation/routing
```

### Fetching Data from Database

```typescript
// 1. Create/update service: src/services/items.ts
import { supabase } from './supabase';

export async function fetchItems(userId: string) {
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) throw new Error(error.message);
  return data;
}

// 2. Use in component: src/components/ItemList.tsx
import { fetchItems } from '../services/items';
import { useEffect, useState } from 'react';

export function ItemList({ userId }: { userId: string }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchItems(userId)
      .then(setItems)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div>
      {items.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  );
}
```

### Updating Data

```typescript
// Service layer
export async function acceptItem(itemId: string) {
  const { data, error } = await supabase
    .from('items')
    .update({ 
      status: 'accepted',
      accepted_at: new Date().toISOString()
    })
    .eq('id', itemId);
  
  if (error) throw new Error(error.message);
  return data;
}

// Component
async function handleAccept(itemId: string) {
  try {
    await acceptItem(itemId);
    // Update UI, show success message
  } catch (error) {
    console.error('Failed to accept:', error);
    // Show error to user
  }
}
```

### Tracking Events (Analytics)

```typescript
// Service layer
export async function trackEvent(
  userId: string,
  action: string,
  metadata?: Record<string, unknown>
) {
  const { error } = await supabase
    .from('events')
    .insert({
      user_id: userId,
      action,
      metadata: metadata || {}
    });

  if (error) console.error('Event tracking failed:', error);
}

// Use in component
useEffect(() => {
  trackEvent(userId, 'page_view', { page: 'items' });
}, [userId]);
```

---

## Database Schema Reference

### profiles
User accounts and roles
```sql
SELECT * FROM profiles;
-- id, email, first_name, full_name, role, created_at
```

### items
Main business entity
```sql
SELECT * FROM items;
-- id, user_id, status, amount, config, created_at, accepted_at
```

### balances
Account balances
```sql
SELECT * FROM balances;
-- id, user_id, account_type, amount, currency, updated_at
```

### events
User action tracking
```sql
SELECT * FROM events;
-- id, user_id, action, metadata, created_at
```

### templates
Reusable configurations
```sql
SELECT * FROM templates;
-- id, name, type, amount, config, is_active, created_at
```

---

## Testing

### Manual Testing Checklist

Before committing:

- [ ] App starts without errors
- [ ] Admin panel opens (Ctrl+Shift+A)
- [ ] Can create items
- [ ] Can accept items
- [ ] Data persists (refresh page and verify)
- [ ] No console errors (F12 → Console)
- [ ] TypeScript compiles (npm run typecheck)

### Running Linter

```bash
npm run lint
# Should have 0 errors
```

### Build Check

```bash
npm run build
# Should complete without errors
# Check dist/ folder is created
```

---

## Debugging

### Browser Console

```javascript
// Check if Supabase is connected
console.log(supabase);

// Test a query
supabase.from('items').select('*').then(console.log);

// Check current user
console.log(localStorage.getItem('supabase.auth.token'));
```

### TypeScript Errors

```bash
# Check for type issues
npm run typecheck

# Common fix: Update types from Supabase schema
# Supabase Dashboard → Settings → API → Generate TypeScript Types
```

### RLS Policy Violations

If you get a 403 error:
1. Go to Supabase Dashboard
2. Click "Authentication" → "Policies"
3. Verify policy exists for the table
4. Check policy allows the operation (SELECT, INSERT, UPDATE, DELETE)

### Supabase Logs

```
Supabase Dashboard → Logs → Recent Errors
Shows all database errors and policy violations
```

---

## Git Workflow

### Creating a Feature Branch

```bash
# Create branch from main
git checkout main
git pull origin main
git checkout -b feature/short-description

# Make changes...

# Commit with clear messages
git add .
git commit -m "feat: add item filtering"

# Push and create PR
git push origin feature/short-description
```

### Commit Message Format

```
feat: add new feature
fix: bug fix
docs: documentation update
refactor: code restructuring
test: add/update tests
chore: dependencies, config, etc
```

---

## Performance Tips

### Minimize Database Queries

```typescript
// ❌ Bad: Multiple queries in loop
items.forEach(async (item) => {
  const { data } = await supabase
    .from('items')
    .select('*')
    .eq('id', item.id);
});

// ✅ Good: Single query
const { data } = await supabase
  .from('items')
  .select('*')
  .in('id', items.map(i => i.id));
```

### Use Pagination for Large Datasets

```typescript
// Fetch first 20
const { data } = await supabase
  .from('items')
  .select('*')
  .range(0, 19);

// Fetch next 20
const { data } = await supabase
  .from('items')
  .select('*')
  .range(20, 39);
```

### Memoize Expensive Computations

```typescript
import { useMemo } from 'react';

export function ItemStats({ items }) {
  // Only recalculate if items change
  const stats = useMemo(() => {
    return {
      total: items.length,
      accepted: items.filter(i => i.status === 'accepted').length
    };
  }, [items]);

  return <div>{stats.total} items</div>;
}
```

---

## Code Style

### TypeScript
- Use explicit types (avoid `any`)
- Prefer interfaces for data structures

### React
- Functional components only
- Use hooks for state management
- Keep components focused and small

### CSS
- Use Tailwind utility classes
- Avoid inline styles
- Keep components responsive

### Example

```typescript
// ✅ Good
interface Item {
  id: string;
  name: string;
  amount: number;
}

export function ItemCard({ item }: { item: Item }) {
  return (
    <div className="border rounded-lg p-4 hover:shadow-md">
      <h2 className="text-lg font-bold">{item.name}</h2>
      <p className="text-gray-600">{item.amount}</p>
    </div>
  );
}
```

---

## Useful Resources

### Documentation
- `/docs/ARCHITECTURE.md` - System design
- `/docs/SETUP.md` - Initial setup
- `/docs/BACKEND_GUIDE.md` - Database details

### External Docs
- Supabase: https://supabase.com/docs
- React: https://react.dev
- TypeScript: https://www.typescriptlang.org/docs/
- Tailwind: https://tailwindcss.com/docs
- Vite: https://vitejs.dev/guide/

### Tools
- VS Code Extensions:
  - ES7+ React/Redux/React-Native snippets
  - Tailwind CSS IntelliSense
  - Prettier
  - ESLint

---

## Common Questions

**Q: How do I add a new database table?**
A: Create migration in `supabase/migrations/`, apply in SQL Editor, update TypeScript types.

**Q: How do I handle authentication?**
A: Dev uses demo mode (hardcoded user). Production uses phone auth via Supabase Auth.

**Q: How do I debug why RLS is blocking my query?**
A: Check Supabase Logs and verify `auth.uid()` matches in policy. Use SQL Editor to test policies directly.

**Q: Where do I put business logic?**
A: Service layer functions (e.g., `src/services/items.ts`). Components call services.

**Q: How often should I commit?**
A: Frequently! Small, focused commits with clear messages.

---

## Getting Help

1. Check existing GitHub Issues
2. Search `/docs/` for related topics
3. Ask in team Discussions
4. Create a new Issue if stuck

---

## Success! 🎉

You're now ready to contribute. Here's what to do next:

1. ✅ Complete setup
2. 🔍 Explore `src/App.tsx` and understand the structure
3. 🎯 Pick a small issue or feature
4. 💻 Make a change and test it
5. 🔃 Create a Pull Request
6. 👥 Get code review from team

Questions? Post in Discussions or create an Issue.

Welcome to the team! 🚀