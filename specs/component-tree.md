---
purpose: The React component hierarchy per page, and the shared/primitive component inventory those pages draw from. Naming here is what gets typed into the codebase — keep it in sync with folder-structure.md's features/*/components directories.
---

# Nearo — Component Tree

**Status:** Draft v1 — Phase 5 deliverable
**Depends on:** [wireframes.md](wireframes.md), [design-tokens.md](design-tokens.md),
[folder-structure.md](folder-structure.md)

## 1. Shared Primitives (`components/ui` — shadcn, lightly themed)

`Button`, `Input`, `Textarea`, `Select`, `Checkbox`, `RadioGroup`, `Dialog`, `Sheet` (mobile bottom
sheets), `Popover`, `DropdownMenu`, `Tabs`, `Badge`, `Avatar`, `Calendar`, `Skeleton`, `Toast`,
`Tooltip`, `Separator`, `Card`.

## 2. Shared Feature-Agnostic Components (`components/shared`)

| Component | Used by | Notes |
|---|---|---|
| `EmptyState` | Wishlist, Bookings, Owner Listings, Explore (no results), Admin tables | Props: `illustration`, `title`, `description`, `action?`. One component, every empty state in the product routes through it — see [prd.md § Design Principles](prd.md#10-design-principles). |
| `StatusPill` | Booking rows, Product cards (owner view), Admin tables | Props: `status: BookingStatus \| ProductStatus`. Color mapping is exactly the table in [design-tokens.md § Color](design-tokens.md#2-color) — do not re-derive colors inline anywhere else. |
| `RatingStars` | Product cards, Product Details, Reviews, Public Profile | Props: `value`, `count?`, `size`. |
| `VerifiedBadge` | Owner mini-card, Public Profile, Message thread header | Renders only if `is_verified` — see [database-schema.md](database-schema.md#profiles). |
| `SearchBar` | Landing (hero variant), Explore (compact variant) | One component, `variant: "hero" \| "compact"` prop — not two components, per the Explore/Search merge decision in [information-architecture.md §1](information-architecture.md#1-ia-decisions-worth-flagging). |
| `MapPicker` | Create/Edit Listing (Step 4), Explore filters (radius) | Wraps whatever map library is chosen in Implementation Plan; interface is `{ lat, lng, radiusKm, onChange }` so the underlying provider is swappable. |
| `AvailabilityCalendar` | Product Details, Booking Request, Create/Edit Listing | Props: `blockedRanges`, `mode: "view" \| "select" \| "block-edit"` — one calendar component reused across all three contexts, not three bespoke calendars. |
| `StatTile` | Owner Dashboard, Admin Dashboard | Props: `label`, `value`, `trend?`. |
| `DataTable` | All `/admin/*` list pages | Generic: `columns`, `rows`, `onRowAction` — Admin's one shared table, per [wireframes.md](wireframes.md#admin-dashboard-admin). |
| `PriceBreakdown` | Booking Request, Booking Detail | Props: `subtotalAmount`, `depositAmount`, `platformFeeAmount?` (owner view only, per [user-flows.md §2](user-flows.md#2-discover--book-core-journey)). |

## 3. Page-Level Trees

Only non-obvious composition is expanded; primitive leaves (Button, Input) are omitted for
brevity.

### Landing (`/`)
```
LandingPage
├── MarketingHeader
├── HeroSearch (SearchBar variant="hero")
│   └── TrendingSearchChips
├── BentoGrid
│   ├── NearbyProductsCell (mini-map + ListingCard[])
│   ├── PopularCategoryCell × 2
│   ├── HowItWorksCell
│   └── RecentlyListedCarousel (ListingCard[])
├── HowItWorksSection
├── TestimonialCarousel
├── CtaBand
└── MarketingFooter
```

### Explore (`/explore`)
```
ExplorePage
├── SearchBar (variant="compact")
├── CategoryChipRow
├── FilterSidebar (desktop) / FilterSheet (mobile)
│   ├── PriceRangeFilter
│   ├── DistanceFilter
│   ├── DateAvailabilityFilter
│   ├── RatingFilter
│   └── ConditionFilter
├── SortSelect
├── ListingGrid
│   └── ListingCard[] (thumbnail, title, rating, price, distance, VerifiedBadge if owner verified)
└── EmptyState (no results variant, with "List yours" CTA)
```

### Product Details (`/listing/[id]`)
```
ProductDetailsPage
├── ImageGallery
├── ProductHeader (title, category/subcategory, StatusPill if owner viewing own draft/hidden)
├── OwnerMiniCard (Avatar, name, RatingStars, VerifiedBadge, link to /users/[id])
├── ProductDescription
├── ProductSpecs (brand, model, pickup/delivery)
├── MessageOwnerButton
├── BookingSidebar (sticky)
│   ├── PriceDisplay
│   ├── AvailabilityCalendar (mode="view")
│   └── RequestToBookButton (routes to /listing/[id]/book; triggers VerifyPrompt inline if unverified)
├── ReviewList (RatingStars, review cards)
└── SimilarListingsCarousel
```

### Booking Request (`/listing/[id]/book`)
```
BookingRequestPage
├── ListingSummaryStrip
├── AvailabilityCalendar (mode="select")
├── PriceBreakdown
├── NoteToOwnerTextarea
└── SubmitRequestButton → requestBooking action
```

### My Bookings (`/bookings`)
```
MyBookingsPage
├── Tabs (Requested / Upcoming / Active / Past / Cancelled)
└── BookingRow[] (thumbnail, title, dates, StatusPill, link to /bookings/[id])
    └── EmptyState (per-tab variant)
```

### Booking Detail (`/bookings/[id]`)
```
BookingDetailPage
├── BookingSummaryCard (product, dates, StatusPill)
├── PriceBreakdown
├── OwnerMiniCard (link to thread)
├── ActionBar (Cancel — conditional on business-rules.md eligibility; Message Owner)
└── ReviewForm (shown only when status is returned/completed and reviewer hasn't submitted yet)
```

### Owner Dashboard (`/owner`)
```
OwnerDashboardPage
├── OwnerNav (Dashboard / Listings / Requests / Earnings tabs — desktop header variant)
├── StatTile[] (Active listings, Pending requests, This month earnings, Rating)
│   — replaced entirely by EmptyState (first-listing prompt) if owner has zero listings
├── PendingRequestsList
│   └── BookingRow[] with Accept/Reject inline actions
└── UpcomingRentalsList
```

### Create/Edit Listing (`/owner/listings/new`, `/owner/listings/[id]/edit`)
```
ListingFormPage
├── StepIndicator
├── ListingFormStep (one of: Basics, Condition, Pricing, Location, Delivery, Images, Availability, Review)
│   — same component, `step` prop switches which field group renders
├── LivePreviewPanel (desktop only — renders ListingCard with current form state)
└── StepNav (Back / Continue / Publish / Save Draft)
```

### Admin Dashboard + sub-pages
```
AdminLayout
├── AdminSidebar
└── {page content}
    ├── AdminDashboardPage → StatTile[] + ActivityFeed
    ├── AdminUsersPage → DataTable (columns: name, email, verified, joined, actions: suspend)
    ├── AdminListingsPage → DataTable (columns: title, owner, status, actions: hide/view)
    ├── AdminCategoriesPage → DataTable + CategoryForm (Dialog)
    ├── AdminBookingsPage → DataTable (columns: product, customer, owner, status, dates)
    ├── AdminReportsPage → DataTable (columns: target, reporter, reason, status, actions: resolve/dismiss)
    └── AdminAnalyticsPage → StatTile[] + basic trend charts (per mvp-scope.md, counts/trends only)
```

## Open Questions

None blocking API Design.
