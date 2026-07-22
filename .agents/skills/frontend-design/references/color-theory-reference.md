# Color Theory & Palette Library

A companion reference to `frontend-design/SKILL.md`. 
The complete color reference. `color-systems.md` tells you which palette fits a use case; this file is the underlying theory plus the full palette library, so nothing needs to be looked up externally.

---

## 1. Core color model

- **Hue** — the color itself (0-360° on the wheel: 0=red, 120=green, 240=blue).
- **Saturation** — intensity/purity. 100% = fully saturated, 0% = gray.
- **Lightness/Value** — how close to black (0%) or white (100%).
- Use **HSL** or **OKLCH** over raw hex when building a palette programmatically — they let you shift lightness/saturation while holding hue constant, which is how you generate a consistent tint/shade ramp instead of guessing hex values by eye.
- **Tint** = hue + white (lighter). **Shade** = hue + black (darker). **Tone** = hue + gray (muted). Most "premium-feeling" palettes lean on tones over raw saturated hues.
- **Temperature**: reds/oranges/yellows = warm (advance, feel close, raise energy); blues/greens/purples = cool (recede, feel distant, calm). Warm-on-cool or cool-on-warm creates the most natural-feeling contrast.

## 2. Harmony types — the mechanics

| Type | Formula (from base hue H) | Character | Risk |
|---|---|---|---|
| Monochromatic | H, varying S/L only | Safest, most cohesive | Can feel flat without enough lightness range |
| Analogous | H, H±30° | Naturally harmonious | Low contrast — needs a neutral or dark anchor |
| Complementary | H, H+180° | Maximum contrast, high energy | Two saturated complements together vibrate/clash — mute one |
| Split-complementary | H, H+150°, H+210° | Complementary's punch, less tension | Still needs one hue dominant |
| Triadic | H, H+120°, H+240° | Vibrant, balanced | Never use all three at equal weight — pick one dominant, two accent |
| Tetradic/square | H, H+90°, H+180°, H+270° | Rich, complex | Hardest to balance — usually needs one hue suppressed to near-neutral |

## 3. Color psychology (hue-level, use as a starting point not a law — context and culture shift these)

| Hue | Common associations | Common pitfalls |
|---|---|---|
| Red | urgency, appetite, passion, danger | overuse reads as alarm/error |
| Orange | energy, warmth, affordability, playfulness | can read cheap if overused in premium contexts |
| Yellow | optimism, caution, attention | hardest hue to read as body text; low contrast on white |
| Green | growth, health, money (US/UK), eco | in finance, always double-check vs. loss/gain conventions |
| Blue | trust, calm, competence | overused → generic-corporate ("just another blue SaaS") |
| Purple | luxury, creativity, spirituality | can skew "childish" at high saturation, "premium" when muted |
| Pink | approachability, femininity (culturally coded), playfulness | context-dependent, avoid unexamined gendered defaults |
| Brown | reliability, earthiness, comfort | can read dated if not paired with a modern neutral |
| Black | sophistication, authority, luxury | pure black + pure white = harsh; prefer near-black |
| White | cleanliness, simplicity, space | pure white can feel sterile; warm white/off-white usually reads better |
| Gray | neutrality, balance | can feel lifeless as the *only* color — always needs an accent |

---

## 4. Palette library

Each entry: **name** — background / surface / text / accent(s) — mood — best fit. Apply with 60-30-10 unless noted.

### Monochromatic
1. **Slate Mono** — `#0F172A` / `#1E293B` / `#F1F5F9` / `#334155` — cool, controlled — dashboards, dev tools
2. **Forest Mono** — `#0B3D2E` / `#1F5D42` / `#F0FAF4` / `#4C8C6B` — grounded, natural — eco, outdoor
3. **Terracotta Mono** — `#7A2E1D` / `#A8452C` / `#FDF3EC` / `#D97757` — warm, editorial — food, lifestyle
4. **Plum Mono** — `#2D0A31` / `#4A1652` / `#F5E6F2` / `#7B2D82` — moody, creative — arts, luxury
5. **Steel Blue Mono** — `#082F49` / `#0C4A6E` / `#F0F9FF` / `#0369A1` — technical, precise — fintech, B2B
6. **Charcoal Mono** — `#18181B` / `#27272A` / `#FAFAFA` / `#52525B` — restrained, neutral — minimal/portfolio
7. **Amber Mono** — `#451A03` / `#92400E` / `#FFFBEB` / `#D97706` — energetic warmth — food, energy brands
8. **Rose Mono** — `#4C0519` / `#881337` / `#FFF1F2` / `#E11D48` — bold romance — beauty, events

