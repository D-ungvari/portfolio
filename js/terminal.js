/**
 * Terminal engine — manages input, output, command history, and scrolling.
 */
function Terminal(container) {
  this.container = container;
  this.body = container.querySelector('#terminal-body');
  this.outputEl = container.querySelector('#output');
  this.inputEl = container.querySelector('#command-input');
  this.inputDisplay = container.querySelector('#input-display');
  this.cursor = container.querySelector('#cursor');
  this.inputLine = container.querySelector('#input-line');
  this.history = [];
  this.historyIndex = -1;
  this.tempInput = '';
  this.isActive = false;
  this.onCommand = null;
  this.maxInputLength = 200;
  this.gitStatus = Terminal._newGitStatus();

  // Set maxlength on the input element
  this.inputEl.setAttribute('maxlength', this.maxInputLength);

  this._ensurePromptMarkup();
  this.inputEl.setAttribute('maxlength', this.maxInputLength);
  this._ensureModeIndicator();
  this._updatePrompt();
  this._setMode('normal');
  this._bindEvents();
}

Terminal._newGitStatus = function() {
  return {
    modified: Math.floor(Math.random() * 3),
    untracked: Math.floor(Math.random() * 2)
  };
};

Terminal.prototype._bindEvents = function() {
  var self = this;

  // Keep input focused when clicking anywhere on the terminal
  this.container.addEventListener('click', function(e) {
    if (self.isActive && !e.target.closest('a') && !e.target.closest('button')) {
      self.inputEl.focus();
    }
  });

  // Sync real input to display span
  this.inputEl.addEventListener('input', function() {
    self.inputDisplay.textContent = self.inputEl.value;
    self.cursor.classList.add('typing');
    clearTimeout(self._typingTimeout);
    self._typingTimeout = setTimeout(function() {
      self.cursor.classList.remove('typing');
    }, 150);
  });

  this.inputEl.addEventListener('focus', function() {
    self._setMode('insert');
  });

  this.inputEl.addEventListener('blur', function() {
    self._setMode('normal');
  });

  // Handle keydown for Enter, Up, Down
  this.inputEl.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      self._processCommand();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      self._historyUp();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      self._historyDown();
    } else if (e.key === 'Tab') {
      e.preventDefault();
      self._tabComplete();
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      self.clear();
    }
  });
};

Terminal.prototype.submit = function(cmd) {
  if (typeof cmd !== 'string') return;
  this.inputEl.value = cmd;
  this.inputDisplay.textContent = cmd;
  this._processCommand();
};

Terminal.prototype._processCommand = function() {
  var raw = this.inputEl.value;

  // Echo the command to output
  this.outputHTML(
    this._promptEchoHTML(this._escapeHTML(raw))
  );

  // Add to history if non-empty
  if (raw.trim() !== '') {
    this.history.push(raw);
  }
  this.historyIndex = -1;
  this.tempInput = '';

  // Clear input
  this.inputEl.value = '';
  this.inputDisplay.textContent = '';

  // Execute
  if (this.onCommand) {
    this.onCommand(raw);
  }
  this._updatePrompt();

  this._scrollToBottom();
};

Terminal.prototype._historyUp = function() {
  if (this.history.length === 0) return;

  if (this.historyIndex === -1) {
    this.tempInput = this.inputEl.value;
    this.historyIndex = this.history.length - 1;
  } else if (this.historyIndex > 0) {
    this.historyIndex--;
  }

  this.inputEl.value = this.history[this.historyIndex];
  this.inputDisplay.textContent = this.inputEl.value;
};

Terminal.prototype._historyDown = function() {
  if (this.historyIndex === -1) return;

  if (this.historyIndex < this.history.length - 1) {
    this.historyIndex++;
    this.inputEl.value = this.history[this.historyIndex];
  } else {
    this.historyIndex = -1;
    this.inputEl.value = this.tempInput;
  }

  this.inputDisplay.textContent = this.inputEl.value;
};

Terminal.prototype._tabComplete = function() {
  var val = this.inputEl.value.trim().toLowerCase();
  if (val === '' || typeof commandRegistry === 'undefined') return;

  var matches = [];
  for (var cmd in commandRegistry) {
    if (cmd.indexOf(val) === 0) {
      matches.push(cmd);
    }
  }

  if (matches.length === 1) {
    this.inputEl.value = matches[0];
    this.inputDisplay.textContent = matches[0];
  } else if (matches.length > 1) {
    this.output(matches.join('  '), 'dim');
  }
};

Terminal.prototype.output = function(text, className) {
  var div = document.createElement('div');
  div.className = 'output-line' + (className ? ' ' + className : '');
  div.textContent = text;
  this.outputEl.appendChild(div);
  this._scrollToBottom();
};

Terminal.prototype.outputHTML = function(html, className) {
  var div = document.createElement('div');
  div.className = 'output-block' + (className ? ' ' + className : '');
  div.innerHTML = html;
  this.outputEl.appendChild(div);
  this._scrollToBottom();
};

