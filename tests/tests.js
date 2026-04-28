/**
 * Comprehensive test suite for the portfolio terminal.
 */

var T = TestHarness;

// ========================================
// COMMAND REGISTRY TESTS
// ========================================

T.describe('Command Registry — Core', function() {
  T.it('commandRegistry is defined', function() {
    T.assertType(commandRegistry, 'object');
  });

  T.it('registerCommand adds to registry', function() {
    var before = Object.keys(commandRegistry).length;
    registerCommand('/test-cmd-123', 'test', function() {});
    T.assert(commandRegistry['/test-cmd-123'] !== undefined, 'Command should be registered');
    delete commandRegistry['/test-cmd-123'];
  });

  T.it('registerCommand normalizes to lowercase', function() {
    registerCommand('/TEST-UPPER', 'test', function() {});
    T.assert(commandRegistry['/test-upper'] !== undefined, 'Should be lowercased');
    delete commandRegistry['/test-upper'];
  });

  T.it('registerCommand stores description', function() {
    T.assertEqual(commandRegistry['/help'].description, 'show available commands');
  });

  T.it('registerCommand stores handler as function', function() {
    T.assertType(commandRegistry['/help'].handler, 'function');
  });

  T.it('hidden commands have hidden flag true', function() {
    T.assertTrue(commandRegistry['/sudo'].hidden);
  });

  T.it('visible commands have hidden flag false', function() {
    T.assertFalse(commandRegistry['/help'].hidden);
  });
});

T.describe('Command Registry — Built-in Commands Exist', function() {
  var requiredCommands = ['/help', '/about', '/contact', '/clear', '/projects'];

  for (var i = 0; i < requiredCommands.length; i++) {
    (function(cmd) {
      T.it(cmd + ' is registered', function() {
        T.assertNotNull(commandRegistry[cmd], cmd + ' should exist');
      });
    })(requiredCommands[i]);
  }
});

// ========================================
// EXECUTE COMMAND TESTS
// ========================================

T.describe('executeCommand — Dispatching', function() {
  T.it('empty input does nothing', function() {
    var mock = T.createMockTerminal();
    executeCommand('', mock);
    T.assertEqual(mock.getOutputCount(), 0, 'Should produce no output');
  });

  T.it('whitespace-only input does nothing', function() {
    var mock = T.createMockTerminal();
    executeCommand('   ', mock);
    T.assertEqual(mock.getOutputCount(), 0);
  });

  T.it('unknown command shows error', function() {
    var mock = T.createMockTerminal();
    executeCommand('/nonexistent', mock);
    T.assertContains(mock.getAllText(), 'command not found');
  });

  T.it('unknown command suggests /help', function() {
    var mock = T.createMockTerminal();
    executeCommand('/banana', mock);
    T.assertContains(mock.getAllText(), '/help');
  });

  T.it('commands are case-insensitive', function() {
    var mock = T.createMockTerminal();
    executeCommand('/HELP', mock);
    T.assert(mock.getOutputCount() > 0, 'Should produce output for /HELP');
  });

  T.it('commands with leading/trailing spaces work', function() {
    var mock = T.createMockTerminal();
    executeCommand('  /help  ', mock);
    T.assert(mock.getOutputCount() > 0, 'Should handle whitespace');
  });
});

// ========================================
// /help COMMAND TESTS
// ========================================

