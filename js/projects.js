/**
 * Project data and auto-registration of project commands.
 */
var projects = [
  {
    command: '/uxcrimes',
    title: 'UXCRIMES',
    tagline: 'An interactive browser game about dark UX patterns',
    description: [
      'Each level puts you face-to-face with a',
      'different manipulative UX pattern. 20 levels',
      'of deceptive checkboxes, hostile cookie banners,',
      'impossible unsubscribes, and more. Your job:',
      'figure out how to escape.'
    ],
    stack: 'html / css / javascript',
    liveUrl: 'https://d-ungvari.github.io/UXCrimes/',
    sourceUrl: 'https://github.com/D-ungvari/UXCrimes'
  },
  {
    command: '/horde',
    title: 'HORDE SHOOTER',
    tagline: 'A roguelike survival shooter — survive the onslaught',
    description: [
      'Defend against waves of increasingly difficult',
      'enemies. Level up to unlock weapons and abilities.',
      'Earn gold for permanent upgrades between runs.',
      'Three distinct biomes. Procedural audio.',
      'Built entirely with Canvas 2D — no engine.'
    ],
    stack: 'html / css / javascript / canvas 2d',
    liveUrl: 'https://d-ungvari.github.io/horde-shooter/',
    sourceUrl: 'https://github.com/D-ungvari/horde-shooter'
  },
  {
    command: '/platformer',
    title: 'PLATFORM SHOOTER',
    tagline: 'An arcade platform shooter with waves of enemies',
    description: [
      'A 2D arcade shooter on floating platforms.',
      'Mouse-aim and click to shoot. Multiple enemy',
      'types: runners, flyers, and tanks. Weapon',
      'pickups, combo scoring, progressive difficulty.',
      'Parallax backgrounds and screen-wrapping.'
    ],
    stack: 'html / css / javascript / canvas 2d',
    liveUrl: 'https://d-ungvari.github.io/platform-shooter/',
    sourceUrl: 'https://github.com/D-ungvari/platform-shooter'
  }
];

// Register /projects list command
registerCommand('/projects', 'list all projects', function(terminal) {
  var lines = [
    'projects:',
    SEPARATOR,
    ''
  ];

  for (var i = 0; i < projects.length; i++) {
    var p = projects[i];
    lines.push('  ' + p.command);
    lines.push('  ' + p.tagline);
    lines.push('  ' + p.stack);
    if (i < projects.length - 1) {
      lines.push('');
    }
  }

  lines.push('');
  lines.push(SEPARATOR);
  lines.push('');
  lines.push('type a project command for details.');
  lines.push('');

  terminal.outputLines(lines);
});

// Auto-register each project as its own command
for (var i = 0; i < projects.length; i++) {
  (function(p) {
    registerCommand(p.command, p.title + ' — ' + p.tagline, function(terminal) {
      var lines = [
        '  ' + p.title,
        SEPARATOR,
        ''
      ];
      for (var j = 0; j < p.description.length; j++) {
        lines.push('  ' + p.description[j]);
      }
      lines.push('');
      lines.push('  stack: ' + p.stack);
      lines.push('');
      terminal.outputLines(lines);

      terminal.outputHTML(
        '  > play   <a href="' + p.liveUrl + '" target="_blank" rel="noopener">' + p.liveUrl + '</a>'
      );
      terminal.outputHTML(
        '  > source <a href="' + p.sourceUrl + '" target="_blank" rel="noopener">' + p.sourceUrl + '</a>'
      );

      terminal.output('');
      terminal.output(SEPARATOR);
      terminal.output('');
    });
  })(projects[i]);
}

// Register /play <project> shortcuts that embed the project in an overlay
for (var j = 0; j < projects.length; j++) {
  (function(p) {
    var shortName = p.command.replace('/', '');
    registerCommand('/play ' + shortName, 'play ' + p.title, function(terminal) {
      terminal.output('opening ' + p.title.toLowerCase() + '...', 'accent');
      if (typeof GameOverlay !== 'undefined') {
        GameOverlay.open(p.liveUrl, p.title, terminal);
      } else if (typeof window !== 'undefined' && window.open) {
        window.open(p.liveUrl, '_blank', 'noopener');
      }
    }, true);
  })(projects[j]);
}

// Register bare /play command
registerCommand('/play', 'open a project in browser', function(terminal) {
  terminal.output('usage: /play <project>', 'dim');
  terminal.output('');
  for (var k = 0; k < projects.length; k++) {
    terminal.output('  /play ' + projects[k].command.replace('/', ''));
  }
  terminal.output('');
}, true);
