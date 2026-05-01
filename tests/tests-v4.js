/**
 * v4 Feature tests — new easter eggs, input limits, OG image, CI
 */

var T = TestHarness;

// ========================================
// NEW EASTER EGGS TESTS
// ========================================

T.describe('Easter Eggs — Neofetch', function() {
  T.it('/neofetch is registered', function() {
    T.assertNotNull(commandRegistry['/neofetch']);
  });

  T.it('/neofetch is hidden', function() {
    T.assertTrue(commandRegistry['/neofetch'].hidden);
  });

  T.it('/neofetch shows system info', function() {
    var mock = T.createMockTerminal();
    commandRegistry['/neofetch'].handler(mock);
    var html = mock.htmlOutputLog[0].html;
    T.assertContains(html, 'david@dave-arch');
    T.assertContains(html, 'OS');
    T.assertContains(html, 'Shell');
    T.assertContains(html, 'Theme');
    T.assertContains(html, 'Packages');
  });

  T.it('/neofetch shows DavOS ASCII logo', function() {
    var mock = T.createMockTerminal();
    commandRegistry['/neofetch'].handler(mock);
    T.assertContains(mock.htmlOutputLog[0].html, 'neofetch-logo');
    T.assertContains(mock.htmlOutputLog[0].html, 'visitor@dave-arch');
  });

  T.it('/neofetch shows current theme', function() {
    var mock = T.createMockTerminal();
    commandRegistry['/neofetch'].handler(mock);
    T.assertContains(mock.htmlOutputLog[0].html, 'Catppuccin');
  });

  T.it('/neofetch shows persona role', function() {
    var mock = T.createMockTerminal();
    commandRegistry['/neofetch'].handler(mock);
    T.assertContains(mock.htmlOutputLog[0].html, 'Full-stack Developer');
  });
});

T.describe('Easter Eggs — Cowsay', function() {
  T.it('/cowsay is registered', function() {
    T.assertNotNull(commandRegistry['/cowsay']);
  });

  T.it('/cowsay is hidden', function() {
    T.assertTrue(commandRegistry['/cowsay'].hidden);
  });

  T.it('/cowsay shows a cow', function() {
    var mock = T.createMockTerminal();
    commandRegistry['/cowsay'].handler(mock);
    var text = mock.getAllText();
    T.assertContains(text, '(oo)');
    T.assertContains(text, '(__)');;
  });

  T.it('/cowsay shows speech bubble', function() {
    var mock = T.createMockTerminal();
    commandRegistry['/cowsay'].handler(mock);
    var text = mock.getAllText();
    T.assertContains(text, '< ');
    T.assertContains(text, ' >');
  });

  T.it('/cowsay contains help hint', function() {
    var mock = T.createMockTerminal();
    commandRegistry['/cowsay'].handler(mock);
    T.assertContains(mock.getAllText(), '/help');
  });
});

T.describe('Easter Eggs — Fortune', function() {
  T.it('/fortune is registered', function() {
    T.assertNotNull(commandRegistry['/fortune']);
  });

  T.it('/fortune is hidden', function() {
    T.assertTrue(commandRegistry['/fortune'].hidden);
  });

  T.it('/fortune produces output', function() {
    var mock = T.createMockTerminal();
    commandRegistry['/fortune'].handler(mock);
    T.assert(mock.getOutputCount() > 0, 'Should produce output');
  });

  T.it('fortunes array has at least 10 entries', function() {
    T.assert(Array.isArray(fortunes), 'fortunes should be an array');
    T.assert(fortunes.length >= 10, 'Should have at least 10 fortunes, got ' + fortunes.length);
  });

  T.it('all fortunes are non-empty strings', function() {
    for (var i = 0; i < fortunes.length; i++) {
      T.assertType(fortunes[i], 'string');
      T.assert(fortunes[i].length > 0, 'Fortune ' + i + ' is empty');
    }
  });
});

T.describe('Easter Eggs — Ping', function() {
  T.it('/ping is registered', function() {
    T.assertNotNull(commandRegistry['/ping']);
  });

  T.it('/ping is hidden', function() {
    T.assertTrue(commandRegistry['/ping'].hidden);
  });

  T.it('/ping responds with PONG', function() {
    var mock = T.createMockTerminal();
    commandRegistry['/ping'].handler(mock);
    T.assertContains(mock.getAllText(), 'PONG');
  });
});

T.describe('Easter Eggs — Uptime', function() {
  T.it('/uptime is registered', function() {
    T.assertNotNull(commandRegistry['/uptime']);
  });

  T.it('/uptime is hidden', function() {
    T.assertTrue(commandRegistry['/uptime'].hidden);
  });

  T.it('/uptime shows time', function() {
    var mock = T.createMockTerminal();
    commandRegistry['/uptime'].handler(mock);
    T.assertContains(mock.getAllText(), 'up');
  });
});

T.describe('Easter Eggs — Echo', function() {
  T.it('/echo is registered', function() {
    T.assertNotNull(commandRegistry['/echo']);
  });

  T.it('/echo is hidden', function() {
    T.assertTrue(commandRegistry['/echo'].hidden);
  });

  T.it('/echo shows usage hint', function() {
    var mock = T.createMockTerminal();
    commandRegistry['/echo'].handler(mock);
    T.assertContains(mock.getAllText(), 'usage');
  });
});

// ========================================
// INPUT LENGTH LIMIT TESTS
// ========================================

