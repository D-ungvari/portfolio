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

  // Set maxlength on the input element
  this.inputEl.setAttribute('maxlength', this.maxInputLength);

  this._bindEvents();
}

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

Terminal.prototype._processCommand = function() {
  var raw = this.inputEl.value;

  // Echo the command to output
  this.outputHTML(
    '<span class="prompt">visitor@dave:~$&nbsp;</span><span style="color:#ffffff">' +
    this._escapeHTML(raw) + '</span>'
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
};

Terminal.prototype.activateInput = function() {
  this.isActive = true;
  this.inputLine.style.display = 'flex';
  this.inputEl.focus();
};

Terminal.prototype.deactivateInput = function() {
  this.isActive = false;
  this.inputLine.style.display = 'none';
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
