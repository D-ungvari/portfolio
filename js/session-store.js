(function () {
  'use strict';
  var KEY = 'daveos:session:v1';
  var DEFAULTS = {
    theme: 'green',
    terminalWidthPx: null,
    terminalCollapsed: false,
    activePane: 'desktop',
    windows: [],
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
    return state;
  }

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  function mergeDefaults(parsed) {
    var out = clone(DEFAULTS);
    // Preserve all parsed keys, not just defaults — apps register their own keys
    // (settings, fs cwd, terminal tabs, etc.).
    for (var k in parsed) {
      if (Object.prototype.hasOwnProperty.call(parsed, k)) {
        out[k] = parsed[k];
      }
    }
    return out;
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
