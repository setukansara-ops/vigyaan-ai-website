/* Vigyaan — shared page script (every page; it does nothing where its hooks are absent).
 *
 * Phone menu: the <details class="menu"> works without JS; this adds Esc and
 * tap-outside to close it.
 *
 * There is no request list or cart any more: the attars are "coming soon" and
 * the site takes no orders and no payments (founder, D36/D45, October 2026).
 * The old list's storage key, localStorage['vigyaan-request'], is no longer
 * read or written. Any future order flow must use a NEW key, so a list saved
 * under the old prices can never come back.
 */
(function () {
  'use strict';

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
})();
