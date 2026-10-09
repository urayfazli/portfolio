/* ============================================================
   0xray portfolio — interactions
   - Parallax: translate3d + rAF, passive scroll listener.
     Only transform/opacity are animated per frame (no layout recalc).
   - Starfield canvas in hero (DPR-aware, twinkle only).
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

  /* ---------- starfield canvas ---------- */
  var canvas = document.getElementById('stars');
  if (canvas && !reduceMotion) {
    var ctx = canvas.getContext('2d');
    var stars = [];
    var STAR_COUNT = 130;
    var rafId = null;

    function sizeCanvas() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seedStars(rect.width, rect.height);
    }

    function seedStars(w, h) {
      stars = [];
      for (var i = 0; i < STAR_COUNT; i++) {
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() * 1.4 + 0.3,
          // a few warm yellow stars among white ones (brand accent)
          gold: Math.random() < 0.14,
          phase: Math.random() * Math.PI * 2,
          speed: 0.4 + Math.random() * 1.2
        });
      }
    }

    var last = 0;
    function draw(t) {
      rafId = window.requestAnimationFrame(draw);
      if (t - last < 66) return; // ~15fps is plenty for twinkle; saves battery
      last = t;
      var w = canvas.clientWidth, h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);
      var time = t / 1000;
      for (var i = 0; i < stars.length; i++) {
        var s = stars[i];
        var tw = 0.35 + 0.65 * Math.abs(Math.sin(time * s.speed + s.phase));
        ctx.globalAlpha = tw;
        ctx.fillStyle = s.gold ? '#fcd535' : '#eaecef';
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    // Pause when hero is off-screen to save CPU.
    var heroVisible = true;
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        var vis = entries[0].isIntersecting;
        if (vis && !heroVisible && !reduceMotion) {
          heroVisible = true;
          rafId = window.requestAnimationFrame(draw);
        } else if (!vis && heroVisible) {
          heroVisible = false;
          if (rafId) window.cancelAnimationFrame(rafId);
          rafId = null;
        }
      }).observe(document.getElementById('home'));
    }

    var resizeT;
    window.addEventListener('resize', function () {
      clearTimeout(resizeT);
      resizeT = setTimeout(sizeCanvas, 150);
    });

    sizeCanvas();
    rafId = window.requestAnimationFrame(draw);
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

  /* ---------- footer year ---------- */
  var yearEl = document.querySelector('.footer-brand span:last-child');
  if (yearEl) {
    yearEl.textContent = '© ' + new Date().getFullYear() + ' Uray Fazli · 0xray';
  }
})();