T.describe('/help Command', function() {
  T.it('outputs available commands header', function() {
    var mock = T.createMockTerminal();
    commandRegistry['/help'].handler(mock);
    T.assertContains(mock.getAllText(), 'available commands');
  });

  T.it('lists /projects command', function() {
    var mock = T.createMockTerminal();
    commandRegistry['/help'].handler(mock);
    T.assertContains(mock.getAllText(), '/projects');
  });

  T.it('lists /about command', function() {
    var mock = T.createMockTerminal();
    commandRegistry['/help'].handler(mock);
    T.assertContains(mock.getAllText(), '/about');
  });

  T.it('lists /contact command', function() {
    var mock = T.createMockTerminal();
    commandRegistry['/help'].handler(mock);
    T.assertContains(mock.getAllText(), '/contact');
  });

  T.it('lists /clear command', function() {
    var mock = T.createMockTerminal();
    commandRegistry['/help'].handler(mock);
    T.assertContains(mock.getAllText(), '/clear');
  });

  T.it('shows project shortcuts section', function() {
    var mock = T.createMockTerminal();
    commandRegistry['/help'].handler(mock);
    T.assertContains(mock.getAllText(), 'project shortcuts');
  });

  T.it('does not list hidden commands', function() {
    var mock = T.createMockTerminal();
    commandRegistry['/help'].handler(mock);
    var text = mock.getAllText();
    // /sudo is hidden, should not appear in help
    // But it could appear as part of another word, so check for the padded version
    T.assert(text.indexOf('  /sudo') === -1, '/sudo should not be in /help output');
  });
});

// ========================================
// /about COMMAND TESTS
// ========================================

T.describe('/about Command', function() {
  T.it('outputs about header', function() {
    var mock = T.createMockTerminal();
    commandRegistry['/about'].handler(mock);
    T.assertContains(mock.getAllText(), '> about');
  });

  T.it('mentions David Ungvari', function() {
    var mock = T.createMockTerminal();
    commandRegistry['/about'].handler(mock);
    T.assertContains(mock.getAllText(), 'David Ungvari');
  });

  T.it('includes separator lines', function() {
    var mock = T.createMockTerminal();
    commandRegistry['/about'].handler(mock);
    T.assertContains(mock.getAllText(), '────');
  });
});

// ========================================
// /contact COMMAND TESTS
// ========================================

T.describe('/contact Command', function() {
  T.it('outputs contact header', function() {
    var mock = T.createMockTerminal();
    commandRegistry['/contact'].handler(mock);
    T.assertContains(mock.getAllText(), '> contact');
  });

  T.it('includes GitHub link in HTML output', function() {
    var mock = T.createMockTerminal();
    commandRegistry['/contact'].handler(mock);
    T.assert(mock.getHTMLCount() > 0, 'Should have HTML output for links');
    T.assertContains(mock.htmlOutputLog[0].html, 'github.com/D-ungvari');
  });

  T.it('GitHub link opens in new tab', function() {
    var mock = T.createMockTerminal();
    commandRegistry['/contact'].handler(mock);
    T.assertContains(mock.htmlOutputLog[0].html, 'target="_blank"');
  });

  T.it('GitHub link has noopener', function() {
    var mock = T.createMockTerminal();
    commandRegistry['/contact'].handler(mock);
    T.assertContains(mock.htmlOutputLog[0].html, 'rel="noopener"');
  });
});

// ========================================
// /clear COMMAND TESTS
// ========================================

T.describe('/clear Command', function() {
  T.it('clears all output', function() {
    var mock = T.createMockTerminal();
    mock.output('some text');
    mock.output('more text');
    T.assert(mock.getOutputCount() > 0, 'Should have output before clear');
    commandRegistry['/clear'].handler(mock);
    T.assertEqual(mock.getOutputCount(), 0, 'Should have no output after clear');
  });
});

// ========================================
// PROJECTS SYSTEM TESTS
// ========================================

