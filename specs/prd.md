---
purpose: Product Requirements Document for Nearo's MVP. Answers why we're building this, for whom, and what "done" means for the first release. Feature-by-feature scope lives in mvp-scope.md; business rules live in knowledge/business-rules.md — this doc links out to both rather than repeating them.
---

# Nearo — Product Requirements Document

**Status:** Draft v1 — Phase 1 deliverable
**Owner:** Founding team
**Last updated:** 2026-07-20

## 1. Vision

Anyone with an underused product — a camera, a drill, a projector, a tent — should be able to
earn from it by renting it to someone nearby who needs it for a day, not a lifetime. Anyone who
needs a product briefly should be able to find one nearby, book it, and get it without buying it.

Nearo is the trust and coordination layer that makes that exchange safe and easy: discovery,
booking, messaging, and reputation. **Nearo owns no inventory.** Every listing belongs to a real
person or small business; every transaction is peer-to-peer.

This is Airbnb's model (marketplace, trust, booking calendar) and Facebook Marketplace's category
breadth (anything, not just one vertical), applied to short-term rental instead of stays or
resale, with Uber's two-sided-liquidity mechanics (anyone can supply, anyone can demand).

## 2. Problem

- **Owners:** own products that sit idle most of the time and have no low-friction way to earn
  from that idle time locally. Existing options (OLX, Facebook Marketplace) are built for resale,
  not rental — no booking calendar, no deposit handling, no rental-specific trust signals.
- **Customers:** need a product briefly (a power tool for a weekend project, a camera for one
  event) and today's options are: buy it (wasteful), find a rental shop (expensive, limited
  selection, inconvenient location), or ask around informally (unreliable, no recourse if
  something goes wrong).
- **Market gap:** India has no dominant peer-to-peer rental marketplace with Airbnb-grade trust
  mechanics (booking flow, reviews, verified users) generalized across product categories.

## 3. Goal of the MVP

**Validate that a two-sided local rental marketplace has real demand** — that owners will list,
and customers will complete bookings — in one city, before investing in payments, KYC, or
multi-city scale.

This is explicitly **not** an attempt to build the final product. See
[mvp-scope.md](mvp-scope.md) for the hard in/out line, and the ADRs in
[/decisions](../decisions/) for the business-rule calls already made to keep MVP scope tight.

### Success signals (what "validated" looks like)

These are directional targets for the launch-city cohort, not contractual metrics:

- Owners list ≥ 3 products on average within their first week of signing up.
- ≥ 20% of booking requests reach `completed` (full rental cycle, not just accepted).
- Repeat usage: a meaningful share of customers who complete one booking make a second request
  within 60 days.
- Owner side isn't a ghost town: a majority of `requested` bookings get an owner response
  (accept or reject) within 24 hours — a slow/absent owner response is the fastest way to kill a
  two-sided marketplace's trust loop.

## 4. Non-Goals (MVP)

- Not competing with Amazon/e-commerce (no platform-owned inventory, no "buy now").
- Not a multi-city or pan-India launch (see [ADR 0002](../decisions/0002-single-city-launch-scope.md)).
- Not processing real money (see [ADR 0005](../decisions/0005-payments-mocked-with-razorpay-adapter.md)).
- Not doing government ID/KYC verification (see [ADR 0003](../decisions/0003-trust-verification-level.md)).
- Not building configurable per-owner cancellation policies (see [ADR 0004](../decisions/0004-cancellation-deposit-policy.md)).
- Not real email/WhatsApp/push delivery (see [ADR 0006](../decisions/0006-notifications-mocked-multi-channel-adapter.md)).

## 5. Users & Personas

Every account can act as both Owner and Customer — there is no separate signup flow per role. See
[glossary.md](../knowledge/glossary.md) for precise definitions.

- **Guest** — anonymous visitor; can browse, search, view listings; must sign in to book/list/chat.
- **Customer** — the "hat" a user wears when searching, booking, chatting-as-renter, reviewing an
  owner.
- **Owner** — the "hat" a user wears when listing, managing bookings, chatting-as-lender, viewing
  earnings.
- **Admin** — internal team role; not self-serve signup. Manages users, listings, categories,
  disputes, and views platform analytics.

### Representative scenarios

1. **Priya**, a hobbyist photographer, owns a drone she uses twice a month. She lists it on
   Nearo, sets a per-day price and a security deposit, and earns from the other 28 days.
2. **Rahul** needs a pressure washer for one Saturday to clean his terrace before a party. He
   searches "pressure washer" within 5km, finds one, requests Saturday–Saturday, and picks it up.
