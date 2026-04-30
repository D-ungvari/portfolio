/**
 * Desktop widgets — draggable persistent gadgets pinned to the wallpaper.
 *
 * v4 ships: clock, sysinfo, quote.
 * Position persists in session under 'widgets' key.
 */
(function () {
  'use strict';

  var DEFAULTS = {
    clock:   { enabled: true, x: null, y: 80,  type: 'clock' },
    sysinfo: { enabled: true, x: null, y: 240, type: 'sysinfo' },
    quote:   { enabled: true, x: null, y: 400, type: 'quote' }
  };

  var registry = {};
  var elements = {};
  var startedTimers = [];

  function loadConfig() {
    var saved = (window.Session && Session.get) ? (Session.get('widgets') || {}) : {};
    var merged = {};
    for (var k in DEFAULTS) {
      merged[k] = Object.assign({}, DEFAULTS[k], saved[k] || {});
    }
    return merged;
  }

  function save() {
    if (window.Session && Session.set) Session.set('widgets', registry);
  }

  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  function buildClock() {
    var el = document.createElement('div');
    el.className = 'desktop-widget widget-clock';
    el.innerHTML = '<div class="widget-clock-time">--:--:--</div><div class="widget-clock-date"></div>';
    function tick() {
      var d = new Date();
      var t = el.querySelector('.widget-clock-time');
      var dt = el.querySelector('.widget-clock-date');
      if (t) t.textContent = pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
      if (dt) dt.textContent = d.toLocaleDateString('en-US', { weekday: 'long' }) + ' · ' + d.toISOString().slice(0, 10);
    }
    tick();
    var iv = setInterval(tick, 1000);
    startedTimers.push(iv);
    return el;
  }

  function buildSysinfo() {
    var el = document.createElement('div');
    el.className = 'desktop-widget widget-sysinfo';
    var startTime = Date.now();
    function tick() {
      var up = Math.floor((Date.now() - startTime) / 1000);
      var hh = Math.floor(up / 3600);
      var mm = Math.floor((up % 3600) / 60);
      var ss = up % 60;
      var loadVals = [
        (Math.random() * 0.6 + 0.2).toFixed(2),
        (Math.random() * 0.6 + 0.3).toFixed(2),
        (Math.random() * 0.5 + 0.2).toFixed(2)
      ].join(' ');
      el.innerHTML =
        '<div class="widget-sysinfo-line">host: <span>daveos</span></div>' +
        '<div class="widget-sysinfo-line">user: <span>visitor</span></div>' +
        '<div class="widget-sysinfo-line">uptime: <span>' + (hh ? hh + 'h ' : '') + mm + 'm ' + ss + 's</span></div>' +
        '<div class="widget-sysinfo-line">load: <span>' + loadVals + '</span></div>' +
        '<div class="widget-sysinfo-line">mem: <span>∞</span></div>' +
        '<div class="widget-sysinfo-line">net: <span>up</span></div>';
    }
    tick();
    var iv = setInterval(tick, 5000);
    startedTimers.push(iv);
    return el;
  }

  var QUOTES = [
    'ship beats perfect.',
    'commit early, commit often.',
    'no test? no proof.',
    'avoid premature abstractions.',
    'production is the only env that counts.',
    'make it work, make it right, make it fast.',
    'tabs vs spaces: spaces. fight me.',
    'the best code is the code you do not write.',
    'a good name is half the design.'
  ];

  function buildQuote() {
    var el = document.createElement('div');
    el.className = 'desktop-widget widget-quote';
    var q = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    el.innerHTML =
      '<div class="widget-quote-label">QUOTE OF THE DAY</div>' +
      '<div class="widget-quote-text">"' + q + '"</div>';
    return el;
  }

  // ---- Pong widget (sprint E E15) — hidden 4th, unlocked by Konami / /pong ----
  function buildPong() {
    var el = document.createElement('div');
    el.className = 'desktop-widget widget-pong';
    var pre = document.createElement('pre');
    pre.className = 'widget-pong-screen';
    el.appendChild(pre);

    var W = 28, H = 12;
    var ball = { x: W / 2, y: H / 2, vx: 0.6, vy: 0.4 };
    var leftY = H / 2, rightY = H / 2;
    var paddleH = 3;
    var userControl = false;

    el.addEventListener('mouseenter', function () { userControl = true; });
    el.addEventListener('mouseleave', function () { userControl = false; });
    el.addEventListener('mousemove', function (e) {
      if (!userControl) return;
      var rect = el.getBoundingClientRect();
      var rel = (e.clientY - rect.top) / rect.height;
      rightY = Math.max(paddleH / 2, Math.min(H - paddleH / 2, rel * H));
    });

    var reduced = (window.Anim && Anim.reduced && Anim.reduced());

    function tick() {
      // Ball
      ball.x += ball.vx;
      ball.y += ball.vy;
      if (ball.y < 0) { ball.y = 0; ball.vy = -ball.vy; }
      if (ball.y > H - 1) { ball.y = H - 1; ball.vy = -ball.vy; }
      // AI paddles
      var lerp = 0.2;
      leftY += ((ball.y) - leftY) * lerp;
      if (!userControl) rightY += ((ball.y) - rightY) * lerp;
      // Bounce off paddles
      if (ball.x < 1.2) {
        if (Math.abs(ball.y - leftY) < paddleH / 2) {
          ball.vx = Math.abs(ball.vx);
        } else {
          ball.x = W / 2; ball.y = H / 2; ball.vx = 0.6; ball.vy = (Math.random() - 0.5) * 0.8;
        }
      }
      if (ball.x > W - 1.2) {
        if (Math.abs(ball.y - rightY) < paddleH / 2) {
          ball.vx = -Math.abs(ball.vx);
        } else {
          ball.x = W / 2; ball.y = H / 2; ball.vx = -0.6; ball.vy = (Math.random() - 0.5) * 0.8;
        }
      }
    }

    function render() {
      var rows = [];
      for (var y = 0; y < H; y++) {
        var row = '';
        for (var x = 0; x < W; x++) {
          if (x === 0 && Math.abs(y - leftY) < paddleH / 2) row += '|';
          else if (x === W - 1 && Math.abs(y - rightY) < paddleH / 2) row += '|';
          else if (Math.round(ball.x) === x && Math.round(ball.y) === y) row += 'o';
          else if (x === Math.floor(W / 2) && y % 2 === 0) row += ':';
          else row += ' ';
        }
        rows.push(row);
      }
      pre.textContent = rows.join('\n');
    }

    if (reduced) {
      render();
      pre.textContent += '\n  (paused — motion off)';
    } else {
      var iv = setInterval(function () { tick(); render(); }, 80);
      startedTimers.push(iv);
      el._destroy = function () { clearInterval(iv); };
      render();
    }
    return el;
  }

  var BUILDERS = { clock: buildClock, sysinfo: buildSysinfo, quote: buildQuote, pong: buildPong };

  function attachDrag(el, key) {
    var dragging = false;
    var startX = 0, startY = 0;
    var origX = 0, origY = 0;
    var pointerId = null;

    el.addEventListener('pointerdown', function (e) {
      if (e.target.closest('.widget-close')) return;
      dragging = true;
      pointerId = e.pointerId;
      startX = e.clientX;
      startY = e.clientY;
      var rect = el.getBoundingClientRect();
      var pane = document.getElementById('desktop-wallpaper');
      var paneRect = pane ? pane.getBoundingClientRect() : { left: 0, top: 0 };
      origX = rect.left - paneRect.left;
      origY = rect.top - paneRect.top;
      el.classList.add('dragging');
      try { el.setPointerCapture(pointerId); } catch (e) {}
      e.preventDefault();
    });

    el.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      var dx = e.clientX - startX;
      var dy = e.clientY - startY;
      var nx = origX + dx;
      var ny = origY + dy;
      el.style.left = nx + 'px';
      el.style.top = ny + 'px';
      el.style.right = 'auto';
      registry[key].x = nx;
      registry[key].y = ny;
    });

    function endDrag() {
      if (!dragging) return;
      dragging = false;
      el.classList.remove('dragging');
      pointerId = null;
      save();
    }
    el.addEventListener('pointerup', endDrag);
    el.addEventListener('pointercancel', endDrag);
  }

  function placeWidget(key, cfg) {
    if (!cfg.enabled) return;
    var build = BUILDERS[cfg.type];
    if (!build) return;
    var el = build();
    el.dataset.widget = key;
    if (cfg.x != null) el.style.left = cfg.x + 'px';
    else el.style.right = '24px';
    el.style.top = (cfg.y != null ? cfg.y : 80) + 'px';
    var host = document.getElementById('desktop-wallpaper');
    if (!host) return;
    host.appendChild(el);
    elements[key] = el;
    attachDrag(el, key);
  }

  function init() {
    registry = loadConfig();
    var keys = Object.keys(registry);
    for (var i = 0; i < keys.length; i++) {
      placeWidget(keys[i], registry[keys[i]]);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(init, 200); });
  } else {
    setTimeout(init, 200);
  }

  function add(key, type, cfg) {
    if (registry[key]) return;
    registry[key] = Object.assign({ enabled: true, x: null, y: 120, type: type }, cfg || {});
    placeWidget(key, registry[key]);
    save();
  }

  function remove(key) {
    var el = elements[key];
    if (el) {
      if (el._destroy) el._destroy();
      if (el.parentNode) el.parentNode.removeChild(el);
      delete elements[key];
    }
    delete registry[key];
    save();
  }

  function unlockPong() {
    if (window.Session && Session.set) Session.set('pongUnlocked', true);
    if (!registry['pong']) add('pong', 'pong', { x: 60, y: 120 });
  }

  function isPongUnlocked() {
    return !!(window.Session && Session.get && Session.get('pongUnlocked'));
  }

  window.Widgets = { init: init, add: add, remove: remove, unlockPong: unlockPong, isPongUnlocked: isPongUnlocked, types: function () { return Object.keys(BUILDERS); } };
})();

// /pong command — direct unlock + add
if (typeof registerCommand === 'function') {
  registerCommand('/pong', '', function (terminal) {
    if (window.Widgets && Widgets.unlockPong) Widgets.unlockPong();
    if (terminal && terminal.output) terminal.output('pong widget unlocked. right-click desktop → Add widget ▸ Pong.', 'dim');
  }, true);
}