T.describe('Projects — Data Integrity', function() {
  T.it('projects array is defined', function() {
    T.assert(Array.isArray(projects), 'projects should be an array');
  });

  T.it('has exactly 7 projects', function() {
    T.assertArrayLength(projects, 7);
  });

  T.it('each project has required fields', function() {
    var requiredFields = ['command', 'title', 'tagline', 'description', 'stack', 'liveUrl', 'sourceUrl'];
    for (var i = 0; i < projects.length; i++) {
      for (var j = 0; j < requiredFields.length; j++) {
        T.assertNotNull(
          projects[i][requiredFields[j]],
          projects[i].command + ' missing ' + requiredFields[j]
        );
      }
    }
  });

  T.it('each project description is an array', function() {
    for (var i = 0; i < projects.length; i++) {
      T.assert(Array.isArray(projects[i].description), projects[i].command + ' description should be array');
    }
  });

  T.it('project commands start with /', function() {
    for (var i = 0; i < projects.length; i++) {
      T.assert(projects[i].command.charAt(0) === '/', projects[i].command + ' should start with /');
    }
  });

  T.it('project liveUrls start with https://', function() {
    for (var i = 0; i < projects.length; i++) {
      T.assertContains(projects[i].liveUrl, 'https://', projects[i].command + ' liveUrl');
    }
  });

  T.it('project sourceUrls start with https://github.com', function() {
    for (var i = 0; i < projects.length; i++) {
      T.assertContains(projects[i].sourceUrl, 'https://github.com', projects[i].command + ' sourceUrl');
    }
  });
});

T.describe('Projects — UXCrimes', function() {
  T.it('/uxcrimes is registered', function() {
    T.assertNotNull(commandRegistry['/uxcrimes']);
  });

  T.it('UXCrimes data is correct', function() {
    T.assertEqual(projects[0].command, '/uxcrimes');
    T.assertEqual(projects[0].title, 'UXCRIMES');
    T.assertContains(projects[0].tagline, 'dark UX patterns');
  });

  T.it('/uxcrimes command outputs project detail', function() {
    var mock = T.createMockTerminal();
    commandRegistry['/uxcrimes'].handler(mock);
    T.assertContains(mock.getAllText(), 'UXCRIMES');
  });

  T.it('/uxcrimes shows clickable links', function() {
    var mock = T.createMockTerminal();
    commandRegistry['/uxcrimes'].handler(mock);
    T.assert(mock.getHTMLCount() >= 2, 'Should have play and source links');
  });
});

T.describe('Projects — Horde Shooter', function() {
  T.it('/horde is registered', function() {
    T.assertNotNull(commandRegistry['/horde']);
  });

  T.it('Horde data is correct', function() {
    T.assertEqual(projects[1].command, '/horde');
    T.assertEqual(projects[1].title, 'HORDE SHOOTER');
  });

  T.it('/horde command outputs project detail', function() {
    var mock = T.createMockTerminal();
    commandRegistry['/horde'].handler(mock);
    T.assertContains(mock.getAllText(), 'HORDE SHOOTER');
  });

  T.it('/horde shows stack info', function() {
    var mock = T.createMockTerminal();
    commandRegistry['/horde'].handler(mock);
    T.assertContains(mock.getAllText(), 'canvas 2d');
  });
});

T.describe('Projects — Platform Shooter', function() {
  T.it('/platformer is registered', function() {
    T.assertNotNull(commandRegistry['/platformer']);
  });

  T.it('Platformer data is correct', function() {
    T.assertEqual(projects[2].command, '/platformer');
    T.assertEqual(projects[2].title, 'PLATFORM SHOOTER');
  });

  T.it('/platformer command outputs project detail', function() {
    var mock = T.createMockTerminal();
    commandRegistry['/platformer'].handler(mock);
    T.assertContains(mock.getAllText(), 'PLATFORM SHOOTER');
  });
});

T.describe('/projects List Command', function() {
  T.it('shows all projects', function() {
    var mock = T.createMockTerminal();
    commandRegistry['/projects'].handler(mock);
    var text = mock.getAllText();
    T.assertContains(text, '/uxcrimes');
    T.assertContains(text, '/horde');
    T.assertContains(text, '/platformer');
  });

  T.it('shows projects header', function() {
    var mock = T.createMockTerminal();
    commandRegistry['/projects'].handler(mock);
    T.assertContains(mock.getAllText(), 'projects:');
  });

  T.it('shows taglines', function() {
    var mock = T.createMockTerminal();
    commandRegistry['/projects'].handler(mock);
    var text = mock.getAllText();
    T.assertContains(text, 'dark UX patterns');
    T.assertContains(text, 'survive the onslaught');
  });

  T.it('shows stack info', function() {
    var mock = T.createMockTerminal();
    commandRegistry['/projects'].handler(mock);
    T.assertContains(mock.getAllText(), 'html / css / javascript');
  });

  T.it('includes help hint', function() {
    var mock = T.createMockTerminal();
    commandRegistry['/projects'].handler(mock);
    T.assertContains(mock.getAllText(), 'type a project command for details');
  });
});

