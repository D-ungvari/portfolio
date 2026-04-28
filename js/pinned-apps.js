/**
 * Pinned apps strip — taskbar quick-launch icons.
 * Sits between the OS label/workspace and the running apps strip.
 */
(function () {
  'use strict';

  var DEFAULT_PINNED = ['terminal', 'files', 'settings', 'mail', 'cv', 'apps'];

  var APP_DEFS = {
    terminal: { glyph: '>_', title: 'Terminal', launch: function () {
      if (window.PaneToggle && PaneToggle.show) PaneToggle.show('terminal');
      var input = document.getElementById('command-input');
      if (input) input.focus();
    }},
    files:    { glyph: '▤',  title: 'Files',    launch: function () { window.FilesApp && FilesApp.open(); } },
    settings: { glyph: '⚙',  title: 'Settings', launch: function () { window.SettingsApp && SettingsApp.open(); } },
    mail:     { glyph: '✉',  title: 'Mail',     launch: function () { window.MailApp && MailApp.open(); } },
    cv:       { glyph: '📄', title: 'CV',       launch: function () { window.CVViewerApp && CVViewerApp.open(); } },
    apps:     { glyph: '▦',  title: 'Apps',     launch: function () { window.AppsGridApp && AppsGridApp.open(); } }
  };

  function loadPinned() {
    var saved = (window.Session && Session.get) ? Session.get('pinnedApps') : null;
    if (Array.isArray(saved) && saved.length) return saved;
    return DEFAULT_PINNED.slice();
  }

  function savePinned(arr) {
    if (window.Session && Session.set) Session.set('pinnedApps', arr);
  }

  function init() {
    var taskbar = document.getElementById('taskbar');
    var running = document.getElementById('taskbar-running');
    if (!taskbar || !running) return;

    var strip = document.createElement('div');
    strip.id = 'taskbar-pinned';
    strip.setAttribute('role', 'toolbar');
    strip.setAttribute('aria-label', 'Pinned apps');
    taskbar.insertBefore(strip, running);

    var pinned = loadPinned();
    for (var i = 0; i < pinned.length; i++) {
      (function (key) {
        var def = APP_DEFS[key];
        if (!def) return;
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'taskbar-pinned-app';
        btn.setAttribute('aria-label', def.title);
        btn.setAttribute('title', def.title);
        btn.setAttribute('data-app', key);
        btn.innerHTML = '<span class="pinned-glyph">' + def.glyph + '</span>';
        btn.addEventListener('click', function () { def.launch(); });
        btn.addEventListener('contextmenu', function (e) {
          e.preventDefault();
          unpin(key);
        });
        strip.appendChild(btn);
      })(pinned[i]);
    }
  }

  function unpin(key) {
    var pinned = loadPinned().filter(function (k) { return k !== key; });
    savePinned(pinned);
    var btn = document.querySelector('#taskbar-pinned [data-app="' + key + '"]');
    if (btn && btn.parentNode) btn.parentNode.removeChild(btn);
  }

  function pin(key) {
    var pinned = loadPinned();
    if (pinned.indexOf(key) !== -1) return;
    pinned.push(key);
    savePinned(pinned);
    // Re-render simple way: reload the strip
    var strip = document.getElementById('taskbar-pinned');
    if (strip && strip.parentNode) strip.parentNode.removeChild(strip);
    init();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(init, 60); });
  } else {
    setTimeout(init, 60);
  }

  window.PinnedApps = { pin: pin, unpin: unpin };
})();
