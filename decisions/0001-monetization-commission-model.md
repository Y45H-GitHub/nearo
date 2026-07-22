# ADR 0001: Commission-Based Monetization (Mocked in MVP)

**Status:** Accepted
**Date:** 2026-07-20

## Context

Nearo is a two-sided peer-to-peer rental marketplace (owners list, customers book). We need a
revenue model decided before schema design because it determines whether money fields live on
the `bookings` table now or get bolted on later.

## Decision

The platform takes a **commission (percentage cut) of every completed booking**, charged to the
owner's payout, similar to Airbnb's host service fee model. In the MVP:

- Payments are fully mocked (no real money moves — see [ADR 0005](0005-payments-mocked-with-razorpay-adapter.md)).
- Every `bookings` row still stores `subtotal_amount`, `platform_fee_amount`, `platform_fee_rate`,
  `deposit_amount`, and `owner_payout_amount` so the owner Earnings page shows real (mock) numbers
  and the split-payout logic is provable before Razorpay is wired in.
- `platform_fee_rate` is a snapshot copied onto the booking at creation time from a single global
  config value (not per-listing, not per-category) — e.g. 12%. Configurability by category/owner
  tier is explicitly deferred.

## Consequences

- Owner Earnings page (mock) can show gross rental income, platform fee deducted, and net payout —
  giving real signal on whether the take rate is viable, without processing real payments.
- When Razorpay is integrated post-MVP, the payout split is a config change, not a schema change.
- We do not build subscription billing, listing fees, or featured-listing ads in the MVP.

## Alternatives considered

- **Free for MVP, monetize later** — simpler, but produces zero signal on whether the take rate
  affects owner listing behavior or customer pricing, which is a core marketplace-viability
  question we want to validate early.
- **Owner subscription/flat fee** — misaligned incentives for a marketplace with a long tail of
  low-frequency owners; most real P2P rental marketplaces (Airbnb, Turo) converged on commission.