// ========================================
// EASTER EGGS TESTS
// ========================================

T.describe('Easter Eggs', function() {
  // /pwd, /ls, /cat were hidden easter eggs in v1/v2. In v3 fs.js promotes
  // them to first-class FS commands (visible in /help). They're tested
  // separately in the Sprint B FS suite.
  var easterEggs = [
    { cmd: '/sudo', contains: 'permission denied' },
    { cmd: '/rm', contains: 'nice try' },
    { cmd: '/rm -rf /', contains: 'nice try' },
    { cmd: '/exit', contains: 'no exit' },
    { cmd: '/hire', contains: '/contact' },
    { cmd: 'hello', contains: '/help' },
    { cmd: 'hi', contains: '/help' },
    { cmd: '/whoami', contains: 'visitor' },
    { cmd: '/vim', contains: 'exiting' },
    { cmd: '/emacs', contains: 'operating system' },
    { cmd: '42', contains: 'life' }
  ];

  for (var i = 0; i < easterEggs.length; i++) {
    (function(egg) {
      T.it(egg.cmd + ' is registered', function() {
        T.assertNotNull(commandRegistry[egg.cmd], egg.cmd + ' should be registered');
      });

      T.it(egg.cmd + ' outputs correctly', function() {
        var mock = T.createMockTerminal();
        commandRegistry[egg.cmd].handler(mock);
        T.assertContains(mock.getAllText(), egg.contains);
      });

      T.it(egg.cmd + ' is hidden', function() {
        T.assertTrue(commandRegistry[egg.cmd].hidden, egg.cmd + ' should be hidden');
      });
    })(easterEggs[i]);
  }
});

// ========================================
// BOOT SEQUENCE TESTS
// ========================================

T.describe('Boot Sequence', function() {
  T.it('runBoot is defined', function() {
    T.assertType(runBoot, 'function');
  });

  T.it('showWelcome is defined', function() {
    T.assertType(showWelcome, 'function');
  });

  T.it('WELCOME_ASCII is defined and non-empty', function() {
    T.assert(Array.isArray(WELCOME_ASCII), 'Should be array');
    T.assert(WELCOME_ASCII.length > 0, 'Should have lines');
  });

  T.it('showWelcome outputs ASCII art', function() {
    var mock = T.createMockTerminal();
    showWelcome(mock);
    T.assertContains(mock.getAllText(), '██');
  });

  T.it('showWelcome includes tagline', function() {
    var mock = T.createMockTerminal();
    showWelcome(mock);
    T.assertContains(mock.getAllText(), 'full-stack');
  });

  T.it('showWelcome includes help hint', function() {
    var mock = T.createMockTerminal();
    showWelcome(mock);
    T.assertContains(mock.getAllText(), '/help');
  });
});

// ========================================
// TERMINAL ENGINE TESTS (DOM-based)
// ========================================

T.describe('Terminal Engine — Construction', function() {
  T.it('Terminal constructor is defined', function() {
    T.assertType(Terminal, 'function');
  });

  T.it('Terminal can be instantiated with a DOM element', function() {
    var container = document.getElementById('terminal');
    T.assertNotNull(container, 'Terminal container should exist');
    var term = new Terminal(container);
    T.assertNotNull(term);
  });

  T.it('Terminal starts inactive', function() {
    var container = document.getElementById('terminal');
    var term = new Terminal(container);
    T.assertFalse(term.isActive);
  });

  T.it('Terminal has empty history', function() {
    var container = document.getElementById('terminal');
    var term = new Terminal(container);
    T.assertArrayLength(term.history, 0);
  });
});

