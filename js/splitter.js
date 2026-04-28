/* splitter.js — drag-to-resize for the terminal pane.
   Vanilla JS, no modules. Persists width to localStorage.
   Skipped on viewports < 1024px (mobile/tablet handle layout differently). */

(function () {
  'use strict';

  var STORAGE_KEY = 'portfolio-terminal-width';
  var MIN_WIDTH_PX = 280;
  var MOBILE_BREAKPOINT = 1024;
  var KEYBOARD_NUDGE_PX = 32;

  function getMaxWidth() {
    return Math.floor(window.innerWidth * 0.6);
  }

  function clamp(value) {
    var max = getMaxWidth();
    if (value < MIN_WIDTH_PX) return MIN_WIDTH_PX;
    if (value > max) return max;
    return value;
  }

  function setWidth(px) {
    document.documentElement.style.setProperty('--terminal-width', px + 'px');
  }

  function currentWidthPx() {
    var divider = document.getElementById('pane-divider');
    var pane = document.getElementById('terminal-pane');
    if (pane) return pane.getBoundingClientRect().width;
    if (divider) return window.innerWidth - divider.getBoundingClientRect().right;
    return window.innerWidth * 0.4;
  }

  function loadSavedWidth() {
    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return;
      var px = parseInt(saved, 10);
      if (!isFinite(px) || px <= 0) return;
      setWidth(clamp(px));
    } catch (e) {
      /* localStorage unavailable — ignore */
    }
  }

  function saveWidth(px) {
    try {
      localStorage.setItem(STORAGE_KEY, px + 'px');
    } catch (e) {
      /* ignore */
    }
  }

  function getClientX(event) {
    if (event.touches && event.touches.length) return event.touches[0].clientX;
    if (event.changedTouches && event.changedTouches.length) return event.changedTouches[0].clientX;
    return event.clientX;
  }

  function attachDragHandlers(divider) {
    var dragging = false;

    function onMove(event) {
      if (!dragging) return;
      var clientX = getClientX(event);
      var newWidth = clamp(window.innerWidth - clientX);
      setWidth(newWidth);
      if (event.cancelable) event.preventDefault();
    }

    function onEnd() {
      if (!dragging) return;
      dragging = false;
      divider.classList.remove('dragging');
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onEnd);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onEnd);
      document.removeEventListener('touchcancel', onEnd);
      document.body.style.userSelect = '';
      saveWidth(Math.round(currentWidthPx()));
    }

    function onStart(event) {
      if (window.innerWidth < MOBILE_BREAKPOINT) return;
      dragging = true;
      divider.classList.add('dragging');
      document.body.style.userSelect = 'none';
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onEnd);
      document.addEventListener('touchmove', onMove, { passive: false });
      document.addEventListener('touchend', onEnd);
      document.addEventListener('touchcancel', onEnd);
      if (event.cancelable) event.preventDefault();
    }

    divider.addEventListener('mousedown', onStart);
    divider.addEventListener('touchstart', onStart, { passive: false });

    divider.addEventListener('keydown', function (event) {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      var current = Math.round(currentWidthPx());
      // ArrowLeft grows the terminal (shifts divider left); ArrowRight shrinks it.
      var delta = event.key === 'ArrowLeft' ? KEYBOARD_NUDGE_PX : -KEYBOARD_NUDGE_PX;
      var next = clamp(current + delta);
      setWidth(next);
      saveWidth(next);
      event.preventDefault();
    });
  }

  function initSplitter() {
    loadSavedWidth();
    if (window.innerWidth < MOBILE_BREAKPOINT) return;
    var divider = document.getElementById('pane-divider');
    if (!divider) return;
    attachDragHandlers(divider);
  }

  // Expose for main.js if it wants to re-run after dynamic mounts.
  if (typeof window !== 'undefined') {
    window.initSplitter = initSplitter;
    if (document.readyState !== 'loading') {
      initSplitter();
    } else {
      document.addEventListener('DOMContentLoaded', initSplitter);
    }
  }
})();
