/**
 * Selection lasso (sprint E E03) — multi-select on the wallpaper.
 *
 * Behaviour:
 *   - Click-drag on empty wallpaper = marquee. Icons inside get .lasso-selected.
 *   - Selection PERSISTS until cleared (was transient before).
 *   - Click on empty wallpaper without dragging = clear selection.
 *   - Esc = clear selection.
 *   - Ctrl+A / Cmd+A while desktop pane is active = select all icons.
 *   - Group-drag stub: when a .lasso-selected icon starts an HTML5 drag,
 *     all selected icons get a .group-dragging class for visual feedback
 *     (real position-persistence requires desktop layout migration; out of scope).
 */
(function () {
  'use strict';

  var pane = null;
  var grid = null;
  var marquee = null;
  var dragging = false;
  var moved = false;
  var startX = 0, startY = 0;
  var DRAG_THRESHOLD = 3; // px — distinguishes click from drag

  function getIcons() {
    return pane ? pane.querySelectorAll('.desktop-icon') : [];
  }

  function clearSelection() {
    if (!pane) return;
    var icons = pane.querySelectorAll('.desktop-icon.lasso-selected');
    for (var i = 0; i < icons.length; i++) {
      icons[i].classList.remove('lasso-selected');
    }
  }

  function selectAll() {
    if (!pane) return;
    var icons = getIcons();
    for (var i = 0; i < icons.length; i++) {
      icons[i].classList.add('lasso-selected');
    }
  }

  function init() {
    pane = document.getElementById('desktop-wallpaper');
    grid = document.getElementById('icon-grid');
    if (!pane) return;

    pane.addEventListener('mousedown', onDown);

    // Esc clears selection. Listen on document so it works regardless of focus.
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        var any = pane && pane.querySelector('.desktop-icon.lasso-selected');
        if (any) clearSelection();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'a' || e.key === 'A')) {
        // Only intercept Ctrl+A when the desktop pane is the active surface,
        // otherwise we'd hijack browser select-all in inputs / windows.
        var active = document.body.getAttribute('data-active-pane');
        var tag = (e.target && e.target.tagName) || '';
        if (active === 'desktop' && tag !== 'INPUT' && tag !== 'TEXTAREA' && !e.target.isContentEditable) {
          e.preventDefault();
          selectAll();
        }
      }
    });

    // Group-drag visual: when any .lasso-selected icon starts an HTML5 drag,
    // mark the full set so CSS can give them a "lifted" appearance.
    if (grid) {
      grid.addEventListener('dragstart', function (e) {
        var icon = e.target.closest && e.target.closest('.desktop-icon');
        if (!icon || !icon.classList.contains('lasso-selected')) return;
        var sel = pane.querySelectorAll('.desktop-icon.lasso-selected');
        for (var i = 0; i < sel.length; i++) sel[i].classList.add('group-dragging');
      });
      grid.addEventListener('dragend', function () {
        var sel = pane.querySelectorAll('.desktop-icon.group-dragging');
        for (var i = 0; i < sel.length; i++) sel[i].classList.remove('group-dragging');
      });
    }
  }

  function onDown(e) {
    // Only fire on empty wallpaper (not on icons / widgets / trash / windows / popouts)
    if (e.button !== 0) return;
    if (e.target.closest('.desktop-icon')) return;
    if (e.target.closest('.desktop-widget')) return;
    if (e.target.closest('#trash-icon')) return;
    if (e.target.closest('.context-menu')) return;
    if (e.target.closest('.os-window')) return;

    dragging = true;
    moved = false;
    var paneRect = pane.getBoundingClientRect();
    startX = e.clientX - paneRect.left + pane.scrollLeft;
    startY = e.clientY - paneRect.top + pane.scrollTop;

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    e.preventDefault();
  }

  function ensureMarquee() {
    if (marquee) return;
    marquee = document.createElement('div');
    marquee.className = 'desktop-lasso';
    marquee.style.left = startX + 'px';
    marquee.style.top = startY + 'px';
    marquee.style.width = '0px';
    marquee.style.height = '0px';
    pane.appendChild(marquee);
    pane.classList.add('lasso-active');
    // First time we cross the threshold, clear any prior selection so the
    // new marquee starts from a clean slate.
    clearSelection();
  }

  function onMove(e) {
    if (!dragging) return;
    var paneRect = pane.getBoundingClientRect();
    var curX = e.clientX - paneRect.left + pane.scrollLeft;
    var curY = e.clientY - paneRect.top + pane.scrollTop;
    var dx = curX - startX;
    var dy = curY - startY;
    if (!moved && (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD)) {
      moved = true;
      ensureMarquee();
    }
    if (!moved || !marquee) return;

    var x = Math.min(startX, curX);
    var y = Math.min(startY, curY);
    var w = Math.abs(dx);
    var h = Math.abs(dy);
    marquee.style.left = x + 'px';
    marquee.style.top = y + 'px';
    marquee.style.width = w + 'px';
    marquee.style.height = h + 'px';

    var icons = getIcons();
    for (var i = 0; i < icons.length; i++) {
      var ir = icons[i].getBoundingClientRect();
      var ix = ir.left - paneRect.left + pane.scrollLeft;
      var iy = ir.top - paneRect.top + pane.scrollTop;
      var inside = ix < x + w && ix + ir.width > x &&
                   iy < y + h && iy + ir.height > y;
      icons[i].classList.toggle('lasso-selected', inside);
    }
  }

  function onUp() {
    dragging = false;
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', onUp);

    if (marquee && marquee.parentNode) marquee.parentNode.removeChild(marquee);
    marquee = null;
    if (pane) pane.classList.remove('lasso-active');

    // Click-without-drag on empty wallpaper = clear selection.
    if (!moved) clearSelection();
    // Selection from drag persists until next clear.
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose API for tests + future callers (e.g. context-menu "Select all").
  window.Lasso = {
    clear: clearSelection,
    selectAll: selectAll,
    selectedCount: function () {
      return pane ? pane.querySelectorAll('.desktop-icon.lasso-selected').length : 0;
    }
  };
})();
