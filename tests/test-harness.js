/**
 * Minimal test harness — runs in the browser, no dependencies.
 */
var TestHarness = (function() {
  var tests = [];
  var results = { passed: 0, failed: 0, errors: [] };

  function describe(suiteName, fn) {
    tests.push({ suite: suiteName, fn: fn });
  }

  function it(testName, fn) {
    try {
      fn();
      results.passed++;
      log('  ✓ ' + testName, 'green');
    } catch (e) {
      results.failed++;
      results.errors.push({ test: testName, error: e.message });
      log('  ✗ ' + testName, 'red');
      log('    → ' + e.message, 'red');
    }
  }

  function assert(condition, msg) {
    if (!condition) throw new Error(msg || 'Assertion failed');
  }

  function assertEqual(actual, expected, msg) {
    if (actual !== expected) {
      throw new Error(
        (msg ? msg + ': ' : '') +
        'Expected "' + expected + '" but got "' + actual + '"'
      );
    }
  }

  function assertContains(str, substr, msg) {
    if (typeof str !== 'string' || str.indexOf(substr) === -1) {
      throw new Error(
        (msg ? msg + ': ' : '') +
        'Expected "' + str + '" to contain "' + substr + '"'
      );
    }
  }

  function assertNotNull(val, msg) {
    if (val === null || val === undefined) {
      throw new Error((msg ? msg + ': ' : '') + 'Expected non-null value');
    }
  }

  function assertTrue(val, msg) {
    if (val !== true) {
      throw new Error((msg ? msg + ': ' : '') + 'Expected true but got ' + val);
    }
  }

  function assertFalse(val, msg) {
    if (val !== false) {
      throw new Error((msg ? msg + ': ' : '') + 'Expected false but got ' + val);
    }
  }

  function assertThrows(fn, msg) {
    var threw = false;
    try { fn(); } catch (e) { threw = true; }
    if (!threw) throw new Error((msg ? msg + ': ' : '') + 'Expected function to throw');
  }

  function assertType(val, type, msg) {
    if (typeof val !== type) {
      throw new Error(
        (msg ? msg + ': ' : '') +
        'Expected type "' + type + '" but got "' + typeof val + '"'
      );
    }
  }

  function assertArrayLength(arr, len, msg) {
    if (!Array.isArray(arr) || arr.length !== len) {
      throw new Error(
        (msg ? msg + ': ' : '') +
        'Expected array length ' + len + ' but got ' + (Array.isArray(arr) ? arr.length : 'not an array')
      );
    }
  }

  function log(msg, color) {
    var el = document.getElementById('test-output');
    if (el) {
      var line = document.createElement('div');
      line.textContent = msg;
      if (color) line.style.color = color;
      el.appendChild(line);
    }
    console.log(msg);
  }

  function run() {
    log('Running tests...\n', '#00d4ff');

    for (var i = 0; i < tests.length; i++) {
      log('\n' + tests[i].suite, '#4af626');
      tests[i].fn();
    }

    log('\n' + '─'.repeat(40), '#3a7a3a');
    log(
      results.passed + ' passed, ' + results.failed + ' failed',
      results.failed > 0 ? 'red' : '#4af626'
    );

    if (results.failed > 0) {
      log('\nFailed tests:', 'red');
      for (var j = 0; j < results.errors.length; j++) {
        log('  - ' + results.errors[j].test + ': ' + results.errors[j].error, 'red');
      }
    }

    return results;
  }

  // Create a mock terminal for testing
  function createMockTerminal() {
    var output = [];
    var htmlOutput = [];

    return {
      outputLog: output,
      htmlOutputLog: htmlOutput,
      isActive: false,
      history: [],
      inputEl: { value: '', focus: function() {}, blur: function() {} },
      inputDisplay: { textContent: '' },
      inputLine: { style: {} },
      cursor: { classList: { add: function() {}, remove: function() {} } },
      body: { scrollTop: 0, scrollHeight: 0 },
      outputEl: {
        innerHTML: '',
        children: [],
        appendChild: function(el) { this.children.push(el); }
      },

      output: function(text, className) {
        output.push({ text: text, className: className || '' });
      },
      outputHTML: function(html, className) {
        htmlOutput.push({ html: html, className: className || '' });
      },
      outputLines: function(lines, className) {
        for (var i = 0; i < lines.length; i++) {
          output.push({ text: lines[i], className: className || '' });
        }
      },
      clear: function() {
        output.length = 0;
        htmlOutput.length = 0;
      },
      activateInput: function() { this.isActive = true; },
      deactivateInput: function() { this.isActive = false; },

      getLastOutput: function() {
        return output.length > 0 ? output[output.length - 1].text : null;
      },
      getAllText: function() {
        return output.map(function(o) { return o.text; }).join('\n');
      },
      getOutputCount: function() {
        return output.length;
      },
      getHTMLCount: function() {
        return htmlOutput.length;
      },
      reset: function() {
        output.length = 0;
        htmlOutput.length = 0;
      }
    };
  }

  return {
    describe: describe,
    it: it,
    assert: assert,
    assertEqual: assertEqual,
    assertContains: assertContains,
    assertNotNull: assertNotNull,
    assertTrue: assertTrue,
    assertFalse: assertFalse,
    assertThrows: assertThrows,
    assertType: assertType,
    assertArrayLength: assertArrayLength,
    run: run,
    createMockTerminal: createMockTerminal,
    log: log
  };
})();
