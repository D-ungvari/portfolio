/**
 * Idle / sleep mode — Sprint B Phase 7 (B35c).
 *
 * After 5 minutes of inactivity, dims the screen and shows a lock-screen
 * clock. Any keypress, click, or touch wakes the OS.
 *
 * Replaces the previous matrix-rain idle behaviour.
 */
(function () {
  'use strict';

  var DIM_MS = 5 * 60 * 1000;
  var LOCK_MS = 10 * 60 * 1000;
  var dimTimer = null;
  var lockTimer = null;
  var sleeping = false;
  var lockEl = null;
  var clockEl = null;
  var clockUpdater = null;

  function reset() {
    if (sleeping) return;
    if (dimTimer) clearTimeout(dimTimer);
    if (lockTimer) clearTimeout(lockTimer);
    dimTimer = setTimeout(maybeDim, DIM_MS);
    lockTimer = setTimeout(maybeSleep, LOCK_MS);
  }

  function maybeDim() {
    if (sleeping) return;
    if (typeof GameOverlay !== 'undefined' && GameOverlay.isOpen && GameOverlay.isOpen()) return;
    if (window.LockScreen && LockScreen.startDim) LockScreen.startDim();
  }

  function maybeSleep() {
    if (typeof GameOverlay !== 'undefined' &&
        GameOverlay.isOpen && GameOverlay.isOpen()) {
      reset();
      return;
    }
    if (window.LockScreen && LockScreen.lock) {
      LockScreen.lock();
      sleeping = true;
      // When wake fires, re-arm — wake removes overlay; we hook to reset
      var checkWake = setInterval(function () {
        if (!LockScreen.isLocked()) {
          sleeping = false;
          clearInterval(checkWake);
          reset();
        }
      }, 500);
      return;
    }
    sleep();
  }

  function sleep() {
    if (sleeping) return;
    var prefersReduced = window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    sleeping = true;

    lockEl = document.createElement('div');
    lockEl.id = 'sleep-lock';
    lockEl.setAttribute('role', 'status');
    lockEl.setAttribute('aria-label', 'System idle. Press any key to wake.');

    var inner = document.createElement('div');
    inner.id = 'sleep-content';

    clockEl = document.createElement('div');
    clockEl.id = 'sleep-clock';
    inner.appendChild(clockEl);

    var hint = document.createElement('div');
    hint.id = 'sleep-hint';
    hint.textContent = '[ press any key to wake ]';
    inner.appendChild(hint);

    lockEl.appendChild(inner);
    document.body.appendChild(lockEl);

    if (!prefersReduced) {
      requestAnimationFrame(function () {
        if (lockEl) lockEl.classList.add('visible');
      });
    } else {
      lockEl.classList.add('visible', 'no-fade');
    }

    updateClock();
    clockUpdater = setInterval(updateClock, 1000);

    document.addEventListener('keydown', wake, true);
    document.addEventListener('mousedown', wake, true);
    document.addEventListener('touchstart', wake, true);
  }

  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  function updateClock() {
    if (!clockEl) return;
    var d = new Date();
    clockEl.textContent =
      pad(d.getHours()) + ':' +
      pad(d.getMinutes()) + ':' +
      pad(d.getSeconds());
  }

  function wake() {
    if (!sleeping) return;
    sleeping = false;
    document.removeEventListener('keydown', wake, true);
    document.removeEventListener('mousedown', wake, true);
    document.removeEventListener('touchstart', wake, true);

    if (clockUpdater) {
      clearInterval(clockUpdater);
      clockUpdater = null;
    }
    if (lockEl) {
      lockEl.classList.remove('visible');
      var toRemove = lockEl;
      setTimeout(function () {
        if (toRemove.parentNode) toRemove.parentNode.removeChild(toRemove);
      }, 350);
      lockEl = null;
      clockEl = null;
    }
    reset();
  }

  // Activity events that reset the timer
  var events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
  for (var i = 0; i < events.length; i++) {
    document.addEventListener(events[i], reset, { passive: true });
  }

  reset();

  window.SleepMode = {
    sleep: function () { if (!sleeping) sleep(); },
    wake: wake,
    isSleeping: function () { return sleeping; }
  };
})();
