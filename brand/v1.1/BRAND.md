# Vigyaan brand kit, v1.1 (FINAL)

**Version 1.1, set 8 November 2026, on the founder's word.** It is v1.0 with one
change: the spark's dots. Three gold dots now sit evenly on three corners, one for each
line, with an open ring on the fourth for the next line (section 1). The rays, the light
centre, the wordmark, the lockup geometry, the colours, the fonts and the link-preview
card's design are v1.0's, unchanged. His words are in `VERSION`. What changed, file by
file, is in *What changed from v1.0* below, and the proof that nothing else moved is in
`verification/`.

**This version is final.** Nothing in this folder is ever edited, re-exported,
replaced or deleted. A change to the mark happens only on the founder's explicit
word, and only as a **new version folder** next to this one (see *Change policy*,
section 12). Every official use of the Vigyaan logo starts from this folder:
documents, email, social profiles, packaging and the website.

![contact sheet](contact-sheet.png)

## What changed from v1.0

- **The mark.** `masters/spark.svg` and every master that carries the spark (13 of 16):
  v1.0's three uneven dots are replaced by three even dots and an open ring. The three
  wordmark-only masters differ from v1.0's only in their comment line.
- **The exports.** Every PNG, `favicon.ico`, the link-preview card and `contact-sheet.png`
  were rendered again from the v1.1 masters by the same scripts, in headless Chrome 157.
  Rendered side by side in that same Chrome, v1.0 and v1.1 differ only inside the dot
  regions, in all 66 exports and in the card (`verification/README.md`).
- **The email signature.** `signature/` points at `/brand/v1.1/`, and `preview.png` is
  shot again from a new `source/signature-preview.html`.
- **The text and tools.** This file, `VERSION`, the comments in `source/gen-masters.mjs`,
  `source/og.html` and `source/sheet.html`, and two new proof scripts
  (`source/region-masters.mjs`, `source/prove-dots-only.py`). `source/inputs/spark.svg` is
  the v1.1 spark, which `gen-masters.mjs` copies byte for byte into `masters/`.

---

## 1. What the mark is

**The spark.** A four-point star with a light centre. From v1.1 it is
`assets/logo/spark.svg` on vigyaan.ai, byte for byte: `masters/spark.svg`, SHA-256
`24368e7c…edcb` (in full in `SHA256SUMS`).

- Four rays of equal length meet at a centre point, the *bindu*. The two vertical
  rays are a lighter gold than the two horizontal ones, so the eye reads
  "upward" from tone, not from length.
- **The dots (new in v1.1).** Three gold dots of one size sit evenly on three corners,
  one for each of the house's lines. The fourth corner holds an open ring: room for the
  next line. A new line does not fill the ring by itself. Filling it is a change to the
  mark, so it is a new version on the founder's word (section 12).
- It is flat: two golds, an ivory centre, and no gradient, glow or bevel.

The rays and the bindu are v1.0's, unchanged. In v1.0 three uneven dots stood there as
"the night the spark sits in" (section 10).

The geometry, in a 32-unit box with no background:

| Part | Geometry | Fill |
|---|---|---|
| Top ray | `M16 2.6 L17.8 14 L16 16 L14.2 14 Z` | `#d6b277` |
| Bottom ray | `M16 29.4 L17.8 18 L16 16 L14.2 18 Z` | `#d6b277` |
| Left ray | `M2.6 16 L14 14.2 L16 16 L14 17.8 Z` | `#c4a06a` |
| Right ray | `M29.4 16 L18 14.2 L16 16 L18 17.8 Z` | `#c4a06a` |
| Bindu | circle 16,16, r 2.1 | `#f3ebe0` |
| Dot | circle 6.8,6.8, r 0.95 | `#c4a06a` |
| Dot | circle 25.2,6.8, r 0.95 | `#c4a06a` |
| Dot | circle 25.2,25.2, r 0.95 | `#c4a06a` |
| Open ring | circle 6.8,25.2, r 0.74, no fill, stroke width 0.42 | stroke `#c4a06a` |

