import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
// tools/lint.mjs — static checks over every page:  node tools/lint.mjs
// (computed-style checks that need a browser are in tools/check-computed.mjs)
const ROOT = fileURLToPath(new URL('..', import.meta.url));
const pages = [];
(function walk(d) { for (const n of readdirSync(d)) { if (['.git', 'wip', 'tools', 'docs'].includes(n)) continue; const p = join(d, n); if (statSync(p).isDirectory()) walk(p); else if (n.endsWith('.html')) pages.push(p); } })(ROOT);
let issues = 0; const say = (f, m) => { issues++; console.log('ISSUE', relative(ROOT, f), m); };
for (const f of pages) {
  const s = readFileSync(f, 'utf8'); const rel = relative(ROOT, f).split(String.fromCharCode(92)).join('/');
  const isGet = rel === 'aura/get/index.html';
  for (const tag of ['<title>', 'name="description"', 'property="og:title"', 'property="og:image"']) if (!s.includes(tag) && rel !== '404.html') say(f, 'missing ' + tag);
  if (!isGet && !s.includes('rel="canonical"') && rel !== '404.html') say(f, 'missing canonical');
  if (!s.includes('/_vercel/insights/script.js')) say(f, 'missing analytics beacon');
  if (!s.includes('<!--email_off-->')) say(f, 'missing email_off');
  const body = s.slice(s.indexOf('<body'));
  for (const m of body.matchAll(/<img\b[^>]*>/g)) { const t = m[0]; if (!/\salt="/.test(t)) say(f, 'img without alt: ' + t.slice(0, 80)); if (!(/\swidth="/.test(t) && /\sheight="/.test(t))) say(f, 'img without width/height: ' + t.slice(0, 80)); }
  const hs = [...body.replace(/<!--[\s\S]*?-->/g, '').matchAll(/<h([1-6])\b/g)].map(m => +m[1]);
  { const n1 = hs.filter(h => h === 1).length; if (n1 !== 1) say(f, 'h1 count ' + n1); for (let i = 1; i < hs.length; i++) if (hs[i] > hs[i - 1] + 1) { say(f, `heading skip h${hs[i - 1]}->h${hs[i]}`); break; } }
  for (const m of body.matchAll(/href="([^"]*shop[^"]*)"/g)) say(f, 'link to old /shop: ' + m[1]);
  if (/dp-warm-oil-stars-1024\.png/.test(body)) say(f, '1.15MB PNG still rendered');
  const vis = body.replace(/<!--[\s\S]*?-->/g, ' ');
  if (/\bPlus\b/.test(vis) && !rel.includes('terms.html')) say(f, '"Plus" in copy');
  if (/tailwindcss|font-awesome/.test(s)) say(f, 'tailwind/font-awesome still loaded');
  if (/all-day oil|Forgot password|Settings &rarr; Account|run on hardware Vigyaan|never the recording|first 30 days|verified at the door|14 days|in the morning, in the morning/i.test(vis)) say(f, 'stale copy phrase present');
  // review round 2 (the 20 R1/R2 findings)
  const stale = [
    [/Your streak/i, 'T4 streak'],
    [/no server call at all/i, 'T4 campus breathing'],
    [/only to answer/i, 'T5 only to answer'],
    [/only for that job/i, 'T5 only for that job'],
    [/except on voice calls/i, 'T2 sensitive memories'],
    [/(?<!trio of )any three,? (for )?\$18/i, 'T3 trio price'],
    [/Terms of Use/, 'C13 Terms of Service'],
    [/iCall &middot; Vandrevala/, 'T1 iCall listed as 24/7'],
    [/on your <em>Your voice<\/em>/, 'C13 your Your voice'],
    [/1860-2662-345/, 'stale Vandrevala number'],
    [/release app, on a made-up demo account\.</, 'T6 caption without the test-server note'],
  ];
  for (const [re, why] of stale) if (re.test(vis)) say(f, 'stale: ' + why);
  // 6 ml must not break: check visible text nodes only (attributes and the legal pages are exempt)
  if (!/aura\/(privacy|terms|delete-account)\.html/.test(rel)) {
    for (const m of vis.matchAll(/>([^<]*)</g)) if (/\d ml\b/.test(m[1])) { say(f, 'C11 "6 ml" without nbsp: ' + m[1].trim().slice(0, 60)); break; }
  }
  if (/class="dot-(aura|attar)"|door-aura|door-attar/.test(s)) say(f, 'C7 line-keyed class still used');
  // brand kit v1.0: the header/footer mark is the frozen spark; retired Vigyaan marks never come back
  for (const m of body.matchAll(/<a class="f?brand"[^>]*>\s*<img src="([^"]+)"/g)) if (m[1] !== '/assets/logo/spark.svg') say(f, 'brand mark is not /assets/logo/spark.svg: ' + m[1]);
  const retired = s.match(/dp-(?:warm-oil-stars|warm-oil|warm-gold|warm-rings|dark|gradient|wordmark)-1024\.png|vigyaan-mark(?:-mono)?\.svg|vigyaan-icon\.svg|assets\/brand\/mark\.png/);
  if (retired) say(f, 'retired Vigyaan mark referenced (brand/v1.0/BRAND.md section 10): ' + retired[0]);
}

// Brand kit v1.0 gate. brand/v1.0/ is FINAL: a change is a new version folder on the founder's
// explicit word, never an edit (brand/v1.0/BRAND.md section 12). This fails when
//  - any file under brand/v1.0/ is not byte-identical to its SHA256SUMS line (or is not listed),
//  - a listed masters/ or exports/ file is missing,
//  - assets/logo/spark.svg (the live header + footer mark) drifts from the kit's masters/spark.svg.
{
  const KIT = join(ROOT, 'brand', 'v1.0');
  const SPARK_SHA = '3db121447238d2c78a3c809599c31ce85260a07133e4430686e0d3f0f686c824'; // spark.svg at ecc9f99e = brand/v1.0/masters/spark.svg
  const sha = buf => createHash('sha256').update(buf).digest('hex');
  const sums = new Map();
  for (const line of readFileSync(join(KIT, 'SHA256SUMS'), 'utf8').split('\n')) { const m = line.match(/^([0-9a-f]{64}) [ *](.+)$/); if (m) sums.set(m[2], m[1]); }
  (function walk(d) { for (const n of readdirSync(d)) { const p = join(d, n); if (statSync(p).isDirectory()) { walk(p); continue; }
    const rel = relative(KIT, p).split(String.fromCharCode(92)).join('/'); if (rel === 'SHA256SUMS') continue;
    if (!sums.has(rel)) say(p, 'brand kit: file not in brand/v1.0/SHA256SUMS (v1.0 is frozen; a change is a new version folder)');
    else if (sha(readFileSync(p)) !== sums.get(rel)) say(p, 'brand kit: CHANGED, no longer matches SHA256SUMS (v1.0 is frozen; restore it from git)'); } })(KIT);
  for (const rel of sums.keys()) if (/^(masters|exports)\//.test(rel) && !existsSync(join(KIT, rel))) say(join(KIT, rel), 'brand kit: listed file missing');
  if (sums.get('masters/spark.svg') !== SPARK_SHA) say(join(KIT, 'SHA256SUMS'), 'brand kit: masters/spark.svg is not the ecc9f99e spark');
  // a Windows checkout (core.autocrlf) holds this text file with CRLF; compare the committed (LF) form
  const live = readFileSync(join(ROOT, 'assets', 'logo', 'spark.svg'), 'utf8').replace(/\r\n/g, '\n');
  if (sha(live) !== SPARK_SHA) say(join(ROOT, 'assets', 'logo', 'spark.svg'), 'the live mark drifted from brand/v1.0/masters/spark.svg (founder\'s explicit word + a new kit version first)');
}
console.log(pages.length, 'pages,', issues, 'issues');
process.exit(issues ? 1 : 0);
