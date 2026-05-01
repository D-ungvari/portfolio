/**
 * Taskbar - polybar/i3-style shell bar.
 */
(function() {
  var clockEl = null;
  var clockTimer = null;
  var statsTimer = null;
  var statState = {
    cpu: 12,
    mem: 4.2,
    ip: '192.168.1.42'
  };

  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  function formatDateTime(d) {
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) +
      ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
  }

  function reducedMotion() {
    return (window.Anim && Anim.reduced && Anim.reduced()) ||
      (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  function updateClock() {
    if (!clockEl) return;
    clockEl.textContent = formatDateTime(new Date());
  }

  function startClock() {
    if (clockTimer) clearInterval(clockTimer);
    updateClock();
    clockTimer = setInterval(updateClock, 1000);
  }

  function clamp(n, min, max) {
    if (n < min) return min;
    if (n > max) return max;
    return n;
  }

  function walkStats() {
    if (reducedMotion()) return;
    statState.cpu = clamp(statState.cpu + (Math.random() * 6 - 3), 5, 25);
    statState.mem = clamp(statState.mem + (Math.random() * 0.18 - 0.09), 3.9, 4.4);
  }

  function setText(selector, text) {
    var el = document.querySelector(selector);
    if (el) el.textContent = text;
  }

  function updateStats() {
    walkStats();
    setText('[data-stat="cpu"]', Math.round(statState.cpu) + '%');
    setText('[data-stat="mem"]', statState.mem.toFixed(1) + 'G');
  }

  function startStats() {
    if (statsTimer) clearInterval(statsTimer);
    updateStats();
    if (!reducedMotion()) statsTimer = setInterval(updateStats, 2000);
  }

  function pill(className, label, value, id) {
    return '<span' + (id ? ' id="' + id + '"' : '') + ' class="bar-pill ' + className + '">' +
      '<span class="bar-pill-label">' + label + '</span>' +
      '<span class="bar-pill-value">' + value + '</span>' +
    '</span>';
  }

  function renderSystemStats(container) {
    container.innerHTML =
      pill('bar-pill-cpu', 'CPU', '<span data-stat="cpu">12%</span>') +
      pill('bar-pill-mem', 'MEM', '<span data-stat="mem">4.2G</span>') +
      '<span class="bar-pill bar-pill-net tray-item tray-net" title="Network">' +
        '<span class="bar-pill-label">NET</span>' +
        '<span class="bar-pill-value tray-rate">' + statState.ip + '</span>' +
      '</span>' +
      pill('bar-pill-kernel', 'KERNEL', '6.8.9-arch1-1') +
      pill('bar-pill-branch', 'BRANCH', 'main') +
      pill('bar-pill-clock', 'TIME', '', 'taskbar-clock');
    clockEl = document.getElementById('taskbar-clock');
  }

  function updateTitle(title) {
    var center = document.querySelector('.bar-center');
    if (center) center.textContent = title || '';
  }

  function renderWorkspaces(data) {
    var container = document.getElementById('taskbar-workspaces');
    if (!container) return;
    var count = data && data.count ? data.count : 5;
    var current = data && data.current ? data.current : 1;
    var map = data && data.map ? data.map : {};
    var html = '';
    for (var i = 1; i <= count; i++) {
      var ws = map[String(i)] || { windowIds: [], tiling: false };
      var classes = 'bar-pill workspace-pill';
      if (i === current) classes += ' active';
      if (ws.windowIds && ws.windowIds.length) classes += ' has-windows';
      if (ws.tiling) classes += ' tiling';
      html += '<button type="button" class="' + classes + '" data-workspace="' + i + '"' +
        (i === current ? ' aria-current="true"' : '') +
        ' title="Workspace ' + i + '">[' + i + ']</button>';
    }
    container.innerHTML = html;
  }

  function bindWorkspaces() {
    var container = document.getElementById('taskbar-workspaces');
    if (!container) return;
    if (window.Workspaces && typeof Workspaces.snapshot === 'function') {
      renderWorkspaces(Workspaces.snapshot());
    } else {
      renderWorkspaces({ current: 1, count: 5, map: { '1': { windowIds: [], tiling: false } } });
    }
    container.addEventListener('click', function(e) {
      var btn = e.target && e.target.closest ? e.target.closest('.workspace-pill') : null;
      if (!btn || !container.contains(btn)) return;
      var id = parseInt(btn.getAttribute('data-workspace'), 10);
      if (window.Workspaces && typeof Workspaces.switchTo === 'function') Workspaces.switchTo(id);
    });
    if (window.Workspaces && typeof Workspaces.onChange === 'function' && !window.__taskbarWorkspacesBound) {
      window.__taskbarWorkspacesBound = true;
      Workspaces.onChange(renderWorkspaces);
    }
  }

  function bindWindowTitle() {
    if (!window.WindowManager) {
      updateTitle('');
      return;
    }
    if (typeof WindowManager.activeTitle === 'function') {
      updateTitle(WindowManager.activeTitle());
    }
    if (typeof WindowManager.onActiveChange === 'function' && !window.__taskbarTitleBound) {
      window.__taskbarTitleBound = true;
      WindowManager.onActiveChange(function(title) { updateTitle(title); });
    }
  }

  function openLauncher() {
    if (window.Palette && typeof Palette.open === 'function') Palette.open();
    else if (window.Launcher && typeof Launcher.open === 'function') Launcher.open();
  }

  function init() {
    var taskbar = document.getElementById('taskbar');
    if (!taskbar) return;

    taskbar.innerHTML =
      '<div class="bar-left">' +
        '<button id="taskbar-launcher" type="button" class="bar-launcher" aria-label="Open launcher" title="Open launcher">ARCH</button>' +
        '<div id="taskbar-workspaces" class="bar-workspaces" aria-label="Workspaces"></div>' +
        '<div id="taskbar-running" role="toolbar" aria-label="Running applications"></div>' +
      '</div>' +
      '<div class="bar-center" aria-live="polite"></div>' +
      '<div id="taskbar-right" class="bar-right">' +
        '<div id="taskbar-tray" class="bar-stat-strip"></div>' +
        '<button id="taskbar-notify-bell" type="button" class="bar-icon-btn" aria-label="Notifications" title="Notifications">' +
          '<span class="bell-icon">^</span><span class="notify-badge"></span>' +
        '</button>' +
      '</div>';

    var launcher = document.getElementById('taskbar-launcher');
    if (launcher) launcher.addEventListener('click', openLauncher);

    var stats = document.getElementById('taskbar-tray');
    if (stats) renderSystemStats(stats);

    var bell = document.getElementById('taskbar-notify-bell');
    if (bell && window.Notify) window.Notify.setBell(bell);

    bindWorkspaces();
    bindWindowTitle();
    startStats();
    startClock();
  }

  if (typeof window !== 'undefined') {
    window.Taskbar = {
      init: init,
      renderSystemStats: renderSystemStats
    };
    if (document.readyState !== 'loading') init();
    else document.addEventListener('DOMContentLoaded', init);
  }
})();
