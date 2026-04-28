/**
 * Login screen — first-visit-only welcome flow.
 *
 * After boot completes, if visitCount === 0, briefly show a login UI:
 *  avatar, "visitor" username, password field that auto-fills, then welcome
 *  splash → desktop fade-in. Skippable on any keypress.
 */
(function () {
  'use strict';

  var shown = false;
  var el = null;

  function getInitials() {
    var p = (window.Persona && Persona.get) ? Persona.get() : null;
    if (!p && window.__PERSONA_FALLBACK) p = window.__PERSONA_FALLBACK;
    var name = (p && p.name) || 'visitor';
    var parts = name.split(/\s+/);
    var ini = parts.map(function (x) { return x.charAt(0).toUpperCase(); }).join('').slice(0, 2);
    return { initials: ini, name: name };
  }

  function show(onDone) {
    if (shown) return;
    shown = true;
    var info = getInitials();
    el = document.createElement('div');
    el.id = 'login-screen';
    el.innerHTML =
      '<div class="login-bg"></div>' +
      '<div class="login-content">' +
        '<div class="login-avatar">' + info.initials + '</div>' +
        '<div class="login-user">visitor</div>' +
        '<input type="password" class="login-input" readonly value="" aria-label="Password" />' +
        '<div class="login-hint">authenticating</div>' +
      '</div>';
    document.body.appendChild(el);
    requestAnimationFrame(function () { el.classList.add('visible'); });

    var input = el.querySelector('.login-input');
    var hint = el.querySelector('.login-hint');

    var skipped = false;
    function skip() {
      if (skipped) return;
      skipped = true;
      finish(onDone);
    }
    document.addEventListener('keydown', skip, true);
    document.addEventListener('mousedown', skip, true);

    var prefersReduced = window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      input.value = '••••••••';
      setTimeout(skip, 200);
      return;
    }

    var dots = '';
    var i = 0;
    var typer = setInterval(function () {
      if (skipped) { clearInterval(typer); return; }
      dots += '•';
      input.value = dots;
      i++;
      if (i >= 8) {
        clearInterval(typer);
        if (hint) hint.textContent = 'welcome, ' + info.name;
        setTimeout(function () {
          document.removeEventListener('keydown', skip, true);
          document.removeEventListener('mousedown', skip, true);
          finish(onDone);
        }, 800);
      }
    }, 120);
  }

  function finish(cb) {
    if (!el) { if (cb) cb(); return; }
    el.classList.remove('visible');
    setTimeout(function () {
      if (el && el.parentNode) el.parentNode.removeChild(el);
      el = null;
      if (cb) cb();
    }, 300);
  }

  function shouldShow() {
    if (!window.Session || !Session.get) return false;
    var count = Session.get('visitCount');
    return !count || count < 1;
  }

  window.LoginScreen = { show: show, shouldShow: shouldShow };
})();
