// tools/shell.mjs — the one place the shared shell (head links, header, phone
// menu, footer, page scripts) is written. The site stays plain static HTML:
// this script rewrites the blocks between marker comments in every page, so
// what Vercel serves is exactly what is committed.
//
//   node tools/shell.mjs          rewrite every page in place
//   node tools/shell.mjs --check  exit 1 if any page is out of date
//
// Markers (the JSON options are optional):
//   <!-- shell:head {"world":"aura"} --> … <!-- /shell:head -->
//   <!-- shell:header {"world":"attar","current":"attar"} --> … <!-- /shell:header -->
//   <!-- shell:footer --> … <!-- /shell:footer -->
//   <!-- shell:scripts --> … <!-- /shell:scripts -->
//
// A NEW LINE, every step (the same list heads css/house.css):
//   1. css/house.css: a [data-world="<key>"] token block with every token the
//      Aura and Attars blocks set (--bg … --accent-ink, --glow, --halo,
//      --door-bg, --door-texture), plus a body[data-world="<key>"] background
//   2. LINES below: key, name, href, brand, dot + dotGlow colours, menuNote,
//      footer links and note. Then run this script: the header, phone menu,
//      footer column (and the footer's --lines column count), the footer's
//      brand list and every dot are written from LINES
//   3. copy /attars/ to /<line>/ (products at /<line>/<product>/)
//   4. home page: one <article class="door" data-world="<key>"> in .doors;
//      the door takes its colours from the token block, no CSS of its own
//
// tools/ is excluded from the deploy by .vercelignore.

import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const APPSTORE = 'https://apps.apple.com/app/id6771584896';
const PLAY = 'https://play.google.com/store/apps/details?id=ai.vigyaan.aura';

// The lines, in the order they appear in the nav, the menu and the footer.
const LINES = [
  {
    key: 'aura', name: 'Aura', href: '/aura/', menuNote: 'the app',
    brand: 'Aura by Vigyaan&trade;', dot: '#a78bfa', dotGlow: '#7c3aed',
    footer: [
      ['Get the app', '/aura/get/'],
      ['Meet Aura', '/aura/'],
      ['Help &amp; support', '/aura/#support'],
      ['Privacy Policy', '/aura/privacy.html'],
      ['Terms of Service', '/aura/terms.html'],
      ['Delete your account', '/aura/delete-account.html'],
      ['For campuses', '/aura/campus/'],
    ],
    note: 'A wellness companion for adults 18+. Not therapy, and not a crisis service.',
  },
  {
    key: 'attar', name: 'Attars', href: '/attars/', menuNote: 'the oils',
    brand: 'Attars by Vigyaan&trade;', dot: '#d9b26a', dotGlow: 'rgba(217,170,96,.8)',
    footer: [
      ['The oils', '/attars/#oils'],
      ['The 3-pack &middot; coming soon', '/attars/discovery-trio/'],
      ['Wholesale', '/wholesale/'],
    ],
    note: 'Alcohol-free perfume oils. Cosmetics, not medicine.',
  },
];

const APPLE_SVG = '<svg viewBox="0 0 384 512" fill="currentColor" aria-hidden="true"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/></svg>';
const PLAY_SVG = '<svg viewBox="0 0 512 512" aria-hidden="true"><path fill="#00d7fe" d="M47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0z"/><path fill="#00f076" d="M325.3 234.3 104.6 13l280.8 161.2-60.1 60.1z"/><path fill="#ffce00" d="M472.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8z"/><path fill="#ff3a44" d="M104.6 499l280.8-161.2-60.1-60.1L104.6 499z"/></svg>';
const MENU_SVG = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true"><path d="M4 8h16M4 16h16"/></svg>';

const dot = key => { const l = LINES.find(x => x.key === key); return `<span class="dot" style="--dot:${l.dot};--dot-glow:${l.dotGlow}" aria-hidden="true"></span>`; };
const cur = on => (on ? ' aria-current="page"' : '');

function head({ world = 'house' } = {}) {
  const icon = world === 'aura'
    ? '<link rel="icon" type="image/png" sizes="192x192" href="/assets/aura/icon-192.png">\n<link rel="apple-touch-icon" href="/assets/aura/icon-192.png">'
    : '<link rel="icon" type="image/svg+xml" href="/assets/logo/favicon.svg">\n<link rel="icon" type="image/png" sizes="32x32" href="/assets/logo/favicon-32.png">\n<link rel="apple-touch-icon" href="/assets/logo/apple-touch-180.png">';
  return `
${icon}
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400..700;1,9..144,400..700&amp;family=Outfit:wght@300..600&amp;display=swap">
<link rel="stylesheet" href="/css/house.css">
`;
}

