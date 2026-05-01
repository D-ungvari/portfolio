(function () {
  'use strict';
  var overlay = null;
  var input = null;
  var listEl = null;
  var items = [];   // current filtered candidates with {label, hint, action}
  var allCandidates = [];  // built once per open
  var selectedIndex = 0;

  function buildCandidates() {
    var c = [];
    // 1. All registered commands (visible + hidden alike)
    if (typeof commandRegistry !== 'undefined') {
      for (var name in commandRegistry) {
        (function (cmdName, entry) {
          c.push({
            label: cmdName,
            hint: entry.description || '',
            kind: 'command',
            action: function () {
              if (window._terminalRef && typeof executeCommand === 'function') {
                executeCommand(cmdName, window._terminalRef);
              }
            }
          });
        })(name, commandRegistry[name]);
      }
    }
    // 2. Each project as quick-launch ("Launch swarm", "Launch uxcrimes", ...)
    if (typeof projects !== 'undefined') {
      for (var i = 0; i < projects.length; i++) {
        (function (p) {
          c.push({
            label: 'Launch ' + p.title,
            hint: p.tagline || '',
            kind: 'launch',
            action: function () {
              if (window.Desktop && Desktop.launchProject) Desktop.launchProject(p);
              else if (typeof GameOverlay !== 'undefined') GameOverlay.open(p.liveUrl, p.title, window._terminalRef);
            }
          });
        })(projects[i]);
      }
    }
    // 3. Theme switches
    if (typeof themes !== 'undefined') {
      for (var name in themes) {
        (function (theme) {
          c.push({
            label: 'Theme: ' + theme,
            hint: 'switch color theme',
            kind: 'theme',
            action: function () { if (typeof applyTheme === 'function') applyTheme(theme); }
          });
        })(name);
      }
    }
    // 4. Synthetic actions
    c.push({
      label: 'Run neofetch',
      hint: 'show profile',
      kind: 'action',
      action: function () { if (window._terminalRef && typeof executeCommand === 'function') executeCommand('/about', window._terminalRef); }
    });
    c.push({
      label: 'Toggle terminal pane',
      hint: 'collapse / expand right pane',
      kind: 'action',
      action: function () { if (window.PaneToggle && PaneToggle.toggleCollapsed) PaneToggle.toggleCollapsed(); }
    });
    c.push({
      label: 'Show shortcuts',
      hint: 'F1 cheatsheet',
      kind: 'action',
      action: function () { if (window.ShortcutsCheatsheet && ShortcutsCheatsheet.show) ShortcutsCheatsheet.show(); }
    });
    return c;
  }

  function fuzzyScore(str, query) {
    // Returns a score >=0, higher better. -1 means no match.
    str = str.toLowerCase();
    query = query.toLowerCase();
    if (!query) return 0;
    if (str === query) return 1000;
    if (str.indexOf(query) === 0) return 500 - str.length;
    if (str.indexOf(query) !== -1) return 300 - str.length;
    // Fuzzy subsequence
    var qi = 0;
    var lastMatchIdx = -1;
    var consecutiveBoost = 0;
    var score = 0;
    for (var i = 0; i < str.length && qi < query.length; i++) {
      if (str.charAt(i) === query.charAt(qi)) {
        if (lastMatchIdx === i - 1) consecutiveBoost += 5;
        else consecutiveBoost = 0;
        score += 1 + consecutiveBoost;
        lastMatchIdx = i;
        qi++;
      }
    }
    if (qi !== query.length) return -1;
    return score - str.length * 0.1;
  }

  function filter(query) {
    var q = (query || '').trim();
    if (!q) {
      items = allCandidates.slice(0, 30);
      return;
    }
    var scored = [];
    for (var i = 0; i < allCandidates.length; i++) {
      var c = allCandidates[i];
      var s = Math.max(fuzzyScore(c.label, q), fuzzyScore(c.hint, q) - 50);
      if (s >= 0) scored.push({ c: c, s: s });
    }
    scored.sort(function (a, b) { return b.s - a.s; });
    items = scored.slice(0, 30).map(function (x) { return x.c; });
  }

  function render() {
    if (!listEl) return;
    listEl.innerHTML = '';
    if (items.length === 0) {
      var empty = document.createElement('div');
      empty.className = 'palette-empty';
      empty.textContent = 'no matches.';
      listEl.appendChild(empty);
      return;
    }
    for (var i = 0; i < items.length; i++) {
      (function (idx, item) {
        var row = document.createElement('div');
        row.className = 'palette-item' + (idx === selectedIndex ? ' selected' : '');
        row.setAttribute('role', 'option');
        var label = document.createElement('span');
        label.className = 'palette-label';
        label.textContent = item.label;
        var hint = document.createElement('span');
        hint.className = 'palette-hint';
        hint.textContent = item.hint;
        row.appendChild(label);
        row.appendChild(hint);
        row.addEventListener('mouseenter', function () {
          selectedIndex = idx;
          updateSelection();
        });
        row.addEventListener('click', function () {
          execute(idx);
        });
        listEl.appendChild(row);
      })(i, items[i]);
    }
  }

  function updateSelection() {
    var rows = listEl.querySelectorAll('.palette-item');
    for (var i = 0; i < rows.length; i++) {
      rows[i].classList.toggle('selected', i === selectedIndex);
    }
    var selected = rows[selectedIndex];
    if (selected) selected.scrollIntoView({ block: 'nearest' });
  }

  function execute(idx) {
    var item = items[idx];
    if (!item) return;
    close();
    try { item.action(); } catch (e) {}
  }

  function open() {
    if (overlay) return;
    allCandidates = buildCandidates();
    selectedIndex = 0;
    overlay = document.createElement('div');
    overlay.id = 'palette-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-label', 'Command palette');
    var box = document.createElement('div');
    box.id = 'palette-box';
    input = document.createElement('input');
    input.id = 'palette-input';
    input.type = 'text';
    input.setAttribute('autocomplete', 'off');
    input.setAttribute('spellcheck', 'false');
    input.setAttribute('placeholder', 'search commands, projects, themes…');
    listEl = document.createElement('div');
    listEl.id = 'palette-list';
    listEl.setAttribute('role', 'listbox');
    box.appendChild(input);
    box.appendChild(listEl);
    overlay.appendChild(box);
    document.body.appendChild(overlay);

    input.addEventListener('input', function () {
      filter(input.value);
      selectedIndex = 0;
      render();
    });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        selectedIndex = Math.min(items.length - 1, selectedIndex + 1);
        updateSelection();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        selectedIndex = Math.max(0, selectedIndex - 1);
        updateSelection();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        execute(selectedIndex);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        close();
      }
    });
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) close();
    });

    filter('');
    render();
    setTimeout(function () { input.focus(); }, 0);
  }

  function close() {
    if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
    overlay = null;
    input = null;
    listEl = null;
    items = [];
  }

  function isOpen() { return overlay != null; }

  window.Palette = { open: open, close: close, isOpen: isOpen };

  // Register shortcut after DOM ready, when Shortcuts is guaranteed loaded.
  function registerShortcuts() {
    if (window.Shortcuts && Shortcuts.add) {
      Shortcuts.add({
        combo: 'Ctrl+K',
        label: 'Open command palette',
        group: 'Discovery',
        action: function () {
          if (isOpen()) close();
          else open();
        }
      });
    }
  }
  if (document.readyState !== 'loading') registerShortcuts();
  else document.addEventListener('DOMContentLoaded', registerShortcuts);
})();
