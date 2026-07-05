# MVP Release Plan (Evidence-First)

Date: 2026-03-08
Owner: Product + Engineering

## Trust Reset Rules
- No status claim is accepted unless it includes command output evidence.
- Status words are strict: `PASS`, `FAIL`, `BLOCKED`.
- Any item marked `BLOCKED` must include the next concrete action and owner.

## Scope Lock (Today MVP)
- In scope:
  - Demo mode app works end-to-end.
  - Admin can create/update/delete offers.
  - User can view and accept offers.
  - Balances display consistently.
  - Build succeeds for production artifacts.
- Out of scope for today:
  - Live payment gateway processing.
  - Full production auth migration.

## Gate Checklist: MVP Today

1. Build Gate
- Command: `npm run build`
- Result target: `PASS`
- Current: `PASS` (2026-03-08)

2. Backend Connectivity Gate
- Command: `node status-check.js`
- Result target: `PASS` for core (`Connection`, `Offers`, `Can Create`)
- Current: `PASS` core, `FAIL` data bootstrap (`Profile`, `Balance`) (2026-03-08)
- Action: Run `supabase/SAFE_DEMO_PROFILE_BALANCE_BOOTSTRAP.sql` in Supabase SQL Editor
- Owner: Product/Admin console access

3. Demo Data Gate
- Command: `node status-check.js`
- Result target: `Profile=PASS`, `Balance=PASS`
- Current: `FAIL` (rows missing)
- Action: Execute bootstrap SQL and re-run command
- Owner: Product/Admin console access

4. User Journey Gate
- Scenario:
  - Open app
  - Confirm balances visible
  - Accept one offer
  - Verify status changes and data persists on refresh
- Result target: `PASS`
- Current: `PENDING`

5. Admin Journey Gate
- Scenario:
  - Open Admin panel
  - Create one cash offer and one receivables offer
  - Edit amount/config
  - Delete one offer
  - Confirm all changes persist after refresh
- Result target: `PASS`
- Current: `PENDING`

## Plan to Ship in 1 Week (Production-Safe)

Day 1: Security Baseline
- Remove broad permissive demo policy guidance from docs.
- Keep hardened RLS as source of truth (`MVP_PRODUCTION_BASELINE.sql`).
- Deliver policy inventory and known exceptions.

Day 2: Auth Stabilization
- Decide production auth mode and enforce it in env + app logic.
- Ensure profile/balance creation path uses secure server-side authority.

Day 3: Data Consistency
- Consolidate schema/migration conflicts and duplicate legacy paths.
- Verify no contradictory SQL setup docs remain.

Day 4: Payment Method UX (No live charging yet)
- Add payment methods data model + UI:
  - bank transfer
  - mobile wallet
  - card placeholder
- CRUD for user payment methods under RLS.

Day 5: Payment Integration Prep
- Introduce provider abstraction + env wiring.
- Keep real gateway calls behind feature flag until compliance checks pass.

Day 6: QA + Regression
- Full smoke test checklist execution.
- Fix top defects and retest.

Day 7: Release Readiness
- Final release report with PASS/FAIL per gate.
- If all PASS, ship.

## Evidence Log
- `npm run build`: PASS (2026-03-08)
- `node status-check.js`: Core PASS, Demo data bootstrap FAIL (2026-03-08)

## Immediate Next Action
- Run `supabase/SAFE_DEMO_PROFILE_BALANCE_BOOTSTRAP.sql` now.
- Re-run `node status-check.js` and update this file with final MVP Today status.