In the one-colour masters the ring's stroke takes the one ink, like every fill.

**The wordmark.** "Vigyaan", in title case only.

- Font: Fraunces SemiBold (wght 600), roman, from Google Fonts v38.
- Optical size 19.52. That is what `font-optical-sizing: auto` gives at the live
  header's 1.22rem. SOFT 0, WONK 0.
- Tracking −0.01em.

**The ™ symbol.** In website and packaging text, the name is written Vigyaan™, never
Vigyaan®. The logo itself (wordmark, lockups, tile) carries no symbol. The founder set
this on 21 October 2026 in these words: "Vigyaan™ is written in website and packaging
text; the logo stays clean with no symbol" (`VERSION`, the `symbol:` line). The
company's legal name, Vigyaan LLC, is written without a symbol, as in the email
signature.

The wordmark is **outlined**. It is not set in type. The paths come from Chrome's own
render of the live header: printed to PDF, where Chrome embeds the exact
variable-font instance as glyph outlines, then turned into paths with PyMuPDF.
So the wordmark never depends on a font file, a font update or a fallback font.
`source/` has the method and the inputs. `verification/` has the comparison with the
live header.

## 2. The files (masters/)

All masters are SVG. "Dark" means a dark ground and "light" means a light or white
ground. **A file without `-light` is for dark grounds.**

| File | What it is | Use it on |
|---|---|---|
| `spark.svg` | The spark, bare. Identical to the live `assets/logo/spark.svg`. | Dark grounds |
| `spark-tile.svg` | The spark 1:1 on a `#120c0b` rounded square (rx 7/32). This is the favicon and app-icon form. | Any ground, and **every ground below 32 px** |
| `spark-tile-square.svg` | The same, full-bleed with no rounding | Platforms that round the corners themselves (the iOS home screen) |
| `spark-avatar.svg` | Full-bleed `#120c0b` square with the spark **scaled to 85%**. Scale is the only change. Every ray tip and dot sits inside a circle crop and inside Android's 80% maskable safe zone. | Social avatars, Android maskable icon |
| `mono-light.svg` | The spark in one colour, ink `#120c0b` | Light grounds, single-ink print, fax |
| `mono-dark.svg` | The spark in one colour, ivory `#f4ece1` | Dark grounds, single-ink |
| `spark-mono.svg` | The spark in one colour, `currentColor` | Foil, emboss, CSS-coloured use |
| `wordmark.svg` / `wordmark-light.svg` / `wordmark-mono.svg` | The outlined word alone, in ivory / ink / `currentColor`. The viewBox is the ink box. | Only where the spark is already present nearby |
| `lockup-horizontal.svg` | **The primary logo**: bare spark and ivory word, drawn from the live desktop header `.brand`, with the baseline fixed at 0.7 S (below, and section 14, item 2). | Dark grounds |
| `lockup-horizontal-light.svg` | The tile and the ink `#120c0b` word | **Light and white grounds** (documents, email, letterhead) |
| `lockup-horizontal-mono.svg` | The horizontal lockup in `currentColor` | One-ink print, foil |
| `lockup-stacked.svg` / `-light.svg` / `-mono.svg` | The spark centred above the word | Square-ish spaces: carton fronts, slides, stickers |

