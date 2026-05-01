/**
 * Theme switching system — /theme command
 * Themes: catppuccin (default), gruvbox, tokyonight, nord
 */

var themes = {
  catppuccin: {
    name: 'catppuccin',
    bg: '#1e1e2e',
    surface: '#313244',
    primary: '#cdd6f4',
    dim: '#6c7086',
    accent: '#cba6f7',
    glow: 'rgba(203, 166, 247, 0.28)',
    scrollbar: '#45475a',
    border: '#45475a',
    chipBg: '#181825',
    wallpaperOverlay: 'radial-gradient(circle at 12px 12px, rgba(203, 166, 247, 0.08) 1px, transparent 1px)',
    primaryBgSoft: 'rgba(205, 214, 244, 0.08)',
    primaryBgSofter: 'rgba(205, 214, 244, 0.02)'
  },
  gruvbox: {
    name: 'gruvbox',
    bg: '#282828',
    surface: '#3c3836',
    primary: '#ebdbb2',
    dim: '#928374',
    accent: '#fabd2f',
    glow: 'rgba(250, 189, 47, 0.25)',
    scrollbar: '#504945',
    border: '#665c54',
    chipBg: '#1d2021',
    wallpaperOverlay: 'radial-gradient(ellipse at 50% 65%, rgba(250, 189, 47, 0.08), transparent 72%)',
    primaryBgSoft: 'rgba(235, 219, 178, 0.08)',
    primaryBgSofter: 'rgba(235, 219, 178, 0.02)'
  },
  tokyonight: {
    name: 'tokyonight',
    bg: '#1a1b26',
    surface: '#24283b',
    primary: '#c0caf5',
    dim: '#565f89',
    accent: '#7aa2f7',
    glow: 'rgba(122, 162, 247, 0.28)',
    scrollbar: '#414868',
    border: '#414868',
    chipBg: '#16161e',
    wallpaperOverlay: 'radial-gradient(circle at 20% 30%, rgba(122, 162, 247, 0.09) 0, transparent 1px), radial-gradient(circle at 72% 64%, rgba(187, 154, 247, 0.08) 0, transparent 1px), radial-gradient(circle at 88% 22%, rgba(125, 207, 255, 0.08) 0, transparent 1px)',
    primaryBgSoft: 'rgba(192, 202, 245, 0.08)',
    primaryBgSofter: 'rgba(192, 202, 245, 0.02)'
  },
  nord: {
    name: 'nord',
    bg: '#2e3440',
    surface: '#3b4252',
    primary: '#d8dee9',
    dim: '#4c566a',
    accent: '#88c0d0',
    glow: 'rgba(136, 192, 208, 0.25)',
    scrollbar: '#434c5e',
    border: '#4c566a',
    chipBg: '#242933',
    wallpaperOverlay: 'repeating-linear-gradient(0deg, transparent 0, transparent 15px, rgba(136, 192, 208, 0.04) 15px, rgba(136, 192, 208, 0.04) 16px)',
    primaryBgSoft: 'rgba(216, 222, 233, 0.08)',
    primaryBgSofter: 'rgba(216, 222, 233, 0.02)'
  }
};

var legacyThemeMap = {
  green: 'catppuccin',
  amber: 'gruvbox',
  blue: 'tokyonight',
  matrix: 'catppuccin'
};

var currentTheme = 'catppuccin';

function normalizeThemeName(themeName) {
  if (themes[themeName]) return themeName;
  return legacyThemeMap[themeName] || themeName;
}

function applyTheme(themeName, fromX, fromY) {
  themeName = normalizeThemeName(themeName);
  var theme = themes[themeName];
  if (!theme) return false;

  var root = document.documentElement;
  var prefersReduced = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var doApply = function () {
    currentTheme = themeName;
    if (typeof window !== 'undefined') window.currentTheme = themeName;
    root.style.setProperty('--color-bg', theme.bg);
    root.style.setProperty('--color-surface', theme.surface);
    root.style.setProperty('--color-primary', theme.primary);
    root.style.setProperty('--color-dim', theme.dim);
    root.style.setProperty('--color-accent', theme.accent);
    root.style.setProperty('--color-glow', theme.glow);
    root.style.setProperty('--color-scrollbar', theme.scrollbar);
    root.style.setProperty('--color-border', theme.border);
    root.style.setProperty('--color-chip-bg', theme.chipBg);
    root.style.setProperty('--wallpaper-overlay', theme.wallpaperOverlay || 'none');
    root.style.setProperty('--color-primary-bg-soft', theme.primaryBgSoft || 'rgba(205, 214, 244, 0.08)');
    root.style.setProperty('--color-primary-bg-softer', theme.primaryBgSofter || 'rgba(205, 214, 244, 0.02)');
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
    if (saved) {
      var normalized = normalizeThemeName(saved);
      if (themes[normalized]) {
        if (normalized !== saved) localStorage.setItem('portfolio-theme', normalized);
        applyTheme(normalized);
      }
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
