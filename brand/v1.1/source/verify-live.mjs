// A/B against the LIVE header: shoot vigyaan.ai's .brand at DPR 4, then (in this
// headless tab only) swap the .brand contents for the master lockup SVG at the
// same CSS box and shoot the same clip again. Same page, same ground: the only
// difference left is live text vs outlined paths.
// usage: node verify-live.mjs <lockup-horizontal.svg> <outdir> [url]
import { launch } from './cdp.mjs';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
const [, , LOCK, OUT, URL = 'https://vigyaan.ai/'] = process.argv;
const b64 = readFileSync(LOCK).toString('base64');
const c = await launch(9413);
const res = {};
try {
  for (const [tag, w, h, mobile] of [['desk', 1440, 900, false], ['phone', 390, 844, true]]) {
    await c.goto(URL, { width: w, height: h, dpr: 4, mobile });
    const info = await c.eval(`(() => { const b = document.querySelector('header.site .brand'); const r = b.getBoundingClientRect(); const i = b.querySelector('img').getBoundingClientRect(); const cs = getComputedStyle(b); return { box: [r.x, r.y, r.width, r.height], img: [i.x, i.y, i.width, i.height], size: cs.fontSize, ls: cs.letterSpacing, color: cs.color, fam: cs.fontFamily, w: cs.fontWeight, loaded: document.fonts.check('600 19.52px Fraunces') }; })()`);
    const clip = { x: Math.floor(info.img[0]) - 4, y: Math.floor(info.img[1]) - 4, width: Math.ceil(info.box[2]) + 8, height: 38 };
    await c.shot(join(OUT, `live-${tag}.png`), clip);
    // the master is drawn for S = 30; on phones the header's text is 1.12rem but the spark stays 30,
    // so the phone A/B is expected to differ in the text (declared) — the desktop one is the gate.
    await c.eval(`(() => { const b = document.querySelector('header.site .brand'); const i = b.querySelector('img').getBoundingClientRect(); const top = i.y; b.textContent = ''; const m = new Image(); m.src = 'data:image/svg+xml;base64,${b64}'; m.width = 114; m.height = 30; m.style.width = "114px"; m.style.height = '30px'; m.alt=''; b.appendChild(m); return new Promise(r => m.decode().then(() => r(1))); })()`);
    await new Promise(r => setTimeout(r, 300));
    const after = await c.eval(`(() => { const i = document.querySelector('header.site .brand img').getBoundingClientRect(); return [i.x, i.y, i.width, i.height]; })()`);
    await c.shot(join(OUT, `master-${tag}.png`), clip);
    res[tag] = { info, after, clip };
  }
} finally { c.close(); }
console.log(JSON.stringify(res, null, 1));
