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

// /htop — interactive process viewer (sprint E E13)
//
// Falls back to a static snapshot when there's no terminal pane to attach to
// (e.g. in tests with a mock terminal). Otherwise opens an overlay with arrow
// nav, k-to-kill, auto-respawning fake processes, Esc to exit.
(function () {
  var INITIAL_ROWS = [
    {pid: 1,    user: 'visitor',   cpu:  0.1, mem:  0.5, cmd: '/sbin/init --portfolio'},
    {pid: 42,   user: 'dave',      cpu: 99.0, mem: 42.0, cmd: 'node coffee.js'},
    {pid: 128,  user: 'dave',      cpu:  8.2, mem: 12.0, cmd: 'vim --no-exit-required'},
    {pid: 256,  user: 'dave',      cpu:  0.3, mem:  2.1, cmd: 'spotify (lo-fi beats)'},
    {pid: 512,  user: 'visitor',   cpu:  2.1, mem:  1.2, cmd: '/bin/easter-eggs --hidden'},
    {pid: 1024, user: 'dave',      cpu:  0.0, mem:  0.0, cmd: 'meeting.zoom (idle since 2026)'},
    {pid: 2048, user: 'recruiter', cpu:  0.0, mem:  0.0, cmd: '/opt/linkedin/spam.daemon (sleeping)'}
  ];
  var POOL = [
    'npm install (forever)', 'jest --watch', 'node --inspect',
    'git rebase --interactive', 'ssh recruiter@dreams', 'tail -f /dev/regret',
    'docker compose up', 'firefox (137 tabs)', 'tsc --watch',
    'cron: feed cat (idle)'
  ];

  function pad(s, n) { s = String(s); return s.length >= n ? s.slice(0, n) : s + new Array(n - s.length + 1).join(' '); }
  function lpad(s, n) { s = String(s); return s.length >= n ? s : new Array(n - s.length + 1).join(' ') + s; }

  function renderRowText(r) {
    return lpad(r.pid, 5) + '  ' + pad(r.user, 9) + lpad(r.cpu.toFixed(1), 5) + '  ' + lpad(r.mem.toFixed(1), 5) + '  ' + r.cmd;
  }

  function staticSnapshot(terminal) {
    terminal.output('  PID  USER     %CPU  %MEM  COMMAND', 'dim');
    for (var i = 0; i < INITIAL_ROWS.length; i++) {
      terminal.output(renderRowText(INITIAL_ROWS[i]), 'dim');
    }
    terminal.output('');
  }

  registerCommand('/htop', 'show running processes', function (terminal) {
    // Always emit the snapshot first — preserves backwards-compat with tests
    // that assert on terminal output and gives the user something readable
    // even if the overlay can't open.
    staticSnapshot(terminal);

    var pane = document.getElementById('terminal-pane');
    if (!pane) return;
    if (window.Anim && Anim.reduced && Anim.reduced()) return; // tests etc.
    if (document.querySelector('#htop-overlay')) return;

    var rows = INITIAL_ROWS.slice();
    var sel = 0;
    var overlay = document.createElement('div');
    overlay.id = 'htop-overlay';
    pane.appendChild(overlay);

    function render() {
      var html = '<div class="htop-header">PID    USER       %CPU   %MEM  COMMAND</div>';
      for (var i = 0; i < rows.length; i++) {
        html += '<div class="htop-row' + (i === sel ? ' selected' : '') + '">' +
          renderRowText(rows[i]) + '</div>';
      }
      if (!rows.length) html += '<div class="htop-empty">nothing left to kill. press esc.</div>';
      html += '<div class="htop-footer"><span>↑/↓ select</span><span>k kill</span><span>esc exit</span></div>';
      overlay.innerHTML = html;
    }

    var killTimer = null;
    var spawnTimer = setInterval(function () {
      if (rows.length >= 12) return;
      var cmd = POOL[Math.floor(Math.random() * POOL.length)];
      rows.push({
        pid: Math.floor(2049 + Math.random() * 8000),
        user: Math.random() > 0.5 ? 'dave' : 'visitor',
        cpu: Math.random() * 30,
        mem: Math.random() * 10,
        cmd: cmd
      });
      render();
    }, 4000);

    function close() {
      if (spawnTimer) { clearInterval(spawnTimer); spawnTimer = null; }
      if (killTimer) { clearTimeout(killTimer); killTimer = null; }
      document.removeEventListener('keydown', onKey, true);
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    }

    function killAt(idx) {
      if (idx < 0 || idx >= rows.length) return;
      var victim = rows[idx];
      rows.splice(idx, 1);
      sel = Math.min(sel, rows.length - 1);
      if (sel < 0) sel = 0;
      render();
      if (window.Notify && Notify.push) {
        Notify.push({ title: 'killed pid ' + victim.pid, body: victim.cmd, ttlMs: 1500 });
      }
    }

    function onKey(e) {
      if (e.key === 'Escape') { e.preventDefault(); close(); return; }
      if (e.key === 'ArrowDown') { sel = Math.min(rows.length - 1, sel + 1); e.preventDefault(); render(); }
      else if (e.key === 'ArrowUp') { sel = Math.max(0, sel - 1); e.preventDefault(); render(); }
      else if (e.key === 'k' || e.key === 'K') {
        e.preventDefault();
        var pid = rows[sel] && rows[sel].pid;
        if (pid == null) return;
        var ok = false;
        try { ok = window.confirm('Kill process ' + pid + '?'); } catch (err) { ok = true; }
        if (ok) killAt(sel);
      }
    }
    document.addEventListener('keydown', onKey, true);
    render();
  });
})();

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
