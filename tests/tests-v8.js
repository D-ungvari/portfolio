/**
 * v8 Feature tests — Game overlay, idle matrix, integration.
 *
 * NOTE (DavOS v3): GameOverlay is now a thin shim that delegates to
 * WindowManager. The legacy DOM ids (#game-overlay, #game-iframe, etc.)
 * are gone — overlays are real WindowManager windows (.os-window inside
 * #window-layer). These tests assert on the new DOM.
 */

var T = TestHarness;

// Helper: query the most recently opened window (post-shim)
function _latestOsWindow() {
  var wins = document.querySelectorAll('#window-layer .os-window');
  return wins.length ? wins[wins.length - 1] : null;
}

// Helper: nuke any leftover .os-window elements between tests so prior
// state doesn't pollute later assertions.
function _cleanupAllWindows() {
  if (typeof WindowManager !== 'undefined' && WindowManager.list) {
    var list = WindowManager.list().slice();
    for (var i = 0; i < list.length; i++) {
      try { WindowManager.close(list[i].id); } catch (e) {}
    }
  }
  var stragglers = document.querySelectorAll('#window-layer .os-window');
  for (var j = 0; j < stragglers.length; j++) {
    if (stragglers[j].parentNode) stragglers[j].parentNode.removeChild(stragglers[j]);
  }
}

// ========================================
// GAME OVERLAY TESTS
// ========================================

T.describe('GameOverlay — API', function() {
  // Ensure clean state before these tests
  _cleanupAllWindows();

  T.it('GameOverlay is defined', function() {
    T.assertType(GameOverlay, 'object');
  });

  T.it('GameOverlay.open is a function', function() {
    T.assertType(GameOverlay.open, 'function');
  });

  T.it('GameOverlay.close is a function', function() {
    T.assertType(GameOverlay.close, 'function');
  });

  T.it('GameOverlay.isOpen is a function', function() {
    T.assertType(GameOverlay.isOpen, 'function');
  });

  T.it('GameOverlay is closed after cleanup', function() {
    _cleanupAllWindows();
    T.assertFalse(GameOverlay.isOpen());
  });
});

T.describe('GameOverlay — Open/Close', function() {
  T.it('open creates the overlay DOM', function() {
    _cleanupAllWindows();
    var mock = T.createMockTerminal();
    mock.inputEl = { blur: function() {}, focus: function() {} };
    GameOverlay.open('https://example.com', 'TEST', mock);
    var overlay = _latestOsWindow();
    T.assertNotNull(overlay, 'Overlay should be in DOM');
    T.assertTrue(GameOverlay.isOpen());
    _cleanupAllWindows();
  });

  T.it('open sets active class', function() {
    _cleanupAllWindows();
    var mock = T.createMockTerminal();
    mock.inputEl = { blur: function() {}, focus: function() {} };
    GameOverlay.open('https://example.com', 'TEST', mock);
    var overlay = _latestOsWindow();
    T.assertNotNull(overlay);
    T.assertContains(overlay.className, 'active');
    _cleanupAllWindows();
  });

  T.it('overlay has correct z-index', function() {
    _cleanupAllWindows();
    var mock = T.createMockTerminal();
    mock.inputEl = { blur: function() {}, focus: function() {} };
    GameOverlay.open('https://example.com', 'TEST', mock);
    var overlay = _latestOsWindow();
    T.assertNotNull(overlay);
    // WindowManager assigns z-index dynamically; verify it's a positive number.
    var z = parseInt(overlay.style.zIndex || '0', 10);
    T.assert(z > 0, 'window should have a positive z-index (got ' + z + ')');
    _cleanupAllWindows();
  });

  T.it('overlay has a close button', function() {
    _cleanupAllWindows();
    var mock = T.createMockTerminal();
    mock.inputEl = { blur: function() {}, focus: function() {} };
    GameOverlay.open('https://example.com', 'TEST', mock);
    var overlay = _latestOsWindow();
    T.assertNotNull(overlay);
    var closeBtn = overlay.querySelector('.window-close');
    T.assertNotNull(closeBtn);
    _cleanupAllWindows();
  });

  T.it('overlay has an iframe', function() {
    _cleanupAllWindows();
    var mock = T.createMockTerminal();
    mock.inputEl = { blur: function() {}, focus: function() {} };
    GameOverlay.open('https://example.com', 'TEST', mock);
    var overlay = _latestOsWindow();
    T.assertNotNull(overlay);
    var iframe = overlay.querySelector('.os-window-iframe');
    T.assertNotNull(iframe);
    _cleanupAllWindows();
  });

  T.it('overlay shows loading text', function() {
    _cleanupAllWindows();
    var mock = T.createMockTerminal();
    mock.inputEl = { blur: function() {}, focus: function() {} };
    GameOverlay.open('https://example.com', 'MY GAME', mock);
    var overlay = _latestOsWindow();
    T.assertNotNull(overlay);
    var loading = overlay.querySelector('.os-window-loading');
    T.assertNotNull(loading);
    T.assertContains(loading.textContent, 'loading');
    _cleanupAllWindows();
  });

  T.it('overlay title shows project name', function() {
    _cleanupAllWindows();
    var mock = T.createMockTerminal();
    mock.inputEl = { blur: function() {}, focus: function() {} };
    GameOverlay.open('https://example.com', 'UXCRIMES', mock);
    var overlay = _latestOsWindow();
    T.assertNotNull(overlay);
    var title = overlay.querySelector('.os-window-title');
    T.assertNotNull(title);
    T.assertContains(title.textContent, 'UXCRIMES');
    _cleanupAllWindows();
  });

  T.it('close sets isOpen to false', function() {
    _cleanupAllWindows();
    var mock = T.createMockTerminal();
    mock.inputEl = { blur: function() {}, focus: function() {} };
    GameOverlay.open('https://example.com', 'TEST', mock);
    GameOverlay.close();
    T.assertFalse(GameOverlay.isOpen());
  });
});

