/* Vigyaan — shared page script (every page; it does nothing where its hooks are absent).
 *
 * 1. Phone menu: the <details class="menu"> works without JS; this adds Esc and
 *    tap-outside to close it.
 * 2. The request list (attars today, any physical line later). The storage
 *    contract is UNCHANGED from the first shop, so lists people already built
 *    keep working:
 *      localStorage['vigyaan-request'] =
 *        {state:{lines:[{id, slug, name, price, qty, scents}]}}
 *    single oil: id = slug = 'first-rain', scents = null
 *    trio:       id = 'discovery-trio:<a>+<b>+<c>', slug = 'discovery-trio', scents = [a,b,c]
 *    Every storage access is wrapped: in Safari private mode, or with site data
 *    blocked, reads come back empty and a failed save says so instead of
 *    failing silently.
 */
(function () {
  'use strict';

  /* ---------- 1. phone menu ---------- */
  var menus = document.querySelectorAll('details.menu');
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    menus.forEach(function (m) {
      if (m.open) { m.open = false; var s = m.querySelector('summary'); if (s) s.focus(); }
    });
  });
  document.addEventListener('click', function (e) {
    menus.forEach(function (m) { if (m.open && !m.contains(e.target)) m.open = false; });
  });

  /* ---------- 2. request list ---------- */
  var KEY = 'vigyaan-request';
  var NAMES = { 'first-rain': 'First Rain', 'night-bloom': 'Night Bloom', 'jasmine': 'Jasmine' };

  function load() {
    try {
      var d = JSON.parse(window.localStorage.getItem(KEY));
      if (d && d.state && Array.isArray(d.state.lines)) return d;
    } catch (e) { /* blocked or malformed: start empty */ }
    return { state: { lines: [] } };
  }
  function save(d) {
    try { window.localStorage.setItem(KEY, JSON.stringify(d)); return true; } catch (e) { return false; }
  }
  function count(d) {
    return (d || load()).state.lines.reduce(function (n, l) { return n + (+l.qty || 0); }, 0);
  }
  function paint() {
    var c = count();
    document.querySelectorAll('[data-bagcount]').forEach(function (el) {
      el.hidden = !c; el.textContent = c;
    });
    var bag = document.querySelector('a.bag');
    if (bag) bag.setAttribute('aria-label', c ? 'Request list, ' + c + (c === 1 ? ' item' : ' items') : 'Request list');
    document.querySelectorAll('[data-listcount]').forEach(function (el) { el.textContent = c ? ' (' + c + ')' : ''; });
  }
  function add(line) {
    var d = load();
    var found = null;
    d.state.lines.forEach(function (l) { if (l.id === line.id) found = l; });
    if (found) found.qty = (+found.qty || 0) + 1;
    else d.state.lines.push({ id: line.id, slug: line.slug, name: line.name, price: line.price, qty: 1, scents: line.scents || null });
    var ok = save(d);
    paint();
    return ok;
  }

  var toastTimer;
  function toast(msg, withLink) {
    var el = document.getElementById('toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'toast'; el.className = 'toast';
      el.setAttribute('role', 'status'); el.setAttribute('aria-live', 'polite');
      var span = document.createElement('span'); el.appendChild(span);
      var a = document.createElement('a'); a.href = '/cart/'; a.textContent = 'Review list'; el.appendChild(a);
      document.body.appendChild(el);
    }
    el.firstChild.textContent = msg;
    el.lastChild.hidden = !withLink;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('show'); }, 3600);
  }

  document.addEventListener('click', function (e) {
    var btn = e.target.closest && e.target.closest('button[data-add]');
    if (!btn) return;
    var line;
    if (btn.dataset.add === 'trio') {
      var scents = ['s0', 's1', 's2'].map(function (id) { var s = document.getElementById(id); return s ? s.value : ''; });
      line = {
        id: 'discovery-trio:' + scents.join('+'), slug: 'discovery-trio',
        name: 'Discovery trio (' + scents.map(function (s) { return NAMES[s] || s; }).join(', ') + ')',
        price: 18, scents: scents
      };
    } else {
      line = { id: btn.dataset.id, slug: btn.dataset.id, name: btn.dataset.name, price: +btn.dataset.price, scents: null };
    }
    if (add(line)) {
      btn.textContent = btn.dataset.done || 'Added';
      btn.classList.add('done');
      document.querySelectorAll('[data-after-add]').forEach(function (el) { el.hidden = false; });
      toast(line.name + ' is on your request list', true);
    } else {
      toast('This browser blocked saving the list. Email setu@vigyaan.ai and we’ll take it from there.', false);
    }
  });

  window.VigyaanRequest = { KEY: KEY, load: load, save: save, count: count, paint: paint, add: add, toast: toast };
  paint();
})();
