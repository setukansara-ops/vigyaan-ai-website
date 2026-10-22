// Writes the v1.0 SVG masters from (a) the live spark.svg, byte for byte, and
// (b) the outlined wordmark (wordmark.json, from outline.mjs).
// usage: node gen-masters.mjs <live spark.svg> <wordmark.json> <out masters dir> [stackedScale]
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
const [, , SPARK, WM, OUT, STK = '0.75'] = process.argv;
mkdirSync(OUT, { recursive: true });
const sparkSrc = readFileSync(SPARK); // bytes
const wm = JSON.parse(readFileSync(WM, 'utf8'));

const C = {
  goldLight: '#d6b277', gold: '#c4a06a', goldSoft: '#e8d3a8', bindu: '#f3ebe0',
  tile: '#120c0b', ink: '#120c0b', ivory: '#f4ece1',
};
const r3 = v => { let s = (Math.round(v * 1000) / 1000).toFixed(3).replace(/\.?0+$/, ''); return s === '-0' ? '0' : s; };

// The spark's eight elements, verbatim from spark.svg (32-unit box). `mono` repaints every fill.
const sparkEls = (mono, ind = '  ') => [
  `<path d="M16 2.6 L17.8 14 L16 16 L14.2 14 Z" fill="${mono || C.goldLight}"/>`,
  `<path d="M16 29.4 L17.8 18 L16 16 L14.2 18 Z" fill="${mono || C.goldLight}"/>`,
  `<path d="M2.6 16 L14 14.2 L16 16 L14 17.8 Z" fill="${mono || C.gold}"/>`,
  `<path d="M29.4 16 L18 14.2 L16 16 L18 17.8 Z" fill="${mono || C.gold}"/>`,
  `<circle cx="16" cy="16" r="2.1" fill="${mono || C.bindu}"/>`,
  `<circle cx="6.6" cy="6.8" r="0.9" fill="${mono || C.gold}"/>`,
  `<circle cx="25.4" cy="7.8" r="0.7" fill="${mono || C.goldSoft}"/>`,
  `<circle cx="25.8" cy="24.4" r="0.8" fill="${mono || C.gold}"/>`,
].map(s => ind + s).join('\n');
const tileRect = (ind = '  ') => `${ind}<rect width="32" height="32" rx="7" fill="${C.tile}"/>`;
const squareRect = (ind = '  ') => `${ind}<rect width="32" height="32" fill="${C.tile}"/>`;

const NOTE = (what) => `  <!-- Vigyaan brand kit v1.0 (2026-10-21), master: ${what}
       The spark is assets/logo/spark.svg (vigyaan.ai, blob fd2ce2f6) unchanged.
       Never redraw, recolour, stretch, rotate or add effects. Rules: BRAND.md. -->`;
const svg = (vb, body, note) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" role="img" aria-label="Vigyaan">\n${note}\n${body}\n</svg>\n`;
const files = {};

// 1. spark.svg — byte-identical copy of the live file
files['spark.svg'] = sparkSrc;
// 2. tile forms
files['spark-tile.svg'] = svg('0 0 32 32', tileRect() + '\n' + sparkEls(), NOTE('the tile (favicon / app-icon form). spark.svg 1:1 on a #120c0b rounded square, rx 7/32.'));
files['spark-tile-square.svg'] = svg('0 0 32 32', squareRect() + '\n' + sparkEls(), NOTE('full-bleed square tile, spark 1:1. For platforms that round the corners themselves (iOS apple-touch-icon).'));
files['spark-avatar.svg'] = svg('0 0 32 32', squareRect() + '\n  <g transform="translate(16 16) scale(.85) translate(-16 -16)">\n' + sparkEls(null, '    ') + '\n  </g>', NOTE('avatar / maskable form. Full-bleed #120c0b square, spark scaled to 85% (scale is the only change) so every ray tip and dot sits inside a circle crop and the Android maskable 80% safe zone.'));
// 3. one colour
files['spark-mono.svg'] = svg('0 0 32 32', sparkEls('currentColor'), NOTE('one colour, currentColor (foil, emboss, single-ink print). Allowed inks: gold #c4a06a, ink #120c0b, ivory #f4ece1.'));
files['mono-light.svg'] = svg('0 0 32 32', sparkEls(C.ink), NOTE('one colour for LIGHT grounds: ink #120c0b.'));
files['mono-dark.svg'] = svg('0 0 32 32', sparkEls(C.ivory), NOTE('one colour for DARK grounds: ivory #f4ece1.'));

