---
purpose: Low-fidelity structural layout for every key screen — what's on the page and in what order/hierarchy, not visual design. Visual design (color, type, spacing) is design-tokens.md; this is purely layout. Component Tree turns these boxes into actual components.
---

# Nearo — Wireframes (Low-Fidelity)

**Status:** Draft v1 — Phase 4 deliverable
**Depends on:** [information-architecture.md](information-architecture.md), [user-flows.md](user-flows.md)

Text wireframes, desktop-first per design brief. `[ ]` = component placeholder, `~~~` = imagery.
Mobile notes are called out where the layout meaningfully reflows, not restated for every screen
(assume standard single-column stacking otherwise).

## Landing (`/`)

```
┌─────────────────────────────────────────────────────────────┐
│ [Logo]      [Explore]              [List your item] [Login] [Signup] │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│              "What do you need today?"                       │
│         [ Large search bar: keyword + location + Go ]        │
│         [ Trending: "camera" "drone" "tent" "drill" ]         │
│                                                               │
├─────────────── Bento Grid ────────────────────────────────────┤
│ [ Large: Nearby products near you (map+cards) ]  [ Popular    │
│                                                    category    │
│ [ Medium: Popular category 1 ~~~ ]                tile 2 ~~~ ]│
│ [ Medium: Popular category 2 ~~~ ] [ Small: How it works →]  │
│ [ Small: Recently listed carousel ~~~~~~~~~~~~~~~~~~~~~~~~~ ] │
├───────────────────────────────────────────────────────────────┤
│ How it works: [1. List/Find] → [2. Book] → [3. Meet & Rent]  │
├───────────────────────────────────────────────────────────────┤
│ Testimonials carousel: [ " " avatar, name, quote ] x3          │
├───────────────────────────────────────────────────────────────┤
│ CTA band: "Got something sitting idle? Start earning."        │
│ [List your item →]                                             │
├───────────────────────────────────────────────────────────────┤
│ Footer: categories | how it works | about | contact | legal   │
└───────────────────────────────────────────────────────────────┘
```

- Bento cells are unequal-sized cards in a CSS grid (not a uniform card wall) — this is the one
  page where the "no generic cards" design principle matters most since it's the first
  impression.
- Empty-state variant: if launch-city seed data is thin, "Nearby products" cell falls back to
  "Recently listed" content rather than showing an empty map.

## Explore / Search Results (`/explore`)

```
┌───────────────────────────────────────────────────────────────┐
│ [Logo]  [Search bar - persistent, compact]      [icons...]    │
├───────────────────────────────────────────────────────────────┤
│ [Category chips: All | Cameras | Tools | Outdoor | ... ]      │
├───────────┬───────────────────────────────────────────────────┤
│ Filters   │  Sort: [Newest ▾]      12,482 results near you    │
│ sidebar   │  ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐          │
│ - Price   │  │ ~~~   │ │ ~~~   │ │ ~~~   │ │ ~~~   │          │
│ - Distance│  │ Title │ │ Title │ │ Title │ │ Title │          │
│ - Dates   │  │ ★4.8  │ │ ★4.9  │ │ ★New  │ │ ★4.7  │          │
│ - Rating  │  │ ₹/day │ │ ₹/day │ │ ₹/day │ │ ₹/day │          │
│ - Condition│  └───────┘ └───────┘ └───────┘ └───────┘          │
│           │  (grid continues, 4 columns desktop)              │
│           │  [ Pagination / infinite scroll ]                  │
└───────────┴───────────────────────────────────────────────────┘
```

- No-results empty state: illustration + "No products match yet — widen your radius or be the
  first to list one" with a CTA into Create Listing (turns a dead end into a supply-side hook).
- Mobile: filters sidebar collapses into a "Filters" button opening a bottom sheet; grid becomes
  2 columns.

## Product Details (`/listing/[id]`)

```
┌───────────────────────────────────────────────────────────────┐
│ [Logo]  [Search]                                [icons...]    │
├───────────────────────────────────────────────────────────────┤
│ ~~~~~~~~~~~~~~~~~~ Image gallery (cover + thumbnails) ~~~~~~~ │
├───────────────────────────────┬─────────────────────────────┤
│ Title                          │ ₹ price/day                 │
│ Category > Subcategory · Condition│ [ Request to Book ▸ ]     │
│ [Owner mini-card: avatar,      │ Deposit: ₹___                │
│  name, ★rating, verified badge]│ Min/max rental: __ days       │
│                                 │ [ Availability calendar ]    │
│ Description                    │                              │
│                                 │                              │
│ Details: brand, model, pickup/  │                              │
│ delivery options                │                              │
│                                 │                              │
│ [ Message Owner ]               │                              │
├─────────────────────────────────┴─────────────────────────────┤
│ Reviews (★4.8, 23 reviews) — list of review cards               │
├───────────────────────────────────────────────────────────────┤
│ Similar nearby listings — carousel                              │
└───────────────────────────────────────────────────────────────┘
```

