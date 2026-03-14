# Portfolio Terminal

A terminal-themed developer portfolio built with vanilla HTML, CSS, and JavaScript. No frameworks, no build step.

## Quick Start

Open `index.html` in your browser. That's it.

## Commands

| Command | Description |
|---------|-------------|
| `/help` | Show all available commands |
| `/projects` | List all projects |
| `/uxcrimes` | UXCrimes — dark UX patterns game |
| `/horde` | Horde Shooter — roguelike survival |
| `/platformer` | Platform Shooter — arcade shooter |
| `/about` | About me |
| `/contact` | Contact info |
| `/skills` | Tech skill bars |
| `/history` | Command history |
| `/theme` | Switch color themes |
| `/clear` | Clear terminal |

Plus 30+ hidden easter eggs. Try things like `/sudo`, `/neofetch`, `/cowsay`, `/matrix`, or `42`.

## Adding a Project

Edit `js/projects.js` and add an object to the `projects` array:

```js
{
  command: '/myproject',
  title: 'MY PROJECT',
  tagline: 'One-line description',
  description: ['Longer description', 'split across lines.'],
  stack: 'html / css / js',
  liveUrl: 'https://...',
  sourceUrl: 'https://github.com/...'
}
```

The command auto-registers. `/help` and `/projects` auto-update.

## Themes

4 color themes: `green` (default), `amber`, `blue`, `matrix`. Run `/theme <name>` to switch. Choice persists via localStorage.

## Testing

```sh
npm install
node tests/run-tests.js
```

342 tests covering commands, output formatting, XSS protection, accessibility, easter eggs, theming, stress testing, and performance.

## Deployment

Push to `main` — GitHub Actions runs tests and deploys to GitHub Pages automatically.

## Tech Stack

- HTML / CSS / JavaScript (vanilla, zero dependencies)
- JetBrains Mono font (Google Fonts)
- jsdom (dev dependency, for headless tests)
- GitHub Actions CI/CD
