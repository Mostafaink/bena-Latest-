# Architecture Overview

## System Design

```
┌─────────────────────────────────────────────────────────┐
│                    User Browser                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌────────────────────────────────────────────┐        │
│  │      React 18 + TypeScript Frontend        │        │
│  │  ┌──────��───┐  ┌──────────┐  ┌──────────┐ │        │
│  │  │  Pages   │  │Components│  │  Admin   │ │        │
│  │  └──────────┘  └──────────┘  └──────────┘ │        │
│  └────────────────────────────────────────────┘        │
│                       │                                 │
│                       ▼                                 │
│          ┌────────────────────────┐                    │
│          │  Supabase JS Client    │                    │
│          │  (Auth + Realtime)     │                    │
│          └────────────────────────┘                    │
│                       │                                 │
└───────────────────────┼─────────────────────────────────┘
                        │ HTTPS
                        ▼
        ┌─────────────────��─────────────┐
        │   Supabase Cloud Platform     │
        │  (Hosted on AWS)              │
        ├───────────────────────────────┤
        │                               │
        │  ┌─────────────────────────┐  │
        │  │  PostgreSQL Database    │  │
        │  │  ┌─────────────────┐    │  │
        │  │  │ profiles        │    │  │
        │  │  │ balances        │    │  │
        │  │  │ items           │    │  │
        │  │  │ assignments     │    │  │
        │  │  │ events          │    │  │
        │  │  │ templates       │    │  │
        │  │  │ analytics       │    │  │
        │  │  └─────────────────┘    │  │
        │  └─────────────────────────┘  │
        │           ▲                    │
        │           │                    │
        │  ┌────────┴─────────┐         │
        │  │   RLS Policies   │         │
        │  │  (Security)      │         │
        │  └──────────────────┘         │
        │                               │
        │  ┌─────────────────────────┐  │
        │  │  Auth System            │  │
        │  │  (Demo + Phone OAuth)   │  │
        │  └─────────────────────────┘  │
        │                               │
        └───────────────────────────────┘
```

---

## Data Flow

### User Action Flow

```
User clicks button
    ↓
React component handler
    ↓
Service layer function
    ↓
Supabase JS Client
    ↓
PostgreSQL Query
    ↓
RLS Policy Evaluation
    ↓
Query Execution / Rejection
    ↓
Response returned to client
    ↓
UI updates / Error handling
```

### Example: Accept Item

```typescript
// Component
<button onClick={handleAccept}>Accept</button>

// Handler
async function handleAccept(itemId: string) {
  // 1. Track event
  await trackEvent('item_accepted', { itemId });
  
  // 2. Update item status
  await updateItemStatus(itemId, 'accepted');
  
  // 3. Update user balance
  await updateBalance(userId, amount);
  
  // 4. Show feedback
  showNotification('Item accepted!');
}

// Service Layer
const updateItemStatus = async (itemId, status) => {
  return supabase
    .from('items')
    .update({ status, accepted_at: new Date() })
    .eq('id', itemId)
    .eq('user_id', userId);  // RLS enforces this
};
```

---

## Database Schema

### profiles
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE,
  first_name TEXT,
  full_name TEXT,
  role TEXT DEFAULT 'user',  -- 'user' | 'admin'
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

**RLS Policy:** Users see only their own profile. Admins see all.

### balances
```sql
CREATE TABLE balances (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  account_type TEXT,    -- e.g., 'primary', 'secondary'
  amount DECIMAL(15,2),
  currency TEXT DEFAULT 'XXX',
  updated_at TIMESTAMP DEFAULT now()
);
```

**RLS Policy:** Users see only their own balances.

### items
```sql
CREATE TABLE items (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  template_id UUID REFERENCES templates(id),
  status TEXT DEFAULT 'available',  -- 'available' | 'accepted' | 'expired'
  amount DECIMAL(15,2),
  config JSONB,  -- Flexible configuration storage
  accepted_at TIMESTAMP,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now()
);
```

**RLS Policy:** Users see only their own items. Admins see all.

### assignments
```sql
CREATE TABLE assignments (
  id UUID PRIMARY KEY,
  item_id UUID REFERENCES items(id),
  user_id UUID REFERENCES profiles(id),
  template_id UUID REFERENCES templates(id),
  assigned_at TIMESTAMP DEFAULT now(),
  notes TEXT
);
```

**RLS Policy:** Admins only.

