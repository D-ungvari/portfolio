/**
 * Lock screen — DavOS v4 C3.3
 *
 * Replaces the bare sleep overlay from idle.js. Adds:
 *   - Avatar block with persona name
 *   - Two-phase: dim (60% over 800ms) → full lock (full overlay)
 *   - Wake on any input
 *   - LockScreen.lock() can be called manually (Quick Settings, /lock)
 */
(function () {
  'use strict';

  var dimEl = null;
  var lockEl = null;
  var clockUpdater = null;
  var locked = false;
  var dimming = false;

  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  function getInitials() {
    var p = (window.Persona && Persona.get) ? Persona.get() : null;
    if (!p && window.__PERSONA_FALLBACK) p = window.__PERSONA_FALLBACK;
    var name = (p && p.name) || 'visitor';
    var parts = name.split(/\s+/);
    var ini = parts.map(function (x) { return x.charAt(0).toUpperCase(); }).join('').slice(0, 2);
    return { initials: ini, name: name };
  }

  function buildAvatarBlock() {
    var info = getInitials();
    var p = (window.Persona && Persona.get) ? Persona.get() : null;
    var role = (p && p.role) ? p.role : '';
    return (
      '<div class="lock-avatar-wrap">' +
        '<div class="lock-avatar">' + info.initials + '</div>' +
        '<div class="lock-name">' + info.name + '</div>' +
        '<div class="lock-role">' + role + '</div>' +
      '</div>'
    );
  }

  function startDim() {
    if (dimming || locked) return;
    dimming = true;
    dimEl = document.createElement('div');
    dimEl.id = 'lock-dim';
    document.body.appendChild(dimEl);
    requestAnimationFrame(function () { if (dimEl) dimEl.classList.add('visible'); });

    // Bail dim on any input — user is back
    var bail = function () {
      stopDim();
      document.removeEventListener('mousemove', bail, true);
      document.removeEventListener('mousedown', bail, true);
      document.removeEventListener('keydown', bail, true);
      document.removeEventListener('touchstart', bail, true);
    };
    document.addEventListener('mousemove', bail, true);
    document.addEventListener('mousedown', bail, true);
    document.addEventListener('keydown', bail, true);
    document.addEventListener('touchstart', bail, true);
  }

  function stopDim() {
    if (!dimming) return;
    dimming = false;
    if (dimEl) {
      dimEl.classList.remove('visible');
      var d = dimEl;
      setTimeout(function () { if (d.parentNode) d.parentNode.removeChild(d); }, 350);
      dimEl = null;
    }
  }

  function lock() {
    if (locked) return;
    locked = true;
    stopDim();

    lockEl = document.createElement('div');
    lockEl.id = 'lock-screen';
    lockEl.setAttribute('role', 'dialog');
    lockEl.setAttribute('aria-label', 'Screen locked');
    lockEl.innerHTML =
      '<div class="lock-bg"></div>' +
      '<div class="lock-content">' +
        '<div class="lock-clock"></div>' +
        '<div class="lock-date"></div>' +
        buildAvatarBlock() +
        '<input type="password" class="lock-input" placeholder="•••••••• (any key to unlock)" aria-label="Unlock" />' +
        '<div class="lock-hint">screen locked. press any key.</div>' +
      '</div>';
    document.body.appendChild(lockEl);
    requestAnimationFrame(function () { if (lockEl) lockEl.classList.add('visible'); });

    function tickClock() {
      if (!lockEl) return;
      var d = new Date();
      var c = lockEl.querySelector('.lock-clock');
      var dt = lockEl.querySelector('.lock-date');
      if (c) c.textContent = pad(d.getHours()) + ':' + pad(d.getMinutes());
      if (dt) dt.textContent = d.toLocaleDateString('en-US', { weekday: 'long' }) + ', ' + d.toISOString().slice(0, 10);
    }
    tickClock();
    clockUpdater = setInterval(tickClock, 1000);

    document.addEventListener('keydown', wake, true);
    document.addEventListener('mousedown', wake, true);
    document.addEventListener('touchstart', wake, true);

    // Auto-focus the input so password chars feed visual
    setTimeout(function () {
      var input = lockEl && lockEl.querySelector('.lock-input');
      if (input) input.focus();
    }, 300);
  }

  function wake(e) {
    if (!locked) return;
    // Allow Esc to clear input but not unlock immediately if user is still typing
    if (e && e.key === 'Escape') {
      var input = lockEl && lockEl.querySelector('.lock-input');
      if (input && input.value) { input.value = ''; e.preventDefault(); return; }
    }
    locked = false;
    document.removeEventListener('keydown', wake, true);
    document.removeEventListener('mousedown', wake, true);
    document.removeEventListener('touchstart', wake, true);
    if (clockUpdater) { clearInterval(clockUpdater); clockUpdater = null; }
    if (lockEl) {
      lockEl.classList.remove('visible');
      var el = lockEl;
      setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 250);
      lockEl = null;
    }
  }

  function isLocked() { return locked; }

  window.LockScreen = {
    lock: lock,
    wake: wake,
    isLocked: isLocked,
    startDim: startDim,
    stopDim: stopDim
  };

  // /lock command registration
  function init() {
    if (window._terminalRef && typeof commands === 'object') {
      // Don't override; let os-commands handle it through a registration if it exists
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
