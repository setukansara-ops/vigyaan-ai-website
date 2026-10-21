// Computed-style checks in real Chrome, at 1440 and 390, on every page:
//  1. every button-like control (.btn, .store, .pill-sm, helpline pills, menu store links):
//     text colour differs from its effective background, contrast >= 4.5:1, no underline on .btn
//  2. Aura pages: no reading text sits outside the star-free content column
//     (the star layer is masked to the margins beyond 50% +/- 36rem)
//  3. no sideways scroll
// usage: node tools/check-computed.mjs <base-url>   (serve the site first; CHROME=<path> to override)
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PORT = 9367; const B = process.argv[2] || 'http://127.0.0.1:8794';
const prof = join(tmpdir(), 'vigyaan-check-computed'); mkdirSync(prof, { recursive: true });
const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${prof}`, '--hide-scrollbars', '--no-first-run', 'about:blank'], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function target() { for (let i = 0; i < 60; i++) { try { const r = await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, { method: 'PUT' }); if (r.ok) return r.json(); } catch {} await sleep(200); } throw new Error('no chrome'); }
function client(u) { const ws = new WebSocket(u); let id = 0; const pend = new Map(); const w = [];
  ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { const p = pend.get(m.id); pend.delete(m.id); m.error ? p.rej(new Error(JSON.stringify(m.error))) : p.res(m.result); } else if (m.method) { for (const x of [...w]) if (x.m === m.method) { w.splice(w.indexOf(x), 1); x.r(m.params); } } };
  return new Promise(ok => ws.onopen = () => ok({ send: (method, params = {}) => new Promise((res, rej) => { const i = ++id; pend.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method, params })); }), once: m => new Promise(r => w.push({ m, r })), close: () => ws.close() })); }
const PAGES = ['/', '/aura/', '/aura/get/', '/aura/privacy.html', '/aura/terms.html', '/aura/delete-account.html', '/aura/campus/', '/attars/', '/attars/first-rain/', '/attars/night-bloom/', '/attars/jasmine/', '/attars/discovery-trio/', '/cart/', '/studio/', '/wholesale/', '/no-such-page/'];
const PROBE = `(() => {
  const parse = c => { const m = c.match(/rgba?\\(([^)]+)\\)/); if (!m) return null; const p = m[1].split(/[ ,\\/]+/).filter(Boolean).map(Number); return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 }; };
  const lum = ({ r, g, b }) => { const f = v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }; return .2126 * f(r) + .7152 * f(g) + .0722 * f(b); };
  const over = (top, bot) => ({ r: top.r * top.a + bot.r * (1 - top.a), g: top.g * top.a + bot.g * (1 - top.a), b: top.b * top.a + bot.b * (1 - top.a), a: 1 });
  const effBg = el => { let stack = []; for (let e = el; e; e = e.parentElement) { const c = parse(getComputedStyle(e).backgroundColor); if (c && c.a > 0) { stack.push(c); if (c.a >= 1) break; } } let base = parse(getComputedStyle(document.documentElement).backgroundColor) || { r: 0, g: 0, b: 0, a: 1 }; for (const c of stack.reverse()) base = over(c, base); return base; };
  const out = [];
  for (const el of document.querySelectorAll('.btn, .store, .pill-sm, .lines .nums a, .menu .get .row a, .door .go .alt, .fact a')) {
    const cs = getComputedStyle(el); if (cs.display === 'none' || cs.visibility === 'hidden' || !el.getClientRects().length) continue;
    const fg = parse(cs.color); const bg = effBg(el); const fgc = over(fg, bg);
    const L1 = lum(fgc), L2 = lum(bg); const ratio = (Math.max(L1, L2) + .05) / (Math.min(L1, L2) + .05);
    const und = el.classList.contains('btn') && cs.textDecorationLine !== 'none';
    if (ratio < 4.5 || und) out.push({ text: el.textContent.trim().replace(/\\s+/g, ' ').slice(0, 40), ratio: +ratio.toFixed(2), underline: und });
  }
  let outside = [];
  if (document.body.dataset.world === 'aura') {
    const vw = document.documentElement.clientWidth, rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
    const lo = vw / 2 - 36 * rem, hi = vw / 2 + 36 * rem;
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let n; (n = walker.nextNode());) {
      if (!n.textContent.trim()) continue; const p = n.parentElement; if (!p || p.closest('[aria-hidden="true"], script, style, .skip, .menu')) continue;
      const r = document.createRange(); r.selectNodeContents(n); for (const rc of r.getClientRects()) { if (rc.width && (rc.left < lo - 1 || rc.right > hi + 1)) { outside.push(n.textContent.trim().slice(0, 30)); break; } }
    }
  }
  return { bad: out, outside: [...new Set(outside)].slice(0, 6), sw: document.documentElement.scrollWidth, vw: document.documentElement.clientWidth };
})()`;
let fails = 0;
try {
  const t = await target(); const c = await client(t.webSocketDebuggerUrl);
  await c.send('Page.enable'); await c.send('Runtime.enable');
  for (const [tag, w, h, mobile] of [['desk', 1440, 900, false], ['phone', 390, 844, true]]) {
    await c.send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile });
    for (const p of PAGES) {
      const l = c.once('Page.loadEventFired'); await c.send('Page.navigate', { url: B + p }); await Promise.race([l, sleep(15000)]);
      await c.send('Runtime.evaluate', { expression: 'document.fonts.ready.then(()=>1)', awaitPromise: true }); await sleep(250);
      const r = (await c.send('Runtime.evaluate', { expression: PROBE, returnByValue: true })).result.value;
      const ok = !r.bad.length && !r.outside.length && r.sw <= r.vw;
      if (!ok) fails++;
      console.log(`${ok ? 'OK ' : 'BAD'} ${tag} ${p}` + (r.bad.length ? ' low-contrast/underlined: ' + JSON.stringify(r.bad) : '') + (r.outside.length ? ' text outside star-free column: ' + JSON.stringify(r.outside) : '') + (r.sw > r.vw ? ` sideways scroll ${r.sw}>${r.vw}` : ''));
    }
  }
  c.close();
} finally { chrome.kill(); }
console.log(fails ? `${fails} BAD` : 'ALL OK'); process.exit(fails ? 1 : 0);
