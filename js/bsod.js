/**
 * BSOD — easter egg overlay (sprint E E09).
 *
 * Win9x-style blue-screen-of-death. Two trigger paths:
 *   - manual: `/bsod` from terminal
 *   - panic:  1-in-1000 chance during cold boot (gated by Session.bsodSeen)
 *
 * Auto-dismisses at 4s. Any key/click after a 250ms grace dismisses early.
 * Honors prefers-reduced-motion (no glitch frame).
 */
(function () {
  'use strict';

  var visible = false;
  var BOOT_CHANCE = 0.001;
  var GRACE_MS = 250;
  var AUTO_MS = 4000;

  function reduced() {
    try { return !!(window.Anim && Anim.reduced && Anim.reduced()); }
    catch (e) { return false; }
  }

  function memDump() {
    var lines = [];
    var hex = '0123456789ABCDEF';
    for (var i = 0; i < 8; i++) {
      var addr = '0xC0' + hex.charAt((i * 7) % 16) + hex.charAt(i % 16) + '0000';
      var w = '';
      for (var j = 0; j < 6; j++) {
        w += ' ' + hex.charAt((i + j) % 16) + hex.charAt((i * j) % 16) +
             hex.charAt((i + j * 2) % 16) + hex.charAt((j * 3) % 16);
      }
      lines.push(addr + w);
    }
    return lines.join('\n');
  }

  function show(opts) {
    if (visible) return;
    opts = opts || {};
    visible = true;

    if (window.Session && Session.set) Session.set('bsodSeen', true);

    var overlay = document.createElement('div');
    overlay.id = 'bsod-easter';
    overlay.setAttribute('role', 'alert');
    overlay.style.zIndex = (window.Layer && Layer.BSOD) || 9500;
    overlay.innerHTML =
      '<div class="bsod-easter-frame">' +
        '<div class="bsod-easter-heading">:( A problem has occurred.</div>' +
        '<div class="bsod-easter-body">' +
          'A fatal exception 0E has occurred at 0028:C001CAFE in VXD VPORTFOLIO(01) +\n' +
          '00000420. The current application will be terminated.\n\n' +
          '*  Press any key to terminate the current application.\n' +
          '*  Press any key to recover. Either way, press any key.\n\n' +
          'STOP: 0x000000DA  COFFEE_DEPLETION_DETECTED\n' +
          'Trigger: ' + (opts.trigger || 'manual') + '\n\n' +
          '<pre class="bsod-easter-dump">' + memDump() + '</pre>' +
        '</div>' +
        '<div class="bsod-easter-foot">' +
          'press any key — this is the recovery service' +
        '</div>' +
      '</div>';
    if (!reduced()) overlay.classList.add('glitch');
    document.body.appendChild(overlay);
    requestAnimationFrame(function () { overlay.classList.add('visible'); });

    var dismissable = false;
    setTimeout(function () { dismissable = true; }, GRACE_MS);

    function dismiss() {
      if (!dismissable || !visible) return;
      visible = false;
      document.removeEventListener('keydown', dismiss, true);
      document.removeEventListener('mousedown', dismiss, true);
      overlay.classList.remove('visible');
      setTimeout(function () {
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      }, reduced() ? 0 : 200);
    }
    document.addEventListener('keydown', dismiss, true);
    document.addEventListener('mousedown', dismiss, true);
    setTimeout(dismiss, AUTO_MS);
  }

  function maybePanic() {
    if (window.Session && Session.get && Session.get('bsodSeen')) return false;
    if (reduced()) return false;
    if (Math.random() >= BOOT_CHANCE) return false;
    setTimeout(function () { show({ trigger: 'panic' }); }, 600);
    return true;
  }

  window.BSOD = { show: show, maybePanic: maybePanic, isVisible: function () { return visible; } };

  // Register /bsod once command registry is ready
  function registerCmd() {
    if (typeof registerCommand !== 'function') return;
    registerCommand('/bsod', '', function (terminal) {
      if (terminal && terminal.output) terminal.output('// triggering kernel panic...', 'dim');
      setTimeout(function () { show({ trigger: 'manual' }); }, 100);
    }, true);
  }
  registerCmd();
})();
