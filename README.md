# Cank - Minimal MVP Backend

This project is now aligned to a minimal backend scope:

- `offers` (backend-managed, per-user)
- `conversions` (raw analytics events)
- `user_flows` (modal flow state)
- `profiles` (user profile + admin role)

## Quick Start

1. Run `supabase/MVP_MINIMAL_BASELINE.sql` in Supabase SQL Editor.
2. Run `supabase/MVP_MINIMAL_VERIFY.sql` to validate schema, policies, and counts.
3. Create `.env` from `.env.example` and fill your Supabase project values.
4. Start app:

```bash
cd '/workspaces/bena/project 2'
npm run dev -- --host 0.0.0.0 --port 5175
```

5. Open `http://localhost:5175/`.

## Notes

- Legacy troubleshooting SQL files are retained in `supabase/` but are no longer the canonical setup path.
- Frontend offer loading now reads only the authenticated user's backend rows (no demo fallback seeding).
- Analytics events are recorded in `conversions` for signup/login/page-view and offer interactions.

