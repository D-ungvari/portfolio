/**
 * Idle detection — triggers matrix rain after 5 minutes of inactivity.
 */

(function() {
  var IDLE_TIMEOUT = 5 * 60 * 1000; // 5 minutes
  var idleTimer = null;
  var matrixRunning = false;

  function resetIdleTimer() {
    if (matrixRunning) return;

    clearTimeout(idleTimer);
    idleTimer = setTimeout(onIdle, IDLE_TIMEOUT);
  }

  function onIdle() {
    // Don't trigger if game overlay is open
    if (typeof GameOverlay !== 'undefined' && GameOverlay.isOpen()) return;

    // Don't trigger if reduced motion is preferred
    var prefersReducedMotion = window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // Don't trigger if matrix rain function isn't available
    if (typeof runMatrixRain !== 'function') return;

    matrixRunning = true;
    runMatrixRain(6000);

    // Reset after matrix ends
    setTimeout(function() {
      matrixRunning = false;
      resetIdleTimer();
    }, 8000);
  }

  // Track user activity
  var events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
  for (var i = 0; i < events.length; i++) {
    document.addEventListener(events[i], resetIdleTimer, { passive: true });
  }

  // Start the timer
  resetIdleTimer();
})();
