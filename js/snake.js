/**
 * /snake — playable Snake on the terminal pane (sprint E E14).
 *
 * Theme-color rendering, Esc/Q to quit, P pause, R restart on game-over.
 * Best score persists to Session('snakeBest').
 *
 * Reduced-motion path: shows a static fallback message instead of running
 * the game loop. Keeps the easter egg consistent with the rest of DavOS.
 */
(function () {
  'use strict';

  var COLS = 24;
  var ROWS = 16;
  var TICK_MS = 120;
  var CELL = 16;

  var running = false;
  var paused = false;
  var rafId = null;
  var tickAcc = 0;
  var lastTime = 0;

  var canvas = null;
  var ctx = null;
  var overlayEl = null;
  var snake = null;
  var dir = null;
  var pendingDir = null;
  var food = null;
  var score = 0;
  var dead = false;

  function reduced() {
    try { return !!(window.Anim && Anim.reduced && Anim.reduced()); }
    catch (e) { return false; }
  }
  function getBest() {
    if (window.Session && Session.get) {
      var v = Session.get('snakeBest');
      return typeof v === 'number' ? v : 0;
    }
    return 0;
  }
  function setBest(v) {
    if (window.Session && Session.set) Session.set('snakeBest', v);
  }
  function themeColor(name, fallback) {
    try {
      var v = getComputedStyle(document.documentElement).getPropertyValue('--color-' + name).trim();
      return v || fallback;
    } catch (e) { return fallback; }
  }

  function reset() {
    snake = [{x: 6, y: 8}, {x: 5, y: 8}, {x: 4, y: 8}];
    dir = {x: 1, y: 0};
    pendingDir = null;
    score = 0;
    dead = false;
    placeFood();
  }

  function placeFood() {
    var tries = 0;
    while (tries < 200) {
      var f = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) };
      var hit = false;
      for (var i = 0; i < snake.length; i++) {
        if (snake[i].x === f.x && snake[i].y === f.y) { hit = true; break; }
      }
      if (!hit) { food = f; return; }
      tries++;
    }
    food = { x: 0, y: 0 };
  }

  function step() {
    if (dead || paused) return;
    if (pendingDir) { dir = pendingDir; pendingDir = null; }
    var head = snake[0];
    var nx = head.x + dir.x;
    var ny = head.y + dir.y;
    // Wrap walls (keeps the easter-egg forgiving)
    if (nx < 0) nx = COLS - 1;
    if (nx >= COLS) nx = 0;
    if (ny < 0) ny = ROWS - 1;
    if (ny >= ROWS) ny = 0;
    // Self-collision
    for (var i = 0; i < snake.length; i++) {
      if (snake[i].x === nx && snake[i].y === ny) { dead = true; onDeath(); return; }
    }
    snake.unshift({ x: nx, y: ny });
    if (food && nx === food.x && ny === food.y) {
      score++;
      placeFood();
    } else {
      snake.pop();
    }
  }

  function onDeath() {
    var best = Math.max(getBest(), score);
    setBest(best);
  }

  function draw() {
    if (!ctx) return;
    var bg = themeColor('bg', '#0a0a0a');
    var primary = themeColor('primary', '#cdd6f4');
    var accent = themeColor('accent', '#cba6f7');
    var dim = themeColor('dim', '#6c7086');

    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // Grid
    ctx.strokeStyle = dim;
    ctx.lineWidth = 0.5;
    for (var gx = 0; gx <= COLS; gx++) {
      ctx.beginPath(); ctx.moveTo(gx * CELL, 0); ctx.lineTo(gx * CELL, ROWS * CELL); ctx.stroke();
    }
    for (var gy = 0; gy <= ROWS; gy++) {
      ctx.beginPath(); ctx.moveTo(0, gy * CELL); ctx.lineTo(COLS * CELL, gy * CELL); ctx.stroke();
    }
    // Food
    if (food) {
      ctx.fillStyle = accent;
      ctx.fillRect(food.x * CELL + 2, food.y * CELL + 2, CELL - 4, CELL - 4);
    }
    // Snake
    ctx.fillStyle = primary;
    for (var i = 0; i < snake.length; i++) {
      var s = snake[i];
      ctx.fillRect(s.x * CELL + 1, s.y * CELL + 1, CELL - 2, CELL - 2);
    }
    // HUD
    ctx.fillStyle = primary;
    ctx.font = '12px JetBrains Mono, monospace';
    ctx.textBaseline = 'top';
    ctx.fillText('score: ' + score + '   best: ' + Math.max(getBest(), score), 8, 8);
    if (paused) {
      ctx.fillStyle = primary;
      ctx.font = '20px JetBrains Mono, monospace';
      ctx.fillText('PAUSED', canvas.width / 2 - 38, canvas.height / 2 - 12);
    }
    if (dead) {
      ctx.fillStyle = bg;
      ctx.fillRect(0, canvas.height / 2 - 42, canvas.width, 84);
      ctx.fillStyle = primary;
      ctx.font = '18px JetBrains Mono, monospace';
      var msg = 'you ate yourself.';
      ctx.fillText(msg, canvas.width / 2 - (msg.length * 4.6), canvas.height / 2 - 26);
      ctx.font = '12px JetBrains Mono, monospace';
      ctx.fillStyle = dim;
      ctx.fillText('press R to restart, ESC to exit', canvas.width / 2 - 96, canvas.height / 2 + 4);
    }
  }

  function loop(ts) {
    if (!running) return;
    if (!lastTime) lastTime = ts;
    var dt = ts - lastTime;
    lastTime = ts;
    tickAcc += dt;
    while (tickAcc >= TICK_MS) { step(); tickAcc -= TICK_MS; }
    draw();
    rafId = requestAnimationFrame(loop);
  }

  function onKey(e) {
    if (!running) return;
    if (e.key === 'Escape' || e.key === 'q' || e.key === 'Q') { e.preventDefault(); stop(); return; }
    if (e.key === 'p' || e.key === 'P') { e.preventDefault(); paused = !paused; return; }
    if (dead && (e.key === 'r' || e.key === 'R')) { e.preventDefault(); reset(); return; }
    if (dead) return;
    var nd = null;
    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') nd = { x: 0, y: -1 };
    else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') nd = { x: 0, y: 1 };
    else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') nd = { x: -1, y: 0 };
    else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') nd = { x: 1, y: 0 };
    if (nd) {
      // Prevent 180° reversal
      if (snake.length > 1 && nd.x === -dir.x && nd.y === -dir.y) return;
      pendingDir = nd;
      e.preventDefault();
    }
  }

  function start(host) {
    if (running) return;
    host = host || document.getElementById('terminal-pane');
    if (!host) return;

    if (reduced()) {
      var fallback = document.createElement('div');
      fallback.id = 'snake-overlay';
      fallback.className = 'snake-static';
      fallback.innerHTML =
        '<div class="snake-static-msg">snake.exe — animations off.</div>' +
        '<div class="snake-static-hint">enable motion to play. press any key to dismiss.</div>';
      host.appendChild(fallback);
      function dismiss() {
        if (fallback.parentNode) fallback.parentNode.removeChild(fallback);
        document.removeEventListener('keydown', dismiss, true);
        document.removeEventListener('mousedown', dismiss, true);
      }
      document.addEventListener('keydown', dismiss, true);
      document.addEventListener('mousedown', dismiss, true);
      return;
    }

    overlayEl = document.createElement('div');
    overlayEl.id = 'snake-overlay';
    canvas = document.createElement('canvas');
    canvas.width = COLS * CELL;
    canvas.height = ROWS * CELL;
    overlayEl.appendChild(canvas);
    host.appendChild(overlayEl);
    ctx = canvas.getContext && canvas.getContext('2d');

    reset();
    running = true;
    paused = false;
    lastTime = 0;
    tickAcc = 0;
    document.addEventListener('keydown', onKey, true);
    rafId = requestAnimationFrame(loop);
  }

  function stop() {
    running = false;
    document.removeEventListener('keydown', onKey, true);
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    if (overlayEl && overlayEl.parentNode) overlayEl.parentNode.removeChild(overlayEl);
    overlayEl = null;
    canvas = null;
    ctx = null;
  }

  window.Snake = { start: start, stop: stop, isRunning: function () { return running; } };

  // Register /snake as hidden command
  if (typeof registerCommand === 'function') {
    registerCommand('/snake', '', function (terminal) {
      if (terminal && terminal.output) terminal.output('// loading snake...', 'dim');
      start();
    }, true);
  }
})();
