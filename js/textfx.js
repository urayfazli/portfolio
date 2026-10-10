/* ============================================================
   0xray portfolio — scroll text FX (fungolabs-style)
   - .chapter-title (except hero typewriter) -> word-by-word
     masked rise, driven by scroll position (scrub)
   - .chapter-desc, .hero-manifesto -> word-by-word opacity
     fill, driven by scroll position (scrub)
   Fully reversible — works scrolling up and down.
   Words are split recursively so nested markup (<strong>,
   <br>) survives, and everything re-splits cleanly after an
   i18n language toggle (which rewrites the raw text).
   ============================================================ */
(function () {
  'use strict';

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var RISE_SEL = '.chapter-title:not([data-typing])';
  var FILL_SEL = '.chapter-desc, .hero-manifesto';

  /* Split an element's text nodes into word spans, recursing
     into child elements. <br> is preserved as-is. */
  function splitWords(el, mode) {
    var nodes = Array.prototype.slice.call(el.childNodes);
    nodes.forEach(function (node) {
      if (node.nodeType === 3) {
        var frag = document.createDocumentFragment();
        var prevWasWord = false;
        node.textContent.split(/(\s+)/).forEach(function (part) {
          if (!part) return;
          if (/^\s+$/.test(part)) {
            if (prevWasWord) frag.appendChild(document.createTextNode(' '));
            prevWasWord = false;
            return;
          }
          prevWasWord = true;
          var wi = document.createElement('span');
          if (mode === 'rise') {
            var w = document.createElement('span');
            w.className = 'tx-w';
            wi.className = 'tx-wi';
            wi.textContent = part;
            w.appendChild(wi);
            frag.appendChild(w);
          } else {
            wi.className = 'tx-s';
            wi.textContent = part;
            frag.appendChild(wi);
          }
        });
        el.replaceChild(frag, node);
      } else if (node.nodeType === 1 && node.tagName !== 'BR') {
        splitWords(node, mode);
      }
    });
  }

  var items = [];

  function build() {
    items = [];
    Array.prototype.forEach.call(document.querySelectorAll(RISE_SEL), function (el) {
      if (!el.querySelector('.tx-wi')) splitWords(el, 'rise');
      items.push({
        el: el,
        words: Array.prototype.slice.call(el.querySelectorAll('.tx-wi')),
        mode: 'rise',
        lastP: -1,
        sF: 0.88, eF: 0.62
      });
    });
    Array.prototype.forEach.call(document.querySelectorAll(FILL_SEL), function (el) {
      if (!el.querySelector('.tx-s')) splitWords(el, 'fill');
      items.push({
        el: el,
        words: Array.prototype.slice.call(el.querySelectorAll('.tx-s')),
        mode: 'fill',
        lastP: -1,
        sF: 0.85, eF: 0.45
      });
    });
  }

  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }

  var ticking = false;

  function update() {
    ticking = false;
    var vh = window.innerHeight || document.documentElement.clientHeight;
    for (var k = 0; k < items.length; k++) {
      var it = items[k];
      var r = it.el.getBoundingClientRect();
      if (r.bottom < -60 || r.top > vh + 60) continue;
      var start = vh * it.sF;
      var end = vh * it.eF;
      var p = clamp01((start - r.top) / (start - end));
      if (Math.abs(p - it.lastP) < 0.0015) continue;
      it.lastP = p;
      var n = it.words.length, i, lp;
      if (it.mode === 'rise') {
        for (i = 0; i < n; i++) {
          lp = clamp01((p * (n + 2) - i) / 2);
          it.words[i].style.transform = 'translateY(' + ((1 - lp) * 110).toFixed(1) + '%)';
        }
      } else {
        for (i = 0; i < n; i++) {
          lp = clamp01((p * (n + 3) - i) / 3);
          it.words[i].style.opacity = (0.14 + 0.86 * lp).toFixed(2);
        }
      }
    }
  }

  function onScroll() {
    if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
  }

  /* NOTE: build() must run after i18n's own DOMContentLoaded init,
     because i18n rewrites all [data-i18n] text on load (wiping
     splits). Deferred scripts execute while readyState is
     'interactive' (NOT 'loading'), so we must wait for
     DOMContentLoaded here. i18n.js is a classic script that
     registered its listener during parsing, so ours runs after
     its applyLang. */
  function init() { build(); update(); }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  window.addEventListener('load', update);
  if (document.readyState === 'complete') {
    init();
  } else {
    document.addEventListener('DOMContentLoaded', init);
  }
  /* i18n rewrites raw text on language toggle -> rebuild splits */
  Array.prototype.forEach.call(
    document.querySelectorAll('.lang-toggle [data-lang]'),
    function (b) {
      b.addEventListener('click', function () {
        setTimeout(function () { build(); update(); }, 80);
      });
    }
  );
})();
