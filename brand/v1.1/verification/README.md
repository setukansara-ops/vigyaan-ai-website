# Verification: v1.1 changes the dots and nothing else

Run on 2026-11-08 on the 5090 (Windows 11), headless Chrome 157.0.8103.38, Pillow 12.2.0,
node 24.16.0. v1.0's own proof that the masters match the live vigyaan.ai header (the
wordmark and the spark at 4× density) is in `brand/v1.0/verification/README.md`. The
rays, the light centre and the wordmark are unchanged in v1.1, so it still holds for them.

## 1. The pipeline is v1.0's

- `source/gen-masters.mjs`, run unchanged on v1.0's spark and `inputs/wordmark.json`,
  rebuilt **all 16 v1.0 masters byte for byte** (line endings aside). v1.1's copy changes
  only the dot lines and the comments.
- The `favicon.ico` recipe (Pillow: the 48 px PNG saved as ICO with the 16 and 32 px PNGs
  appended, sizes 16, 32 and 48) rebuilt **v1.0's `favicon.ico` byte for byte** from
  v1.0's PNGs. v1.1's is the same recipe on v1.1's PNGs, so its three frames are those
  PNGs' pixels.
- The link card is `source/og.html` shot by `source/shotpage.mjs` at 1200 × 630, DPR 1,
  then saved as JPEG by Pillow (quality 90, progressive, 4:4:4), as in v1.0. The contact
  sheet is `source/sheet.html` shot at 1400 wide, height auto, DPR 1.

## 2. The masters differ only in the dots

`diff` of each v1.1 master against v1.0's:

| Masters | Changed lines | Lines changed other than the comment and the dots |
|---|---|---|
| The 13 that carry the spark | 11 each: 2 comment lines (4 diff lines), 3 old dots out, 3 dots and the ring in | **0** |
| `wordmark.svg`, `wordmark-light.svg`, `wordmark-mono.svg` | 4 each: the 2 comment lines | **0** |

## 3. The exports differ only inside the dot regions

v1.0's PNGs were rendered by Chrome 155, which is no longer on the machine. Chrome 157
renders v1.0's own masters with different edge pixels: all 66 of v1.0's exports differ
from the Chrome 155 files somewhere along their edges (BRAND.md section 14, item 5). So
the comparison is like for like:

1. v1.0's masters were rendered by `source/export.mjs` in Chrome 157, into scratch.
2. v1.1's exports were rendered by the same script in the same Chrome.
3. `source/region-masters.mjs` made a "region" copy of every v1.1 master: magenta disks
   of radius 3 units at the dots of **both** versions, and nothing else. Rendered by the
   same `export.mjs` jobs, each one marks, in its export's own pixels, where a difference
   is allowed. A radius of 3 units clears the nearest ray by more than 4 units.
4. `source/prove-dots-only.py` compared each pair. A pixel differs when its alpha or its
   premultiplied colour differs at all, so colour under full transparency does not count.

Result, in `dots-only.json`:

| Checked | Pixels that differ | Differing pixels outside the dot regions |
|---|---|---|
| 66 exports (every PNG `export.mjs` writes) | from 4 (16 px favicon) up, in every file | **0 in all 66** |
| The link card, `og-1200x630.png`, both in Chrome 157 (regions from the card's tile position, x 510, y 153, S 180) | 433 | **0** |

The contact sheet and `signature/preview.png` were not compared pixel by pixel: they are
pictures of the files above, and the sheet's heading text changed on purpose.

## 4. After the website PR merges

- `curl -s https://vigyaan.ai/assets/logo/spark.svg | sha256sum` should print
  `24368e7c…edcb` (`masters/spark.svg`).
- `https://vigyaan.ai/brand/v1.1/exports/email/sig-lockup-light@2x.png` should open and
  show the tile with the ring at its bottom left.
