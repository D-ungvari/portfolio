/**
 * Matrix rain effect — /matrix easter egg
 */

function runMatrixRain(duration) {
  duration = duration || 4000;

  var canvas = document.createElement('canvas');
  canvas.id = 'matrix-canvas';
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.zIndex = '9999';
  canvas.style.pointerEvents = 'none';
  canvas.style.opacity = '0.85';
  document.body.appendChild(canvas);

  var ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  var fontSize = 14;
  var columns = Math.floor(canvas.width / fontSize);
  var drops = [];

  for (var i = 0; i < columns; i++) {
    drops[i] = Math.random() * -100;
  }

  var chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF';
  var charArray = chars.split('');

  var animationId;
  var startTime = Date.now();

  function draw() {
    // Fade effect
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#00ff41';
    ctx.font = fontSize + 'px monospace';

    for (var i = 0; i < drops.length; i++) {
      var char = charArray[Math.floor(Math.random() * charArray.length)];
      var x = i * fontSize;
      var y = drops[i] * fontSize;

      ctx.fillText(char, x, y);

      if (y > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }

    var elapsed = Date.now() - startTime;
    if (elapsed < duration) {
      animationId = requestAnimationFrame(draw);
    } else {
      // Fade out
      fadeOut();
    }
  }

  function fadeOut() {
    var opacity = 0.85;
    function step() {
      opacity -= 0.05;
      if (opacity <= 0) {
        canvas.remove();
        return;
      }
      canvas.style.opacity = opacity.toString();
      requestAnimationFrame(step);
    }
    step();
  }

  animationId = requestAnimationFrame(draw);

  // Safety net — remove after duration + 2s
  setTimeout(function() {
    if (canvas.parentNode) {
      cancelAnimationFrame(animationId);
      canvas.remove();
    }
  }, duration + 2000);
}

registerCommand('/matrix', '', function(terminal) {
  terminal.output('wake up, neo...', 'dim');

  // Check reduced motion
  var prefersReducedMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    terminal.output('(matrix rain disabled — reduced motion preferred)', 'dim');
    return;
  }

  setTimeout(function() {
    runMatrixRain(4000);
  }, 500);
}, true);