// 4. wordmark alone (tight ink box, lockup units)
const ink = wm.ink; const pad = 0;
const wx = ink.x0 - pad, wy = ink.y0 - pad, ww = ink.x1 - ink.x0 + 2 * pad, wh = ink.y1 - ink.y0 + 2 * pad;
const wmPath = (fill, ind = '  ') => `${ind}<path fill="${fill}" d="${wm.d}"/>`;
const WMNOTE = `Wordmark "Vigyaan": Fraunces SemiBold 600 (Google Fonts v38), opsz 19.52 (auto at the live header's 1.22rem), SOFT 0, WONK 0, tracking -0.01em, OUTLINED from Chrome's own render of the live header, so it never depends on a font file.`;
const wmVB = `${r3(wx)} ${r3(wy)} ${r3(ww)} ${r3(wh)}`;
files['wordmark.svg'] = svg(wmVB, wmPath(C.ivory), NOTE('wordmark alone, ivory #f4ece1, for DARK grounds. ' + WMNOTE));
files['wordmark-light.svg'] = svg(wmVB, wmPath(C.ink), NOTE('wordmark alone, ink #120c0b, for LIGHT grounds. ' + WMNOTE));
files['wordmark-mono.svg'] = svg(wmVB, wmPath('currentColor'), NOTE('wordmark alone, currentColor. ' + WMNOTE));

// 5. horizontal lockup = the live header, measured: spark box 30 at (0,0), text origin x 39.594, baseline 21.391
const S = 30, sc = String(S / 32); // 0.9375 exactly (never round the spark's scale)
const HW = Math.ceil(wm.measured.box[2]); // 114: the live .brand box (113.78125) rounded up to a whole px, so an <img> at S=30 is never pixel-snapped/stretched
const hVB = `0 0 ${r3(HW)} ${S}`;
const sparkAt = (x, y, body) => `  <g transform="translate(${r3(x)} ${r3(y)}) scale(${sc})">\n${body}\n  </g>`;
const HNOTE = `horizontal lockup, exactly the live header .brand (css/house.css:175): spark box S = 30, gap .6rem = 0.32 S, wordmark 1.22rem = 0.65 S, centred. ${WMNOTE}`;
files['lockup-horizontal.svg'] = svg(hVB, sparkAt(0, 0, sparkEls(null, '    ')) + '\n' + wmPath(C.ivory), NOTE('for DARK grounds: bare spark + ivory wordmark. ' + HNOTE));
files['lockup-horizontal-light.svg'] = svg(hVB, sparkAt(0, 0, tileRect('    ') + '\n' + sparkEls(null, '    ')) + '\n' + wmPath(C.ink), NOTE('for LIGHT / white grounds: the tile + ink #120c0b wordmark (the bare gold spark is 2.1:1 on ivory, too faint). ' + HNOTE));
files['lockup-horizontal-mono.svg'] = svg(hVB, sparkAt(0, 0, sparkEls('currentColor', '    ')) + '\n' + wmPath('currentColor'), NOTE('one colour (currentColor): foil, emboss, single-ink print. ' + HNOTE));

// 6. stacked lockup: spark box S centred above the wordmark scaled by k (k = 1 is the header size)
const k = Number(STK);
const capTop = ink.y0, inkW = ink.x1 - ink.x0;
const gapS = 0.22; // spark box bottom -> wordmark ink top, in S
const W2 = Math.max(S, inkW * k);
const sparkX = (W2 - S) / 2;
const wmY = S + gapS * S; // where the wordmark ink top lands
// wordmark transform: scale k about its ink top-left, then move to (centre, wmY)
const tx = (W2 - inkW * k) / 2 - ink.x0 * k, ty = wmY - capTop * k;
const H2 = wmY + (ink.y1 - ink.y0) * k;
const sVB = `0 0 ${r3(W2)} ${r3(H2)}`;
const wmAt = (fill) => `  <path fill="${fill}" transform="translate(${r3(tx)} ${r3(ty)}) scale(${r3(k)})" d="${wm.d}"/>`;
const SNOTE = `stacked lockup: spark box S = 30 centred above the wordmark at ${k} x header size (ink width ${r3(inkW * k / S)} S), gap ${gapS} S from the spark box to the wordmark's ink top. ${WMNOTE}`;
files['lockup-stacked.svg'] = svg(sVB, sparkAt(sparkX, 0, sparkEls(null, '    ')) + '\n' + wmAt(C.ivory), NOTE('for DARK grounds: bare spark + ivory wordmark. ' + SNOTE));
files['lockup-stacked-light.svg'] = svg(sVB, sparkAt(sparkX, 0, tileRect('    ') + '\n' + sparkEls(null, '    ')) + '\n' + wmAt(C.ink), NOTE('for LIGHT / white grounds: the tile + ink #120c0b wordmark. ' + SNOTE));
files['lockup-stacked-mono.svg'] = svg(sVB, sparkAt(sparkX, 0, sparkEls('currentColor', '    ')) + '\n' + wmAt('currentColor'), NOTE('one colour (currentColor). ' + SNOTE));

for (const [n, b] of Object.entries(files)) writeFileSync(join(OUT, n), b);
console.log(JSON.stringify({ files: Object.keys(files), horizontal: hVB, stacked: sVB, wordmark: wmVB }, null, 1));