**Geometry of the horizontal lockup** (S is the spark box size; S = 30 in the live header):
- The spark box is S × S at the left.
- The word starts 0.32 S after the box (the header's `.6rem` gap). It is set at 0.65 S
  (the header's 1.22rem).
- The baseline is **0.7 S** below the top of the box (21.0 at S = 30). This is a fixed
  decision. It is where headless Chrome 155 at 4× pixel density paints the live
  header's text. Another renderer can paint the live text lower: in one measured case,
  a second Chromium at 1.5× density, about 1 CSS px lower. The master does not follow
  any renderer. It is the truth.
- The whole lockup is **3.8 S × S** (114 × 30 at header size). The viewBox is
  `0 0 114 30`, so an `<img>` at S = 30 lands on whole pixels.

**The stacked lockup is new in v1.0.** The website did not use it on v1.0's date.
- The spark box S is centred above the word.
- The word is at 0.75× the header scale (em 0.4875 S), so its ink is 1.84 S wide.
- The gap from the bottom of the spark box to the top of the word's ink is 0.22 S.
- The viewBox is `0 0 55.178 50.53` for S = 30.

## 3. The exports (exports/)

Every PNG was rendered from the masters by headless Chrome 157 (Skia). v1.0's were
rendered by Chrome 155 (section 14, item 5).
Lockup PNG names give their **height** (for example `-h256`). Each size in a series
is double the one before it (16, 32, 64 and so on), so the next size up is the @2x
of the one before.

| Folder | Files | Notes |
|---|---|---|
| `spark/` | `spark-{16,32,48,64,128,180,192,256,512,1024}.png` | Transparent. Below 32 px on an unknown ground, use the tile. |
| `tile/` | `spark-tile-{16,…,1024}.png` | Transparent corners |
| `mono/` | `mono-light-` / `mono-dark-{64,128,256,512,1024}.png` | Transparent |
| `lockup/` | `lockup-horizontal[-light]-h{32,48,64,128,256,512,1024}.png`, `lockup-stacked[-light]-h{48,64,128,256,512,1024}.png` | Transparent. No 16 px horizontal lockup: the word would be 10 px, below the minimum. No stacked lockup under 48 px. |
| `icons/` | `favicon-16/32/48.png`, `favicon.ico` (16+32+48, the same pixels), `apple-touch-180.png` (opaque, full-bleed), `android-maskable-192/512.png` (opaque, 85%), `logo-512.png` (the tile) | For the website and app stores. `logo-512.png` is also the company logo wherever a square logo is asked for (Google's JSON-LD, mail and store developer pages). |
| `social/` | `social-avatar-1024.png` (opaque, circle-safe), `og-1200x630.png` (+ `.jpg`, q90) | Avatars everywhere. The link-preview card is described below. |
| `email/` | `sig-lockup-light@2x.png` (384×112, opaque white, shown at **192×56**), `sig-lockup-dark@2x.png` (352×112, opaque `#0f0b0a`, shown at **176×56**) | PNG on purpose, because Gmail and Outlook do not show SVG in mail. The backgrounds are opaque so dark-mode mail apps cannot drop the ink word onto black. |

**The link-preview card** (`social/og-1200x630`, 1200 × 630, made from `source/og.html`):
- The ground is the house night `#0f0b0a` with a warm glow behind the mark. The glow
  is part of the ground. No effect touches the mark.
- The tile (`spark-tile.svg`, S = 180 px) is centred above the ivory word
  (`wordmark.svg`), in the stacked lockup's geometry: the word's ink is 1.84 S wide and
  starts 0.22 S below the tile.
- The clear space is 0.5 S (90 px) on every side, and all of it sits inside the card's
  centre square (x 285–915). An app that shows a square cut from the middle of the card
  still shows the tile and the whole word.
- Above the mark: "A NEW JERSEY STUDIO" (Outfit). Below it: "A house for things that
  *stay* with you." (Outfit; *stay* in Fraunces italic). Left and right, outside the
  centre square: the Aura and Attars chips.
- **The tile with the ivory word is approved for this card.** Neither stacked lockup
  pairs them: `lockup-stacked.svg` has the bare spark with the ivory word, and
  `lockup-stacked-light.svg` has the tile with the ink word. The founder approved this
  card as shown, the pairing included, when he picked it on 21 October 2026 (`VERSION`,
  the second `changed:` line). It is not a third lockup. Anywhere else, use the lockups
  in section 2.
- The `.jpg` is written by Pillow from the `.png`: quality 90, progressive, 4:4:4.

`contact-sheet.png` shows all of them on their grounds.

## 4. Colours

**The mark (frozen).**

| Name | Hex | Role |
|---|---|---|
| Spark gold, light | `#d6b277` | Vertical rays |
| Spark gold | `#c4a06a` | Horizontal rays, the three dots, the open ring, one-colour gold ink |
| Spark gold, soft | `#e8d3a8` | v1.0's accent dot. Not in the v1.1 mark; listed so v1.0's files stay described |
| Bindu ivory | `#f3ebe0` | Centre |
| Tile / ink | `#120c0b` | The tile, and the word on light grounds |
| House ivory | `#f4ece1` | The word on dark grounds |
| House night | `#0f0b0a` | The ground the mark is designed on (site `--bg`, `theme-color`) |

**For text on white only** (email signature, documents). These are never part of the mark.
- `#5b4f46` warm grey: 7.9:1 on white.
- `#7a5a24` link gold: 6.3:1 on white. This is the spark gold darkened until text is
  readable on white. The spark gold itself is only 2.45:1 on white.

**The website UI is not the mark.**
- The site's `--accent #c9a46a` is a contrast-tuned UI gold. It is deliberately not
  the mark's `#c4a06a`. Never "unify" them, because that changes the mark.
- Other UI tokens: `--accent-soft #ead6ad`, `--muted #ae9e8e`, `--bg-2 #171110`,
  `--surface #1a1312`, `--raised #241a17`.

**The line worlds are not Vigyaan colours.**
- Aura: `#0b0920`, `#a78bfa`, `#7c3aed`, `#c4b5fd`.
- Attars: `#140c11`, `#d9b26a`, `#f0d9a8`.

## 5. Fonts

- **Fraunces** is the display face and the source of the wordmark. Google Fonts v38,
  variable `opsz` 9–144 and `wght` 400–700.
  <https://fonts.google.com/specimen/Fraunces>.
  Fallbacks: `ui-serif, Georgia, serif`.
- **Outfit** is the body face. Google Fonts v15, `wght` 300–600.
  <https://fonts.google.com/specimen/Outfit>.
  Fallbacks: `ui-sans-serif, system-ui, sans-serif`.
- **Email** uses web-safe stacks: Georgia for the name and Arial or Helvetica for the
  details. Mail apps do not load web fonts reliably.
- The site's CSS request is
  `https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400..700;1,9..144,400..700&family=Outfit:wght@300..600&display=swap`.
- **Never typeset "Vigyaan" as the logo.** Use the outlined files. In running text the
  name is just a word, in whatever font the text uses. In website and packaging text
  it is written Vigyaan™ (section 1).
- Aura's marketing videos use Segoe UI. That is Aura's ad family, not Vigyaan's.

## 6. Grounds and contrast

- **Dark grounds** (house night `#0f0b0a`, Attars `#140c11`, Aura `#0b0920`, or
  photography dark enough): use the bare spark and the ivory word
  (`lockup-horizontal.svg`).
- **Light or white grounds** (documents, email, letterhead, invoices, white packaging
  panels): use **the tile** and the ink word (`lockup-horizontal-light.svg`). The bare
  gold spark is too faint there. Gold `#c4a06a` is 2.09:1 on ivory and 2.45:1 on
  white. On the tile it is 7.92:1.
- **One ink only:** use `-mono` in gold foil, ink `#120c0b` or ivory `#f4ece1`.

## 7. Clear space and minimum sizes

- **Clear space:** keep at least **0.5 S** clear on every side of a lockup (15 px at
  header size), and at least **0.25 S** around a bare spark or tile.
- **Minimum size on screen:**
  - bare spark 16 px
  - the open ring is a hairline (0.42 of the 32-unit box). Below about 32 px it fades
    into the ground and the mark reads as three dots. That is expected.
  - horizontal lockup S ≥ 20 px (the word is then 13 px)
  - stacked lockup ≥ 48 px tall
  - anything ≤ 32 px on an unknown ground uses the **tile**
- **Minimum size in print:**
  - spark ≥ 5 mm
  - horizontal lockup ≥ 18 mm wide (the word is about 8.5 pt)
  - stacked lockup ≥ 12 mm wide

## 8. Do and don't

**Do**
- Use the files as they are, scaled uniformly.
- Pick the ground first, then the matching file: dark gets the bare spark, light gets
  the tile.
- Use PNG where SVG is not supported: email, Office on older versions, upload forms.

**Don't**
- Redraw, retrace or "clean up" the spark or the word. Don't re-type the word in Fraunces.
- Recolour the mark, including into a line's colours. Use only the three mono inks.
- Stretch, squash, rotate, skew, outline or crop the mark.
- Add effects: glow, shadow, bevel, gradient, texture or 3-D. The faceted 3-D star of the
  retired `assets/og.jpg` (section 10) is exactly this mistake.
- Put the bare gold spark on white or ivory.
- Set the name in capitals ("VIGYAAN") or in a sans-serif as a logo.
- Add ™ or ® to the logo. ™ belongs in website and packaging text, and ® is never
  used (section 1).
- Rearrange the lockup (word on the left, a different gap or size) or invent new
  lockups. Horizontal and stacked are the only two. (The link-preview card's tile
  above the ivory word, section 3, is approved for that card, not as a third lockup.)
- Mix it with the Aura icon. **Aura is a separate brand**, with its own icon, its own
  violet world and its own ads. Aura says "by Vigyaan" in text ("by Vigyaan™" in
  website and packaging text, section 1) and never shows the spark.

## 9. Where each file goes

| Use | File |
|---|---|
| Website header and footer | `assets/logo/spark.svg` (= `masters/spark.svg`) |
| Website favicon (SVG) | `masters/spark-tile.svg` |
| Favicon PNG and ICO | `exports/icons/favicon-32.png`, `favicon.ico` |
| iPhone home screen | `exports/icons/apple-touch-180.png` |
| Android / PWA | `exports/icons/android-maskable-192/512.png` |
| Google company logo (JSON-LD `Organization.logo`) | `exports/icons/logo-512.png` |
| Link previews (`og:image`) | `exports/social/og-1200x630.jpg` |
| Email signature | `exports/email/sig-lockup-light@2x.png`, shown at 192×56. The signature HTML is in the kit's `signature/` folder, which the website does not serve. |
| Social profile pictures and organisation logos | `exports/social/social-avatar-1024.png`, or `exports/icons/logo-512.png` where a square logo is asked for |
| Documents, letterhead, invoices, decks on white | `masters/lockup-horizontal-light.svg` (PNG `lockup-horizontal-light-h256/512`). One ink: `lockup-horizontal-mono.svg` or `mono-light.svg`. |
| Dark slides and Vigyaan (not Aura) end cards | `lockup-horizontal.svg`, `lockup-stacked.svg` |
| Attar packaging (cartons, bottle wraps, labels) | `spark-mono.svg` / `lockup-stacked-mono.svg` / `lockup-horizontal-mono.svg` in gold foil or ivory, on the Attars plum-black `#140c11` |
| Aura app, Aura ads, Aura flyers | **Not this kit.** Aura has its own icon. |

## 10. Retired marks. Never use these.

They are retired and must not be used for anything new. On 2026-10-21, v1.0's
date, the files were still in the website repo. None was referenced by a live
page except `assets/og.jpg` (the `og:image` of `/` and `/studio/`) and the 09-19 PNGs
`assets/logo/favicon-32.png`, `apple-touch-180.png` (both linked by every page) and
`vigyaan-mark-512.png` (the home page's JSON-LD logo), since replaced at the
same paths by the kit's files (section 9).

- **v1.0's spark**: three uneven dots (6.6,6.8 r 0.9; 25.4,7.8 r 0.7 in `#e8d3a8`;
  25.8,24.4 r 0.8) and every v1.0 file built from it, superseded by v1.1 on 2026-11-08.
  `brand/v1.0/` stays in the website repo and on the website, unchanged, because email
  already sent loads the v1.0 signature logo from it. Nothing new uses it.
- `assets/brand/mark.png` and `assets/logo/dp-warm-oil-stars-1024.png`: the 09-19
  oil-and-starfield painting. The two files are byte-identical.
- The 2026-10-21 contents of `assets/logo/favicon-32.png`, `apple-touch-180.png` and
  `vigyaan-mark-512.png`: the same painting at icon sizes. A swap replaces those
  contents with the v1.0 exports. The paths themselves can stay.
- `assets/logo/dp-warm-oil-1024.png`, `dp-warm-gold-1024.png`, `dp-warm-rings-1024.png`,
  `dp-dark-1024.png`, `dp-gradient-1024.png`, `dp-wordmark-1024.png`: the 09-19
  avatar experiments.
- `assets/logo/vigyaan-mark.svg` (the 05-19 blue-violet-green lozenge spark),
  `vigyaan-mark-mono.svg` (its one-colour form) and `vigyaan-icon.svg` (it on a gradient
  tile).
- `assets/og.jpg`: the faceted 3-D gold star with "VIGYAAN" in spaced caps.

## 11. Checking the files

`SHA256SUMS` lists every file in this folder except itself (GNU `sha256sum` format).
Its own SHA-256 is pinned outside the folder, in two places: the kit's `../README.md`
and `SUMS_SHA` in the website repo's `tools/lint.mjs`. So a changed file cannot pass by
also changing its line in `SHA256SUMS`: that changes the pin, and the pin lives in a
file someone has to edit visibly. Only the repo's pin has a history (git), so it is the
authority. `../README.md` is not versioned, so a copy outside git is proven by
comparing it with `brand/v1.1/` in the repo (`diff -r`), or its pin with `SUMS_SHA` in
`tools/lint.mjs` on the repo's `main`.
- PowerShell: `powershell -ExecutionPolicy Bypass -File verify.ps1` checks the pin, then
  every listed file, then that the folder holds no file the list leaves out. It prints
  `ALL OK` or names each file that changed, is missing or is not listed.
- Git Bash: `cd v1.1 && sha256sum SHA256SUMS && sha256sum -c SHA256SUMS`. Compare the first
  line's hash with the pin by eye. This does not see an extra file, so also check that
  `find . -type f | wc -l` is one more than `wc -l < SHA256SUMS`.

All files carry the Windows **read-only** attribute (`attrib +R`). That stops
accidental saves. It is not a lock: Git Bash's `rm -f` ignores it, and it does not stop a
new file being added to a folder. The pinned checksums, `verify.ps1`, the copy in the
website repo and its lint gate are the real guard.

**The website repo** (`setukansara-ops/vigyaan-ai-website`, folder `brand/v1.1/`) holds
every file in this folder at the same relative paths.
- The website serves all of it at `https://vigyaan.ai/brand/v1.1/…` except `source/`,
  `verification/`, `signature/` and `verify.ps1`. Those are versioned in the repo but
  left out of the deploy by `.vercelignore`. On a copy downloaded from the website, use
  `sha256sum -c --ignore-missing SHA256SUMS`.
- `brand/.gitattributes` marks the copy as binary, so git never rewrites its line
  endings.
- `node tools/lint.mjs` fails if:
  - `SHA256SUMS` is not the pinned `SUMS_SHA`
  - any file there stops matching `SHA256SUMS`, a file is not listed, or a listed
    file is missing
  - `VERSION` still says the founder's approval is pending
  - `assets/logo/spark.svg` stops matching `masters/spark.svg`
  - a page renders a retired mark
- The site has no CI. The gate runs whenever the lint is run.

## 12. Change policy

1. **v1.1 is final, and so is v1.0.** Their files are never edited, re-exported,
   replaced or deleted, here or under `/brand/v1.1/` and `/brand/v1.0/` on the website.
   Emails already sent load their logo from those URLs.
2. **The mark changes only on the founder's explicit word**: a message from him that
   says to change the logo. A redesign idea, a "cleaner" export or a helper's
   suggestion is not that word. **Every new folder, `v1.1.1/` included, needs the
   founder's explicit word.**
3. **A change is a new version folder** (`v1.2/` or `v2.0/`) next to `v1.1/`, built
   from that decision. It has its own `VERSION` (with the date and his words),
   `SHA256SUMS` and a "what changed" note. **A new folder is a complete kit, never a
   delta**: it holds every file, changed or not. `../README.md` then points at the new
   folder. Nothing is overwritten.
4. A missing size or format is also a new version (`v1.1.1/`), never a quiet addition
   to `v1.1/`.
5. **The PR that adds a new folder also updates the gate.** It adds the folder to
   `tools/lint.mjs` (`KITS`: its path and its `SUMS_SHA`; `SPARK_SHA` if the spark
   changed) and moves the `/brand/` page links to it. Earlier versions stay in `KITS`,
   because they never change.
6. Anyone preparing a file with the mark, a person or a tool (AI assistants included),
   **copies from this folder and never redraws**. If something needed is missing, they
   say so and ask the founder. They do not improvise a variant.

## 13. Provenance and proof

The rays and the wordmark are v1.0's, unchanged, so v1.0's measurements below still hold;
v1.0's full write-up is in `brand/v1.0/verification/README.md`. v1.1's own proof, that
only the dots changed, is in this folder's `verification/README.md`. Every v1.0
measurement below was made in headless Chrome 155 at 4× pixel density, the renderer the
v1.0 masters were built in.
- At 10× scale, the outlined wordmark lands on **the same ink box** as that renderer's
  live Fraunces text (39.9, 7.2 → 113.4, 25.8), with a mean pixel difference of
  0.25/255.
- In the live vigyaan.ai header, the spark region is **pixel-identical**. The text
  differs by a mean of 1.9/255 and never by more than 124/255, with a best shift of
  0, 0.
- That match holds for that renderer. A second Chromium (1.5× density, live Fraunces)
  painted the live text about 1 CSS px lower than the master, with the same horizontal
  extent and an identical spark. The difference is invisible at 30 px, and the master's
  baseline is a fixed decision (section 2).

Build:
- headless Chrome 157.0.8103.38 on Windows 11 (v1.1's exports; v1.0's: 155.0.8059.80)
- PyMuPDF 1.28.0 (v1.0's wordmark outlines, reused unchanged)
- Pillow 12.2.0
- node 24.16.0

## 14. Declared gaps

1. On phones (under 400 px), the live header sets the word at 1.12rem (0.597 S) next to
   the same 30 px spark. The footer sets it at 1.3rem with no tracking. The masters
   follow the desktop header (1.22rem, −0.01em). Neither CSS rule was changed.
2. Renderers place a text baseline differently. In headless Chrome 155 at 4× density,
   the desktop header lays the baseline out at 21.39 px below the top of the spark and
   paints it at 21.0. The master fixes the baseline at **21.0** (0.7 S) as a decision.
   One other renderer measured (a second Chromium at 1.5× density) painted the live
   text about 1 CSS px lower. The master does not move with any renderer.
3. PNGs re-rendered on another machine or browser may differ by antialiasing pixels.
   The SVG masters are the truth.
4. **The open ring at small sizes.** At 16 and 32 px the ring is under a pixel wide and
   mostly disappears, so the favicon reads as three dots (section 7).
5. **Chrome 157, not 155.** v1.1's PNGs were rendered by headless Chrome 157.0.8103.38;
   Chrome 155 was no longer on the machine. Rendering v1.0's own masters in Chrome 157
   gives the same picture with different edge pixels (all 66 v1.0 exports differ from the
   Chrome 155 files somewhere along their edges). So v1.0 and v1.1 PNGs are compared like
   for like (both in Chrome 157) in `verification/README.md`, never against v1.0's
   Chrome 155 files.
