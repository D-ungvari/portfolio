/**
 * In-memory filesystem at ~/projects/ — Sprint B Phase 7 (B35a).
 *
 * Replaces the stub /ls /cat /pwd from easter-eggs.js with a real fake FS.
 * Adds /cd, /tree, /open. Persists cwd across reload via Session.
 *
 * Wraps executeCommand once to handle commands with arguments (cd, ls <path>,
 * cat <path>, tree <path>, open <path>, ./<file>).
 */
(function () {
  'use strict';

  var ROOT = '/home/visitor';
  var cwd = ROOT;

  // Restore cwd from session
  if (window.Session && typeof window.Session.get === 'function') {
    var saved = window.Session.get('cwd');
    if (typeof saved === 'string' && saved.indexOf('/home') === 0) cwd = saved;
  }

  function persistCwd() {
    if (window.Session && typeof window.Session.set === 'function') {
      window.Session.set('cwd', cwd);
    }
  }

  function buildTree() {
    var tree = {
      type: 'dir', children: {
        'home': { type: 'dir', children: {
          'visitor': { type: 'dir', children: {
            'about.txt': { type: 'file', kind: 'about' },
            'contact.txt': { type: 'file', kind: 'contact' },
            'resume.txt': { type: 'file', kind: 'resume' },
            'projects': { type: 'dir', children: {} },
            'docs': { type: 'dir', children: {} },
            '.secrets': { type: 'dir', children: {} }
          }}
        }}
      }
    };
    if (typeof projects !== 'undefined') {
      var projs = tree.children.home.children.visitor.children.projects.children;
      var docs = tree.children.home.children.visitor.children.docs.children;
      for (var i = 0; i < projects.length; i++) {
        var p = projects[i];
        var name = p.command.replace(/^\//, '');
        projs[name + '.app'] = { type: 'file', kind: 'app', project: p };
        docs[name + '.md'] = { type: 'file', kind: 'doc', project: p };
      }
    }
    return tree;
  }

  var fsTree = buildTree();

  function resolvePath(p) {
    if (!p || p === '~') return ROOT;
    if (p.charAt(0) === '~') p = ROOT + p.slice(1);
    if (p.charAt(0) !== '/') p = cwd + '/' + p;
    var parts = p.split('/').filter(Boolean);
    var stack = [];
    for (var i = 0; i < parts.length; i++) {
      if (parts[i] === '.') continue;
      if (parts[i] === '..') stack.pop();
      else stack.push(parts[i]);
    }
    return '/' + stack.join('/');
  }

  function lookup(path) {
    var abs = resolvePath(path);
    if (abs === '/') return fsTree;
    var parts = abs.split('/').filter(Boolean);
    var node = fsTree;
    for (var i = 0; i < parts.length; i++) {
      if (!node.children || !node.children[parts[i]]) return null;
      node = node.children[parts[i]];
    }
    return node;
  }

  function trimEnd(s) {
    return s.replace(/\s+$/, '');
  }

  function renderFile(terminal, path, node) {
    if (node.kind === 'about') {
      if (typeof commandRegistry !== 'undefined' && commandRegistry['/about']) {
        commandRegistry['/about'].handler(terminal);
      }
      return;
    }
    if (node.kind === 'contact') {
      if (typeof commandRegistry !== 'undefined' && commandRegistry['/contact']) {
        commandRegistry['/contact'].handler(terminal);
      }
      return;
    }
    if (node.kind === 'resume') {
      if (typeof commandRegistry !== 'undefined' && commandRegistry['/resume']) {
        commandRegistry['/resume'].handler(terminal);
      } else {
        terminal.output('resume command not loaded.', 'dim');
      }
      return;
    }
    if (node.kind === 'app' && node.project) {
      var p = node.project;
      terminal.output('');
      terminal.output('# ' + p.title);
      terminal.output('# ' + p.tagline);
      terminal.output('');
      terminal.output('stack: ' + p.stack);
      terminal.output('live:  ' + p.liveUrl);
      terminal.output('source: ' + p.sourceUrl);
      terminal.output('');
      var fname = path.split('/').pop();
      terminal.output('  hint: type ./' + fname + ' or /open ' + path + ' to launch.', 'dim');
      terminal.output('');
      return;
    }
    if (node.kind === 'doc' && node.project) {
      var docCmd = '/docs ' + node.project.command.replace(/^\//, '');
      if (typeof commandRegistry !== 'undefined' && commandRegistry[docCmd]) {
        commandRegistry[docCmd].handler(terminal);
      } else {
        terminal.output('docs not yet loaded for ' + node.project.title, 'dim');
      }
      return;
    }
    terminal.output('cat: cannot read special file', 'dim');
  }

  function openFile(terminal, path, node) {
    if (node.type === 'dir') {
      terminal.output('open: is a directory: ' + path, 'error');
      return;
    }
    if (node.kind === 'app' && node.project) {
      var p = node.project;
      terminal.output('> launching ' + p.title.toLowerCase() + '...', 'accent');
      if (window.Desktop && typeof window.Desktop.launchProject === 'function') {
        window.Desktop.launchProject(p);
      } else if (typeof GameOverlay !== 'undefined') {
        GameOverlay.open(p.liveUrl, p.title, terminal);
      }
      return;
    }
    renderFile(terminal, path, node);
  }

  function renderTree(terminal, node, prefix) {
    if (node.type !== 'dir') return;
    var keys = Object.keys(node.children).filter(function (n) {
      return n.charAt(0) !== '.';
    }).sort();
    for (var i = 0; i < keys.length; i++) {
      var isLast = i === keys.length - 1;
      var child = node.children[keys[i]];
      var branch = isLast ? '└── ' : '├── ';
      var nameSuffix = child.type === 'dir' ? '/' : '';
      terminal.output(prefix + branch + keys[i] + nameSuffix);
      if (child.type === 'dir') {
        var nextPrefix = prefix + (isLast ? '    ' : '│   ');
        renderTree(terminal, child, nextPrefix);
      }
    }
  }

  // Wrap executeCommand once to handle FS commands with arguments.
  if (typeof executeCommand === 'function' && !window.__fsWrapped) {
    var _origExec = executeCommand;
    executeCommand = function (rawInput, terminal) {
      var trimmed = (rawInput || '').trim();
      var lower = trimmed.toLowerCase();

      // /cd <path>
      if (lower === '/cd' || lower.indexOf('/cd ') === 0) {
        if (lower === '/cd') {
          return _origExec(rawInput, terminal);
        }
        var target = trimmed.slice(4).trim();
        if (!target || target === '~') target = ROOT;
        var abs = resolvePath(target);
        var node = lookup(abs);
        if (!node) {
          terminal.output('cd: no such directory: ' + target, 'error');
          return;
        }
        if (node.type !== 'dir') {
          terminal.output('cd: not a directory: ' + target, 'error');
          return;
        }
        if (abs.indexOf('.secrets') !== -1) {
          terminal.output('cd: permission denied', 'error');
          terminal.output('  (nice try.)', 'dim');
          return;
        }
        cwd = abs;
        persistCwd();
        return;
      }

      // /ls [path]
      if (lower === '/ls' || lower.indexOf('/ls ') === 0) {
        var lsPath = (lower === '/ls') ? cwd : trimmed.slice(4).trim();
        var lsNode = lookup(lsPath);
        if (!lsNode) {
          terminal.output('ls: no such path: ' + lsPath, 'error');
          return;
        }
        if (lsNode.type === 'file') {
          terminal.output(lsPath);
          return;
        }
        var keys = Object.keys(lsNode.children).filter(function (n) {
          return n.charAt(0) !== '.';
        }).sort();
        var line = '';
        for (var i = 0; i < keys.length; i++) {
          var child = lsNode.children[keys[i]];
          var name = keys[i] + (child.type === 'dir' ? '/' : '');
          line += name + '   ';
          if ((i + 1) % 4 === 0) {
            terminal.output(trimEnd(line));
            line = '';
          }
        }
        if (line) terminal.output(trimEnd(line));
        return;
      }

      // /cat <path>
      if (lower === '/cat' || lower.indexOf('/cat ') === 0) {
        if (lower === '/cat') return _origExec(rawInput, terminal);
        var catPath = trimmed.slice(5).trim();
        var catNode = lookup(catPath);
        if (!catNode) {
          terminal.output('cat: no such file: ' + catPath, 'error');
          return;
        }
        if (catNode.type === 'dir') {
          terminal.output('cat: is a directory: ' + catPath, 'error');
          return;
        }
        renderFile(terminal, catPath, catNode);
        return;
      }

      // /tree [path]
      if (lower === '/tree' || lower.indexOf('/tree ') === 0) {
        var rootPath = (lower === '/tree') ? cwd : trimmed.slice(6).trim();
        var rootNode = lookup(rootPath);
        if (!rootNode) {
          terminal.output('tree: no such path', 'error');
          return;
        }
        terminal.output(rootPath);
        renderTree(terminal, rootNode, '');
        return;
      }

      // /open <path>
      if (lower === '/open' || lower.indexOf('/open ') === 0) {
        if (lower === '/open') return _origExec(rawInput, terminal);
        var openPath = trimmed.slice(6).trim();
        var openNode = lookup(openPath);
        if (!openNode) {
          terminal.output('open: no such file: ' + openPath, 'error');
          return;
        }
        openFile(terminal, openPath, openNode);
        return;
      }

      // ./<filename> shorthand
      if (trimmed.indexOf('./') === 0) {
        var rel = trimmed.slice(2);
        var relNode = lookup(rel);
        if (relNode) {
          openFile(terminal, rel, relNode);
          return;
        }
      }

      return _origExec(rawInput, terminal);
    };
    window.__fsWrapped = true;
  }

  // Register commands so they appear in /help and in tab-completion.
  registerCommand('/pwd', 'print working directory', function (terminal) {
    terminal.output(cwd);
  });

  registerCommand('/cd', 'change directory', function (terminal) {
    terminal.output('usage: /cd <path>', 'dim');
    terminal.output('try: /cd ~/projects', 'dim');
  });

  registerCommand('/ls', 'list directory', function (terminal) {
    var lsNode = lookup(cwd);
    if (!lsNode || lsNode.type !== 'dir') return;
    var keys = Object.keys(lsNode.children).filter(function (n) {
      return n.charAt(0) !== '.';
    }).sort();
    terminal.output(keys.map(function (k) {
      return k + (lsNode.children[k].type === 'dir' ? '/' : '');
    }).join('   '));
  });

  registerCommand('/cat', 'print file contents', function (terminal) {
    terminal.output('usage: /cat <path>', 'dim');
  });

  registerCommand('/tree', 'show directory tree', function (terminal) {
    var node = lookup(cwd);
    if (!node) return;
    terminal.output(cwd);
    renderTree(terminal, node, '');
  });

  registerCommand('/open', 'launch a file', function (terminal) {
    terminal.output('usage: /open <path>', 'dim');
    terminal.output('try: /open ~/projects/swarm.app', 'dim');
  });

  window.FS = {
    cwd: function () { return cwd; },
    lookup: lookup,
    resolve: resolvePath
  };
})();