### Analogous
9. **Ocean Drift** — blue `#0EA5E9` + cyan `#06B6D4` + teal `#10B981` — calm-tech — wellness, productivity
10. **Sunset Blend** — amber `#F59E0B` + orange `#F97316` + red `#EF4444` — energetic urgency — food, flash sales
11. **Meadow** — lime `#84CC16` + green `#22C55E` + teal `#14B8A6` — fresh — fitness, eco
12. **Berry Fields** — pink `#EC4899` + fuchsia `#D946EF` + purple `#A855F7` — playful bold — beauty, youth brands
13. **Dawn Sky** — yellow `#FBBF24` + orange `#FB923C` + coral `#F87171` — warm hospitality — travel
14. **Deep Sea** — indigo `#1E3A8A` + blue `#1D4ED8` + cyan `#0891B2` — trustworthy depth — finance, insurance
15. **Autumn Grove** — brown-orange `#92400E` + amber `#B45309` + olive-gold `#A16207` — cozy seasonal — food, home
16. **Twilight** — violet `#4C1D95` + purple `#6D28D9` + indigo `#4338CA` — immersive dark — gaming, entertainment

### Complementary
17. **Blue/Orange Classic** — bg `#FAFAF9`, blue `#2563EB`, orange `#F97316` — high-contrast SaaS CTA pairing
18. **Red/Green Balance** — bg `#FFFFFF`, green `#166534`, red `#DC2626` — use carefully; food/seasonal only
19. **Purple/Yellow Pop** — bg `#18181B`, purple `#7C3AED`, yellow `#FACC15` — creative, entertainment
20. **Teal/Coral** — bg `#F0FDFA`, teal `#0D9488`, coral `#F43F5E` — modern wellness/lifestyle
21. **Navy/Gold** — bg `#0B1120`, navy `#1E293B`, gold `#EAB308` — premium finance
22. **Forest/Rust** — bg `#F5F5F0`, forest `#14532D`, rust `#C2410C` — heritage/outdoor brand
23. **Indigo/Amber** — bg `#F8FAFC`, indigo `#4338CA`, amber `#F59E0B` — education, productivity
24. **Magenta/Lime** — bg `#0A0A0A`, magenta `#D6409F`, lime `#A3E635` — gaming, Y2K revival

### Split-complementary
25. **Blue + Red-orange/Yellow-orange** — `#1D4ED8` base, `#F97316` + `#FBBF24` — vibrant tech
26. **Purple + Yellow-green/Orange** — `#7C3AED` base, `#A3E635` + `#FB923C` — bold creative
27. **Green + Red/Pink** — `#16A34A` base, `#DC2626` + `#F472B6` — festive, food
28. **Teal + Orange/Rose** — `#0D9488` base, `#F97316` + `#F43F5E` — travel, leisure
29. **Navy + Coral/Gold** — `#1E3A8A` base, `#FB7185` + `#FACC15` — approachable fintech
30. **Plum + Lime/Amber** — `#6B21A8` base, `#A3E635` + `#F59E0B` — youth-oriented brand

### Triadic
31. **Primary Play** — blue `#2563EB` / red `#DC2626` / yellow `#FACC15` — kids, education
32. **Muted Triad** — slate `#64748B` / amber-brown `#B45309` / olive `#4D7C0F` — earthy professional
33. **Jewel Triad** — violet `#7C3AED` / emerald `#059669` / pink `#DB2777` — luxury fashion
34. **Cyber Triad** — cyan `#06B6D4` / magenta `#D946EF` / yellow `#FACC15` — gaming, neon
35. **Pastel Triad** — periwinkle `#A5B4FC` / pastel yellow `#FDE68A` / pastel pink `#FBCFE8` — soft consumer
36. **Deep Triad** — navy-slate `#1E293B` / rust `#7C2D12` / dark olive `#365314` — rugged, outdoor

