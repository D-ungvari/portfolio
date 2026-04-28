/**
 * Multi-tab terminal — Sprint B Phase 7 (B35b).
 *
 * Pragmatic v1: single Terminal DOM, virtual tabs that swap output HTML,
 * history, and input value on switch.
 *
 * Shortcuts: Ctrl+T (new), Ctrl+W (close), Ctrl+Tab (next), Ctrl+Shift+Tab (prev).
 */
(function () {
  'use strict';

  var tabs = [];
  var activeIdx = 0;
  var nextId = 1;
  var stripEl = null;

  function makeTab(label) {
    var id = 'tab_' + nextId;
    var lbl = label || ('shell ' + nextId);
    nextId++;
    return {
      id: id,
      label: lbl,
      output: '',
      history: [],
      historyIndex: -1,
      input: ''
    };
  }

  function saveCurrent() {
    if (activeIdx < 0 || activeIdx >= tabs.length) return;
    var term = window._terminalRef;
    if (!term) return;
    var t = tabs[activeIdx];
    t.output = term.outputEl.innerHTML;
    t.history = term.history.slice();
    t.historyIndex = term.historyIndex;
    t.input = term.inputEl.value;
  }

  function restore(idx) {
    activeIdx = idx;
    var term = window._terminalRef;
    if (!term) return;
    var t = tabs[idx];
    term.outputEl.innerHTML = t.output;
    term.history = t.history.slice();
    term.historyIndex = t.historyIndex;
    term.inputEl.value = t.input;
    term.inputDisplay.textContent = t.input;
    if (typeof term._scrollToBottom === 'function') term._scrollToBottom();
    renderStrip();
  }

  function newTab() {
    saveCurrent();
    var t = makeTab();
    tabs.push(t);
    activeIdx = tabs.length - 1;
    var term = window._terminalRef;
    if (term) {
      term.outputEl.innerHTML = '';
      term.history = [];
      term.historyIndex = -1;
      term.inputEl.value = '';
      term.inputDisplay.textContent = '';
      term.output('new shell. type /help.', 'dim');
      if (term.isActive && typeof term.activateInput === 'function') {
        term.activateInput();
      }
    }
    renderStrip();
  }

  function closeTab(idx) {
    if (tabs.length <= 1) return;
    if (idx === undefined) idx = activeIdx;
    if (idx === activeIdx) {
      // Closing current — drop state, splice, then restore neighbour.
      tabs.splice(idx, 1);
      if (activeIdx >= tabs.length) activeIdx = tabs.length - 1;
      restore(activeIdx);
    } else {
      // Closing another — preserve current state, just splice.
      saveCurrent();
      tabs.splice(idx, 1);
      if (idx < activeIdx) activeIdx--;
      renderStrip();
    }
  }

  function nextTab() {
    if (tabs.length <= 1) return;
    saveCurrent();
    var i = (activeIdx + 1) % tabs.length;
    restore(i);
  }

  function prevTab() {
    if (tabs.length <= 1) return;
    saveCurrent();
    var i = (activeIdx - 1 + tabs.length) % tabs.length;
    restore(i);
  }

  function selectTab(idx) {
    if (idx === activeIdx) return;
    saveCurrent();
    restore(idx);
  }

  function renderStrip() {
    if (!stripEl) return;
    stripEl.innerHTML = '';
    for (var i = 0; i < tabs.length; i++) {
      (function (idx, t) {
        var btn = document.createElement('button');
        btn.className = 'term-tab' + (idx === activeIdx ? ' active' : '');
        btn.type = 'button';
        btn.title = t.label;
        var label = document.createElement('span');
        label.className = 'term-tab-label';
        label.textContent = t.label;
        btn.appendChild(label);
        var x = document.createElement('span');
        x.className = 'term-tab-close';
        x.setAttribute('aria-label', 'Close ' + t.label);
        x.textContent = '✕';
        x.addEventListener('click', function (e) {
          e.stopPropagation();
          closeTab(idx);
        });
        btn.appendChild(x);
        btn.addEventListener('click', function () { selectTab(idx); });
        stripEl.appendChild(btn);
      })(i, tabs[i]);
    }
    var plus = document.createElement('button');
    plus.className = 'term-tab-add';
    plus.type = 'button';
    plus.textContent = '+';
    plus.title = 'New tab (Ctrl+T)';
    plus.addEventListener('click', newTab);
    stripEl.appendChild(plus);
  }

  function actuallyInit() {
    var pane = document.getElementById('terminal-pane');
    if (!pane) return;
    if (document.getElementById('term-tabs')) return; // idempotent

    stripEl = document.createElement('div');
    stripEl.id = 'term-tabs';
    pane.insertBefore(stripEl, pane.firstChild);

    tabs = [makeTab('shell 1')];
    activeIdx = 0;
    renderStrip();

    if (window.Shortcuts && typeof window.Shortcuts.add === 'function') {
      window.Shortcuts.add({
        combo: 'Ctrl+T',
        label: 'New terminal tab',
        group: 'Terminal',
        action: newTab
      });
      window.Shortcuts.add({
        combo: 'Ctrl+W',
        label: 'Close terminal tab',
        group: 'Terminal',
        action: function () { closeTab(); }
      });
      window.Shortcuts.add({
        combo: 'Ctrl+Tab',
        label: 'Next terminal tab',
        group: 'Terminal',
        action: nextTab
      });
      window.Shortcuts.add({
        combo: 'Ctrl+Shift+Tab',
        label: 'Previous terminal tab',
        group: 'Terminal',
        action: prevTab
      });
    }
  }

  function init() {
    if (window._terminalRef) {
      actuallyInit();
    } else {
      window.addEventListener('terminal:ready', actuallyInit, { once: true });
    }
  }

  window.TerminalTabs = {
    init: init,
    newTab: newTab,
    closeTab: closeTab,
    nextTab: nextTab,
    prevTab: prevTab,
    list: function () { return tabs.slice(); },
    activeIndex: function () { return activeIdx; }
  };

  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();
