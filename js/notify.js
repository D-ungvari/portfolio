(function () {
  'use strict';
  var queue = [];
  var bellEl = null;
  var unreadCount = 0;
  var logEntries = [];
  var DEFAULT_TTL = 4000;
  var MAX_VISIBLE = 3;
  var visible = [];

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
    if (visible.length < MAX_VISIBLE) renderToast(entry);
    else queue.push(entry);
  }

  function setBell(el) {
    bellEl = el;
    updateBell();
    el.addEventListener('click', toggleLog);
  }

  function updateBell() {
    if (!bellEl) return;
    bellEl.classList.toggle('has-unread', unreadCount > 0);
    var badge = bellEl.querySelector('.notify-badge');
    if (badge) badge.textContent = unreadCount > 0 ? String(unreadCount) : '';
  }

  function toggleLog() {
    var existing = document.getElementById('notify-log');
    if (existing) { existing.remove(); return; }
    var panel = document.createElement('div');
    panel.id = 'notify-log';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Notifications');
    var header = document.createElement('div');
    header.className = 'notify-log-header';
    header.textContent = 'Notifications';
    panel.appendChild(header);
    if (logEntries.length === 0) {
      var empty = document.createElement('div');
      empty.className = 'notify-log-empty';
      empty.textContent = 'no notifications.';
      panel.appendChild(empty);
    } else {
      for (var i = logEntries.length - 1; i >= 0; i--) {
        var entry = logEntries[i];
        var row = document.createElement('div');
        row.className = 'notify-log-row';
        var t = document.createElement('div');
        t.className = 'notify-log-title';
        t.textContent = entry.title;
        var b = document.createElement('div');
        b.className = 'notify-log-body';
        b.textContent = entry.body || '';
        row.appendChild(t);
        if (entry.body) row.appendChild(b);
        panel.appendChild(row);
      }
    }
    var clear = document.createElement('button');
    clear.className = 'notify-log-clear';
    clear.type = 'button';
    clear.textContent = 'clear all';
    clear.addEventListener('click', function () {
      logEntries = [];
      unreadCount = 0;
      updateBell();
      panel.remove();
    });
    panel.appendChild(clear);
    document.body.appendChild(panel);
    unreadCount = 0;
    updateBell();
    setTimeout(function () {
      document.addEventListener('click', onDocClick, true);
    }, 0);
  }

  function onDocClick(e) {
    var panel = document.getElementById('notify-log');
    if (!panel) return;
    if (panel.contains(e.target)) return;
    if (bellEl && bellEl.contains(e.target)) return;
    panel.remove();
    document.removeEventListener('click', onDocClick, true);
  }

  window.Notify = { push: push, setBell: setBell, log: function () { return logEntries.slice(); } };
})();
