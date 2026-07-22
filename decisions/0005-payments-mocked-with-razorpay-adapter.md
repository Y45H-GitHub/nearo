# ADR 0005: Payments Are Fully Mocked Behind a Provider-Agnostic Adapter

**Status:** Accepted
**Date:** 2026-07-20

## Context

The brief requires real money to never move in the MVP, while the architecture must let Razorpay
be dropped in later without a schema or booking-flow rewrite. This is a scaffolding decision, not
a business-rule decision, but it is documented here because it constrains backend structure.

## Decision

All payment operations go through a single internal interface,
`PaymentProvider` (`create_intent`, `capture`, `refund`, `release_deposit`), implemented in MVP by
a `MockPaymentProvider` that:

- Immediately marks payments as `succeeded` with a fabricated `provider_reference`.
- Writes real rows to a `payments` table (amount, currency, status, provider, provider_reference,
  booking_id) so the data model and Earnings page behave exactly as they would with a live
  gateway.
- Never calls any external network service.

A `RazorpayPaymentProvider` implementing the same interface is the designed (not built) fast
follow — swapping providers is a dependency-injection change, not a schema or UI change. No code
anywhere outside `lib/payments/` is allowed to assume a specific provider.

## Consequences

- Booking flow, Earnings page, and refund/deposit logic are fully testable in MVP with zero
  payment-gateway account setup.
- `payments.provider` and `payments.provider_reference` columns exist from day one, so the switch
  to Razorpay is additive.
- Webhook-handling code path does not exist in MVP (mock provider has no webhooks) — it is called
  out explicitly in [MVP Scope](../specs/mvp-scope.md) as a fast-follow requirement, not silently
  missing.
