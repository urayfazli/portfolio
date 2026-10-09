/* ============================================================
   0xray portfolio — global scroll-reactive 3D background
   - One fixed full-viewport Three.js starfield behind all content.
   - Scroll-triggered: the camera drifts as you scroll (travel feel),
     and each [data-scene] section eases the scene toward its own
     accent color, camera offset and rotation speed.
   - Perf: DPR capped (2 desktop / 1.5 mobile), pauses when the tab
     is hidden, static frame for prefers-reduced-motion.
   - Fallback: static 2D canvas starfield if WebGL fails.
   ============================================================ */
'use strict';

import * as THREE from 'three';

(function () {
  var container = document.getElementById('bg3d');
  var tintEl = document.getElementById('bgTint');
  if (!container) return;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- per-section scene configs ---------- */
  var scenes = Array.prototype.slice
    .call(document.querySelectorAll('[data-scene]'))
    .map(function (el, i) {
      return {
        el: el,
        top: 0,
        accent: new THREE.Color(el.getAttribute('data-accent') || '#FCD535'),
        camX: (i % 2 === 0 ? -1 : 1) * 5,
        camY: -i * 1.6,
        rot: 0.00022 * (1 + i * 0.12)
      };
    });

  function measure() {
    var y = window.scrollY || window.pageYOffset || 0;
    for (var i = 0; i < scenes.length; i++) {
      scenes[i].top = scenes[i].el.getBoundingClientRect().top + y;
    }
  }

  /* ---------- 2D fallback (static, no animation) ---------- */
  function initFallback() {
    var c = document.createElement('canvas');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = window.innerWidth, h = window.innerHeight;
    c.width = Math.max(1, Math.floor(w * dpr));
    c.height = Math.max(1, Math.floor(h * dpr));
    c.style.width = '100vw';
    c.style.height = '100vh';
    c.style.display = 'block';
    container.appendChild(c);
    var ctx = c.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    for (var i = 0; i < 220; i++) {
      var gold = Math.random() < 0.14;
      ctx.globalAlpha = 0.12 + Math.random() * 0.4;
      ctx.fillStyle = gold ? '#FCD535' : (Math.random() < 0.5 ? '#eaecef' : '#929aa5');
      ctx.beginPath();
      ctx.arc(Math.random() * w, Math.random() * h, Math.random() * 1.4 + 0.3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  if (reduceMotion || scenes.length === 0) {
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
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  renderer.domElement.style.display = 'block';
  renderer.domElement.style.width = '100vw';
  renderer.domElement.style.height = '100vh';
  container.appendChild(renderer.domElement);

  /* ---------- scene & camera ---------- */
  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 500);
  var BASE_Z = 70;
  camera.position.set(0, 0, BASE_Z);

  /* ---------- starfield ---------- */
  var COUNT = isMobile ? 320 : 750;
  var positions = new Float32Array(COUNT * 3);
  var colors = new Float32Array(COUNT * 3);
  var gold = new THREE.Color('#FCD535');
  var white = new THREE.Color('#eaecef');
  var gray = new THREE.Color('#929aa5');
  var tmp = new THREE.Color();
  for (var i = 0; i < COUNT; i++) {
    positions[i * 3] = (Math.random() * 2 - 1) * 70;
    positions[i * 3 + 1] = (Math.random() * 2 - 1) * 70;
    positions[i * 3 + 2] = -50 + Math.random() * 60;
    tmp.copy(Math.random() < 0.14 ? gold : (Math.random() < 0.6 ? white : gray));
    colors[i * 3] = tmp.r;
    colors[i * 3 + 1] = tmp.g;
    colors[i * 3 + 2] = tmp.b;
  }
  var geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  var starMat = new THREE.PointsMaterial({
    size: 0.55, sizeAttenuation: true, vertexColors: true,
    transparent: true, opacity: 0.6,
    blending: THREE.AdditiveBlending, depthWrite: false
  });
  var stars = new THREE.Points(geo, starMat);
  scene.add(stars);

  /* ---------- faint wireframe accent (takes the section accent color) ---------- */
  var wire = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(18, 1)),
    new THREE.LineBasicMaterial({ color: '#FCD535', transparent: true, opacity: 0.05 })
  );
  wire.position.set(24, 8, -10);
  scene.add(wire);

  /* ---------- mouse parallax (desktop, fine pointer) ---------- */
  var finePointer = window.matchMedia('(pointer: fine)').matches;
  var mouseX = 0, mouseY = 0;
  if (finePointer && !isMobile) {
    window.addEventListener('mousemove', function (e) {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = (e.clientY / window.innerHeight) * 2 - 1;
    }, { passive: true });
  }

  /* ---------- eased state ---------- */
  var whiteBase = new THREE.Color('#ffffff');
  var cur = {
    accent: new THREE.Color('#FCD535'),
    camX: 0, camY: 0, rot: 0.00022
  };
  var activeIdx = -1;

  function cssAlpha(color, a) {
    return 'rgba(' + Math.round(color.r * 255) + ',' + Math.round(color.g * 255) + ',' +
      Math.round(color.b * 255) + ',' + a + ')';
  }

  /* ---------- main loop ---------- */
  var rafId = null;
  var running = true;
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      running = false;
      if (rafId) { window.cancelAnimationFrame(rafId); rafId = null; }
    } else if (!running) {
      running = true;
      rafId = window.requestAnimationFrame(tick);
    }
  });

  function tick() {
    if (!running) return;
    rafId = window.requestAnimationFrame(tick);

    // pick active scene: last section whose top passed 35% of viewport
    var probe = (window.scrollY || 0) + window.innerHeight * 0.35;
    var idx = 0;
    for (var i = 0; i < scenes.length; i++) {
      if (scenes[i].top <= probe) idx = i;
    }
    if (idx !== activeIdx) activeIdx = idx;
    var s = scenes[activeIdx];

    // ease toward the active scene's look
    cur.accent.lerp(s.accent, 0.05);
    cur.camX += (s.camX - cur.camX) * 0.05;
    cur.camY += (s.camY - cur.camY) * 0.05;
    cur.rot += (s.rot - cur.rot) * 0.05;

    stars.rotation.y += cur.rot;
    wire.rotation.y -= cur.rot * 1.4;
    wire.rotation.x += cur.rot * 0.6;

    // scroll travel + mouse, all lerped
    var scrollY = window.scrollY || 0;
    var targetY = cur.camY - scrollY * 0.004;
    var targetX = cur.camX + (finePointer && !isMobile ? mouseX * 5 : 0);
    var targetMy = (finePointer && !isMobile ? mouseY * -5 : 0);
    camera.position.x += (targetX - camera.position.x) * 0.05;
    camera.position.y += ((targetY + targetMy) - camera.position.y) * 0.05;
    camera.position.z += (BASE_Z - camera.position.z) * 0.05;
    camera.lookAt(0, 0, 0);

    // paint the accent: wireframe, star warmth, soft glow overlay
    wire.material.color.copy(cur.accent);
    starMat.color.copy(whiteBase).lerp(cur.accent, 0.22);
    if (tintEl) {
      tintEl.style.background = 'radial-gradient(ellipse 90% 65% at 50% 30%, ' +
        cssAlpha(cur.accent, 0.09) + ', transparent 70%)';
    }

    renderer.render(scene, camera);
  }

  /* ---------- measure + resize ---------- */
  var resizeT;
  window.addEventListener('resize', function () {
    clearTimeout(resizeT);
    resizeT = setTimeout(function () {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight, false);
      measure();
    }, 150);
  });

  measure();
  window.addEventListener('load', measure);
  setTimeout(measure, 1200);
  rafId = window.requestAnimationFrame(tick);
})();
