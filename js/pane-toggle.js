(function() {
  var STORAGE_KEY_ACTIVE = 'portfolio-active-pane';
  var STORAGE_KEY_COLLAPSED = 'portfolio-terminal-collapsed';
  var MOBILE_BREAKPOINT = 640;

  function isMobile() {
    return window.innerWidth < MOBILE_BREAKPOINT;
  }

  function setActive(pane) {
    if (pane !== 'desktop' && pane !== 'terminal') return;
    document.body.setAttribute('data-active-pane', pane);
    try { localStorage.setItem(STORAGE_KEY_ACTIVE, pane); } catch (e) {}
    var buttons = document.querySelectorAll('#pane-toggle button');
    for (var i = 0; i < buttons.length; i++) {
      var btnPane = buttons[i].getAttribute('data-pane');
      var active = btnPane === pane;
      buttons[i].classList.toggle('active', active);
      buttons[i].setAttribute('aria-selected', active ? 'true' : 'false');
    }
    // Focus management
    if (pane === 'terminal') {
      var inp = document.getElementById('command-input');
      if (inp) try { inp.focus(); } catch (e) {}
    }
  }

  function getActive() {
    return document.body.getAttribute('data-active-pane') || 'desktop';
  }

  // Desktop terminal-pane collapse (Ctrl+`)
  var collapsed = false;
  function setCollapsed(state) {
    collapsed = !!state;
    if (collapsed) {
      document.documentElement.style.setProperty('--terminal-width', '0px');
      var divider = document.getElementById('pane-divider');
      if (divider) divider.style.display = 'none';
    } else {
      // Restore from saved width
      var saved = null;
      try { saved = localStorage.getItem('portfolio-terminal-width'); } catch (e) {}
      document.documentElement.style.setProperty('--terminal-width', saved || '40%');
      var divider2 = document.getElementById('pane-divider');
      if (divider2) divider2.style.display = '';
    }
    try { localStorage.setItem(STORAGE_KEY_COLLAPSED, collapsed ? '1' : '0'); } catch (e) {}
  }

  function toggleCollapsed() {
    if (isMobile()) return; // collapse only on desktop
    setCollapsed(!collapsed);
  }

  function init() {
    // Mobile tab buttons
    var toggle = document.getElementById('pane-toggle');
    if (toggle) {
      toggle.addEventListener('click', function(e) {
        var btn = e.target.closest && e.target.closest('button[data-pane]');
        if (!btn) return;
        setActive(btn.getAttribute('data-pane'));
      });
      // Keyboard: Left/Right arrows on the tablist
      toggle.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
          e.preventDefault();
          setActive(getActive() === 'desktop' ? 'terminal' : 'desktop');
        }
      });
    }

    // Restore saved active pane (mobile only)
    var saved = null;
    try { saved = localStorage.getItem(STORAGE_KEY_ACTIVE); } catch (e) {}
    setActive(saved || 'desktop');

    // Restore collapsed state (desktop only)
    var savedCollapsed = null;
    try { savedCollapsed = localStorage.getItem(STORAGE_KEY_COLLAPSED); } catch (e) {}
    if (savedCollapsed === '1' && !isMobile()) {
      setCollapsed(true);
    }

    // Ctrl+` toggle terminal collapse
    document.addEventListener('keydown', function(e) {
      if (e.ctrlKey && (e.key === '`' || e.key === '~')) {
        e.preventDefault();
        toggleCollapsed();
      }
    });
  }

  if (typeof window !== 'undefined') {
    window.PaneToggle = {
      show: setActive,
      get: getActive,
      toggleCollapsed: toggleCollapsed,
      isCollapsed: function() { return collapsed; }
    };
    if (document.readyState !== 'loading') init();
    else document.addEventListener('DOMContentLoaded', init);
  }
})();
