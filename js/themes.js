/**
 * Theme switching system — /theme command
 * Themes: green (default), amber, blue, matrix
 */

var themes = {
  green: {
    name: 'green',
    primary: '#4af626',
    dim: '#3a7a3a',
    glow: 'rgba(74, 246, 38, 0.3)',
    scrollbar: '#1a3a1a',
    border: '#2a4a2a',
    chipBg: '#1a1a1a'
  },
  amber: {
    name: 'amber',
    primary: '#ffb000',
    dim: '#7a6a2a',
    glow: 'rgba(255, 176, 0, 0.3)',
    scrollbar: '#3a2a0a',
    border: '#4a3a1a',
    chipBg: '#1a1a0a'
  },
  blue: {
    name: 'blue',
    primary: '#00d4ff',
    dim: '#2a5a7a',
    glow: 'rgba(0, 212, 255, 0.3)',
    scrollbar: '#0a1a3a',
    border: '#1a3a5a',
    chipBg: '#0a0a1a'
  },
  matrix: {
    name: 'matrix',
    primary: '#00ff41',
    dim: '#003b00',
    glow: 'rgba(0, 255, 65, 0.5)',
    scrollbar: '#003b00',
    border: '#005500',
    chipBg: '#000a00'
  }
};

var currentTheme = 'green';

function applyTheme(themeName) {
  var theme = themes[themeName];
  if (!theme) return false;

  currentTheme = themeName;
  var root = document.documentElement;

  root.style.setProperty('--color-primary', theme.primary);
  root.style.setProperty('--color-dim', theme.dim);
  root.style.setProperty('--color-glow', theme.glow);
  root.style.setProperty('--color-scrollbar', theme.scrollbar);
  root.style.setProperty('--color-border', theme.border);
  root.style.setProperty('--color-chip-bg', theme.chipBg);

  // Persist choice
  try {
    localStorage.setItem('portfolio-theme', themeName);
  } catch (e) {
    // localStorage unavailable, no-op
  }

  return true;
}

function loadSavedTheme() {
  try {
    var saved = localStorage.getItem('portfolio-theme');
    if (saved && themes[saved]) {
      applyTheme(saved);
    }
  } catch (e) {
    // localStorage unavailable, no-op
  }
}

// Register /theme command
registerCommand('/theme', 'switch color theme', function(terminal) {
  var themeNames = Object.keys(themes);
  terminal.outputLines([
    'available themes:',
    SEPARATOR,
    ''
  ]);

  for (var i = 0; i < themeNames.length; i++) {
    var marker = themeNames[i] === currentTheme ? ' (active)' : '';
    terminal.output('  ' + themeNames[i] + marker);
  }

  terminal.output('');
  terminal.output('usage: /theme <name>', 'dim');
  terminal.output('');
});

// Register /theme <name> variants
(function() {
  var themeNames = Object.keys(themes);
  for (var i = 0; i < themeNames.length; i++) {
    (function(name) {
      registerCommand('/theme ' + name, 'switch to ' + name + ' theme', function(terminal) {
        applyTheme(name);
        terminal.output('theme set to ' + name + '.', 'accent');
      }, true);
    })(themeNames[i]);
  }
})();
