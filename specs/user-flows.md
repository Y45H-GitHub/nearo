---
purpose: Step-by-step flows for every core journey, including edge/failure branches. Wireframes and Component Tree are built to satisfy these flows — if a flow changes, those two documents need re-checking.
---

# Nearo — User Flows

**Status:** Draft v1 — Phase 3 deliverable
**Depends on:** [prd.md](prd.md), [information-architecture.md](information-architecture.md),
[knowledge/business-rules.md](../knowledge/business-rules.md)

Status/role names used below match [mvp-scope.md](mvp-scope.md) and
[database-schema.md](database-schema.md) exactly — don't paraphrase them elsewhere.

## 1. Signup & Verification

```mermaid
flowchart TD
  A[Guest lands on / or /signup] --> B{Signup method}
  B -->|Email+Password| C[Enter email/password]
  B -->|Google OAuth| D[Google consent screen]
  C --> E[Account created, email confirmation sent]
  D --> F[Account created, email pre-verified by Google]
  E --> G[User clicks email confirmation link]
  G --> H[email_verified]
  F --> H
  H --> I[Prompted for phone number]
  I --> J[OTP sent - mocked SMS, ADR 0006]
  J --> K[User enters OTP]
  K --> L{Correct?}
  L -->|Yes| M[phone_verified -> profiles.is_verified = true]
  L -->|No, 3 attempts| N[Resend OTP]
  M --> O[Land on Explore, verified badge active]
```

- Phone verification is **not** forced immediately at signup — a user can browse fully unverified.
  It's only enforced as a soft gate at the two action points that need it: submitting a booking
  request and publishing a listing (see [ADR 0003](../decisions/0003-trust-verification-level.md)).
- If a user reaches the Book or Publish action unverified, the OTP step above is triggered inline
  from wherever they are, then returns them to that action — never a full-page redirect.

## 2. Discover → Book (core journey)

```mermaid
flowchart TD
  A[Landing: hero search] --> B[/explore results/]
  B --> C[Apply filters: category, price, distance, availability, rating]
  C --> D[Open /listing/id]
  D --> E{Verified?}
  E -->|No| F[Inline verify prompt]
  F --> E
  E -->|Yes| G[/listing/id/book: pick dates/]
  G --> H{Dates available?}
  H -->|No, conflicts with existing booking or owner block| I[Show conflict, suggest nearest open range]
  I --> G
  H -->|Yes| J[Price breakdown shown: subtotal, deposit, platform fee note]
  J --> K[Submit booking request]
  K --> L[Booking status: requested]
  L --> M[Owner notified - booking_requested]
  M --> N[Customer sees booking in /bookings, status: requested]
```

- Availability conflict check happens both client-side (calendar greys out blocked dates from
  `availability_blocks`) and server-side at submission (race condition: two customers requesting
  overlapping dates simultaneously) — server is authoritative, per
  [api-design.md](api-design.md).
- Platform fee is **shown as a note, not itemized as a separate line the customer pays** — the fee
  is deducted from the owner's payout, not added on top of the customer's price, per
  [ADR 0001](../decisions/0001-monetization-commission-model.md). The price breakdown customer
  sees is: rental subtotal + security deposit = total to pay (mock).

## 3. Owner Responds to a Booking Request

```mermaid
flowchart TD
  A[Owner notified: booking_requested] --> B[/owner/bookings - pending tab/]
  B --> C[Open booking detail]
  C --> D{Decision}
  D -->|Accept| E[Status -> accepted]
  D -->|Reject| F[Status -> rejected, optional reason]
  E --> G[availability_blocks row created for date range]
  G --> H[Customer notified: booking_accepted]
  F --> I[Customer notified: booking_rejected]
  E --> J[Deposit + rental charge captured - mock, ADR 0005]
```

