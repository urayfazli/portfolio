/* ============================================================
   0xray portfolio — scroll-driven crypto coin journey
   (concept: one persistent 3D coin world explored by a virtual
   camera; scroll acts as the timeline)

   - One fixed fullscreen WebGL canvas behind all content.
   - N 3D crypto coins share one world. Each [data-scene] section
     defines a coin FORMATION + camera waypoint. Scroll position
     maps to a journey timeline; coins MORPH continuously between
     formations and the camera flies through — no cuts.
   - Fixed bottom-left progress indicator: active scene number/name
     + thin fill bar tied to scroll progress inside the scene.
   - Perf: shared geometries/materials, DPR capped, pauses when
     the tab is hidden, static frame for prefers-reduced-motion.
   ============================================================ */
'use strict';

import * as THREE from 'three';

(function () {
  var container = document.getElementById('bg3d');
  var tintEl = document.getElementById('bgTint');
  var labelEl = document.getElementById('sceneLabel');
  var fillEl = document.getElementById('sceneFill');
  if (!container) return;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- seeded random (stable formations) ---------- */
  function mulberry32(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* ---------- scenes ---------- */
  var sceneEls = Array.prototype.slice.call(document.querySelectorAll('[data-scene]'));
  var SCENES = sceneEls.map(function (el, i) {
    return {
      el: el,
      top: 0,
      label: el.getAttribute('data-scene-label') || ('0' + i),
      accent: new THREE.Color(el.getAttribute('data-accent') || '#FCD535')
    };
  });

  function measure() {
    var y = window.scrollY || window.pageYOffset || 0;
    for (var i = 0; i < SCENES.length; i++) {
      SCENES[i].top = SCENES[i].el.getBoundingClientRect().top + y;
    }
  }

  /* ---------- renderer / scene ---------- */
  var isMobile = window.innerWidth < 768;
  var renderer = null;
  if (!reduceMotion && SCENES.length > 0) {
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch (err) { renderer = null; }
  }

  function initFallback() {
    var c = document.createElement('canvas');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = window.innerWidth, h = window.innerHeight;
    c.width = Math.max(1, Math.floor(w * dpr));
    c.height = Math.max(1, Math.floor(h * dpr));
    c.style.width = '100vw'; c.style.height = '100vh'; c.style.display = 'block';
    container.appendChild(c);
    var ctx = c.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var rnd = mulberry32(7);
    for (var i = 0; i < 200; i++) {
      var gold = rnd() < 0.2;
      ctx.globalAlpha = 0.1 + rnd() * 0.4;
      ctx.fillStyle = gold ? '#FCD535' : (rnd() < 0.5 ? '#eaecef' : '#929aa5');
      ctx.beginPath();
      ctx.arc(rnd() * w, rnd() * h, rnd() * 1.6 + 0.4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  var scene, camera, coins, starMat, wire, tintElRef = tintEl;
  var COUNT = isMobile ? 120 : 220;

  if (!renderer) {
    initFallback();
    return;
  }

  var pixelRatio = Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2);
  renderer.setPixelRatio(pixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  renderer.domElement.style.display = 'block';
  renderer.domElement.style.width = '100vw';
  renderer.domElement.style.height = '100vh';
  container.appendChild(renderer.domElement);

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 600);
  camera.position.set(0, 0, 70);

  scene.add(new THREE.AmbientLight(0xffffff, 0.55));
  var dirLight = new THREE.DirectionalLight(0xffffff, 1.1);
  dirLight.position.set(30, 40, 60);
  scene.add(dirLight);
  var rimLight = new THREE.DirectionalLight(0xFCD535, 0.35);
  rimLight.position.set(-40, -20, 30);
  scene.add(rimLight);

  /* ---------- faint background starfield (depth) ---------- */
  (function addStars() {
    var sc = isMobile ? 160 : 320;
    var pos = new Float32Array(sc * 3);
    var col = new Float32Array(sc * 3);
    var rnd = mulberry32(99);
    var gold = new THREE.Color('#FCD535'), white = new THREE.Color('#eaecef'),
        gray = new THREE.Color('#929aa5'), t = new THREE.Color();
    for (var i = 0; i < sc; i++) {
      pos[i * 3] = (rnd() * 2 - 1) * 110;
      pos[i * 3 + 1] = (rnd() * 2 - 1) * 80;
      pos[i * 3 + 2] = -90 + rnd() * 70;
      t.copy(rnd() < 0.12 ? gold : (rnd() < 0.6 ? white : gray));
      col[i * 3] = t.r; col[i * 3 + 1] = t.g; col[i * 3 + 2] = t.b;
    }
    var g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    starMat = new THREE.PointsMaterial({
      size: 0.5, sizeAttenuation: true, vertexColors: true,
      transparent: true, opacity: 0.5,
      blending: THREE.AdditiveBlending, depthWrite: false
    });
    scene.add(new THREE.Points(g, starMat));
  })();

  /* ---------- the coins ---------- */
  var coinGeo = new THREE.CylinderGeometry(1.05, 1.05, 0.22, 28);
  coinGeo.rotateX(Math.PI / 2); // face the camera (flat side = +Z)
  var goldMat = new THREE.MeshStandardMaterial({
    color: '#FCD535', metalness: 0.85, roughness: 0.28, emissive: '#5a430a', emissiveIntensity: 0.35
  });
  var darkMat = new THREE.MeshStandardMaterial({
    color: '#2b3139', metalness: 0.7, roughness: 0.4, emissive: '#000000', emissiveIntensity: 0
  });
  var glowMat = new THREE.MeshStandardMaterial({
    color: '#ffe89a', metalness: 0.4, roughness: 0.3, emissive: '#FCD535', emissiveIntensity: 0.9
  });
  // thin rim so coins read as coins, not discs
  var rimGeo = new THREE.TorusGeometry(1.05, 0.07, 10, 28);
  var rimMat = new THREE.MeshStandardMaterial({
    color: '#a8841f', metalness: 0.9, roughness: 0.3, emissive: '#3a2c05', emissiveIntensity: 0.4
  });

  coins = [];
  (function buildCoins() {
    var rnd = mulberry32(1234);
    for (var i = 0; i < COUNT; i++) {
      var roll = rnd();
      var grp = new THREE.Group();
      var body = new THREE.Mesh(coinGeo, roll < 0.78 ? goldMat : (roll < 0.92 ? darkMat : glowMat));
      grp.add(body);
      if (roll < 0.78) grp.add(new THREE.Mesh(rimGeo, rimMat));
      var sc = 0.55 + rnd() * 0.75;
      grp.scale.setScalar(sc);
      scene.add(grp);
      coins.push({
        grp: grp,
        spin: 0.2 + rnd() * 0.9,       // tumble speed
        phase: rnd() * Math.PI * 2,    // float phase
        wob: 0.6 + rnd() * 1.4         // float amplitude
      });
    }
  })();

  /* ---------- formations: one per scene (positions for every coin) ---------- */
  function formation(kind, out) {
    var rnd = mulberry32(kind * 7919 + 13);
    var i, a, r;
    for (i = 0; i < COUNT; i++) {
      var v = out[i];
      if (kind === 0) {          // 00 hero: scattered coin field
        v.set((rnd() * 2 - 1) * 48, (rnd() * 2 - 1) * 26, -8 - rnd() * 42);
      } else if (kind === 1) {   // stats: coin wall (grid facing camera)
        var cols = Math.ceil(Math.sqrt(COUNT * 1.6));
        var gx = (i % cols) - cols / 2, gy = Math.floor(i / cols) - (COUNT / cols) / 2;
        v.set(gx * 4.4 + (rnd() - 0.5), gy * 4.4 + (rnd() - 0.5), -22 + (rnd() - 0.5) * 3);
      } else if (kind === 2) {   // 01: grand ring
        a = (i / COUNT) * Math.PI * 2;
        r = 15 + (rnd() - 0.5) * 3;
        v.set(Math.cos(a) * r, Math.sin(a) * r * 0.72, -20 + (rnd() - 0.5) * 6);
      } else if (kind === 3) {   // 02: helix spiral
        a = i * 0.42;
        r = 5 + (i / COUNT) * 11;
        v.set(Math.cos(a) * r, (i / COUNT) * 44 - 22, Math.sin(a) * r - 18);
      } else if (kind === 4) {   // 03: burst cloud
        a = rnd() * Math.PI * 2;
        var b = Math.acos(rnd() * 2 - 1);
        r = 17 + rnd() * 15;
        v.set(Math.sin(b) * Math.cos(a) * r, Math.sin(b) * Math.sin(a) * r * 0.8, Math.cos(b) * r - 18);
      } else if (kind === 5) {   // 04: stacked cube lattice
        var n = Math.ceil(Math.cbrt(COUNT));
        var ix = i % n, iy = Math.floor(i / n) % n, iz = Math.floor(i / (n * n));
        v.set((ix - n / 2) * 5.2, (iy - n / 2) * 5.2, (iz - n / 2) * 5.2 - 22);
      } else {                   // 05: halo — converging flat ring
        a = (i / COUNT) * Math.PI * 2;
        r = 13 + (rnd() - 0.5) * 2.5;
        v.set(Math.cos(a) * r, Math.sin(a) * r, -15 + (rnd() - 0.5) * 2);
      }
    }
  }

  var forms = [];
  for (var f = 0; f < SCENES.length; f++) {
    var arr = [];
    for (var k = 0; k < COUNT; k++) arr.push(new THREE.Vector3());
    formation(f, arr);
    forms.push(arr);
  }

  /* ---------- camera waypoints per scene ---------- */
  var camPos = SCENES.map(function (s, i) {
    var p = [
      [0, 2, 72],     // 00 hero: wide
      [0, 0, 64],     // stats: push into the wall
      [-9, 4, 68],    // 01: orbit left around the ring
      [9, -3, 62],    // 02: dive through the spiral
      [0, 6, 56],     // 03: inside the burst cloud
      [-7, -4, 70],   // 04: pull back, lattice view
      [0, 2, 78]      // 05: god view of the halo
    ][i] || [0, 0, 70];
    return new THREE.Vector3(p[0], p[1], p[2]);
  });
  var camLook = SCENES.map(function (s, i) {
    return new THREE.Vector3(i % 2 === 0 ? -4 : 4, -i * 1.2, -18);
  });

  /* ---------- journey: scroll -> timeline ---------- */
  var journey = 0;       // smoothed 0..SCENES-1
  var tmpV = new THREE.Vector3(), tmpP = new THREE.Vector3(), tmpL = new THREE.Vector3();

  function journeyTarget() {
    var y = window.scrollY || 0;
    var n = SCENES.length;
    if (n < 2) return 0;
    if (y <= SCENES[0].top) return 0;
    for (var i = 0; i < n - 1; i++) {
      var a = SCENES[i].top, b = SCENES[i + 1].top;
      if (y >= a && y <= b) {
        var span = Math.max(1, b - a);
        return i + (y - a) / span;
      }
    }
    return n - 1;
  }

  function ease(t) { return t * t * (3 - 2 * t); } // smoothstep

  /* ---------- mouse parallax (desktop) ---------- */
  var finePointer = window.matchMedia('(pointer: fine)').matches;
  var mouseX = 0, mouseY = 0;
  if (finePointer && !isMobile) {
    window.addEventListener('mousemove', function (e) {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = (e.clientY / window.innerHeight) * 2 - 1;
    }, { passive: true });
  }

  /* ---------- progress indicator ---------- */
  var lastLabel = '';
  function updateIndicator(t) {
    var idx = Math.max(0, Math.min(SCENES.length - 1, Math.floor(t)));
    var frac = t - Math.floor(t);
    if (SCENES[idx].label !== lastLabel && labelEl) {
      labelEl.textContent = SCENES[idx].label;
      lastLabel = SCENES[idx].label;
    }
    if (fillEl) fillEl.style.transform = 'scaleX(' + frac.toFixed(3) + ')';
    // accent: tint the indicator + scene glow to the active scene
    if (tintElRef) {
      var c = SCENES[idx].accent;
      tintElRef.style.background =
        'radial-gradient(ellipse 90% 65% at 50% 30%, rgba(' +
        Math.round(c.r * 255) + ',' + Math.round(c.g * 255) + ',' + Math.round(c.b * 255) +
        ',0.08), transparent 70%)';
    }
    if (starMat) {
      starMat.color.copy(new THREE.Color('#ffffff')).lerp(SCENES[idx].accent, 0.18);
    }
  }

  /* ---------- main loop ---------- */
  var rafId = null, running = true;
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      running = false;
      if (rafId) { window.cancelAnimationFrame(rafId); rafId = null; }
    } else if (!running) {
      running = true;
      rafId = window.requestAnimationFrame(tick);
    }
  });

  var timeS = 0;
  function tick() {
    if (!running) return;
    rafId = window.requestAnimationFrame(tick);
    timeS += 1 / 60;

    // smooth the journey (buttery camera)
    var target = journeyTarget();
    journey += (target - journey) * 0.075;
    if (Math.abs(target - journey) < 0.0005) journey = target;

    var a = Math.max(0, Math.min(SCENES.length - 1, Math.floor(journey)));
    var b = Math.max(0, Math.min(SCENES.length - 1, a + 1));
    var e = ease(Math.max(0, Math.min(1, journey - a)));

    // coins morph between the two formations
    var fa = forms[a], fb = forms[b];
    for (var i = 0; i < COUNT; i++) {
      var c = coins[i];
      tmpV.copy(fa[i]).lerp(fb[i], e);
      // gentle float so the world feels alive
      tmpV.y += Math.sin(timeS * 0.9 + c.phase) * c.wob * 0.35;
      tmpV.x += Math.cos(timeS * 0.7 + c.phase) * c.wob * 0.25;
      c.grp.position.copy(tmpV);
      c.grp.rotation.x += 0.002 * c.spin;
      c.grp.rotation.y += 0.0035 * c.spin;
    }

    // camera flies the waypoints
    tmpP.copy(camPos[a]).lerp(camPos[b], e);
    if (finePointer && !isMobile) {
      tmpP.x += mouseX * 4;
      tmpP.y += mouseY * -3;
    }
    camera.position.lerp(tmpP, 0.08);
    tmpL.copy(camLook[a]).lerp(camLook[b], e);
    camera.lookAt(tmpL);

    updateIndicator(journey);
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
  journey = journeyTarget();
  updateIndicator(journey);
  rafId = window.requestAnimationFrame(tick);
})();
