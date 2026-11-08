// Renders every PNG export from the SVG masters in headless Chrome (Skia), transparent unless a ground is given.
// usage: node export.mjs <masters dir> <exports dir> <tools dir>
import { launch } from './cdp.mjs';
import { pathToFileURL } from 'node:url';
import { readFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
const [, , M, E, T] = process.argv;
const vb = f => readFileSync(join(M, f), 'utf8').match(/viewBox="([^"]+)"/)[1].split(/\s+/).map(Number);
const jobs = [];
const SQ = [16, 32, 48, 64, 128, 180, 192, 256, 512, 1024];
for (const n of SQ) jobs.push(['spark.svg', `spark/spark-${n}.png`, n, n]);
for (const n of SQ) jobs.push(['spark-tile.svg', `tile/spark-tile-${n}.png`, n, n]);
for (const n of [64, 128, 256, 512, 1024]) { jobs.push(['mono-light.svg', `mono/mono-light-${n}.png`, n, n]); jobs.push(['mono-dark.svg', `mono/mono-dark-${n}.png`, n, n]); }
const lock = (f, base, hs) => { const [, , w, h] = vb(f); for (const H of hs) { const W = Math.round(H * w / h); jobs.push([f, `lockup/${base}-h${H}.png`, W, H]); } };
lock('lockup-horizontal.svg', 'lockup-horizontal', [32, 48, 64, 128, 256, 512, 1024]);
lock('lockup-horizontal-light.svg', 'lockup-horizontal-light', [32, 48, 64, 128, 256, 512, 1024]);
lock('lockup-stacked.svg', 'lockup-stacked', [48, 64, 128, 256, 512, 1024]);
lock('lockup-stacked-light.svg', 'lockup-stacked-light', [48, 64, 128, 256, 512, 1024]);
for (const n of [16, 32, 48]) jobs.push(['spark-tile.svg', `icons/favicon-${n}.png`, n, n]);
jobs.push(['spark-tile.svg', 'icons/logo-512.png', 512, 512]);
jobs.push(['spark-tile-square.svg', 'icons/apple-touch-180.png', 180, 180, '#120c0b']);
jobs.push(['spark-avatar.svg', 'icons/android-maskable-192.png', 192, 192, '#120c0b']);
jobs.push(['spark-avatar.svg', 'icons/android-maskable-512.png', 512, 512, '#120c0b']);
jobs.push(['spark-avatar.svg', 'social/social-avatar-1024.png', 1024, 1024, '#120c0b']);
// email signature lockups (2x pixels): light = tile + ink word on white, S 48 css at x0 y4 in 192x56;
// dark = bare spark + ivory word on house night, S 40 css at x12 y8 in 176x56
jobs.push(['lockup-horizontal-light.svg', 'email/sig-lockup-light@2x.png', 384, 112, '#ffffff', 0, 8, 364.8, 96]);
jobs.push(['lockup-horizontal.svg', 'email/sig-lockup-dark@2x.png', 352, 112, '#0f0b0a', 24, 16, 304, 80]);
const c = await launch(9417);
const page = pathToFileURL(join(T, 'render.html')).href;
const out = [];
try {
  for (const [src, dst, w, h, bg = '', x = 0, y = 0, iw = w, ih = h] of jobs) {
    mkdirSync(join(E, dst, '..'), { recursive: true });
    const u = `${page}?src=${encodeURIComponent(pathToFileURL(join(M, src)).href)}&w=${w}&h=${h}&iw=${iw}&ih=${ih}&x=${x}&y=${y}&bg=${encodeURIComponent(bg)}`;
    await c.goto(u, { width: w, height: h, dpr: 1, transparent: true });
    await c.eval(`document.getElementById('i').decode().then(()=>1)`);
    await c.shot(join(E, dst), { x: 0, y: 0, width: w, height: h });
    out.push([dst, w, h, bg ? 'opaque ' + bg : 'transparent']);
  }
} finally { c.close(); }
console.log(JSON.stringify(out));
