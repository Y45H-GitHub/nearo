---
purpose: The definitive in/out line for the MVP, plus the two state machines every booking/listing feature must obey. When in doubt about whether to build something, this file wins.
---

# MVP Scope

Companion to [prd.md](prd.md). The PRD says *why* and *for whom*; this file says *exactly what
ships in the first cut*, so implementation never silently expands scope.

## Feature Matrix

Legend: ✅ MVP · 🔜 Fast-follow (designed for, not built) · ❌ Explicitly out of scope for now

| Area | Feature | Status |
|---|---|---|
| **Auth** | Email + password signup/login | ✅ |
| | Google OAuth | ✅ |
| | Email verification | ✅ |
| | Phone OTP verification | ✅ (mocked SMS, see [ADR 0006](../decisions/0006-notifications-mocked-multi-channel-adapter.md)) |
| | Government ID / KYC | 🔜 ([ADR 0003](../decisions/0003-trust-verification-level.md)) |
| **Discovery** | Keyword search | ✅ |
| | Category/subcategory filter | ✅ |
| | Price, distance, condition, rating filters | ✅ |
| | Availability-date filter | ✅ |
| | Map picker for location | ✅ |
| | Sort: newest, popular, price, distance | ✅ |
| | Personalized ranking/recommendations | ❌ |
| **Listings** | Create/edit/delete/pause listing | ✅ |
| | Up to 10 images + cover image | ✅ |
| | Availability calendar (owner-blocked dates) | ✅ |
| | Auto-generated availability from bookings | ✅ |
| | Bulk listing import/CSV | ❌ |
| | Featured/boosted listings (paid) | 🔜 |
| **Booking** | Request → accept/reject → confirmed flow | ✅ |
| | Fixed cancellation policy | ✅ ([ADR 0004](../decisions/0004-cancellation-deposit-policy.md)) |
| | Owner-configurable cancellation tiers | 🔜 |
| | Calendar conflict prevention | ✅ |
| | Multi-item cart / single checkout for several products | ❌ |
| **Payments** | Mock payment + mock deposit hold/release | ✅ ([ADR 0005](../decisions/0005-payments-mocked-with-razorpay-adapter.md)) |
| | Real Razorpay integration | 🔜 |
| | Owner payouts (real bank transfer) | 🔜 |
| **Chat** | 1:1 text messaging per booking/listing thread | ✅ (polling or Supabase Realtime, not required to feel "true" realtime) |
| | Image sharing in chat | 🔜 |
| | Typing indicators / read receipts | ❌ |
| **Reviews** | Post-booking mutual review (rating + text) | ✅ |
| | Double-blind review reveal window | 🔜 |
| | Review photos | ❌ |
| **Notifications** | In-app notification center | ✅ |
| | Email notifications | 🔜 |
| | WhatsApp notifications | 🔜 |
| | Push notifications | 🔜 |
| **Owner tools** | Dashboard (listings, bookings, earnings summary) | ✅ |
| | Mock earnings page (gross/fee/net) | ✅ |
| | Payout history / statements | 🔜 |
| **Admin** | Users, listings, categories, bookings management | ✅ |
| | Reports/flag queue + manual dispute resolution | ✅ |
| | Analytics dashboard (charts) | ✅ (basic counts/trends only, not a BI tool) |
| | Fraud/risk scoring | ❌ |
| **Trust & Safety** | Report listing/user | ✅ |
| | Automated content moderation (image/text) | ❌ |
| **Geography** | Single launch city, radius search | ✅ ([ADR 0002](../decisions/0002-single-city-launch-scope.md)) |
| | Multi-city switcher | 🔜 |

## Booking State Machine

```
requested ──(owner accepts)──► accepted ──(rental start date reached)──► active
   │                               │
   │(owner rejects)                │(owner or customer cancels, per business-rules.md)
   ▼                               ▼
rejected                       cancelled

active ──(rental end date reached / owner marks returned)──► returned ──(review window)──► completed
   │
   │(damage/dispute flagged by either party)
   ▼
disputed ──(admin resolves)──► returned or cancelled
```

Rules governing each transition live in
[business-rules.md § Cancellation & Deposit](../knowledge/business-rules.md#cancellation--deposit) —
this diagram is the shape, that file is the authority on the conditions.

## Product (Listing) Status Lifecycle

```
draft ──(owner publishes)──► available ──(customer requests booking)──► booking_requested
                                  ▲                                            │
                                  │                                (owner rejects)
                                  └────────────────────────────────────────────┘

booking_requested ──(owner accepts)──► booked ──(rental start date reached)──► rented
                                                                                   │
                                                                        (rental end + returned)
                                                                                   ▼
                                                                              available

available/booked/rented ──(owner pauses)──► hidden ──(owner resumes)──► available
any status ──(admin/owner flags issue)──► maintenance ──(cleared)──► available
```

Note: a product with **multiple future availability windows** can be simultaneously `available`
for some dates and have a `booking_requested`/`booked` sub-range for others — the status column
reflects the *nearest-term* state; per-date availability is tracked in the `availability` table,
not by overloading product-level status into a calendar. See [prd.md](prd.md) and the upcoming
Database Schema deliverable for how this is modeled.

## Explicitly Deferred Business Rules (not decided, not needed for MVP)

- Category-specific verification requirements (e.g. higher trust bar for electronics/vehicles).
- Insurance / damage-protection add-on products.
- Multi-currency (MVP is INR-only, single market).
- Owner payout scheduling (weekly/instant) — irrelevant while payments are mocked.

If any of these become blocking during implementation, stop and raise it — do not silently decide
it inline.
