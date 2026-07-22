---
purpose: Single source of truth for business rules referenced by code, schema, and other docs. Rules live here once; other docs link to this file instead of restating them.
---

# Business Rules

These rules are binding on implementation. If code needs to deviate, update this file first (and
add/amend an ADR if the deviation is a real business-rule change, not a bug fix).

## Monetization

- Platform fee rate: **12%** of booking subtotal (config value, not hardcoded per-booking —
  see `platform_fee_rate` snapshot rule below).
- The rate is **snapshotted onto the booking** (`bookings.platform_fee_rate`) at the moment the
  booking is accepted, so later global-rate changes never retroactively alter historical bookings.
- Owner payout (mock) = `subtotal_amount − platform_fee_amount`. Deposit is never part of payout —
  it is held and released separately.
- Full rationale: [ADR 0001](../decisions/0001-monetization-commission-model.md).

## Trust & Verification

- A user must have verified email **and** verified phone before they can: create a listing,
  submit a booking request, or send a chat message.
- No government ID / KYC step exists in MVP. `id_verification_status` exists in schema, always
  `null`/unused in MVP.
- Full rationale: [ADR 0003](../decisions/0003-trust-verification-level.md).

## Cancellation & Deposit

- Customer cancels **≥ 24h before rental start** → booking → `cancelled`; deposit released in
  full; no platform fee charged.
- Customer cancels **< 24h before rental start** → booking → `cancelled`; deposit released in
  full; platform fee **is retained** (mock) as a no-show deterrent.
- Owner rejects a `requested` booking → booking → `rejected`; no charges either side.
- Owner cancels an already-`accepted`/`booked` booking → booking → `cancelled`; customer is
  never charged; owner's `cancellation_count` on `profiles` increments (stored only, not yet
  acted on in MVP).
- Booking reaches `returned` with no damage flagged → deposit released automatically (mock).
- Damage/dispute flagged by either party on return → booking → `disputed`; resolution is manual
  (admin marks resolution + deposit outcome); no automated partial-forfeiture calculation in MVP.
- Full rationale: [ADR 0004](../decisions/0004-cancellation-deposit-policy.md).

## Search & Location

- Default search radius: **5km**. User-adjustable, no fixed max in MVP UI (reasonable upper
  bound enforced server-side, e.g. 50km, to keep queries cheap).
- Location resolution priority when a customer searches: explicit map pin/address search >
  GPS (if permitted) > manually-set city on profile > launch-city default.

## Notification Events

Every one of these fires exactly one `notify()` call (see
[ADR 0006](../decisions/0006-notifications-mocked-multi-channel-adapter.md)); this list is the
contract other docs and code should reference rather than re-deriving trigger points.

| Event | Recipient | Template key |
|---|---|---|
| Booking requested | Owner | `booking_requested` |
| Booking accepted | Customer | `booking_accepted` |
| Booking rejected | Customer | `booking_rejected` |
| Booking cancelled | the other party | `booking_cancelled` |
| Rental starting tomorrow | both parties | `rental_starting_soon` |
| Rental ended / return due | both parties | `rental_return_due` |
| New chat message | recipient | `message_received` |
| New review received | reviewee | `review_received` |
| Dispute opened | admin + both parties | `dispute_opened` |

## Reviews

- A review can only be written once the linked booking reaches `returned` (or `disputed` →
  resolved).
- Both parties review each other independently; neither review is visible to the other party
  until both are submitted or 14 days pass (prevents retaliatory review editing) — MVP note: this
  double-blind window is a nice-to-have, not a hard MVP requirement; see
  [mvp-scope.md](../specs/mvp-scope.md) for its in/out status.