T.describe('GameOverlay — /play Integration', function() {
  // The /play handler captured the original GameOverlay.open at registration
  // time, so spying on the namespaced reference doesn't catch it. Instead we
  // spy on WindowManager.open (the underlying call) — which the shim ALWAYS
  // invokes. That gives us a deterministic assertion.
  function spyWM() {
    var calls = [];
    var orig = WindowManager.open;
    WindowManager.open = function(opts) {
      calls.push(opts || {});
      return orig.call(WindowManager, opts);
    };
    return {
      calls: calls,
      restore: function() { WindowManager.open = orig; }
    };
  }

  T.it('/play uxcrimes uses GameOverlay instead of window.open', function() {
    _cleanupAllWindows();
    var spy = spyWM();
    try {
      var mock = T.createMockTerminal();
      mock.inputEl = { blur: function() {}, focus: function() {} };
      commandRegistry['/play uxcrimes'].handler(mock);
      T.assertContains(mock.getAllText(), 'opening');
      T.assert(spy.calls.length >= 1, 'WindowManager.open should be called via GameOverlay shim');
      var first = spy.calls[0];
      T.assertContains((first.url || '').toLowerCase(), 'uxcrimes');
      T.assertContains(first.title || '', 'UXCRIMES');
    } finally {
      spy.restore();
      _cleanupAllWindows();
    }
  });

  T.it('/play horde uses GameOverlay', function() {
    _cleanupAllWindows();
    var spy = spyWM();
    try {
      var mock = T.createMockTerminal();
      mock.inputEl = { blur: function() {}, focus: function() {} };
      commandRegistry['/play horde'].handler(mock);
      T.assert(spy.calls.length >= 1, 'WindowManager.open should be called');
      T.assertContains(spy.calls[0].url || '', 'horde');
    } finally {
      spy.restore();
      _cleanupAllWindows();
    }
  });

  T.it('/play platformer uses GameOverlay', function() {
    _cleanupAllWindows();
    var spy = spyWM();
    try {
      var mock = T.createMockTerminal();
      mock.inputEl = { blur: function() {}, focus: function() {} };
      commandRegistry['/play platformer'].handler(mock);
      T.assert(spy.calls.length >= 1, 'WindowManager.open should be called');
      T.assertContains(spy.calls[0].url || '', 'platform');
    } finally {
      spy.restore();
      _cleanupAllWindows();
    }
  });
});

// ========================================
// IDLE TIMER TESTS
// ========================================

T.describe('Idle Timer', function() {
  T.it('idle.js loaded without errors', function() {
    // If we got here, idle.js loaded. Just verify matrix rain function exists.
    T.assertType(runMatrixRain, 'function');
  });

  T.it('GameOverlay.isOpen check works (idle should not trigger during game)', function() {
    // Verify the idle guard works
    T.assertType(GameOverlay.isOpen, 'function');
    T.assertFalse(GameOverlay.isOpen());
  });
});

// ========================================
// FINAL COMPREHENSIVE REGRESSION
// ========================================

T.describe('Final Regression After Overlay', function() {
  T.it('all visible commands still work', function() {
    // v3: a handful of lore commands defer to a Promise chain that loads
    // JSON via fetch (with embedded fallback). They emit asynchronously,
    // so the sync mock check would flag them.
    var asyncAllowed = {
      '/clear': true,
      '/man': true, '/motd': true, '/version': true, '/changelog': true,
      '/docs': true, '/interview': true, '/demo': true
    };
    for (var cmd in commandRegistry) {
      if (commandRegistry[cmd].hidden) continue;
      if (asyncAllowed[cmd]) continue;
      var mock = T.createMockTerminal();
      commandRegistry[cmd].handler(mock);
      T.assert(mock.getOutputCount() > 0 || mock.getHTMLCount() > 0, cmd + ' should produce output');
    }
  });

  T.it('terminal can still be constructed', function() {
    var container = document.getElementById('terminal');
    var term = new Terminal(container);
    T.assertNotNull(term);
    T.assertFalse(term.isActive);
  });

  T.it('themes still work', function() {
    applyTheme('gruvbox');
    T.assertEqual(currentTheme, 'gruvbox');
    applyTheme('catppuccin');
  });

  T.it('boot still works', function() {
    var mock = T.createMockTerminal();
    showWelcome(mock);
    T.assert(mock.getOutputCount() > 0);
  });
});
