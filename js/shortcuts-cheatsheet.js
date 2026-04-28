(function () {
  'use strict';
  var overlay = null;

  function open() {
    if (overlay) return;
    overlay = document.createElement('div');
    overlay.id = 'cheatsheet-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-label', 'Keyboard shortcuts');
    var box = document.createElement('div');
    box.id = 'cheatsheet-box';

    var header = document.createElement('div');
    header.id = 'cheatsheet-header';
    header.innerHTML = '<h2>KEYBOARD SHORTCUTS</h2>' +
      '<button id="cheatsheet-close" aria-label="Close" type="button">×</button>';
    box.appendChild(header);

    var content = document.createElement('div');
    content.id = 'cheatsheet-content';

    var registry = (window.Shortcuts && Shortcuts.registry) ? Shortcuts.registry : [];
    // Group entries
    var groups = {};
    for (var i = 0; i < registry.length; i++) {
      var entry = registry[i];
      var g = entry.group || 'Other';
      if (!groups[g]) groups[g] = [];
      groups[g].push(entry);
    }
    // Add some baseline entries that aren't in the registry yet (terminal arrows, tab complete, etc.)
    var baseline = {
      'Terminal': [
        { combo: 'ArrowUp / ArrowDown', label: 'Cycle command history' },
        { combo: 'Tab', label: 'Complete command' },
        { combo: 'Ctrl+L', label: 'Clear terminal' }
      ],
      'Desktop': [
        { combo: 'ArrowKeys', label: 'Navigate icons' },
        { combo: 'Enter / Space', label: 'Launch selected icon' },
        { combo: 'Right-click icon', label: 'Open context menu' }
      ]
    };
    for (var k in baseline) {
      if (!groups[k]) groups[k] = [];
      groups[k] = groups[k].concat(baseline[k]);
    }

    var groupOrder = ['Discovery', 'Layout', 'Windows', 'Terminal', 'Desktop', 'Help', 'Other'];
    var seenGroups = Object.keys(groups);
    var ordered = groupOrder.filter(function (g) { return seenGroups.indexOf(g) !== -1; })
      .concat(seenGroups.filter(function (g) { return groupOrder.indexOf(g) === -1; }));

    for (var ix = 0; ix < ordered.length; ix++) {
      var groupName = ordered[ix];
      var section = document.createElement('div');
      section.className = 'cheatsheet-group';
      var h = document.createElement('h3');
      h.textContent = groupName.toUpperCase();
      section.appendChild(h);
      var list = document.createElement('div');
      list.className = 'cheatsheet-list';
      for (var j = 0; j < groups[groupName].length; j++) {
        var e = groups[groupName][j];
        var row = document.createElement('div');
        row.className = 'cheatsheet-row';
        var key = document.createElement('kbd');
        key.textContent = e.combo;
        var lbl = document.createElement('span');
        lbl.className = 'cheatsheet-label';
        lbl.textContent = e.label;
        row.appendChild(key);
        row.appendChild(lbl);
        list.appendChild(row);
      }
      section.appendChild(list);
      content.appendChild(section);
    }
    box.appendChild(content);

    overlay.appendChild(box);
    document.body.appendChild(overlay);

    overlay.querySelector('#cheatsheet-close').addEventListener('click', close);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
    document.addEventListener('keydown', onKey, true);

    if (window.Session && Session.set) Session.set('shortcutsCheatsheetSeen', true);
  }
  function onKey(e) { if (e.key === 'Escape') close(); }
  function close() {
    if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
    overlay = null;
    document.removeEventListener('keydown', onKey, true);
  }
  function isOpen() { return overlay != null; }

  window.ShortcutsCheatsheet = { show: open, close: close, isOpen: isOpen };
})();
