/* ============================================================
   0xray portfolio — 3D hero background (Three.js starfield)
   - THREE.Points starfield (~650 desktop / ~280 mobile) with real
     z-depth, vertex colors (white/gray + ~14% gold #FCD535).
   - Slow ambient rotation + desktop mouse parallax + scroll dolly.
   - Optional faint gold wireframe icosahedron, right-of-center.
   - Perf: DPR capped (2 desktop / 1.5 mobile), rendering pauses when
     hero off-screen (IntersectionObserver on #home), full stop for
     prefers-reduced-motion (no WebGL init), rAF-throttled scroll.
   - Fallback: static 2D canvas starfield if WebGL fails or
     prefers-reduced-motion; #hero3d gets .hero-3d-fallback.
   - Never animates layout properties — transform-free WebGL scene.
   ============================================================ */
'use strict';

import * as THREE from 'three';

(function () {
  var container = document.getElementById('hero3d');
  if (!container) return;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 2D fallback (static starfield, no animation) ---------- */
  function initFallback() {
    container.classList.add('hero-3d-fallback');
    var c = document.createElement('canvas');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = container.clientWidth || container.parentElement.clientWidth || window.innerWidth;
    var h = container.clientHeight || container.parentElement.clientHeight || window.innerHeight;
    c.width = Math.max(1, Math.floor(w * dpr));
    c.height = Math.max(1, Math.floor(h * dpr));
    c.style.width = '100%';
    c.style.height = '100%';
    c.style.display = 'block';
    container.appendChild(c);
    var ctx = c.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    for (var i = 0; i < 140; i++) {
      var gold = Math.random() < 0.14;
      ctx.globalAlpha = 0.15 + Math.random() * 0.45;
      ctx.fillStyle = gold ? '#FCD535' : (Math.random() < 0.5 ? '#eaecef' : '#929aa5');
      ctx.beginPath();
      ctx.arc(Math.random() * w, Math.random() * h, Math.random() * 1.4 + 0.3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  if (reduceMotion) {
    initFallback();
    return;
  }

  var isMobile = window.innerWidth < 768;
  var renderer;

  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  } catch (err) {
    initFallback();
    return;
  }

  /* ---------- renderer ---------- */
  var pixelRatio = Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2);
  renderer.setPixelRatio(pixelRatio);
  renderer.domElement.style.display = 'block';
  renderer.domElement.style.width = '100%';
  renderer.domElement.style.height = '100%';
  container.appendChild(renderer.domElement);

  /* ---------- scene & camera ---------- */
  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(
    60,
    (container.clientWidth || 1) / (container.clientHeight || 1),
    0.1,
    500
  );
  var BASE_Z = 70;
  camera.position.set(0, 0, BASE_Z);

  /* ---------- starfield points ---------- */
  var COUNT = isMobile ? 280 : 650;
  var positions = new Float32Array(COUNT * 3);
  var colors = new Float32Array(COUNT * 3);
  var gold = new THREE.Color('#FCD535');
  var white = new THREE.Color('#eaecef');
  var gray = new THREE.Color('#929aa5');
  var tmp = new THREE.Color();
  for (var i = 0; i < COUNT; i++) {
    positions[i * 3] = (Math.random() * 2 - 1) * 60;      // x in [-60, 60]
    positions[i * 3 + 1] = (Math.random() * 2 - 1) * 60;  // y in [-60, 60]
    positions[i * 3 + 2] = -40 + Math.random() * 50;      // z in [-40, 10]
    if (Math.random() < 0.14) {
      tmp.copy(gold);
    } else {
      tmp.copy(Math.random() < 0.6 ? white : gray);
    }
    colors[i * 3] = tmp.r;
    colors[i * 3 + 1] = tmp.g;
    colors[i * 3 + 2] = tmp.b;
  }
  var geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  var mat = new THREE.PointsMaterial({
    size: 0.55,
    sizeAttenuation: true,
    vertexColors: true,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  var stars = new THREE.Points(geo, mat);
  scene.add(stars);

  /* ---------- faint wireframe accent ---------- */
  var wire = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(16, 1)),
    new THREE.LineBasicMaterial({ color: '#FCD535', transparent: true, opacity: 0.045 })
  );
  wire.position.set(22, 6, -8);
  scene.add(wire);

  /* ---------- mouse parallax (desktop, fine pointer only) ---------- */
  var finePointer = window.matchMedia('(pointer: fine)').matches;
  var mouseX = 0, mouseY = 0;
  if (finePointer && !isMobile) {
    window.addEventListener('mousemove', function (e) {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = (e.clientY / window.innerHeight) * 2 - 1;
    }, { passive: true });
  }

  /* ---------- scroll dolly (3D parallax) ---------- */
  var scrollY = 0;
  var heroHeight = (container.clientHeight || window.innerHeight);
  var scrollQueued = false;
  function onScroll() {
    if (scrollQueued) return;
    scrollQueued = true;
    window.requestAnimationFrame(function () {
      scrollY = window.scrollY || window.pageYOffset;
      scrollQueued = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  scrollY = window.scrollY || window.pageYOffset;

  /* ---------- pause when hero off-screen ---------- */
  var visible = true;
  var rafId = null;
  if ('IntersectionObserver' in window) {
    var home = document.getElementById('home');
    if (home) {
      new IntersectionObserver(function (entries) {
        var vis = entries[0].isIntersecting;
        if (vis && !visible) {
          visible = true;
          rafId = window.requestAnimationFrame(tick);
        } else if (!vis && visible) {
          visible = false;
          if (rafId) window.cancelAnimationFrame(rafId);
          rafId = null;
        }
      }).observe(home);
    }
  }

  /* ---------- resize ---------- */
  var resizeT;
  window.addEventListener('resize', function () {
    clearTimeout(resizeT);
    resizeT = setTimeout(function () {
      var w = container.clientWidth || 1;
      var h = container.clientHeight || 1;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
      heroHeight = container.clientHeight || window.innerHeight;
    }, 150);
  });

  /* ---------- render loop ---------- */
  function tick() {
    if (!visible) return;
    rafId = window.requestAnimationFrame(tick);

    // Slow ambient rotation.
    stars.rotation.y += 0.0002;
    wire.rotation.y -= 0.0003;
    wire.rotation.x += 0.00015;

    // Scroll dolly, lerped (compute-only, no layout reads inside tick).
    var targetZ = BASE_Z + Math.min(scrollY, heroHeight) * 0.03;
    var targetY = -scrollY * 0.01;
    var targetX = (finePointer && !isMobile) ? mouseX * 6 : 0;
    var mouseYTarget = (finePointer && !isMobile) ? mouseY * -6 : 0;

    camera.position.z += (targetZ - camera.position.z) * 0.06;
    camera.position.y += ((targetY + mouseYTarget) - camera.position.y) * 0.06;
    camera.position.x += (targetX - camera.position.x) * 0.06;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  }

  renderer.setSize(container.clientWidth || window.innerWidth, container.clientHeight || window.innerHeight, false);
  rafId = window.requestAnimationFrame(tick);
})();
