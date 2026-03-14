/**
 * Boot sequence animation and welcome message.
 */

var WELCOME_ASCII = [
  ' ██████╗  █████╗ ██╗   ██╗███████╗',
  ' ██╔══██╗██╔══██╗██║   ██║██╔════╝',
  ' ██║  ██║███████║██║   ██║█████╗  ',
  ' ██║  ██║██╔══██║╚██╗ ██╔╝██╔══╝  ',
  ' ██████╔╝██║  ██║ ╚████╔╝ ███████╗',
  ' ╚═════╝ ╚═╝  ╚═╝  ╚═══╝  ╚══════╝'
];

function getTimeGreeting() {
  var hour = new Date().getHours();
  if (hour < 6) return 'burning the midnight oil?';
  if (hour < 12) return 'good morning.';
  if (hour < 17) return 'good afternoon.';
  if (hour < 21) return 'good evening.';
  return 'working late?';
}

function showWelcome(terminal) {
  terminal.output('');
  for (var i = 0; i < WELCOME_ASCII.length; i++) {
    terminal.output(WELCOME_ASCII[i], 'ascii');
  }
  terminal.output('');
  terminal.output(' full-stack developer. browser game builder.', 'dim');
  terminal.output(' ' + getTimeGreeting(), 'dim');
  terminal.output('');
  terminal.output(' type /help to see available commands.', 'dim');
  terminal.output('');
}

function runBoot(terminal, callback) {
  var bootLines = [
    '> booting portfolio v1.0...',
    '> loading projects... done',
    '> establishing connection... ok',
    '> ready.'
  ];

  // Check for reduced motion preference
  var prefersReducedMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    // No animation, just show everything
    for (var i = 0; i < bootLines.length; i++) {
      terminal.output(bootLines[i], 'dim');
    }
    showWelcome(terminal);
    callback();
    return;
  }

  terminal.deactivateInput();
  var lineIndex = 0;

  function nextLine() {
    if (lineIndex < bootLines.length) {
      terminal.output(bootLines[lineIndex], 'dim');
      lineIndex++;
      setTimeout(nextLine, 250);
    } else {
      showWelcome(terminal);
      callback();
    }
  }

  nextLine();
}
