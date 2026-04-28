/**
 * OS-themed commands for DavOS shell.
 * /desktop, /launch, /wallpaper, /shutdown, /logout, /htop
 */

// /desktop — focus the desktop pane
registerCommand('/desktop', 'focus the desktop', function(terminal) {
  terminal.output('> focusing desktop...', 'accent');
  var grid = document.getElementById('icon-grid');
  if (grid) {
    // If no icon selected, select first
    if (window.Desktop && typeof window.Desktop.selectIndex === 'function') {
      window.Desktop.selectIndex(0);
    }
  }
  // On mobile, switch to desktop tab (Phase 5 will wire PaneToggle; guard here)
  if (window.PaneToggle && typeof window.PaneToggle.show === 'function') {
    window.PaneToggle.show('desktop');
  }
});

// /launch <project> — alias of /play
registerCommand('/launch', 'launch a project (alias of /play)', function(terminal) {
  terminal.output('usage: /launch <project>', 'dim');
  if (typeof projects === 'undefined') return;
  for (var i = 0; i < projects.length; i++) {
    terminal.output('  /launch ' + projects[i].command.replace('/', ''));
  }
}, true);

(function() {
  if (typeof projects === 'undefined') return;
  for (var i = 0; i < projects.length; i++) {
    (function(p) {
      var shortName = p.command.replace('/', '');
      registerCommand('/launch ' + shortName, 'launch ' + p.title, function(terminal) {
        terminal.output('> launching ' + p.title.toLowerCase() + '...', 'accent');
        if (typeof GameOverlay !== 'undefined') {
          GameOverlay.open(p.liveUrl, p.title, terminal);
        } else if (typeof window.open === 'function') {
          window.open(p.liveUrl, '_blank', 'noopener');
        }
        if (window.Desktop && typeof window.Desktop.highlightProject === 'function') {
          window.Desktop.highlightProject(p.command);
        }
      }, true);
    })(projects[i]);
  }
})();

// /wallpaper <theme> — alias of /theme
registerCommand('/wallpaper', 'change OS wallpaper (alias of /theme)', function(terminal) {
  if (typeof themes === 'undefined') {
    terminal.output('themes unavailable.', 'error');
    return;
  }
  var names = Object.keys(themes);
  terminal.output('available wallpapers:');
  terminal.output('');
  for (var i = 0; i < names.length; i++) {
    terminal.output('  /wallpaper ' + names[i] + (names[i] === currentTheme ? ' (active)' : ''));
  }
});

(function() {
  if (typeof themes === 'undefined') return;
  var names = Object.keys(themes);
  for (var i = 0; i < names.length; i++) {
    (function(name) {
      registerCommand('/wallpaper ' + name, 'set wallpaper: ' + name, function(terminal) {
        if (typeof applyTheme === 'function') applyTheme(name);
        terminal.output('wallpaper set to ' + name + '.', 'accent');
      }, true);
    })(names[i]);
  }
})();

// /shutdown — BSOD overlay + auto-reboot
function _showBSOD(terminal, text, autoReboot) {
  // Remove any existing
  var existing = document.getElementById('bsod-overlay');
  if (existing) existing.remove();

  var overlay = document.createElement('div');
  overlay.id = 'bsod-overlay';
  overlay.setAttribute('role', 'alert');
  overlay.innerHTML =
    '<div class="bsod-content">' +
      '<div class="bsod-title">DavOS</div>' +
      '<div>' + text + '</div>' +
      (autoReboot ? '<div style="margin-top:24px;opacity:0.7;font-size:13px;">Press any key to reboot, or wait 3 seconds...</div>' : '') +
    '</div>';
  document.body.appendChild(overlay);

  function reboot() {
    document.removeEventListener('keydown', reboot, true);
    overlay.remove();
    location.reload();
  }
  document.addEventListener('keydown', reboot, true);
  if (autoReboot) {
    setTimeout(reboot, 3000);
  }
}

registerCommand('/shutdown', 'shutdown DavOS', function(terminal) {
  terminal.output('> system going down...', 'dim');
  setTimeout(function() {
    _showBSOD(terminal,
      'It is now safe to turn off your portfolio.',
      true);
  }, 400);
}, true);

registerCommand('/logout', 'log out', function(terminal) {
  terminal.output('> goodbye, visitor.', 'dim');
  setTimeout(function() {
    _showBSOD(terminal,
      'Session ended. Welcome back anytime.',
      true);
  }, 400);
}, true);

// /htop — fake process list
registerCommand('/htop', 'show running processes', function(terminal) {
  var rows = [
    '  PID  USER     %CPU  %MEM  COMMAND',
    '    1  visitor   0.1   0.5  /sbin/init --portfolio',
    '   42  dave     99.0  42.0  node coffee.js',
    '  128  dave      8.2  12.0  vim --no-exit-required',
    '  256  dave      0.3   2.1  spotify (lo-fi beats)',
    '  512  visitor   2.1   1.2  /bin/easter-eggs --hidden',
    ' 1024  dave      0.0   0.0  meeting.zoom (idle since 2026)',
    ' 2048  recruiter 0.0   0.0  /opt/linkedin/spam.daemon (sleeping)'
  ];
  terminal.outputLines(rows, 'dim');
  terminal.output('');
});

// /lock — lock the screen
registerCommand('/lock', 'lock the screen', function(terminal) {
  terminal.output('> locking screen...', 'accent');
  setTimeout(function() {
    if (window.LockScreen && LockScreen.lock) LockScreen.lock();
  }, 200);
}, true);

// /sleep — alias for /lock
registerCommand('/sleep', 'sleep mode', function(terminal) {
  terminal.output('> entering sleep...', 'accent');
  setTimeout(function() {
    if (window.LockScreen && LockScreen.lock) LockScreen.lock();
  }, 200);
}, true);

// /files — open the file explorer app
registerCommand('/files', 'open file explorer', function(terminal) {
  terminal.output('> opening files...', 'accent');
  if (window.FilesApp && FilesApp.open) FilesApp.open();
  else terminal.output('files app unavailable', 'error');
}, true);
