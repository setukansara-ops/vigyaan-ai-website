// v1.1 proof, step 1: "region" masters. Each master keeps only magenta disks of radius 3 units at the dots of BOTH
// versions (v1.0's three, v1.1's three and the ring); everything else is removed. Rendered through export.mjs with the
// same jobs, they mark, in each export's own pixels, the only places a v1.0 -> v1.1 difference is allowed.
// usage: node region-masters.mjs <v1.1 masters dir> <out dir>
import { readFileSync, writeFileSync, readdirSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
const [, , M, OUT] = process.argv;
mkdirSync(OUT, { recursive: true });
const DOTS = [[6.6, 6.8], [25.4, 7.8], [25.8, 24.4], [6.8, 6.8], [25.2, 6.8], [25.2, 25.2], [6.8, 25.2]];
const disks = ind => DOTS.map(([x, y]) => `${ind}<circle cx="${x}" cy="${y}" r="3" fill="#ff00ff"/>`).join('\n');
for (const f of readdirSync(M).filter(n => n.endsWith('.svg'))) {
  let s = readFileSync(join(M, f), 'utf8');
  if (!/cx="6\.8" cy="25\.2"/.test(s)) { s = s.replace(/<path[^>]*\/>/g, '').replace(/<rect[^>]*\/>/g, ''); writeFileSync(join(OUT, f), s); continue; } // wordmark-only files: nothing may change
  s = s.replace(/<path[^>]*\/>\n?/g, '').replace(/<rect[^>]*\/>\n?/g, '').replace(/[ \t]*<circle cx="16" cy="16"[^>]*\/>\n?/g, '');
  s = s.replace(/([ \t]*)<circle cx="6\.8" cy="6\.8"[^>]*\/>\n[ \t]*<circle[^>]*\/>\n[ \t]*<circle[^>]*\/>\n[ \t]*<circle[^>]*\/>/g, (m, ind) => disks(ind));
  writeFileSync(join(OUT, f), s);
}
console.log('region masters written');
