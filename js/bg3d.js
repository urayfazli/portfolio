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

  /* ---------- lights for the 3D objects ---------- */
  scene.add(new THREE.AmbientLight(0xffffff, 0.55));
  var dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
  dirLight.position.set(30, 40, 50);
  scene.add(dirLight);

  /* ---------- planets: one per section ---------- */
  var planets = scenes.map(function (s, i) {
    var g = new THREE.Group();
    var r = 2.4 + (i % 3) * 0.5;
    var mat = new THREE.MeshStandardMaterial({
      color: s.accent.clone(), roughness: 0.65, metalness: 0.15,
      transparent: true, opacity: 1
    });
    var mesh = new THREE.Mesh(new THREE.SphereGeometry(r, 40, 40), mat);
    g.add(mesh);
    var ring = null;
    if (i % 3 === 1) {
      ring = new THREE.Mesh(
        new THREE.RingGeometry(r * 1.45, r * 2.15, 48),
        new THREE.MeshBasicMaterial({
          color: s.accent.clone(), transparent: true, opacity: 0.3,
          side: THREE.DoubleSide
        })
      );
      ring.rotation.x = -Math.PI / 2 + 0.4;
      g.add(ring);
    }
    g.position.set((i % 2 === 0 ? -1 : 1) * 13, 5 - i * 1.1, -18);
    g.scale.setScalar(0.25);
    scene.add(g);
    return { group: g, mesh: mesh, ring: ring, mat: mat, r: r };
  });

  /* ---------- rocket (built pointing +Z, travels between planets) ---------- */
  var rocket = new THREE.Group();
  (function buildRocket() {
    var white = new THREE.MeshStandardMaterial({ color: '#f2f4f6', roughness: 0.4, metalness: 0.3 });
    var goldM = new THREE.MeshStandardMaterial({ color: '#FCD535', roughness: 0.35, metalness: 0.5 });
    var red = new THREE.MeshStandardMaterial({ color: '#e5484d', roughness: 0.5, metalness: 0.2 });
    var blue = new THREE.MeshStandardMaterial({ color: '#4cc3ff', roughness: 0.2, metalness: 0.6 });
    var body = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 1.7, 20), white);
    body.geometry.rotateX(Math.PI / 2);
    rocket.add(body);
    var nose = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.75, 20), goldM);
    nose.geometry.rotateX(Math.PI / 2);
    nose.position.z = 1.22;
    rocket.add(nose);
    var win = new THREE.Mesh(new THREE.SphereGeometry(0.13, 16, 16), blue);
    win.position.set(0, 0.3, 0.35);
    rocket.add(win);
    for (var f = 0; f < 3; f++) {
      var fin = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.55, 0.65), f === 0 ? goldM : red);
      var a = (f / 3) * Math.PI * 2;
      fin.position.set(Math.cos(a) * 0.38, Math.sin(a) * 0.38, -0.62);
      fin.rotation.z = a;
      rocket.add(fin);
    }
  })();
  var flameMat = new THREE.MeshBasicMaterial({
    color: '#ff9a3c', transparent: true, opacity: 0.9,
    blending: THREE.AdditiveBlending, depthWrite: false
  });
  var flame = new THREE.Mesh(new THREE.ConeGeometry(0.22, 1.0, 16), flameMat);
  flame.geometry.rotateX(-Math.PI / 2); // point -Z (behind the rocket)
  flame.position.z = -1.35;
  rocket.add(flame);
  var flameCore = new THREE.Mesh(
    new THREE.ConeGeometry(0.11, 0.6, 12),
    new THREE.MeshBasicMaterial({ color: '#ffe28a', transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false })
  );
  flameCore.geometry.rotateX(-Math.PI / 2);
  flameCore.position.z = -1.15;
  rocket.add(flameCore);
  rocket.position.set(-9, 7, -14);
  scene.add(rocket);
  var rocketBase = rocket.position.clone();
  var rocketTarget = rocketBase.clone();

  /* ---------- scroll gestures: idle + "2x scroll" boost ---------- */
  var lastScrollEv = 0;
  var gestureCount = 0;
  var gestureQuiet = 0;
  var boostT = -1; // -1 = no boost, 0..1 = boost in progress
  window.addEventListener('scroll', function () {
    var now = performance.now();
    lastScrollEv = now;
    if (now - gestureQuiet > 800) {
      gestureCount++;
      if (gestureCount >= 2) {
        gestureCount = 0;
        boostT = 0; // rocket boost!
      }
    }
    gestureQuiet = now;
  }, { passive: true });

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
    var nowT = performance.now();
    var timeS = nowT / 1000;

    // pick active scene: last section whose top passed 35% of viewport
    var probe = (window.scrollY || 0) + window.innerHeight * 0.35;
    var idx = 0;
    for (var i = 0; i < scenes.length; i++) {
      if (scenes[i].top <= probe) idx = i;
    }
    var sectionChanged = idx !== activeIdx;
    if (sectionChanged) activeIdx = idx;
    var s = scenes[activeIdx];

    // idle = no scroll for ~1.6s
    var idle = (nowT - lastScrollEv) > 1600;

    // ease toward the active scene's look
    cur.accent.lerp(s.accent, 0.05);
    cur.camX += (s.camX - cur.camX) * 0.05;
    cur.camY += (s.camY - cur.camY) * 0.05;
    cur.rot += (s.rot - cur.rot) * 0.05;

    stars.rotation.y += cur.rot;
    wire.rotation.y -= cur.rot * 1.4;
    wire.rotation.x += cur.rot * 0.6;

    /* ----- planets: spin, bob when idle, active one grows ----- */
    for (var p = 0; p < planets.length; p++) {
      var pl = planets[p];
      var isActive = p === activeIdx;
      pl.mesh.rotation.y += idle ? 0.006 : 0.0015;
      if (pl.ring) pl.ring.rotation.z += idle ? 0.002 : 0.0006;
      var targetScale = isActive ? 1 : 0.22;
      var cs = pl.group.scale.x + (targetScale - pl.group.scale.x) * 0.06;
      pl.group.scale.setScalar(cs);
      var targetOp = isActive ? 1 : 0.3;
      pl.mat.opacity += (targetOp - pl.mat.opacity) * 0.06;
      if (pl.ring) pl.ring.material.opacity = pl.mat.opacity * 0.3;
      // gentle bob when idle
      pl.group.position.y += (((5 - p * 1.1) + (idle ? Math.sin(timeS * 1.4 + p) * 0.5 : 0)) - pl.group.position.y) * 0.06;
    }

    /* ----- rocket: flies to the active planet ----- */
    var ap = planets[activeIdx];
    rocketTarget.set(ap.group.position.x + 4.2, ap.group.position.y + 2.6, ap.group.position.z + 3);
    var spd = sectionChanged ? 0.09 : 0.045;
    rocketBase.x += (rocketTarget.x - rocketBase.x) * spd;
    rocketBase.y += (rocketTarget.y - rocketBase.y) * spd;
    rocketBase.z += (rocketTarget.z - rocketBase.z) * spd;

    // boost orbit on 2nd scroll gesture
    var orbitX = 0, orbitY = 0, orbitZ = 0, flare = 0;
    if (boostT >= 0) {
      boostT += 0.022;
      if (boostT >= 1) { boostT = -1; }
      else {
        var ba = boostT * Math.PI * 2;
        orbitX = Math.cos(ba) * 5;
        orbitY = Math.sin(ba * 1.5) * 2.2;
        orbitZ = Math.sin(ba) * 1.5;
        flare = Math.sin(boostT * Math.PI);
      }
    }

    var hoverY = idle ? Math.sin(timeS * 2.1) * 0.45 : 0;
    rocket.position.set(
      rocketBase.x + orbitX,
      rocketBase.y + hoverY + orbitY,
      rocketBase.z + orbitZ
    );
    rocket.lookAt(ap.group.position.x, ap.group.position.y, ap.group.position.z);

    // flame: idle flicker, bigger while scrolling, huge on boost
    var flameLen = idle ? 0.75 : 1.25;
    flameLen *= (0.85 + 0.3 * Math.abs(Math.sin(timeS * 24)));
    flameLen *= (1 + flare * 2.6);
    flame.scale.set(1 + flare * 0.8, 1 + flare * 0.8, flameLen);
    flameCore.scale.set(1 + flare * 0.5, 1 + flare * 0.5, flameLen * 0.85);
    flameMat.opacity = 0.65 + flare * 0.35;

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
