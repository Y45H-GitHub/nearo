# ADR 0002: Single-City Launch Scope for MVP

**Status:** Accepted
**Date:** 2026-07-20

## Context

Peer-to-peer rental marketplaces are density-dependent: a listing is only useful to a customer
close enough to pick it up. Launching pan-India with near-zero listing density per city would
produce empty search results everywhere and tell us nothing about demand.

## Decision

The MVP launches in **one metro city** (launch city to be set via config/seed data, not hardcoded
into schema or business logic — see [Nearo Glossary](../knowledge/glossary.md)). All seed data,
demo accounts, and default map/search center point at this one city.

The **data model is not city-scoped** — `products.location` stores full address + lat/long
globally, and `radius_km` search works anywhere coordinates exist. Single-city is a go-to-market
and seeding decision, not a schema constraint, so expansion to city #2 requires no migration.

## Consequences

- Search/discovery UX defaults to "near me" within the launch city; no city picker/switcher is
  required in the MVP nav.
- Trending searches, popular categories, and "recently listed" homepage sections are seeded
  city-specific, giving a denser, more convincing homepage than thin pan-India data would.
- Admin analytics in MVP does not need a city breakdown dimension — deferred until multi-city.

## Alternatives considered

- **Pan-India from day one** — rejected for MVP; correct long-term shape, wrong sequencing. We
  will revisit once the single-city cohort shows booking-completion signal.
