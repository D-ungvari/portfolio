/**
 * Hidden easter egg commands.
 */

registerCommand('/sudo', '', function(terminal) {
  terminal.output('permission denied. you\'re a visitor, not root.', 'error');
}, true);

registerCommand('/rm', '', function(terminal) {
  terminal.output('nice try. this portfolio has backups.', 'error');
}, true);

registerCommand('/rm -rf /', '', function(terminal) {
  terminal.output('nice try. this portfolio has backups.', 'error');
}, true);

registerCommand('/exit', '', function(terminal) {
  terminal.output('there is no exit. only /contact.', 'dim');
}, true);

registerCommand('/hire', '', function(terminal) {
  terminal.output('great idea. check /contact for details.', 'accent');
}, true);

registerCommand('hello', '', function(terminal) {
  terminal.output('hey! type /help to see what I can do.', 'dim');
}, true);

registerCommand('hi', '', function(terminal) {
  terminal.output('hey! type /help to see what I can do.', 'dim');
}, true);

registerCommand('/whoami', '', function(terminal) {
  terminal.output('visitor', 'dim');
}, true);

registerCommand('/date', '', function(terminal) {
  terminal.output(new Date().toString(), 'dim');
}, true);

registerCommand('/pwd', '', function(terminal) {
  terminal.output('/home/visitor/dave-portfolio', 'dim');
}, true);

registerCommand('/ls', '', function(terminal) {
  terminal.outputLines([
    'about.txt    contact.txt    projects/',
    '',
    'try /projects to see what I\'ve built.'
  ], 'dim');
}, true);

registerCommand('/cat', '', function(terminal) {
  terminal.output('usage: /about, /contact, or /projects', 'dim');
}, true);

registerCommand('/vim', '', function(terminal) {
  terminal.output('good luck exiting.', 'dim');
}, true);

registerCommand('/emacs', '', function(terminal) {
  terminal.output('this terminal is not an operating system.', 'dim');
}, true);

registerCommand('42', '', function(terminal) {
  terminal.output('the answer to life, the universe, and everything.', 'dim');
}, true);

// /neofetch — system info in ASCII art style
registerCommand('/neofetch', '', function(terminal) {
  var lines = [
    '        .--.          david@ungvari',
    '       |o_o |         ──────────────────',
    '       |:_/ |         OS: Portfolio Terminal v1.0',
    '      //   \\ \\        Shell: /commands',
    '     (|     | )       Theme: ' + (typeof currentTheme !== 'undefined' ? currentTheme : 'green'),
    '    /\'\\_   _/`\\       Projects: ' + projects.length,
    '    \\___)=(___/       Uptime: since page load',
    '                      Font: JetBrains Mono',
    '                      Resolution: ' + (typeof window !== 'undefined' ? window.innerWidth + 'x' + window.innerHeight : 'unknown')
  ];
  terminal.outputLines(lines, 'dim');
  terminal.output('');
}, true);

// /cowsay — wraps last command or message in a cow speech bubble
registerCommand('/cowsay', '', function(terminal) {
  var msg = 'moo! type /help for commands';
  var border = ' ' + '_'.repeat(msg.length + 2);
  var bottom = ' ' + '-'.repeat(msg.length + 2);
  terminal.outputLines([
    border,
    '< ' + msg + ' >',
    bottom,
    '        \\   ^__^',
    '         \\  (oo)\\_______',
    '            (__)\\       )\\/\\',
    '                ||----w |',
    '                ||     ||'
  ], 'dim');
  terminal.output('');
}, true);

// /fortune — random fortune cookie message
var fortunes = [
  'You will find a bug in production on a Friday afternoon.',
  'A semicolon will save your day.',
  'The best code is the code you never write.',
  'Your next commit will pass all tests on the first try.',
  'A wild undefined is not a function appears!',
  'You will refactor this later. (No you won\'t.)',
  'The CSS you wrote today will haunt you tomorrow.',
  'rm -rf node_modules && npm install. The classic fix.',
  'There are 10 types of people: those who understand binary.',
  'It works on my machine.',
  'The cloud is just someone else\'s computer.',
  'git push --force. What could go wrong?'
];

registerCommand('/fortune', '', function(terminal) {
  var index = Math.floor(Math.random() * fortunes.length);
  terminal.output('');
  terminal.output('  🥠 ' + fortunes[index], 'dim');
  terminal.output('');
}, true);

// /ping — responds like ping
registerCommand('/ping', '', function(terminal) {
  terminal.output('PONG! 0ms — you\'re already here.', 'dim');
}, true);

// /uptime — show time since page load
registerCommand('/uptime', '', function(terminal) {
  var elapsed = Date.now() - (typeof sessionStartTime !== 'undefined' ? sessionStartTime : Date.now());
  var mins = Math.floor(elapsed / 60000);
  var secs = Math.floor((elapsed % 60000) / 1000);
  terminal.output('up ' + mins + ' minutes, ' + secs + ' seconds', 'dim');
}, true);

// /echo — echoes back what comes after
registerCommand('/echo', '', function(terminal) {
  terminal.output('usage: just type something.', 'dim');
}, true);

// /credits — show credits
registerCommand('/credits', '', function(terminal) {
  terminal.outputLines([
    '',
    '  CREDITS',
    SEPARATOR,
    '',
    '  design & code    David Ungvari',
    '  font             JetBrains Mono',
    '  hosting          GitHub Pages',
    '  framework        none (vanilla js)',
    '  dependencies     0',
    '  lines of CSS     ~200',
    '  easter eggs      too many',
    '',
    '  built with ♥ and vanilla javascript.',
    '',
    SEPARATOR,
    ''
  ]);
}, true);

// /source — link to portfolio source code
registerCommand('/source', '', function(terminal) {
  terminal.output('');
  terminal.outputHTML(
    '  this portfolio is open source: <a href="https://github.com/D-ungvari/portfolio" target="_blank" rel="noopener">github.com/D-ungvari/portfolio</a>'
  );
  terminal.output('  built with vanilla html, css, and javascript.', 'dim');
  terminal.output('  no frameworks. no build step. just vibes.', 'dim');
  terminal.output('');
}, true);

// /weather — joke weather report
registerCommand('/weather', '', function(terminal) {
  terminal.outputLines([
    '',
    '  ☁️  localhost weather report',
    '  ─────────────────────',
    '  temp: 72°F / 22°C',
    '  humidity: 0% (it\'s a computer)',
    '  wind: 0 mph (no fans detected)',
    '  forecast: 100% chance of coding',
    ''
  ], 'dim');
}, true);

// /time — current time
registerCommand('/time', '', function(terminal) {
  var now = new Date();
  var hours = now.getHours().toString().padStart(2, '0');
  var mins = now.getMinutes().toString().padStart(2, '0');
  var secs = now.getSeconds().toString().padStart(2, '0');
  terminal.output(hours + ':' + mins + ':' + secs, 'dim');
}, true);

// /man — manual page joke
registerCommand('/man', '', function(terminal) {
  terminal.output('no manual entry for portfolio.', 'dim');
  terminal.output('try /help instead — it\'s much friendlier.', 'dim');
}, true);

// /npm — npm joke
registerCommand('/npm', '', function(terminal) {
  terminal.output('npm: command not found', 'error');
  terminal.output('this portfolio has zero dependencies. as god intended.', 'dim');
}, true);

// /git — git joke
registerCommand('/git', '', function(terminal) {
  terminal.output('On branch main', 'dim');
  terminal.output('nothing to commit, portfolio is clean', 'dim');
}, true);