T.describe('Input Length Limit', function() {
  T.it('Terminal has maxInputLength property', function() {
    var container = document.getElementById('terminal');
    var term = new Terminal(container);
    T.assertEqual(term.maxInputLength, 200);
  });

  T.it('input element has maxlength attribute', function() {
    var container = document.getElementById('terminal');
    var term = new Terminal(container);
    T.assertEqual(term.inputEl.getAttribute('maxlength'), '200');
  });
});

// ========================================
// COMPREHENSIVE EASTER EGG INVENTORY
// ========================================

T.describe('Complete Easter Egg Inventory', function() {
  // /pwd, /ls, /cat were hidden easter eggs in v1/v2. v3 fs.js promotes
  // them to first-class FS commands (visible in /help). Excluded here.
  var allEasterEggs = [
    '/sudo', '/rm', '/rm -rf /', '/exit', '/hire',
    'hello', 'hi', '/whoami', '/date',
    '/vim', '/nvim', ':q', ':q!', ':wq', '/emacs', '42', 'btw',
    '/neofetch', '/cowsay', '/fortune', '/ping', '/uptime', '/echo',
    '/pacman', '/pacman -syu', '/yay', '/paru', '/aur', '/dotfiles',
    '/matrix', '/banner', '/stats'
  ];

  T.it('all easter eggs are registered', function() {
    for (var i = 0; i < allEasterEggs.length; i++) {
      T.assertNotNull(commandRegistry[allEasterEggs[i]], allEasterEggs[i] + ' should be registered');
    }
  });

  T.it('all easter eggs are hidden', function() {
    for (var i = 0; i < allEasterEggs.length; i++) {
      T.assertTrue(commandRegistry[allEasterEggs[i]].hidden, allEasterEggs[i] + ' should be hidden');
    }
  });

  T.it('all easter eggs produce output', function() {
    for (var i = 0; i < allEasterEggs.length; i++) {
      var mock = T.createMockTerminal();
      commandRegistry[allEasterEggs[i]].handler(mock);
      T.assert(mock.getOutputCount() > 0 || mock.getHTMLCount() > 0, allEasterEggs[i] + ' should produce output');
    }
  });

  T.it('total easter eggs >= 24', function() {
    var hiddenCount = 0;
    for (var cmd in commandRegistry) {
      if (commandRegistry[cmd].hidden) hiddenCount++;
    }
    T.assert(hiddenCount >= 24, 'Should have >= 24 hidden commands, got ' + hiddenCount);
  });
});

// ========================================
// TOTAL COMMAND COUNT
// ========================================

T.describe('Final Command Count', function() {
  T.it('total registered commands >= 39', function() {
    var count = Object.keys(commandRegistry).length;
    T.assert(count >= 39, 'Expected >= 39 commands, got ' + count);
  });

  T.it('visible commands include all expected', function() {
    var expected = ['/help', '/about', '/contact', '/clear', '/projects',
                    '/theme', '/history', '/skills',
                    '/uxcrimes', '/horde', '/platformer'];
    for (var i = 0; i < expected.length; i++) {
      T.assertNotNull(commandRegistry[expected[i]], expected[i] + ' should exist');
      T.assertFalse(commandRegistry[expected[i]].hidden, expected[i] + ' should be visible');
    }
  });
});

// ========================================
// CROSS-FEATURE INTEGRATION
// ========================================

T.describe('Cross-Feature Integration', function() {
  T.it('/neofetch reflects current theme after switch', function() {
    applyTheme('gruvbox');
    var mock = T.createMockTerminal();
    commandRegistry['/neofetch'].handler(mock);
    T.assertContains(mock.htmlOutputLog[0].html, 'Gruvbox');
    applyTheme('catppuccin');
  });

  T.it('/stats shows correct project count', function() {
    var mock = T.createMockTerminal();
    mock.history = [];
    commandRegistry['/stats'].handler(mock);
    T.assertContains(mock.getAllText(), projects.length.toString());
  });

  T.it('/skills and /about have different content', function() {
    var mockSkills = T.createMockTerminal();
    var mockAbout = T.createMockTerminal();
    commandRegistry['/skills'].handler(mockSkills);
    commandRegistry['/about'].handler(mockAbout);
    T.assert(mockSkills.getAllText() !== mockAbout.getAllText(), 'Should have different content');
  });

  T.it('running all visible commands in sequence works', function() {
    var visibleCmds = [];
    for (var cmd in commandRegistry) {
      if (!commandRegistry[cmd].hidden) visibleCmds.push(cmd);
    }
    var mock = T.createMockTerminal();
    for (var i = 0; i < visibleCmds.length; i++) {
      commandRegistry[visibleCmds[i]].handler(mock);
    }
    T.assert(mock.getOutputCount() > 0, 'Should produce lots of output');
  });
});

// ========================================
// FILE STRUCTURE VALIDATION
// ========================================

T.describe('Script Loading Order', function() {
  T.it('Terminal is defined before commands', function() {
    T.assertType(Terminal, 'function');
    T.assertType(commandRegistry, 'object');
  });

  T.it('SEPARATOR is defined before projects', function() {
    T.assertType(SEPARATOR, 'string');
    T.assert(Array.isArray(projects));
  });

  T.it('themes are loaded', function() {
    T.assertType(themes, 'object');
    T.assertType(applyTheme, 'function');
  });

  T.it('boot functions are loaded', function() {
    T.assertType(runBoot, 'function');
    T.assertType(showWelcome, 'function');
  });
});
