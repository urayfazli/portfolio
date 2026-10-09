/* ============================================================
   Hero video background — plain autoplay loop.
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
    // NETWORK_NO_SOURCE (3)
    if (v.networkState === 3) hide();
  }, 6000);

  // reduced motion: leave the first frame as a static backdrop
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  v.loop = true;
  v.muted = true; // required for autoplay on mobile
  var p = v.play();
  if (p && typeof p.catch === 'function') {
    p.catch(function () { /* autoplay blocked: first frame stays */ });
  }
})();
