/**
 * Quick Settings — taskbar popout for theme, effects, density, font, sleep, lock.
 * Shares state with the full Settings app.
 */
(function () {
  'use strict';

  var popout = null;
  var btn = null;

  function close() {
    if (!popout) return;
    document.removeEventListener('mousedown', onOutside, true);
    document.removeEventListener('keydown', onKeydown, true);
    var el = popout;
    popout = null;
    if (window.Anim) {
      window.Anim.fadeOut(el, { dur: 100 }).then(function () {
        if (el && el.parentNode) el.parentNode.removeChild(el);
      });
    } else if (el && el.parentNode) el.parentNode.removeChild(el);
  }

  function onOutside(e) {
    if (!popout) return;
    if (popout.contains(e.target)) return;
    if (btn && btn.contains(e.target)) return;
    close();
  }
  function onKeydown(e) { if (e.key === 'Escape') close(); }

  function loadSettings() {
    var saved = (window.Session && Session.get) ? (Session.get('settings') || {}) : {};
    return {
      scanlines: 'scanlines' in saved ? saved.scanlines : true,
      glowStrength: 'glowStrength' in saved ? saved.glowStrength : 1.0,
      density: saved.density || 'comfortable',
      fontSize: saved.fontSize || 'M',
      motionOverride: !!saved.motionOverride,
      wallpaperGrid: 'wallpaperGrid' in saved ? saved.wallpaperGrid : true,
      wallpaperOverlay: 'wallpaperOverlay' in saved ? saved.wallpaperOverlay : true
    };
  }

  function saveSettings(s) {
    if (window.Session && Session.set) Session.set('settings', s);
    var root = document.documentElement;
    root.classList.toggle('settings-no-scanlines', !s.scanlines);
    root.classList.toggle('settings-no-overlay', !s.wallpaperOverlay);
    root.classList.toggle('settings-no-grid', !s.wallpaperGrid);
    root.classList.toggle('settings-compact', s.density === 'compact');
    root.classList.toggle('settings-motion-off', !!s.motionOverride);
    root.style.setProperty('--user-glow-strength', String(s.glowStrength));
    root.classList.remove('font-S', 'font-M', 'font-L');
    root.classList.add('font-' + s.fontSize);
  }

  function open() {
    if (popout) { close(); return; }
    var s = loadSettings();
    popout = document.createElement('div');
    popout.className = 'quick-settings';
    popout.setAttribute('role', 'dialog');
    popout.setAttribute('aria-label', 'Quick settings');

    // Theme row
    var themesAvail = (typeof themes !== 'undefined') ? Object.keys(themes) : ['green'];
    var current = (typeof currentTheme !== 'undefined') ? currentTheme : 'green';
    var themeRow = '<div class="qs-section"><div class="qs-label">Theme</div><div class="qs-themes">';
    for (var i = 0; i < themesAvail.length; i++) {
      themeRow += '<button type="button" data-theme="' + themesAvail[i] + '" class="qs-theme' + (themesAvail[i] === current ? ' active' : '') + '">' + themesAvail[i] + '</button>';
    }
    themeRow += '</div></div>';

    popout.innerHTML =
      themeRow +
      '<div class="qs-section">' +
        '<label class="qs-toggle"><span>Scanlines</span><input type="checkbox" data-key="scanlines" ' + (s.scanlines ? 'checked' : '') + '></label>' +
        '<label class="qs-toggle"><span>Wallpaper grid</span><input type="checkbox" data-key="wallpaperGrid" ' + (s.wallpaperGrid ? 'checked' : '') + '></label>' +
        '<label class="qs-toggle"><span>Reduce motion</span><input type="checkbox" data-key="motionOverride" ' + (s.motionOverride ? 'checked' : '') + '></label>' +
      '</div>' +
      '<div class="qs-section">' +
        '<div class="qs-label">Glow strength</div>' +
        '<input type="range" data-key="glowStrength" min="0" max="2" step="0.1" value="' + s.glowStrength + '" class="qs-slider">' +
      '</div>' +
      '<div class="qs-section">' +
        '<div class="qs-label">Density</div>' +
        '<div class="qs-segmented" data-key="density">' +
          '<button type="button" data-val="comfortable" class="' + (s.density === 'comfortable' ? 'active' : '') + '">comfy</button>' +
          '<button type="button" data-val="compact" class="' + (s.density === 'compact' ? 'active' : '') + '">compact</button>' +
        '</div>' +
      '</div>' +
      '<div class="qs-section">' +
        '<div class="qs-label">Font size</div>' +
        '<div class="qs-segmented" data-key="fontSize">' +
          '<button type="button" data-val="S" class="' + (s.fontSize === 'S' ? 'active' : '') + '">S</button>' +
          '<button type="button" data-val="M" class="' + (s.fontSize === 'M' ? 'active' : '') + '">M</button>' +
          '<button type="button" data-val="L" class="' + (s.fontSize === 'L' ? 'active' : '') + '">L</button>' +
        '</div>' +
      '</div>' +
      '<div class="qs-actions">' +
        '<button type="button" class="qs-action" data-action="sleep">Sleep</button>' +
        '<button type="button" class="qs-action" data-action="lock">Lock</button>' +
        '<button type="button" class="qs-action" data-action="settings">All settings →</button>' +
      '</div>';

    document.body.appendChild(popout);

    if (btn) {
      var r = btn.getBoundingClientRect();
      var w = popout.offsetWidth || 320;
      var left = r.right - w;
      if (left < 8) left = 8;
      popout.style.left = left + 'px';
      popout.style.top = (r.bottom + 6) + 'px';
    }

    // Wire interactions
    popout.querySelectorAll('.qs-theme').forEach(function (b) {
      b.addEventListener('click', function (e) {
        var name = b.getAttribute('data-theme');
        if (typeof applyTheme === 'function') applyTheme(name, e.clientX, e.clientY);
        popout.querySelectorAll('.qs-theme').forEach(function (x) { x.classList.remove('active'); });
        b.classList.add('active');
      });
    });
    popout.querySelectorAll('.qs-toggle input').forEach(function (input) {
      input.addEventListener('change', function () {
        var key = input.getAttribute('data-key');
        s[key] = input.checked;
        saveSettings(s);
      });
    });
    popout.querySelectorAll('.qs-slider').forEach(function (slider) {
      slider.addEventListener('input', function () {
        var key = slider.getAttribute('data-key');
        s[key] = parseFloat(slider.value);
        saveSettings(s);
      });
    });
    popout.querySelectorAll('.qs-segmented').forEach(function (group) {
      var key = group.getAttribute('data-key');
      group.querySelectorAll('button').forEach(function (b) {
        b.addEventListener('click', function () {
          group.querySelectorAll('button').forEach(function (x) { x.classList.remove('active'); });
          b.classList.add('active');
          s[key] = b.getAttribute('data-val');
          saveSettings(s);
        });
      });
    });
    popout.querySelectorAll('.qs-action').forEach(function (b) {
      b.addEventListener('click', function () {
        var action = b.getAttribute('data-action');
        close();
        if (action === 'sleep' && window.SleepMode && SleepMode.sleep) SleepMode.sleep();
        else if (action === 'lock' && window.LockScreen && LockScreen.lock) LockScreen.lock();
        else if (action === 'settings' && window.SettingsApp) SettingsApp.open();
      });
    });

    if (window.Anim) window.Anim.slideIn(popout, 'up', { dur: 160, distance: 10 });
    setTimeout(function () {
      document.addEventListener('mousedown', onOutside, true);
      document.addEventListener('keydown', onKeydown, true);
    }, 0);
  }

  function init() {
    var taskbarRight = document.getElementById('taskbar-right');
    if (!taskbarRight) return;
    var clock = document.getElementById('taskbar-clock');
    btn = document.createElement('button');
    btn.id = 'taskbar-quick-settings';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Quick settings');
    btn.title = 'Quick settings';
    btn.innerHTML = '<span>≡</span>';
    if (clock) taskbarRight.insertBefore(btn, clock);
    else taskbarRight.appendChild(btn);
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      popout ? close() : open();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(init, 70); });
  } else {
    setTimeout(init, 70);
  }

  window.QuickSettings = { open: open, close: close, toggle: function () { popout ? close() : open(); } };
})();
