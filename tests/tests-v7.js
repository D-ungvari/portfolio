/**
 * v7 Feature tests — time greeting, credits, play, final inventory
 */

var T = TestHarness;

// ========================================
// TIME GREETING TESTS
// ========================================

T.describe('Time-Based Greeting', function() {
  T.it('getTimeGreeting is defined', function() {
    T.assertType(getTimeGreeting, 'function');
  });

  T.it('getTimeGreeting returns a string', function() {
    var result = getTimeGreeting();
    T.assertType(result, 'string');
    T.assert(result.length > 0, 'Should not be empty');
  });

  T.it('showWelcome includes time greeting', function() {
    var mock = T.createMockTerminal();
    showWelcome(mock);
    var text = mock.getAllText();
    // The greeting should be one of the options
    var hasGreeting =
      text.indexOf('good morning') !== -1 ||
      text.indexOf('good afternoon') !== -1 ||
      text.indexOf('good evening') !== -1 ||
      text.indexOf('midnight oil') !== -1 ||
      text.indexOf('working late') !== -1;
    T.assertTrue(hasGreeting, 'Should contain a time greeting');
  });
});

// ========================================
// /credits COMMAND TESTS
// ========================================

T.describe('/credits Command', function() {
  T.it('/credits is registered', function() {
    T.assertNotNull(commandRegistry['/credits']);
  });

  T.it('/credits is hidden', function() {
    T.assertTrue(commandRegistry['/credits'].hidden);
  });

  T.it('/credits shows header', function() {
    var mock = T.createMockTerminal();
    commandRegistry['/credits'].handler(mock);
    T.assertContains(mock.getAllText(), 'CREDITS');
  });

  T.it('/credits mentions David Ungvari', function() {
    var mock = T.createMockTerminal();
    commandRegistry['/credits'].handler(mock);
    T.assertContains(mock.getAllText(), 'David Ungvari');
  });

  T.it('/credits mentions JetBrains Mono', function() {
    var mock = T.createMockTerminal();
    commandRegistry['/credits'].handler(mock);
    T.assertContains(mock.getAllText(), 'JetBrains Mono');
  });

  T.it('/credits mentions 0 dependencies', function() {
    var mock = T.createMockTerminal();
    commandRegistry['/credits'].handler(mock);
    T.assertContains(mock.getAllText(), '0');
  });

  T.it('/credits ends with separator', function() {
    var mock = T.createMockTerminal();
    commandRegistry['/credits'].handler(mock);
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
// FINAL INVENTORY AND SUMMARY
// ========================================

T.describe('Final Project Inventory', function() {
  T.it('3 projects with complete data', function() {
    T.assertArrayLength(projects, 3);
    for (var i = 0; i < projects.length; i++) {
      T.assert(projects[i].command.length > 1, 'command too short');
      T.assert(projects[i].title.length > 0, 'title empty');
      T.assert(projects[i].tagline.length > 10, 'tagline too short');
      T.assert(projects[i].description.length >= 3, 'description too short');
      T.assert(projects[i].stack.length > 5, 'stack too short');
      T.assertContains(projects[i].liveUrl, 'https://');
      T.assertContains(projects[i].sourceUrl, 'github.com');
    }
  });
});

T.describe('Final Command Summary', function() {
  T.it('list all visible commands', function() {
    var visible = [];
    for (var cmd in commandRegistry) {
      if (!commandRegistry[cmd].hidden) visible.push(cmd);
    }
    // Just verify we have a good number
    T.assert(visible.length >= 10, 'Should have >= 10 visible commands, got ' + visible.length);
  });

  T.it('total command count', function() {
    var total = Object.keys(commandRegistry).length;
    T.assert(total >= 49, 'Should have >= 49 total commands, got ' + total);
  });
});

// ========================================
// KEYBOARD SHORTCUT INTEGRATION
// ========================================

T.describe('Keyboard Shortcuts', function() {
  T.it('Enter key processed by terminal', function() {
    // Just verify the binding exists by checking the handler
    var container = document.getElementById('terminal');
    var term = new Terminal(container);
    T.assertType(term._processCommand, 'function');
  });

  T.it('history navigation functions exist', function() {
    var container = document.getElementById('terminal');
    var term = new Terminal(container);
    T.assertType(term._historyUp, 'function');
    T.assertType(term._historyDown, 'function');
  });

  T.it('tab complete function exists', function() {
    var container = document.getElementById('terminal');
    var term = new Terminal(container);
    T.assertType(term._tabComplete, 'function');
  });
});

// ========================================
// CSS VARIABLE COMPLETENESS
// ========================================

T.describe('CSS Variables Completeness', function() {
  T.it('all theme properties get set as CSS vars', function() {
    var props = ['--color-primary', '--color-dim', '--color-glow', '--color-scrollbar', '--color-border', '--color-chip-bg'];
    var themeNames = Object.keys(themes);

    for (var i = 0; i < themeNames.length; i++) {
      applyTheme(themeNames[i]);
      for (var j = 0; j < props.length; j++) {
        var val = document.documentElement.style.getPropertyValue(props[j]);
        T.assert(val.length > 0, themeNames[i] + ' ' + props[j] + ' should be set');
      }
    }
    applyTheme('green');
  });
});

// ========================================
// FINAL STRESS TEST
// ========================================

T.describe('Final Stress Test', function() {
  T.it('running every command sequentially works', function() {
    var allCmds = Object.keys(commandRegistry);
    var mock = T.createMockTerminal();
    for (var i = 0; i < allCmds.length; i++) {
      commandRegistry[allCmds[i]].handler(mock);
    }
    // Should not crash and should have output
    T.assert(mock.getOutputCount() > 100, 'Should have lots of output');
  });

  T.it('running every command 3x sequentially works', function() {
    var allCmds = Object.keys(commandRegistry);
    for (var i = 0; i < allCmds.length; i++) {
      var mock = T.createMockTerminal();
      commandRegistry[allCmds[i]].handler(mock);
      commandRegistry[allCmds[i]].handler(mock);
      commandRegistry[allCmds[i]].handler(mock);
    }
    T.assertTrue(true, 'All commands survive 3x execution');
  });
});
