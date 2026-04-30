/**
 * Files — file explorer app for DavOS v4 C5.
 *
 * Browses the in-memory FS rooted at /home/visitor/.
 * Sidebar tree, toolbar with back/up/refresh, address bar, grid view, status bar.
 *
 * - Single-click selects, double-click opens
 * - .app files launch the project window
 * - .txt/.md files open in a text viewer mini-window
 * - Folders navigate inline
 */
(function () {
  'use strict';

  var ROOT = '/home/visitor';
  var history = [];
  var historyIdx = -1;

  function escapeHtml(s) {
    var d = document.createElement('div');
    d.textContent = s == null ? '' : s;
    return d.innerHTML;
  }

  function iconForNode(name, node) {
    if (node.type === 'dir') return '▤';
    if (node.kind === 'app') return '▦';
    if (/\.md$/.test(name)) return '✎';
    if (/\.txt$/.test(name)) return '◫';
    return '·';
  }

  function buildContent(initialPath) {
    var c = document.createElement('div');
    c.className = 'app-files app-content';

    c.innerHTML =
      '<div class="files-toolbar">' +
        '<button class="files-tb files-back" title="Back" aria-label="Back">←</button>' +
        '<button class="files-tb files-fwd" title="Forward" aria-label="Forward">→</button>' +
        '<button class="files-tb files-up" title="Up" aria-label="Up">↑</button>' +
        '<button class="files-tb files-refresh" title="Refresh" aria-label="Refresh">⟳</button>' +
        '<input type="text" class="files-address" aria-label="Address" />' +
      '</div>' +
      '<div class="files-main">' +
        '<aside class="files-sidebar"></aside>' +
        '<section class="files-grid"></section>' +
      '</div>';

    var addr = c.querySelector('.files-address');
    var sidebar = c.querySelector('.files-sidebar');
    var grid = c.querySelector('.files-grid');
    var current = initialPath || ROOT;

    function navigate(path, push) {
      if (!window.FS) return;
      var node = window.FS.lookup(path);
      if (!node || node.type !== 'dir') return;
      current = window.FS.resolve(path);
      if (push !== false) {
        history = history.slice(0, historyIdx + 1);
        history.push(current);
        historyIdx = history.length - 1;
      }
      addr.value = current.replace(ROOT, '~') || '~';
      renderGrid(node);
      updateStatus(node);
      updateNav();
    }

    function updateNav() {
      c.querySelector('.files-back').disabled = historyIdx <= 0;
      c.querySelector('.files-fwd').disabled = historyIdx >= history.length - 1;
      c.querySelector('.files-up').disabled = current === '/' || current === ROOT.replace(/\/visitor.*$/, '');
    }

    function updateStatus(node) {
      var count = node && node.children ? Object.keys(node.children).length : 0;
      var existing = WindowManager && c.closest('.os-window');
      var win = c.closest('.os-window');
      if (win) {
        var sb = win.querySelector('.os-window-statusbar');
        if (sb) sb.textContent = count + ' items';
      }
    }

    function renderGrid(node) {
      grid.innerHTML = '';
      if (!node.children) {
        grid.innerHTML = '<div class="files-empty">(empty — but full of potential)</div>';
        return;
      }
      var keys = Object.keys(node.children).filter(function (k) { return k.charAt(0) !== '.'; });
      keys.sort();
      if (!keys.length) {
        grid.innerHTML = '<div class="files-empty">(empty — but full of potential)</div>';
        return;
      }
      for (var i = 0; i < keys.length; i++) {
        (function (name) {
          var child = node.children[name];
          var item = document.createElement('div');
          item.className = 'files-item' + (child.type === 'dir' ? ' is-dir' : '');
          item.tabIndex = 0;
          item.innerHTML =
            '<div class="files-item-icon">' + iconForNode(name, child) + '</div>' +
            '<div class="files-item-name">' + escapeHtml(name) + '</div>';
          item.addEventListener('click', function () {
            grid.querySelectorAll('.files-item.selected').forEach(function (x) { x.classList.remove('selected'); });
            item.classList.add('selected');
          });
          item.addEventListener('dblclick', function () {
            openItem(current, name, child);
          });
          item.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') openItem(current, name, child);
          });
          item.addEventListener('contextmenu', function (e) {
            e.preventDefault();
            e.stopPropagation();
            showItemContextMenu(e.clientX, e.clientY, current, name, child);
          });
          grid.appendChild(item);
        })(keys[i]);
      }
    }

    function isTextLike(name, node) {
      if (node.type === 'dir') return false;
      if (node.kind === 'app') return false;
      if (/\.(txt|md|log|json|conf)$/i.test(name)) return true;
      // Persona-backed kinds are also viewable
      return /^(about|contact|resume|doc|secret)$/.test(node.kind || '');
    }

    function showItemContextMenu(x, y, parent, name, node) {
      var menu = document.createElement('div');
      menu.className = 'context-menu files-ctx';
      menu.style.position = 'fixed';
      menu.style.left = x + 'px';
      menu.style.top = y + 'px';
      menu.style.zIndex = (window.Layer && Layer.CONTEXT_MENU) || 5000;

      var items = [];
      if (node.type === 'dir') {
        items.push({ label: 'Open', action: function () { openItem(parent, name, node); } });
      } else if (node.kind === 'app') {
        items.push({ label: 'Launch', action: function () { openItem(parent, name, node); } });
      } else if (isTextLike(name, node)) {
        items.push({ label: 'Open in viewer', action: function () { openText(name, node); } });
      }
      items.push({ label: 'Properties', action: function () {
        var size = node.type === 'dir'
          ? (node.children ? Object.keys(node.children).length + ' items' : '0 items')
          : '~' + Math.max(1, ((node.kind || name).length * 12)) + ' bytes';
        var msg = name + '\nType: ' + (node.type === 'dir' ? 'Directory' : (node.kind || 'file')) +
                  '\nSize: ' + size + '\nLocation: ' + parent;
        if (window.Notify && Notify.push) Notify.push({ title: 'Properties', body: msg });
        else alert(msg);
      }});

      for (var i = 0; i < items.length; i++) {
        (function (it) {
          var row = document.createElement('button');
          row.type = 'button';
          row.className = 'context-menu-item';
          row.textContent = it.label;
          row.addEventListener('click', function () {
            try { it.action(); } finally { closeMenu(); }
          });
          menu.appendChild(row);
        })(items[i]);
      }

      function closeMenu() {
        if (menu.parentNode) menu.parentNode.removeChild(menu);
        document.removeEventListener('mousedown', onAway, true);
      }
      function onAway(ev) {
        if (!menu.contains(ev.target)) closeMenu();
      }
      document.body.appendChild(menu);
      // Defer so the right-click event itself doesn't immediately close it.
      setTimeout(function () {
        document.addEventListener('mousedown', onAway, true);
      }, 0);
    }

    function openItem(parent, name, node) {
      if (node.type === 'dir') {
        var newPath = parent === '/' ? '/' + name : parent + '/' + name;
        navigate(newPath, true);
        return;
      }
      if (node.kind === 'app' && node.project) {
        if (window.WindowManager) {
          window.WindowManager.open({
            url: node.project.liveUrl,
            title: node.project.title,
            project: node.project.command
          });
        }
        return;
      }
      // Text-like content — show in mini text window
      if (isTextLike(name, node) && window.TextViewer && TextViewer.open) {
        TextViewer.open(name, node);
        return;
      }
      // Fallback: dispatch via terminal cat
      if (window._terminalRef && typeof executeCommand === 'function') {
        executeCommand('/cat ' + name, window._terminalRef);
      }
    }

    function renderSidebar() {
      sidebar.innerHTML = '';
      var entries = [
        { label: 'Home', path: ROOT },
        { label: 'Projects', path: ROOT + '/projects', indent: 1 },
        { label: 'Docs', path: ROOT + '/docs', indent: 1 },
        { label: '.secrets', path: ROOT + '/.secrets', indent: 1, dim: true }
      ];
      for (var i = 0; i < entries.length; i++) {
        (function (e) {
          var row = document.createElement('button');
          row.type = 'button';
          row.className = 'files-side' + (e.dim ? ' dim' : '');
          if (e.indent) row.style.paddingLeft = (12 + e.indent * 12) + 'px';
          row.textContent = e.label;
          row.addEventListener('click', function () { navigate(e.path, true); });
          sidebar.appendChild(row);
        })(entries[i]);
      }
    }

    // Toolbar wiring
    c.querySelector('.files-back').addEventListener('click', function () {
      if (historyIdx > 0) { historyIdx--; navigate(history[historyIdx], false); }
    });
    c.querySelector('.files-fwd').addEventListener('click', function () {
      if (historyIdx < history.length - 1) { historyIdx++; navigate(history[historyIdx], false); }
    });
    c.querySelector('.files-up').addEventListener('click', function () {
      var parts = current.split('/').filter(Boolean);
      parts.pop();
      var p = '/' + parts.join('/');
      if (!p || p === '/') p = '/';
      navigate(p, true);
    });
    c.querySelector('.files-refresh').addEventListener('click', function () {
      navigate(current, false);
    });
    addr.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        var v = addr.value.trim();
        if (v.charAt(0) === '~') v = ROOT + v.slice(1);
        navigate(v, true);
      }
    });

    renderSidebar();
    history = [current];
    historyIdx = 0;
    addr.value = current.replace(ROOT, '~') || '~';
    var node = window.FS && window.FS.lookup(current);
    if (node) renderGrid(node);
    updateNav();

    return c;
  }

  function open(initialPath) {
    if (!window.WindowManager) return;
    var existing = WindowManager.byApp('files');
    if (existing && existing.length) {
      WindowManager.bringToFront(existing[0].id);
      return existing[0].id;
    }
    return WindowManager.open({
      app: 'files',
      title: 'Files',
      content: buildContent(initialPath || ROOT),
      w: 720,
      h: 500,
      menubar: [
        { label: 'File', items: [
          { label: 'New folder', disabled: true },
          { label: 'Open in terminal', action: function () {
            if (window.PaneToggle && PaneToggle.show) PaneToggle.show('terminal');
          }},
          '---',
          { label: 'Close', shortcut: 'Ctrl+W', action: function () {
            var ex = WindowManager.byApp('files');
            if (ex.length) WindowManager.close(ex[0].id);
          }}
        ]},
        { label: 'View', items: [
          { label: 'Refresh', shortcut: 'F5', action: function () {
            var ex = WindowManager.byApp('files');
            if (ex.length) { WindowManager.close(ex[0].id); open(); }
          }}
        ]},
        { label: 'Help', items: [
          { label: 'About Files', disabled: true }
        ]}
      ],
      statusbar: 'Loading...'
    });
  }

  // Text viewer mini-app
  function openText(name, node) {
    if (!window.WindowManager) return;
    var content = document.createElement('pre');
    content.className = 'text-viewer-body';

    // Resolve text content: based on node.kind
    var text = '';
    if (node.kind === 'about') {
      var p = (window.Persona && Persona.get) ? Persona.get() : null;
      if (p) text = p.name + '\n' + p.role + ' · ' + p.location + '\n\n' + (p.tagline || '');
    } else if (node.kind === 'contact') {
      var p2 = (window.Persona && Persona.get) ? Persona.get() : null;
      if (p2 && p2.contact) text = 'github: ' + p2.contact.github + '\nlinkedin: ' + p2.contact.linkedin + '\nemail: ' + p2.contact.email;
    } else if (node.kind === 'resume') {
      text = '# Resume\n\nRun /resume in the terminal for the formatted version.\n';
    } else if (node.kind === 'doc' && node.project) {
      var pp = node.project;
      text = '# ' + pp.title + '\n\n' + (pp.tagline || '') + '\n\nStack: ' + (pp.stack || 'n/a') + '\n\nLive: ' + pp.liveUrl + '\nSource: ' + pp.sourceUrl;
    } else if (node.kind === 'secret') {
      text = node.content || '(redacted)';
    } else if (node.content) {
      text = node.content;
    } else {
      text = '(empty)';
    }
    content.textContent = text;

    return WindowManager.open({
      app: 'text-viewer',
      title: name,
      content: content,
      w: 480,
      h: 380,
      menubar: [
        { label: 'File', items: [
          { label: 'Close', shortcut: 'Ctrl+W', action: function () {
            var ex = WindowManager.byApp('text-viewer');
            if (ex.length) WindowManager.close(ex[ex.length - 1].id);
          }}
        ]}
      ],
      statusbar: text.length + ' chars'
    });
  }

  window.FilesApp = { open: open };
  window.TextViewer = { open: openText };
})();
