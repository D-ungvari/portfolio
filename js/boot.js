/**
 * Boot sequence — two-stage DavOS boot.
 *
 * Stage 1: BIOS-style splash overlay (0–800ms)
 * Stage 2: systemd-style log streamed into the terminal pane (800–1600ms)
 *
 * Skippable on any keydown / click on the splash.
 * Honors prefers-reduced-motion.
 *
 * Exports (globals): WELCOME_ASCII, getTimeGreeting, showWelcome, runBoot
 */

var WELCOME_ASCII = [
  ' ██████╗  █████╗ ██╗   ██╗███████╗',
  ' ██╔══██╗██╔══██╗██║   ██║██╔════╝',
  ' ██║  ██║███████║██║   ██║█████╗  ',
  ' ██║  ██║██╔══██║╚██╗ ██╔╝██╔══╝  ',
  ' ██████╔╝██║  ██║ ╚████╔╝ ███████╗',
  ' ╚═════╝ ╚═╝  ╚═╝  ╚═══╝  ╚══════╝'
];

function getTimeGreeting() {
  var hour = new Date().getHours();
  if (hour < 6) return 'burning the midnight oil?';
  if (hour < 12) return 'good morning.';
  if (hour < 17) return 'good afternoon.';
  if (hour < 21) return 'good evening.';
  return 'working late?';
}

function showWelcome(terminal) {
  terminal.output('');
  if (window.Neofetch && typeof Neofetch.render === 'function') {
    Neofetch.render(terminal);
  } else {
    for (var i = 0; i < WELCOME_ASCII.length; i++) {
      terminal.output(WELCOME_ASCII[i], 'ascii');
    }
  }
  terminal.output('');
  terminal.output(' ' + getTimeGreeting(), 'dim');
  terminal.output('');
  terminal.output(' type /help to see available commands.', 'dim');
  terminal.output('');
}

