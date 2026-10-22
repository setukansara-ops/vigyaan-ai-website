// Minimal headless-Chrome driver over the DevTools protocol (node 24: global WebSocket + fetch).
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const sleep = ms => new Promise(r => setTimeout(r, ms));

export async function launch(port = 9411) {
  const prof = join(tmpdir(), 'vigyaan-brandkit-chrome-' + port); mkdirSync(prof, { recursive: true });
  const proc = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${prof}`,
    '--hide-scrollbars', '--no-first-run', '--no-default-browser-check', '--allow-file-access-from-files',
    '--force-color-profile=srgb', '--font-render-hinting=none', 'about:blank'], { stdio: 'ignore' });
  let t;
  for (let i = 0; i < 80; i++) { try { const r = await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT' }); if (r.ok) { t = await r.json(); break; } } catch {} await sleep(200); }
  if (!t) throw new Error('chrome did not start');
  const ws = new WebSocket(t.webSocketDebuggerUrl); let id = 0; const pend = new Map(); const waiters = [];
  ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { const p = pend.get(m.id); pend.delete(m.id); m.error ? p.rej(new Error(JSON.stringify(m.error))) : p.res(m.result); } else if (m.method) { for (const w of [...waiters]) if (w.m === m.method) { waiters.splice(waiters.indexOf(w), 1); w.r(m.params); } } };
  await new Promise(ok => ws.onopen = ok);
  const send = (method, params = {}) => new Promise((res, rej) => { const i = ++id; pend.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method, params })); });
  const once = m => new Promise(r => waiters.push({ m, r }));
  await send('Page.enable'); await send('Runtime.enable');
  const api = {
    send,
    async goto(url, { width = 1200, height = 800, dpr = 1, transparent = false, mobile = false } = {}) {
      await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: dpr, mobile });
      await send('Emulation.setDefaultBackgroundColorOverride', transparent ? { color: { r: 0, g: 0, b: 0, a: 0 } } : {});
      const l = once('Page.loadEventFired'); await send('Page.navigate', { url }); await Promise.race([l, sleep(20000)]);
      await api.eval('document.fonts.ready.then(()=>1)'); await sleep(300);
    },
    async eval(expr) { const r = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true }); if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails)); return r.result.value; },
    async shot(out, clip) { const p = { format: 'png', captureBeyondViewport: false }; if (clip) p.clip = { ...clip, scale: 1 }; const r = await send('Page.captureScreenshot', p); writeFileSync(out, Buffer.from(r.data, 'base64')); },
    async pdf(out, opts = {}) { const r = await send('Page.printToPDF', { printBackground: false, preferCSSPageSize: true, ...opts }); writeFileSync(out, Buffer.from(r.data, 'base64')); },
    close() { try { ws.close(); } catch {} proc.kill(); },
  };
  return api;
}