- No response within 24h is tracked against the owner's `response_rate` (see
  [prd.md § Risks](prd.md#11-risks)) but does **not** auto-expire the request in MVP — auto-expiry
  is a named fast-follow, not silently built now.

## 4. Rental Lifecycle & Cancellation

```mermaid
flowchart TD
  A[accepted] --> B{Start date reached?}
  B -->|Yes| C[active - system flips status via scheduled check or on-view lazy transition]
  A -->|Customer cancels >= 24h before start| D[cancelled - full refund, no fee]
  A -->|Customer cancels < 24h before start| E[cancelled - refund, platform fee retained]
  A -->|Owner cancels| F[cancelled - customer never charged]
  C --> G{End date reached / owner marks returned}
  G -->|No damage flagged| H[returned -> deposit released]
  G -->|Damage/dispute flagged| I[disputed]
  I --> J[Admin resolves: outcome = returned or cancelled]
  H --> K[Review window opens for both parties]
  K --> L[completed]
```

- Exact conditions for each transition are the single-source rules in
  [business-rules.md § Cancellation & Deposit](../knowledge/business-rules.md#cancellation--deposit) —
  this diagram is shape only.
- "System flips status" for `accepted → active` and `active → returned` (time-based) is a lazy
  transition computed on read in MVP (no cron job) — see
  [api-design.md](api-design.md) for where that check lives.

## 5. Owner Creates a Listing

```mermaid
flowchart TD
  A[/owner/listings/new/] --> B{Verified?}
  B -->|No| C[Inline verify prompt]
  C --> B
  B -->|Yes| D[Step 1: Title, description, category/subcategory]
  D --> E[Step 2: Condition, brand, model]
  E --> F[Step 3: Price/day, deposit, min/max rental days]
  F --> G[Step 4: Location - map pin or address search, visibility radius]
  G --> H[Step 5: Pickup / owner-delivery options]
  H --> I[Step 6: Upload up to 10 images, mark one cover]
  I --> J[Step 7: Initial availability - block any known-unavailable dates]
  J --> K[Review summary]
  K --> L{Publish now or save draft?}
  L -->|Publish| M[status: available]
  L -->|Save draft| N[status: draft]
```

- Every step is saved incrementally (draft row created on Step 1 submit) so a user who abandons
  partway can resume — no client-only wizard state that vanishes on refresh.
- Edit Listing reuses this exact same step form pre-filled, not a separate simplified form.

## 6. Messaging

```mermaid
flowchart TD
  A[Customer viewing /listing/id] --> B[Message Owner button]
  B --> C{Existing thread for this product+customer?}
  C -->|Yes| D[Open existing thread]
  C -->|No| E[Create thread, product_id set, booking_id null]
  E --> D
  D --> F[Send messages]
  F --> G{Booking later created from this context?}
  G -->|Yes| H[Thread.booking_id backfilled to link conversation to booking]
  G -->|No| F
```

- One thread per (customer, product) pair covers both the pre-booking inquiry and the
  post-acceptance conversation — no second thread spawned when a booking is created, so context
  isn't lost. See `message_threads` unique constraint in
  [database-schema.md](database-schema.md).

## 7. Dispute Resolution (Admin)

```mermaid
flowchart TD
  A[Either party flags damage/issue on return] --> B[Booking -> disputed]
  B --> C[Admin notified: dispute_opened]
  C --> D[/admin/reports - queue/]
  D --> E[Admin reviews booking, messages, both profiles]
  E --> F{Resolution}
  F -->|No fault found| G[Booking -> returned, deposit released]
  F -->|Fault confirmed| H[Booking -> cancelled equivalent outcome, admin notes deposit outcome manually]
  G --> I[Both parties notified]
  H --> I
```

- MVP has **no automated partial-deposit-forfeiture math** — admin resolution is a manual
  judgment call recorded as notes, per [ADR 0004](../decisions/0004-cancellation-deposit-policy.md).
  Building an automated adjudication engine is explicitly out of scope.

## Open Questions

None blocking Wireframes. The lazy status-transition mechanism (§4, §3) needs a concrete
implementation decision in API Design — flagged there, not decided here.