### Neutral / minimal
37. **Warm Neutral** — `#FAF9F6` / `#E7E2D8` / `#A89F91` / `#3D3A34`
38. **Cool Neutral** — `#F8FAFC` / `#E2E8F0` / `#94A3B8` / `#1E293B`
39. **Greige** — `#F5F1EC` / `#D9CFC1` / `#8A7F6F` / `#2E2A24`
40. **Stone** — `#FAFAF9` / `#E7E5E4` / `#78716C` / `#1C1917`
41. **Bone + Ink** — `#F4F1EA` / `#D6D0C4` / `#57534E` / `#0C0A09`
42. **Concrete** — `#F2F2F0` / `#C9C9C4` / `#6B6B66` / `#1A1A18`

### Pastel
43. **Cotton Candy** — `#FFE5EC` / `#E5D4FF` / `#D4F1F4` / text `#4A4E69`
44. **Spring Pastel** — `#E8F5E9` / `#FFF9C4` / `#FFCCBC` / text `#37474F`
45. **Sherbet** — `#FFE0B2` / `#FFCCBC` / `#F8BBD0` / text `#4E342E`
46. **Mint Cream** — `#E0F7FA` / `#DCEDC8` / `#FFF9C4` / text `#263238`
47. **Lavender Haze** — `#F3E8FF` / `#E0E7FF` / `#FCE7F3` / text `#312E81`
48. **Peach Fuzz** — `#FFEEE0` / `#FFE0EC` / `#E0F0FF` / text `#5C4033`

### Vibrant / neon
49. **Cyberpunk** — bg `#0A0014` / magenta `#FF00E5` / cyan `#00F0FF` / yellow `#F9F871`
50. **Y2K Pop** — bg `#0A0A0A` / pink `#FF61D2` / mint `#29FFC6` / yellow `#FFF000`
51. **Rave** — bg `#000000` / violet `#7000FF` / green `#00FFA3` / orange `#FF3D00`
52. **Arcade** — bg `#121212` / red `#FF2D55` / yellow `#FFD60A` / teal `#30D5C8`
53. **Miami Vice** — bg `#1A0033` / pink `#FF00A0` / cyan `#00D9FF` / yellow `#FFEA00`
54. **Toxic Glow** — bg `#131313` / green `#39FF14` / red-pink `#FF073A` / text `#FFFFFF`

### Dark-mode specific (bg / surface / elevated surface / text / accent)
55. **Near-black Slate** — `#0A0A0A` / `#171717` / `#262626` / `#E5E5E5` / `#3B82F6`
56. **Deep Navy** — `#0B1120` / `#16213E` / `#1F2B4D` / `#E2E8F0` / `#38BDF8`
57. **Warm Dark** (not blue-tinted) — `#171310` / `#251F1A` / `#3A2F26` / `#F5EFE6` / `#F59E0B`
58. **OLED-friendly** — `#050505` / `#121212` / `#1E1E1E` / `#EDEDED` / `#A78BFA`
59. **Forest Dark** — `#0D1F17` / `#16291E` / `#22392A` / `#E8F5EC` / `#34D399`
60. **Wine Dark** — `#1A0A10` / `#2B1119` / `#3D1826` / `#F5E6EA` / `#F43F5E`

---

## 5. Accessibility math (apply to every palette above before shipping)
- **WCAG contrast ratio** = `(L1 + 0.05) / (L2 + 0.05)` where L1/L2 are relative luminance of the lighter/darker color. AA minimum: 4.5:1 body text, 3:1 large text (18px+/14px bold+) and UI components.
- Don't eyeball it — run any two hex values through a contrast checker (e.g. WebAIM's) before finalizing a text/background pair from this library.
- Never let color be the *only* differentiator (error vs. success, selected vs. unselected) — pair with shape, icon, or text label for ~8% of men and ~0.5% of women with color vision deficiency.

## 6. Picking a palette — decision order
1. Check `color-systems.md` for the use case → gives you a starting palette.
2. Cross-reference the harmony type here if you want a variant (e.g. "give me another analogous option in the cool range").
3. Verify contrast (§5) on the actual text/background pairs you land on, not just the palette in isolation — a palette that passes on paper can still fail on the specific pairing you use.