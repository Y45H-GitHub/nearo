---
purpose: The single source of truth for visual primitives — color, type, spacing, radius, shadow, motion. Tailwind config and shadcn theme CSS variables are generated from this file, not the other way around; if a value needs to change, change it here first.
---

# Nearo — Design Tokens

**Status:** Draft v1 — Phase 9 deliverable (produced alongside the rest of planning per current
batch)
**Depends on:** [prd.md § Design Principles](prd.md#10-design-principles)

## 1. Typography

Single font family, variable weight, for both UI and display — avoids licensing/loading overhead
of a second display face while still reading premium (this is what Linear/Vercel/Raycast do).

- **Family:** `Inter` (variable, self-hosted via `next/font/local` or `next/font/google` — no
  external network request at runtime, keeping it CSP-clean and fast).
- **Fallback stack:** `Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`.

| Token | Size (rem/px) | Weight | Line-height | Usage |
|---|---|---|---|---|
| `text-display` | 3.5rem / 56px | 600 | 1.1 | Landing hero headline only |
| `text-h1` | 2.25rem / 36px | 600 | 1.2 | Page titles |
| `text-h2` | 1.75rem / 28px | 600 | 1.25 | Section headers |
| `text-h3` | 1.25rem / 20px | 600 | 1.3 | Card titles, subsection headers |
| `text-body-lg` | 1.125rem / 18px | 400 | 1.5 | Lead paragraphs |
| `text-body` | 1rem / 16px | 400 | 1.5 | Default body |
| `text-body-sm` | 0.875rem / 14px | 400 | 1.45 | Secondary text, metadata |
| `text-caption` | 0.75rem / 12px | 500 | 1.4 | Labels, badges, timestamps |

Numeric values (prices, ratings, stats) use `font-feature-settings: "tnum"` (tabular figures) so
columns of numbers align.

## 2. Color

Primitive scales are HSL-based (shadcn/Tailwind convention) so light/dark just remaps semantic
tokens to different primitive steps — primitives themselves don't change.

### Primitives

| Scale | 50 | 100 | 300 | 500 | 700 | 900 |
|---|---|---|---|---|---|---|
| `stone` (neutral) | #FAFAF9 | #F1EFEC | #C9C3BB | #78716C | #44403C | #1C1917 |
| `ember` (brand accent) | #FFF1EC | #FFDCCF | #FF9B78 | #FF5A36 | #D6431F | #7A2410 |
| `teal` (secondary accent — verified/trust) | #EEFBF7 | #CFF3E9 | #7FDFC4 | #17A889 | #0F7A65 | #0B4E42 |
| `amber` (warning/pending) | #FFFAEB | #FFF1C2 | #FFD666 | #F5A623 | #C97F0E | #7A4D08 |
| `rose` (destructive/error) | #FFF1F2 | #FFE0E3 | #FCA5AD | #E11D48 | #B0123A | #6E0A24 |

`ember` is Nearo's single confident accent — used for primary CTAs and the logo mark only, never
for large surface fills, so it stays punchy instead of overwhelming (Airbnb's "Rausch" plays the
same role in their system).

### Semantic tokens (light / dark)

| Token | Light | Dark |
|---|---|---|
| `bg-canvas` | `stone-50` | `stone-900` |
| `bg-surface` (cards) | `#FFFFFF` | `stone-800`-equivalent (`#26221F`) |
| `bg-surface-sunken` (inputs, filter sidebar) | `stone-100` | `#201C19` |
| `border-default` | `stone-100` (as border, ~1px) | `stone-700`-equivalent (`#3A3532`) |
| `text-primary` | `stone-900` | `stone-50` |
| `text-secondary` | `stone-500` | `stone-300`-equivalent |
| `accent-primary` | `ember-500` | `ember-500` (unchanged — brand color is dark-mode stable) |
| `accent-primary-hover` | `ember-700` | `ember-300` |
| `trust-verified` | `teal-500` | `teal-300` |
| `status-pending` | `amber-500` | `amber-300` |
| `status-danger` | `rose-500` | `rose-300` |
| `status-success` | `teal-700` | `teal-300` |

Booking/product status pill color mapping (used consistently everywhere a status shows — see
[component-tree.md](component-tree.md) `StatusPill`):

| Status | Token |
|---|---|
| `draft`, `requested` | `status-pending` (amber) |
| `available`, `accepted`, `booked`, `active`, `returned`, `completed` | `status-success` (teal) |
| `rejected`, `cancelled` | neutral `text-secondary` (not alarming — these are normal outcomes) |
| `disputed`, `maintenance` | `status-danger` (rose) |
| `hidden` | neutral, muted |

## 3. Spacing

4px base unit, Tailwind default scale used as-is (`1 = 4px, 2 = 8px, 3 = 12px, 4 = 16px, 6 = 24px,
8 = 32px, 12 = 48px, 16 = 64px, 24 = 96px`). No custom spacing scale — deviating from Tailwind's
default here buys nothing and costs consistency.

Page-level rhythm: section vertical padding = `16` (64px) desktop / `10` (40px) mobile. Card
internal padding = `6` (24px). Grid gaps = `4`–`6` (16–24px) depending on density.

## 4. Radius

| Token | Value | Usage |
|---|---|---|
| `radius-sm` | 8px | Inputs, badges, small buttons |
| `radius-md` | 12px | Buttons, form fields (default) |
| `radius-lg` | 16px | Cards |
| `radius-xl` | 24px | Modals, bento cells, hero search bar |
| `radius-full` | 9999px | Avatars, pills, icon buttons |

Nothing sharp-cornered (`radius-none`) appears anywhere in the product — consistent roundedness is
part of the "premium, never generic" brief.

## 5. Shadow (elevation)

| Token | Value (light) | Usage |
|---|---|---|
| `shadow-sm` | `0 1px 2px rgba(28,25,23,0.06)` | Cards at rest |
| `shadow-md` | `0 4px 12px rgba(28,25,23,0.08)` | Cards on hover, dropdowns |
| `shadow-lg` | `0 12px 32px rgba(28,25,23,0.12)` | Modals, popovers |

Dark mode shadows drop opacity ~40% and rely more on `border-default` for separation than shadow
alone (shadows read poorly on dark surfaces).

## 6. Motion

Framer Motion, used with restraint — micro-interactions, not showpieces.

| Token | Duration | Easing | Usage |
|---|---|---|---|
| `motion-fast` | 120ms | `ease-out` | Hover states, button press |
| `motion-base` | 200ms | `cubic-bezier(0.4, 0, 0.2, 1)` | Card enter, filter panel toggle |
| `motion-slow` | 350ms | `cubic-bezier(0.16, 1, 0.3, 1)` | Page-level transitions, modal open |

Rules: no motion blocks interaction (skeletons/optimistic UI over spinners-that-gate), no
autoplay carousels that fight scroll, reduced-motion media query respected (durations collapse to
0 or near-0).

## 7. Breakpoints

Tailwind defaults: `sm 640px · md 768px · lg 1024px · xl 1280px · 2xl 1536px`. Desktop-first per
brief means primary design target is `lg`/`xl`; `sm`/`md` are the reflow, not the starting point.

## Open Questions

None blocking Supabase/Component Tree. Exact hex values above are a defensible v1 palette, not
final brand — swappable in one place (Tailwind config) if a designer revisits branding later.
