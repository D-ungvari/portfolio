(function () {
  'use strict';
  var KEY = 'daveos:session:v1';
  var WORKSPACE_COUNT = 5;
  var migratedState = false;
  var DEFAULTS = {
    schemaVersion: 2,
    theme: 'catppuccin',
    terminalWidthPx: null,
    terminalCollapsed: false,
    activePane: 'desktop',
    windows: [],
    workspaces: defaultWorkspaces(),
    terminalHistory: [],
    visitCount: 0,
    lastVisit: null,
    shortcutsCheatsheetSeen: false,
    notificationLog: []
  };

  var state = null;
  var writeTimer = null;

  function load() {
    if (state) return state;
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        state = mergeDefaults(parsed);
      } else {
        state = clone(DEFAULTS);
      }
    } catch (e) {
      state = clone(DEFAULTS);
    }
    if (migratedState) scheduleWrite();
    return state;
  }

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  function defaultWorkspaces() {
    var map = {};
    for (var i = 1; i <= WORKSPACE_COUNT; i++) {
      map[String(i)] = { windowIds: [], tiling: false };
    }
    return { version: 1, current: 1, map: map };
  }

  function mergeDefaults(parsed) {
    var out = clone(DEFAULTS);
    migratedState = false;
    // Preserve all parsed keys, not just defaults — apps register their own keys
    // (settings, fs cwd, terminal tabs, etc.).
    for (var k in parsed) {
      if (Object.prototype.hasOwnProperty.call(parsed, k)) {
        out[k] = parsed[k];
      }
    }
    migrateWorkspaces(out);
    if (Object.prototype.hasOwnProperty.call(out, 'pinnedApps')) {
      delete out.pinnedApps;
      migratedState = true;
    }
    return out;
  }

  function migrateWorkspaces(out) {
    out.schemaVersion = 2;
    var windows = Array.isArray(out.windows) ? out.windows : [];
    for (var i = 0; i < windows.length; i++) {
      if (windows[i] && windows[i].workspaceId == null) {
        windows[i].workspaceId = 1;
        migratedState = true;
      }
    }

    if (!out.workspaces || typeof out.workspaces !== 'object' || !out.workspaces.map) {
      out.workspaces = defaultWorkspaces();
      migratedState = true;
    }

    var normalized = defaultWorkspaces();
    normalized.current = normalizeWorkspaceId(out.workspaces.current || 1);
    for (var n = 1; n <= WORKSPACE_COUNT; n++) {
      var key = String(n);
      var src = out.workspaces.map && out.workspaces.map[key];
      if (src && Array.isArray(src.windowIds)) {
        normalized.map[key].windowIds = src.windowIds.slice();
      }
      normalized.map[key].tiling = !!(src && src.tiling);
    }

    for (var w = 0; w < windows.length; w++) {
      var win = windows[w];
      if (!win || !win.id) continue;
      var ws = String(normalizeWorkspaceId(win.workspaceId || 1));
      if (normalized.map[ws].windowIds.indexOf(win.id) === -1) {
        normalized.map[ws].windowIds.push(win.id);
        migratedState = true;
      }
    }
    out.workspaces = normalized;
  }

  function normalizeWorkspaceId(id) {
    var n = parseInt(id, 10);
    if (!isFinite(n) || n < 1) return 1;
    if (n > WORKSPACE_COUNT) return WORKSPACE_COUNT;
    return n;
  }

  function get(key) {
    if (!state) load();
    if (key === undefined) return state;
    return state[key];
  }

  function set(key, value) {
    if (!state) load();
    state[key] = value;
    scheduleWrite();
  }

  function patch(partial) {
    if (!state) load();
    for (var k in partial) {
      if (Object.prototype.hasOwnProperty.call(partial, k)) {
        state[k] = partial[k];
      }
    }
    scheduleWrite();
  }

  function scheduleWrite() {
    if (writeTimer) clearTimeout(writeTimer);
    writeTimer = setTimeout(flush, 200);
  }

  function flush() {
    writeTimer = null;
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch (e) {}
  }

  function bumpVisit() {
    if (!state) load();
    var now = new Date().toISOString();
    var prev = state.lastVisit;
    state.visitCount = (state.visitCount || 0) + 1;
    state.lastVisit = now;
    scheduleWrite();
    return { previousVisit: prev, count: state.visitCount };
  }

  window.Session = {
    load: load,
    get: get,
    set: set,
    patch: patch,
    flush: flush,
    bumpVisit: bumpVisit,
    KEY: KEY
  };

  // Eager load on script eval — synchronous localStorage read.
  load();
})();
