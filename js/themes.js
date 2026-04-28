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
    chipBg: '#1a1a1a',
    wallpaperOverlay: 'repeating-linear-gradient(0deg, transparent 0, transparent 3px, rgba(74, 246, 38, 0.04) 3px, rgba(74, 246, 38, 0.04) 4px)',
    primaryBgSoft: 'rgba(74, 246, 38, 0.08)',
    primaryBgSofter: 'rgba(74, 246, 38, 0.02)'
  },
  amber: {
    name: 'amber',
    primary: '#ffb000',
    dim: '#7a6a2a',
    glow: 'rgba(255, 176, 0, 0.3)',
    scrollbar: '#3a2a0a',
    border: '#4a3a1a',
    chipBg: '#1a1a0a',
    wallpaperOverlay: 'radial-gradient(ellipse at 50% 60%, rgba(255, 176, 0, 0.06), transparent 70%)',
    primaryBgSoft: 'rgba(255, 176, 0, 0.08)',
    primaryBgSofter: 'rgba(255, 176, 0, 0.02)'
  },
  blue: {
    name: 'blue',
    primary: '#00d4ff',
    dim: '#2a5a7a',
    glow: 'rgba(0, 212, 255, 0.3)',
    scrollbar: '#0a1a3a',
    border: '#1a3a5a',
    chipBg: '#0a0a1a',
    wallpaperOverlay: 'radial-gradient(circle at 20% 30%, rgba(0, 212, 255, 0.08) 0, transparent 1px), radial-gradient(circle at 70% 60%, rgba(0, 212, 255, 0.08) 0, transparent 1px), radial-gradient(circle at 90% 20%, rgba(0, 212, 255, 0.08) 0, transparent 1px), radial-gradient(circle at 40% 80%, rgba(0, 212, 255, 0.08) 0, transparent 1px)',
    primaryBgSoft: 'rgba(0, 212, 255, 0.08)',
    primaryBgSofter: 'rgba(0, 212, 255, 0.02)'
  },
  matrix: {
    name: 'matrix',
    primary: '#00ff41',
    dim: '#003b00',
    glow: 'rgba(0, 255, 65, 0.5)',
    scrollbar: '#003b00',
    border: '#005500',
    chipBg: '#000a00',
    wallpaperOverlay: 'repeating-linear-gradient(180deg, rgba(0, 255, 65, 0.02) 0, rgba(0, 255, 65, 0.02) 16px, transparent 16px, transparent 32px)',
    primaryBgSoft: 'rgba(0, 255, 65, 0.08)',
    primaryBgSofter: 'rgba(0, 255, 65, 0.02)'
  }
};

var currentTheme = 'green';

function applyTheme(themeName, fromX, fromY) {
  var theme = themes[themeName];
  if (!theme) return false;

  var root = document.documentElement;
  var prefersReduced = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var doApply = function () {
    currentTheme = themeName;
    if (typeof window !== 'undefined') window.currentTheme = themeName;
    root.style.setProperty('--color-primary', theme.primary);
    root.style.setProperty('--color-dim', theme.dim);
    root.style.setProperty('--color-glow', theme.glow);
    root.style.setProperty('--color-scrollbar', theme.scrollbar);
    root.style.setProperty('--color-border', theme.border);
    root.style.setProperty('--color-chip-bg', theme.chipBg);
    root.style.setProperty('--wallpaper-overlay', theme.wallpaperOverlay || 'none');
    root.style.setProperty('--color-primary-bg-soft', theme.primaryBgSoft || 'rgba(74, 246, 38, 0.08)');
    root.style.setProperty('--color-primary-bg-softer', theme.primaryBgSofter || 'rgba(74, 246, 38, 0.02)');
    try {
      localStorage.setItem('portfolio-theme', themeName);
    } catch (e) {
      // localStorage unavailable, no-op
    }
  };

  if (prefersReduced || typeof fromX !== 'number' || typeof fromY !== 'number') {
    doApply();
    return true;
  }

  // Radial wipe: animate clip-path circle expanding from click coords.
  var wipe = document.createElement('div');
  wipe.id = 'theme-wipe';
  wipe.style.cssText =
    'position:fixed; inset:0; z-index:9800; pointer-events:none;' +
    'background:' + theme.primary + ';' +
    'opacity:0.18;' +
    '--wipe-x:' + fromX + 'px; --wipe-y:' + fromY + 'px;' +
    'clip-path: circle(0px at var(--wipe-x) var(--wipe-y));' +
    'transition: clip-path 0.45s cubic-bezier(0.4, 0.0, 0.2, 1);';
  document.body.appendChild(wipe);

  // Compute target radius (corner-to-click distance)
  var maxX = Math.max(fromX, window.innerWidth - fromX);
  var maxY = Math.max(fromY, window.innerHeight - fromY);
  var radius = Math.ceil(Math.hypot(maxX, maxY));

  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      wipe.style.clipPath = 'circle(' + radius + 'px at var(--wipe-x) var(--wipe-y))';
    });
  });

  // Apply new theme halfway through wipe — feels like the wave reveals it
  setTimeout(doApply, 220);
  // Remove overlay after wipe finishes
  setTimeout(function () {
    if (wipe.parentNode) {
      wipe.style.transition = 'opacity 0.2s';
      wipe.style.opacity = '0';
      setTimeout(function () { if (wipe.parentNode) wipe.remove(); }, 220);
    }
  }, 480);

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
