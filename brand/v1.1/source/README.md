# How v1.1 was built (provenance; do not re-run into v1.1)

These scripts and inputs made every file in `masters/` and `exports/`. They are kept so
anyone can see exactly how the files were made. **Never re-run them into `v1.1/`.**
A new version gets its own folder (BRAND.md section 12).

**v1.1 (2026-11-08)** reused v1.0's pipeline. Steps 1 to 3 below (the wordmark outlines)
were not run again: `inputs/wordmark.json` is v1.0's. What ran:
- `gen-masters.mjs inputs/spark.svg inputs/wordmark.json ../masters`. `inputs/spark.svg` is
  the v1.1 spark, and the script's dot lines and comments are v1.1's.
- `export.mjs ../masters ../exports .` for the 66 PNGs; `og.html` with `WM` and `TILE`
  set to the masters' file URLs, shot by `shotpage.mjs` at 1200 × 630, DPR 1, then Pillow
  (JPEG quality 90, progressive, 4:4:4); `favicon.ico` by Pillow from the 16, 32 and 48 px
  PNGs (the 48 px image saved as ICO with the other two appended).
- `sheet.html` (with `M/` and `E/` set to the masters and exports) shot at 1400 wide,
  height auto, DPR 1, and `signature-preview.html` (`SIG` set to the light email PNG) shot
  at 620 wide, height auto, DPR 2, to `../signature/preview.png`.
- `region-masters.mjs` and `prove-dots-only.py` made `../verification/dots-only.json`.

The steps below are v1.0's.

1. **`extract.mjs <dir with wm.html>`** renders the live `.brand` rule
   (`css/house.css:175-176`, Fraunces from Google Fonts) in headless Chrome. It:
   - measures it on screen and saves `inputs/measure.json`
   - prints it to PDF as `inputs/wm.pdf`. Chrome embeds the variable-font instance at
     opsz 19.52 / wght 600 as Type 3 glyph outlines.
2. **PyMuPDF** turns the PDF page into SVG with text as paths, giving `inputs/wm-text.svg`:
   `fitz.open("wm.pdf")[0].get_svg_image(text_as_path=True)`.
3. **`outline.mjs inputs/wm-text.svg inputs/measure.json inputs/wordmark.json`** merges the
   seven glyphs into one path in lockup units (1 unit = 1 CSS px of the header, S = 30).
   - Glyph shapes and relative advances come from the PDF.
   - Placement comes from the on-screen layout. The baseline is painted 21.0 below the
     top of the spark.
4. **`gen-masters.mjs <spark.svg from git ecc9f99e> inputs/wordmark.json <masters dir>`**
   writes every master.
   - `spark.svg` is copied byte for byte.
   - The spark elements in every other file are the same eight elements.
   - Stacked lockup: word scale 0.75, gap 0.22 S.
5. **`export.mjs <masters> <exports> <dir with render.html>`** renders every PNG in
   headless Chrome.
   - `og.html` (with `WM` / `TILE` replaced by the master paths) is shot by
     `shotpage.mjs` at 1200 × 630.
   - Pillow writes the `.jpg` (q90) and `favicon.ico` (16/32/48, the same pixels as the
     PNGs).
6. `sheet.html` is shot to `contact-sheet.png`.
7. `verify-live.mjs` / `ab10-geometry.mjs` with `diff.py` / `shift.py` make the
   `verification/` evidence.

`cdp.mjs` is a minimal Chrome DevTools-protocol driver: node 24, no npm packages.
