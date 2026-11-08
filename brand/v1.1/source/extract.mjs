// Renders the live .brand rule (css/house.css:175-176) in headless Chrome, measures it ON SCREEN,
// and prints it to PDF (Chrome embeds the variable-font instance as Type 3 glyph outlines).
import { launch } from './cdp.mjs';
import { pathToFileURL } from 'node:url';
import { writeFileSync } from 'node:fs';
const W = process.argv[2];
const c = await launch(9411);
try {
  await c.goto(pathToFileURL(W + '/wm.html').href, { width: 600, height: 200 });
  const m = await c.eval(`(() => {
    const b = document.getElementById('b'), i = document.getElementById('i');
    const tn = [...b.childNodes].find(n => n.nodeType === 3);
    const r = document.createRange(); r.selectNodeContents(tn);
    const tr = r.getBoundingClientRect(), ir = i.getBoundingClientRect(), br = b.getBoundingClientRect();
    const cs = getComputedStyle(b);
    // baseline probe: a zero-size inline-block at the baseline inside a span that replaces the text node
    const s = document.createElement('span'); s.textContent = tn.textContent; const z = document.createElement('span');
    z.style.cssText = 'display:inline-block;width:0;height:0;vertical-align:baseline'; s.appendChild(z); b.replaceChild(s, tn);
    const zr = z.getBoundingClientRect(), sr = s.getBoundingClientRect();
    const out = { img: [ir.x, ir.y, ir.width, ir.height], text: [tr.x, tr.y, tr.width, tr.height], box: [br.x, br.y, br.width, br.height],
      relX: sr.x - ir.x, relBaseline: zr.y - ir.y,
      font: cs.fontFamily, size: cs.fontSize, weight: cs.fontWeight, ls: cs.letterSpacing, osz: cs.fontOpticalSizing, fvs: cs.fontVariationSettings, lh: cs.lineHeight };
    b.replaceChild(tn, s); return out;
  })()`);
  console.log(JSON.stringify(m));
  writeFileSync(W + '/measure.json', JSON.stringify(m, null, 1));
  await c.pdf(W + '/wm.pdf');
} finally { c.close(); }
