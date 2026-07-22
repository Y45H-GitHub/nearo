# ADR 0003: Email/Phone Verification Only for MVP Trust Model

**Status:** Accepted
**Date:** 2026-07-20

## Context

A rental marketplace's core risk is trust between strangers exchanging physical goods. Full
government-ID/KYC verification is the "correct" long-term answer but adds signup friction and
a manual-review operational burden we cannot support pre-demand-validation.

## Decision

For MVP, a user becomes eligible to **list a product or request a booking** once they have:

1. Verified email (magic link / OTP via Supabase Auth), and
2. Verified phone number (OTP — mocked SMS provider in MVP, see
   [ADR 0006](0006-notifications-mocked-multi-channel-adapter.md)).

No government ID upload, no manual KYC review queue, in the MVP. `profiles.is_verified` is
derived from these two flags. The profile schema **does** include nullable fields
(`id_verification_status`, `id_document_url`) so ID verification can be turned on later without a
migration — they are simply unused/always-null in MVP.

Trust signals surfaced to users instead rely on: verified badge, review history/rating,
account age, and (owner side) response rate — all derivable from data we're already collecting.

## Consequences

- Faster signup funnel → more listings/bookings to validate demand with.
- We accept higher fraud/no-show risk in MVP; mitigated by the simple cancellation/deposit policy
  ([ADR 0004](0004-cancellation-deposit-policy.md)) and manual admin dispute handling, not
  automated trust scoring.
- Category-level risk gating (e.g. requiring ID for high-value electronics) is explicitly deferred
  — flagged in [MVP Scope](../specs/mvp-scope.md) as a fast-follow, not core MVP.

## Alternatives considered

- **Mandatory government ID verification** — higher trust bar, correct for scaled marketplace,
  but adds a manual review operational dependency the founding team cannot staff pre-PMF.
