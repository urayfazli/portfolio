/* ============================================================
   Scroll-scrubbed hero video background.
   Page scroll progress -> video currentTime.
   Stop scrolling = video freezes; scroll = video moves.
   If the video file is missing/unplayable, the layer hides
   itself and the Three.js background behind shows instead.
   ============================================================ */
(function () {
  'use strict';

  var v = document.getElementById('bgvideo');
  if (!v) return;
  var wrap = v.parentElement;

  function hide() {
    if (wrap) wrap.style.display = 'none';
  }

  // missing/corrupt file -> fall back to Three.js layer behind
  v.addEventListener('error', hide, true);
  setTimeout(function () {
    // NETWORK_NO_SOURCE (3), or nothing ever started loading
    if (v.networkState === 3) hide();
  }, 6000);

  // reduced motion: leave the first frame as a static backdrop
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var ticking = false;
  var lastT = -1;

  function scrub() {
    ticking = false;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    if (max <= 0) return;
    var d = v.duration;
    if (!d || !isFinite(d)) return;
    var p = Math.min(Math.max(window.scrollY / max, 0), 1);
    var t = p * d;
    // skip tiny seeks: cheaper and avoids jitter
    if (Math.abs(t - lastT) > 0.04) {
      try { v.currentTime = t; } catch (e) { /* metadata not ready */ }
      lastT = t;
    }
  }

  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(scrub);
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  v.addEventListener('loadedmetadata', scrub);
  scrub();
})();
