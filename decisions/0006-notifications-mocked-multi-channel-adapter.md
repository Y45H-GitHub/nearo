# ADR 0006: Notifications Are Mocked Behind a Multi-Channel Adapter

**Status:** Accepted
**Date:** 2026-07-20

## Context

The brief requires the architecture to "support Email, WhatsApp, Push later" while shipping
nothing but in-app notifications for MVP. Same shape of problem as [ADR 0005](0005-payments-mocked-with-razorpay-adapter.md).

## Decision

A single internal interface, `NotificationChannel` (`send(user_id, template, payload)`), is
implemented in MVP only by an `InAppNotificationChannel` that writes to a `notifications` table
rendered in-app (bell icon), plus a `MockSmsChannel` used solely for phone-verification OTP
(logs the OTP to server console / returns it in a dev-only API response — never sends a real SMS).

Every notification-worthy event (booking requested, accepted, rejected, message received, review
received) is dispatched through a single `notify()` call site keyed by event type + template, not
scattered `INSERT INTO notifications` calls, so adding `EmailChannel`, `WhatsAppChannel`, and
`PushChannel` later is additive registration, not a rewrite.

## Consequences

- No SMS/email provider account or cost required to demo or test the MVP.
- Notification templates are named/typed now (see `knowledge/business-rules.md#notification-events`)
  even though only one channel renders them, preventing ad-hoc string notifications from creeping
  in.
- Real OTP delivery, email, WhatsApp, and push are explicit fast-follows in
  [MVP Scope](../specs/mvp-scope.md), not silently assumed to already work.
