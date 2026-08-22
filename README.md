# Platform - MVP Release

## Overview

Enterprise platform built with **React 18 + TypeScript + Vite** frontend and **Supabase PostgreSQL** backend.

### Stack
- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons
- **Backend:** Supabase (PostgreSQL + Auth + RLS)
- **Auth:** Demo mode (dev) | Phone-based auth (production ready)

---

## Quick Start

### Prerequisites
- Node.js 18+
- Supabase project credentials

### Installation
```bash
# 1. Clone and install
git clone <repo>
cd project
npm install

# 2. Configure environment
cp .env.example .env
# Fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY

# 3. Run dev server
npm run dev

# 4. Build for production
npm run build
```

---

## Project Structure

```
src/
  components/        React UI components
  pages/            Page components
  services/         API & data services
  types/            TypeScript definitions
  utils/            Helper functions
  App.tsx           Main app component
  main.tsx          Entry point

supabase/
  migrations/       Database schema versions
  policies/         RLS security policies
  functions/        Database functions

public/            Static assets
index.html         HTML entry point
vite.config.ts     Build configuration
```

---

## Database Architecture

### Core Tables

| Table | Purpose |
|-------|----------|
| **profiles** | User account data, roles, metadata |
| **balances** | Multi-currency user balances |
| **items** | Core business entity offerings |
| **assignments** | Allocation tracking & auditing |
| **events** | User interaction analytics |
| **templates** | Reusable configurations |

### Security

- **RLS (Row Level Security)** enforces data isolation
- Users can only access their own data
- Admin role provides elevated privileges
- All policies defined in `supabase/policies/`

---

## Development

### Available Scripts

```bash
npm run dev        # Start dev server
npm run build      # Production build
npm run lint       # Run ESLint
npm run typecheck  # TypeScript validation
npm run preview    # Preview production build
```

### Environment Variables

```env
VITE_SUPABASE_URL=<your-project-url>
VITE_SUPABASE_ANON_KEY=<your-anon-key>
VITE_AUTH_MODE=demo|phone  # demo for development
```

---

## Features

### User Management
- Profile creation and updates
- Multi-role support (user, admin)
- Balance tracking across multiple accounts

### Item/Offer System
- Create and manage items
- Track assignments and acceptance
- Template-based reusable configurations

### Analytics
- Event tracking for all user interactions
- Aggregated metrics and reporting
- Admin dashboard access

### Admin Panel
- Keyboard shortcut: `Ctrl+Shift+A` (or `Cmd+Shift+A` on Mac)
- Create/edit items
- View analytics
- User management

---

## Deployment

### Vercel (Recommended)
```bash
# Push to GitHub, connect Vercel project
# Auto-deploys on push to main
```

### Custom Server
```bash
npm run build
# Serve `dist/` folder
```

### Environment Setup
- Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in deployment platform
- Switch `VITE_AUTH_MODE` to `phone` for production
- Update Supabase RLS policies to production rules

---

## API Integration

### Supabase Client Usage

```typescript
import { supabase } from './services/supabase';

// Fetch data
const { data, error } = await supabase
  .from('items')
  .select('*')
  .eq('status', 'active');

// Create record
const { data, error } = await supabase
  .from('items')
  .insert({ name: 'Item', amount: 100 });

// Update record
const { data, error } = await supabase
  .from('items')
  .update({ status: 'completed' })
  .eq('id', itemId);

// Track events
const { error } = await supabase
  .from('events')
  .insert({ user_id, action: 'item_view', metadata: {...} });
```

---

## Testing

### Local Testing Checklist
- [ ] Create items via admin panel
- [ ] Accept items in main interface
- [ ] Verify balance updates
- [ ] Check event logs in Supabase
- [ ] Test RLS isolation (verify users can't see others' data)

### Production Readiness
- [ ] Phone authentication configured
- [ ] Supabase RLS policies applied
- [ ] Environment variables set
- [ ] Database backups configured
- [ ] Monitoring/alerts in place

---

## Troubleshooting

### App shows "Loading..." indefinitely
1. Check Supabase credentials in `.env`
2. Verify database connection: `npm run dev` should show no errors
3. Check browser console for API errors

### Items not persisting
1. Verify Supabase connection
2. Check RLS policies in Supabase dashboard
3. Ensure user profile exists in database

### Admin panel not opening
- Try keyboard shortcut: `Ctrl+Shift+A` or `Cmd+Shift+A`
- Check console for errors

---

## Support & Documentation

- **Backend Guide:** See `docs/BACKEND_GUIDE.md`
- **Setup Instructions:** See `docs/SETUP.md`
- **Supabase Docs:** https://supabase.com/docs
- **React Docs:** https://react.dev
- **TypeScript Docs:** https://www.typescriptlang.org

---

## License

Proprietary - All rights reserved