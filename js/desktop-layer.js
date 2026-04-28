/**
 * Layer — z-index registry for DavOS v4.
 *
 * Centralizes layer ordering. CSS uses var(--layer-*) tokens injected at boot.
 * JS reads via Layer.WALLPAPER, Layer.WINDOWS, etc.
 */
(function () {
  'use strict';

  var Layer = {
    WALLPAPER: 0,
    WIDGETS: 100,
    ICONS: 200,
    WINDOWS: 1000,           // window-manager allocates 1000-1999 internally
    TASKBAR: 3000,
    POPOUTS: 4000,           // launcher, calendar, quick settings, tray popouts
    CONTEXT_MENU: 5000,
    NOTIFICATION: 6000,
    MODAL: 7000,
    LOCK_SCREEN: 9000,
    BSOD: 9500
  };

  function injectCssVars() {
    var root = document.documentElement;
    var keys = Object.keys(Layer);
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      root.style.setProperty('--layer-' + k.toLowerCase().replace(/_/g, '-'), String(Layer[k]));
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectCssVars);
  } else {
    injectCssVars();
  }

  window.Layer = Layer;
})();
