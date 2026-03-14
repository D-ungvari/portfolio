/**
 * Extra commands: /history, /banner, /stats, /skills
 */

// /history — show command history
registerCommand('/history', 'show command history', function(terminal) {
  // Access history from the terminal instance
  // Since we don't have direct access, we use the global terminal ref
  var hist = terminal.history || [];
  if (hist.length === 0) {
    terminal.output('no commands in history yet.', 'dim');
    return;
  }
  terminal.output('command history:', 'dim');
  terminal.output(SEPARATOR, 'dim');
  terminal.output('');
  for (var i = 0; i < hist.length; i++) {
    var num = (i + 1).toString().padStart(4, ' ');
    terminal.output(num + '  ' + hist[i]);
  }
  terminal.output('');
}, false);

// /banner — replay the ASCII art welcome
registerCommand('/banner', 'show welcome banner', function(terminal) {
  showWelcome(terminal);
}, true);

// /skills — tech proficiency display
var skills = [
  { name: 'JavaScript', level: 95 },
  { name: 'HTML/CSS',   level: 90 },
  { name: 'Canvas 2D',  level: 85 },
  { name: 'Game Dev',   level: 80 },
  { name: 'Node.js',    level: 70 },
  { name: 'Git',        level: 85 }
];

function makeBar(percent, width) {
  width = width || 20;
  var filled = Math.round(percent / 100 * width);
  var empty = width - filled;
  return '█'.repeat(filled) + '░'.repeat(empty);
}

registerCommand('/skills', 'show tech skills', function(terminal) {
  terminal.output('> skills');
  terminal.output(SEPARATOR);
  terminal.output('');

  for (var i = 0; i < skills.length; i++) {
    var s = skills[i];
    var label = '  ' + s.name.padEnd(14);
    var bar = makeBar(s.level);
    var pct = (' ' + s.level + '%').padStart(5);
    terminal.output(label + bar + pct);
  }

  terminal.output('');
  terminal.output(SEPARATOR);
  terminal.output('');
});

// /stats — session statistics
var sessionStartTime = Date.now();
var commandCount = 0;

// Monkey-patch executeCommand to count commands
var _originalExecute = executeCommand;
executeCommand = function(rawInput, terminal) {
  if (rawInput.trim() !== '') commandCount++;
  return _originalExecute(rawInput, terminal);
};

registerCommand('/stats', 'show session stats', function(terminal) {
  var elapsed = Date.now() - sessionStartTime;
  var minutes = Math.floor(elapsed / 60000);
  var seconds = Math.floor((elapsed % 60000) / 1000);
  var timeStr = minutes > 0 ? minutes + 'm ' + seconds + 's' : seconds + 's';

  terminal.output('> session stats');
  terminal.output(SEPARATOR);
  terminal.output('');
  terminal.output('  commands run   ' + commandCount);
  terminal.output('  session time   ' + timeStr);
  terminal.output('  theme          ' + (typeof currentTheme !== 'undefined' ? currentTheme : 'green'));
  terminal.output('  history size   ' + (terminal.history ? terminal.history.length : 0));
  terminal.output('  projects       ' + projects.length);
  terminal.output('');
  terminal.output(SEPARATOR);
  terminal.output('');
}, true);