Terminal.prototype.outputLines = function(lines, className) {
  for (var i = 0; i < lines.length; i++) {
    this.output(lines[i], className);
  }
};

Terminal.prototype.clear = function() {
  this.outputEl.innerHTML = '';
  this.gitStatus = Terminal._newGitStatus();
  this._updatePrompt();
};

Terminal.prototype.activateInput = function() {
  this.isActive = true;
  this.inputLine.style.display = 'block';
  this.inputEl.focus();
  this._setMode('insert');
};

Terminal.prototype.deactivateInput = function() {
  this.isActive = false;
  this.inputLine.style.display = 'none';
  this._setMode('normal');
};

Terminal.prototype._scrollToBottom = function() {
  var self = this;
  requestAnimationFrame(function() {
    self.body.scrollTop = self.body.scrollHeight;
  });
};

Terminal.prototype._escapeHTML = function(str) {
  var div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
};

Terminal.prototype._ensurePromptMarkup = function() {
  if (!this.inputLine || this.inputLine.querySelector('.prompt-top')) return;
  this.inputLine.className = 'prompt prompt-shell';
  this.inputLine.innerHTML =
    '<div class="prompt-top">' +
      '<span class="prompt-corner">╭─</span>' +
      '<span class="prompt-segment prompt-user">visitor@dave-arch</span>' +
      '<span class="prompt-segment prompt-cwd">~/portfolio</span>' +
      '<span class="prompt-segment prompt-git">main !0 ?0</span>' +
    '</div>' +
    '<div class="prompt-bottom">' +
      '<span class="prompt-corner">╰─</span><span class="prompt-lambda">λ</span><span class="prompt-spacer">&nbsp;</span>' +
      '<span id="input-display"></span><span id="cursor" class="cursor" aria-hidden="true">█</span>' +
      '<input type="text" id="command-input" autofocus autocomplete="off" spellcheck="false" autocapitalize="off" aria-label="Terminal command input">' +
    '</div>';
  this.inputEl = this.container.querySelector('#command-input');
  this.inputDisplay = this.container.querySelector('#input-display');
  this.cursor = this.container.querySelector('#cursor');
};

Terminal.prototype._ensureModeIndicator = function() {
  var existing = this.container.querySelector('.terminal-mode');
  if (existing) {
    this.modeEl = existing;
    return;
  }
  this.modeEl = document.createElement('div');
  this.modeEl.className = 'terminal-mode normal';
  this.modeEl.textContent = '-- NORMAL --';
  this.container.appendChild(this.modeEl);
};

Terminal.prototype._setMode = function(mode) {
  if (!this.modeEl) return;
  var insert = mode === 'insert';
  this.modeEl.textContent = insert ? '-- INSERT --' : '-- NORMAL --';
  this.modeEl.classList.toggle('insert', insert);
  this.modeEl.classList.toggle('normal', !insert);
};

Terminal.prototype._cwdLabel = function() {
  var cwd = (window.FS && FS.cwd) ? FS.cwd() : '/home/visitor/portfolio';
  cwd = String(cwd || '/home/visitor/portfolio');
  cwd = cwd.replace(/^\/home\/visitor/, '~');
  if (cwd === '~') return '~';
  if (cwd.length <= 30) return cwd;
  return cwd.slice(0, 12) + '…' + cwd.slice(cwd.length - 15);
};

Terminal.prototype._gitLabel = function() {
  return 'main !' + this.gitStatus.modified + ' ?' + this.gitStatus.untracked;
};

Terminal.prototype._updatePrompt = function() {
  if (!this.inputLine) return;
  var cwd = this.inputLine.querySelector('.prompt-cwd');
  var git = this.inputLine.querySelector('.prompt-git');
  if (cwd) cwd.textContent = this._cwdLabel();
  if (git) {
    git.textContent = this._gitLabel();
    git.classList.toggle('dirty', this.gitStatus.modified > 0 || this.gitStatus.untracked > 0);
  }
};

Terminal.prototype._promptEchoHTML = function(inputHTML) {
  var cwd = this._escapeHTML(this._cwdLabel());
  var git = this._escapeHTML(this._gitLabel());
  var dirty = (this.gitStatus.modified > 0 || this.gitStatus.untracked > 0) ? ' dirty' : '';
  return '<div class="prompt-echo">' +
    '<div class="prompt-top">' +
      '<span class="prompt-corner">╭─</span>' +
      '<span class="prompt-segment prompt-user">visitor@dave-arch</span>' +
      '<span class="prompt-segment prompt-cwd">' + cwd + '</span>' +
      '<span class="prompt-segment prompt-git' + dirty + '">' + git + '</span>' +
    '</div>' +
    '<div class="prompt-bottom">' +
      '<span class="prompt-corner">╰─</span><span class="prompt-lambda">λ</span><span class="prompt-spacer">&nbsp;</span>' +
      '<span style="color:#ffffff">' + inputHTML + '</span>' +
    '</div>' +
  '</div>';
};
