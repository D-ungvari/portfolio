/**
 * Anim — animation primitives for DavOS v4.
 *
 * Thin wrappers over Element.animate(). All helpers respect
 * prefers-reduced-motion and short-circuit to instant.
 *
 * Public API:
 *   Anim.scaleIn(el, opts)       -> Promise
 *   Anim.scaleOut(el, opts)      -> Promise
 *   Anim.crossfade(elOut, elIn, opts) -> Promise
 *   Anim.shake(el, opts)         -> Promise
 *   Anim.flyTo(el, fromRect, toRect, opts) -> Promise
 *   Anim.genie(el, targetRect, opts)       -> Promise (minimize)
 *   Anim.ungenie(el, fromRect, opts)       -> Promise (restore)
 *   Anim.slideIn(el, dir, opts)  -> Promise  ('up'|'down'|'left'|'right')
 *   Anim.fadeIn(el, opts)        -> Promise
 *   Anim.fadeOut(el, opts)       -> Promise
 *   Anim.pulse(el, opts)         -> Promise
 *   Anim.reduced()               -> boolean
 *   Anim.setTestMode(bool)       -> instant resolution for tests
 */
(function () {
  'use strict';

  var testMode = false;

  function reduced() {
    if (testMode) return true;
    try {
      return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    } catch (e) {
      return false;
    }
  }

  function ensureEl(el) {
    return el && el.nodeType === 1 ? el : null;
  }

  function run(el, keyframes, options) {
    el = ensureEl(el);
    if (!el) return Promise.resolve();
    if (reduced() || !el.animate) {
      // Apply final keyframe state instantly
      var last = keyframes[keyframes.length - 1] || {};
      for (var k in last) {
        if (Object.prototype.hasOwnProperty.call(last, k) && k !== 'offset' && k !== 'easing') {
          try { el.style[k] = last[k]; } catch (e) {}
        }
      }
      return Promise.resolve();
    }
    var a = el.animate(keyframes, options);
    return new Promise(function (resolve) {
      a.addEventListener('finish', function () { resolve(); });
      a.addEventListener('cancel', function () { resolve(); });
    });
  }

  function scaleIn(el, opts) {
    opts = opts || {};
    var from = opts.from != null ? opts.from : 0.92;
    var dur = opts.dur != null ? opts.dur : 180;
    var origin = opts.origin || 'center center';
    if (el) el.style.transformOrigin = origin;
    return run(el, [
      { transform: 'scale(' + from + ')', opacity: 0 },
      { transform: 'scale(1)', opacity: 1 }
    ], { duration: dur, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)', fill: 'forwards' });
  }

  function scaleOut(el, opts) {
    opts = opts || {};
    var to = opts.to != null ? opts.to : 0.92;
    var dur = opts.dur != null ? opts.dur : 140;
    var origin = opts.origin || 'center center';
    if (el) el.style.transformOrigin = origin;
    return run(el, [
      { transform: 'scale(1)', opacity: 1 },
      { transform: 'scale(' + to + ')', opacity: 0 }
    ], { duration: dur, easing: 'cubic-bezier(0.4, 0, 0.6, 1)', fill: 'forwards' });
  }

  function fadeIn(el, opts) {
    opts = opts || {};
    var dur = opts.dur != null ? opts.dur : 180;
    return run(el, [
      { opacity: 0 },
      { opacity: 1 }
    ], { duration: dur, easing: 'ease-out', fill: 'forwards' });
  }

  function fadeOut(el, opts) {
    opts = opts || {};
    var dur = opts.dur != null ? opts.dur : 160;
    return run(el, [
      { opacity: 1 },
      { opacity: 0 }
    ], { duration: dur, easing: 'ease-in', fill: 'forwards' });
  }

  function crossfade(elOut, elIn, opts) {
    opts = opts || {};
    var dur = opts.dur != null ? opts.dur : 220;
    return Promise.all([
      fadeOut(elOut, { dur: dur }),
      fadeIn(elIn, { dur: dur })
    ]);
  }

  function shake(el, opts) {
    opts = opts || {};
    var px = opts.px != null ? opts.px : 6;
    var dur = opts.dur != null ? opts.dur : 320;
    return run(el, [
      { transform: 'translateX(0)' },
      { transform: 'translateX(-' + px + 'px)' },
      { transform: 'translateX(' + px + 'px)' },
      { transform: 'translateX(-' + (px / 2) + 'px)' },
      { transform: 'translateX(' + (px / 2) + 'px)' },
      { transform: 'translateX(0)' }
    ], { duration: dur, easing: 'ease-in-out' });
  }

  function pulse(el, opts) {
    opts = opts || {};
    var dur = opts.dur != null ? opts.dur : 240;
    var scale = opts.scale != null ? opts.scale : 1.04;
    return run(el, [
      { transform: 'scale(1)' },
      { transform: 'scale(' + scale + ')' },
      { transform: 'scale(1)' }
    ], { duration: dur, easing: 'ease-out' });
  }

  function flyTo(el, fromRect, toRect, opts) {
    opts = opts || {};
    var dur = opts.dur != null ? opts.dur : 240;
    if (!fromRect || !toRect) return Promise.resolve();
    var dx = toRect.x - fromRect.x;
    var dy = toRect.y - fromRect.y;
    var sx = toRect.w / fromRect.w;
    var sy = toRect.h / fromRect.h;
    return run(el, [
      { transform: 'translate(0,0) scale(1)', opacity: 1 },
      { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(' + sx + ',' + sy + ')', opacity: 0.4 }
    ], { duration: dur, easing: 'cubic-bezier(0.4, 0, 0.2, 1)', fill: 'forwards' });
  }

  function genie(el, targetRect, opts) {
    opts = opts || {};
    var dur = opts.dur != null ? opts.dur : 280;
    if (!el || !targetRect) return Promise.resolve();
    var rect = el.getBoundingClientRect();
    var dx = (targetRect.x + targetRect.w / 2) - (rect.left + rect.width / 2);
    var dy = (targetRect.y + targetRect.h / 2) - (rect.top + rect.height / 2);
    var sx = Math.max(0.05, targetRect.w / rect.width);
    var sy = Math.max(0.05, targetRect.h / rect.height);
    return run(el, [
      { transform: 'translate(0,0) scale(1)', opacity: 1 },
      { transform: 'translate(' + (dx * 0.5) + 'px,' + (dy * 0.7) + 'px) scale(' + ((1 + sx) / 2) + ',' + ((1 + sy) / 2) + ')', opacity: 0.7, offset: 0.5 },
      { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(' + sx + ',' + sy + ')', opacity: 0 }
    ], { duration: dur, easing: 'cubic-bezier(0.4, 0, 0.6, 1)', fill: 'forwards' });
  }

  function ungenie(el, fromRect, opts) {
    opts = opts || {};
    var dur = opts.dur != null ? opts.dur : 260;
    if (!el || !fromRect) return Promise.resolve();
    var rect = el.getBoundingClientRect();
    var dx = (fromRect.x + fromRect.w / 2) - (rect.left + rect.width / 2);
    var dy = (fromRect.y + fromRect.h / 2) - (rect.top + rect.height / 2);
    var sx = Math.max(0.05, fromRect.w / rect.width);
    var sy = Math.max(0.05, fromRect.h / rect.height);
    return run(el, [
      { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(' + sx + ',' + sy + ')', opacity: 0 },
      { transform: 'translate(0,0) scale(1)', opacity: 1 }
    ], { duration: dur, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)', fill: 'forwards' });
  }

  function slideIn(el, dir, opts) {
    opts = opts || {};
    var dur = opts.dur != null ? opts.dur : 220;
    var distance = opts.distance != null ? opts.distance : 24;
    var from;
    switch (dir) {
      case 'up':    from = 'translateY(' + distance + 'px)'; break;
      case 'down':  from = 'translateY(-' + distance + 'px)'; break;
      case 'left':  from = 'translateX(' + distance + 'px)'; break;
      case 'right': from = 'translateX(-' + distance + 'px)'; break;
      default:      from = 'translateY(' + distance + 'px)';
    }
    return run(el, [
      { transform: from, opacity: 0 },
      { transform: 'translate(0,0)', opacity: 1 }
    ], { duration: dur, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)', fill: 'forwards' });
  }

  function setTestMode(b) { testMode = !!b; }

  window.Anim = {
    scaleIn: scaleIn,
    scaleOut: scaleOut,
    fadeIn: fadeIn,
    fadeOut: fadeOut,
    crossfade: crossfade,
    shake: shake,
    pulse: pulse,
    flyTo: flyTo,
    genie: genie,
    ungenie: ungenie,
    slideIn: slideIn,
    reduced: reduced,
    setTestMode: setTestMode
  };
})();
