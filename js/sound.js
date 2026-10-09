/* ============================================================
   0xray portfolio — background sound toggle
   - Floating toggle (bottom-right). Browsers block autoplay with
     sound, so playback only starts on user gesture.
   - Choice persists in localStorage; if it was on, playback
     resumes on the first pointer/key interaction.
   - If backsound.mp3 is missing, the toggle hides itself.
   ============================================================ */
'use strict';

(function () {
  var btn = document.getElementById('soundToggle');
  if (!btn) return;

  var KEY = 'portfolio-sound';
  var audio = new Audio('backsound.mp3');
  audio.loop = true;
  audio.volume = 0.55;
  audio.preload = 'auto';

  var wantOn = false;
  try { wantOn = localStorage.getItem(KEY) === 'on'; } catch (e) { /* private mode */ }

  function setIcon(on) {
    btn.classList.toggle('is-on', on);
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    btn.setAttribute('aria-label', on ? 'Mute background sound' : 'Play background sound');
  }

  function remember(on) {
    try { localStorage.setItem(KEY, on ? 'on' : 'off'); } catch (e) { /* private mode */ }
  }

  audio.addEventListener('error', function () {
    btn.style.display = 'none';
  }, { once: true });

  function play() {
    var p = audio.play();
    if (p && typeof p.then === 'function') {
      p.then(function () { setIcon(true); remember(true); })
       .catch(function () { /* autoplay blocked: wait for a gesture */ });
    } else {
      setIcon(true); remember(true);
    }
  }

  function stop() {
    audio.pause();
    setIcon(false);
    remember(false);
  }

  btn.addEventListener('click', function () {
    if (audio.paused) play(); else stop();
  });

  if (wantOn) {
    var resume = function () {
      document.removeEventListener('pointerdown', resume);
      document.removeEventListener('keydown', resume);
      play();
    };
    document.addEventListener('pointerdown', resume);
    document.addEventListener('keydown', resume);
  }
})();
