/**
 * Desktop module — renders the icon grid, manages selection, keyboard nav,
 * double-click launch, drag-to-trash easter egg.
 */
(function() {
  var terminalRef = null;
  var gridEl = null;
  var trashEl = null;
  var wallpaperEl = null;
  var icons = [];
  var selectedIndex = -1;

  var tooltipEl = null;
  var tooltipTimer = null;
  var tooltipIcon = null;

  var highlightTimer = null;

  function render() {
    if (!gridEl) return;
    gridEl.innerHTML = '';
    icons = [];
    if (typeof projects === 'undefined' || !projects.length) return;
    for (var i = 0; i < projects.length; i++) {
      var iconEl = createIcon(projects[i]);
      gridEl.appendChild(iconEl);
      icons.push(iconEl);
    }
  }

  function clearSelection() {
    for (var i = 0; i < icons.length; i++) {
      icons[i].classList.remove('selected');
      icons[i].setAttribute('tabindex', '-1');
    }
    selectedIndex = -1;
  }

  function selectIndex(i) {
    if (i < 0 || i >= icons.length) return;
    for (var j = 0; j < icons.length; j++) {
      if (j === i) {
        icons[j].classList.add('selected');
        icons[j].setAttribute('tabindex', '0');
      } else {
        icons[j].classList.remove('selected');
        icons[j].setAttribute('tabindex', '-1');
      }
    }
    selectedIndex = i;
    try { icons[i].focus(); } catch (e) {}
  }

  function launchSelected() {
    if (selectedIndex < 0 || selectedIndex >= icons.length) return;
    var p = icons[selectedIndex]._project;
    if (p) launchProject(p);
  }

  function launchProject(project) {
    if (!project) return;
    if (terminalRef && typeof terminalRef.output === 'function') {
      terminalRef.output('> launching ' + project.title.toLowerCase() + '...', 'accent');
    }
    if (typeof GameOverlay !== 'undefined' && GameOverlay && typeof GameOverlay.open === 'function') {
      GameOverlay.open(project.liveUrl, project.title, terminalRef);
    } else if (typeof window !== 'undefined' && window.open) {
      window.open(project.liveUrl, '_blank', 'noopener');
    }
  }

  function highlightProject(command) {
    for (var i = 0; i < icons.length; i++) {
      if (icons[i].getAttribute('data-cmd') === command) {
        icons[i].classList.add('selected');
        if (highlightTimer) clearTimeout(highlightTimer);
        (function(idx) {
          highlightTimer = setTimeout(function() {
            if (icons[idx]) icons[idx].classList.remove('selected');
            highlightTimer = null;
          }, 1500);
        })(i);
        return;
      }
    }
  }

  // Keyboard nav — figure out columns from grid template
  function getColumnCount() {
    if (!gridEl || icons.length === 0) return 1;
    var cs = window.getComputedStyle(gridEl);
    var tpl = cs.gridTemplateColumns || '';
    var cols = tpl.trim().split(/\s+/).filter(function(s) { return s.length > 0; }).length;
    if (cols >= 1) return cols;
    // Fallback: measure
    var iconW = icons[0].offsetWidth || 96;
    var gridW = gridEl.clientWidth || iconW;
    return Math.max(1, Math.floor(gridW / iconW));
  }

  function onGridKeydown(e) {
    if (icons.length === 0) return;
    var key = e.key;
    if (key !== 'ArrowUp' && key !== 'ArrowDown' && key !== 'ArrowLeft' &&
        key !== 'ArrowRight' && key !== 'Enter' && key !== ' ') {
      return;
    }
    e.preventDefault();
    var cols = getColumnCount();
    var idx = selectedIndex >= 0 ? selectedIndex : 0;

    if (key === 'Enter' || key === ' ') {
      if (selectedIndex < 0) selectIndex(0);
      else launchSelected();
      return;
    }
    if (key === 'ArrowRight') {
      idx = (idx + 1) % icons.length;
    } else if (key === 'ArrowLeft') {
      idx = (idx - 1 + icons.length) % icons.length;
    } else if (key === 'ArrowDown') {
      idx = idx + cols;
      if (idx >= icons.length) {
        idx = idx % cols;
        if (idx >= icons.length) idx = icons.length - 1;
      }
    } else if (key === 'ArrowUp') {
      idx = idx - cols;
      if (idx < 0) {
        var col = (selectedIndex >= 0 ? selectedIndex : 0) % cols;
        var lastRow = Math.floor((icons.length - 1) / cols);
        idx = lastRow * cols + col;
        if (idx >= icons.length) idx = icons.length - 1;
      }
    }
    selectIndex(idx);
  }

  // Tooltip
  function clearTooltip() {
    if (tooltipTimer) {
      clearTimeout(tooltipTimer);
      tooltipTimer = null;
    }
    if (tooltipEl && tooltipEl.parentNode) {
      tooltipEl.parentNode.removeChild(tooltipEl);
    }
    tooltipEl = null;
    tooltipIcon = null;
  }

  function scheduleTooltip(icon, x, y) {
    clearTooltip();
    tooltipIcon = icon;
    tooltipTimer = setTimeout(function() {
      if (!tooltipIcon) return;
      var p = tooltipIcon._project;
      if (!p || !p.tagline) return;
      tooltipEl = document.createElement('div');
      tooltipEl.className = 'desktop-tooltip';
      tooltipEl.textContent = p.tagline;
      document.body.appendChild(tooltipEl);
      // Position near cursor; clamp to viewport
      var px = x + 14;
      var py = y + 18;
      var w = tooltipEl.offsetWidth;
      var h = tooltipEl.offsetHeight;
      var vw = window.innerWidth, vh = window.innerHeight;
      if (px + w > vw - 8) px = vw - w - 8;
      if (py + h > vh - 8) py = vh - h - 8;
      tooltipEl.style.left = px + 'px';
      tooltipEl.style.top = py + 'px';
    }, 500);
  }

  // Toast — delegates to Notify when available, falls back to inline toast.
  function showToast(text) {
    if (typeof window !== 'undefined' && window.Notify && typeof window.Notify.push === 'function') {
      window.Notify.push({ title: text });
      return;
    }
    var existing = document.querySelector('.desktop-toast');
    if (existing) existing.remove();
    var toast = document.createElement('div');
    toast.className = 'desktop-toast';
    toast.textContent = text;
    document.body.appendChild(toast);
    setTimeout(function() {
      toast.classList.add('fading');
      setTimeout(function() {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    }, 1500);
  }

  function attachIconHandlers() {
    if (!gridEl) return;

    // Click to select
    gridEl.addEventListener('click', function(e) {
      var icon = e.target.closest && e.target.closest('.desktop-icon');
      if (!icon) return;
      var idx = icons.indexOf(icon);
      if (idx >= 0) selectIndex(idx);
    });

    // Double-click to launch
    gridEl.addEventListener('dblclick', function(e) {
      var icon = e.target.closest && e.target.closest('.desktop-icon');
      if (!icon || !icon._project) return;
      launchProject(icon._project);
    });

    // Keyboard nav at the grid level
    gridEl.addEventListener('keydown', onGridKeydown);

    // Tooltip handlers
    gridEl.addEventListener('mouseover', function(e) {
      var icon = e.target.closest && e.target.closest('.desktop-icon');
      if (!icon || icon === tooltipIcon) return;
      scheduleTooltip(icon, e.clientX, e.clientY);
    });
    gridEl.addEventListener('mousemove', function(e) {
      // While tooltip is pending, follow cursor; once shown, leave it
      if (tooltipTimer && tooltipIcon) {
        // re-anchor pending tooltip to current pos
        // (no-op; final position computed when shown)
      }
      var icon = e.target.closest && e.target.closest('.desktop-icon');
      if (!icon && (tooltipTimer || tooltipEl)) {
        clearTooltip();
      }
    });
    gridEl.addEventListener('mouseleave', clearTooltip);
    gridEl.addEventListener('mousedown', clearTooltip);
    gridEl.addEventListener('scroll', clearTooltip, true);

    // Drag handlers
    gridEl.addEventListener('dragstart', function(e) {
      var icon = e.target.closest && e.target.closest('.desktop-icon');
      if (!icon || !icon._project) return;
      icon.classList.add('dragging');
      try {
        e.dataTransfer.setData('text/plain', icon._project.command || '');
        e.dataTransfer.effectAllowed = 'move';
      } catch (err) {}
      clearTooltip();
    });
    gridEl.addEventListener('dragend', function(e) {
      var icon = e.target.closest && e.target.closest('.desktop-icon');
      if (icon) icon.classList.remove('dragging');
    });
  }

  function attachWallpaperHandlers() {
    if (!wallpaperEl) return;
    wallpaperEl.addEventListener('click', function(e) {
      // Click on empty wallpaper deselects
      if (e.target === wallpaperEl || e.target === gridEl) {
        clearSelection();
      }
    });
  }

  function attachTrashHandlers() {
    if (!trashEl) return;

    trashEl.addEventListener('dragover', function(e) {
      e.preventDefault();
      try { e.dataTransfer.dropEffect = 'move'; } catch (err) {}
    });
    trashEl.addEventListener('dragenter', function(e) {
      e.preventDefault();
      trashEl.classList.add('drop-target');
    });
    trashEl.addEventListener('dragleave', function(e) {
      // Only clear when actually leaving the trash element
      if (e.target === trashEl) {
        trashEl.classList.remove('drop-target');
      }
    });
    trashEl.addEventListener('drop', function(e) {
      e.preventDefault();
      trashEl.classList.remove('drop-target');
      trashEl.classList.add('wiggle');
      showToast("nice try. that's a project, not a file.");
      setTimeout(function() {
        trashEl.classList.remove('wiggle');
      }, 400);
    });

    // Click on trash itself
    trashEl.addEventListener('click', function() {
      trashEl.classList.add('wiggle');
      showToast('the trash is decorative.');
      setTimeout(function() {
        trashEl.classList.remove('wiggle');
      }, 400);
    });
    trashEl.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        trashEl.click();
      }
    });
  }

  function init(termRef) {
    terminalRef = termRef;
    gridEl = document.getElementById('icon-grid');
    trashEl = document.getElementById('trash-icon');
    wallpaperEl = document.getElementById('desktop-wallpaper');

    if (!gridEl) return;

    render();
    attachIconHandlers();
    attachWallpaperHandlers();
    attachTrashHandlers();

    // Hook up context menu now that icons exist
    if (typeof window !== 'undefined' && window.ContextMenu &&
        typeof window.ContextMenu.attach === 'function') {
      window.ContextMenu.attach(gridEl, terminalRef);
    }

    // Wallpaper-level right-click context menu (desktop blank area)
    if (typeof window !== 'undefined' && window.ContextMenu &&
        typeof window.ContextMenu.attachWallpaper === 'function') {
      window.ContextMenu.attachWallpaper(wallpaperEl, terminalRef);
    }
  }

  if (typeof window !== 'undefined') {
    window.Desktop = {
      init: init,
      selectIndex: selectIndex,
      launchSelected: launchSelected,
      launchProject: launchProject,
      highlightProject: highlightProject
    };
  }
})();
