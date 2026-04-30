/**
 * WindowManager — draggable, resizable, z-stacked windows backbone for DavOS.
 *
 * Public API:
 *   WindowManager.open(opts) -> id
 *   WindowManager.close(id)
 *   WindowManager.minimize(id)
 *   WindowManager.restore(id)
 *   WindowManager.maximize(id)
 *   WindowManager.unmaximize(id)
 *   WindowManager.bringToFront(id)
 *   WindowManager.list() -> [WindowState]
 *   WindowManager.get(id) -> WindowState
 *   WindowManager.byApp(app) -> [WindowState]
 *   WindowManager.activeId() -> id | null
 *   WindowManager.snapActive(direction)
 *   WindowManager.restoreSession()
 *
 * State shape:
 *   { id, app, project, title, url, content, x, y, w, h, z,
 *     minimized, maximized, prevRect }
 *
 * Persistence: writes `windows` to Session on every state change. iframe
 * windows (those with `url`) are NOT restored at boot — only native-app
 * windows (no url, has app) are. iframes are ephemeral.
 *
 * Events emitted (via document.dispatchEvent on document):
 *   window:open, window:close, window:minimize, window:restore,
 *   window:focus, window:geometry, window:maximize, window:unmaximize
 */
(function () {
  'use strict';

  var windows = {};       // id -> state
  var order = [];         // open order, for stable list()
  var elements = {};      // id -> root DOM element
  var iframeRefs = {};    // id -> iframe element (for load tracking)
  var contentRefs = {};   // id -> content host
  var taskbarBtns = {};   // id -> taskbar-running button
  var idCounter = 0;
  var zCounter = 1000;
  var activeId = null;
  var layerEl = null;
  var snapPreviewEl = null;
  var taskbarRunningEl = null;

  var DEFAULT_W_DESKTOP = 800;
  var DEFAULT_H_DESKTOP = 600;
  var MIN_W = 320;
  var MIN_H = 200;
  var SNAP_THRESHOLD = 16;

  // ---------- helpers ----------

  function isMobile() {
    return window.innerWidth <= 639;
  }

  function taskbarHeight() {
    var v = getComputedStyle(document.documentElement).getPropertyValue('--taskbar-height');
    var n = parseInt((v || '32').trim(), 10);
    return isFinite(n) ? n : 32;
  }

  function emit(name, detail) {
    try {
      var ev = new CustomEvent(name, { detail: detail || {} });
      document.dispatchEvent(ev);
    } catch (e) {}
  }

  function clamp(n, min, max) {
    if (n < min) return min;
    if (n > max) return max;
    return n;
  }

  function nextId() {
    idCounter += 1;
    return 'win_' + idCounter;
  }

  function defaultPosition(idx) {
    var base = 64;
    var step = 32;
    return { x: base + (idx % 8) * step, y: base + (idx % 8) * step };
  }

  function defaultSize() {
    if (isMobile()) {
      return { w: Math.round(window.innerWidth * 0.95), h: Math.round(window.innerHeight * 0.9) };
    }
    return { w: DEFAULT_W_DESKTOP, h: DEFAULT_H_DESKTOP };
  }

  function ensureLayer() {
    if (layerEl) return layerEl;
    layerEl = document.getElementById('window-layer');
    if (!layerEl) {
      layerEl = document.createElement('div');
      layerEl.id = 'window-layer';
      document.body.appendChild(layerEl);
    }
    if (!snapPreviewEl) {
      snapPreviewEl = document.createElement('div');
      snapPreviewEl.className = 'snap-preview';
      document.body.appendChild(snapPreviewEl);
    }
    if (!taskbarRunningEl) {
      taskbarRunningEl = document.getElementById('taskbar-running');
    }
    return layerEl;
  }

  function applyGeometry(el, state) {
    el.style.setProperty('--win-x', state.x + 'px');
    el.style.setProperty('--win-y', state.y + 'px');
    el.style.setProperty('--win-w', state.w + 'px');
    el.style.setProperty('--win-h', state.h + 'px');
    el.style.zIndex = String(state.z);
  }

  function setActive(id) {
    activeId = id;
    for (var k in elements) {
      if (Object.prototype.hasOwnProperty.call(elements, k)) {
        if (k === id) elements[k].classList.add('active');
        else elements[k].classList.remove('active');
      }
    }
    for (var b in taskbarBtns) {
      if (Object.prototype.hasOwnProperty.call(taskbarBtns, b)) {
        if (b === id) taskbarBtns[b].classList.add('active');
        else taskbarBtns[b].classList.remove('active');
      }
    }
  }

  function persist() {
    if (!window.Session || typeof window.Session.patch !== 'function') return;
    var serialized = [];
    for (var i = 0; i < order.length; i++) {
      var s = windows[order[i]];
      if (!s) continue;
      // Exclude content (DOM nodes can't serialize); keep url
      serialized.push({
        id: s.id,
        app: s.app,
        project: s.project,
        title: s.title,
        url: s.url,
        x: s.x, y: s.y, w: s.w, h: s.h,
        z: s.z,
        minimized: !!s.minimized,
        maximized: !!s.maximized,
        prevRect: s.prevRect || null
      });
    }
    try { window.Session.patch({ windows: serialized }); } catch (e) {}
  }

  // ---------- DOM construction ----------

  function buildDom(state, opts) {
    var root = document.createElement('div');
    root.className = 'os-window';
    root.setAttribute('data-window-id', state.id);
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-label', state.title || 'Window');

    // Title bar
    var bar = document.createElement('div');
    bar.className = 'os-window-titlebar';

    var controls = document.createElement('div');
    controls.className = 'os-window-controls';

    var closeBtn = document.createElement('button');
    closeBtn.className = 'os-window-btn close';
    closeBtn.setAttribute('aria-label', 'Close');
    closeBtn.textContent = '●';
    closeBtn.addEventListener('click', function (e) { e.stopPropagation(); api.close(state.id); });

    var minBtn = document.createElement('button');
    minBtn.className = 'os-window-btn min';
    minBtn.setAttribute('aria-label', 'Minimize');
    minBtn.textContent = '●';
    minBtn.addEventListener('click', function (e) { e.stopPropagation(); api.minimize(state.id); });

    var maxBtn = document.createElement('button');
    maxBtn.className = 'os-window-btn max';
    maxBtn.setAttribute('aria-label', 'Maximize');
    maxBtn.textContent = '●';
    maxBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (state.maximized) api.unmaximize(state.id);
      else api.maximize(state.id);
    });

    controls.appendChild(closeBtn);
    controls.appendChild(minBtn);
    controls.appendChild(maxBtn);

    var titleEl = document.createElement('span');
    titleEl.className = 'os-window-title';
    titleEl.textContent = state.title || '';

    bar.appendChild(controls);
    bar.appendChild(titleEl);

    // Menubar (native apps only — iframe windows skip)
    var menubar = null;
    if (!state.url && opts && opts.menubar && opts.menubar.length) {
      menubar = document.createElement('div');
      menubar.className = 'os-window-menubar';
      for (var mi = 0; mi < opts.menubar.length; mi++) {
        (function (m) {
          var item = document.createElement('button');
          item.type = 'button';
          item.className = 'os-window-menu-item';
          item.textContent = m.label;
          if (m.items && m.items.length) {
            item.addEventListener('click', function (e) {
              e.stopPropagation();
              openMenubarDropdown(item, m.items);
            });
          }
          menubar.appendChild(item);
        })(opts.menubar[mi]);
      }
    }

    // Body
    var body = document.createElement('div');
    body.className = 'os-window-body';

    var loading = document.createElement('div');
    loading.className = 'os-window-loading';
    loading.innerHTML = '> loading...<span class="cursor">█</span>';

    if (state.url) {
      var iframe = document.createElement('iframe');
      iframe.className = 'os-window-iframe';
      iframe.setAttribute('allow', 'fullscreen; autoplay');
      root.classList.add('loading');
      iframe.addEventListener('load', function () {
        iframe.classList.add('loaded');
        loading.classList.add('hidden');
        root.classList.remove('loading');
      });
      iframe.src = state.url;
      body.appendChild(iframe);
      body.appendChild(loading);
      iframeRefs[state.id] = iframe;
      // Fallback hide loader after 10s
      setTimeout(function () {
        if (loading) loading.classList.add('hidden');
      }, 10000);
    } else if (opts && opts.content !== undefined && opts.content !== null) {
      var host = document.createElement('div');
      host.className = 'os-window-content';
      if (typeof opts.content === 'string') {
        host.innerHTML = opts.content;
      } else if (opts.content && opts.content.nodeType === 1) {
        host.appendChild(opts.content);
      }
      body.appendChild(host);
      contentRefs[state.id] = host;
    } else {
      // empty content host
      var emptyHost = document.createElement('div');
      emptyHost.className = 'os-window-content';
      body.appendChild(emptyHost);
      contentRefs[state.id] = emptyHost;
    }

    // Status bar (native apps only)
    var statusbar = null;
    if (!state.url && opts && opts.statusbar) {
      statusbar = document.createElement('div');
      statusbar.className = 'os-window-statusbar';
      if (typeof opts.statusbar === 'string') {
        statusbar.textContent = opts.statusbar;
      } else if (opts.statusbar.nodeType === 1) {
        statusbar.appendChild(opts.statusbar);
      }
    }

    root.appendChild(bar);
    if (menubar) root.appendChild(menubar);
    root.appendChild(body);
    if (statusbar) root.appendChild(statusbar);

    // Resize handles (desktop only — mobile CSS hides them)
    var handles = ['n', 'e', 's', 'w', 'ne', 'nw', 'se', 'sw'];
    for (var i = 0; i < handles.length; i++) {
      var h = document.createElement('div');
      h.className = 'os-window-resize ' + handles[i];
      h.setAttribute('data-resize-dir', handles[i]);
      root.appendChild(h);
    }

    // Wire focus, drag, resize
    root.addEventListener('mousedown', function () { api.bringToFront(state.id); });
    root.addEventListener('pointerdown', function () { api.bringToFront(state.id); });

    attachDrag(root, bar, state);
    attachResize(root, state);

    // Double-click title bar = toggle maximize
    bar.addEventListener('dblclick', function (e) {
      // Ignore double click on buttons
      if (e.target && e.target.closest('.os-window-btn')) return;
      if (state.maximized) api.unmaximize(state.id);
      else api.maximize(state.id);
    });

    return root;
  }

  // ---------- menubar dropdown ----------

  var openMenu = null;

  function closeOpenMenu() {
    if (openMenu && openMenu.parentNode) openMenu.parentNode.removeChild(openMenu);
    openMenu = null;
    document.removeEventListener('click', onMenuOutside, true);
  }

  function onMenuOutside(e) {
    if (!openMenu) return;
    if (e.target && e.target.closest && e.target.closest('.os-window-menu-dropdown')) return;
    closeOpenMenu();
  }

  function openMenubarDropdown(anchor, items) {
    closeOpenMenu();
    var rect = anchor.getBoundingClientRect();
    var menu = document.createElement('div');
    menu.className = 'os-window-menu-dropdown';
    menu.style.position = 'fixed';
    menu.style.top = (rect.bottom + 2) + 'px';
    menu.style.left = rect.left + 'px';
    menu.style.zIndex = String((window.Layer && window.Layer.CONTEXT_MENU) || 5000);
    for (var i = 0; i < items.length; i++) {
      (function (it) {
        if (it === '---') {
          var sep = document.createElement('div');
          sep.className = 'os-window-menu-sep';
          menu.appendChild(sep);
          return;
        }
        var row = document.createElement('button');
        row.type = 'button';
        row.className = 'os-window-menu-row';
        if (it.disabled) row.classList.add('disabled');
        row.textContent = it.label;
        if (it.shortcut) {
          var sh = document.createElement('span');
          sh.className = 'os-window-menu-shortcut';
          sh.textContent = it.shortcut;
          row.appendChild(sh);
        }
        row.addEventListener('click', function (e) {
          e.stopPropagation();
          if (it.disabled) return;
          closeOpenMenu();
          if (typeof it.action === 'function') it.action();
        });
        menu.appendChild(row);
      })(items[i]);
    }
    document.body.appendChild(menu);
    openMenu = menu;
    setTimeout(function () {
      document.addEventListener('click', onMenuOutside, true);
    }, 0);
  }

  // ---------- drag ----------

  function attachDrag(root, bar, state) {
    var dragging = false;
    var startX = 0, startY = 0;
    var origX = 0, origY = 0;
    var snapZone = null;
    var pointerId = null;

    function onDown(e) {
      // Ignore drag if mousedown started on a button
      if (e.target && e.target.closest && e.target.closest('.os-window-btn')) return;
      // Ignore on mobile
      if (isMobile()) return;
      // Don't drag if maximized — unmaximize first
      if (state.maximized) {
        api.unmaximize(state.id);
        // Recompute orig from updated state
      }
      dragging = true;
      pointerId = e.pointerId;
      startX = e.clientX;
      startY = e.clientY;
      origX = state.x;
      origY = state.y;
      root.classList.add('dragging');
      document.body.classList.add('dragging');
      try { bar.setPointerCapture && bar.setPointerCapture(pointerId); } catch (err) {}
      e.preventDefault();
    }

    function onMove(e) {
      if (!dragging) return;
      var dx = e.clientX - startX;
      var dy = e.clientY - startY;
      var nx = origX + dx;
      var ny = origY + dy;
      // Clamp inside layer (allow some overflow but keep title visible)
      var th = taskbarHeight();
      ny = clamp(ny, -0, Math.max(0, window.innerHeight - th - 32));
      nx = clamp(nx, -(state.w - 80), window.innerWidth - 80);
      state.x = nx;
      state.y = ny;
      applyGeometry(root, state);

      // Snap detection
      var z = detectSnapZone(e.clientX, e.clientY);
      if (z !== snapZone) {
        snapZone = z;
        showSnapPreview(z);
      }
    }

    function onUp(e) {
      if (!dragging) return;
      dragging = false;
      root.classList.remove('dragging');
      document.body.classList.remove('dragging');
      hideSnapPreview();
      try { bar.releasePointerCapture && pointerId != null && bar.releasePointerCapture(pointerId); } catch (err) {}
      pointerId = null;

      if (snapZone) {
        applySnap(state.id, snapZone);
        snapZone = null;
      } else {
        emit('window:geometry', { id: state.id });
        persist();
      }
    }

    bar.addEventListener('pointerdown', onDown);
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
    document.addEventListener('pointercancel', onUp);
  }

  // ---------- resize ----------

  function attachResize(root, state) {
    var resizing = false;
    var dir = null;
    var startX = 0, startY = 0;
    var origX = 0, origY = 0, origW = 0, origH = 0;
    var pointerId = null;

    function onDown(e) {
      var handle = e.target && e.target.closest && e.target.closest('.os-window-resize');
      if (!handle) return;
      if (isMobile()) return;
      if (state.maximized) return;
      dir = handle.getAttribute('data-resize-dir');
      resizing = true;
      pointerId = e.pointerId;
      startX = e.clientX;
      startY = e.clientY;
      origX = state.x;
      origY = state.y;
      origW = state.w;
      origH = state.h;
      root.classList.add('resizing');
      document.body.classList.add('resizing-' + dir);
      try { handle.setPointerCapture && handle.setPointerCapture(pointerId); } catch (err) {}
      e.preventDefault();
      e.stopPropagation();
    }

    function onMove(e) {
      if (!resizing) return;
      var dx = e.clientX - startX;
      var dy = e.clientY - startY;
      var nx = origX, ny = origY, nw = origW, nh = origH;

      if (dir.indexOf('e') !== -1) nw = origW + dx;
      if (dir.indexOf('w') !== -1) { nw = origW - dx; nx = origX + dx; }
      if (dir.indexOf('s') !== -1) nh = origH + dy;
      if (dir.indexOf('n') !== -1) { nh = origH - dy; ny = origY + dy; }

      if (nw < MIN_W) {
        if (dir.indexOf('w') !== -1) nx = origX + (origW - MIN_W);
        nw = MIN_W;
      }
      if (nh < MIN_H) {
        if (dir.indexOf('n') !== -1) ny = origY + (origH - MIN_H);
        nh = MIN_H;
      }

      // Bound to viewport
      var th = taskbarHeight();
      var maxW = window.innerWidth;
      var maxH = window.innerHeight - th;
      if (nw > maxW) nw = maxW;
      if (nh > maxH) nh = maxH;

      state.x = nx; state.y = ny; state.w = nw; state.h = nh;
      applyGeometry(root, state);
    }

    function onUp(e) {
      if (!resizing) return;
      resizing = false;
      root.classList.remove('resizing');
      if (dir) document.body.classList.remove('resizing-' + dir);
      dir = null;
      pointerId = null;
      emit('window:geometry', { id: state.id });
      persist();
    }

    root.addEventListener('pointerdown', onDown);
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
    document.addEventListener('pointercancel', onUp);
  }

  // ---------- snap ----------

  function detectSnapZone(mouseX, mouseY) {
    if (isMobile()) return null;
    var th = taskbarHeight();
    if (mouseY <= th + SNAP_THRESHOLD) return 'top';
    if (mouseX <= SNAP_THRESHOLD) return 'left';
    if (mouseX >= window.innerWidth - SNAP_THRESHOLD) return 'right';
    return null;
  }

  function snapRect(zone) {
    var th = taskbarHeight();
    var vw = window.innerWidth;
    var vh = window.innerHeight - th;
    if (zone === 'left') return { x: 0, y: 0, w: Math.floor(vw / 2), h: vh };
    if (zone === 'right') return { x: Math.floor(vw / 2), y: 0, w: Math.ceil(vw / 2), h: vh };
    if (zone === 'top') return { x: 0, y: 0, w: vw, h: vh };
    return null;
  }

  function showSnapPreview(zone) {
    if (!snapPreviewEl) return;
    if (!zone) { hideSnapPreview(); return; }
    var r = snapRect(zone);
    if (!r) { hideSnapPreview(); return; }
    var th = taskbarHeight();
    snapPreviewEl.style.top = (th + r.y) + 'px';
    snapPreviewEl.style.left = r.x + 'px';
    snapPreviewEl.style.width = r.w + 'px';
    snapPreviewEl.style.height = r.h + 'px';
    snapPreviewEl.classList.add('show');
  }

  function hideSnapPreview() {
    if (!snapPreviewEl) return;
    snapPreviewEl.classList.remove('show');
  }

  function applySnap(id, zone) {
    var state = windows[id];
    var el = elements[id];
    if (!state || !el) return;
    if (zone === 'top') {
      api.maximize(id);
      return;
    }
    var r = snapRect(zone);
    if (!r) return;
    // Save prevRect if not maximized so unsnap works similarly to unmaximize
    if (!state.maximized) {
      state.prevRect = { x: state.x, y: state.y, w: state.w, h: state.h };
    }
    state.x = r.x; state.y = r.y; state.w = r.w; state.h = r.h;
    state.maximized = false;
    el.classList.remove('maximized');
    applyGeometry(el, state);
    emit('window:geometry', { id: id });
    persist();
  }

  // ---------- public API ----------

  function open(opts) {
    opts = opts || {};
    ensureLayer();

    var id = opts.id || nextId();
    if (windows[id]) {
      // already exists — just bring to front
      bringToFront(id);
      return id;
    }

    var openCount = order.length;
    var pos = (opts.x != null && opts.y != null)
      ? { x: opts.x, y: opts.y }
      : defaultPosition(openCount);
    var size = defaultSize();
    var w = opts.w != null ? opts.w : size.w;
    var h = opts.h != null ? opts.h : size.h;

    var state = {
      id: id,
      app: opts.app || null,
      project: opts.project || null,
      title: opts.title || (opts.app || 'window'),
      url: opts.url || null,
      content: null, // never persist DOM
      x: pos.x,
      y: pos.y,
      w: w,
      h: h,
      z: ++zCounter,
      minimized: false,
      maximized: false,
      prevRect: null
    };

    var root = buildDom(state, opts);
    applyGeometry(root, state);
    layerEl.appendChild(root);

    windows[id] = state;
    order.push(id);
    elements[id] = root;

    addTaskbarButton(state);
    setActive(id);

    // Open animation — origin from click coords if provided
    if (window.Anim && typeof window.Anim.scaleIn === 'function') {
      var origin = 'center center';
      if (opts.originX != null && opts.originY != null) {
        var rect = root.getBoundingClientRect();
        var ox = ((opts.originX - rect.left) / rect.width) * 100;
        var oy = ((opts.originY - rect.top) / rect.height) * 100;
        origin = ox + '% ' + oy + '%';
      }
      window.Anim.scaleIn(root, { from: 0.92, dur: 180, origin: origin });
    }

    emit('window:open', { id: id, state: state });
    persist();
    return id;
  }

  function close(id) {
    var state = windows[id];
    var el = elements[id];
    if (!state) return;

    var doRemove = function () {
      if (el && el.parentNode) el.parentNode.removeChild(el);
      delete elements[id];
      delete windows[id];
      delete iframeRefs[id];
      delete contentRefs[id];
      var idx = order.indexOf(id);
      if (idx !== -1) order.splice(idx, 1);
      removeTaskbarButton(id);
      if (activeId === id) {
        activeId = null;
        // Pick the topmost remaining window
        var top = null, topZ = -1;
        for (var k in windows) {
          if (Object.prototype.hasOwnProperty.call(windows, k) && !windows[k].minimized) {
            if (windows[k].z > topZ) { topZ = windows[k].z; top = k; }
          }
        }
        if (top) setActive(top);
      }
      emit('window:close', { id: id });
      persist();
    };

    if (el && window.Anim && typeof window.Anim.scaleOut === 'function' && !window.Anim.reduced()) {
      window.Anim.scaleOut(el, { to: 0.92, dur: 140 }).then(doRemove);
    } else {
      doRemove();
    }
  }

  function minimize(id) {
    var state = windows[id];
    var el = elements[id];
    if (!state || !el) return;

    var finish = function () {
      state.minimized = true;
      el.classList.add('minimized');
      // Reset transform so restoring at full scale works cleanly
      el.style.transform = '';
      el.style.opacity = '';
      applyGeometry(el, state);
      if (taskbarBtns[id]) taskbarBtns[id].classList.add('minimized');
      if (activeId === id) {
        activeId = null;
        el.classList.remove('active');
        if (taskbarBtns[id]) taskbarBtns[id].classList.remove('active');
      }
      emit('window:minimize', { id: id });
      persist();
    };

    var btn = taskbarBtns[id];
    if (btn && window.Anim && typeof window.Anim.genie === 'function' && !window.Anim.reduced()) {
      var br = btn.getBoundingClientRect();
      var target = { x: br.left, y: br.top, w: br.width, h: br.height };
      window.Anim.genie(el, target, { dur: 280 }).then(finish);
    } else {
      finish();
    }
  }

  function restore(id) {
    var state = windows[id];
    var el = elements[id];
    if (!state || !el) return;
    state.minimized = false;
    el.classList.remove('minimized');
    if (taskbarBtns[id]) taskbarBtns[id].classList.remove('minimized');

    var btn = taskbarBtns[id];
    if (btn && window.Anim && typeof window.Anim.ungenie === 'function') {
      var br = btn.getBoundingClientRect();
      window.Anim.ungenie(el, { x: br.left, y: br.top, w: br.width, h: br.height }, { dur: 260 });
    }

    bringToFront(id);
    emit('window:restore', { id: id });
    persist();
  }

  function maximize(id) {
    var state = windows[id];
    var el = elements[id];
    if (!state || !el) return;
    if (state.maximized) return;
    state.prevRect = { x: state.x, y: state.y, w: state.w, h: state.h };
    var th = taskbarHeight();
    state.x = 0;
    state.y = 0;
    state.w = window.innerWidth;
    state.h = window.innerHeight - th;
    state.maximized = true;
    el.classList.add('maximized');
    applyGeometry(el, state);
    bringToFront(id);
    emit('window:maximize', { id: id });
    persist();
  }

  function unmaximize(id) {
    var state = windows[id];
    var el = elements[id];
    if (!state || !el) return;
    if (!state.maximized) return;
    if (state.prevRect) {
      state.x = state.prevRect.x;
      state.y = state.prevRect.y;
      state.w = state.prevRect.w;
      state.h = state.prevRect.h;
    }
    state.maximized = false;
    state.prevRect = null;
    el.classList.remove('maximized');
    applyGeometry(el, state);
    emit('window:unmaximize', { id: id });
    persist();
  }

  function bringToFront(id) {
    var state = windows[id];
    var el = elements[id];
    if (!state || !el) return;
    state.z = ++zCounter;
    el.style.zIndex = String(state.z);
    if (state.minimized) {
      state.minimized = false;
      el.classList.remove('minimized');
      if (taskbarBtns[id]) taskbarBtns[id].classList.remove('minimized');
    }
    setActive(id);
    emit('window:focus', { id: id });
    // Don't persist on every focus — too chatty. Save z on geometry/close events.
  }

  function list() {
    var out = [];
    for (var i = 0; i < order.length; i++) {
      if (windows[order[i]]) out.push(windows[order[i]]);
    }
    return out;
  }

  function get(id) {
    return windows[id] || null;
  }

  function byApp(appName) {
    var out = [];
    for (var i = 0; i < order.length; i++) {
      var s = windows[order[i]];
      if (s && s.app === appName) out.push(s);
    }
    return out;
  }

  function snapActive(direction) {
    if (!activeId) return;
    if (direction === 'left') applySnap(activeId, 'left');
    else if (direction === 'right') applySnap(activeId, 'right');
    else if (direction === 'up' || direction === 'maximize') maximize(activeId);
    else if (direction === 'down' || direction === 'restore') {
      var s = windows[activeId];
      if (s && s.maximized) unmaximize(activeId);
      else if (s) minimize(activeId);
    }
  }

  // ---------- taskbar running strip (B07) ----------

  function addTaskbarButton(state) {
    if (!taskbarRunningEl) {
      taskbarRunningEl = document.getElementById('taskbar-running');
    }
    if (!taskbarRunningEl) return;
    var btn = document.createElement('button');
    btn.className = 'taskbar-app';
    btn.setAttribute('data-window-id', state.id);
    btn.setAttribute('type', 'button');
    btn.title = state.title || '';
    btn.textContent = state.title || state.app || state.id;

    btn.addEventListener('click', function (e) {
      e.preventDefault();
      var s = windows[state.id];
      if (!s) return;
      if (s.minimized) {
        restore(state.id);
      } else if (activeId === state.id) {
        minimize(state.id);
      } else {
        bringToFront(state.id);
      }
    });

    btn.addEventListener('contextmenu', function (e) {
      e.preventDefault();
      var ok = false;
      try { ok = window.confirm('close ' + (state.title || state.id) + '?'); } catch (err) {}
      if (ok) close(state.id);
    });

    // E08 — hover thumbnail tooltip
    var hoverTimer = null;
    btn.addEventListener('mouseenter', function (e) {
      if (e.pointerType === 'touch') return;
      var delay = (window.Anim && Anim.reduced && Anim.reduced()) ? 0 : 200;
      hoverTimer = setTimeout(function () {
        showThumb(btn, state);
      }, delay);
    });
    btn.addEventListener('mouseleave', function () {
      if (hoverTimer) { clearTimeout(hoverTimer); hoverTimer = null; }
      hideThumb();
    });
    btn.addEventListener('mousedown', function () {
      if (hoverTimer) { clearTimeout(hoverTimer); hoverTimer = null; }
      hideThumb();
    });

    taskbarRunningEl.appendChild(btn);
    taskbarBtns[state.id] = btn;
  }

  // Singleton thumbnail tooltip
  var thumbEl = null;
  function showThumb(btn, state) {
    hideThumb();
    var s = windows[state.id];
    if (!s) return;
    thumbEl = document.createElement('div');
    thumbEl.className = 'taskbar-thumb';
    thumbEl.style.zIndex = (window.Layer && Layer.POPOUTS) ? (Layer.POPOUTS - 1) : 3999;
    var glyph = (state.app === 'files' ? '▤' :
                 state.app === 'mail' ? '✉' :
                 state.app === 'settings' ? '⚙' :
                 state.app === 'cv' ? '📄' :
                 state.app === 'apps' ? '▦' :
                 state.app === 'text-viewer' ? '◫' : '▣');
    thumbEl.innerHTML =
      '<div class="taskbar-thumb-card">' +
        '<div class="taskbar-thumb-glyph">' + glyph + '</div>' +
      '</div>' +
      '<div class="taskbar-thumb-title"></div>';
    thumbEl.querySelector('.taskbar-thumb-title').textContent = state.title || state.app || '';
    document.body.appendChild(thumbEl);
    var br = btn.getBoundingClientRect();
    var tw = thumbEl.offsetWidth;
    var left = br.left + (br.width / 2) - (tw / 2);
    if (left < 4) left = 4;
    if (left + tw > window.innerWidth - 4) left = window.innerWidth - tw - 4;
    var top = br.top - thumbEl.offsetHeight - 8;
    if (top < 4) top = br.bottom + 8;
    thumbEl.style.left = left + 'px';
    thumbEl.style.top = top + 'px';
  }
  function hideThumb() {
    if (thumbEl && thumbEl.parentNode) thumbEl.parentNode.removeChild(thumbEl);
    thumbEl = null;
  }

  function removeTaskbarButton(id) {
    var btn = taskbarBtns[id];
    if (btn && btn.parentNode) btn.parentNode.removeChild(btn);
    delete taskbarBtns[id];
  }

  // ---------- session restore (B09) ----------

  function restoreSession() {
    if (!window.Session || typeof window.Session.get !== 'function') return;
    var saved = window.Session.get('windows');
    if (!Array.isArray(saved) || saved.length === 0) return;
    ensureLayer();
    for (var i = 0; i < saved.length; i++) {
      var s = saved[i];
      if (!s) continue;
      // Skip iframe windows — they're ephemeral
      if (s.url) continue;
      // Skip windows without a recognized native app — we have no content to render
      if (!s.app) continue;
      try {
        var id = open({
          id: s.id,
          app: s.app,
          project: s.project,
          title: s.title,
          x: s.x, y: s.y, w: s.w, h: s.h
        });
        if (s.minimized) minimize(id);
        if (s.maximized) maximize(id);
      } catch (e) {}
    }
  }

  // ---------- shortcuts (B08) ----------

  function registerShortcuts() {
    if (!window.Shortcuts || typeof window.Shortcuts.add !== 'function') return;
    var when = function () { return activeId != null && !isMobile(); };

    var combos = [
      { combo: 'Meta+ArrowLeft', dir: 'left', label: 'Snap window to left half' },
      { combo: 'Meta+ArrowRight', dir: 'right', label: 'Snap window to right half' },
      { combo: 'Meta+ArrowUp', dir: 'up', label: 'Maximize window' },
      { combo: 'Meta+ArrowDown', dir: 'down', label: 'Restore / minimize window' },
      // Cross-platform aliases (Win key is unreliable in browsers)
      { combo: 'Ctrl+Alt+ArrowLeft', dir: 'left', label: 'Snap window to left half' },
      { combo: 'Ctrl+Alt+ArrowRight', dir: 'right', label: 'Snap window to right half' },
      { combo: 'Ctrl+Alt+ArrowUp', dir: 'up', label: 'Maximize window' },
      { combo: 'Ctrl+Alt+ArrowDown', dir: 'down', label: 'Restore / minimize window' }
    ];
    for (var i = 0; i < combos.length; i++) {
      (function (c) {
        window.Shortcuts.add({
          combo: c.combo,
          label: c.label,
          group: 'Windows',
          when: when,
          action: function () { snapActive(c.dir); }
        });
      })(combos[i]);
    }
  }

  // ---------- viewport resize handling ----------

  function onWindowResize() {
    // Re-clamp maximized windows to new viewport
    for (var k in windows) {
      if (!Object.prototype.hasOwnProperty.call(windows, k)) continue;
      var s = windows[k];
      var el = elements[k];
      if (!s || !el) continue;
      if (s.maximized) {
        var th = taskbarHeight();
        s.x = 0; s.y = 0;
        s.w = window.innerWidth;
        s.h = window.innerHeight - th;
        applyGeometry(el, s);
      }
    }
  }

  // ---------- init ----------

  function init() {
    ensureLayer();
    if (!taskbarRunningEl) {
      taskbarRunningEl = document.getElementById('taskbar-running');
    }
    registerShortcuts();
    window.addEventListener('resize', onWindowResize);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function setStatus(id, text) {
    var el = elements[id];
    if (!el) return;
    var sb = el.querySelector('.os-window-statusbar');
    if (sb) sb.textContent = text;
  }

  function setTitle(id, text) {
    var state = windows[id];
    var el = elements[id];
    if (!state || !el) return;
    state.title = text;
    var t = el.querySelector('.os-window-title');
    if (t) t.textContent = text;
    var btn = taskbarBtns[id];
    if (btn) btn.textContent = text;
    persist();
  }

  var api = {
    open: open,
    close: close,
    minimize: minimize,
    restore: restore,
    maximize: maximize,
    unmaximize: unmaximize,
    bringToFront: bringToFront,
    list: list,
    get: get,
    byApp: byApp,
    activeId: function () { return activeId; },
    snapActive: snapActive,
    restoreSession: restoreSession,
    setStatus: setStatus,
    setTitle: setTitle
  };

  window.WindowManager = api;
})();
