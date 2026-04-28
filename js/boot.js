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
  for (var i = 0; i < WELCOME_ASCII.length; i++) {
    terminal.output(WELCOME_ASCII[i], 'ascii');
  }
  terminal.output('');
  terminal.output(' full-stack developer. browser game builder.', 'dim');
  if (window.Lore && typeof window.Lore.themeTagline === 'function') {
    terminal.output(' ' + window.Lore.themeTagline(), 'dim');
  }
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
    : 'green';

  var systemdLines = [
    'Started portfolio service',
    'Mounted /projects (' + projectCount + ' items)',
    'Loaded theme: ' + themeName,
    { kind: 'fail', text: 'Started user motivation' },
    { kind: 'ok', text: 'Started user motivation (after coffee)' },
    'Loaded easter eggs ▰▰▰▰▰▰',
    'Reached target: desktop'
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
  var stage2Started = false;
  var finished = false;
  var stage1Timer = null;
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

  function startStage2() {
    if (stage2Started) return;
    stage2Started = true;

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

  document.addEventListener('keydown', onSkip, true);
  splash.addEventListener('click', onSkip, true);

  // Stage 1 → Stage 2 transition at 800ms
  stage1Timer = setTimeout(function() {
    stage1Timer = null;
    if (skipped || finished) return;
    startStage2();
  }, 800);
}

/**
 * Builds the BIOS-POST splash scaffold and returns the log container
 * where streaming lines are appended.
 */
function renderStage1Splash(splashEl) {
  splashEl.innerHTML =
    '<div class="splash-title">DavOS BIOS v1.0</div>' +
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
    { delay:  140, text: '  CPU: 1x Sleep-Deprived (3.2 GHz)         <span class="ok">[ ok ]</span>' },
    { delay:  220, text: '  Memory test: 0x00000000-0xFFFFFFFF       <span id="mem-bar">[░░░░░░░░]</span> <span id="mem-pct">  0%</span>',
      animate: function () { return animateMemBar(); }
    },
    { delay:  410, text: '  262144K OK' },
    { delay:  470, text: '  Probing IDE0: caffeine.dat               <span class="ok">[ ok ]</span>' },
    { delay:  530, text: '  Probing IDE1:                              <span class="dim">[ not found ]</span>' },
    { delay:  590, text: '  Probing USB: keyboard, mouse             <span class="ok">[ ok ]</span>' },
    { delay:  650, text: '  Probing display: 1080p (vibes)           <span class="ok">[ ok ]</span>' },
    { delay:  710, text: '  Loading kernel modules...                <span class="ok">[ ok ]</span>' }
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
