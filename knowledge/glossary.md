---
purpose: Canonical vocabulary for Nearo. If a term used elsewhere in the repo isn't here, add it — don't let two docs define the same word differently.
---

# Glossary

**Nearo** — project/product name (from the repo directory name). Working name for the MVP;
not a confirmed final brand.

**Owner** — a user currently offering one or more products for rent. Not a fixed account type:
any user can act as Owner for one product and Customer for another, simultaneously.

**Customer** — a user currently browsing or booking a product. See Owner — same account,
different hat.

**Guest** — an unauthenticated visitor. Can browse/search/view products, cannot book, chat, or
list.

**Listing / Product** — used interchangeably for the rentable item a user has created. "Listing"
in UI copy, "Product" in schema/code (matches the `products` table).

**Booking** — a confirmed or in-negotiation rental agreement between one Customer and one Owner
for one Product over a specific date range.

**Booking Request** — a Booking in `requested` status: Customer has asked, Owner has not yet
accepted or rejected.

**Launch City** — the single metro the MVP is seeded and marketed in. See
[ADR 0002](../decisions/0002-single-city-launch-scope.md). Not hardcoded into schema.

**Platform Fee / Commission** — the percentage of a booking's subtotal retained by Nearo. See
[ADR 0001](../decisions/0001-monetization-commission-model.md).

**Security Deposit** — a refundable (mock, MVP) amount held against damage/loss, separate from
the rental price. Released per the rules in [business-rules.md](business-rules.md).

**Verified User** — a user with confirmed email + confirmed phone. See
[ADR 0003](../decisions/0003-trust-verification-level.md). Not government-ID verified in MVP.

**Radius Search** — search filtered to products whose location is within N km of the searcher's
resolved location (GPS, manual city, or map pin). Default 5km, user-adjustable.

**Product Status** — the lifecycle state of a listing itself (Draft, Available, Booking
Requested, Booked, Rented, Returned, Hidden, Maintenance) — distinct from Booking Status, which
tracks one specific booking. See [mvp-scope.md](../specs/mvp-scope.md) for both state machines.