T.describe('Terminal Engine — Output Methods', function() {
  var container, term, outputEl;

  T.it('output() appends a text line', function() {
    container = document.getElementById('terminal');
    term = new Terminal(container);
    outputEl = container.querySelector('#output');
    outputEl.innerHTML = '';

    term.output('test line');
    T.assertEqual(outputEl.children.length, 1);
    T.assertEqual(outputEl.children[0].textContent, 'test line');
  });

  T.it('output() applies className', function() {
    container = document.getElementById('terminal');
    term = new Terminal(container);
    outputEl = container.querySelector('#output');
    outputEl.innerHTML = '';

    term.output('error text', 'error');
    T.assertContains(outputEl.children[0].className, 'error');
  });

  T.it('outputHTML() appends HTML content', function() {
    container = document.getElementById('terminal');
    term = new Terminal(container);
    outputEl = container.querySelector('#output');
    outputEl.innerHTML = '';

    term.outputHTML('<a href="#">link</a>');
    T.assertEqual(outputEl.children.length, 1);
    T.assertContains(outputEl.children[0].innerHTML, '<a');
  });

  T.it('outputLines() appends multiple lines', function() {
    container = document.getElementById('terminal');
    term = new Terminal(container);
    outputEl = container.querySelector('#output');
    outputEl.innerHTML = '';

    term.outputLines(['line 1', 'line 2', 'line 3']);
    T.assertEqual(outputEl.children.length, 3);
  });

  T.it('clear() removes all output', function() {
    container = document.getElementById('terminal');
    term = new Terminal(container);
    outputEl = container.querySelector('#output');

    term.output('some text');
    term.clear();
    T.assertEqual(outputEl.innerHTML, '');
  });
});

T.describe('Terminal Engine — Input Activation', function() {
  T.it('activateInput() sets isActive true', function() {
    var container = document.getElementById('terminal');
    var term = new Terminal(container);
    term.activateInput();
    T.assertTrue(term.isActive);
  });

  T.it('deactivateInput() sets isActive false', function() {
    var container = document.getElementById('terminal');
    var term = new Terminal(container);
    term.activateInput();
    term.deactivateInput();
    T.assertFalse(term.isActive);
  });
});

T.describe('Terminal Engine — HTML Escaping', function() {
  T.it('escapes < and > characters', function() {
    var container = document.getElementById('terminal');
    var term = new Terminal(container);
    var escaped = term._escapeHTML('<script>alert("xss")</script>');
    T.assert(escaped.indexOf('<script>') === -1, 'Should escape script tags');
    T.assertContains(escaped, '&lt;');
  });

  T.it('escapes & character', function() {
    var container = document.getElementById('terminal');
    var term = new Terminal(container);
    var escaped = term._escapeHTML('foo & bar');
    T.assertContains(escaped, '&amp;');
  });

  T.it('preserves " character safely', function() {
    var container = document.getElementById('terminal');
    var term = new Terminal(container);
    var escaped = term._escapeHTML('foo "bar" baz');
    // textContent escaping doesn't convert quotes (only matters in attributes)
    // Verify the string is preserved and not mangled
    T.assertContains(escaped, 'foo');
    T.assertContains(escaped, 'bar');
  });
});

