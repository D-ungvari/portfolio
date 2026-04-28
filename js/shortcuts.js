(function () {
  'use strict';
  var registry = [];

  function add(entry) {
    // entry: { combo, label, group, action(event), when?(ctx) }
    registry.push(entry);
  }

  function list(group) {
    if (!group) return registry.slice();
    return registry.filter(function (e) { return e.group === group; });
  }

  function matchCombo(event, combo) {
    var parts = combo.toLowerCase().split('+').map(function (s) { return s.trim(); });
    var key = parts[parts.length - 1];
    var needCtrl = parts.indexOf('ctrl') !== -1 || parts.indexOf('cmd') !== -1;
    var needShift = parts.indexOf('shift') !== -1;
    var needAlt = parts.indexOf('alt') !== -1;
    var needMeta = parts.indexOf('cmd') !== -1 || parts.indexOf('meta') !== -1;
    if (needCtrl && !(event.ctrlKey || event.metaKey)) return false;
    if (needShift !== !!event.shiftKey) return false;
    if (needAlt !== !!event.altKey) return false;
    if (!needCtrl && (event.ctrlKey || event.metaKey)) return false;
    var k = (event.key || '').toLowerCase();
    if (key === 'space') return k === ' ' || k === 'spacebar';
    if (key === 'esc') return k === 'escape';
    return k === key;
  }

  function onKeydown(e) {
    for (var i = 0; i < registry.length; i++) {
      var entry = registry[i];
      if (matchCombo(e, entry.combo)) {
        if (entry.when && !entry.when(e)) continue;
        try {
          var stop = entry.action(e);
          if (stop !== false) {
            e.preventDefault();
            e.stopPropagation();
          }
        } catch (err) {}
        return;
      }
    }
  }

  // Seed with v2 shortcuts (will be augmented by later phases).
  add({
    combo: 'Ctrl+`',
    label: 'Toggle terminal pane',
    group: 'Layout',
    action: function () {
      if (window.PaneToggle && typeof window.PaneToggle.toggleCollapsed === 'function') {
        window.PaneToggle.toggleCollapsed();
      }
    }
  });

  add({
    combo: 'F1',
    label: 'Show shortcuts cheatsheet',
    group: 'Help',
    action: function () {
      if (window.ShortcutsCheatsheet && typeof window.ShortcutsCheatsheet.show === 'function') {
        window.ShortcutsCheatsheet.show();
      }
    }
  });

  document.addEventListener('keydown', onKeydown, false);

  window.Shortcuts = { add: add, list: list, registry: registry };
})();
