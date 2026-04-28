(function () {
  'use strict';
  var loaded = null;
  var loadPromise = null;

  function tryFetch() {
    if (typeof fetch !== 'function') return Promise.reject('no fetch');
    return fetch('data/persona.json')
      .then(function (r) { if (!r.ok) throw new Error('http ' + r.status); return r.json(); });
  }

  function load() {
    if (loaded) return Promise.resolve(loaded);
    if (loadPromise) return loadPromise;
    loadPromise = tryFetch()
      .catch(function () {
        if (window.__PERSONA_FALLBACK) return window.__PERSONA_FALLBACK;
        throw new Error('persona unavailable');
      })
      .then(function (data) { loaded = data; return data; });
    return loadPromise;
  }

  function get() { return loaded; }  // sync access after load resolves

  window.Persona = { load: load, get: get };
})();