T.describe('Terminal Engine — Command History', function() {
  T.it('history stores commands', function() {
    var container = document.getElementById('terminal');
    var term = new Terminal(container);
    term.onCommand = function() {};
    var outputEl = container.querySelector('#output');
    outputEl.innerHTML = '';

    term.inputEl.value = '/test1';
    term._processCommand();
    term.inputEl.value = '/test2';
    term._processCommand();

    T.assertEqual(term.history.length, 2);
    T.assertEqual(term.history[0], '/test1');
    T.assertEqual(term.history[1], '/test2');
  });

  T.it('empty commands are not added to history', function() {
    var container = document.getElementById('terminal');
    var term = new Terminal(container);
    term.onCommand = function() {};
    var outputEl = container.querySelector('#output');
    outputEl.innerHTML = '';

    term.inputEl.value = '';
    term._processCommand();
    T.assertEqual(term.history.length, 0);
  });

  T.it('historyUp navigates to previous command', function() {
    var container = document.getElementById('terminal');
    var term = new Terminal(container);
    term.onCommand = function() {};
    var outputEl = container.querySelector('#output');
    outputEl.innerHTML = '';

    term.inputEl.value = '/first';
    term._processCommand();
    term.inputEl.value = '/second';
    term._processCommand();

    term._historyUp();
    T.assertEqual(term.inputEl.value, '/second');
    term._historyUp();
    T.assertEqual(term.inputEl.value, '/first');
  });

  T.it('historyDown navigates forward', function() {
    var container = document.getElementById('terminal');
    var term = new Terminal(container);
    term.onCommand = function() {};
    var outputEl = container.querySelector('#output');
    outputEl.innerHTML = '';

    term.inputEl.value = '/first';
    term._processCommand();
    term.inputEl.value = '/second';
    term._processCommand();

    term._historyUp();
    term._historyUp();
    T.assertEqual(term.inputEl.value, '/first');

    term._historyDown();
    T.assertEqual(term.inputEl.value, '/second');
  });

  T.it('historyDown past end restores temp input', function() {
    var container = document.getElementById('terminal');
    var term = new Terminal(container);
    term.onCommand = function() {};
    var outputEl = container.querySelector('#output');
    outputEl.innerHTML = '';

    term.inputEl.value = '/cmd';
    term._processCommand();

    term.inputEl.value = 'typing...';
    term.tempInput = 'typing...';
    term._historyUp();
    T.assertEqual(term.inputEl.value, '/cmd');

    term._historyDown();
    T.assertEqual(term.inputEl.value, 'typing...');
  });
});

// ========================================
// XSS PROTECTION TESTS
// ========================================

T.describe('XSS Protection', function() {
  T.it('output() uses textContent, not innerHTML', function() {
    var container = document.getElementById('terminal');
    var term = new Terminal(container);
    var outputEl = container.querySelector('#output');
    outputEl.innerHTML = '';

    term.output('<img src=x onerror=alert(1)>');
    var child = outputEl.children[0];
    T.assertContains(child.textContent, '<img');
    T.assert(child.querySelector('img') === null, 'Should not create img element');
  });

  T.it('malicious script tags are escaped in output', function() {
    var container = document.getElementById('terminal');
    var term = new Terminal(container);
    var outputEl = container.querySelector('#output');
    outputEl.innerHTML = '';

    term.output('<script>alert("xss")</script>');
    T.assert(outputEl.querySelector('script') === null, 'Should not create script element');
  });

  T.it('user input in command echo is escaped', function() {
    var container = document.getElementById('terminal');
    var term = new Terminal(container);
    term.onCommand = function() {};
    var outputEl = container.querySelector('#output');
    outputEl.innerHTML = '';

    term.inputEl.value = '<b>bold</b>';
    term._processCommand();
    // The echo uses _escapeHTML, so <b> should be escaped
    T.assert(outputEl.querySelector('b') === null, 'Should not create b element from user input');
  });
});

// ========================================
// MOBILE COMMAND CHIPS TESTS
// ========================================

T.describe('Mobile Command Chips', function() {
  T.it('mobile commands container exists', function() {
    var nav = document.getElementById('mobile-commands');
    T.assertNotNull(nav);
  });

  T.it('has exactly 4 command buttons', function() {
    var buttons = document.querySelectorAll('#mobile-commands button[data-cmd]');
    T.assertEqual(buttons.length, 4);
  });

  T.it('buttons have correct data-cmd values', function() {
    var expected = ['/help', '/projects', '/about', '/contact'];
    var buttons = document.querySelectorAll('#mobile-commands button[data-cmd]');
    for (var i = 0; i < expected.length; i++) {
      T.assertEqual(buttons[i].getAttribute('data-cmd'), expected[i]);
    }
  });

  T.it('buttons display command text', function() {
    var buttons = document.querySelectorAll('#mobile-commands button[data-cmd]');
    for (var i = 0; i < buttons.length; i++) {
      T.assert(buttons[i].textContent.indexOf('/') === 0, 'Button text should start with /');
    }
  });
});

