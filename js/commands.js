/**
 * Command registry and built-in commands.
 */
var commandRegistry = {};

function registerCommand(name, description, handler, hidden) {
  commandRegistry[name.toLowerCase()] = {
    description: description,
    handler: handler,
    hidden: hidden || false
  };
}

function registerAlias(alias, target) {
  var targetCmd = commandRegistry[target.toLowerCase()];
  if (targetCmd) {
    commandRegistry[alias.toLowerCase()] = {
      description: targetCmd.description,
      handler: targetCmd.handler,
      hidden: true  // aliases don't show in /help
    };
  }
}

function executeCommand(rawInput, terminal) {
  var input = rawInput.trim().toLowerCase();
  if (input === '') return;

  if (commandRegistry[input]) {
    commandRegistry[input].handler(terminal);
  } else {
    terminal.output('command not found: ' + rawInput.trim(), 'error');
    terminal.output('type /help for available commands.', 'dim');
  }
}

// --- Built-in commands ---

var SEPARATOR = '────────────────────────────────────';

registerCommand('/help', 'show available commands', function(terminal) {
  var lines = [
    'available commands:',
    SEPARATOR,
    ''
  ];

  // Collect visible commands
  var builtins = [];
  var projectCmds = [];

  for (var cmd in commandRegistry) {
    if (commandRegistry[cmd].hidden) continue;
    var entry = '  ' + cmd.padEnd(16) + commandRegistry[cmd].description;
    // Separate project commands from builtins
    if (BUILTIN_COMMANDS.indexOf(cmd) !== -1) {
      builtins.push(entry);
    } else {
      projectCmds.push(entry);
    }
  }

  lines = lines.concat(builtins);

  if (projectCmds.length > 0) {
    lines.push('');
    lines.push('project shortcuts:');
    lines.push(SEPARATOR);
    lines.push('');
    lines = lines.concat(projectCmds);
  }

  lines.push('');
  terminal.outputLines(lines);
});

registerCommand('/about', 'about me', function(terminal) {
  terminal.outputLines([
    '> about',
    SEPARATOR,
    '',
    '  David Ungvari',
    '  Full-stack Developer @ Omada A/S, Copenhagen',
    '',
    '  By day I build enterprise identity governance',
    '  software with React, TypeScript, C#/.NET,',
    '  GraphQL, and SQL Server.',
    '',
    '  By night I build browser games with zero',
    '  dependencies — vanilla HTML, CSS, JavaScript,',
    '  and Canvas 2D.',
    '',
    '  Education:',
    '    - M.Sc. Information Science, Aalborg University',
    '    - B.Tech Product Development, KEA Copenhagen',
    '',
    SEPARATOR,
    ''
  ]);
});

registerCommand('/contact', 'get in touch', function(terminal) {
  var lines = [
    '> contact',
    SEPARATOR,
    ''
  ];
  terminal.outputLines(lines);
  terminal.outputHTML(
    '  github     <a href="https://github.com/D-ungvari" target="_blank" rel="noopener">github.com/D-ungvari</a>'
  );
  terminal.outputHTML(
    '  linkedin   <a href="https://www.linkedin.com/in/davidungvari/" target="_blank" rel="noopener">linkedin.com/in/davidungvari</a>'
  );
  terminal.outputHTML(
    '  email      <a href="mailto:qkaturo95@gmail.com" target="_blank" rel="noopener">qkaturo95@gmail.com</a>'
  );
  terminal.output('');
  terminal.output(SEPARATOR);
  terminal.output('');
});

registerCommand('/clear', 'clear terminal', function(terminal) {
  terminal.clear();
});

// Builtin list for /help categorization
var BUILTIN_COMMANDS = ['/projects', '/help', '/about', '/contact', '/clear', '/theme', '/history', '/skills'];
