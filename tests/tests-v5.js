/**
 * v5 Feature tests — source, weather, time, man, npm, git easter eggs
 */

var T = TestHarness;

// ========================================
// ADDITIONAL EASTER EGGS
// ========================================

T.describe('Easter Eggs — Source', function() {
  T.it('/source is registered', function() {
    T.assertNotNull(commandRegistry['/source']);
  });

  T.it('/source is hidden', function() {
    T.assertTrue(commandRegistry['/source'].hidden);
  });

  T.it('/source shows GitHub link', function() {
    var mock = T.createMockTerminal();
    commandRegistry['/source'].handler(mock);
    T.assert(mock.getHTMLCount() > 0, 'Should have HTML output');
    T.assertContains(mock.htmlOutputLog[0].html, 'github.com/D-ungvari/portfolio');
  });

  T.it('/source mentions no frameworks', function() {
    var mock = T.createMockTerminal();
    commandRegistry['/source'].handler(mock);
    T.assertContains(mock.getAllText(), 'no frameworks');
  });
});

T.describe('Easter Eggs — Weather', function() {
  T.it('/weather is registered', function() {
    T.assertNotNull(commandRegistry['/weather']);
  });

  T.it('/weather is hidden', function() {
    T.assertTrue(commandRegistry['/weather'].hidden);
  });

  T.it('/weather shows weather report', function() {
    var mock = T.createMockTerminal();
    commandRegistry['/weather'].handler(mock);
    var text = mock.getAllText();
    T.assertContains(text, 'weather');
    T.assertContains(text, 'forecast');
  });
});

T.describe('Easter Eggs — Time', function() {
  T.it('/time is registered', function() {
    T.assertNotNull(commandRegistry['/time']);
  });

  T.it('/time is hidden', function() {
    T.assertTrue(commandRegistry['/time'].hidden);
  });

  T.it('/time shows a time string with colons', function() {
    var mock = T.createMockTerminal();
    commandRegistry['/time'].handler(mock);
    T.assertContains(mock.getAllText(), ':');
  });
});

T.describe('Easter Eggs — Man', function() {
  T.it('/man is registered', function() {
    T.assertNotNull(commandRegistry['/man']);
  });

  T.it('/man is hidden', function() {
    T.assertTrue(commandRegistry['/man'].hidden);
  });

  T.it('/man suggests /help', function() {
    var mock = T.createMockTerminal();
    commandRegistry['/man'].handler(mock);
    T.assertContains(mock.getAllText(), '/help');
  });
});

T.describe('Easter Eggs — NPM', function() {
  T.it('/npm is registered', function() {
    T.assertNotNull(commandRegistry['/npm']);
  });

  T.it('/npm is hidden', function() {
    T.assertTrue(commandRegistry['/npm'].hidden);
  });

  T.it('/npm mentions zero dependencies', function() {
    var mock = T.createMockTerminal();
    commandRegistry['/npm'].handler(mock);
    T.assertContains(mock.getAllText(), 'zero dependencies');
  });
});

T.describe('Easter Eggs — Git', function() {
  T.it('/git is registered', function() {
    T.assertNotNull(commandRegistry['/git']);
  });

  T.it('/git is hidden', function() {
    T.assertTrue(commandRegistry['/git'].hidden);
  });

  T.it('/git shows branch info', function() {
    var mock = T.createMockTerminal();
    commandRegistry['/git'].handler(mock);
    T.assertContains(mock.getAllText(), 'branch main');
  });
});

// ========================================
// UPDATED COMMAND COUNTS
// ========================================

T.describe('Updated Command Counts', function() {
  T.it('total commands now >= 45', function() {
    var count = Object.keys(commandRegistry).length;
    T.assert(count >= 45, 'Expected >= 45, got ' + count);
  });

  T.it('hidden commands >= 30', function() {
    var count = 0;
    for (var cmd in commandRegistry) {
      if (commandRegistry[cmd].hidden) count++;
    }
    T.assert(count >= 30, 'Expected >= 30 hidden, got ' + count);
  });
});

// ========================================
// ALL COMMANDS CALLABLE WITHOUT ERRORS
// ========================================

T.describe('Global Regression — All Commands Safe', function() {
  T.it('every single command can be called without throwing', function() {
    var failed = [];
    for (var cmd in commandRegistry) {
      var mock = T.createMockTerminal();
      try {
        commandRegistry[cmd].handler(mock);
      } catch (e) {
        failed.push(cmd + ': ' + e.message);
      }
    }
    T.assertEqual(failed.length, 0, 'Commands that threw: ' + failed.join(', '));
  });

  T.it('every command produces some output or HTML', function() {
    var silent = [];
    for (var cmd in commandRegistry) {
      if (cmd === '/clear') continue; // /clear is supposed to produce no output
      var mock = T.createMockTerminal();
      commandRegistry[cmd].handler(mock);
      if (mock.getOutputCount() === 0 && mock.getHTMLCount() === 0) {
        silent.push(cmd);
      }
    }
    T.assertEqual(silent.length, 0, 'Silent commands: ' + silent.join(', '));
  });
});

// ========================================
// PERFORMANCE TESTS
// ========================================

T.describe('Performance', function() {
  T.it('all commands execute in < 100ms each', function() {
    for (var cmd in commandRegistry) {
      var mock = T.createMockTerminal();
      var start = Date.now();
      commandRegistry[cmd].handler(mock);
      var elapsed = Date.now() - start;
      T.assert(elapsed < 100, cmd + ' took ' + elapsed + 'ms');
    }
  });

  T.it('10000 output() calls complete in < 3s (jsdom is slower)', function() {
    var container = document.getElementById('terminal');
    var term = new Terminal(container);
    var outputEl = container.querySelector('#output');
    outputEl.innerHTML = '';

    var start = Date.now();
    for (var i = 0; i < 10000; i++) {
      term.output('line ' + i);
    }
    var elapsed = Date.now() - start;
    T.assert(elapsed < 3000, '10000 outputs took ' + elapsed + 'ms');

    outputEl.innerHTML = '';
  });
});