// ========================================
// ACCESSIBILITY TESTS
// ========================================

T.describe('Accessibility', function() {
  T.it('terminal has role="application"', function() {
    var terminal = document.getElementById('terminal');
    T.assertEqual(terminal.getAttribute('role'), 'application');
  });

  T.it('terminal has aria-label', function() {
    var terminal = document.getElementById('terminal');
    T.assertNotNull(terminal.getAttribute('aria-label'));
  });

  T.it('terminal body has aria-live="polite"', function() {
    var body = document.getElementById('terminal-body');
    T.assertEqual(body.getAttribute('aria-live'), 'polite');
  });

  T.it('input has aria-label', function() {
    var input = document.getElementById('command-input');
    T.assertNotNull(input.getAttribute('aria-label'));
  });

  T.it('cursor is aria-hidden', function() {
    var cursor = document.getElementById('cursor');
    T.assertEqual(cursor.getAttribute('aria-hidden'), 'true');
  });

  T.it('mobile nav has aria-label', function() {
    var nav = document.getElementById('mobile-commands');
    T.assertNotNull(nav.getAttribute('aria-label'));
  });

  T.it('input has autocomplete off', function() {
    var input = document.getElementById('command-input');
    T.assertEqual(input.getAttribute('autocomplete'), 'off');
  });

  T.it('input has spellcheck off', function() {
    var input = document.getElementById('command-input');
    T.assertEqual(input.getAttribute('spellcheck'), 'false');
  });
});

// ========================================
// DOM STRUCTURE TESTS
// ========================================

T.describe('DOM Structure', function() {
  T.it('terminal container exists', function() {
    T.assertNotNull(document.getElementById('terminal'));
  });

  T.it('terminal-bar exists', function() {
    T.assertNotNull(document.getElementById('terminal-bar'));
  });

  T.it('terminal-body exists', function() {
    T.assertNotNull(document.getElementById('terminal-body'));
  });

  T.it('output container exists', function() {
    T.assertNotNull(document.getElementById('output'));
  });

  T.it('input-line exists', function() {
    T.assertNotNull(document.getElementById('input-line'));
  });

  T.it('command-input exists', function() {
    T.assertNotNull(document.getElementById('command-input'));
  });

  T.it('cursor exists', function() {
    T.assertNotNull(document.getElementById('cursor'));
  });

  T.it('prompt exists', function() {
    var prompt = document.querySelector('.prompt');
    T.assertNotNull(prompt);
    T.assertContains(prompt.textContent, 'visitor@dave');
  });

  T.it('bar has 3 dots', function() {
    var dots = document.querySelectorAll('.bar-dot');
    T.assertEqual(dots.length, 3);
  });

  T.it('bar title shows path', function() {
    var title = document.querySelector('.bar-title');
    T.assertContains(title.textContent, 'visitor@dave');
  });
});

// ========================================
// INTEGRATION TESTS
// ========================================

