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
  terminal.output('Vim 9.1 - no buffer. good luck exiting; type :q to quit.', 'dim');
}, true);

registerCommand('/nvim', '', function(terminal) {
  terminal.output('NVIM v0.10 - empty buffer opened. :q closes absolutely nothing.', 'dim');
}, true);

registerCommand(':q', '', function(terminal) {
  terminal.output('closed scratch buffer. terminal still here.', 'dim');
}, true);

registerCommand(':q!', '', function(terminal) {
  terminal.output('force quit ignored: no swap file, no buffer, no mercy.', 'dim');
}, true);

registerCommand(':wq', '', function(terminal) {
  terminal.output('E32: no file name. nothing written.', 'dim');
}, true);

registerCommand('btw', '', function(terminal) {
  terminal.outputHTML('<span style="color:var(--color-arch)">i use arch btw.</span>');
}, true);

function renderPackageTranscript(terminal, manager) {
  var name = manager || 'pacman';
  var lines;
  if (name === 'pacman') {
    lines = [
      ':: Synchronizing package databases...',
      ' core                  128.4 KiB   512 KiB/s 00:00 [################] 100%',
      ' extra                   8.2 MiB  6.66 MiB/s 00:01 [################] 100%',
      ' multilib              139.2 KiB   420 KiB/s 00:00 [################] 100%',
      ':: Starting full system upgrade...',
      'resolving dependencies...',
      'looking for conflicting packages...',
      'Packages (4) linux-6.8.9.arch1-1  zsh-5.9-5  neovim-0.10.0-2  fastfetch-2.9.1-1',
      'Total Download Size: 42.0 MiB',
      ':: Proceed with installation? [Y/n] y',
      '(4/4) checking keys in keyring                     [################] 100%',
      ':: Transaction complete.'
    ];
  } else {
    lines = [
      ':: Searching AUR for explicit upgrades...',
      ' -> ' + name + ' found 2 foreign packages',
      ':: (1/2) Parsing SRCINFO: portfolio-terminal-git',
      ':: (2/2) Parsing SRCINFO: dotfiles-btw-git',
      '==> Making package: portfolio-terminal-git 2026.05.01-1',
      '==> Checking runtime dependencies...',
      '==> Installing package portfolio-terminal-git...',
      ' -> done. no reboot required, but reload your shell btw.'
    ];
  }
  terminal.outputLines(lines, 'dim');
  terminal.output('');
}

registerCommand('/pacman', '', function(terminal) {
  terminal.output('usage: /pacman -Syu', 'dim');
}, true);

registerCommand('/pacman -syu', '', function(terminal) {
  renderPackageTranscript(terminal, 'pacman');
}, true);

registerCommand('/yay', '', function(terminal) {
  renderPackageTranscript(terminal, 'yay');
}, true);

registerCommand('/paru', '', function(terminal) {
  renderPackageTranscript(terminal, 'paru');
}, true);

registerCommand('/aur', '', function(terminal) {
  terminal.output("you don't need yay btw, paru is faster.", 'dim');
}, true);

registerCommand('/dotfiles', 'open dotfiles', function(terminal) {
  var url = 'https://github.com/D-ungvari/dotfiles';
  var ua = (window.navigator && window.navigator.userAgent) || '';
  try { if (window.open && ua.indexOf('jsdom') === -1) window.open(url, '_blank', 'noopener'); } catch (e) {}
  terminal.outputHTML('dotfiles  <a href="' + url + '" target="_blank" rel="noopener">github.com/D-ungvari/dotfiles</a>');
}, true);

registerCommand('/emacs', '', function(terminal) {
  terminal.output('this terminal is not an operating system.', 'dim');
}, true);

