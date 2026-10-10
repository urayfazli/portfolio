/* ============================================================
   0xray portfolio — scroll-layer card FX (fungolabs-style)
   Cards inside .cards-3 / .cards-2 grids animate like layered
   sheets driven by scroll position (scrub): translateY + scale
   + rotateX with per-card stagger. Fully reversible — works
   scrolling up AND down. Only --fxp is written per frame;
   CSS owns the final transform (keeps :hover lift working on
   .card-link). Transform/opacity only: compositor-friendly.
   ============================================================ */
(function () {
  'use strict';

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var grids = document.querySelectorAll('.cards-3, .cards-2');
  var items = [];

  Array.prototype.forEach.call(grids, function (grid) {
    grid.classList.add('fx-cards');
    var cards = grid.querySelectorAll('.card');
    Array.prototype.forEach.call(cards, function (card, i) {
      card.classList.remove('reveal'); // FX takes over from one-shot reveal
      card.classList.remove('revealed');
      card.classList.add('fx-card');
      items.push({ el: card, idx: i });
    });
  });
  if (!items.length) return;

  var ticking = false;

  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }

  function update() {
    ticking = false;
    var vh = window.innerHeight || document.documentElement.clientHeight;
    for (var k = 0; k < items.length; k++) {
      var it = items[k];
      var r = it.el.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) continue; // off-screen: skip
      // Card travels from 94% to 52% of viewport height.
      // Later cards in the grid start later -> cascade layering.
      var start = vh * 0.94 - it.idx * 36;
      var end = vh * 0.52;
      var denom = start - end;
      var p = denom > 0 ? (start - r.top) / denom : 1;
      p = clamp01(p);
      var e = 1 - Math.pow(1 - p, 3); // easeOutCubic
      it.el.style.setProperty('--fxp', e.toFixed(3));
    }
  }

  function onScroll() {
    if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  window.addEventListener('load', update);
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', update);
  } else {
    update();
  }
  // i18n language toggle can shift layout — refresh progress
  Array.prototype.forEach.call(
    document.querySelectorAll('.lang-toggle [data-lang]'),
    function (b) { b.addEventListener('click', function () { setTimeout(update, 80); }); }
  );
})();
