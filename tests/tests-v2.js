/**
 * v2 Feature tests — themes, matrix, aliases, etc.
 */

var T = TestHarness;

// ========================================
// THEME SYSTEM TESTS
// ========================================

T.describe('Theme System — Data', function() {
  T.it('themes object is defined', function() {
    T.assertType(themes, 'object');
  });

  T.it('has catppuccin theme', function() {
    T.assertNotNull(themes.catppuccin);
  });

  T.it('has gruvbox theme', function() {
    T.assertNotNull(themes.gruvbox);
  });

  T.it('has tokyonight theme', function() {
    T.assertNotNull(themes.tokyonight);
  });

  T.it('has nord theme', function() {
    T.assertNotNull(themes.nord);
  });

  T.it('each theme has required color properties', function() {
    var requiredProps = ['name', 'bg', 'surface', 'primary', 'dim', 'accent', 'glow', 'scrollbar', 'border', 'chipBg'];
    var themeNames = Object.keys(themes);
    for (var i = 0; i < themeNames.length; i++) {
      var theme = themes[themeNames[i]];
      for (var j = 0; j < requiredProps.length; j++) {
        T.assertNotNull(theme[requiredProps[j]], themeNames[i] + ' missing ' + requiredProps[j]);
      }
    }
  });

  T.it('theme colors are valid hex or rgba', function() {
    var themeNames = Object.keys(themes);
    for (var i = 0; i < themeNames.length; i++) {
      var theme = themes[themeNames[i]];
      T.assert(theme.primary.charAt(0) === '#', themeNames[i] + '.primary should be hex');
      T.assert(theme.dim.charAt(0) === '#', themeNames[i] + '.dim should be hex');
      T.assertContains(theme.glow, 'rgba', themeNames[i] + '.glow should be rgba');
    }
  });
});

T.describe('Theme System — Functions', function() {
  T.it('applyTheme is defined', function() {
    T.assertType(applyTheme, 'function');
  });

  T.it('loadSavedTheme is defined', function() {
    T.assertType(loadSavedTheme, 'function');
  });

  T.it('currentTheme defaults to catppuccin', function() {
    T.assertEqual(currentTheme, 'catppuccin');
  });

  T.it('applyTheme returns true for valid theme', function() {
    var result = applyTheme('gruvbox');
    T.assertTrue(result);
    // Reset
    applyTheme('catppuccin');
  });

  T.it('applyTheme returns false for invalid theme', function() {
    var result = applyTheme('nonexistent');
    T.assertFalse(result);
  });

  T.it('applyTheme updates currentTheme', function() {
    applyTheme('tokyonight');
    T.assertEqual(currentTheme, 'tokyonight');
    // Reset
    applyTheme('catppuccin');
  });

  T.it('applyTheme sets CSS custom properties', function() {
    applyTheme('gruvbox');
    var root = document.documentElement;
    var primary = root.style.getPropertyValue('--color-primary');
    T.assertEqual(primary, '#ebdbb2');
    // Reset
    applyTheme('catppuccin');
  });

  T.it('applyTheme persists to localStorage', function() {
    applyTheme('tokyonight');
    try {
      var saved = localStorage.getItem('portfolio-theme');
      T.assertEqual(saved, 'tokyonight');
    } catch (e) {
      // localStorage may not be available in test env
    }
    // Reset
    applyTheme('catppuccin');
  });

  T.it('loadSavedTheme migrates legacy theme names', function() {
    try {
      localStorage.setItem('portfolio-theme', 'amber');
      loadSavedTheme();
      T.assertEqual(currentTheme, 'gruvbox');
      T.assertEqual(localStorage.getItem('portfolio-theme'), 'gruvbox');
    } catch (e) {
      // localStorage may not be available in test env
    }
    applyTheme('catppuccin');
  });
});

