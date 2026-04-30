/**
 * Node.js test runner using jsdom to run browser tests headlessly.
 */
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

// Read all source files
const basePath = path.join(__dirname, '..');
const testPath = __dirname;

function readFile(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

// Build the HTML with all scripts inline
const htmlContent = readFile(path.join(basePath, 'tests', 'index.html'));

// Parity check: every <script src="js/..."> in index.html must be in the
// `scripts` list below (or be main.js, which is intentionally skipped —
// it constructs a real Terminal that conflicts with the test harness).
function assertScriptParity(loaded) {
  const indexHtml = readFile(path.join(basePath, 'index.html'));
  const re = /<script\s+src="js\/([^"]+)"/g;
  const declared = [];
  let m;
  while ((m = re.exec(indexHtml)) !== null) declared.push(m[1]);
  const loadedSet = new Set(loaded.map(p => {
    const tail = p.split(/[\\/]js[\\/]/)[1];
    return tail ? tail.replace(/\\/g, '/') : null;
  }).filter(Boolean));
  const missing = declared.filter(d => d !== 'main.js' && !loadedSet.has(d));
  if (missing.length) {
    console.error('Test runner missing scripts from index.html:', missing);
    process.exit(2);
  }
}

// Create a JSDOM instance.
// Use a 1280x800 viewport so window.innerWidth >= the splitter's
// 1024px desktop breakpoint — required for tests-os.js splitter tests.
const dom = new JSDOM(htmlContent, {
  url: 'http://localhost',
  runScripts: 'dangerously',
  resources: 'usable',
  pretendToBeVisual: true
});

const { window } = dom;

// Force viewport >= 1024px for splitter desktop branch.
try {
  Object.defineProperty(window, 'innerWidth', { configurable: true, get: function() { return 1280; } });
  Object.defineProperty(window, 'innerHeight', { configurable: true, get: function() { return 800; } });
} catch (e) { /* ignore */ }

// Mock prefers-reduced-motion BEFORE any app script runs so boot.js
// takes the synchronous path. (The HTML also includes this mock, but
// scripts loaded via window.eval below run after that inline script.)
window.matchMedia = function(query) {
  if (typeof query === 'string' && query.indexOf('prefers-reduced-motion') !== -1) {
    return {
      matches: true,
      media: query,
      onchange: null,
      addListener: function() {},
      removeListener: function() {},
      addEventListener: function() {},
      removeEventListener: function() {},
      dispatchEvent: function() { return false; }
    };
  }
  return {
    matches: false,
    media: query,
    onchange: null,
    addListener: function() {},
    removeListener: function() {},
    addEventListener: function() {},
    removeEventListener: function() {},
    dispatchEvent: function() { return false; }
  };
};

// Disable fetch so persona.js / lore.js fall back to embedded JS data
// (window.__PERSONA_FALLBACK and the FALLBACK constant). jsdom may or may
// not ship fetch depending on version — making the policy explicit here.
window.fetch = function () { return Promise.reject(new Error('fetch disabled in tests')); };

