(function () {
  'use strict';
  var queue = [];
  var bellEl = null;
  var unreadCount = 0;
  var logEntries = [];
  var DEFAULT_TTL = 4000;
  var MAX_VISIBLE = 3;
  var visible = [];
  var dnd = false;

  // Restore DND from session if available
  if (window.Session && Session.get) {
    var s = Session.get('settings');
    if (s && typeof s.dnd === 'boolean') dnd = s.dnd;
  }
  function persistDnd() {
    if (!window.Session || !Session.set || !Session.get) return;
    var s = Session.get('settings') || {};
    s.dnd = dnd;
    Session.set('settings', s);
  }

  function ensureContainer() {
    var c = document.getElementById('notify-stack');
    if (c) return c;
    c = document.createElement('div');
    c.id = 'notify-stack';
    document.body.appendChild(c);
    return c;
  }

  function renderToast(entry) {
    var c = ensureContainer();
    var el = document.createElement('div');
    el.className = 'notify-toast' + (entry.kind ? ' ' + entry.kind : '');
    var title = document.createElement('div');
    title.className = 'notify-title';
    title.textContent = entry.title || '';
    var body = document.createElement('div');
    body.className = 'notify-body';
    body.textContent = entry.body || '';
    el.appendChild(title);
    if (entry.body) el.appendChild(body);
    if (entry.action) {
      var btn = document.createElement('button');
      btn.className = 'notify-action';
      btn.type = 'button';
      btn.textContent = entry.action.label;
      btn.addEventListener('click', function () {
        try { entry.action.fn(); } catch (e) {}
        dismiss(el, entry);
      });
      el.appendChild(btn);
    }
    c.appendChild(el);
    visible.push({ el: el, entry: entry });
    setTimeout(function () { dismiss(el, entry); }, entry.ttlMs || DEFAULT_TTL);
  }

  function dismiss(el, entry) {
    if (!el || !el.parentNode) return;
    el.classList.add('fading');
    setTimeout(function () {
      if (el.parentNode) el.parentNode.removeChild(el);
      visible = visible.filter(function (v) { return v.el !== el; });
      flushQueue();
    }, 250);
  }

  function flushQueue() {
    while (queue.length && visible.length < MAX_VISIBLE) {
      renderToast(queue.shift());
    }
  }

  function push(entry) {
    if (!entry) return;
    entry.id = 'n_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
    entry.timestamp = new Date().toISOString();
    logEntries.push(entry);
    if (logEntries.length > 100) logEntries = logEntries.slice(-100);
    unreadCount++;
    updateBell();
    // DND: log only, skip toast surface
    if (dnd) return;
    // Defensive: prune `visible` of elements that were removed externally
    // (test harness or stray DOM operation) so queue doesn't stall.
    visible = visible.filter(function (v) { return v.el && v.el.isConnected !== false && v.el.parentNode; });
    if (visible.length < MAX_VISIBLE) renderToast(entry);
    else queue.push(entry);
    if (document.getElementById('notify-center')) renderCenter();
  }

  function setBell(el) {
    bellEl = el;
    updateBell();
    el.addEventListener('click', toggleCenter);
  }

  function updateBell() {
    if (!bellEl) return;
    bellEl.classList.toggle('has-unread', unreadCount > 0 && !dnd);
    bellEl.classList.toggle('dnd', dnd);
    var badge = bellEl.querySelector('.notify-badge');
    if (badge) badge.textContent = unreadCount > 0 ? String(unreadCount) : '';
  }

  function relTime(iso) {
    var d = new Date(iso);
    var diff = Date.now() - d.getTime();
    if (diff < 30 * 1000) return 'now';
    if (diff < 60 * 60 * 1000) return Math.floor(diff / 60000) + 'm';
    if (diff < 24 * 60 * 60 * 1000) return Math.floor(diff / 3600000) + 'h';
    var hh = (d.getHours() < 10 ? '0' : '') + d.getHours();
    var mm = (d.getMinutes() < 10 ? '0' : '') + d.getMinutes();
    if (diff < 48 * 60 * 60 * 1000) return 'Yesterday ' + hh + ':' + mm;
    return d.toISOString().slice(5, 10) + ' ' + hh + ':' + mm;
  }

  function isToday(iso) {
    return (Date.now() - new Date(iso).getTime()) < 24 * 60 * 60 * 1000;
  }

  function buildEntryRow(entry) {
    var row = document.createElement('div');
    row.className = 'notify-center-row';
    row.setAttribute('data-id', entry.id);
    row.innerHTML =
      '<div class="notify-center-icon">◉</div>' +
      '<div class="notify-center-main">' +
        '<div class="notify-center-title"></div>' +
        '<div class="notify-center-body"></div>' +
      '</div>' +
      '<div class="notify-center-meta">' +
        '<span class="notify-center-time"></span>' +
        '<button type="button" class="notify-center-dismiss" aria-label="dismiss">×</button>' +
      '</div>';
    row.querySelector('.notify-center-title').textContent = entry.title || '';
    row.querySelector('.notify-center-body').textContent = entry.body || '';
    row.querySelector('.notify-center-time').textContent = relTime(entry.timestamp);
    row.querySelector('.notify-center-dismiss').addEventListener('click', function () {
      logEntries = logEntries.filter(function (e) { return e.id !== entry.id; });
      renderCenter();
    });
    return row;
  }

  function renderCenter() {
    var panel = document.getElementById('notify-center');
    if (!panel) return;
    var body = panel.querySelector('.notify-center-body-list');
    if (!body) return;
    body.innerHTML = '';

    if (logEntries.length === 0) {
      var empty = document.createElement('div');
      empty.className = 'notify-center-empty';
      empty.textContent = 'no notifications. your inbox is, for once, peaceful.';
      body.appendChild(empty);
      return;
    }

    var today = [];
    var earlier = [];
    for (var i = logEntries.length - 1; i >= 0; i--) {
      (isToday(logEntries[i].timestamp) ? today : earlier).push(logEntries[i]);
    }

    if (today.length) {
      var th = document.createElement('div');
      th.className = 'notify-center-group';
      th.textContent = 'Today';
      body.appendChild(th);
      for (var t = 0; t < today.length; t++) body.appendChild(buildEntryRow(today[t]));
    }
    if (earlier.length) {
      var eh = document.createElement('div');
      eh.className = 'notify-center-group';
      eh.textContent = 'Earlier';
      body.appendChild(eh);
      for (var e = 0; e < earlier.length; e++) body.appendChild(buildEntryRow(earlier[e]));
    }
  }

  function buildCenter() {
    var panel = document.createElement('aside');
    panel.id = 'notify-center';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Notifications');
    panel.style.zIndex = (window.Layer && Layer.NOTIFICATION) || 6000;
    panel.innerHTML =
      '<div class="notify-center-header">' +
        '<span class="notify-center-heading">Notifications</span>' +
        '<label class="notify-center-dnd">' +
          '<input type="checkbox" class="notify-center-dnd-input" />' +
          '<span>Do not disturb</span>' +
        '</label>' +
      '</div>' +
      '<div class="notify-center-body-list"></div>' +
      '<div class="notify-center-footer">' +
        '<button type="button" class="notify-center-clear">Clear all</button>' +
      '</div>';
    var dndInput = panel.querySelector('.notify-center-dnd-input');
    dndInput.checked = dnd;
    dndInput.addEventListener('change', function () {
      dnd = !!dndInput.checked;
      persistDnd();
      updateBell();
    });
    panel.querySelector('.notify-center-clear').addEventListener('click', function () {
      logEntries = [];
      unreadCount = 0;
      updateBell();
      renderCenter();
    });
    return panel;
  }

  function toggleCenter() {
    var existing = document.getElementById('notify-center');
    if (existing) {
      existing.classList.add('closing');
      setTimeout(function () { if (existing.parentNode) existing.parentNode.removeChild(existing); }, 200);
      document.removeEventListener('click', onDocClick, true);
      return;
    }
    var panel = buildCenter();
    document.body.appendChild(panel);
    requestAnimationFrame(function () { panel.classList.add('visible'); });
    renderCenter();
    unreadCount = 0;
    updateBell();
    setTimeout(function () { document.addEventListener('click', onDocClick, true); }, 0);
  }

  function onDocClick(e) {
    var panel = document.getElementById('notify-center');
    if (!panel) return;
    if (panel.contains(e.target)) return;
    if (bellEl && bellEl.contains(e.target)) return;
    panel.classList.add('closing');
    setTimeout(function () { if (panel.parentNode) panel.parentNode.removeChild(panel); }, 200);
    document.removeEventListener('click', onDocClick, true);
  }

  function setDnd(v) { dnd = !!v; persistDnd(); updateBell(); }
  function isDnd() { return dnd; }

  window.Notify = {
    push: push,
    setBell: setBell,
    log: function () { return logEntries.slice(); },
    toggleCenter: toggleCenter,
    setDnd: setDnd,
    isDnd: isDnd,
    // Back-compat: old toggleLog stays as alias
    toggleLog: toggleCenter
  };
})();