3. **Admin (founding team)** monitors the launch-city dashboard daily to see listings created,
   bookings requested vs. completed, and resolves the occasional dispute flagged by a return.

## 6. Core User Journey (Booking — Airbnb Model)

```
Owner lists product → Customer discovers & requests booking → Owner accepts/rejects
→ Booking confirmed (calendar blocks those dates) → Rental starts → Rental ends
→ Both parties review each other
```

Full state machine, including cancellation/rejection branches:
[mvp-scope.md § Booking State Machine](mvp-scope.md#booking-state-machine).
Cancellation/deposit rules: [business-rules.md](../knowledge/business-rules.md#cancellation--deposit).

## 7. Feature Scope

See [mvp-scope.md](mvp-scope.md) for the full, authoritative feature-by-feature matrix
(✅ MVP / 🔜 fast-follow / ❌ out of scope). Summary by user type, matching the original brief:

- **Guest:** browse, search, filter, view product, login.
- **Customer:** search, filters, wishlist, booking request, chat with owner, booking history,
  reviews, profile.
- **Owner:** dashboard, create/edit/delete/pause listing, accept/reject booking, mock earnings
  page, reviews.
- **Admin:** dashboard, users, listings, categories, reports, analytics, booking management.

## 8. Trust & Safety Model (MVP)

- Verification bar: email + phone only (no KYC) — [ADR 0003](../decisions/0003-trust-verification-level.md).
- Reputation signals: verified badge, star rating + review text, account age, response rate.
- Recourse: report listing/user → admin reports queue; disputed bookings → manual admin
  resolution (no automated fraud scoring in MVP).
- Deposits are mocked but modeled as real money would be, so the trust mechanic (deposit as
  skin-in-the-game) is validated even though no cash moves — see
  [ADR 0005](../decisions/0005-payments-mocked-with-razorpay-adapter.md).

## 9. Monetization

Commission on completed bookings (platform fee), mocked in MVP but computed and displayed as if
real. Rate and mechanics: [ADR 0001](../decisions/0001-monetization-commission-model.md),
[business-rules.md § Monetization](../knowledge/business-rules.md#monetization).

## 10. Design Principles

- **Premium, minimal, Apple-quality craft; Airbnb-level usability** — bento-grid homepage, desktop
  first but fully responsive, light + dark mode, generous whitespace, micro-animations, no
  generic component-library look. Full design system in the upcoming Design Tokens deliverable.
- **Beautiful empty states everywhere** — a new user's empty wishlist, empty booking history, and
  a new owner's empty listings dashboard are first-impression surfaces, not afterthoughts.
- **Trust is a design problem, not just a data problem** — verified badges, review counts, and
  response rates need to be visually prominent at the point of decision (search results, product
  page, booking confirmation), not buried in a profile tab.

## 11. Risks

| Risk | Mitigation |
|---|---|
| Chicken-and-egg: no listings → no customers → no listings | Founding team seeds initial listings in launch city before public customer-facing launch; single-city focus concentrates density. |
| Owners ghost booking requests, killing trust loop | Response-rate metric tracked from day one; fast-follow candidate: auto-expire unanswered requests after 48h. |
| No-shows / damage with no real payment leverage (deposit is mocked) | Explicitly accepted MVP risk — see [ADR 0005](../decisions/0005-payments-mocked-with-razorpay-adapter.md); real deposit capture is the top payments fast-follow. |
| Category breadth dilutes density (too many niche categories, not enough listings per category) | Launch with a curated, narrow category list (see upcoming Database Schema); expand categories based on demand signal, not upfront guessing. |

## 12. Roadmap (Deliverable Order)

Per the project's phased planning requirement — see [tasks/](../tasks/) once created for
execution tracking:

1. ✅ PRD (this document)
2. ✅ [Information Architecture](information-architecture.md)
3. ✅ [User Flow](user-flows.md)
4. ✅ [Wireframes](wireframes.md)
5. ✅ [Component Tree](component-tree.md)
6. ✅ [Database Schema](database-schema.md)
7. ✅ [API Design](api-design.md)
8. ✅ [Folder Structure](folder-structure.md)
9. ✅ [Design Tokens](design-tokens.md)
10. ✅ Supabase Schema — [supabase/migrations/0001_init.sql](../supabase/migrations/0001_init.sql), [supabase/seed.sql](../supabase/seed.sql)
11. ✅ [Implementation Plan](implementation-plan.md)
12. **Next:** Build, starting at M0 (see implementation-plan.md)

## 13. Open Questions

None blocking Phase 2 at this time. Any new ambiguity discovered during Information Architecture
or later phases gets raised before proceeding, not assumed — per the project's operating rule
(see [/.agents/README.md](../.agents/README.md)).
