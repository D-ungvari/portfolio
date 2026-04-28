/**
 * GameOverlay — legacy API kept for backward compatibility.
 *
 * Phase B2 of DavOS v3 replaces the fullscreen iframe overlay with the
 * WindowManager. This module is now a thin delegating shim so existing
 * callers in projects.js / desktop.js / os-commands.js / idle.js continue
 * to work without modification.
 *
 * Public API (unchanged):
 *   GameOverlay.open(url, title, terminal)
 *   GameOverlay.close()
 *   GameOverlay.isOpen()
 */
var GameOverlay = (function () {
  'use strict';

  function open(url, title, terminal) {
    if (typeof window === 'undefined') return null;
    if (window.WindowManager && typeof window.WindowManager.open === 'function') {
      var maxW = Math.min(1200, window.innerWidth - 80);
      var maxH = Math.min(800, window.innerHeight - 80 - 32);
      var id = window.WindowManager.open({
        url: url,
        title: title || 'PROJECT',
        project: title || null,
        w: maxW > 320 ? maxW : 320,
        h: maxH > 200 ? maxH : 200
      });
      // Blur terminal input so iframe-inside-window can take focus
      if (terminal && terminal.inputEl && typeof terminal.inputEl.blur === 'function') {
        terminal.inputEl.blur();
      }
      return id;
    }
    // Fallback: open in a new tab if WindowManager isn't available.
    if (window.open) {
      window.open(url, '_blank', 'noopener');
    }
    return null;
  }

  function close() {
    if (typeof window === 'undefined') return;
    if (window.WindowManager && typeof window.WindowManager.list === 'function') {
      var list = window.WindowManager.list();
      for (var i = 0; i < list.length; i++) {
        if (list[i] && list[i].url) {
          window.WindowManager.close(list[i].id);
        }
      }
    }
  }

  function isOpen() {
    if (typeof window === 'undefined') return false;
    if (window.WindowManager && typeof window.WindowManager.list === 'function') {
      var list = window.WindowManager.list();
      for (var i = 0; i < list.length; i++) {
        if (list[i] && list[i].url) return true;
      }
    }
    return false;
  }

  return {
    open: open,
    close: close,
    isOpen: isOpen
  };
})();