registerCommand('42', '', function(terminal) {
  terminal.output('the answer to life, the universe, and everything.', 'dim');
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

// =====================================================================
// Sprint E E12 — batch of 9 new easter-egg commands
// =====================================================================

// /uname -a flavored kernel string
registerCommand('/uname', '', function (terminal) {
  var d = new Date().toUTCString();
  terminal.output('DavOS 1.0.0-portfolio #1 SMP ' + d + ' x86_64 GNU/Linux-flavored', 'dim');
}, true);

// /su — su denial
registerCommand('/su', '', function (terminal) {
  terminal.output("su: authentication failure (visitor doesn't even have su).", 'error');
}, true);

// /eject — fake CD-tray
registerCommand('/eject', '', function (terminal) {
  terminal.output('device ejected.', 'dim');
  if (window.Notify && Notify.push) {
    Notify.push({ title: 'CD tray', body: 'tray ejected. there is no tray.' });
  }
}, true);

// /coffee — brew animation
registerCommand('/coffee', '', function (terminal) {
  var stages = ['brewing.', 'brewing..', 'brewing...', 'coffee ready. you may now /code.'];
  if (window.Anim && Anim.reduced && Anim.reduced()) {
    for (var i = 0; i < stages.length; i++) terminal.output(stages[i], 'dim');
    return;
  }
  var idx = 0;
  function step() {
    terminal.output(stages[idx], 'dim');
    idx++;
    if (idx < stages.length) setTimeout(step, 400);
  }
  step();
}, true);

// dave — bare name greeting
registerCommand('dave', '', function (terminal) {
  terminal.output("hey, that's me. type /about for the long version.", 'dim');
}, true);

// /clippy — floating Clippy
registerCommand('/clippy', '', function (terminal) {
  var existing = document.getElementById('clippy');
  if (existing && existing.parentNode) existing.parentNode.removeChild(existing);
  var c = document.createElement('div');
  c.id = 'clippy';
  c.innerHTML =
    '<div class="clippy-bubble">' +
      "It looks like you're writing a portfolio.<br>Need help?" +
      '<div class="clippy-buttons">' +
        '<button type="button" data-action="yes">Yes</button>' +
        '<button type="button" data-action="no">No, leave me alone</button>' +
      '</div>' +
    '</div>' +
    '<pre class="clippy-art">  ___\n /   \\\n |o o|\n | _ |\n \\___/</pre>';
  document.body.appendChild(c);
  function dismiss() {
    if (window.Anim && Anim.shake) Anim.shake(c);
    setTimeout(function () { if (c.parentNode) c.parentNode.removeChild(c); }, 320);
  }
  c.querySelector('[data-action="yes"]').addEventListener('click', function () {
    if (terminal && terminal.output) terminal.output('clippy: have you tried /help?', 'dim');
    dismiss();
  });
  c.querySelector('[data-action="no"]').addEventListener('click', dismiss);
  if (terminal && terminal.output) terminal.output('clippy: at your service.', 'dim');
}, true);

// /yes — y-loop until any key
registerCommand('/yes', '', function (terminal) {
  if (window.Anim && Anim.reduced && Anim.reduced()) {
    for (var i = 0; i < 6; i++) terminal.output('y');
    terminal.output('(loop aborted under reduced motion)', 'dim');
    return;
  }
  var count = 0;
  var maxLines = 60;
  var aborted = false;
  function abort() {
    aborted = true;
    document.removeEventListener('keydown', onKey, true);
    terminal.output('(aborted after ' + count + ' lines)', 'dim');
  }
  function onKey(e) {
    if (e.key === 'Escape' || (e.ctrlKey && (e.key === 'c' || e.key === 'C'))) {
      e.preventDefault();
      abort();
    }
  }
  document.addEventListener('keydown', onKey, true);
  function tick() {
    if (aborted) return;
    terminal.output('y');
    count++;
    if (count >= maxLines) { abort(); return; }
    setTimeout(tick, 50);
  }
  tick();
}, true);

// /figlet <text> — block-letter ASCII banner via prefix dispatch
(function () {
  var FONT = {
    'A': ['  *  ', ' * * ', '*****', '*   *', '*   *'],
    'B': ['**** ', '*   *', '**** ', '*   *', '**** '],
    'C': [' ****', '*    ', '*    ', '*    ', ' ****'],
    'D': ['**** ', '*   *', '*   *', '*   *', '**** '],
    'E': ['*****', '*    ', '**** ', '*    ', '*****'],
    'F': ['*****', '*    ', '**** ', '*    ', '*    '],
    'G': [' ****', '*    ', '*  **', '*   *', ' ****'],
    'H': ['*   *', '*   *', '*****', '*   *', '*   *'],
    'I': ['*****', '  *  ', '  *  ', '  *  ', '*****'],
    'J': ['*****', '   * ', '   * ', '*  * ', ' **  '],
    'K': ['*   *', '*  * ', '***  ', '*  * ', '*   *'],
    'L': ['*    ', '*    ', '*    ', '*    ', '*****'],
    'M': ['*   *', '** **', '* * *', '*   *', '*   *'],
    'N': ['*   *', '**  *', '* * *', '*  **', '*   *'],
    'O': [' *** ', '*   *', '*   *', '*   *', ' *** '],
    'P': ['**** ', '*   *', '**** ', '*    ', '*    '],
    'Q': [' *** ', '*   *', '*   *', '*  **', ' ****'],
    'R': ['**** ', '*   *', '**** ', '*  * ', '*   *'],
    'S': [' ****', '*    ', ' *** ', '    *', '**** '],
    'T': ['*****', '  *  ', '  *  ', '  *  ', '  *  '],
    'U': ['*   *', '*   *', '*   *', '*   *', ' *** '],
    'V': ['*   *', '*   *', '*   *', ' * * ', '  *  '],
    'W': ['*   *', '*   *', '* * *', '** **', '*   *'],
    'X': ['*   *', ' * * ', '  *  ', ' * * ', '*   *'],
    'Y': ['*   *', ' * * ', '  *  ', '  *  ', '  *  '],
    'Z': ['*****', '   * ', '  *  ', ' *   ', '*****'],
    '0': [' *** ', '*  **', '* * *', '**  *', ' *** '],
    '1': ['  *  ', ' **  ', '  *  ', '  *  ', '*****'],
    '2': [' *** ', '*   *', '   * ', '  *  ', '*****'],
    '3': ['**** ', '    *', ' *** ', '    *', '**** '],
    '4': ['*  * ', '*  * ', '*****', '   * ', '   * '],
    '5': ['*****', '*    ', '**** ', '    *', '**** '],
    '6': [' *** ', '*    ', '**** ', '*   *', ' *** '],
    '7': ['*****', '    *', '   * ', '  *  ', '  *  '],
    '8': [' *** ', '*   *', ' *** ', '*   *', ' *** '],
    '9': [' *** ', '*   *', ' ****', '    *', ' *** '],
    ' ': ['     ', '     ', '     ', '     ', '     ']
  };

  registerCommandPrefix('/figlet', function (terminal, rest) {
    if (!rest) {
      terminal.output('usage: /figlet <text>', 'dim');
      return;
    }
    var input = rest.toUpperCase().slice(0, 12);
    var rows = ['', '', '', '', ''];
    for (var i = 0; i < input.length; i++) {
      var ch = FONT[input.charAt(i)];
      if (!ch) ch = FONT[' '];
      for (var r = 0; r < 5; r++) rows[r] += ch[r] + ' ';
    }
    for (var k = 0; k < rows.length; k++) terminal.output(rows[k], 'ascii');
    if (rest.length > 12) terminal.output('(truncated to 12 chars)', 'dim');
  });
})();

// /sudo make me a sandwich (xkcd 149) — prefix dispatch on /sudo
registerCommandPrefix('/sudo', function (terminal, rest) {
  if (rest === 'make me a sandwich') {
    terminal.output('okay.', 'dim');
    return;
  }
  terminal.output("permission denied. you're a visitor, not root.", 'error');
});

// Bump /credits easter-egg count line
registerCommand('/credits', '', function (terminal) {
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
    '  lines of CSS     ~3000',
    '  easter eggs      yes',
    '  hidden games     2 (try /snake, type konami)',
    '',
    "  built with vanilla javascript.",
    '',
    SEPARATOR,
    ''
  ]);
}, true);
