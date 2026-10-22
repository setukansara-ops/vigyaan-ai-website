// Turns the PyMuPDF text-as-path SVG of Chrome's print of the live .brand lockup
// into one wordmark path in LOCKUP UNITS (1 unit = 1 CSS px of the live header, S = 30).
// usage: node outline.mjs <wm-text.svg> <measure.json> <out.json>
import { readFileSync, writeFileSync } from 'node:fs';
const [, , SVG, MEAS, OUT] = process.argv;
const src = readFileSync(SVG, 'utf8');
const meas = JSON.parse(readFileSync(MEAS, 'utf8'));

// glyph defs: <g id="font_3_NN"><path transform="matrix(a,0,0,d,0,0)" d="..."/></g>
const defs = {};
for (const m of src.matchAll(/<g id="(font_[\d_]+)">\s*<path transform="matrix\(([^)]+)\)" d="([^"]*)"\/>\s*<\/g>/g)) {
  const [a, b, c, d, e, f] = m[2].split(',').map(Number);
  if (b || c || e || f) throw new Error('unexpected glyph matrix ' + m[2]);
  defs[m[1]] = { a, d, path: m[3] };
}
// uses: <use data-text="V" xlink:href="#font_3_24" transform="matrix(14.64,0,0,-14.64,59.695314,46.5)"/>
const uses = [...src.matchAll(/<use data-text="(.)" xlink:href="#(font_[\d_]+)" transform="matrix\(([^)]+)\)"\/>/g)].map(m => {
  const [a, b, c, d, e, f] = m[3].split(',').map(Number);
  if (b || c) throw new Error('rotated glyph');
  return { ch: m[1], id: m[2], a, d, e, f };
});
if (uses.map(u => u.ch).join('') !== 'Vigyaan') throw new Error('unexpected text ' + uses.map(u => u.ch).join(''));

const PT = 4 / 3; // PDF pt -> CSS px
// lockup origin = the spark <img> box top-left, in CSS px
// placement comes from the ON-SCREEN layout (print layout snaps the img to whole px); the PDF gives shapes + relative advances

function tokens(d) { return [...d.matchAll(/[MLHVCSQTAZmlhvcsqtaz]|[-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?/g)].map(m => m[0]); }
const NARGS = { M: 2, L: 2, H: 1, V: 1, C: 6, S: 4, Q: 4, T: 2, Z: 0 };

// transform one glyph path: font units -> lockup units (x' = ox + sx*x, y' = oy + sy*y)
function xform(d, sx, sy, ox, oy) {
  const t = tokens(d); let i = 0, cmd = null; const out = [];
  const X = v => ox + sx * v, Y = v => oy + sy * v;
  while (i < t.length) {
    if (/[A-Za-z]/.test(t[i])) { cmd = t[i++]; if (cmd === 'Z' || cmd === 'z') { out.push(['Z', []]); continue; } }
    const up = cmd.toUpperCase(); const rel = cmd !== up; const n = NARGS[up];
    if (n === undefined) throw new Error('unsupported path command ' + cmd);
    if (rel) throw new Error('relative path command in glyph data: ' + cmd);
    const a = t.slice(i, i + n).map(Number); i += n;
    let p;
    if (up === 'H') p = [X(a[0])]; else if (up === 'V') p = [Y(a[0])];
    else p = a.map((v, k) => (k % 2 === 0 ? X(v) : Y(v)));
    out.push([up, p]);
    if (up === 'M') cmd = 'L'; // implicit lineto after moveto
  }
  return out;
}
const r3 = v => { let s = (Math.round(v * 1000) / 1000).toFixed(3).replace(/\.?0+$/, ''); if (s === '-0') s = '0'; return s; };
function fmt(segs) { // compact absolute path string
  let s = '', last = '';
  for (const [c, p] of segs) {
    if (c === 'Z') { s += 'Z'; last = 'Z'; continue; }
    const nums = p.map(r3).join(' ').replace(/ -/g, '-');
    s += (c === last && c !== 'M' ? ' ' : c) + nums; last = c;
  }
  return s;
}

let all = [];
const glyphs = [];
for (const u of uses) {
  const g = defs[u.id];
  // net per-unit scale: use.a * def.a (pt), y: use.d * def.d ; then pt -> px
  const sx = u.a * g.a * PT, sy = u.d * g.d * PT;
  // Chrome paints a text baseline on a whole CSS px: the live desktop header lays it out at
  // 40.390625 and PAINTS it at 40 (spark top 19), i.e. 21.0 below the spark top, not 21.390625.
  // The master follows what visitors see (verified by pixel A/B against vigyaan.ai).
  const paintedBaseline = Math.round(meas.relBaseline + 19) - 19;
  const ox = meas.relX + (u.e - uses[0].e) * PT, oy = paintedBaseline + (u.f - uses[0].f) * PT;
  const segs = xform(g.path, sx, sy, ox, oy);
  glyphs.push({ ch: u.ch, originX: ox, baseline: oy, segs });
  all.push(...segs);
}
// ink bounds: on-curve points plus each curve sampled at 64 steps
function bounds(segs) {
  let cx = 0, cy = 0, sx0 = 0, sy0 = 0; const B = { x0: 1e9, y0: 1e9, x1: -1e9, y1: -1e9 };
  const add = (x, y) => { B.x0 = Math.min(B.x0, x); B.y0 = Math.min(B.y0, y); B.x1 = Math.max(B.x1, x); B.y1 = Math.max(B.y1, y); };
  for (const [c, p] of segs) {
    if (c === 'M') { cx = p[0]; cy = p[1]; sx0 = cx; sy0 = cy; add(cx, cy); }
    else if (c === 'L') { cx = p[0]; cy = p[1]; add(cx, cy); }
    else if (c === 'H') { cx = p[0]; add(cx, cy); }
    else if (c === 'V') { cy = p[0]; add(cx, cy); }
    else if (c === 'C') { for (let t = 0; t <= 1.0001; t += 1 / 64) { const mt = 1 - t; add(mt ** 3 * cx + 3 * mt * mt * t * p[0] + 3 * mt * t * t * p[2] + t ** 3 * p[4], mt ** 3 * cy + 3 * mt * mt * t * p[1] + 3 * mt * t * t * p[3] + t ** 3 * p[5]); } cx = p[4]; cy = p[5]; }
    else if (c === 'Q') { for (let t = 0; t <= 1.0001; t += 1 / 64) { const mt = 1 - t; add(mt * mt * cx + 2 * mt * t * p[0] + t * t * p[2], mt * mt * cy + 2 * mt * t * p[1] + t * t * p[3]); } cx = p[2]; cy = p[3]; }
    else if (c === 'Z') { cx = sx0; cy = sy0; }
    else throw new Error('bounds: ' + c);
  }
  return B;
}
const ink = bounds(all);
const res = {
  units: '1 unit = 1 CSS px of the live header lockup (spark box S = 30)',
  textOrigin: glyphs[0].originX, baseline: glyphs[0].baseline,
  ink, d: fmt(all),
  glyphs: glyphs.map(g => ({ ch: g.ch, x: +g.originX.toFixed(4) })),
  emPx: uses[0].a * PT, measured: meas,
};
writeFileSync(OUT, JSON.stringify(res, null, 1));
console.log('glyphs', glyphs.length, 'path chars', res.d.length, 'ink', JSON.stringify(ink), 'baseline', res.baseline, 'em', res.emPx);
