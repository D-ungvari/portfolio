/**
 * Main entry point — wires everything together.
 */
document.addEventListener('DOMContentLoaded', function() {
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

  // Run boot sequence
  runBoot(term, function() {
    term.activateInput();
  });
});