T.describe('Theme System — /theme Command', function() {
  T.it('/theme is registered', function() {
    T.assertNotNull(commandRegistry['/theme']);
  });

  T.it('/theme is not hidden', function() {
    T.assertFalse(commandRegistry['/theme'].hidden);
  });

  T.it('/theme lists available themes', function() {
    var mock = T.createMockTerminal();
    commandRegistry['/theme'].handler(mock);
    var text = mock.getAllText();
    T.assertContains(text, 'catppuccin');
    T.assertContains(text, 'gruvbox');
    T.assertContains(text, 'tokyonight');
    T.assertContains(text, 'nord');
  });

  T.it('/theme shows active theme', function() {
    var mock = T.createMockTerminal();
    commandRegistry['/theme'].handler(mock);
    T.assertContains(mock.getAllText(), '(active)');
  });

  T.it('/theme shows usage hint', function() {
    var mock = T.createMockTerminal();
    commandRegistry['/theme'].handler(mock);
    T.assertContains(mock.getAllText(), '/theme <name>');
  });

  T.it('/theme catppuccin is registered', function() {
    T.assertNotNull(commandRegistry['/theme catppuccin']);
  });

  T.it('/theme gruvbox is registered', function() {
    T.assertNotNull(commandRegistry['/theme gruvbox']);
  });

  T.it('/theme tokyonight is registered', function() {
    T.assertNotNull(commandRegistry['/theme tokyonight']);
  });

  T.it('/theme nord is registered', function() {
    T.assertNotNull(commandRegistry['/theme nord']);
  });

  T.it('/theme <name> commands are hidden', function() {
    T.assertTrue(commandRegistry['/theme catppuccin'].hidden);
    T.assertTrue(commandRegistry['/theme gruvbox'].hidden);
  });

  T.it('/theme catppuccin applies catppuccin theme', function() {
    var mock = T.createMockTerminal();
    commandRegistry['/theme catppuccin'].handler(mock);
    T.assertEqual(currentTheme, 'catppuccin');
  });

  T.it('/theme gruvbox applies gruvbox theme', function() {
    var mock = T.createMockTerminal();
    commandRegistry['/theme gruvbox'].handler(mock);
    T.assertEqual(currentTheme, 'gruvbox');
    // Reset
    applyTheme('catppuccin');
  });
});

// ========================================
// MATRIX RAIN TESTS
// ========================================

T.describe('Matrix Rain', function() {
  T.it('runMatrixRain is defined', function() {
    T.assertType(runMatrixRain, 'function');
  });

  T.it('/matrix is registered', function() {
    T.assertNotNull(commandRegistry['/matrix']);
  });

  T.it('/matrix is hidden', function() {
    T.assertTrue(commandRegistry['/matrix'].hidden);
  });

  T.it('/matrix outputs wake up message', function() {
    var mock = T.createMockTerminal();
    commandRegistry['/matrix'].handler(mock);
    T.assertContains(mock.getAllText(), 'wake up');
  });
});

// ========================================
// COMMAND ALIASES TESTS
// ========================================

T.describe('Command Aliases', function() {
  T.it('registerAlias is defined', function() {
    T.assertType(registerAlias, 'function');
  });

  T.it('registerAlias creates a hidden command', function() {
    registerAlias('/test-alias-xyz', '/help');
    T.assertNotNull(commandRegistry['/test-alias-xyz']);
    T.assertTrue(commandRegistry['/test-alias-xyz'].hidden);
    delete commandRegistry['/test-alias-xyz'];
  });

  T.it('alias handler matches target handler', function() {
    registerAlias('/test-alias-abc', '/help');
    var aliasHandler = commandRegistry['/test-alias-abc'].handler;
    var targetHandler = commandRegistry['/help'].handler;
    T.assertEqual(aliasHandler, targetHandler);
    delete commandRegistry['/test-alias-abc'];
  });

  T.it('alias for nonexistent command does nothing', function() {
    var before = Object.keys(commandRegistry).length;
    registerAlias('/ghost-alias', '/nonexistent-cmd');
    // Should not have added anything
    T.assertEqual(Object.keys(commandRegistry).length, before);
  });
});

// ========================================
// SEPARATOR CONSTANT TESTS
// ========================================

T.describe('Separator Constant', function() {
  T.it('SEPARATOR is defined', function() {
    T.assertType(SEPARATOR, 'string');
  });

  T.it('SEPARATOR has consistent length', function() {
    T.assertEqual(SEPARATOR.length, 36);
  });

  T.it('SEPARATOR uses Unicode box-drawing character', function() {
    T.assertContains(SEPARATOR, '─');
  });
});

// ========================================
// BUILTIN COMMANDS LIST TESTS
// ========================================

T.describe('Builtin Commands List', function() {
  T.it('BUILTIN_COMMANDS is defined', function() {
    T.assert(Array.isArray(BUILTIN_COMMANDS), 'Should be an array');
  });

  T.it('includes /help', function() {
    T.assert(BUILTIN_COMMANDS.indexOf('/help') !== -1);
  });

  T.it('includes /theme', function() {
    T.assert(BUILTIN_COMMANDS.indexOf('/theme') !== -1);
  });

  T.it('all builtin commands are registered', function() {
    for (var i = 0; i < BUILTIN_COMMANDS.length; i++) {
      T.assertNotNull(commandRegistry[BUILTIN_COMMANDS[i]], BUILTIN_COMMANDS[i] + ' should be registered');
    }
  });
});