function runBoot(terminal, callback) {
  // Resolve dynamic content for systemd lines
  var projectCount = (typeof projects !== 'undefined' && projects && projects.length)
    ? projects.length
    : 7;
  var themeName = (typeof currentTheme !== 'undefined' && currentTheme)
    ? currentTheme
    : 'catppuccin';

  var systemdLines = [
    'Started NetworkManager.service',
    'Mounted /home/visitor/projects (' + projectCount + ' entries)',
    'Loaded theme unit: ' + themeName + '.target',
    { kind: 'fail', text: 'Started user motivation.service' },
    { kind: 'ok', text: 'Started user motivation.service (after coffee)' },
    'Reached target Graphical Interface'
  ];

  // B32: Inject returning-visitor restore line before "Reached target"
  if (window.Lore && typeof window.Lore.formatReturningLine === 'function') {
    var ret = window.Lore.formatReturningLine();
    if (ret) systemdLines.splice(systemdLines.length - 1, 0, ret);
  }

  function lineText(line) { return typeof line === 'string' ? line : line.text; }
  function lineKind(line) { return typeof line === 'string' ? 'ok' : (line.kind || 'ok'); }

  var prefersReducedMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var desktopPane = document.getElementById('desktop-pane');

  // Reduced motion: skip splash entirely. Output everything in one batch.
  if (prefersReducedMotion) {
    if (desktopPane) {
      desktopPane.classList.remove('booting');
      desktopPane.classList.add('booted');
    }
    for (var i = 0; i < systemdLines.length; i++) {
      var k = lineKind(systemdLines[i]);
      var label = k === 'fail' ? '<span class="error">[ FAIL ]</span>' : '<span class="ok">[  OK  ]</span>';
      terminal.outputHTML(label + ' ' + lineText(systemdLines[i]));
    }
    showWelcome(terminal);
    terminal.output(' tip: double-click an icon to launch a project, or type /help', 'dim');
    terminal.output('');
    callback();
    return;
  }

  terminal.deactivateInput();
  if (desktopPane) {
    desktopPane.classList.add('booting');
  }

  // ----- Stage 1: BIOS POST splash -----
  var splash = document.createElement('div');
  splash.id = 'boot-splash';
  splash.setAttribute('role', 'status');
  splash.setAttribute('aria-label', 'Booting DavOS');
  document.body.appendChild(splash);
  var splashLog = renderStage1Splash(splash);
  var stage1PostTimers = streamPostLines(splashLog);

  // State tracking — prevent double-fire if skipped mid-flight
  var skipped = false;
  var grubStarted = false;
  var stage2Started = false;
  var finished = false;
  var stage1Timer = null;
  var grubTimers = [];
  var stage2Timers = [];
  var finalTimer = null;
  var lineIndex = 0;

  function clearAllTimers() {
    if (stage1Timer) { clearTimeout(stage1Timer); stage1Timer = null; }
    if (stage1PostTimers && stage1PostTimers.length) {
      for (var p = 0; p < stage1PostTimers.length; p++) {
        clearTimeout(stage1PostTimers[p]);
      }
      stage1PostTimers = [];
    }
    for (var g = 0; g < grubTimers.length; g++) clearTimeout(grubTimers[g]);
    grubTimers = [];
    for (var t = 0; t < stage2Timers.length; t++) {
      clearTimeout(stage2Timers[t]);
    }
    stage2Timers = [];
    if (finalTimer) { clearTimeout(finalTimer); finalTimer = null; }
  }

  function detachSkipListeners() {
    document.removeEventListener('keydown', onSkip, true);
    if (splash) {
      splash.removeEventListener('click', onSkip, true);
    }
  }

  function renderSystemdLine(line) {
    var k = lineKind(line);
    var label = k === 'fail' ? '<span class="error">[ FAIL ]</span>' : '<span class="ok">[  OK  ]</span>';
    terminal.outputHTML(label + ' ' + lineText(line));
  }

  function finishBoot() {
    if (finished) return;
    finished = true;
    detachSkipListeners();

    // Render any remaining systemd lines instantly (in case of skip)
    while (lineIndex < systemdLines.length) {
      renderSystemdLine(systemdLines[lineIndex]);
      lineIndex++;
    }

    // Fade out splash, then remove from DOM
    if (splash && splash.parentNode) {
      splash.classList.add('fading');
      setTimeout(function() {
        if (splash && splash.parentNode) {
          splash.parentNode.removeChild(splash);
        }
      }, 400);
    }

    var revealDesktop = function () {
      if (desktopPane) {
        desktopPane.classList.remove('booting');
        desktopPane.classList.add('booted');
      }
      // Staggered icon entrance
      try {
        var icons = document.querySelectorAll('#icon-grid .desktop-icon');
        for (var ii = 0; ii < icons.length; ii++) {
          (function (icon, idx) {
            icon.style.opacity = '0';
            icon.style.transform = 'scale(0.92)';
            setTimeout(function () {
              icon.style.transition = 'opacity 200ms ease-out, transform 200ms cubic-bezier(0.2,0.8,0.2,1)';
              icon.style.opacity = '';
              icon.style.transform = '';
            }, 60 + idx * 30);
          })(icons[ii], ii);
        }
        // Taskbar slide-down
        var tb = document.getElementById('taskbar');
        if (tb && window.Anim) window.Anim.slideIn(tb, 'down', { dur: 220, distance: 16 });
      } catch (e) {}
      showWelcome(terminal);
      terminal.output(' tip: double-click an icon to launch a project, or type /help', 'dim');
      terminal.output('');
      callback();
    };

    // First-visit login screen
    if (window.LoginScreen && LoginScreen.shouldShow && LoginScreen.shouldShow()) {
      // Bump visitCount so future loads skip
      try {
        if (window.Session && Session.set) {
          var c = (Session.get && Session.get('visitCount')) || 0;
          Session.set('visitCount', c + 1);
        }
      } catch (e) {}
      LoginScreen.show(revealDesktop);
    } else {
      revealDesktop();
    }
  }

  function startGrub() {
    if (grubStarted || skipped || finished) return;
    grubStarted = true;
    if (!splash || !splash.parentNode) { startStage2(); return; }
    splash.classList.add('grub');
    splash.innerHTML =
      '<div class="grub-header">GNU GRUB  version 2.06</div>' +
      '<div class="grub-menu">' +
        '<div class="grub-row selected">*Arch Linux</div>' +
        '<div class="grub-row"> Advanced options for Arch Linux</div>' +
        '<div class="grub-row"> Memory test (memtest86+)</div>' +
      '</div>' +
      '<div class="grub-help">Use ↑/↓ keys. Default boots in <span id="grub-countdown">3</span>.</div>' +
      '<div class="splash-skip">press any key to skip</div>';
    var n = 3;
    function tick() {
      if (skipped || finished) return;
      n--;
      var cd = document.getElementById('grub-countdown');
      if (cd) cd.textContent = String(Math.max(0, n));
      if (n <= 0) { startStage2(); return; }
      var t = setTimeout(tick, 250);
      grubTimers.push(t);
    }
    var t0 = setTimeout(tick, 250);
    grubTimers.push(t0);
  }

  function startStage2() {
    if (stage2Started) return;
    stage2Started = true;
    // Reset the splash to its booting look so systemd lines stream cleanly
    if (splash && splash.parentNode) splash.classList.remove('grub');

    function streamNextLine() {
      if (skipped || finished) return;
      if (lineIndex >= systemdLines.length) {
        finalTimer = setTimeout(finishBoot, 150);
        return;
      }
      renderSystemdLine(systemdLines[lineIndex]);
      lineIndex++;
      var t = setTimeout(streamNextLine, 150);
      stage2Timers.push(t);
    }

    streamNextLine();
  }

  function onSkip() {
    if (skipped || finished) return;
    skipped = true;
    clearAllTimers();
    finishBoot();
  }

  // E11 — DEL during POST opens BIOS SETUP. Listener active only during the
  // POST window; detached the moment we leave stage 1.
  var biosListener = function (e) {
    if (e.key !== 'Delete' && e.key !== 'F2') return;
    if (skipped || finished || stage2Started || grubStarted) return;
    if (window.Anim && Anim.reduced && Anim.reduced()) return;
    e.preventDefault();
    document.removeEventListener('keydown', biosListener, true);
    enterBIOS();
  };
  document.addEventListener('keydown', biosListener, true);

  function enterBIOS() {
    // Pause POST animation
    clearAllTimers();
    if (!splash || !splash.parentNode) return;
    splash.classList.add('bios');
    splash.innerHTML = '';
    var ui = renderBiosSetup(splash, function exitBack() {
      // Restore stage1 splash, then proceed straight to GRUB
      if (splash && splash.parentNode) {
        splash.classList.remove('bios');
        splash.innerHTML = '';
        renderStage1Splash(splash);
        // Skip ahead to GRUB
        startGrub();
      }
      document.addEventListener('keydown', onSkip, true);
      if (splash) splash.addEventListener('click', onSkip, true);
    });
    // Detach normal skip listeners while BIOS is up
    detachSkipListeners();
  }

  document.addEventListener('keydown', onSkip, true);
  splash.addEventListener('click', onSkip, true);

  // After GRUB starts (or POST window passes) detach BIOS listener
  setTimeout(function () {
    document.removeEventListener('keydown', biosListener, true);
  }, 850);

  // Stage 1 → GRUB transition at 800ms; GRUB → Stage 2 after countdown
  stage1Timer = setTimeout(function() {
    stage1Timer = null;
    if (skipped || finished) return;
    startGrub();
  }, 800);
}

