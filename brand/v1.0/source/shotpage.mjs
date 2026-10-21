import { launch } from './cdp.mjs';
import { pathToFileURL } from 'node:url';
const [, , FILE, OUT, W = '1200', H = '800', DPR = '1', TR = '0'] = process.argv;
const c = await launch(9416);
try {
  const url = /^https?:/.test(FILE) ? FILE : pathToFileURL(FILE).href;
  await c.goto(url, { width: +W, height: H === 'auto' ? 900 : +H, dpr: +DPR, transparent: TR === '1', mobile: +W < 600 });
  if (H === 'auto') { const h = await c.eval('Math.ceil(Math.max(document.body.getBoundingClientRect().bottom, ...[...document.body.children].map(e => e.getBoundingClientRect().bottom)))'); await c.goto(url, { width: +W, height: h, dpr: +DPR, transparent: TR === '1', mobile: +W < 600 }); }
  await c.shot(OUT);
} finally { c.close(); }
