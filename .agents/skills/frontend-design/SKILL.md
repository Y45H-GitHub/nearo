---
name: frontend-design
description: Use when building or redesigning any web UI — landing pages, dashboards, marketing sites, portfolios, components, or single sections — to enforce a deliberate, non-generic visual direction instead of the default templated-SaaS look. Triggers on "design", "landing page", "redesign", "make this look better/less generic", "build a website/page/section/component".
---

# Frontend Design System

## Why this exists
Left unconstrained, generated UI converges on the same defaults: purple-to-blue gradient hero, Inter font, uniform 12px-rounded cards, generic drop shadows, a 3-column icon-circle feature grid, Lucide icons. None of that is wrong in isolation — it's just what everyone's output looks like now. This skill forces a deliberate choice at every layer instead.

## Step 0 — Declare a direction before writing any CSS
Before touching code, pick and state, in one line (as a comment at the top of the stylesheet or in your response):
`aesthetic: <name> · layout: <name> · motion: <name> · palette: <name> · reference: <real product>`
Never skip this. If the brief doesn't imply an aesthetic, default to whichever below fits the content best — never to "clean modern SaaS" as a non-choice.

---

## 1. Aesthetic library

**Glassmorphism** — frosted, semi-transparent panels over a vivid/colorful background. `backdrop-filter: blur(12px)`, `background: rgba(255,255,255,0.12–0.18)`, 1px white border at ~20-30% opacity. Needs a busy/colorful backdrop behind it or there's nothing to blur. Good for: overlays, onboarding, media-heavy products. Reference: Apple iCloud login.

**Neumorphism (soft UI)** — element and background share the *exact* same color; a dual box-shadow (dark bottom-right + light top-left) fakes a raised/pressed surface. `box-shadow: 6px 6px 12px <darker>, -6px -6px 12px <lighter>`; inset both for pressed state. Very low contrast — never use for critical text or primary CTAs, and pair with a real accessible focus state. Good for: dashboards, media controls, dark-mode control panels.

**Brutalism** — raw and intentionally unpolished. Thick 2-4px solid black borders, zero border-radius, zero gradients, pure primary colors (yellow/red/black/white), monospace or oversized bold type, slight `transform: rotate(-1deg to -2deg)` on some elements. Good for: portfolios, anti-corporate brands. Reference: Gumroad.

**Minimalism** — the content is the design. Single typeface at multiple weights, generous whitespace (80px+ section padding), near-monochrome palette, hierarchy built from size/weight/spacing alone — no icons, no decoration unless functional. Reference: Linear.app.

**Bento grid** — CSS Grid mosaic of unevenly-sized cards (`grid-column: span 2`, `grid-row: span 2` on 1-2 featured cards), each card its own visual treatment (dark/light/gradient/screenshot). The variety in size *and* treatment is what sells it — don't make every card the same size. Reference: Apple Mac product pages.

**Dark luxury** — near-black, not pure black (`#0A0A0A` / `#0D0D1A`), cards one step lighter (`#111111`/`#1A1A2E`) for depth, exactly one accent color used sparingly for CTAs/highlights only, hairline borders at `rgba(255,255,255,0.08)`. Reference: Vercel, Raycast.

**Retro / Y2K** — near-black background, hot pink / electric cyan / neon lime accents, bold display or pixel fonts, chrome/metallic gradient text, scattered sparkle motifs, unapologetic saturation. Use only when the brief calls for playful/nostalgic energy — not a default.

**Claymorphism** — inflated, puffy 3D elements. Multi-layer `box-shadow` (hard offset shadow + soft ambient glow), candy/pastel colors, 20px+ radius, press-state animates `translateY` + shrinks the shadow. Good for: consumer/productivity apps wanting a friendly, non-corporate feel.

---

## 2. Layout patterns
- **F-pattern** — for text-heavy pages: most important content top-left, left-aligned body text, left column gets far more attention than right. Use for articles/docs.
- **Hero + feature grid** — the default SaaS layout. Treat as a *fallback*, not a first choice — reach for bento or asymmetric split first unless the content genuinely needs 3 parallel equal-weight items.
- **Asymmetric split (60/40, 65/35)** — dominant visual on one side, supporting text+CTA on the other. `grid-template-columns: 3fr 2fr`. Alternate the split direction between sections for rhythm.
- **Masonry** — Pinterest-style variable-height columns (`columns: 3` or a JS masonry lib) for galleries/portfolios/feeds where items have naturally different heights.
- **Full-page scroll-snap** — `scroll-snap-type: y mandatory` + `height: 100vh` per section, for cinematic single-message-per-screen storytelling. Pair with dot navigation.
- **Sidebar + content** — fixed/sticky nav rail + flexible content area. The standard for dashboards and internal tools, not marketing pages.