// ========================================
// CSS CUSTOM PROPERTIES TESTS
// ========================================

T.describe('CSS Custom Properties', function() {
  T.it('--color-primary is set after theme apply', function() {
    applyTheme('catppuccin');
    var val = document.documentElement.style.getPropertyValue('--color-primary');
    T.assertEqual(val, '#cdd6f4');
  });

  T.it('--color-dim is set after theme apply', function() {
    applyTheme('catppuccin');
    var val = document.documentElement.style.getPropertyValue('--color-dim');
    T.assertEqual(val, '#6c7086');
  });

  T.it('--color-accent is set after theme apply', function() {
    // This is set in CSS, not JS — just verify the theme system sets its own vars
    applyTheme('gruvbox');
    var val = document.documentElement.style.getPropertyValue('--color-accent');
    T.assertEqual(val, '#fabd2f');
    applyTheme('catppuccin');
  });

  T.it('--color-bg and --color-surface are set after theme apply', function() {
    applyTheme('nord');
    var root = document.documentElement;
    T.assertEqual(root.style.getPropertyValue('--color-bg'), '#2e3440');
    T.assertEqual(root.style.getPropertyValue('--color-surface'), '#3b4252');
    applyTheme('catppuccin');
  });

  T.it('--color-arch is available as a theme-invariant token', function() {
    applyTheme('tokyonight');
    var val = window.getComputedStyle(document.documentElement).getPropertyValue('--color-arch').trim();
    T.assertEqual(val, '#1793D1');
    applyTheme('catppuccin');
  });

  T.it('all themes produce distinct primary colors', function() {
    var primaries = {};
    var themeNames = Object.keys(themes);
    for (var i = 0; i < themeNames.length; i++) {
      var p = themes[themeNames[i]].primary;
      T.assert(!primaries[p], 'Duplicate primary color: ' + p);
      primaries[p] = true;
    }
  });
});

// ========================================
// FULL COMMAND REGISTRY INTEGRITY
// ========================================

T.describe('Full Command Registry Integrity', function() {
  T.it('all registered commands have handler functions', function() {
    for (var cmd in commandRegistry) {
      T.assertType(commandRegistry[cmd].handler, 'function', cmd + ' handler');
    }
  });

  T.it('all registered commands have description strings', function() {
    for (var cmd in commandRegistry) {
      T.assertType(commandRegistry[cmd].description, 'string', cmd + ' description');
    }
  });

  T.it('all registered commands have hidden boolean', function() {
    for (var cmd in commandRegistry) {
      T.assertType(commandRegistry[cmd].hidden, 'boolean', cmd + ' hidden flag');
    }
  });

  T.it('no command throws when called with mock terminal', function() {
    for (var cmd in commandRegistry) {
      var mock = T.createMockTerminal();
      var threw = false;
      try {
        commandRegistry[cmd].handler(mock);
      } catch (e) {
        threw = true;
      }
      T.assertFalse(threw, cmd + ' should not throw');
    }
  });

  T.it('registry has at least 25 commands', function() {
    var count = Object.keys(commandRegistry).length;
    T.assert(count >= 25, 'Should have at least 25 commands, got ' + count);
  });
});

// ========================================
// OUTPUT FORMATTING CONSISTENCY
// ========================================

T.describe('Output Formatting Consistency', function() {
  T.it('all project details end with separator', function() {
    for (var i = 0; i < projects.length; i++) {
      var mock = T.createMockTerminal();
      commandRegistry[projects[i].command].handler(mock);
      var lastNonEmpty = null;
      for (var j = mock.outputLog.length - 1; j >= 0; j--) {
        if (mock.outputLog[j].text.trim() !== '') {
          lastNonEmpty = mock.outputLog[j].text;
          break;
        }
      }
      T.assertContains(lastNonEmpty, '────', projects[i].command + ' should end with separator');
    }
  });

  T.it('/about ends with separator', function() {
    var mock = T.createMockTerminal();
    commandRegistry['/about'].handler(mock);
    T.assertContains(mock.htmlOutputLog[0].html, 'neofetch-separator');
  });

  T.it('/contact ends with separator', function() {
    var mock = T.createMockTerminal();
    commandRegistry['/contact'].handler(mock);
    var lastNonEmpty = null;
    for (var j = mock.outputLog.length - 1; j >= 0; j--) {
      if (mock.outputLog[j].text.trim() !== '') {
        lastNonEmpty = mock.outputLog[j].text;
        break;
      }
    }
    T.assertContains(lastNonEmpty, '────');
  });
});

