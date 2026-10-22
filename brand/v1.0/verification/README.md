# Verification: the masters against the live vigyaan.ai header

The checks ran on 2026-10-21 against the production site (merge `df70028`, whose
assets are byte-identical to `ecc9f99e`), using headless Chrome 155.0.8059.80 at 4×
pixel density. Sections 2 and 3 hold for that renderer. Section 5 records a second
renderer, in which the live text sits about 1 CSS px lower.

## 1. The spark is the live file
- `masters/spark.svg` is **byte-identical** to `https://vigyaan.ai/assets/logo/spark.svg`:
  `curl … | cmp` reports no difference.
- It is also identical to the git blob `fd2ce2f6` at `ecc9f99e`.
- SHA-256: `3db121447238d2c78a3c809599c31ce85260a07133e4430686e0d3f0f686c824`.

## 2. The outlined wordmark matches the live text (pixel A/B on vigyaan.ai)
`source/verify-live.mjs`:
1. Opens https://vigyaan.ai/ at 1440 px wide and 4× pixel density.
2. Shoots the header `.brand`.
3. In that headless tab only, swaps the `.brand` contents for
   `masters/lockup-horizontal.svg` at its native 114 × 30 and shoots the same clip
   again.

The ground, position and page are the same in both shots. The only thing left to
differ is live text against outlined paths.

| Region (desktop, DPR 4) | Mean abs. diff (0–255) | Max | Pixels > 64 | Pixels > 128 |
|---|---|---|---|---|
| Spark | **0.000** | **0** | 0.00% | 0.00% |
| Wordmark | 1.94 | 124 | 1.11% | 0.00% |

In this renderer the best alignment is a shift of **0, 0**: there is no offset. What
remains is the antialiasing difference between Chrome's text rasteriser and its path rasteriser,
seen as thin edge lines in `ab-desktop-dpr4.png`.

The phone header (`ab-phone-dpr4.png`) **differs by design**. Under 400 px the site sets
the word at 1.12rem, while the master is the desktop 1.22rem (BRAND.md section 14,
item 1).

## 3. Geometry at 10× (headless Chrome 155, 4× density)
`source/ab10-geometry.mjs` renders the live `.brand` CSS with Fraunces from Google Fonts
and the master lockup side by side, at `transform: scale(10)`.

| | Ink box (lockup units, S = 30) |
|---|---|
| Live text | 39.9, 7.2 → 113.4, 25.8 |
| Master paths | 39.9, 7.2 → 113.4, 25.8 |

The mean pixel difference is 0.25/255. No pixel differs by more than 64. The best
shift is 0, 0. See `ab-10x-geometry.png`. The 10× scale removes most pixel-grid
effects but not the renderer's own baseline placement, so this too is a result for
this renderer (section 5).

## 4. Two things the A/B taught us (both handled in the masters)
- **Chrome 155 here paints text baselines on whole CSS pixels.** The header lays the
  baseline out 21.390625 px below the top of the spark and paints it at 21.0. The master
  fixes the baseline at 21.0 (0.7 S). That is a decision, matched to this renderer, not
  a value every browser reproduces (section 5).
- **Chrome snaps an `<img>` box to whole pixels.** The live `.brand` box is 113.78 px
  wide, so the master's viewBox is a whole **114**. An `<img>` at 114 × 30 is then never
  stretched by snapping.

## 5. A second renderer: the live text about 1 CSS px lower
A review on 2026-10-21 repeated the 10× layout of section 3 in a second Chromium (the
Claude desktop app's browser pane, 1.5× density) on the live vigyaan.ai, with live
Fraunces loaded, and superimposed the master with `mix-blend-mode: difference`.
- The spark cancelled to black, and the word's horizontal extent was identical.
- The live word's ink sat about 1 unit lower (0.9–1.1; 1 unit = 1 CSS px at S = 30).
  The master measured 7.11 → 25.95 vertically, matching its stated 7.2 → 25.8.
- It was measured from scaled screenshots, so the size of the offset is approximate.

The master was **not** changed. Its baseline is fixed at 0.7 S (BRAND.md section 2),
and an offset of about 1 px is invisible at 30 px. One renderer measured is one path
shown to exist, not a rate: other browsers, densities and font versions may place the
live text differently again.

## Files
| File | What it is |
|---|---|
| `live-header-desktop-dpr4.png` | vigyaan.ai's header `.brand`, as served |
| `master-in-live-header-desktop-dpr4.png` | The same clip with the master SVG swapped in |
| `ab-desktop-dpr4.png` | Live / master / difference ×4 |
| `ab-phone-dpr4.png` | The phone A/B (differs by design) |
| `ab-10x-geometry.png` | The 10× geometry A/B |
| `verify-live.json` | The measured boxes, computed font size, tracking, colour, and a font-loaded check |
