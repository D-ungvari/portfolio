/**
 * Neofetch renderer for the Arch redesign.
 * DavOS ASCII logo: ANSI Shadow wordmark + tiling-WM workspace strip + terminal motif.
 * Replaces canonical Arch pyramid with a DavOS-branded variant that still reads
 * as a developer-distro neofetch render.
 */
(function () {
  'use strict';

  var ARCH_LOGO = [
    '  ██████╗  █████╗ ██╗   ██╗ ██████╗ ███████╗',
    '  ██╔══██╗██╔══██╗██║   ██║██╔═══██╗██╔════╝',
    '  ██║  ██║███████║██║   ██║██║   ██║███████╗',
    '  ██║  ██║██╔══██║╚██╗ ██╔╝██║   ██║╚════██║',
    '  ██████╔╝██║  ██║ ╚████╔╝ ╚██████╔╝███████║',
    '  ╚═════╝ ╚═╝  ╚═╝  ╚═══╝   ╚═════╝ ╚══════╝',
    '',
    '          [1] [2] [3] [4] [5]',
    '',
    '   ╭───────────────────────────────────────╮',
    '   │ ╳            visitor@dave-arch        │',
    '   ├───────────────────────────────────────┤',
    '   │ ╭─ ~/portfolio  main !2 ?1            │',
    '   │ ╰─λ                                   │',
    '   │                                       │',
    '   ╰───────────────────────────────────────╯',
    '          a tiling-wm developer os.',
    '                btw i use arch.'
  ];

  var THEME_NAMES = {
    catppuccin: 'Catppuccin Mocha',
    gruvbox: 'Gruvbox Dark',
    tokyonight: 'Tokyo Night',
    nord: 'Nord'
  };

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function persona() {
    return (window.Persona && Persona.get && Persona.get()) ||
      window.__PERSONA_FALLBACK ||
      {};
  }

  function stripProtocol(url) {
    return String(url || '').replace(/^https?:\/\//, '').replace(/\/$/, '') || 'unknown';
  }

  function stack(p) {
    var items = Array.isArray(p.currently_shipping) ? p.currently_shipping : [];
    if (!items.length) return 'TypeScript / React / .NET';
    return items.slice(0, 4).join(' / ');
  }

  function uptime(p) {
    var exp = Array.isArray(p.experience) && p.experience.length ? p.experience[0] : null;
    var from = exp && exp.from ? parseInt(exp.from, 10) : 2023;
    var years = Math.max(1, new Date().getFullYear() - from);
    var company = (p.company || (exp && exp.company) || 'Omada A/S');
    return years + '+ years @ ' + company;
  }

  function themeName() {
    var key = typeof currentTheme !== 'undefined' ? currentTheme : 'catppuccin';
    return THEME_NAMES[key] || key;
  }

  function memory() {
    var mib = 4100 + Math.floor((Date.now() / 1000) % 420);
    return mib + 'MiB / 16384MiB';
  }

  function rows() {
    var p = persona();
    var contact = p.contact || {};
    return [
      ['OS', 'Arch Linux x86_64'],
      ['Kernel', '6.8.9-arch1-1'],
      ['Uptime', uptime(p)],
      ['Packages', '1247 (pacman)'],
      ['Shell', 'zsh 5.9'],
      ['WM', 'Hyprland'],
      ['Editor', 'nvim'],
      ['Theme', themeName()],
      ['CPU', 'Intel i7-1370P'],
      ['Memory', memory()],
      ['Location', p.location || 'Copenhagen, DK'],
      ['Role', p.role || 'Full-stack Developer'],
      ['Stack', stack(p)],
      ['GitHub', stripProtocol(contact.github || 'https://github.com/D-ungvari')],
      ['Email', contact.email || 'qkaturo95@gmail.com']
    ];
  }

  function hostLine() {
    var p = persona();
    var first = String((p.name || 'david').split(/\s+/)[0] || 'david').toLowerCase();
    return first + '@dave-arch';
  }

  function renderHTML() {
    var info = rows();
    var html = '<div class="neofetch-render">' +
      '<pre class="neofetch-logo" aria-hidden="true">' + esc(ARCH_LOGO.join('\n')) + '</pre>' +
      '<div class="neofetch-info">' +
        '<div class="neofetch-host">' + esc(hostLine()) + '</div>' +
        '<div class="neofetch-separator">----------------</div>';
    for (var i = 0; i < info.length; i++) {
      html += '<div class="neofetch-row">' +
        '<span class="neofetch-key">' + esc(info[i][0]) + '</span>' +
        '<span class="neofetch-colon">:</span>' +
        '<span class="neofetch-value">' + esc(info[i][1]) + '</span>' +
      '</div>';
    }
    html += '</div></div>';
    return html;
  }

  function plainLines() {
    var info = rows();
    var lines = [hostLine(), '----------------'];
    for (var i = 0; i < info.length; i++) {
      lines.push(info[i][0] + ': ' + info[i][1]);
    }
    return ARCH_LOGO.concat(['']).concat(lines);
  }

  function render(target) {
    var html = renderHTML();
    if (target && typeof target.outputHTML === 'function') {
      target.outputHTML(html, 'neofetch-output');
      return html;
    }
    if (target && typeof target.outputLines === 'function') {
      target.outputLines(plainLines());
      return html;
    }
    if (target && target.nodeType === 1) {
      target.innerHTML = html;
      return html;
    }
    return html;
  }

  window.Neofetch = {
    render: render,
    renderHTML: renderHTML,
    plainLines: plainLines,
    logoLines: function () { return ARCH_LOGO.slice(); }
  };

  if (typeof registerCommand === 'function') {
    var handler = function (terminal) { render(terminal); };
    registerCommand('/about', 'about me', handler, false);
    registerCommand('/neofetch', '', handler, true);
    registerCommand('/fastfetch', '', handler, true);
  }
})();
