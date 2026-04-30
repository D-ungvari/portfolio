/**
 * v6 Feature tests — /play command, Ctrl+L, final counts
 */

var T = TestHarness;

// ========================================
// /play COMMAND TESTS
// ========================================

T.describe('/play Command', function() {
  T.it('/play is registered', function() {
    T.assertNotNull(commandRegistry['/play']);
  });

  T.it('/play shows usage when called alone', function() {
    var mock = T.createMockTerminal();
    commandRegistry['/play'].handler(mock);
    T.assertContains(mock.getAllText(), 'usage');
  });

  T.it('/play lists available projects', function() {
    var mock = T.createMockTerminal();
    commandRegistry['/play'].handler(mock);
    var text = mock.getAllText();
    T.assertContains(text, 'uxcrimes');
    T.assertContains(text, 'horde');
    T.assertContains(text, 'platformer');
  });

  T.it('/play uxcrimes is registered', function() {
    T.assertNotNull(commandRegistry['/play uxcrimes']);
  });

  T.it('/play horde is registered', function() {
    T.assertNotNull(commandRegistry['/play horde']);
  });

  T.it('/play platformer is registered', function() {
    T.assertNotNull(commandRegistry['/play platformer']);
  });

  T.it('/play <project> commands are hidden', function() {
    T.assertTrue(commandRegistry['/play uxcrimes'].hidden);
    T.assertTrue(commandRegistry['/play horde'].hidden);
    T.assertTrue(commandRegistry['/play platformer'].hidden);
  });

  T.it('/play uxcrimes outputs opening message', function() {
    var mock = T.createMockTerminal();
    commandRegistry['/play uxcrimes'].handler(mock);
    T.assertContains(mock.getAllText(), 'opening');
  });
});

// ========================================
// Ctrl+L SHORTCUT TESTS
// ========================================

T.describe('Ctrl+L Clear Shortcut', function() {
  T.it('terminal handles Ctrl+L keydown', function() {
    var container = document.getElementById('terminal');
    var term = new Terminal(container);
    var outputEl = container.querySelector('#output');
    outputEl.innerHTML = '';

    // Add some output
    term.output('line 1');
    term.output('line 2');
    T.assert(outputEl.children.length > 0, 'Should have output');

    // Simulate Ctrl+L
    var event = new KeyboardEvent('keydown', {
      key: 'l',
      ctrlKey: true,
      bubbles: true,
      cancelable: true
    });
    term.inputEl.dispatchEvent(event);

    T.assertEqual(outputEl.innerHTML, '', 'Should be cleared after Ctrl+L');
  });
});

// ========================================
// FINAL COMPREHENSIVE COUNTS
// ========================================

T.describe('Final Comprehensive Counts', function() {
  T.it('total commands >= 48', function() {
    var count = Object.keys(commandRegistry).length;
    T.assert(count >= 48, 'Expected >= 48, got ' + count);
  });

  T.it('all visible commands appear in /help', function() {
    var mock = T.createMockTerminal();
    commandRegistry['/help'].handler(mock);
    var helpText = mock.getAllText();

    for (var cmd in commandRegistry) {
      if (!commandRegistry[cmd].hidden) {
        T.assertContains(helpText, cmd, cmd + ' should appear in /help');
      }
    }
  });

  T.it('no hidden commands appear in /help', function() {
    var mock = T.createMockTerminal();
    commandRegistry['/help'].handler(mock);
    var helpText = mock.getAllText();

    for (var cmd in commandRegistry) {
      if (commandRegistry[cmd].hidden) {
        // Hidden command should not have a padded entry line
        var padded = '  ' + cmd.padEnd(16);
        T.assert(helpText.indexOf(padded) === -1, cmd + ' should NOT appear in /help');
      }
    }
  });
});

// ========================================
// LINK SECURITY TESTS
// ========================================

T.describe('Link Security', function() {
  T.it('all outputHTML links have target=_blank', function() {
    for (var cmd in commandRegistry) {
      var mock = T.createMockTerminal();
      commandRegistry[cmd].handler(mock);
      for (var i = 0; i < mock.htmlOutputLog.length; i++) {
        var html = mock.htmlOutputLog[i].html;
        if (html.indexOf('<a') !== -1) {
          T.assertContains(html, 'target="_blank"', cmd + ' link missing target');
        }
      }
    }
  });

  T.it('all outputHTML links have rel=noopener', function() {
    for (var cmd in commandRegistry) {
      var mock = T.createMockTerminal();
      commandRegistry[cmd].handler(mock);
      for (var i = 0; i < mock.htmlOutputLog.length; i++) {
        var html = mock.htmlOutputLog[i].html;
        if (html.indexOf('<a') !== -1) {
          T.assertContains(html, 'rel="noopener"', cmd + ' link missing noopener');
        }
      }
    }
  });
});

