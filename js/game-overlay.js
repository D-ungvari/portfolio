/**
 * Game overlay — embeds projects in a full-screen iframe within the portfolio.
 */

var GameOverlay = (function() {
  var overlay = null;
  var iframe = null;
  var loadingEl = null;
  var titleEl = null;
  var terminalRef = null;
  var isOpen = false;
  var loadTimeout = null;

  function createDOM() {
    if (overlay) return;

    overlay = document.createElement('div');
    overlay.id = 'game-overlay';

    // Top bar
    var bar = document.createElement('div');
    bar.id = 'game-overlay-bar';

    titleEl = document.createElement('span');
    titleEl.className = 'game-overlay-title';
    bar.appendChild(titleEl);

    var closeBtn = document.createElement('button');
    closeBtn.id = 'game-overlay-close';
    // Show ESC on desktop, X on mobile
    var isMobile = window.innerWidth <= 768;
    closeBtn.textContent = isMobile ? '✕ CLOSE' : '[ ESC ]';
    closeBtn.addEventListener('click', function() {
      close();
    });
    bar.appendChild(closeBtn);

    overlay.appendChild(bar);

    // Loading indicator
    loadingEl = document.createElement('div');
    loadingEl.id = 'game-overlay-loading';
    overlay.appendChild(loadingEl);

    // Iframe
    iframe = document.createElement('iframe');
    iframe.id = 'game-iframe';
    iframe.setAttribute('allow', 'fullscreen; autoplay');
    iframe.addEventListener('load', function() {
      onIframeLoad();
    });
    overlay.appendChild(iframe);

    document.body.appendChild(overlay);

    // ESC key listener
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        e.stopPropagation();
        close();
      }
    });
  }

  function onIframeLoad() {
    if (loadTimeout) {
      clearTimeout(loadTimeout);
      loadTimeout = null;
    }
    if (loadingEl) {
      loadingEl.style.opacity = '0';
    }
    if (iframe) {
      iframe.classList.add('loaded');
    }
  }

  function open(url, title, terminal) {
    createDOM();

    // If already open with same URL, just ensure visible
    if (isOpen && iframe.src === url) return;

    terminalRef = terminal;
    isOpen = true;

    // Reset state
    iframe.classList.remove('loaded');
    iframe.src = 'about:blank';
    loadingEl.style.opacity = '1';
    loadingEl.innerHTML = '> loading ' + title.toLowerCase() + '...<span class="cursor">█</span>';
    titleEl.textContent = 'PLAYING: ' + title;

    // Show overlay
    overlay.classList.add('active');
    requestAnimationFrame(function() {
      requestAnimationFrame(function() {
        overlay.classList.add('visible');
      });
    });

    // Start loading
    iframe.src = url;

    // Blur terminal input
    if (terminal && terminal.inputEl) {
      terminal.inputEl.blur();
    }

    // Fallback timeout — show iframe after 10s regardless
    loadTimeout = setTimeout(function() {
      onIframeLoad();
    }, 10000);
  }

  function close() {
    if (!isOpen) return;
    isOpen = false;

    if (loadTimeout) {
      clearTimeout(loadTimeout);
      loadTimeout = null;
    }

    overlay.classList.remove('visible');

    // Wait for fade out then hide
    setTimeout(function() {
      overlay.classList.remove('active');
      iframe.classList.remove('loaded');
      iframe.src = 'about:blank';

      // Refocus terminal
      if (terminalRef && terminalRef.inputEl) {
        terminalRef.inputEl.focus();
      }
    }, 200);
  }

  return {
    open: open,
    close: close,
    isOpen: function() { return isOpen; }
  };
})();
