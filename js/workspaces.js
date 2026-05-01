/**
 * Workspaces - 5-workspace i3-style state and opt-in tiling.
 */
(function () {
  'use strict';

  var WORKSPACE_COUNT = 5;
  var current = 1;
  var map = {};
  var observers = [];
  var shortcutsRegistered = false;

  function normalizeId(id) {
    var n = parseInt(id, 10);
    if (!isFinite(n) || n < 1) return 1;
    if (n > WORKSPACE_COUNT) return WORKSPACE_COUNT;
    return n;
  }

  function ensureMap() {
    for (var i = 1; i <= WORKSPACE_COUNT; i++) {
      var key = String(i);
      if (!map[key]) map[key] = { windowIds: [], tiling: false };
      if (!Array.isArray(map[key].windowIds)) map[key].windowIds = [];
      map[key].tiling = !!map[key].tiling;
    }
  }

  function cloneMap() {
    ensureMap();
    var out = {};
    for (var i = 1; i <= WORKSPACE_COUNT; i++) {
      var key = String(i);
      out[key] = {
        windowIds: map[key].windowIds.slice(),
        tiling: !!map[key].tiling
      };
    }
    return out;
  }

  function snapshot() {
    return {
      current: current,
      count: WORKSPACE_COUNT,
      map: cloneMap()
    };
  }

  function notify() {
    api.current = current;
    var data = snapshot();
    for (var i = 0; i < observers.length; i++) {
      try { observers[i](data); } catch (e) {}
    }
  }

  function persist() {
    if (!window.Session || typeof window.Session.patch !== 'function') return;
    try {
      window.Session.patch({
        workspaces: {
          version: 1,
          current: current,
          map: cloneMap()
        }
      });
    } catch (e) {}
  }

  function load() {
    map = {};
    current = 1;
    if (window.Session && typeof window.Session.get === 'function') {
      var saved = window.Session.get('workspaces');
      if (saved && saved.map) {
        current = normalizeId(saved.current || 1);
        for (var i = 1; i <= WORKSPACE_COUNT; i++) {
          var key = String(i);
          var src = saved.map[key];
          map[key] = {
            windowIds: src && Array.isArray(src.windowIds) ? src.windowIds.slice() : [],
            tiling: !!(src && src.tiling)
          };
        }
      } else {
        var windows = window.Session.get('windows');
        if (Array.isArray(windows)) {
          for (var w = 0; w < windows.length; w++) {
            if (!windows[w] || !windows[w].id) continue;
            var ws = String(normalizeId(windows[w].workspaceId || 1));
            if (!map[ws]) map[ws] = { windowIds: [], tiling: false };
            map[ws].windowIds.push(windows[w].id);
          }
        }
      }
    }
    ensureMap();
  }

  function removeFromAll(windowId) {
    ensureMap();
    for (var i = 1; i <= WORKSPACE_COUNT; i++) {
      var ids = map[String(i)].windowIds;
      var idx = ids.indexOf(windowId);
      if (idx !== -1) ids.splice(idx, 1);
    }
  }

  function liveIds(workspaceId) {
    ensureMap();
    var ids = map[String(normalizeId(workspaceId))].windowIds;
    if (!window.WindowManager || typeof window.WindowManager.get !== 'function') return ids.slice();
    var out = [];
    for (var i = 0; i < ids.length; i++) {
      if (window.WindowManager.get(ids[i])) out.push(ids[i]);
    }
    map[String(normalizeId(workspaceId))].windowIds = out.slice();
    return out;
  }

  function addWindow(windowId, workspaceId) {
    var ws = normalizeId(workspaceId || current);
    if (window.WindowManager && typeof window.WindowManager.get === 'function') {
      var state = window.WindowManager.get(windowId);
      if (state && state.workspaceId != null) ws = normalizeId(state.workspaceId);
    }
    removeFromAll(windowId);
    map[String(ws)].windowIds.push(windowId);
    if (window.WindowManager && typeof window.WindowManager.setWorkspace === 'function') {
      window.WindowManager.setWorkspace(windowId, ws);
    }
    if (window.WindowManager && typeof window.WindowManager.showWorkspace === 'function') {
      window.WindowManager.showWorkspace(current);
    }
    if (map[String(ws)].tiling) applyTilingLayout(ws);
    persist();
    notify();
    return ws;
  }

  function removeWindow(windowId) {
    var affected = current;
    for (var i = 1; i <= WORKSPACE_COUNT; i++) {
      if (map[String(i)] && map[String(i)].windowIds.indexOf(windowId) !== -1) affected = i;
    }
    removeFromAll(windowId);
    if (map[String(affected)] && map[String(affected)].tiling) applyTilingLayout(affected);
    persist();
    notify();
  }

  function switchTo(id) {
    var target = normalizeId(id);
    current = target;
    if (window.WindowManager && typeof window.WindowManager.showWorkspace === 'function') {
      window.WindowManager.showWorkspace(current);
    }
    if (map[String(current)] && map[String(current)].tiling) applyTilingLayout(current);
    persist();
    notify();
    return current;
  }

  function cssPx(name, fallback) {
    try {
      var raw = getComputedStyle(document.documentElement).getPropertyValue(name);
      var n = parseInt((raw || '').trim(), 10);
      return isFinite(n) ? n : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function tilableWindows(workspaceId) {
    var ids = liveIds(workspaceId);
    var out = [];
    if (!window.WindowManager || typeof window.WindowManager.get !== 'function') return out;
    for (var i = 0; i < ids.length; i++) {
      var state = window.WindowManager.get(ids[i]);
      if (state && !state.minimized && !state.floating) out.push(state);
    }
    return out;
  }

  function moveWindow(state, rect) {
    if (!state || !window.WindowManager || typeof window.WindowManager.move !== 'function') return;
    window.WindowManager.move(state.id, rect.x, rect.y, rect.w, rect.h);
  }

  function applyTilingLayout(workspaceId) {
    var ws = normalizeId(workspaceId || current);
    var wins = tilableWindows(ws);
    if (!wins.length) return;
    var gap = cssPx('--window-gap', 12);
    var taskbar = cssPx('--taskbar-height', 32);
    var vw = window.innerWidth || 1280;
    var vh = (window.innerHeight || 800) - taskbar;
    var x = gap;
    var y = gap;
    var w = Math.max(320, vw - gap * 2);
    var h = Math.max(200, vh - gap * 2);

    if (wins.length === 1) {
      moveWindow(wins[0], { x: x, y: y, w: w, h: h });
      return;
    }

    var totalW = Math.max(640, vw - gap * 3);
    var leftW = Math.floor(totalW / 2);
    var rightW = totalW - leftW;
    moveWindow(wins[0], { x: gap, y: gap, w: leftW, h: h });

    if (wins.length === 2) {
      moveWindow(wins[1], { x: gap + leftW + gap, y: gap, w: rightW, h: h });
      return;
    }

    var stackCount = wins.length - 1;
    var stackH = Math.floor((h - gap * (stackCount - 1)) / stackCount);
    var rightX = gap + leftW + gap;
    for (var i = 1; i < wins.length; i++) {
      var stackY = gap + (i - 1) * (stackH + gap);
      var rectH = (i === wins.length - 1) ? (gap + h - stackY) : stackH;
      moveWindow(wins[i], { x: rightX, y: stackY, w: rightW, h: rectH });
    }
  }

  function toggleTiling(workspaceId) {
    var ws = normalizeId(workspaceId || current);
    ensureMap();
    map[String(ws)].tiling = !map[String(ws)].tiling;
    if (map[String(ws)].tiling) applyTilingLayout(ws);
    persist();
    notify();
    return map[String(ws)].tiling;
  }

  function onChange(cb) {
    if (typeof cb !== 'function') return function () {};
    observers.push(cb);
    try { cb(snapshot()); } catch (e) {}
    return function () {
      var idx = observers.indexOf(cb);
      if (idx !== -1) observers.splice(idx, 1);
    };
  }

  function registerShortcuts() {
    if (shortcutsRegistered || !window.Shortcuts) return;
    var reg = window.Shortcuts.register || function (combo, label, group, action) {
      window.Shortcuts.add({ combo: combo, label: label, group: group, action: action });
    };
    for (var i = 1; i <= WORKSPACE_COUNT; i++) {
      (function (n) {
        reg('Meta+' + n, 'Switch to workspace ' + n, 'Workspaces', function () { switchTo(n); });
        reg('Ctrl+Alt+' + n, 'Switch to workspace ' + n, 'Workspaces', function () { switchTo(n); });
      })(i);
    }
    reg('Meta+T', 'Toggle tiling on current workspace', 'Workspaces', function () { toggleTiling(current); });
    shortcutsRegistered = true;
  }

  function init() {
    load();
    registerShortcuts();
    if (window.WindowManager && typeof window.WindowManager.showWorkspace === 'function') {
      window.WindowManager.showWorkspace(current);
    }
    window.addEventListener('resize', function () {
      if (map[String(current)] && map[String(current)].tiling) applyTilingLayout(current);
    });
    persist();
    notify();
  }

  var api = {
    current: current,
    count: WORKSPACE_COUNT,
    init: init,
    currentId: function () { return current; },
    snapshot: snapshot,
    switchTo: switchTo,
    addWindow: addWindow,
    removeWindow: removeWindow,
    toggleTiling: toggleTiling,
    applyTilingLayout: applyTilingLayout,
    onChange: onChange
  };

  window.Workspaces = api;
  init();
})();
