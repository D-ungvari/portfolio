/**
 * Launcher — start menu / app launcher popout for DavOS v4.
 *
 * Opened by clicking taskbar OS label or Cmd/Ctrl+Space.
 * Search filters apps + projects + commands. Up/Down arrows navigate.
 * Enter launches selected. Esc / click-outside closes.
 */
(function () {
  'use strict';

  var popout = null;
  var inputEl = null;
  var resultsEl = null;
  var items = [];           // { kind, name, hint, action }
  var filtered = [];
  var selectedIdx = 0;

  function buildItems() {
    var arr = [];

    // Apps
    var apps = [
      { name: 'Settings', hint: 'system preferences', action: function () { window.SettingsApp && SettingsApp.open(); } },
      { name: 'Mail', hint: 'inbox', action: function () { window.MailApp && MailApp.open(); } },
      { name: 'CV', hint: 'curriculum vitae', action: function () { window.CVViewerApp && CVViewerApp.open(); } },
      { name: 'Apps', hint: 'project grid', action: function () { window.AppsGridApp && AppsGridApp.open(); } },
      { name: 'Boring view', hint: 'static cv', action: function () { window.BoringView && BoringView.toggle && BoringView.toggle(); } },
      { name: 'Files', hint: 'file explorer', action: function () { window.FilesApp && FilesApp.open(); } },
      { name: 'Terminal', hint: 'show terminal pane', action: function () {
        if (window.PaneToggle && PaneToggle.show) PaneToggle.show('terminal');
        var input = document.getElementById('command-input');
        if (input) input.focus();
      }}
    ];
    for (var i = 0; i < apps.length; i++) {
      arr.push({ kind: 'app', name: apps[i].name, hint: apps[i].hint, action: apps[i].action });
    }

    // Projects
    if (typeof projects !== 'undefined') {
      for (var j = 0; j < projects.length; j++) {
        (function (p) {
          arr.push({
            kind: 'project',
            name: p.title,
            hint: p.tagline || '',
            action: function () {
              if (window.Desktop && Desktop.launchProject) Desktop.launchProject(p);
              else if (window.WindowManager) WindowManager.open({ url: p.liveUrl, title: p.title, project: p.command });
            }
          });
        })(projects[j]);
      }
    }

    // Commands (subset — don't list every command, just useful ones)
    var cmds = [
      { name: '/help', hint: 'show all commands', cmd: '/help' },
      { name: '/about', hint: 'about Dave', cmd: '/about' },
      { name: '/contact', hint: 'reach out', cmd: '/contact' },
      { name: '/projects', hint: 'list projects', cmd: '/projects' },
      { name: '/skills', hint: 'tech stack', cmd: '/skills' },
      { name: '/resume', hint: 'cv text', cmd: '/resume' },
      { name: '/interview', hint: 'guided 60s tour', cmd: '/interview' },
      { name: '/availability', hint: 'comp & notice', cmd: '/availability' },
      { name: '/lock', hint: 'lock screen', cmd: '/lock' }
    ];
    for (var k = 0; k < cmds.length; k++) {
      (function (c) {
        arr.push({
          kind: 'command',
          name: c.name,
          hint: c.hint,
          action: function () {
            if (window._terminalRef && typeof executeCommand === 'function') {
              executeCommand(c.cmd, window._terminalRef);
              if (window.PaneToggle && PaneToggle.show) PaneToggle.show('terminal');
            }
          }
        });
      })(cmds[k]);
    }

    return arr;
  }

  function fuzzyMatch(query, name) {
    if (!query) return true;
    var q = query.toLowerCase();
    var n = name.toLowerCase();
    if (n.indexOf(q) !== -1) return true;
    // Subsequence fallback
    var qi = 0;
    for (var i = 0; i < n.length && qi < q.length; i++) {
      if (n.charAt(i) === q.charAt(qi)) qi++;
    }
    return qi === q.length;
  }

  function applyFilter() {
    var q = inputEl ? inputEl.value.trim() : '';
    filtered = [];
    for (var i = 0; i < items.length; i++) {
      if (fuzzyMatch(q, items[i].name) || fuzzyMatch(q, items[i].hint)) {
        filtered.push(items[i]);
      }
    }
    selectedIdx = 0;
    renderResults();
  }

  function renderResults() {
    if (!resultsEl) return;
    resultsEl.innerHTML = '';

    var groups = { app: [], project: [], command: [] };
    for (var i = 0; i < filtered.length; i++) groups[filtered[i].kind].push(filtered[i]);

    var order = ['app', 'project', 'command'];
    var labels = { app: 'APPS', project: 'PROJECTS', command: 'COMMANDS' };
    var globalIdx = 0;

    for (var g = 0; g < order.length; g++) {
      var grp = groups[order[g]];
      if (!grp.length) continue;
      var hdr = document.createElement('div');
      hdr.className = 'launcher-group-header';
      hdr.textContent = labels[order[g]];
      resultsEl.appendChild(hdr);
      for (var j = 0; j < grp.length; j++) {
        (function (item, idx) {
          var row = document.createElement('button');
          row.className = 'launcher-item' + (idx === selectedIdx ? ' selected' : '');
          row.type = 'button';
          row.setAttribute('data-idx', String(idx));
          row.innerHTML =
            '<span class="launcher-item-name">' + escapeHtml(item.name) + '</span>' +
            (item.hint ? '<span class="launcher-item-hint">' + escapeHtml(item.hint) + '</span>' : '');
          row.addEventListener('click', function () { runItem(item); });
          row.addEventListener('mouseenter', function () {
            selectedIdx = idx;
            highlightSelected();
          });
          resultsEl.appendChild(row);
        })(grp[j], globalIdx);
        globalIdx++;
      }
    }

    if (!filtered.length) {
      var empty = document.createElement('div');
      empty.className = 'launcher-empty';
      empty.textContent = 'no matches.';
      resultsEl.appendChild(empty);
    }
  }

  function highlightSelected() {
    if (!resultsEl) return;
    var rows = resultsEl.querySelectorAll('.launcher-item');
    for (var i = 0; i < rows.length; i++) {
      if (parseInt(rows[i].getAttribute('data-idx'), 10) === selectedIdx) {
        rows[i].classList.add('selected');
        rows[i].scrollIntoView({ block: 'nearest' });
      } else {
        rows[i].classList.remove('selected');
      }
    }
  }

  function runItem(item) {
    if (!item) return;
    close();
    try { item.action(); } catch (e) {}
  }

  function escapeHtml(s) {
    var d = document.createElement('div');
    d.textContent = s == null ? '' : s;
    return d.innerHTML;
  }

  function open() {
    if (popout) { close(); return; }
    items = buildItems();
    filtered = items.slice();
    selectedIdx = 0;

    popout = document.createElement('div');
    popout.className = 'launcher';
    popout.setAttribute('role', 'dialog');
    popout.setAttribute('aria-label', 'Launcher');
    popout.innerHTML =
      '<div class="launcher-header">' +
        '<input type="text" class="launcher-search" placeholder="search apps, projects, commands..." aria-label="Search" />' +
      '</div>' +
      '<div class="launcher-results" role="listbox"></div>' +
      '<div class="launcher-footer">' +
        '<button type="button" class="launcher-quick" data-action="about">About</button>' +
        '<button type="button" class="launcher-quick" data-action="sleep">Sleep</button>' +
        '<button type="button" class="launcher-quick" data-action="lock">Lock</button>' +
        '<button type="button" class="launcher-quick" data-action="restart">Restart</button>' +
      '</div>';
    document.body.appendChild(popout);

    inputEl = popout.querySelector('.launcher-search');
    resultsEl = popout.querySelector('.launcher-results');

    // Position: anchored to bottom-left of taskbar
    var os = document.getElementById('taskbar-os-label');
    if (os) {
      var r = os.getBoundingClientRect();
      popout.style.left = r.left + 'px';
      popout.style.top = (r.bottom + 4) + 'px';
    } else {
      popout.style.left = '8px';
      popout.style.top = '40px';
    }

    inputEl.addEventListener('input', applyFilter);
    inputEl.addEventListener('keydown', onKeydown);
    popout.querySelectorAll('.launcher-quick').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var action = btn.getAttribute('data-action');
        close();
        if (action === 'about' && window.Taskbar && Taskbar.showAbout) Taskbar.showAbout();
        else if (action === 'lock' && window.LockScreen && LockScreen.lock) LockScreen.lock();
        else if (action === 'sleep' && window.LockScreen && LockScreen.lock) LockScreen.lock();
        else if (action === 'restart' && window._terminalRef && typeof executeCommand === 'function') {
          executeCommand('/shutdown', window._terminalRef);
        }
      });
    });

    if (window.Anim) window.Anim.slideIn(popout, 'up', { dur: 180, distance: 12 });
    setTimeout(function () { inputEl && inputEl.focus(); }, 0);
    setTimeout(function () {
      document.addEventListener('mousedown', onOutside, true);
    }, 0);

    renderResults();
  }

  function close() {
    if (!popout) return;
    document.removeEventListener('mousedown', onOutside, true);
    var el = popout;
    popout = null;
    inputEl = null;
    resultsEl = null;
    if (window.Anim) {
      window.Anim.fadeOut(el, { dur: 120 }).then(function () {
        if (el && el.parentNode) el.parentNode.removeChild(el);
      });
    } else {
      if (el && el.parentNode) el.parentNode.removeChild(el);
    }
  }

  function toggle() { popout ? close() : open(); }

  function onOutside(e) {
    if (!popout) return;
    if (popout.contains(e.target)) return;
    var os = document.getElementById('taskbar-os-label');
    if (os && os.contains(e.target)) return;
    close();
  }

  function onKeydown(e) {
    if (e.key === 'Escape') { e.preventDefault(); close(); return; }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedIdx = Math.min(filtered.length - 1, selectedIdx + 1);
      highlightSelected();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedIdx = Math.max(0, selectedIdx - 1);
      highlightSelected();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      runItem(filtered[selectedIdx]);
    }
  }

  function init() {
    var os = document.getElementById('taskbar-os-label');
    if (os) {
      // Replace existing About-on-click with launcher
      var clone = os.cloneNode(true);
      os.parentNode.replaceChild(clone, os);
      clone.setAttribute('role', 'button');
      clone.setAttribute('tabindex', '0');
      clone.setAttribute('aria-label', 'Launcher');
      clone.addEventListener('click', function (e) {
        e.stopPropagation();
        toggle();
      });
      clone.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
      });
    }

    if (window.Shortcuts && Shortcuts.add) {
      window.Shortcuts.add({
        combo: 'Meta+Space',
        label: 'Open launcher',
        group: 'System',
        action: function () { toggle(); }
      });
      window.Shortcuts.add({
        combo: 'Ctrl+Space',
        label: 'Open launcher',
        group: 'System',
        action: function () { toggle(); }
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    // Defer to ensure taskbar.js init runs first
    setTimeout(init, 0);
  }

  window.Launcher = { open: open, close: close, toggle: toggle };
})();
