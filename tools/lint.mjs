import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
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
  // Attars are coming soon (founder D36/D45, Oct 2026): no single price, no old trio price, no
  // request/order flow, no JSON-LD offers, Vigyaan(TM) never (R), net contents only as 0.20 fl oz (6 ml).
  // Checked on the whole file, head (meta, OG, JSON-LD) included. (This block sits here, not at the end
  // of the loop, so a gate appended at the end on another branch, e.g. feat/brand-kit, merges cleanly.)
  const d45 = [
    [/\$8\b|\$18\b|trio of any three/i, 'D36 single or old trio price'],
    [/data-add|data-bagcount|Add to request list|Your request list|Request now|confirm before any payment/i, 'D45 request/order flow'],
  ];
  // The (R) check skips brand/: a brand-usage page may quote the rule itself ("Vigyaan(TM), never (R)").
  if (!rel.startsWith('brand/')) d45.push([/®|&reg;/, 'brand is Vigyaan&trade;, never &reg;']);
  for (const [re, why] of d45) if (re.test(s)) say(f, 'D45: ' + why);
  // (attar pages only: Aura's MobileApplication JSON-LD carries its real free-app offer)
  if (/<body data-world="attar"/.test(s) && /"offers"\s*:/.test(s)) say(f, 'D45: JSON-LD offer while nothing is on sale');
  for (const m of s.matchAll(/([\d.]+)(?:&nbsp;| )fl(?:&nbsp;| )oz((?:&nbsp;| )\(6(?:&nbsp;| )ml\))?/g)) if (m[1] !== '0.20' || !m[2]) say(f, 'D45: net contents not "0.20 fl oz (6 ml)": ' + m[0]);
  // In visible text the figure never breaks across lines (no plain space anywhere inside it), and any
  // page whose visible text describes a roll-on shows the full figure at least once.
  { const NC = '0.20&nbsp;fl&nbsp;oz&nbsp;(6&nbsp;ml)'; let shown = false;
    for (const m of vis.matchAll(/>([^<]*)</g)) {
      for (const n of m[1].matchAll(/0\.20(?:&nbsp;| )fl(?:&nbsp;| )oz(?:&nbsp;| )\(6(?:&nbsp;| )ml\)/g)) { if (n[0] === NC) shown = true; else say(f, 'D45: net contents can break across lines (write ' + NC + '): ' + n[0]); }
    }
    if (/>[^<]*roll-on/i.test(vis) && !shown) say(f, 'D45: describes a roll-on but never shows "0.20 fl oz (6 ml)"');
  }
  // Pinned: the alcohol-free wording stays exactly as it is until the founder rules otherwise
  // ("keep the alcohol free tag as is", 2026-10-21). Changing these lines is a declared decision.
  if (rel === 'attars/index.html') {
    if (!s.includes('<textPath href="#sealpath">ALCOHOL-FREE · 6 ML ROLL-ON · OIL · </textPath>')) say(f, 'pin: alcohol-free seal changed');
    if (!s.includes('Scent you wear <em>close</em>, not a cloud of alcohol.')) say(f, 'pin: hero line changed');
  }
  if (s.includes('<!-- shell:footer') && !s.includes('<p class="note">Alcohol-free perfume oils. Cosmetics, not medicine.</p>')) say(f, 'pin: footer note changed');
  // 6 ml must not break: check visible text nodes only (attributes and the legal pages are exempt)
  if (!/aura\/(privacy|terms|delete-account)\.html/.test(rel)) {
    for (const m of vis.matchAll(/>([^<]*)</g)) if (/\d ml\b/.test(m[1])) { say(f, 'C11 "6 ml" without nbsp: ' + m[1].trim().slice(0, 60)); break; }
  }
  if (/class="dot-(aura|attar)"|door-aura|door-attar/.test(s)) say(f, 'C7 line-keyed class still used');
}
console.log(pages.length, 'pages,', issues, 'issues');
process.exit(issues ? 1 : 0);