### events
```sql
CREATE TABLE events (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  action TEXT,  -- e.g., 'item_view', 'item_click', 'item_accept'
  metadata JSONB,  -- Flexible event data
  created_at TIMESTAMP DEFAULT now()
);
```

**RLS Policy:** Users see their own events. Admins see all.

### templates
```sql
CREATE TABLE templates (
  id UUID PRIMARY KEY,
  name TEXT,
  description TEXT,
  type TEXT,
  amount DECIMAL(15,2),
  config JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now()
);
```

**RLS Policy:** Everyone can read. Admins can write.

---

## Authentication Modes

### Development (Demo Mode)
```
VITE_AUTH_MODE=demo

- Hardcoded user: 00000000-0000-0000-0000-000000000001
- No login required
- All RLS policies are permissive
- For rapid iteration
```

### Production (Phone Auth)
```
VITE_AUTH_MODE=phone

- User signup via phone number (OTP)
- Supabase Auth handles session management
- Strict RLS policies enforced
- Phone + email optional
```

---

## RLS (Row Level Security) Strategy

### Philosophy
Every user is isolated by default. Admin can see everything.

### Implementation Pattern

**For user data (profiles, balances, items):**
```sql
CREATE POLICY "Users read own data"
  ON items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users update own data"
  ON items FOR UPDATE
  USING (auth.uid() = user_id);
```

**For admin operations:**
```sql
CREATE POLICY "Admins can do anything"
  ON items FOR ALL
  USING (is_admin(auth.uid()));

-- Helper function
CREATE FUNCTION is_admin(user_id UUID) AS $$
  SELECT role = 'admin' FROM profiles WHERE id = user_id
$$ LANGUAGE SQL;
```

---

## API Layer

### Service Structure

```
services/
  ├── supabase.ts          -- Supabase client init
  ├── auth.ts              -- Auth operations
  ├── items.ts             -- Item CRUD
  ├── balances.ts          -- Balance operations
  ├── events.ts            -- Event tracking
  └── admin.ts             -- Admin operations
```

### Service Pattern

```typescript
// services/items.ts

export async function fetchUserItems(userId: string) {
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
    
  if (error) throw new Error(error.message);
  return data;
}

export async function acceptItem(itemId: string) {
  const { data, error } = await supabase
    .from('items')
    .update({ status: 'accepted', accepted_at: new Date() })
    .eq('id', itemId);
    
  if (error) throw new Error(error.message);
  return data;
}
```

---

## Error Handling

### Frontend Layer
```typescript
try {
  await acceptItem(itemId);
  showSuccess('Item accepted!');
} catch (error) {
  if (error.message.includes('RLS')) {
    showError('Permission denied');
  } else if (error.message.includes('not found')) {
    showError('Item not found');
  } else {
    showError('An error occurred');
  }
}
```

### Backend (RLS Violations)
Supabase returns HTTP 403 Forbidden when RLS policy fails. Frontend should handle gracefully.

---

## Scaling Considerations

### Current (MVP)
- Single Supabase project
- Demo mode with hardcoded user
- No external services

### Growth
- Monitor database query performance
- Add caching layer (Redis) if needed
- Implement pagination for large datasets
- Use connection pooling

### Enterprise
- Dedicated Supabase project per region
- CDN for static assets
- Load testing before major launches
- Backup/disaster recovery plan

---

## Security Checklist

- ✅ RLS policies enforced on all user data tables
- ✅ Admin role required for sensitive operations
- ✅ Environment variables for credentials (never hardcoded)
- ✅ HTTPS-only communication with backend
- ✅ Supabase Auth for session management
- ✅ No sensitive data in frontend code
- ✅ Error messages don't leak system details

---

## Deployment Pipeline

### Development
```
Local changes → git push → Codespace auto-rebuild
```

### Staging
```
Tag release → GitHub → Vercel preview deployment
```

### Production
```
Merge to main → GitHub Actions → Vercel production
- Database migrations applied
- Environment variables validated
- Health checks run
```

---

## Monitoring & Observability

### Logs
- Browser console: Frontend errors and debug info
- Supabase dashboard: Database queries, authentication
- Application logs: Business logic traces

### Metrics to Track
- API response times
- Error rates (4xx, 5xx)
- User engagement (events)
- Database query performance
- RLS policy violations (security alerts)

---

## References

- Supabase Docs: https://supabase.com/docs
- PostgreSQL RLS: https://www.postgresql.org/docs/current/ddl-rowsecurity.html
- React Best Practices: https://react.dev
- TypeScript Handbook: https://www.typescriptlang.org/docs/