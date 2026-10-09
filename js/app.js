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

  /* ---------- parallax layers ---------- */
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

  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(updateParallax);
      ticking = true;
    }
  }

  if (!reduceMotion && layers.length) {
    window.addEventListener('scroll', onScroll, { passive: true });
    updateParallax();
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
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    links.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        links.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
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
