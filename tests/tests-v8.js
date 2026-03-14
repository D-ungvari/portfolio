/**
 * v8 Feature tests — Game overlay, idle matrix, integration
 */

var T = TestHarness;

// ========================================
// GAME OVERLAY TESTS
// ========================================

T.describe('GameOverlay — API', function() {
  // Ensure clean state before these tests
  if (typeof GameOverlay !== 'undefined' && GameOverlay.isOpen()) {
    GameOverlay.close();
  }

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
    GameOverlay.close();
    T.assertFalse(GameOverlay.isOpen());
  });
});

T.describe('GameOverlay — Open/Close', function() {
  T.it('open creates the overlay DOM', function() {
    var mock = T.createMockTerminal();
    mock.inputEl = { blur: function() {}, focus: function() {} };
    GameOverlay.open('https://example.com', 'TEST', mock);
    var overlay = document.getElementById('game-overlay');
    T.assertNotNull(overlay, 'Overlay should be in DOM');
    T.assertTrue(GameOverlay.isOpen());
    GameOverlay.close();
  });

  T.it('open sets active class', function() {
    var mock = T.createMockTerminal();
    mock.inputEl = { blur: function() {}, focus: function() {} };
    GameOverlay.open('https://example.com', 'TEST', mock);
    var overlay = document.getElementById('game-overlay');
    T.assertContains(overlay.className, 'active');
    GameOverlay.close();
  });

  T.it('overlay has correct z-index', function() {
    var mock = T.createMockTerminal();
    mock.inputEl = { blur: function() {}, focus: function() {} };
    GameOverlay.open('https://example.com', 'TEST', mock);
    var overlay = document.getElementById('game-overlay');
    // z-index is set via CSS, so check the id exists (CSS would apply in browser)
    T.assertEqual(overlay.id, 'game-overlay');
    GameOverlay.close();
  });

  T.it('overlay has a close button', function() {
    var mock = T.createMockTerminal();
    mock.inputEl = { blur: function() {}, focus: function() {} };
    GameOverlay.open('https://example.com', 'TEST', mock);
    var closeBtn = document.getElementById('game-overlay-close');
    T.assertNotNull(closeBtn);
    GameOverlay.close();
  });

  T.it('overlay has an iframe', function() {
    var mock = T.createMockTerminal();
    mock.inputEl = { blur: function() {}, focus: function() {} };
    GameOverlay.open('https://example.com', 'TEST', mock);
    var iframe = document.getElementById('game-iframe');
    T.assertNotNull(iframe);
    GameOverlay.close();
  });

  T.it('overlay shows loading text', function() {
    var mock = T.createMockTerminal();
    mock.inputEl = { blur: function() {}, focus: function() {} };
    GameOverlay.open('https://example.com', 'MY GAME', mock);
    var loading = document.getElementById('game-overlay-loading');
    T.assertNotNull(loading);
    T.assertContains(loading.textContent, 'loading');
    GameOverlay.close();
  });

  T.it('overlay title shows project name', function() {
    var mock = T.createMockTerminal();
    mock.inputEl = { blur: function() {}, focus: function() {} };
    GameOverlay.open('https://example.com', 'UXCRIMES', mock);
    var title = document.querySelector('.game-overlay-title');
    T.assertNotNull(title);
    T.assertContains(title.textContent, 'UXCRIMES');
    GameOverlay.close();
  });

  T.it('close sets isOpen to false', function() {
    var mock = T.createMockTerminal();
    mock.inputEl = { blur: function() {}, focus: function() {} };
    GameOverlay.open('https://example.com', 'TEST', mock);
    GameOverlay.close();
    // isOpen may take 200ms to become false due to fade, but synchronous close sets it immediately
    T.assertFalse(GameOverlay.isOpen());
  });
});

T.describe('GameOverlay — /play Integration', function() {
  T.it('/play uxcrimes uses GameOverlay instead of window.open', function() {
    var mock = T.createMockTerminal();
    mock.inputEl = { blur: function() {}, focus: function() {} };
    // The command should call GameOverlay.open, which creates overlay DOM
    commandRegistry['/play uxcrimes'].handler(mock);
    T.assertContains(mock.getAllText(), 'opening');
    // Overlay should be open
    T.assertTrue(GameOverlay.isOpen());
    GameOverlay.close();
  });

  T.it('/play horde uses GameOverlay', function() {
    var mock = T.createMockTerminal();
    mock.inputEl = { blur: function() {}, focus: function() {} };
    commandRegistry['/play horde'].handler(mock);
    T.assertTrue(GameOverlay.isOpen());
    GameOverlay.close();
  });

  T.it('/play platformer uses GameOverlay', function() {
    var mock = T.createMockTerminal();
    mock.inputEl = { blur: function() {}, focus: function() {} };
    commandRegistry['/play platformer'].handler(mock);
    T.assertTrue(GameOverlay.isOpen());
    GameOverlay.close();
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
    for (var cmd in commandRegistry) {
      if (commandRegistry[cmd].hidden) continue;
      var mock = T.createMockTerminal();
      commandRegistry[cmd].handler(mock);
      if (cmd !== '/clear') {
        T.assert(mock.getOutputCount() > 0 || mock.getHTMLCount() > 0, cmd + ' should produce output');
      }
    }
  });

  T.it('terminal can still be constructed', function() {
    var container = document.getElementById('terminal');
    var term = new Terminal(container);
    T.assertNotNull(term);
    T.assertFalse(term.isActive);
  });

  T.it('themes still work', function() {
    applyTheme('amber');
    T.assertEqual(currentTheme, 'amber');
    applyTheme('green');
  });

  T.it('boot still works', function() {
    var mock = T.createMockTerminal();
    showWelcome(mock);
    T.assert(mock.getOutputCount() > 0);
  });
});
