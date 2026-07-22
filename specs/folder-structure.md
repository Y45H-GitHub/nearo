---
purpose: The actual repository layout code gets written into. Feature-based, not type-based, per the brief's "production folder structure" requirement. If a new top-level folder feels needed during build, update this doc in the same commit, don't let structure drift silently.
---

# Nearo — Folder Structure

**Status:** Draft v1 — Phase 8 deliverable
**Depends on:** [information-architecture.md](information-architecture.md),
[database-schema.md](database-schema.md), [decisions/0007](../decisions/0007-server-actions-vs-route-handlers-vs-direct-queries.md)

```
nearo/
├── .agents/                     # AI agent orientation (exists)
├── decisions/                   # ADRs (exists)
├── knowledge/                   # glossary, business-rules (exists)
├── specs/                       # this planning phase's deliverables (exists)
├── tasks/                       # populated per-milestone once building starts
├── docs/                        # human setup docs: getting-started.md, deployment.md, env-vars.md
│
├── supabase/
│   ├── migrations/              # numbered SQL migrations (0001_init.sql, ...)
│   ├── seed.sql                 # launch-city demo data: categories, sample users/listings
│   └── config.toml
│
├── src/
│   ├── app/                                    # Next.js 15 App Router — routes only, thin
│   │   ├── (marketing)/
│   │   │   ├── page.tsx                        # Landing
│   │   │   └── layout.tsx                      # public header/footer shell
│   │   ├── explore/page.tsx
│   │   ├── listing/[id]/
│   │   │   ├── page.tsx
│   │   │   └── book/page.tsx
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   ├── profile/page.tsx
│   │   ├── users/[id]/page.tsx
│   │   ├── wishlist/page.tsx
│   │   ├── bookings/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── messages/
│   │   │   ├── page.tsx
│   │   │   └── [threadId]/page.tsx
│   │   ├── notifications/page.tsx
│   │   ├── owner/
│   │   │   ├── layout.tsx                      # hosting-mode shell (see IA §4)
│   │   │   ├── page.tsx
│   │   │   ├── listings/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/page.tsx
│   │   │   │   └── [id]/edit/page.tsx
│   │   │   ├── bookings/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   └── earnings/page.tsx
│   │   ├── admin/
│   │   │   ├── layout.tsx                      # admin sidebar shell
│   │   │   ├── page.tsx
│   │   │   ├── users/page.tsx
│   │   │   ├── listings/page.tsx
│   │   │   ├── categories/page.tsx
│   │   │   ├── bookings/page.tsx
│   │   │   ├── reports/page.tsx
│   │   │   └── analytics/page.tsx
│   │   ├── api/
│   │   │   └── bookings/[id]/transition/route.ts   # lazy status-transition check, per ADR 0007
│   │   ├── layout.tsx                          # root layout: fonts, theme provider
│   │   ├── globals.css
│   │   └── not-found.tsx
│   │
│   ├── features/                 # one folder per domain, owns its own UI + server logic
│   │   ├── auth/
│   │   │   ├── components/       # LoginForm, SignupForm, OtpInput, VerifyPrompt
│   │   │   ├── actions/          # signIn, signUp, verifyPhone, resendOtp (Server Actions)
│   │   │   └── types.ts
│   │   ├── listings/
│   │   │   ├── components/       # ListingCard, ListingGallery, ListingForm (multi-step), AvailabilityCalendar
│   │   │   ├── actions/          # createListing, updateListing, publishListing, pauseListing
│   │   │   ├── queries/          # getListing, searchListings, getOwnerListings
│   │   │   └── types.ts
│   │   ├── bookings/
│   │   │   ├── components/       # BookingCalendarPicker, PriceBreakdown, BookingStatusPill, BookingRow
│   │   │   ├── actions/          # requestBooking, acceptBooking, rejectBooking, cancelBooking, markReturned
│   │   │   ├── queries/          # getCustomerBookings, getOwnerBookings, getBooking
│   │   │   └── types.ts
│   │   ├── messaging/
│   │   │   ├── components/       # ThreadList, MessageBubble, MessageComposer
│   │   │   ├── actions/          # sendMessage, startThread
│   │   │   ├── queries/          # getThreads, getMessages
│   │   │   └── types.ts
│   │   ├── wishlist/
│   │   │   ├── components/       # WishlistButton, WishlistGrid
│   │   │   ├── actions/          # toggleWishlist
│   │   │   └── queries/
│   │   ├── reviews/
│   │   │   ├── components/       # ReviewForm, ReviewList, RatingStars
│   │   │   ├── actions/          # submitReview
│   │   │   └── queries/
│   │   ├── notifications/
│   │   │   ├── components/       # NotificationBell, NotificationList
│   │   │   ├── queries/
│   │   │   └── mark-read.ts
│   │   ├── owner-dashboard/
│   │   │   └── components/       # StatTile, EarningsTable, PendingRequestsList
│   │   └── admin/
│   │       ├── components/       # DataTable, AdminSidebar, ReportRow
│   │       ├── actions/          # resolveReport, suspendUser, hideListing, updateCategory
│   │       └── queries/
│   │
│   ├── components/
│   │   ├── ui/                   # shadcn primitives (Button, Input, Dialog, ...) — generated, lightly customized
│   │   └── shared/                # cross-feature: EmptyState, StatusPill, Avatar, Rating, SearchBar, MapPicker
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts          # browser client
│   │   │   ├── server.ts          # server component / Server Action client
│   │   │   └── middleware.ts       # session refresh middleware
│   │   ├── payments/
│   │   │   ├── provider.ts         # PaymentProvider interface — ADR 0005
│   │   │   └── mock-provider.ts
│   │   ├── notifications/
│   │   │   ├── channel.ts          # NotificationChannel interface — ADR 0006
│   │   │   ├── in-app-channel.ts
│   │   │   └── mock-sms-channel.ts
│   │   ├── validation/             # zod schemas, one file per entity (listing.ts, booking.ts, ...)
│   │   ├── geo.ts                  # distance/radius math
│   │   └── utils.ts
│   │
│   ├── types/
│   │   ├── database.ts             # generated from Supabase (supabase gen types typescript)
│   │   └── domain.ts                # hand-written types not derivable from schema (e.g. UI-only enums)
│   │
│   ├── config/
│   │   ├── design-tokens.ts         # mirrors specs/design-tokens.md — Tailwind config imports this
│   │   └── constants.ts             # e.g. DEFAULT_SEARCH_RADIUS_KM = 5
│   │
│   └── middleware.ts                 # Next.js middleware — auth session + admin route gating
│
├── public/
├── tailwind.config.ts
├── next.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

## Conventions

- **`features/*` owns logic, `app/*` owns routing.** A page file is a thin composition of feature
  components + a data fetch; it should not contain business logic itself.
- **`actions/` = Server Actions, `queries/` = read-only Supabase calls** (can be called from
  Server or Client Components). Neither is a Route Handler — Route Handlers are the exception,
  living only under `app/api/`, per [ADR 0007](../decisions/0007-server-actions-vs-route-handlers-vs-direct-queries.md).
- **No `utils` dumping ground per feature.** Shared logic goes in `lib/`; feature-specific helpers
  stay colocated inside that feature's folder rather than promoted to `lib/` speculatively.
- **`components/ui` is generated (shadcn CLI), not hand-authored from scratch** — customize via
  the CLI's own file, don't fork it into a parallel component.

## Open Questions

None blocking Component Tree/API Design — this structure is what those two docs assume file
locations to be.
