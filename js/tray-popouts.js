/**
 * Tray popouts — calendar, volume, network, battery info panels.
 * Each tray item in the taskbar opens a small panel anchored to it.
 */
(function () {
  'use strict';

  var openPopout = null;

  function close() {
    if (!openPopout) return;
    document.removeEventListener('mousedown', onOutside, true);
    document.removeEventListener('keydown', onKeydown, true);
    var el = openPopout;
    openPopout = null;
    if (window.Anim) {
      window.Anim.fadeOut(el, { dur: 100 }).then(function () {
        if (el && el.parentNode) el.parentNode.removeChild(el);
      });
    } else if (el && el.parentNode) el.parentNode.removeChild(el);
  }

  function onOutside(e) {
    if (!openPopout) return;
    if (openPopout.contains(e.target)) return;
    if (openPopout.dataset.anchorId) {
      var anchor = document.getElementById(openPopout.dataset.anchorId);
      if (anchor && anchor.contains(e.target)) return;
    }
    close();
  }
  function onKeydown(e) { if (e.key === 'Escape') close(); }

  function show(anchor, content, opts) {
    opts = opts || {};
    if (openPopout) close();
    var el = document.createElement('div');
    el.className = 'tray-popout' + (opts.className ? ' ' + opts.className : '');
    el.setAttribute('role', 'dialog');
    if (typeof content === 'string') el.innerHTML = content;
    else if (content && content.nodeType === 1) el.appendChild(content);
    document.body.appendChild(el);
    if (anchor && anchor.id) el.dataset.anchorId = anchor.id;

    var rect = anchor.getBoundingClientRect();
    var width = el.offsetWidth || 280;
    var top = rect.bottom + 6;
    var left = rect.right - width;
    if (left < 8) left = 8;
    if (left + width > window.innerWidth - 8) left = window.innerWidth - width - 8;
    el.style.left = left + 'px';
    el.style.top = top + 'px';

    openPopout = el;
    if (window.Anim) window.Anim.slideIn(el, 'up', { dur: 160, distance: 10 });
    setTimeout(function () {
      document.addEventListener('mousedown', onOutside, true);
      document.addEventListener('keydown', onKeydown, true);
    }, 0);
    return el;
  }

  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  // ---------- calendar ----------
  function buildCalendar() {
    var c = document.createElement('div');
    c.className = 'calendar-popout';
    var d = new Date();
    var year = d.getFullYear();
    var month = d.getMonth();
    var today = d.getDate();
    var monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];

    var hdr = document.createElement('div');
    hdr.className = 'calendar-header';
    hdr.innerHTML =
      '<div class="calendar-time">' + pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':<span class="calendar-secs">' + pad(d.getSeconds()) + '</span></div>' +
      '<div class="calendar-date">' + d.toLocaleDateString('en-US', { weekday: 'long' }) + ' · ' + d.toISOString().slice(0, 10) + '</div>';
    c.appendChild(hdr);

    var nav = document.createElement('div');
    nav.className = 'calendar-nav';
    nav.innerHTML = '<span>' + monthNames[month] + ' ' + year + '</span>';
    c.appendChild(nav);

    var grid = document.createElement('div');
    grid.className = 'calendar-grid';
    var dows = ['M','T','W','T','F','S','S'];
    for (var i = 0; i < 7; i++) {
      var dow = document.createElement('div');
      dow.className = 'calendar-dow';
      dow.textContent = dows[i];
      grid.appendChild(dow);
    }
    var first = new Date(year, month, 1);
    var firstDow = (first.getDay() + 6) % 7; // Mon=0
    var daysInMonth = new Date(year, month + 1, 0).getDate();
    for (var s = 0; s < firstDow; s++) {
      var blank = document.createElement('div');
      blank.className = 'calendar-day blank';
      grid.appendChild(blank);
    }
    for (var dd = 1; dd <= daysInMonth; dd++) {
      var cell = document.createElement('div');
      cell.className = 'calendar-day' + (dd === today ? ' today' : '');
      cell.textContent = dd;
      grid.appendChild(cell);
    }
    c.appendChild(grid);

    var foot = document.createElement('div');
    foot.className = 'calendar-foot';
    var loc = (window.Persona && Persona.get && Persona.get().location) || 'Copenhagen, DK';
    foot.textContent = loc + ' · UTC' + (-d.getTimezoneOffset() / 60 >= 0 ? '+' : '') + (-d.getTimezoneOffset() / 60);
    c.appendChild(foot);

    // Tick seconds while open
    var secsEl = c.querySelector('.calendar-secs');
    var timeEl = c.querySelector('.calendar-time');
    var iv = setInterval(function () {
      if (!c.parentNode) { clearInterval(iv); return; }
      var nd = new Date();
      timeEl.firstChild.nodeValue = pad(nd.getHours()) + ':' + pad(nd.getMinutes()) + ':';
      secsEl.textContent = pad(nd.getSeconds());
    }, 1000);

    return c;
  }

  function buildVolume() {
    var c = document.createElement('div');
    c.className = 'volume-popout';
    var bars = 5, level = 3;
    function render() {
      c.innerHTML =
        '<div class="popout-title">Volume</div>' +
        '<div class="vol-bar">' +
          (function () {
            var s = '';
            for (var i = bars; i >= 1; i--) {
              s += '<button type="button" data-lvl="' + i + '" class="vol-cell ' + (i <= level ? 'on' : '') + '">▮</button>';
            }
            return s;
          })() +
        '</div>' +
        '<div class="vol-label">level ' + level + '/' + bars + ' · cosmetic</div>';
      var cells = c.querySelectorAll('.vol-cell');
      cells.forEach(function (b) {
        b.addEventListener('click', function () {
          level = parseInt(b.getAttribute('data-lvl'), 10);
          render();
        });
      });
    }
    render();
    return c;
  }

  function buildNetwork() {
    var c = document.createElement('div');
    c.className = 'network-popout';
    c.innerHTML =
      '<div class="popout-title">Network</div>' +
      '<div class="net-row"><span>Wired (eth0)</span><span class="ok">connected</span></div>' +
      '<div class="net-row"><span>↑ tx</span><span>1.2 M/s</span></div>' +
      '<div class="net-row"><span>↓ rx</span><span>4.8 M/s</span></div>' +
      '<div class="net-row"><span>Latency</span><span>2 ms</span></div>' +
      '<button type="button" class="popout-btn" disabled>Disconnect</button>';
    return c;
  }

  function buildBattery() {
    var c = document.createElement('div');
    c.className = 'battery-popout';
    c.innerHTML =
      '<div class="popout-title">Battery</div>' +
      '<div class="bat-pct">87%</div>' +
      '<div class="bat-row">Time remaining: <span>∞</span></div>' +
      '<div class="bat-row">Status: <span>Discharging slowly</span></div>' +
      '<button type="button" class="popout-btn">Power saver</button>';
    return c;
  }

  function init() {
    var clockEl = document.getElementById('taskbar-clock');
    if (clockEl) {
      clockEl.id = clockEl.id || 'taskbar-clock';
      clockEl.style.cursor = 'pointer';
      clockEl.setAttribute('tabindex', '0');
      clockEl.setAttribute('role', 'button');
      clockEl.setAttribute('aria-label', 'Open calendar');
      clockEl.addEventListener('click', function (e) {
        e.stopPropagation();
        if (openPopout && openPopout.classList.contains('calendar')) { close(); return; }
        var el = show(clockEl, buildCalendar(), { className: 'calendar' });
      });
    }

    var tray = document.getElementById('taskbar-tray');
    if (tray) {
      var vol = tray.querySelector('.tray-vol');
      var net = tray.querySelector('.tray-net');
      var bat = tray.querySelector('.tray-bat');
      if (vol) {
        vol.id = 'tray-vol-anchor';
        vol.style.cursor = 'pointer';
        vol.addEventListener('click', function (e) {
          e.stopPropagation();
          show(vol, buildVolume(), { className: 'volume' });
        });
      }
      if (net) {
        net.id = 'tray-net-anchor';
        net.style.cursor = 'pointer';
        net.addEventListener('click', function (e) {
          e.stopPropagation();
          show(net, buildNetwork(), { className: 'network' });
        });
      }
      if (bat) {
        bat.id = 'tray-bat-anchor';
        bat.style.cursor = 'pointer';
        bat.addEventListener('click', function (e) {
          e.stopPropagation();
          show(bat, buildBattery(), { className: 'battery' });
        });
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(init, 50); });
  } else {
    setTimeout(init, 50);
  }

  window.TrayPopouts = { close: close };
})();
