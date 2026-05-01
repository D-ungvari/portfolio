/**
 * HashRouter - maps filesystem-looking URL hashes to terminal commands.
 */
(function () {
  'use strict';

  var routes = {
    '#/~/projects': { cmd: '/projects', title: '~/projects' },
    '#/~/.config/about': { cmd: '/about', title: '~/.config/about' },
    '#/~/.config/contact': { cmd: '/contact', title: '~/.config/contact' },
    '#/~/dotfiles': { cmd: '/dotfiles', title: '~/dotfiles' }
  };

  var commandRoutes = {
    '/projects': '#/~/projects',
    '/about': '#/~/.config/about',
    '/contact': '#/~/.config/contact',
    '/dotfiles': '#/~/dotfiles'
  };

  var suppressNext = false;

  function normalize(hash) {
    hash = hash || window.location.hash || '';
    try { hash = decodeURIComponent(hash); } catch (e) {}
    if (hash && hash.charAt(0) !== '#') hash = '#' + hash;
    return hash;
  }

  function updateTitle(title) {
    document.title = (title || '~') + ' — dave';
  }

  function routeForCommand(raw) {
    var cmd = String(raw || '').trim().toLowerCase();
    var hash = commandRoutes[cmd];
    return hash ? { hash: hash, cmd: cmd, title: routes[hash].title } : null;
  }

  function handle(hash, terminal) {
    hash = normalize(hash);
    if (!hash) return false;
    var route = routes[hash];
    if (route) {
      updateTitle(route.title);
      if (terminal && typeof executeCommand === 'function') executeCommand(route.cmd, terminal);
      return true;
    }
    if (hash.indexOf('#/') === 0 && terminal && terminal.output) {
      var path = hash.slice(2) || '~';
      updateTitle(path);
      terminal.output('bash: cd: ' + path + ': No such file or directory', 'error');
    }
    return false;
  }

  function navigateForCommand(raw) {
    var route = routeForCommand(raw);
    if (!route) return false;
    updateTitle(route.title);
    if (window.location.hash !== route.hash) {
      suppressNext = true;
      window.location.hash = route.hash;
    }
    return true;
  }

  function bind(terminal, opts) {
    opts = opts || {};
    window.addEventListener('hashchange', function () {
      if (suppressNext) {
        suppressNext = false;
        return;
      }
      handle(window.location.hash, terminal);
    });
    if (opts.runInitial) handle(window.location.hash, terminal);
  }

  window.HashRouter = {
    routes: routes,
    bind: bind,
    handle: handle,
    normalize: normalize,
    routeForCommand: routeForCommand,
    navigateForCommand: navigateForCommand,
    updateTitle: updateTitle
  };
})();
