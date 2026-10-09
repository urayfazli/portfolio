/* ============================================================
   0xray portfolio — interactions
   - Parallax: translate3d + rAF, passive scroll listener.
     Only transform/opacity are animated per frame (no layout recalc).
   - Count-up stats (.stat-num[data-count]) via IntersectionObserver.
   - Scroll reveal via IntersectionObserver.
   - Mobile nav toggle + lightweight scrollspy.
   ============================================================ */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- parallax layers (legacy: global scrollY) ---------- */
  var layers = Array.prototype.slice.call(document.querySelectorAll('[data-speed]'));
  var ticking = false;

  function updateParallax() {
    var y = window.scrollY || window.pageYOffset;
    for (var i = 0; i < layers.length; i++) {
      var speed = parseFloat(layers[i].getAttribute('data-speed')) || 0;
      // translate3d keeps animation on the compositor thread (GPU), no layout work.
      layers[i].style.transform = 'translate3d(0,' + (y * speed).toFixed(1) + 'px,0)';
    }
    ticking = false;
  }

  /* ---------- section-relative parallax (chapter depth) ----------
     [data-plx] elements drift relative to their own section as it crosses
     the viewport: progress 0 (entering) -> 1 (leaving), offset swings
     +/- amt/2 px. Transform-only, off-screen sections skipped. */
  var plxEls = Array.prototype.slice.call(document.querySelectorAll('[data-plx]'));
  plxEls.forEach(function (el) {
    el._plxHost = el.closest('.chapter, .hero, .stats-bar') || el.parentElement;
  });

  function updatePlx() {
    var vh = window.innerHeight || document.documentElement.clientHeight;
    for (var i = 0; i < plxEls.length; i++) {
      var el = plxEls[i];
      var r = el._plxHost.getBoundingClientRect();
      if (r.bottom < -120 || r.top > vh + 120) continue; // off-screen: skip
      var amt = parseFloat(el.getAttribute('data-plx')) || 80;
      var denom = vh + r.height;
      var prog = denom > 0 ? (vh - r.top) / denom : 0.5;
      if (prog < 0) prog = 0; else if (prog > 1) prog = 1;
      var y = (0.5 - prog) * amt;
      el.style.transform = 'translate3d(0,' + y.toFixed(1) + 'px,0)';
    }
  }

  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(function () {
        updateParallax();
        updatePlx();
      });
      ticking = true;
    }
  }

  if (!reduceMotion && (layers.length || plxEls.length)) {
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    updateParallax();
    updatePlx();
  }

  /* ---------- scroll reveal ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('revealed');
          ro.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { ro.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('revealed'); });
  }

  /* ---------- mobile nav ---------- */
  var toggle = document.getElementById('navToggle');
  var links = document.getElementById('navLinks');
  function navAriaLabel(open) {
    var lang = document.documentElement.getAttribute('lang') === 'id' ? 'id' : 'en';
    var d = (window.I18N && window.I18N[lang]) || {};
    return open ? (d['nav.toggle.close'] || 'Close menu') : (d['nav.toggle.open'] || 'Open menu');
  }
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', navAriaLabel(open));
    });
    links.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        links.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', navAriaLabel(false));
      }
    });
  }

  /* ---------- scrollspy ---------- */
  var spyLinks = Array.prototype.slice.call(document.querySelectorAll('.nav-link[href^="#"]'));
  var sections = spyLinks
    .map(function (a) { return document.querySelector(a.getAttribute('href')); })
    .filter(Boolean);
  if ('IntersectionObserver' in window && sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          spyLinks.forEach(function (a) {
            a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id);
          });
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- count-up stats ---------- */
  var statNums = Array.prototype.slice.call(document.querySelectorAll('.stat-num[data-count]'));
  if (statNums.length) {
    if (reduceMotion) {
      statNums.forEach(function (el) {
        el.textContent = el.getAttribute('data-count') + (el.getAttribute('data-suffix') || '');
      });
    } else if ('IntersectionObserver' in window) {
      var easeOutCubic = function (t) { return 1 - Math.pow(1 - t, 3); };
      var statObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          var el = e.target;
          statObs.unobserve(el);
          var target = parseFloat(el.getAttribute('data-count')) || 0;
          var suffix = el.getAttribute('data-suffix') || '';
          var start = null;
          var DURATION = 1200;
          function step(ts) {
            if (start === null) start = ts;
            var p = Math.min(1, (ts - start) / DURATION);
            el.textContent = Math.round(easeOutCubic(p) * target) + suffix;
            if (p < 1) window.requestAnimationFrame(step);
          }
          window.requestAnimationFrame(step);
        });
      }, { threshold: 0.4 });
      statNums.forEach(function (el) { statObs.observe(el); });
    } else {
      statNums.forEach(function (el) {
        el.textContent = el.getAttribute('data-count') + (el.getAttribute('data-suffix') || '');
      });
    }
  }

  /* ---------- footer year ---------- */
  var yearEl = document.querySelector('.footer-brand span:last-child');
  if (yearEl) {
    yearEl.textContent = '© ' + new Date().getFullYear() + ' Uray Fazli · 0xray';
  }
})();
