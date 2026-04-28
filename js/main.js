/**
 * Main entry point — wires everything together.
 */
document.addEventListener('DOMContentLoaded', function() {
  var visit = (window.Session && window.Session.bumpVisit) ? window.Session.bumpVisit() : { previousVisit: null, count: 1 };
  window.__lastVisit = visit;

  function init() {
    var container = document.getElementById('terminal');
    var term = new Terminal(container);

    // Load saved theme
    if (typeof loadSavedTheme === 'function') {
      loadSavedTheme();
    }

    // Register command aliases (must happen after all commands are registered)
    registerAlias('/?', '/help');
    registerAlias('/h', '/help');
    registerAlias('/p', '/projects');
    registerAlias('/cls', '/clear');
    registerAlias('/exp', '/experience');
    registerAlias('/cv', '/resume');

    // Wire command execution
    term.onCommand = function(rawInput) {
      executeCommand(rawInput, term);
    };

    // Expose terminal globally for taskbar.js (theme-change echo) and other modules
    window._terminalRef = term;
    window.dispatchEvent(new Event('terminal:ready'));

    // Cross-pane sync: highlight desktop icon when project commands run from terminal
    var _origOnCommand = term.onCommand;
    term.onCommand = function(rawInput) {
      _origOnCommand(rawInput);
      var trimmed = (rawInput || '').trim().toLowerCase();
      if (window.Desktop && typeof window.Desktop.highlightProject === 'function') {
        if (trimmed.indexOf('/play ') === 0) {
          var name = trimmed.replace('/play ', '').trim();
          window.Desktop.highlightProject('/' + name);
        } else if (trimmed.indexOf('/launch ') === 0) {
          var name2 = trimmed.replace('/launch ', '').trim();
          window.Desktop.highlightProject('/' + name2);
        } else if (typeof projects !== 'undefined') {
          // bare project commands like /swarm, /uxcrimes
          for (var i = 0; i < projects.length; i++) {
            if (projects[i].command.toLowerCase() === trimmed) {
              window.Desktop.highlightProject(projects[i].command);
              break;
            }
          }
        }
      }
    };

    // Wire mobile command chips
    var mobileNav = document.getElementById('mobile-commands');
    if (mobileNav) {
      mobileNav.addEventListener('click', function(e) {
        var btn = e.target.closest('button[data-cmd]');
        if (!btn) return;
        var cmd = btn.getAttribute('data-cmd');
        term.inputEl.value = cmd;
        term.inputDisplay.textContent = cmd;
        term._processCommand();
      });
    }

    // Initialize desktop (icons, selection, drag, context menu) before boot
    if (typeof Desktop !== 'undefined' && Desktop && typeof Desktop.init === 'function') {
      Desktop.init(term);
    }

    // Drag-icon-to-terminal: drop a desktop icon onto the terminal pane to run its command.
    var termPane = document.getElementById('terminal-pane');
    if (termPane) {
      termPane.addEventListener('dragover', function (e) {
        if (e.dataTransfer && e.dataTransfer.types &&
            Array.prototype.indexOf.call(e.dataTransfer.types, 'text/plain') !== -1) {
          e.preventDefault();
          try { e.dataTransfer.dropEffect = 'copy'; } catch (err) {}
          termPane.classList.add('drop-target');
        }
      });
      termPane.addEventListener('dragleave', function (e) {
        if (e.target === termPane) termPane.classList.remove('drop-target');
      });
      termPane.addEventListener('drop', function (e) {
        e.preventDefault();
        termPane.classList.remove('drop-target');
        var data = '';
        try { data = e.dataTransfer.getData('text/plain') || ''; } catch (err) {}
        if (data && data.charAt(0) === '/' && term.submit) term.submit(data);
      });
    }

    // Restore persisted windows from previous session BEFORE the boot sequence
    // fades in the desktop, so windows are present when the OS becomes visible.
    // Note: only native-app windows are restored; iframe windows are ephemeral
    // and skipped by WindowManager.restoreSession().
    if (window.WindowManager && typeof window.WindowManager.restoreSession === 'function') {
      try { window.WindowManager.restoreSession(); } catch (e) {}
    }

    // Run boot sequence
    runBoot(term, function() {
      term.activateInput();
    });
  }

  if (window.Persona && typeof window.Persona.load === 'function') {
    window.Persona.load().then(init).catch(init);
  } else {
    init();
  }
});
