# ADR 0004: Single Fixed Cancellation & Deposit Policy for MVP

**Status:** Accepted
**Date:** 2026-07-20

## Context

The booking state machine (see [MVP Scope](../specs/mvp-scope.md)) needs concrete rules for who
can cancel when, and what happens to the (mocked) security deposit. Airbnb-style per-listing
configurable policies (flexible/moderate/strict) are the eventual correct shape but multiply the
number of states and branches the MVP booking flow must handle correctly.

## Decision

**One global, non-configurable policy** applies to every listing in the MVP:

- **Customer cancels ≥ 24h before rental start:** booking moves to `cancelled`, full deposit
  released (mock), no fee.
- **Customer cancels < 24h before rental start:** booking moves to `cancelled`, platform fee is
  still retained (mock) as a no-show deterrent; deposit released.
- **Owner rejects or cancels an accepted booking:** always fee-free to the customer; deposit
  released; owner's `rejection_count`/`cancellation_count` is tracked on `profiles` for future
  trust scoring (not surfaced or acted on in MVP beyond storage).
- **On `returned` status with no damage reported:** deposit released (mock) automatically.
- **Damage/dispute reported:** booking moves to a `disputed` sub-state requiring manual admin
  resolution — there is no automated partial-deposit-forfeiture logic in MVP.

This policy text lives in exactly one place (`knowledge/business-rules.md`) and the booking state
machine in code/DB refers to it rather than re-deriving it.

## Consequences

- Booking state machine has a small, fully enumerable set of transitions (see
  [MVP Scope](../specs/mvp-scope.md#booking-state-machine)) — implementable and testable in the
  MVP timeframe.
- No `cancellation_policies` table, no per-listing policy selector in Create Listing — reduces
  listing-creation friction too.
- Per-listing configurable policy is the clear, well-scoped fast-follow once the fixed policy's
  edge cases are understood from real usage.

## Alternatives considered

- **Owner-configurable policy tiers** — deferred; adds a policy table, a listing-creation step,
  and 3x the booking-flow branches for a dimension we have no evidence customers/owners need yet.