// Load scripts in order — must match index.html. main.js is intentionally
// skipped: it constructs a real Terminal on DOMContentLoaded and runs the
// boot sequence, conflicting with the test harness's own mock terminal.
const scripts = [
  path.join(basePath, 'js', 'anim.js'),
  path.join(basePath, 'js', 'desktop-layer.js'),
  path.join(basePath, 'js', 'persona-data.js'),
  path.join(basePath, 'js', 'persona.js'),
  path.join(basePath, 'js', 'session-store.js'),
  path.join(basePath, 'js', 'notify.js'),
  path.join(basePath, 'js', 'shortcuts.js'),
  path.join(basePath, 'js', 'window-manager.js'),
  path.join(basePath, 'js', 'palette.js'),
  path.join(basePath, 'js', 'shortcuts-cheatsheet.js'),
  path.join(basePath, 'js', 'terminal.js'),
  path.join(basePath, 'js', 'commands.js'),
  path.join(basePath, 'js', 'projects.js'),
  path.join(basePath, 'js', 'game-overlay.js'),
  path.join(basePath, 'js', 'easter-eggs.js'),
  path.join(basePath, 'js', 'bsod.js'),
  path.join(basePath, 'js', 'themes.js'),
  path.join(basePath, 'js', 'matrix.js'),
  path.join(basePath, 'js', 'snake.js'),
  path.join(basePath, 'js', 'extras.js'),
  path.join(basePath, 'js', 'icon.js'),
  path.join(basePath, 'js', 'desktop.js'),
  path.join(basePath, 'js', 'context-menu.js'),
  path.join(basePath, 'js', 'taskbar.js'),
  path.join(basePath, 'js', 'pinned-apps.js'),
  path.join(basePath, 'js', 'launcher.js'),
  path.join(basePath, 'js', 'tray-popouts.js'),
  path.join(basePath, 'js', 'quick-settings.js'),
  path.join(basePath, 'js', 'lock-screen.js'),
  path.join(basePath, 'js', 'login-screen.js'),
  path.join(basePath, 'js', 'widgets.js'),
  path.join(basePath, 'js', 'parallax.js'),
  path.join(basePath, 'js', 'lasso.js'),
  path.join(basePath, 'js', 'os-commands.js'),
  path.join(basePath, 'js', 'apps', 'settings.js'),
  path.join(basePath, 'js', 'apps', 'mail.js'),
  path.join(basePath, 'js', 'apps', 'cv-viewer.js'),
  path.join(basePath, 'js', 'apps', 'apps-grid.js'),
  path.join(basePath, 'js', 'apps', 'boring-view.js'),
  path.join(basePath, 'js', 'apps', 'files.js'),
  path.join(basePath, 'js', 'app-commands.js'),
  path.join(basePath, 'js', 'lore.js'),
  path.join(basePath, 'js', 'fs.js'),
  path.join(basePath, 'js', 'terminal-tabs.js'),
  path.join(basePath, 'js', 'pane-toggle.js'),
  path.join(basePath, 'js', 'splitter.js'),
  path.join(basePath, 'js', 'boot.js'),
  path.join(basePath, 'js', 'konami.js'),
  path.join(basePath, 'js', 'idle.js'),
  path.join(testPath, 'test-harness.js'),
  path.join(testPath, 'tests.js'),
  path.join(testPath, 'tests-v2.js'),
  path.join(testPath, 'tests-v3.js'),
  path.join(testPath, 'tests-v4.js'),
  path.join(testPath, 'tests-v5.js'),
  path.join(testPath, 'tests-v6.js'),
  path.join(testPath, 'tests-v7.js'),
  path.join(testPath, 'tests-v8.js'),
  path.join(testPath, 'tests-os.js'),
];

assertScriptParity(scripts);

for (const scriptPath of scripts) {
  const code = readFile(scriptPath);
  window.eval(code);
}

// Several modules (pane-toggle.js, taskbar.js, splitter.js) defer init()
// to DOMContentLoaded when document.readyState === 'loading' at script
// eval time. Fire it manually so their listeners attach before tests run.
// The inline listener in tests/index.html that auto-runs TestHarness is
// guarded by window.__SKIP_AUTORUN_TESTS__ so it doesn't double-run.
window.__SKIP_AUTORUN_TESTS__ = true;
window.eval(
  "if (document.readyState === 'loading') {" +
  "  var ev = document.createEvent('Event');" +
  "  ev.initEvent('DOMContentLoaded', true, true);" +
  "  document.dispatchEvent(ev);" +
  "}"
);

// Run tests
const results = window.eval('TestHarness.run()');

// Output summary
console.log('\n' + '='.repeat(50));
if (results.failed > 0) {
  console.log(`FAIL: ${results.passed} passed, ${results.failed} failed`);
  process.exit(1);
} else {
  console.log(`ALL TESTS PASSED: ${results.passed} tests`);
  process.exit(0);
}
