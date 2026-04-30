/**
 * Konami code easter egg — sprint E E16: layered chain.
 *
 *   ↑↑↓↓←→←→ba
 *
 *   Count 1: original color invert + +30 lives line. Unlocks Pong widget.
 *   Count 2: brief glitch + dry "we already did this" line.
 *   Count 3: notification + transient `recovery` shell command (auto-unregisters
 *            after `exit` or 30s).
 */
(function () {
  var konamiSequence = [
    'ArrowUp', 'ArrowUp',
    'ArrowDown', 'ArrowDown',
    'ArrowLeft', 'ArrowRight',
    'ArrowLeft', 'ArrowRight',
    'b', 'a'
  ];
  var konamiIndex = 0;
  var konamiCount = 0;
  var recoveryTimer = null;

  document.addEventListener('keydown', function (e) {
    if (e.key === konamiSequence[konamiIndex]) {
      konamiIndex++;
      if (konamiIndex === konamiSequence.length) {
        konamiIndex = 0;
        konamiCount++;
        triggerKonami();
      }
    } else {
      konamiIndex = e.key === konamiSequence[0] ? 1 : 0;
    }
  });

  function appendLine(text, cls) {
    var output = document.getElementById('output');
    if (!output) return;
    var div = document.createElement('div');
    div.className = 'output-line ' + (cls || 'accent');
    div.textContent = text;
    output.appendChild(div);
    var body = document.getElementById('terminal-body');
    if (body) body.scrollTop = body.scrollHeight;
  }

  function triggerKonami() {
    if (konamiCount === 1) levelOne();
    else if (konamiCount === 2) levelTwo();
    else if (konamiCount === 3) levelThree();
    else extraLevel();
  }

  function levelOne() {
    document.body.style.transition = 'filter 0.3s';
    document.body.style.filter = 'invert(1) hue-rotate(180deg)';
    setTimeout(function () {
      document.body.style.filter = 'none';
      appendLine('🎮 KONAMI CODE ACTIVATED! +30 lives. You found the secret.');
      if (window.Widgets && Widgets.unlockPong) {
        Widgets.unlockPong();
        if (window.Notify && Notify.push) {
          Notify.push({
            title: 'Easter egg',
            body: 'Pong widget unlocked. Right-click desktop → Add widget ▸ Pong.'
          });
        }
      }
    }, 600);
    setTimeout(function () { document.body.style.transition = ''; }, 1100);
  }

  function levelTwo() {
    if (window.Anim && Anim.glitch) Anim.glitch(document.body, { dur: 220 });
    setTimeout(function () {
      appendLine("we already did this. you're persistent.", 'dim');
    }, 240);
  }

  function levelThree() {
    if (window.Notify && Notify.push) {
      Notify.push({
        title: 'easter egg, level 3 unlocked',
        body: 'type "recovery" in terminal.'
      });
    }
    appendLine('a transient root shell awaits. type "recovery".', 'dim');
    if (typeof registerCommand === 'function') {
      registerCommand('recovery', '', function (terminal) {
        terminal.outputLines([
          '',
          '(recovery) root@dave:#  ' ,
          '  available commands: help, whoami, exit',
          '  exit or wait 30s to leave recovery mode.',
          ''
        ], 'dim');
      }, true);
      registerCommand('help', '', function (terminal) {
        terminal.output('  recovery shell — try whoami / exit', 'dim');
      }, true);
      registerCommand('whoami', '', function (terminal) {
        terminal.output('root (kind of, not really)', 'dim');
      }, true);
      registerCommand('exit', '', function (terminal) {
        cleanupRecovery();
        terminal.output('left recovery mode.', 'dim');
      }, true);
      if (recoveryTimer) clearTimeout(recoveryTimer);
      recoveryTimer = setTimeout(cleanupRecovery, 30000);
    }
  }

  function extraLevel() {
    appendLine('there is no level 4. go outside.', 'dim');
  }

  function cleanupRecovery() {
    if (typeof commandRegistry === 'object') {
      delete commandRegistry['recovery'];
      delete commandRegistry['help'];
      delete commandRegistry['whoami'];
      delete commandRegistry['exit'];
    }
    if (recoveryTimer) { clearTimeout(recoveryTimer); recoveryTimer = null; }
  }
})();