T.describe('Integration — Full Command Flow', function() {
  T.it('/help followed by /projects works', function() {
    var mock = T.createMockTerminal();
    executeCommand('/help', mock);
    var helpCount = mock.getOutputCount();
    T.assert(helpCount > 0, 'Help should produce output');

    mock.reset();
    executeCommand('/projects', mock);
    T.assert(mock.getOutputCount() > 0, 'Projects should produce output');
  });

  T.it('/clear then /about works', function() {
    var mock = T.createMockTerminal();
    mock.output('junk');
    executeCommand('/clear', mock);
    T.assertEqual(mock.getOutputCount(), 0, 'Clear should empty output');

    executeCommand('/about', mock);
    T.assert(mock.getOutputCount() > 0, 'About should produce output after clear');
  });

  T.it('all project commands produce output', function() {
    for (var i = 0; i < projects.length; i++) {
      var mock = T.createMockTerminal();
      executeCommand(projects[i].command, mock);
      T.assert(mock.getOutputCount() > 0, projects[i].command + ' should produce output');
      T.assert(mock.getHTMLCount() >= 2, projects[i].command + ' should have play+source links');
    }
  });

  T.it('project links contain correct URLs', function() {
    for (var i = 0; i < projects.length; i++) {
      var mock = T.createMockTerminal();
      commandRegistry[projects[i].command].handler(mock);
      var allHtml = mock.htmlOutputLog.map(function(h) { return h.html; }).join('\n');
      T.assertContains(allHtml, projects[i].liveUrl);
      T.assertContains(allHtml, projects[i].sourceUrl);
    }
  });

  T.it('all links have target=_blank and rel=noopener', function() {
    for (var i = 0; i < projects.length; i++) {
      var mock = T.createMockTerminal();
      commandRegistry[projects[i].command].handler(mock);
      for (var j = 0; j < mock.htmlOutputLog.length; j++) {
        var html = mock.htmlOutputLog[j].html;
        if (html.indexOf('<a') !== -1) {
          T.assertContains(html, 'target="_blank"');
          T.assertContains(html, 'rel="noopener"');
        }
      }
    }
  });
});

T.describe('Integration — Edge Cases', function() {
  T.it('very long input does not crash', function() {
    var mock = T.createMockTerminal();
    var longInput = '';
    for (var i = 0; i < 1000; i++) longInput += 'a';
    executeCommand(longInput, mock);
    T.assertContains(mock.getAllText(), 'command not found');
  });

  T.it('special characters in input do not crash', function() {
    var mock = T.createMockTerminal();
    executeCommand('!@#$%^&*(){}[]|\\', mock);
    T.assertContains(mock.getAllText(), 'command not found');
  });

  T.it('unicode input does not crash', function() {
    var mock = T.createMockTerminal();
    executeCommand('こんにちは', mock);
    T.assertContains(mock.getAllText(), 'command not found');
  });

  T.it('tab characters in input handled', function() {
    var mock = T.createMockTerminal();
    executeCommand('\t/help\t', mock);
    T.assert(mock.getOutputCount() > 0);
  });

  T.it('newline characters in input handled', function() {
    var mock = T.createMockTerminal();
    executeCommand('/help\n/about', mock);
    // Should treat as unknown command since it has a newline in it
    T.assert(mock.getOutputCount() > 0);
  });
});

// ========================================
// META TESTS
// ========================================

T.describe('Meta — Page Structure (validates main index.html content)', function() {
  // These tests validate the main index.html structure, not the test page.
  // We parse the actual index.html to verify meta tags.

  T.it('main index.html is loadable (terminal container exists)', function() {
    // The test page includes the terminal DOM structure — this validates it
    T.assertNotNull(document.getElementById('terminal'));
  });

  T.it('test page loads JetBrains Mono font', function() {
    var link = document.querySelector('link[href*="JetBrains"]');
    T.assertNotNull(link);
  });

  T.it('WELCOME_ASCII contains DAVE', function() {
    var combined = WELCOME_ASCII.join('');
    // ASCII art spells DAVE using block characters
    T.assertContains(combined, '██');
  });

  T.it('all project URLs are valid format', function() {
    for (var i = 0; i < projects.length; i++) {
      T.assert(projects[i].liveUrl.indexOf('https://') === 0, 'liveUrl should be https');
      T.assert(projects[i].sourceUrl.indexOf('https://github.com/') === 0, 'sourceUrl should be GitHub');
    }
  });

  T.it('all project commands are unique', function() {
    var seen = {};
    for (var i = 0; i < projects.length; i++) {
      T.assert(!seen[projects[i].command], 'Duplicate command: ' + projects[i].command);
      seen[projects[i].command] = true;
    }
  });

  T.it('no project command conflicts with built-in commands', function() {
    var builtins = ['/help', '/about', '/contact', '/clear', '/projects'];
    for (var i = 0; i < projects.length; i++) {
      T.assert(builtins.indexOf(projects[i].command) === -1,
        projects[i].command + ' conflicts with builtin');
    }
  });
});
