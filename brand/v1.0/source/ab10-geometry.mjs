import { launch } from './cdp.mjs';
import { pathToFileURL } from 'node:url';
import { join } from 'node:path';
const W = process.argv[2];
const c = await launch(9415);
try {
  await c.goto(pathToFileURL(join(W, 'ab10-geometry.html')).href, { width: 1200, height: 680, dpr: 1 });
  const r = await c.eval(`(() => { const i = document.querySelector('#A img').getBoundingClientRect(); const m = document.querySelector('#B img').getBoundingClientRect(); return { a: [i.x, i.y], b: [m.x, m.y - 340] }; })()`);
  console.log(JSON.stringify(r));
  await c.shot(join(W, 'ab', 'zb-live.png'), { x: 0, y: 0, width: 1200, height: 330 });
  await c.shot(join(W, 'ab', 'zb-master.png'), { x: 0, y: 340, width: 1200, height: 330 });
} finally { c.close(); }
