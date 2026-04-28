/**
 * Selection lasso — click-drag on empty wallpaper draws marquee
 * and selects icons inside.
 */
(function () {
  'use strict';

  var pane = null;
  var marquee = null;
  var dragging = false;
  var startX = 0, startY = 0;

  function init() {
    pane = document.getElementById('desktop-wallpaper');
    if (!pane) return;

    pane.addEventListener('mousedown', onDown);
  }

  function onDown(e) {
    // Only fire on empty wallpaper (not on icons / widgets / trash)
    if (e.button !== 0) return;
    if (e.target.closest('.desktop-icon')) return;
    if (e.target.closest('.desktop-widget')) return;
    if (e.target.closest('#trash-icon')) return;
    if (e.target.closest('.context-menu')) return;

    dragging = true;
    var paneRect = pane.getBoundingClientRect();
    startX = e.clientX - paneRect.left + pane.scrollLeft;
    startY = e.clientY - paneRect.top + pane.scrollTop;

    marquee = document.createElement('div');
    marquee.className = 'desktop-lasso';
    marquee.style.left = startX + 'px';
    marquee.style.top = startY + 'px';
    marquee.style.width = '0px';
    marquee.style.height = '0px';
    pane.appendChild(marquee);
    pane.classList.add('lasso-active');

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    e.preventDefault();
  }

  function onMove(e) {
    if (!dragging || !marquee) return;
    var paneRect = pane.getBoundingClientRect();
    var curX = e.clientX - paneRect.left + pane.scrollLeft;
    var curY = e.clientY - paneRect.top + pane.scrollTop;
    var x = Math.min(startX, curX);
    var y = Math.min(startY, curY);
    var w = Math.abs(curX - startX);
    var h = Math.abs(curY - startY);
    marquee.style.left = x + 'px';
    marquee.style.top = y + 'px';
    marquee.style.width = w + 'px';
    marquee.style.height = h + 'px';

    // Highlight icons inside
    var icons = pane.querySelectorAll('.desktop-icon');
    icons.forEach(function (icon) {
      var ir = icon.getBoundingClientRect();
      var ix = ir.left - paneRect.left + pane.scrollLeft;
      var iy = ir.top - paneRect.top + pane.scrollTop;
      var inside = ix < x + w && ix + ir.width > x &&
                   iy < y + h && iy + ir.height > y;
      icon.classList.toggle('lasso-selected', inside);
    });
  }

  function onUp() {
    dragging = false;
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', onUp);
    if (marquee && marquee.parentNode) marquee.parentNode.removeChild(marquee);
    marquee = null;
    if (pane) pane.classList.remove('lasso-active');
    // Clear lasso-selected state — actual selection is single-icon convention
    var icons = document.querySelectorAll('.desktop-icon.lasso-selected');
    icons.forEach(function (i) { i.classList.remove('lasso-selected'); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