- Sticky right-column booking card on scroll (desktop); on mobile, condenses to a sticky bottom
  bar with price + "Request to Book".

## Booking Request (`/listing/[id]/book`)

```
┌───────────────────────────────────────────────────────────────┐
│ ← Back to listing                                              │
│ [ Listing mini-summary: thumbnail, title, price/day ]           │
├───────────────────────────────────────────────────────────────┤
│ [ Calendar: select start/end date, blocked dates greyed ]       │
├───────────────────────────────────────────────────────────────┤
│ Price breakdown card:                                           │
│   Rental (n days × ₹/day)             ₹______                  │
│   Security deposit (refundable)       ₹______                  │
│   ─────────────────────────────────────────                    │
│   Total due now (mock payment)        ₹______                  │
├───────────────────────────────────────────────────────────────┤
│ [ Add a note to the owner (optional) ]                          │
│ [ Request to Book → ]                                            │
└───────────────────────────────────────────────────────────────┘
```

## My Bookings (`/bookings`)

```
┌───────────────────────────────────────────────────────────────┐
│ Tabs: [ Requested ] [ Upcoming ] [ Active ] [ Past ] [ Cancelled]│
├───────────────────────────────────────────────────────────────┤
│ [ Booking row: thumbnail | title | dates | status pill | → ]    │
│ [ Booking row: ... ]                                            │
├───────────────────────────────────────────────────────────────┤
│ Empty state (per tab): illustration + "No upcoming rentals yet  │
│ — go find something to rent" [Explore →]                        │
└───────────────────────────────────────────────────────────────┘
```

## Owner Dashboard (`/owner`)

```
┌───────────────────────────────────────────────────────────────┐
│ [Switch to renting]      Dashboard  Listings  Requests  Earnings│
├───────────────────────────────────────────────────────────────┤
│ [ Stat tile: Active listings ] [ Stat tile: Pending requests ] │
│ [ Stat tile: This month earnings (mock) ] [ Stat tile: Rating ]│
├───────────────────────────────────────────────────────────────┤
│ Pending requests needing response                                │
│ [ row: customer, listing, dates, [Accept] [Reject] ]             │
├───────────────────────────────────────────────────────────────┤
│ Upcoming rentals                                                 │
│ [ row: listing, customer, start date ]                            │
└───────────────────────────────────────────────────────────────┘
```

- First-time owner empty state (zero listings): full-width illustrated prompt replaces the stat
  tiles entirely — "List your first item in under 5 minutes" — rather than showing four zero
  tiles, which reads as broken/dead rather than inviting.

## Create Listing (`/owner/listings/new`)

```
┌───────────────────────────────────────────────────────────────┐
│ Step 1 of 7   [●●○○○○○]                                        │
├───────────────────────────────────────────────────────────────┤
│  (form fields for current step, per user-flows.md §5)          │
│                                                                 │
├───────────────────────────────────────────────────────────────┤
│                                   [ Back ]        [ Continue → ]│
└───────────────────────────────────────────────────────────────┘
```

- Right-hand live preview panel (desktop only) shows the listing card as it will appear in
  search, updating as fields are filled — reinforces "this is what customers will see."

## Admin Dashboard (`/admin`)

```
┌──────────────┬──────────────────────────────────────────────┐
│ Sidebar:     │  Snapshot cards: New users (7d) | New listings │
│ Dashboard    │  (7d) | Bookings in flight | Open reports      │
│ Users        ├──────────────────────────────────────────────┤
│ Listings     │  Recent activity feed (latest bookings, flags) │
│ Categories   ├──────────────────────────────────────────────┤
│ Bookings     │  [ Quick link: Open Reports Queue → ]           │
│ Reports      │                                                │
│ Analytics    │                                                │
└──────────────┴──────────────────────────────────────────────┘
```

All `/admin/*` sub-pages follow the same sidebar shell with a data table (search, filter,
row-level actions) in the content area — one shared layout component, not bespoke per page.

## Open Questions

None blocking Component Tree.
