/**
 * Wallpaper parallax — subtle mouse-follow on desktop wallpaper.
 * Disabled on touch + reduced motion. rAF-throttled.
 */
(function () {
  'use strict';

  var pane = null;
  var pending = false;
  var targetX = 0, targetY = 0;

  function reduced() {
    try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; }
    catch (e) { return false; }
  }
  function isTouch() {
    return ('ontouchstart' in window) || (navigator.maxTouchPoints > 0 && !window.matchMedia('(hover: hover)').matches);
  }

  function onMove(e) {
    if (!pane) return;
    var rect = pane.getBoundingClientRect();
    var cx = rect.left + rect.width / 2;
    var cy = rect.top + rect.height / 2;
    var nx = (e.clientX - cx) / (rect.width / 2);
    var ny = (e.clientY - cy) / (rect.height / 2);
    targetX = Math.max(-1, Math.min(1, nx));
    targetY = Math.max(-1, Math.min(1, ny));
    if (!pending) {
      pending = true;
      requestAnimationFrame(apply);
    }
  }

  function apply() {
    pending = false;
    if (!pane) return;
    var px = (targetX * 8).toFixed(2);
    var py = (targetY * 8).toFixed(2);
    pane.style.setProperty('--parallax-x', px + 'px');
    pane.style.setProperty('--parallax-y', py + 'px');
  }

  function init() {
    if (reduced() || isTouch()) return;
    pane = document.getElementById('desktop-wallpaper');
    if (!pane) return;
    pane.classList.add('parallax-on');
    document.addEventListener('mousemove', onMove, { passive: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
