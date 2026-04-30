/**
 * Lock screen — DavOS v4 C3.3 + sprint E E02
 *
 *   - Avatar block with persona name
 *   - Two-phase: dim (idle 5min) → full lock (idle 10min or manual)
 *   - Dim phase wakes on any input (mouse / key / touch)
 *   - Full lock requires non-empty password input → Enter to "auth"
 *   - Esc clears the input without unlocking
 *   - LockScreen.lock() can be called manually (Quick Settings, /lock)
 */
(function () {
  'use strict';

  var dimEl = null;
  var lockEl = null;
  var clockUpdater = null;
  var locked = false;
  var dimming = false;
  var attempts = 0;

  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  function reduced() {
    try { return !!(window.Anim && window.Anim.reduced && window.Anim.reduced()); }
    catch (e) { return false; }
  }

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

    // Dim phase still wakes on any input — user is back at their desk
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
    attempts = 0;
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
        '<form class="lock-form" autocomplete="off">' +
          '<input type="password" class="lock-input" ' +
                  'placeholder="enter password" aria-label="Unlock password" ' +
                  'autocomplete="off" autocorrect="off" spellcheck="false" />' +
          '<button type="submit" class="lock-submit" aria-label="unlock">unlock</button>' +
        '</form>' +
        '<div class="lock-hint" aria-live="polite">enter any password to unlock</div>' +
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

    var input = lockEl.querySelector('.lock-input');
    var form = lockEl.querySelector('.lock-form');
    var hint = lockEl.querySelector('.lock-hint');

    // Form submit / Enter — central path
    if (form) form.addEventListener('submit', function (e) {
      e.preventDefault();
      submitAttempt(input, hint);
    });

    // Esc inside the input clears, doesn't unlock
    if (input) input.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        input.value = '';
        input.focus();
      }
    });

    // Auto-focus the input
    setTimeout(function () { if (input) input.focus(); }, reduced() ? 0 : 300);
  }

  function submitAttempt(input, hint) {
    if (!input || !lockEl) return;
    var val = input.value || '';

    if (val === '') {
      // Empty submit → shake + dry feedback. Don't unlock.
      attempts++;
      if (window.Anim && Anim.shake) Anim.shake(input);
      else lockEl.classList.add('lock-shake');
      if (hint) {
        hint.textContent = attempts >= 1
          ? 'try any password — this is a portfolio.'
          : 'no password entered.';
      }
      setTimeout(function () { if (lockEl) lockEl.classList.remove('lock-shake'); }, 360);
      return;
    }

    // Non-empty → "authenticate" then unlock
    attempts++;
    input.disabled = true;
    if (hint) hint.textContent = 'authenticating' + (reduced() ? '' : '...');

    if (reduced()) {
      finalizeUnlock();
      return;
    }

    // Animated dot ramp ~600ms
    var dots = 0;
    var t = setInterval(function () {
      if (!lockEl) { clearInterval(t); return; }
      dots = (dots + 1) % 4;
      if (hint) hint.textContent = 'authenticating' + new Array(dots + 1).join('.');
    }, 150);

    setTimeout(function () {
      clearInterval(t);
      finalizeUnlock();
    }, 600);
  }

  function finalizeUnlock() {
    if (!locked) return;
    locked = false;
    if (clockUpdater) { clearInterval(clockUpdater); clockUpdater = null; }
    if (lockEl) {
      lockEl.classList.remove('visible');
      var el = lockEl;
      setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, reduced() ? 0 : 250);
      lockEl = null;
    }
  }

  // Backwards-compat: external callers (idle.js, /sleep) may call wake() to force unlock.
  function wake() {
    if (!locked) return;
    finalizeUnlock();
  }

  function isLocked() { return locked; }

  window.LockScreen = {
    lock: lock,
    wake: wake,
    isLocked: isLocked,
    startDim: startDim,
    stopDim: stopDim
  };

  function init() {}
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