/**
 * Builds the BIOS-POST splash scaffold and returns the log container
 * where streaming lines are appended.
 */
function renderStage1Splash(splashEl) {
  splashEl.innerHTML =
    '<div class="splash-title">Arch Linux UEFI stub</div>' +
    '<div class="splash-copyright">Copyright (c) 2026 Dave Ungvari Industries</div>' +
    '<div class="splash-spacer"></div>' +
    '<div id="splash-log"></div>' +
    '<div class="splash-skip">press any key to skip</div>';
  return splashEl.querySelector('#splash-log');
}

/**
 * Streams BIOS POST diagnostic lines into the log container over ~700ms.
 * Returns an array of timer ids the caller can clear if the splash is skipped.
 */
function streamPostLines(logEl) {
  var lines = [
    { delay:   50, text: 'Detecting hardware...' },
    { delay:  140, text: '  CPU: Intel i7-1370P                      <span class="ok">[ ok ]</span>' },
    { delay:  220, text: '  Memory test: 0x00000000-0xFFFFFFFF       <span id="mem-bar">[░░░░░░░░]</span> <span id="mem-pct">  0%</span>',
      animate: function () { return animateMemBar(); }
    },
    { delay:  410, text: '  262144K OK' },
    { delay:  470, text: '  Probing NVMe0: /dev/nvme0n1              <span class="ok">[ ok ]</span>' },
    { delay:  530, text: '  Probing EFI variables                    <span class="ok">[ ok ]</span>' },
    { delay:  590, text: '  Probing USB: keyboard, mouse             <span class="ok">[ ok ]</span>' },
    { delay:  650, text: '  Probing display: tty1                    <span class="ok">[ ok ]</span>' },
    { delay:  710, text: '  Loading initramfs-linux.img              <span class="ok">[ ok ]</span>' }
  ];
  var timers = [];
  for (var i = 0; i < lines.length; i++) {
    (function (line) {
      var id = setTimeout(function () {
        if (!logEl.parentNode) return;  // splash was removed (skipped)
        var div = document.createElement('div');
        div.className = 'splash-line';
        div.innerHTML = line.text;
        logEl.appendChild(div);
        if (line.animate) line.animate();
      }, line.delay);
      timers.push(id);
    })(lines[i]);
  }
  return timers;
}

/**
 * BIOS SETUP — sprint E E11. Renders a fake AMI/Phoenix-ish 4-tab UI inside
 * the supplied container element. Returns a small handle exposing exit().
 *
 * Captures keyboard navigation: ←/→ tabs, ↑/↓ rows, +/- modify (cosmetic),
 * Esc exits via `onExit` callback.
 */
