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

// Create a JSDOM instance
const dom = new JSDOM(htmlContent, {
  url: 'http://localhost',
  runScripts: 'dangerously',
  resources: 'usable',
  pretendToBeVisual: true
});

const { window } = dom;

// Load scripts in order
const scripts = [
  path.join(basePath, 'js', 'terminal.js'),
  path.join(basePath, 'js', 'commands.js'),
  path.join(basePath, 'js', 'projects.js'),
  path.join(basePath, 'js', 'easter-eggs.js'),
  path.join(basePath, 'js', 'game-overlay.js'),
  path.join(basePath, 'js', 'themes.js'),
  path.join(basePath, 'js', 'matrix.js'),
  path.join(basePath, 'js', 'extras.js'),
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
];

for (const scriptPath of scripts) {
  const code = readFile(scriptPath);
  window.eval(code);
}

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