function header({ world = 'house', current = '' } = {}) {
  const line = LINES.find(l => l.key === world);
  const crumb = line ? `\n    <a class="crumb" href="${line.href}">${line.name}</a>` : '';
  const desk = [
    ...LINES.map(l => `      <a href="${l.href}"${cur(current === l.key)}>${dot(l.key)}${l.name}</a>`),
    `      <a href="/studio/"${cur(current === 'studio')}>Studio</a>`,
    world === 'aura' ? `      <a href="/aura/#support"${cur(current === 'help')}>Help</a>` : '',
    world === 'attar' ? `      <a href="/wholesale/"${cur(current === 'wholesale')}>Wholesale</a>` : '',
  ].filter(Boolean).join('\n');
  const end = [
    // On /aura/ itself the pill jumps to the store badges in the hero; on the
    // chooser it is not shown (that page IS the chooser); elsewhere it opens it.
    world === 'aura' && current !== 'get' ? `      <a class="pill-sm" href="${current === 'aura' ? '#get' : '/aura/get/'}">Get the app</a>` : '',
  ].filter(Boolean).join('\n');
  const here = '<small>you are here</small>';
  const panel = [
    `          <a href="/"${cur(current === 'home')}><span>Vigyaan</span>${current === 'home' ? here : '<small>home</small>'}</a>`,
    ...LINES.map(l => `          <a href="${l.href}"${cur(current === l.key)}><span>${dot(l.key)}${l.name}</span>${current === l.key ? here : `<small>${l.menuNote}</small>`}</a>`),
    `          <a href="/studio/"${cur(current === 'studio')}><span>Studio</span>${current === 'studio' ? here : '<small>about us</small>'}</a>`,
    world === 'attar' ? `          <a href="/attars/discovery-trio/"><span>The 3-pack</span><small>coming soon</small></a>` : '',
    world === 'attar' ? `          <a href="/wholesale/"${cur(current === 'wholesale')}><span>Wholesale</span><small>for shops</small></a>` : '',
    `          <a href="/aura/#support"><span>Aura help</span><small>support</small></a>`,
  ].filter(Boolean).join('\n');
  return `
<header class="site">
  <div class="wrap navrow">
    <a class="brand" href="/" aria-label="Vigyaan, home"><img src="/assets/logo/spark.svg" alt="" width="30" height="30">Vigyaan</a>${crumb}
    <nav class="desk" aria-label="Main">
${desk}
    </nav>
    <div class="nav-end">
${end ? end + '\n' : ''}      <details class="menu">
        <summary aria-label="Menu">${MENU_SVG}</summary>
        <nav class="panel" aria-label="Menu">
${panel}
          <div class="get">
            <p>Get Aura</p>
            <div class="row">
              <a href="${APPSTORE}" aria-label="Get Aura on the App Store">${APPLE_SVG}App Store</a>
              <a href="${PLAY}" aria-label="Get Aura on Google Play">${PLAY_SVG}Google Play</a>
            </div>
          </div>
        </nav>
      </details>
    </div>
  </div>
</header>
`;
}

function footer() {
  const cols = LINES.map(l => `      <div>
        <h2>${dot(l.key)}${l.name}</h2>
        <ul>
${l.footer.map(([t, h]) => `          <li><a href="${h}">${t}</a></li>`).join('\n')}
        </ul>
        <p class="note">${l.note}</p>
      </div>`).join('\n');
  return `
<footer class="site">
  <div class="wrap">
    <div class="fgrid" style="--lines:${LINES.length}">
      <div class="about">
        <a class="fbrand" href="/"><img src="/assets/logo/spark.svg" alt="" width="30" height="30">Vigyaan</a>
        <p class="muted small" style="margin-top:.9rem;max-width:20rem">A small house in New Jersey. We make a few things, slowly, and name the next one when it&rsquo;s real.</p>
      </div>
${cols}
      <div>
        <h2>Write to us</h2>
        <ul>
          <li><span class="mail-k">Aura help</span><a class="mail" href="mailto:support@vigyaan.ai">support@vigyaan.ai</a></li>
          <li><span class="mail-k">Privacy &amp; your data</span><a class="mail" href="mailto:privacy@vigyaan.ai">privacy@vigyaan.ai</a></li>
          <li><span class="mail-k">Attars &amp; the studio</span><a class="mail" href="mailto:setu@vigyaan.ai">setu@vigyaan.ai</a></li>
          <li><a href="/studio/">About the studio</a></li>
        </ul>
      </div>
    </div>
    <div class="fbottom">
      <span>&copy; 2026 Vigyaan LLC &middot; New Jersey</span>
      <span>${LINES.map(l => l.brand).join(' &middot; ')}</span>
    </div>
  </div>
</footer>
`;
}

function scripts() {
  return `
<script src="/js/site.js" defer></script>
<script defer src="/_vercel/insights/script.js"></script>
`;
}

const BLOCKS = { head, header, footer, scripts };
const RE = /<!-- shell:(head|header|footer|scripts)(?:\s+(\{[^]*?\}))?\s*-->[^]*?<!-- \/shell:\1 -->/g;

function pages(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    if (name.startsWith('.') || ['node_modules', 'wip', 'tools'].includes(name)) continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...pages(p));
    else if (name.endsWith('.html')) out.push(p);
  }
  return out;
}

const check = process.argv.includes('--check');
let stale = 0, touched = 0;
for (const file of pages(ROOT)) {
  const src = readFileSync(file, 'utf8');
  if (!src.includes('<!-- shell:')) continue;
  const next = src.replace(RE, (_m, kind, json) => {
    const opts = json ? JSON.parse(json) : {};
    const open = `<!-- shell:${kind}${json ? ' ' + json : ''} -->`;
    return `${open}${BLOCKS[kind](opts)}<!-- /shell:${kind} -->`;
  });
  touched++;
  if (next !== src) {
    stale++;
    if (check) console.log('out of date:', relative(ROOT, file));
    else { writeFileSync(file, next); console.log('updated:', relative(ROOT, file)); }
  }
}
console.log(`${touched} page(s) with a shell, ${stale} ${check ? 'out of date' : 'rewritten'}`);
if (check && stale) process.exit(1);