function renderBiosSetup(container, onExit) {
  var TABS = [
    { id: 'main', label: 'Main', items: [
      { label: 'System Time',     value: '13:37:00' },
      { label: 'System Date',     value: '04/29/2026' },
      { label: 'BIOS Version',    value: 'DavOS BIOS v1.0' },
      { label: 'Memory',          value: '262144K' },
      { label: 'Coffee Level',    value: 'Critical' }
    ]},
    { id: 'advanced', label: 'Advanced', items: [
      { label: 'CPU Configuration',    value: '▸' },
      { label: 'SATA Configuration',   value: '▸' },
      { label: 'USB Configuration',    value: '▸' },
      { label: 'Snark Mode',           value: '[Enabled]' },
      { label: 'Daylight Saving',      value: '[Whatever]' }
    ]},
    { id: 'boot', label: 'Boot', items: [
      { label: '1st Boot Device',  value: 'DavOS HDD' },
      { label: '2nd Boot Device',  value: 'USB' },
      { label: '3rd Boot Device',  value: 'Network' },
      { label: '4th Boot Device',  value: 'Coffee Maker' },
      { label: 'Boot Speed',       value: '[Caffeinated]' }
    ]},
    { id: 'exit', label: 'Exit', items: [
      { label: 'Save Changes and Exit',     action: true },
      { label: 'Discard Changes and Exit',  action: true },
      { label: 'Restore Defaults',          action: true }
    ]}
  ];
  var tabIdx = 0;
  var rowIdx = 0;

  function render() {
    var tabRow = '';
    for (var t = 0; t < TABS.length; t++) {
      tabRow += '<span class="bios-tab' + (t === tabIdx ? ' active' : '') + '">' + TABS[t].label + '</span>';
    }
    var rows = '';
    var items = TABS[tabIdx].items;
    for (var i = 0; i < items.length; i++) {
      var sel = i === rowIdx ? ' selected' : '';
      rows += '<div class="bios-row' + sel + '">' +
              '<span class="bios-row-label">' + items[i].label + '</span>' +
              '<span class="bios-row-value">' + (items[i].value || '') + '</span>' +
              '</div>';
    }
    container.innerHTML =
      '<div class="bios-frame">' +
        '<div class="bios-titlebar">DavOS BIOS Setup Utility</div>' +
        '<div class="bios-tabs">' + tabRow + '</div>' +
        '<div class="bios-body">' + rows + '</div>' +
        '<div class="bios-footer">' +
          '<span>↑↓ Select</span>' +
          '<span>←→ Tab</span>' +
          '<span>+/- Modify</span>' +
          '<span>Enter Confirm</span>' +
          '<span>ESC Exit</span>' +
        '</div>' +
      '</div>';
  }

  function onKey(e) {
    if (e.key === 'Escape') {
      e.preventDefault();
      cleanup();
      if (onExit) onExit();
      return;
    }
    if (e.key === 'ArrowLeft')  { tabIdx = (tabIdx - 1 + TABS.length) % TABS.length; rowIdx = 0; e.preventDefault(); render(); }
    else if (e.key === 'ArrowRight') { tabIdx = (tabIdx + 1) % TABS.length; rowIdx = 0; e.preventDefault(); render(); }
    else if (e.key === 'ArrowUp')   { rowIdx = (rowIdx - 1 + TABS[tabIdx].items.length) % TABS[tabIdx].items.length; e.preventDefault(); render(); }
    else if (e.key === 'ArrowDown') { rowIdx = (rowIdx + 1) % TABS[tabIdx].items.length; e.preventDefault(); render(); }
    else if (e.key === 'Enter') {
      var item = TABS[tabIdx].items[rowIdx];
      if (item && item.action) { e.preventDefault(); cleanup(); if (onExit) onExit(); }
    }
  }

  function cleanup() {
    document.removeEventListener('keydown', onKey, true);
  }

  document.addEventListener('keydown', onKey, true);
  render();
  return { exit: function () { cleanup(); if (onExit) onExit(); } };
}

// Test hook — exposed only when running under jsdom (no `location.reload`).
if (typeof window !== 'undefined') {
  window.BootDebug = window.BootDebug || {};
  window.BootDebug.renderBiosSetup = renderBiosSetup;
}

/**
 * Animates the memory-test bar from empty to full over ~150ms in 8 steps.
 */
function animateMemBar() {
  var bar = document.getElementById('mem-bar');
  var pct = document.getElementById('mem-pct');
  if (!bar || !pct) return;
  var steps = 8;
  for (var s = 1; s <= steps; s++) {
    (function (n) {
      setTimeout(function () {
        if (!bar.parentNode) return;
        var fill = '';
        var empty = '';
        for (var f = 0; f < n; f++) fill += '█';
        for (var e = 0; e < steps - n; e++) empty += '░';
        bar.textContent = '[' + fill + empty + ']';
        var p = Math.round((n / steps) * 100);
        pct.textContent = ('   ' + p + '%').slice(-4);
      }, n * 18);
    })(s);
  }
}
