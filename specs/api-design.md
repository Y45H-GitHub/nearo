---
purpose: Every server-side operation that isn't a plain RLS-guarded read — what it's called, what it does, who can call it, and which tier (per ADR 0007) it lives in. Code should implement exactly this list, not invent additional endpoints ad hoc.
---

# Nearo — API Design

**Status:** Draft v1 — Phase 7 deliverable
**Depends on:** [database-schema.md](database-schema.md),
[decisions/0007](../decisions/0007-server-actions-vs-route-handlers-vs-direct-queries.md)

## 1. Direct Supabase Queries (no custom code — RLS is the only gate)

These are listed for completeness, not because they need designing — they're a `select`/simple
`insert`/`update` against one table, fully covered by the RLS summary in
[database-schema.md §6](database-schema.md#6-row-level-security--summary).

| Operation | Table(s) |
|---|---|
| Browse/search listings | `products` (+ join `product_images`, `categories`) |
| View product detail | `products`, `product_images`, `reviews`, `profiles` (owner) |
| View/edit own profile | `profiles` |
| View public profile | `profiles` (public columns) |
| Toggle wishlist | `wishlists` |
| View wishlist | `wishlists` + `products` |
| View booking list/detail | `bookings` (own rows only, per RLS) |
| View/send message (once thread exists) | `messages`, `message_threads` |
| View notifications, mark read | `notifications` |
| View categories | `categories` |

## 2. Server Actions

Every action re-validates permissions server-side even though RLS is a backstop — the reasons
listed below (multi-table writes, cross-table checks) are exactly why RLS alone isn't sufficient.

| Action | Location | Does | Who |
|---|---|---|---|
| `signUp(email, password)` | `features/auth/actions` | Creates `auth.users` + `profiles` row (city defaulted to launch city) | Guest |
| `verifyPhone(otp)` | `features/auth/actions` | Validates OTP against `MockSmsChannel`-issued code, sets `profiles.phone_verified_at` | Auth |
| `resendOtp()` | `features/auth/actions` | Re-dispatches via `MockSmsChannel` | Auth |
| `createListing(formData)` | `features/listings/actions` | Validates (zod), inserts `products` row as `draft`, uploads images to Storage, inserts `product_images` | Verified |
| `publishListing(productId)` | `features/listings/actions` | Checks ownership, requires ≥1 image + all required fields, sets `status = 'available'`, `published_at = now()` | Verified, owner |
| `updateListing(productId, formData)` | `features/listings/actions` | Checks ownership, updates `products`/`product_images` | Verified, owner |
| `pauseListing(productId)` / `resumeListing(productId)` | `features/listings/actions` | Ownership check, toggles `status` `available ⇄ hidden` — **blocked** if a booking is currently `accepted`/`active` for it (can't pull a listing out from under a confirmed renter) | Verified, owner |
| `deleteListing(productId)` | `features/listings/actions` | Ownership check; **blocked** if any non-terminal booking exists; otherwise cascades per schema | Verified, owner |
| `requestBooking(productId, dates, note)` | `features/bookings/actions` | Validates dates against `min/max_rental_days` and `availability_blocks` (re-checked server-side against the `EXCLUDE` constraint — the constraint is the real guarantee, this is the friendly error path), snapshots `subtotal_amount`/`deposit_amount`, inserts `bookings` row, calls `notify('booking_requested')` | Verified |
| `acceptBooking(bookingId)` | `features/bookings/actions` | Ownership check (must own the product), sets `status = 'accepted'`, snapshots `platform_fee_rate`/`platform_fee_amount`/`owner_payout_amount` from `platform_settings`, inserts `availability_blocks` row (`reason='booking'`), calls `MockPaymentProvider.capture()` + `release_deposit` hold, inserts `payments` rows, calls `notify('booking_accepted')` | Verified, owner |
| `rejectBooking(bookingId, reason?)` | `features/bookings/actions` | Ownership check, sets `status='rejected'`, calls `notify('booking_rejected')` | Verified, owner |
| `cancelBooking(bookingId, reason?)` | `features/bookings/actions` | Participant check (customer or owner), applies the ≥24h/<24h/owner-initiated branch from [business-rules.md](../knowledge/business-rules.md#cancellation--deposit), removes the `availability_blocks` row if present, inserts refund `payments` row, calls `notify('booking_cancelled')` | Verified, participant |
| `markReturned(bookingId, damageReported: boolean)` | `features/bookings/actions` | Owner (or customer — either can confirm return) sets `status='returned'` or `'disputed'`; if `returned`, inserts deposit-release `payments` row; if `disputed`, calls `notify('dispute_opened')` to admin + both parties | Verified, participant |
| `resolveDispute(bookingId, outcome, notes)` | `features/admin/actions` | Sets booking to `returned` or `cancelled`, records admin notes, `resolved_by` | Admin |
| `submitReview(bookingId, rating, comment)` | `features/reviews/actions` | Checks booking status is `returned`/`disputed`-resolved/`completed` and reviewer is a participant who hasn't reviewed yet; inserts `reviews` row; trigger recomputes `profiles.rating_avg`/`rating_count` | Verified, participant |
| `startThread(productId)` / `sendMessage(threadId, body)` | `features/messaging/actions` | Creates or reuses the `(product_id, customer_id)` thread; inserts `messages`; updates `last_message_at`; calls `notify('message_received')` | Verified |
| `resolveReport(reportId, outcome)` / `suspendUser(userId)` / `hideListing(productId)` | `features/admin/actions` | Admin moderation actions | Admin |
| `updateCategory(...)` / `createCategory(...)` | `features/admin/actions` | Category CRUD | Admin |

## 3. Route Handlers (`app/api/`)

Kept deliberately small — see [ADR 0007](../decisions/0007-server-actions-vs-route-handlers-vs-direct-queries.md)
for why these specifically don't fit the Server Action tier.

| Route | Method | Does | Who |
|---|---|---|---|
| `/api/bookings/[id]/transition` | `POST` | Lazy time-based status check: if `accepted` and `start_date <= today`, flips to `active`; if `active` and `end_date < today`, flips to `returned` (pending). Called from a client-side effect when a booking detail/list page loads — see resolution to the open question below. | Verified, participant (or unauthenticated cron-style call with a service secret, if a scheduled job is added later) |
| `/api/webhooks/razorpay` | `POST` | **Not implemented in MVP** — stubbed route returning 404, reserved path so the Razorpay fast-follow ([ADR 0005](../decisions/0005-payments-mocked-with-razorpay-adapter.md)) has a known home | N/A |

### Resolved: lazy status-transition mechanism

[user-flows.md](user-flows.md) flagged this as needing a concrete decision. Decision: **client-
triggered, not cron-based**, for MVP. Any page that renders a booking whose status could be stale
(`accepted` or `active`) calls `/api/bookings/[id]/transition` once on mount before rendering
status-dependent UI. This avoids standing up a scheduled job for the MVP timeframe at the cost of
a status only updating when someone actually looks at it — acceptable since no MVP feature (e.g.
no automated reminder email) currently depends on the transition happening at the exact moment it
becomes true. A real cron/scheduled Edge Function is the fast-follow if that assumption breaks.

## 4. Error Handling Convention

All Server Actions return a discriminated result (`{ ok: true, data }` | `{ ok: false, error:
{ code, message } }`) rather than throwing — form UIs render `error.message` inline, never a
generic toast-only failure. Route Handlers return standard HTTP status + `{ error: { code,
message } }` JSON body. Error `code`s are a fixed enum (e.g. `UNVERIFIED`, `DATE_CONFLICT`,
`NOT_OWNER`, `INVALID_TRANSITION`) defined once in `lib/validation/errors.ts`, not ad hoc strings
per call site.

## Open Questions

None blocking Implementation Plan.