// ========================================
// CONSISTENCY TESTS
// ========================================

T.describe('Output Consistency', function() {
  T.it('all commands produce deterministic output (except /fortune, /date, /time, /uptime, /stats, /neofetch)', function() {
    var nondeterministic = ['/fortune', '/date', '/time', '/uptime', '/stats', '/neofetch'];
    for (var cmd in commandRegistry) {
      if (nondeterministic.indexOf(cmd) !== -1) continue;
      if (cmd === '/clear') continue;

      var mock1 = T.createMockTerminal();
      var mock2 = T.createMockTerminal();
      commandRegistry[cmd].handler(mock1);
      commandRegistry[cmd].handler(mock2);

      T.assertEqual(mock1.getAllText(), mock2.getAllText(), cmd + ' output should be deterministic');
    }
  });
});

// ========================================
// MOBILE CHIPS EXTENDED TESTS
// ========================================

T.describe('Mobile Command Chips — Extended', function() {
  T.it('all chip commands are valid registered commands', function() {
    var buttons = document.querySelectorAll('#mobile-commands button[data-cmd]');
    for (var i = 0; i < buttons.length; i++) {
      var cmd = buttons[i].getAttribute('data-cmd');
      T.assertNotNull(commandRegistry[cmd], 'Chip command ' + cmd + ' should be registered');
    }
  });

  T.it('all chip commands are visible (not hidden)', function() {
    var buttons = document.querySelectorAll('#mobile-commands button[data-cmd]');
    for (var i = 0; i < buttons.length; i++) {
      var cmd = buttons[i].getAttribute('data-cmd');
      T.assertFalse(commandRegistry[cmd].hidden, cmd + ' should be visible');
    }
  });
});

// ========================================
// E05 — Notification Center
// ========================================
T.describe('Notification Center — E05', function () {
  function clean() {
    var c = document.getElementById('notify-center');
    if (c && c.parentNode) c.parentNode.removeChild(c);
    if (Notify.setDnd) Notify.setDnd(false);
  }

  T.it('Notify.toggleCenter exposes API', function () {
    T.assertType(Notify.toggleCenter, 'function');
    T.assertType(Notify.setDnd, 'function');
    T.assertType(Notify.isDnd, 'function');
  });

  T.it('toggleCenter creates #notify-center', function () {
    clean();
    Notify.toggleCenter();
    T.assertNotNull(document.getElementById('notify-center'));
    clean();
  });

  T.it('Today section renders for fresh notifications', function () {
    clean();
    Notify.push({ title: 'Test 1', body: 'hello' });
    Notify.toggleCenter();
    var groups = document.querySelectorAll('#notify-center .notify-center-group');
    var hasToday = false;
    groups.forEach(function (g) { if (g.textContent === 'Today') hasToday = true; });
    T.assertTrue(hasToday, 'Today group present');
    clean();
  });

  T.it('DND skips toast surface but still logs', function () {
    clean();
    Notify.setDnd(true);
    var beforeToasts = document.querySelectorAll('.notify-toast').length;
    var beforeLog = Notify.log().length;
    Notify.push({ title: 'silenced', body: 'should not toast' });
    var afterToasts = document.querySelectorAll('.notify-toast').length;
    var afterLog = Notify.log().length;
    T.assertEqual(afterToasts, beforeToasts, 'no new toast');
    T.assertEqual(afterLog, beforeLog + 1, 'log entry added');
    Notify.setDnd(false);
    clean();
  });

  T.it('Clear all empties log', function () {
    clean();
    Notify.push({ title: 'one' });
    Notify.push({ title: 'two' });
    Notify.toggleCenter();
    var clearBtn = document.querySelector('#notify-center .notify-center-clear');
    T.assertNotNull(clearBtn);
    clearBtn.click();
    T.assertEqual(Notify.log().length, 0);
    clean();
  });
});