## 3. Scroll & motion
- **Scroll-reveal**: `IntersectionObserver` toggles a `.visible` class; animate `opacity: 0→1` + `translateY(30px→0)` via CSS `transition`, not JS loops (consistent with "no setInterval for visuals"). Stagger children by ~0.1s each.
- **Parallax**: 2-3 layers moving at different fractions of scroll speed (far bg ~20-30%, mid ~50-60%, foreground text 100%) via `transform: translateY()`, driven by `requestAnimationFrame`.
- **Sticky/pinned sections**: `position: sticky; top: 0` on one column (e.g. a product screenshot) while the sibling column scrolls past — swap the sticky visual on intersection.
- **Text reveal**: split headline into word/char spans, stagger fade+rise-in (~0.08s per word).
- **Scroll progress bar**: fixed 3-4px bar at top, width driven by `scrollY / (scrollHeight - innerHeight)`, animate with `transform: scaleX()` not `width`.
- Define motion as tokens, not inline magic numbers: `--ease-out`, `--duration-fast (120-150ms)`, `--duration-base (200-250ms)`.

## 4. Navigation patterns
- **Sticky navbar**: transparent at scroll-top, transitions to solid/frosted background past ~60px scroll.
- **Mega menu**: multi-column dropdown panel (hover on desktop, tap on mobile) for sites with deep category structures — not for sites with <5 nav items.
- **Fullscreen hamburger**: 3-line icon animates to X; overlay menu with staggered link fade-in; lock body scroll while open.
- **Tabs**: active indicator as a separate sliding underline element (`transform: translateX()`), not a re-rendered border.
- **Breadcrumbs**: subtle, small, muted — last item isn't a link; add schema.org `BreadcrumbList` for SEO.
- **Dot navigation**: only pair with full-page scroll-snap layouts, not regular scrolling pages.

## 5. Typography
- Never default to Inter/Roboto/system-ui without deciding. Pick a pairing on purpose:
  - Editorial/luxury: serif display (Fraunces, Playfair) + grounded sans body (Public Sans, DM Sans)
  - Modern startup: geometric display (Space Grotesk, Clash Display) + Satoshi/General Sans body
  - Technical/tool: two disciplined grotesques, different weights doing the hierarchy work
- Build a real type scale with `clamp(min, fluid-vw, max)`, not fixed px per breakpoint. Tight negative letter-spacing (`-0.02em` to `-0.05em`) on large display text.
- Gradient text (`background-clip: text` + transparent fill) is a nice accent on 1-2 words — don't apply it to entire headlines or it stops meaning anything.

## 6. Color
Apply the 60-30-10 rule as a baseline: 60% dominant neutral, 30% secondary surface tone, 10% accent — the accent appears *only* on CTAs/highlights/active states, never decoratively.

For the actual palette — hex values, harmony type, psychology, and accessibility contrast math — don't improvise inline. Load:
- **`references/color-systems.md`** — use-case-indexed palettes (SaaS, fintech, e-commerce, health/wellness, food, kids, luxury, creative, gaming, travel, eco). Start here when the project's domain is known.
- **`references/color-theory-reference.md`** — full theory (hue/saturation/lightness, harmony formulas, color psychology table) plus a 60-palette library organized by harmony type (monochromatic, analogous, complementary, split-complementary, triadic, neutral, pastel, vibrant, dark-mode). Use this to pick a variant or verify contrast ratios before shipping.

## 7. Icon packs
Pick **one pack per project** and never mix packs or mix filled/outline styles within the same view. Define `--icon-size-sm/md/lg` tokens and apply consistently.

| Pack | Style | Install | Best for |
|---|---|---|---|
| **Phosphor** | 6 weights: thin/light/regular/bold/fill/duotone | `npm i @phosphor-icons/react` (or `@phosphor-icons/web` for vanilla) | Needing weight variation for hierarchy (e.g. light for nav, bold for active state) within one consistent family |
| **Lucide** | Single clean stroke weight | `npm i lucide` / `lucide-react` | Reliable and huge ecosystem — but by 2026 it's become the icon-pack equivalent of Inter: the unexamined default baked into most AI-generated UI. Use it deliberately, not automatically |
| **Remixicon** | Line + fill *pairs* per icon (`RiHomeLine` / `RiHomeFill`) | `npm i remixicon-react` (or the `remixicon` webfont/CSS) | Needing an active/inactive state pair from the same glyph — nav items, toggles |
| **Clickons** | 500 icons, 17 categories, fill + stroke, minimalist | No maintained npm package — distributed as SVG/Figma assets via Craftwork Design (craftwork.design/product/clickons); self-host the SVGs you need | Wanting a distinctive, less-seen mark when you're deliberately avoiding the Lucide-everywhere look |

## 8. Anti-pattern blacklist — never do these unless explicitly requested
- Purple→blue gradient hero background as an unexamined default
- Uniform `border-radius` value applied to literally every element
- Reflexive 3-column "icon circle, bold title, gray paragraph" feature grid regardless of whether content has 3 parallel items
- Glassmorphism / frosted blur used decoratively rather than deliberately
- Centered hero + gradient text + blurred blob shapes in the background
- Generic testimonial cards: 5 gold stars + initials-in-a-circle avatar + no real specificity in the quote
- Lucide icons reached for on autopilot rather than as a deliberate choice (see §7)
- Picking a color accent by gut feel instead of checking §6's reference files — an ungrounded accent is how "generic SaaS blue" happens

## 9. Pre-flight checklist
Before shipping any UI, confirm: named reference product · chosen aesthetic · chosen layout · chosen motion approach · font pairing · chosen palette (with contrast verified) · single icon pack · nothing from the blacklist crept in.