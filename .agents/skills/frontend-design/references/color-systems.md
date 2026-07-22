# Color Systems by Use Case

A companion reference to `frontend-design/SKILL.md`. Where that file governs aesthetic/layout/motion, this one governs color selection — organized by what the product *is*, not by abstract palette names, so you can jump straight to the section matching the brief.

## How to use this file
1. Find the use case below (or the closest analog).
2. Apply its palette using the 60-30-10 split from the main skill: 60% dominant/background, 30% secondary surface, 10% accent — the accent is the *only* color allowed on CTAs/highlights.
3. Check contrast before shipping (see §9).

---

## 1. SaaS / productivity / dashboards
**Psychology:** trust, clarity, focus. Users are here to get work done, not be delighted.
- **Cool professional:** bg `#FAFAFA` → surface `#F1F3F5` → text `#1A1D21` → accent `#2563EB` (blue reads as competence/reliability across most cultures, which is why it's the majority default for B2B tools)
- **Slate + single accent:** bg `#0F172A` (dark mode) → surface `#1E293B` → text `#E2E8F0` → accent `#22D3EE` (cyan pops hard against slate without feeling playful)
- Avoid: more than one saturated accent color. Dashboards live or die on the user being able to tell "this color always means the same thing" (e.g. red = error, never used decoratively elsewhere).

## 2. Fintech / banking / insurance
**Psychology:** stability, security, seriousness — but not so cold it feels unapproachable.
- **Institutional trust:** bg `#F7F8FA` → surface `#FFFFFF` → deep navy `#0B2545` for headers/nav → accent `#0EA5E9` for actions
- **Modern fintech (post-2020 startup look):** near-black `#0A0A0F` → surface `#14141C` → accent emerald `#10B981` (green doubles as "growth/money" signaling, common in trading/investment apps) — use sparingly, it's easy to tip into "crypto scam site" territory if overused
- Avoid: red as a primary brand color (reads as loss/danger in financial contexts even when used neutrally) and neon/candy palettes — they undercut the "we will not lose your money" message.

## 3. E-commerce / retail
**Psychology:** urgency + trust in balance. Product imagery should carry the visual weight, not the UI.
- **Neutral stage:** bg `#FFFFFF` → surface `#F5F5F5` → text `#111111` → accent `#111111` or one brand color reserved only for "Add to cart" / sale badges. Let product photos be the color.
- **Warm conversion accent:** neutral base + coral/orange accent `#FF6B4A` — orange has the highest "buy now" association of any hue in conversion studies, useful specifically on the CTA, nowhere else.
- Avoid: multiple competing bright accents (sale banner red + CTA orange + nav blue) — it fragments attention and nothing reads as more important than anything else.

## 4. Health, wellness, meditation
**Psychology:** calm, safety, restoration. Nothing should feel urgent.
- **Soft clinical:** bg `#F7FAF9` → surface `#EAF3F0` → sage `#5B8A72` → text `#1F2A24` — desaturated green/teal reads as "care" without the sterility of pure white/blue clinical palettes
- **Sleep/mindfulness:** deep indigo `#1B1E3D` → surface `#2A2E5C` → soft lavender accent `#A78BFA` — cool, low-saturation, nothing above ~60% brightness anywhere so it doesn't fight a dark room
- Avoid: red/orange anywhere (reads as alert, the opposite of the intended state) and high-contrast pure black/white (feels clinical/cold rather than restorative).

## 5. Food, restaurant, delivery
**Psychology:** appetite stimulation — literally. Warm hues (red/orange/yellow) measurably increase perceived hunger; this is one of the few places where that's the entire point.
- **Appetite-forward:** cream bg `#FFF8F0` → chili red `#D62828` for CTAs/logo → charcoal text `#2B2B2B`
- **Premium/artisanal:** dark chocolate `#2E1F14` → surface `#3D2B1F` → warm cream text `#F4E8D8` → gold accent `#C9A15A` for a more elevated food-brand feel (coffee, fine dining, spirits)
- Avoid: blue as a dominant color — it's one of the only hues shown to *suppress* appetite, which is why almost no food brand uses it as primary.

## 6. Kids, education, playful consumer apps
**Psychology:** joy, safety, approachability. Saturated primaries read as friendly rather than "unprofessional" specifically in this category — the same palette would undercut a fintech app.
- **Primary playground:** white bg `#FFFFFF` → 2-3 saturated primaries used as accent blocks, e.g. `#FFD23F` (yellow), `#3DDC97` (green), `#4C6FFF` (blue) — rotate per section, never all three on one screen at once
- **Soft pastel variant** (for younger/gentler audiences): bg `#FFF5F7` → mint `#B8E6D5` → lilac `#D4C5F9` → coral accent `#FF9B7A`
- Avoid: muddy/desaturated tones — kids' UI is one of the few places low saturation reads as "boring" rather than "sophisticated."

## 7. Luxury, fashion, high-end goods
**Psychology:** restraint signals expense. The fewer colors, the more premium it reads.
- **Quiet luxury:** off-white/bone `#F5F1EA` → warm gray `#8C8479` → near-black text `#1A1A1A` → a single metallic-adjacent accent (muted gold `#B08D57` or none at all)
- **Dark editorial:** near-black `#0D0D0D` → text off-white `#F1F1EE` → one restrained accent, often just a lighter gray, not a hue at all
- Avoid: gradients, more than one accent color, or anything saturated — luxury design communicates confidence through *absence* of decoration, not presence of color.

## 8. Creative agencies, portfolios, experimental brands
**Psychology:** here you're allowed — expected — to break the rules above. This is the one category where a jarring, high-contrast, "shouldn't work but does" pairing is the point.
- **High-contrast pop:** pure white or black base + one unapologetically clashing pair, e.g. `#FF3366` + `#00E5A0`, used at near-equal weight rather than 60-30-10
- **Editorial mono + shock accent:** grayscale base (blacks/whites/grays only) + one impossible-to-ignore accent used exactly once on the page (a single CTA, a single hero word)
- This category is the exception to "never break the ban-list" in the main skill — confirm with the brief that experimental is actually wanted before reaching for this.

## 9. Gaming, streaming, entertainment
**Psychology:** energy, immersion, night-use (most usage happens in dark rooms).
- **Neon-on-black:** near-black `#0A0A0F` → electric purple `#8B5CF6` + cyan `#22D3EE` as a dual-accent pair (rare exception to single-accent rule — works because both are cool and roughly equal saturation)
- **Streaming-service dark:** charcoal `#141414` → surface `#1F1F1F` → single warm accent (red `#E50914`-style or brand hue) reserved for play buttons/live indicators only
- Avoid: light backgrounds — this category is one of the few where light mode isn't just "less preferred," it actively works against extended-viewing comfort.

## 10. Travel, hospitality, outdoor/eco
**Psychology:** escape, warmth (travel) or groundedness (eco/outdoor) depending on which half of the category you're in.
- **Sunset/tropical (travel):** cream bg `#FFF9F0` → coral `#FF7E5F` → sky blue accent `#4FC3F7` — warm+cool pairing reads as "vacation," not accidental
- **Earth/outdoor (eco, sustainability, agriculture):** off-white `#F7F5F0` → moss `#4A6741` → clay/terracotta accent `#C1652F` — desaturated naturals signal authenticity better than saturated greens (which can read as "greenwashing" if too bright/synthetic-looking)
- Avoid: neon or highly saturated greens for eco branding specifically — it reads as artificial, the opposite of the intended message.

---

## Quick color-theory reference
- **Complementary** (opposite on the wheel): max contrast, use for a single high-impact accent against a neutral base — not for two large color fields fighting each other.
- **Analogous** (adjacent hues): naturally harmonious, low-risk, good default when you don't have a strong reason to pick something bolder.
- **Monochromatic** (one hue, varied lightness/saturation): safest way to look intentional and cohesive; the default recommendation whenever you're unsure.
- **Triadic** (three evenly spaced hues): vibrant but needs one hue dominant and the other two as minority accents, never three-way equal weight.
- **Split-complementary**: base color + the two neighbors of its complement — most of complementary's punch with less visual tension.

## Accent discipline (applies everywhere above)
The accent color is doing a job: it means "click here" or "this matters." The instant it starts appearing on decorative elements, icons that aren't interactive, or section dividers just because it's the brand color, it stops meaning anything and the CTA drowns in the noise. One accent, used sparingly, beats three accents used generously — every time.

## 9. Contrast & accessibility (non-negotiable, not a use-case)
- Body text against its background: minimum 4.5:1 contrast ratio (WCAG AA). Large text (18px+/24px+ bold): 3:1 minimum.
- Never encode meaning in color alone (error states, chart legends, form validation) — pair with an icon, label, or pattern too, for colorblind users (~8% of men).
- Dark-mode near-black should be `#0A0A0A`–`#121212`, not pure `#000000` — pure black against pure white text causes halation/eye strain on OLED and high-contrast screens.