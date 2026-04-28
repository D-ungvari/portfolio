/**
 * Taskbar — live clock, theme dropdown, "About this PC" panel.
 */
(function() {
  var clockEl = null;
  var clockTimer = null;
  var themeBtn = null;
  var openMenu = null;

  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  function updateClock() {
    if (!clockEl) return;
    var d = new Date();
    clockEl.textContent = pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
  }

  function startClock() {
    updateClock();
    clockTimer = setInterval(updateClock, 1000);
  }

  function closeMenu() {
    if (openMenu && openMenu.parentNode) openMenu.parentNode.removeChild(openMenu);
    openMenu = null;
    document.removeEventListener('click', onDocClick, true);
    document.removeEventListener('keydown', onKeydown, true);
  }

  function onDocClick(e) {
    if (openMenu && !openMenu.contains(e.target) && e.target !== themeBtn) closeMenu();
  }
  function onKeydown(e) {
    if (e.key === 'Escape') closeMenu();
  }

  function showThemeMenu(anchor) {
    closeMenu();
    if (typeof themes === 'undefined') return;
    var rect = anchor.getBoundingClientRect();
    var menu = document.createElement('div');
    menu.className = 'taskbar-menu';
    menu.setAttribute('role', 'menu');
    var names = Object.keys(themes);
    for (var i = 0; i < names.length; i++) {
      (function(name) {
        var item = document.createElement('div');
        item.className = 'taskbar-menu-item' + (name === currentTheme ? ' active' : '');
        item.setAttribute('role', 'menuitemradio');
        var label = document.createElement('span');
        label.textContent = name;
        var check = document.createElement('span');
        check.className = 'check';
        check.textContent = '✓';
        item.appendChild(label);
        item.appendChild(check);
        item.addEventListener('click', function(ev) {
          ev.stopPropagation();
          if (typeof applyTheme === 'function') applyTheme(name, ev.clientX, ev.clientY);
          if (window._terminalRef && typeof window._terminalRef.output === 'function') {
            window._terminalRef.output('> theme set to ' + name + '.', 'accent');
          }
          closeMenu();
        });
        menu.appendChild(item);
      })(names[i]);
    }
    document.body.appendChild(menu);
    var top = rect.bottom + 4;
    var left = rect.left;
    if (left + menu.offsetWidth > window.innerWidth - 8) {
      left = window.innerWidth - menu.offsetWidth - 8;
    }
    menu.style.left = left + 'px';
    menu.style.top = top + 'px';
    openMenu = menu;
    setTimeout(function() {
      document.addEventListener('click', onDocClick, true);
      document.addEventListener('keydown', onKeydown, true);
    }, 0);
  }

  // ----- About panel -----
  var aboutOverlay = null;

  function closeAbout() {
    if (aboutOverlay && aboutOverlay.parentNode) {
      aboutOverlay.parentNode.removeChild(aboutOverlay);
    }
    aboutOverlay = null;
    document.removeEventListener('keydown', onAboutKeydown, true);
  }
  function onAboutKeydown(e) {
    if (e.key === 'Escape') closeAbout();
  }

  function showAbout() {
    if (aboutOverlay) return;
    aboutOverlay = document.createElement('div');
    aboutOverlay.className = 'about-overlay';
    aboutOverlay.innerHTML =
      '<div class="about-panel" role="dialog" aria-label="About this PC">' +
        '<button class="about-close" aria-label="Close">×</button>' +
        '<h2>About this PC</h2>' +
        '<div class="about-subtitle">DavOS v1.0 · running on coffee</div>' +
        '<div class="about-section">' +
          '<h3>OWNER</h3>' +
          '<ul>' +
            '<li>Dave Ungvari</li>' +
            '<li class="dim">Full-stack developer @ Omada A/S · Copenhagen, DK</li>' +
            '<li class="dim">Languages: English, Danish, Hungarian</li>' +
          '</ul>' +
        '</div>' +
        '<div class="about-section">' +
          '<h3>CURRENTLY SHIPPING</h3>' +
          '<ul>' +
            '<li>React · TypeScript · GraphQL</li>' +
            '<li>C# · .NET · SQL Server</li>' +
          '</ul>' +
        '</div>' +
        '<div class="about-section">' +
          '<h3>RECENTLY SHIPPED (SIDE)</h3>' +
          '<ul>' +
            '<li>Next.js · PostgreSQL · pgvector · Claude API · RAG</li>' +
            '<li>TypeScript · PixiJS · Vite · ECS</li>' +
            '<li>Vanilla JS · Canvas 2D · zero deps</li>' +
          '</ul>' +
        '</div>' +
        '<div class="about-section">' +
          '<h3>CONTACT</h3>' +
          '<ul>' +
            '<li><a href="https://github.com/D-ungvari" target="_blank" rel="noopener">github.com/D-ungvari</a></li>' +
            '<li><a href="https://www.linkedin.com/in/davidungvari/" target="_blank" rel="noopener">linkedin.com/in/davidungvari</a></li>' +
            '<li><a href="mailto:qkaturo95@gmail.com">qkaturo95@gmail.com</a></li>' +
          '</ul>' +
        '</div>' +
      '</div>';
    document.body.appendChild(aboutOverlay);
    aboutOverlay.querySelector('.about-close').addEventListener('click', closeAbout);
    aboutOverlay.addEventListener('click', function(e) {
      if (e.target === aboutOverlay) closeAbout();  // backdrop click
    });
    document.addEventListener('keydown', onAboutKeydown, true);
  }

  // ----- Init: build the dynamic taskbar UI -----
  function init() {
    clockEl = document.getElementById('taskbar-clock');
    var taskbarRight = document.getElementById('taskbar-right');
    var osLabel = document.getElementById('taskbar-os-label');

    // Inject theme button into #taskbar-right (before clock)
    if (taskbarRight && clockEl) {
      themeBtn = document.createElement('button');
      themeBtn.id = 'taskbar-theme-btn';
      themeBtn.type = 'button';
      themeBtn.setAttribute('aria-haspopup', 'menu');
      themeBtn.setAttribute('aria-label', 'Switch theme');
      themeBtn.textContent = 'theme ▾';
      taskbarRight.insertBefore(themeBtn, clockEl);
      themeBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        if (openMenu) closeMenu();
        else showThemeMenu(themeBtn);
      });

      // System tray cluster — net rate, volume, battery, EQ
      var tray = document.createElement('div');
      tray.id = 'taskbar-tray';
      tray.innerHTML =
        '<span class="tray-item tray-net" title="Network">↑↓ <span class="tray-rate">0.0M/s</span></span>' +
        '<span class="tray-item tray-vol" title="Volume">▮▮▮▯▯</span>' +
        '<span class="tray-item tray-bat" title="Battery">[█████] 100%</span>' +
        '<span class="tray-item tray-eq" title="Audio">' +
          '<span class="bar"></span><span class="bar"></span><span class="bar"></span>' +
          '<span class="bar"></span><span class="bar"></span><span class="bar"></span>' +
        '</span>';
      taskbarRight.insertBefore(tray, clockEl);

      var netRateEl = tray.querySelector('.tray-rate');
      function tickNetRate() {
        if (!netRateEl) return;
        var rate = (Math.random() * 3 + 0.1).toFixed(1);
        netRateEl.textContent = rate + 'M/s';
      }
      setInterval(tickNetRate, 2000);
      tickNetRate();

      var bat = 100;
      var batEl = tray.querySelector('.tray-bat');
      function tickBat() {
        bat = Math.max(0, bat - 1);
        if (bat === 0) bat = 100;
        if (!batEl) return;
        var cells = 5;
        var filled = Math.round((bat / 100) * cells);
        var bar = '█'.repeat(filled) + '░'.repeat(cells - filled);
        batEl.textContent = '[' + bar + '] ' + bat + '%';
      }
      setInterval(tickBat, 60000);

      var bell = document.createElement('button');
      bell.id = 'taskbar-notify-bell';
      bell.type = 'button';
      bell.setAttribute('aria-label', 'Notifications');
      bell.innerHTML = '<span class="bell-icon">⌗</span><span class="notify-badge"></span>';
      taskbarRight.insertBefore(bell, clockEl);
      if (window.Notify) window.Notify.setBell(bell);
    }

    if (osLabel) {
      osLabel.setAttribute('role', 'button');
      osLabel.setAttribute('tabindex', '0');
      osLabel.setAttribute('aria-label', 'About this PC');
      osLabel.addEventListener('click', showAbout);
      osLabel.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); showAbout(); }
      });
    }

    startClock();
  }

  if (typeof window !== 'undefined') {
    window.Taskbar = { init: init, showAbout: showAbout, closeAbout: closeAbout };
    if (document.readyState !== 'loading') init();
    else document.addEventListener('DOMContentLoaded', init);
  }
})();
