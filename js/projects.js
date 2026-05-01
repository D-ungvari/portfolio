/**
 * Project data and auto-registration of project commands.
 */
var projects = [
  {
    command: '/uxcrimes',
    title: 'UXCRIMES',
    tagline: 'An interactive browser game about dark UX patterns',
    category: 'game',
    glyph: '[!]',
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
    category: 'game',
    glyph: '▼▼',
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
    category: 'game',
    glyph: '◇■',
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
  },
  {
    command: '/swarm',
    title: 'SWARM COMMAND',
    tagline: 'A StarCraft-inspired browser RTS — Terran vs Zerg',
    category: 'game',
    glyph: ':::',
    description: [
      'Real-time strategy game built with TypeScript and',
      'PixiJS v8. Hand-rolled ECS with TypedArrays for',
      'cache-efficient simulation. 13 units with unique',
      'abilities, damage types, upgrades, fog of war,',
      'spatial hash queries, and adaptive AI with',
      '4 difficulty levels and multi-prong attacks.',
      '180 tests. 60 UPS fixed timestep, frame-rate input.'
    ],
    stack: 'typescript / pixijs v8 / vite / vitest / ecs',
    liveUrl: 'https://d-ungvari.github.io/swarm-command/',
    sourceUrl: 'https://github.com/D-ungvari/swarm-command'
  },
  {
    command: '/portfolio',
    title: 'PORTFOLIO TERMINAL',
    tagline: 'This terminal — a developer portfolio as a CLI',
    category: 'app',
    glyph: '□',
    description: [
      'An interactive terminal-style portfolio site.',
      'Built with zero dependencies — vanilla HTML,',
      'CSS, and JavaScript. Features themes, easter',
      'eggs, game overlays, tab completion, and a',
      'full command system with 50+ commands.'
    ],
    stack: 'html / css / javascript',
    liveUrl: 'https://d-ungvari.github.io/portfolio/',
    sourceUrl: 'https://github.com/D-ungvari/portfolio'
  },
];

// Helper to filter projects by category
function getProjectsByCategory(category) {
  var result = [];
  for (var i = 0; i < projects.length; i++) {
    if (projects[i].category === category) {
      result.push(projects[i]);
    }
  }
  return result;
}

// Helper to render a project list with optional category headers
function renderProjectList(terminal, projectList, title, showCategories) {
  var lines = [
    title,
    SEPARATOR,
    ''
  ];

  if (showCategories) {
    var apps = [];
    var games = [];
    for (var i = 0; i < projectList.length; i++) {
      if (projectList[i].category === 'app') {
        apps.push(projectList[i]);
      } else {
        games.push(projectList[i]);
      }
    }

    if (apps.length > 0) {
      lines.push('  APPS');
      lines.push('  ' + '─'.repeat(32));
      lines.push('');
      for (var a = 0; a < apps.length; a++) {
        lines.push('  ' + apps[a].command);
        lines.push('  ' + apps[a].tagline);
        lines.push('  ' + apps[a].stack);
        lines.push('');
      }
    }

    if (games.length > 0) {
      lines.push('  GAMES');
      lines.push('  ' + '─'.repeat(32));
      lines.push('');
      for (var g = 0; g < games.length; g++) {
        lines.push('  ' + games[g].command);
        lines.push('  ' + games[g].tagline);
        lines.push('  ' + games[g].stack);
        if (g < games.length - 1) {
          lines.push('');
        }
      }
    }
  } else {
    for (var j = 0; j < projectList.length; j++) {
      var p = projectList[j];
      lines.push('  ' + p.command);
      lines.push('  ' + p.tagline);
      lines.push('  ' + p.stack);
      if (j < projectList.length - 1) {
        lines.push('');
      }
    }
  }

  lines.push('');
  lines.push(SEPARATOR);
  lines.push('');
  lines.push('type a project command for details.');
  lines.push('');

  terminal.outputLines(lines);
}

// Register /projects list command
registerCommand('/projects', 'list all projects', function(terminal) {
  renderProjectList(terminal, projects, 'projects:', true);
});

// Register /apps command — show only app-category projects
registerCommand('/apps', 'list app projects', function(terminal) {
  renderProjectList(terminal, getProjectsByCategory('app'), 'apps:', false);
});

// Register /games command — show only game projects
registerCommand('/games', 'list game projects', function(terminal) {
  renderProjectList(terminal, getProjectsByCategory('game'), 'games:', false);
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
