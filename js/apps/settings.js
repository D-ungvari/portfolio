/**
 * Settings app (B21) — toggles for scanlines, glow, density, font size,
 * motion override, and wallpaper grid/overlay.
 *
 * Writes to CSS vars + body classes, persists via Session.
 */
(function () {
  'use strict';

  var DEFAULTS = {
    scanlines: true,
    glowStrength: 1.0,    // 0.0 - 2.0
    density: 'comfortable', // 'compact' | 'comfortable'
    fontSize: 'M',         // 'S' | 'M' | 'L'
    motionOverride: false, // force-disable motion
    wallpaperGrid: true,
    wallpaperOverlay: true
  };

  function load() {
    var saved = (window.Session && Session.get) ? (Session.get('settings') || {}) : {};
    var merged = {};
    for (var k in DEFAULTS) merged[k] = (k in saved) ? saved[k] : DEFAULTS[k];
    return merged;
  }

  function save(settings) {
    if (window.Session && Session.set) Session.set('settings', settings);
    apply(settings);
  }

  function apply(s) {
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

  function buildContent() {
    var s = load();
    var c = document.createElement('div');
    c.className = 'app-settings app-content';

    function addToggle(label, key) {
      var row = document.createElement('label');
      row.className = 'app-row toggle-row';
      var name = document.createElement('span');
      name.textContent = label;
      var input = document.createElement('input');
      input.type = 'checkbox';
      input.checked = !!s[key];
      input.addEventListener('change', function () {
        s[key] = input.checked;
        save(s);
      });
      row.appendChild(name);
      row.appendChild(input);
      c.appendChild(row);
    }

    function addSelect(label, key, options) {
      var row = document.createElement('label');
      row.className = 'app-row select-row';
      var name = document.createElement('span');
      name.textContent = label;
      var sel = document.createElement('select');
      for (var i = 0; i < options.length; i++) {
        var opt = document.createElement('option');
        opt.value = options[i];
        opt.textContent = options[i];
        if (options[i] === s[key]) opt.selected = true;
        sel.appendChild(opt);
      }
      sel.addEventListener('change', function () {
        s[key] = sel.value;
        save(s);
      });
      row.appendChild(name);
      row.appendChild(sel);
      c.appendChild(row);
    }

    function addSlider(label, key, min, max, step) {
      var row = document.createElement('label');
      row.className = 'app-row slider-row';
      var name = document.createElement('span');
      name.textContent = label;
      var input = document.createElement('input');
      input.type = 'range';
      input.min = String(min);
      input.max = String(max);
      input.step = String(step);
      input.value = String(s[key]);
      var val = document.createElement('span');
      val.className = 'slider-value';
      val.textContent = s[key];
      input.addEventListener('input', function () {
        s[key] = parseFloat(input.value);
        val.textContent = s[key].toFixed(1);
        save(s);
      });
      row.appendChild(name);
      row.appendChild(input);
      row.appendChild(val);
      c.appendChild(row);
    }

    var hdr = document.createElement('h3');
    hdr.textContent = 'DISPLAY';
    c.appendChild(hdr);
    addToggle('Scanlines', 'scanlines');
    addToggle('Wallpaper grid', 'wallpaperGrid');
    addToggle('Wallpaper overlay', 'wallpaperOverlay');
    addSlider('Glow strength', 'glowStrength', 0, 2, 0.1);

    var hdr2 = document.createElement('h3');
    hdr2.textContent = 'TEXT';
    c.appendChild(hdr2);
    addSelect('Density', 'density', ['comfortable', 'compact']);
    addSelect('Font size', 'fontSize', ['S', 'M', 'L']);

    var hdr3 = document.createElement('h3');
    hdr3.textContent = 'ACCESSIBILITY';
    c.appendChild(hdr3);
    addToggle('Reduce motion (force)', 'motionOverride');

    var reset = document.createElement('button');
    reset.className = 'app-button';
    reset.type = 'button';
    reset.textContent = 'Reset to defaults';
    reset.addEventListener('click', function () {
      s = JSON.parse(JSON.stringify(DEFAULTS));
      save(s);
      // Reload window content
      var existing = window.WindowManager && WindowManager.byApp ? WindowManager.byApp('settings') : [];
      if (existing.length) {
        WindowManager.close(existing[0].id);
        open();
      }
    });
    c.appendChild(reset);

    return c;
  }

  function open() {
    if (!window.WindowManager) return;
    var existing = WindowManager.byApp('settings');
    if (existing && existing.length) {
      WindowManager.bringToFront(existing[0].id);
      return existing[0].id;
    }
    return WindowManager.open({
      app: 'settings',
      title: 'Settings',
      content: buildContent(),
      w: 480,
      h: 520,
      menubar: [
        { label: 'File', items: [
          { label: 'Reset to defaults', action: function () {
            var d = JSON.parse(JSON.stringify(DEFAULTS));
            save(d);
            var ex = WindowManager.byApp('settings');
            if (ex.length) { WindowManager.close(ex[0].id); open(); }
          }},
          '---',
          { label: 'Close', shortcut: 'Ctrl+W', action: function () {
            var ex = WindowManager.byApp('settings');
            if (ex.length) WindowManager.close(ex[0].id);
          }}
        ]},
        { label: 'View', items: [
          { label: 'Refresh', action: function () {
            var ex = WindowManager.byApp('settings');
            if (ex.length) { WindowManager.close(ex[0].id); open(); }
          }}
        ]},
        { label: 'Help', items: [
          { label: 'About Settings', disabled: true }
        ]}
      ],
      statusbar: 'All changes saved'
    });
  }

  // Apply persisted settings on script load
  apply(load());

  window.SettingsApp = { open: open, get: load };
})();
