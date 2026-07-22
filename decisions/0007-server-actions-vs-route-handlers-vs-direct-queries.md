# ADR 0007: Three-Tier Data Access — Direct Queries, Server Actions, Route Handlers

**Status:** Accepted
**Date:** 2026-07-20

## Context

Supabase makes it possible to query the database directly from client components via RLS-guarded
client SDK calls, with no custom backend at all. But some operations (booking creation with
availability-conflict checks, accept/reject transitions that must atomically write to two tables,
mock payment capture) need server-side logic RLS alone can't express safely. We need one
consistent rule for which mechanism handles which kind of operation, or every feature reinvents
this choice.

## Decision

Three tiers, chosen by what the operation needs — not by developer preference:

1. **Direct Supabase client queries (RLS-guarded)** — default for all simple reads and
   single-row writes that RLS alone fully protects: fetching listings, reading a profile, toggling
   a wishlist row, marking a notification read. No custom code needed beyond the query itself.
2. **Next.js Server Actions** — for form-submission-shaped mutations that involve validation
   and/or multiple related writes but don't need to be called from anywhere except this app's own
   forms: creating/editing a listing, submitting a booking request, accepting/rejecting a
   booking, submitting a review. These run server-side, can use the Supabase service role when a
   step (e.g. the atomic availability-block insert) must bypass RLS safely after the server has
   independently verified the actor's permission.
3. **Route Handlers (`/app/api/...`)** — reserved for the few things that are not form
   submissions from our own UI: anything a future Razorpay webhook would call, anything a mobile
   client or third party would eventually call, and the lazy status-transition check (see
   [user-flows.md](../specs/user-flows.md)) invoked from a client-side effect on relevant pages.

## Consequences

- No feature should invent a fourth pattern (e.g. a client component doing multi-table writes
  directly) — if a mutation touches more than one table or needs a business-rule check beyond
  RLS, it's a Server Action, full stop.
- Route Handlers stay few and clearly justified, keeping the API surface small and auditable —
  see [api-design.md](../specs/api-design.md) for the complete, short list.
- Because Server Actions and Route Handlers both run server-side, the mock `PaymentProvider` and
  `NotificationChannel` adapters ([ADR 0005](0005-payments-mocked-with-razorpay-adapter.md),
  [ADR 0006](0006-notifications-mocked-multi-channel-adapter.md)) are only ever invoked from
  these two tiers, never from client code.