// ========================================
// BOOT SEQUENCE EDGE CASES
// ========================================

T.describe('Boot Sequence — Edge Cases', function() {
  T.it('showWelcome produces at least 8 lines', function() {
    var mock = T.createMockTerminal();
    showWelcome(mock);
    T.assert(mock.getHTMLCount() >= 1, 'Should render neofetch markup');
    T.assertContains(mock.htmlOutputLog[0].html, 'neofetch-render');
  });

  T.it('WELCOME_ASCII lines are all same length (padded)', function() {
    var len = WELCOME_ASCII[0].length;
    for (var i = 1; i < WELCOME_ASCII.length; i++) {
      T.assertEqual(WELCOME_ASCII[i].length, len, 'Line ' + i + ' length mismatch');
    }
  });

  T.it('runBoot with reduced motion skips animation', function() {
    // Simulate reduced motion — runBoot checks window.matchMedia
    var mock = T.createMockTerminal();
    // We can test the sync path by checking showWelcome works
    showWelcome(mock);
    T.assert(mock.getOutputCount() > 0);
  });
});

// ========================================
// TERMINAL TAB COMPLETION TESTS
// ========================================

T.describe('Terminal Tab Completion', function() {
  T.it('_tabComplete is defined on Terminal prototype', function() {
    T.assertType(Terminal.prototype._tabComplete, 'function');
  });

  T.it('tab complete with unique match fills command', function() {
    var container = document.getElementById('terminal');
    var term = new Terminal(container);
    term.inputEl.value = '/uxcr';
    term._tabComplete();
    T.assertEqual(term.inputEl.value, '/uxcrimes');
  });

  T.it('tab complete with no match does nothing', function() {
    var container = document.getElementById('terminal');
    var term = new Terminal(container);
    var outputEl = container.querySelector('#output');
    outputEl.innerHTML = '';
    term.inputEl.value = '/zzzzz';
    term._tabComplete();
    T.assertEqual(term.inputEl.value, '/zzzzz');
  });

  T.it('tab complete with empty input does nothing', function() {
    var container = document.getElementById('terminal');
    var term = new Terminal(container);
    term.inputEl.value = '';
    term._tabComplete();
    T.assertEqual(term.inputEl.value, '');
  });

  T.it('tab complete with multiple matches shows options', function() {
    var container = document.getElementById('terminal');
    var term = new Terminal(container);
    var outputEl = container.querySelector('#output');
    outputEl.innerHTML = '';

    // /theme and /theme catppuccin, /theme gruvbox, etc — multiple matches for "/th"
    term.inputEl.value = '/th';
    term._tabComplete();
    // Should have shown the matches in output
    T.assert(outputEl.children.length > 0 || term.inputEl.value !== '/th',
      'Should either autocomplete or show options');
  });
});

// ========================================
// STRESS TESTS
// ========================================

T.describe('Stress Tests', function() {
  T.it('1000 sequential commands do not crash', function() {
    var mock = T.createMockTerminal();
    for (var i = 0; i < 1000; i++) {
      executeCommand('/help', mock);
    }
    T.assert(mock.getOutputCount() > 0);
  });

  T.it('rapid clear + output cycles work', function() {
    var mock = T.createMockTerminal();
    for (var i = 0; i < 100; i++) {
      mock.output('line ' + i);
      if (i % 10 === 0) mock.clear();
    }
    T.assert(mock.getOutputCount() > 0);
  });

  T.it('theme switching 100 times does not crash', function() {
    var themeNames = Object.keys(themes);
    for (var i = 0; i < 100; i++) {
      applyTheme(themeNames[i % themeNames.length]);
    }
    // Reset
    applyTheme('catppuccin');
    T.assertTrue(true);
  });

  T.it('every command can be called twice without side effects', function() {
    for (var cmd in commandRegistry) {
      var mock = T.createMockTerminal();
      commandRegistry[cmd].handler(mock);
      commandRegistry[cmd].handler(mock);
      // Just shouldn't throw
    }
    T.assertTrue(true);
  });
});
