/**
 * Konami code easter egg: up up down down left right left right b a
 * Triggers a special effect.
 */

(function() {
  var konamiSequence = [
    'ArrowUp', 'ArrowUp',
    'ArrowDown', 'ArrowDown',
    'ArrowLeft', 'ArrowRight',
    'ArrowLeft', 'ArrowRight',
    'b', 'a'
  ];
  var konamiIndex = 0;
  var konamiTriggered = false;

  document.addEventListener('keydown', function(e) {
    if (konamiTriggered) return;

    if (e.key === konamiSequence[konamiIndex]) {
      konamiIndex++;
      if (konamiIndex === konamiSequence.length) {
        konamiTriggered = true;
        triggerKonami();
      }
    } else {
      konamiIndex = 0;
      // Check if this key starts the sequence
      if (e.key === konamiSequence[0]) {
        konamiIndex = 1;
      }
    }
  });

  function triggerKonami() {
    // Invert all colors briefly, then show a message
    document.body.style.transition = 'filter 0.3s';
    document.body.style.filter = 'invert(1) hue-rotate(180deg)';

    setTimeout(function() {
      document.body.style.filter = 'none';

      // Output a message to the terminal
      var output = document.getElementById('output');
      if (output) {
        var div = document.createElement('div');
        div.className = 'output-line accent';
        div.textContent = '🎮 KONAMI CODE ACTIVATED! +30 lives. You found the secret.';
        output.appendChild(div);

        var body = document.getElementById('terminal-body');
        if (body) body.scrollTop = body.scrollHeight;
      }
    }, 1000);

    setTimeout(function() {
      document.body.style.transition = '';
    }, 1500);
  }
})();
