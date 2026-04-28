/**
 * Context menu — right-click + long-press menu for desktop icons.
 */
(function() {
  var current = null;

  function close() {
    if (current && current.parentNode) current.parentNode.removeChild(current);
    current = null;
    document.removeEventListener('click', onDocClick, true);
    document.removeEventListener('keydown', onKeydown, true);
  }

  function onDocClick(e) {
    if (current && !current.contains(e.target)) close();
  }
  function onKeydown(e) {
    if (e.key === 'Escape') close();
  }

  function show(x, y, items) {
    close();
    var menu = document.createElement('div');
    menu.className = 'context-menu';
    menu.setAttribute('role', 'menu');
    items.forEach(function(item) {
      var el = document.createElement('div');
      el.className = 'context-menu-item' + (item.disabled ? ' disabled' : '');
      el.setAttribute('role', 'menuitem');
      // Render label (append a chevron when there's a submenu)
      if (item.submenu && Array.isArray(item.submenu)) {
        el.textContent = item.label + '  ›';
      } else {
        el.textContent = item.label;
      }
      if (!item.disabled) {
        el.addEventListener('click', function(ev) {
          ev.stopPropagation();
          if (item.submenu && Array.isArray(item.submenu)) {
            // v1 simplification: flatten submenu — replace current menu with submenu items in place.
            var sx = x, sy = y;
            close();
            show(sx, sy, item.submenu);
            return;
          }
          close();
          if (typeof item.action === 'function') item.action();
        });
      }
      menu.appendChild(el);
    });
    document.body.appendChild(menu);
    // Position with viewport clamping
    var w = menu.offsetWidth, h = menu.offsetHeight;
    var vw = window.innerWidth, vh = window.innerHeight;
    if (x + w > vw - 8) x = vw - w - 8;
    if (y + h > vh - 8) y = vh - h - 8;
    if (x < 8) x = 8;
    if (y < 8) y = 8;
    menu.style.left = x + 'px';
    menu.style.top = y + 'px';
    current = menu;
    setTimeout(function() {
      document.addEventListener('click', onDocClick, true);
      document.addEventListener('keydown', onKeydown, true);
    }, 0);
  }

  function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch(function() {});
      return;
    }
    // Fallback
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(ta);
  }

  function buildItems(p, terminalRef) {
    return [
      {
        label: 'Open',
        action: function() {
          if (window.Desktop && typeof window.Desktop.launchProject === 'function') {
            window.Desktop.launchProject(p);
          } else if (typeof GameOverlay !== 'undefined') {
            GameOverlay.open(p.liveUrl, p.title, terminalRef);
          }
        }
      },
      {
        label: 'View source',
        action: function() {
          window.open(p.sourceUrl, '_blank', 'noopener');
        }
      },
      {
        label: 'Show details',
        action: function() {
          if (typeof executeCommand === 'function') {
            executeCommand(p.command, terminalRef);
          }
        }
      },
      {
        label: 'Copy live URL',
        action: function() {
          copyToClipboard(p.liveUrl);
        }
      }
    ];
  }

  function attach(grid, terminalRef) {
    if (!grid) return;

    grid.addEventListener('contextmenu', function(e) {
      var icon = e.target.closest && e.target.closest('.desktop-icon');
      if (!icon || !icon._project) return;
      e.preventDefault();
      show(e.clientX, e.clientY, buildItems(icon._project, terminalRef));
    });

    // Long-press for touch
    var pressTimer = null;
    var pressStart = null;
    grid.addEventListener('touchstart', function(e) {
      var icon = e.target.closest && e.target.closest('.desktop-icon');
      if (!icon || !icon._project) return;
      var t = e.touches[0];
      pressStart = { x: t.clientX, y: t.clientY, icon: icon };
      pressTimer = setTimeout(function() {
        if (!pressStart) return;
        var p = pressStart.icon._project;
        show(pressStart.x, pressStart.y, buildItems(p, terminalRef));
        pressStart = null;
      }, 500);
    }, { passive: true });
    grid.addEventListener('touchmove', function() {
      if (pressTimer) { clearTimeout(pressTimer); pressTimer = null; }
      pressStart = null;
    }, { passive: true });
    grid.addEventListener('touchend', function() {
      if (pressTimer) { clearTimeout(pressTimer); pressTimer = null; }
      pressStart = null;
    });
    grid.addEventListener('touchcancel', function() {
      if (pressTimer) { clearTimeout(pressTimer); pressTimer = null; }
      pressStart = null;
    });
  }

  function buildThemeSubmenu() {
    if (typeof themes === 'undefined') return [];
    var names = Object.keys(themes);
    return names.map(function (name) {
      var marker = (typeof currentTheme !== 'undefined' && name === currentTheme) ? ' ✓' : '';
      return {
        label: name + marker,
        action: function () { if (typeof applyTheme === 'function') applyTheme(name); }
      };
    });
  }

  function attachWallpaper(wallpaperEl, terminalRef) {
    if (!wallpaperEl) return;
    wallpaperEl.addEventListener('contextmenu', function (e) {
      // Skip if right-click on an icon or trash (those have their own handlers)
      if (e.target.closest && (e.target.closest('.desktop-icon') || e.target.closest('#trash-icon'))) return;
      e.preventDefault();
      var items = [
        { label: 'Refresh wallpaper', action: function () {
          wallpaperEl.classList.add('refreshing');
          setTimeout(function () { wallpaperEl.classList.remove('refreshing'); }, 320);
        }},
        { label: 'Change theme...', submenu: buildThemeSubmenu() },
        { label: 'New file...', action: function () {
          if (window.Notify) Notify.push({ title: 'touch: cannot create file', body: 'this filesystem is read-only.', kind: 'dim' });
        }},
        { label: 'Open terminal here', action: function () {
          if (window.PaneToggle && PaneToggle.show) PaneToggle.show('terminal');
          if (window._terminalRef && window._terminalRef.inputEl) window._terminalRef.inputEl.focus();
        }},
        { label: 'About this PC', action: function () {
          if (window.Taskbar && Taskbar.showAbout) Taskbar.showAbout();
        }}
      ];
      show(e.clientX, e.clientY, items);
    });
  }

  if (typeof window !== 'undefined') {
    window.ContextMenu = { show: show, close: close, attach: attach, attachWallpaper: attachWallpaper };
  }
})();
