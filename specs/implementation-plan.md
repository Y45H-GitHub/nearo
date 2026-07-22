---
purpose: The build sequence — milestones in dependency order, what each contains, and how it hands off to /tasks/ once coding starts. This is the last planning deliverable; after this, execution begins.
---

# Nearo — Implementation Plan

**Status:** Draft v1 — Phase 11 deliverable (final planning phase)
**Depends on:** all prior `/specs/` documents and `/decisions/`

## 1. Sequencing Principle

Each milestone produces something demoable, and later milestones depend on earlier ones being
functionally real (not stubbed) — e.g. Booking Flow (M4) needs real Listings (M2) and real Auth
(M1), not fixtures, because the whole point is validating the actual flow end to end.

Within a milestone, build in this order: schema already exists (done in planning) → server
logic (Server Actions/queries per [api-design.md](api-design.md)) → UI (per
[component-tree.md](component-tree.md)) → wire together → manual test against
[user-flows.md](user-flows.md).

## 2. Milestones

### M0 — Project Scaffolding & Infra
- Next.js 15 (App Router, TypeScript) init, Tailwind + shadcn/ui installed, Framer Motion added.
- Supabase project created; `0001_init.sql` migration + `seed.sql` applied.
- `supabase gen types typescript` wired into `types/database.ts`.
- Vercel project connected, env vars configured (Supabase URL/keys), preview deploys working.
- Design tokens from [design-tokens.md](design-tokens.md) encoded into `tailwind.config.ts` +
  shadcn theme CSS variables, light/dark both wired.
- **Demo:** blank deployed app with theme toggle working, connected to a live (empty) database.

### M1 — Auth & Profiles
- Email+password and Google OAuth signup/login (Supabase Auth).
- Email verification flow; phone OTP flow (`MockSmsChannel`).
- Profile view/edit (`/profile`), public profile (`/users/[id]`).
- Auth middleware: protected-route redirect, admin-route 404-for-non-admin, per
  [information-architecture.md §5](information-architecture.md#5-security--access-notes).
- **Demo:** full signup → verify → profile edit loop.

### M2 — Listings Core
- Category browse data (seeded).
- Create/Edit Listing multi-step form (all 7 steps), image upload to Supabase Storage.
- Publish/pause/delete listing actions.
- Product Details page.
- **Demo:** an owner can list a real item end to end; it's viewable at its public URL.

### M3 — Discovery
- `/explore` grid + filter sidebar + sort, query-param driven (per
  [information-architecture.md §1](information-architecture.md#1-ia-decisions-worth-flagging)).
- Landing page bento grid wired to real data (falls back gracefully per
  [wireframes.md](wireframes.md#landing-) if seed data is thin).
- Wishlist toggle + `/wishlist` page.
- Radius/distance search using `lat`/`lng`.
- **Demo:** search/filter/wishlist a real listing created in M2.

### M4 — Booking Flow
- Availability calendar (view/select/block-edit modes).
- `requestBooking`, `acceptBooking`, `rejectBooking`, `cancelBooking`, `markReturned` actions.
- `MockPaymentProvider` wired; `payments` rows generated correctly through the whole lifecycle.
- `/api/bookings/[id]/transition` lazy status check.
- My Bookings + Booking Detail pages; Owner Bookings (accept/reject) page.
- **Demo:** full booking lifecycle, `requested → accepted → active → returned`, plus a
  cancellation path, entirely on mock payments — this is the core value-validation loop.

### M5 — Messaging
- Thread creation from a listing, inbox, thread view.
- Polling-based refresh is the MVP baseline; Supabase Realtime subscription is a drop-in upgrade
  if time allows within this milestone, not a separate milestone.
- **Demo:** two test accounts messaging about a real listing.

### M6 — Reviews & Reputation
- Review form gated on booking status; `profiles.rating_avg`/`rating_count` trigger verified.
- Reviews rendered on Product Details and Public Profile.
- **Demo:** complete a booking from M4, both sides leave reviews, ratings update.

### M7 — Owner Dashboard & Earnings
- Dashboard stat tiles (including first-time empty state).
- Mock Earnings page (gross/fee/net per booking + running total).
- **Demo:** an owner with 2-3 completed mock bookings sees a coherent earnings picture.

### M8 — Admin Panel
- Admin shell + `DataTable`.
- Users, Listings, Categories, Bookings, Reports pages + actions (`suspendUser`, `hideListing`,
  `resolveReport`, `resolveDispute`, category CRUD).
- Analytics page (counts/trends only, per [mvp-scope.md](mvp-scope.md)).
- **Demo:** an admin resolves a manufactured dispute and suspends a manufactured bad-actor
  account.

### M9 — Notifications, Polish & QA
- In-app notification center (bell + `/notifications` page) wired to every event in
  [business-rules.md § Notification Events](../knowledge/business-rules.md#notification-events).
- Empty-state pass across every list page (per [component-tree.md § EmptyState](component-tree.md#2-shared-feature-agnostic-components-componentsshared)).
- Micro-animation pass (Framer Motion per [design-tokens.md § Motion](design-tokens.md#6-motion)).
- Full manual run-through of every flow in [user-flows.md](user-flows.md), light/dark, desktop +
  mobile reflow.
- **Demo:** the whole product, cohesive, no dead-end empty states, dark mode parity.

### M10 — Launch-City Seed & Soft Launch Checklist
- Real (not fixture) seed listings for the launch city — team-sourced, not fabricated fake data
  presented as real users.
- Verify RLS policies against a checklist derived from
  [database-schema.md §6](database-schema.md#6-row-level-security--summary) (attempt every
  disallowed read/write as a non-owner/non-admin test account, confirm it's blocked).
- **Demo:** the product as a stranger would experience it on day one in the launch city.

## 3. Explicitly Not in Any Milestone (confirm still 🔜/❌ before adding scope)

Anything marked 🔜 or ❌ in [mvp-scope.md](mvp-scope.md) — Razorpay, real SMS/email/WhatsApp/push,
KYC, configurable cancellation policies, multi-city. If a milestone starts absorbing one of these
"while we're in there," stop and confirm it's an intended scope change, not drift.

## 4. Handoff to `/tasks/`

Once M0 begins, each milestone gets a corresponding `/tasks/m0-scaffolding.md`-style file broken
into concrete checkboxes, updated as work proceeds — that's execution tracking, distinct from this
document's role as the fixed plan. This implementation plan doesn't get rewritten per-task; if a
milestone's *scope* needs to change, that's a plan revision, discussed before it happens.

## Open Questions

None. This is the last planning deliverable — the next step is M0.
