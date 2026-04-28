/**
 * Apps grid app (B24).
 *
 * Card-style view of the same projects array — recruiter-friendly layout
 * for users who want to skim rather than type project commands.
 */
(function () {
  'use strict';

  function buildContent() {
    var c = document.createElement('div');
    c.className = 'app-apps-grid app-content';
    if (typeof projects === 'undefined') {
      c.textContent = 'no projects available.';
      return c;
    }
    var hdr = document.createElement('div');
    hdr.className = 'apps-grid-header';
    hdr.innerHTML = '<h2>Projects</h2><div class="apps-grid-subtitle">' + projects.length + ' projects · click any card to launch</div>';
    c.appendChild(hdr);

    var grid = document.createElement('div');
    grid.className = 'apps-grid';

    for (var i = 0; i < projects.length; i++) {
      (function (p) {
        var card = document.createElement('div');
        card.className = 'apps-card';
        card.tabIndex = 0;
        card.innerHTML =
          '<div class="apps-card-head">' +
            '<span class="apps-card-glyph">' + (p.glyph || (p.title || '?').charAt(0)) + '</span>' +
            '<div class="apps-card-titles">' +
              '<div class="apps-card-title">' + p.title + '</div>' +
              '<div class="apps-card-tagline">' + p.tagline + '</div>' +
            '</div>' +
          '</div>' +
          '<div class="apps-card-stack">' + p.stack + '</div>' +
          '<div class="apps-card-actions">' +
            '<button class="app-button apps-launch" type="button">Launch</button>' +
            '<a class="app-link" href="' + p.sourceUrl + '" target="_blank" rel="noopener">Source ↗</a>' +
          '</div>';
        card.querySelector('.apps-launch').addEventListener('click', function () {
          if (window.Desktop && Desktop.launchProject) Desktop.launchProject(p);
          else if (typeof GameOverlay !== 'undefined') GameOverlay.open(p.liveUrl, p.title, window._terminalRef);
        });
        card.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            card.querySelector('.apps-launch').click();
          }
        });
        grid.appendChild(card);
      })(projects[i]);
    }

    c.appendChild(grid);
    return c;
  }

  function open() {
    if (!window.WindowManager) return;
    var existing = WindowManager.byApp('apps-grid');
    if (existing && existing.length) {
      WindowManager.bringToFront(existing[0].id);
      return existing[0].id;
    }
    return WindowManager.open({
      app: 'apps-grid',
      title: 'Apps',
      content: buildContent(),
      w: 760,
      h: 600,
      menubar: [
        { label: 'File', items: [
          { label: 'Close', shortcut: 'Ctrl+W', action: function () {
            var ex = WindowManager.byApp('apps-grid');
            if (ex.length) WindowManager.close(ex[0].id);
          }}
        ]},
        { label: 'View', items: [
          { label: 'Refresh', action: function () {
            var ex = WindowManager.byApp('apps-grid');
            if (ex.length) { WindowManager.close(ex[0].id); open(); }
          }},
          { label: 'Sort by name', disabled: true }
        ]},
        { label: 'Help', items: [
          { label: 'About Apps', disabled: true }
        ]}
      ],
      statusbar: (typeof projects !== 'undefined' ? projects.length : 0) + ' projects'
    });
  }

  window.AppsGridApp = { open: open };
})();
