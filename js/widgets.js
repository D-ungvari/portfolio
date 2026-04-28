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

  var BUILDERS = { clock: buildClock, sysinfo: buildSysinfo, quote: buildQuote };

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

  window.Widgets = { init: init };
})();
