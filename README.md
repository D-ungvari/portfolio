# DavOS Portfolio

A fake retro-unix desktop that doubles as a developer portfolio. Real window
manager, native apps, persona-driven copy, a virtual filesystem, multi-tab
terminal, sleep mode, and ~80 commands. **Vanilla HTML/CSS/JS, zero
dependencies, no build step.**

## Quick Start

Open `index.html` in your browser. That's it.

## Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│ DavOS 1.0  ─ workspace 1 ─  [running...]  tray  [⌗]  theme▾  14:32 │  ← taskbar
├──────────────────────────────────────────┬──────────────────────────┤
│                                          │ visitor@dave ~ /portfolio│
│   ┌────┐  ┌────┐  ┌────┐  ┌────┐         │  > systemd boot done.    │
│   │:::│  │[!]│  │▼▼│  │◇■│              │  > welcome back, Dave.   │
│   │swarm│ │uxc │  │horde│ │plat│         │                          │
│   └────┘  └────┘  └────┘  └────┘         │  visitor@dave:~$ /palette│
│                                          │                          │
│   ┌────┐  ┌────┐  ┌────┐                 │  ┌─ Settings ────[●●●]┐  │
│   │ □ │  │ ▤ │  │ ⌬ │                   │  │ Scanlines      [✓] │  │
│   │port│  │job │  │kb  │                 │  │ Glow strength  ▮▮▯ │  │
│   └────┘  └────┘  └────┘                 │  └────────────────────┘  │
│                                          │                          │
│                              ⌐──┐         │  visitor@dave:~$ █       │
│                              │░░│        │                          │
│                              └──┘         │                          │
└──────────────────────────────────────────┴──────────────────────────┘
```

- **Desktop ≥ 1024px:** taskbar + desktop pane (left, ~60%) + draggable divider + terminal pane (right). Drag the divider to resize; the width persists in localStorage.
- **Tablet 640–1023px:** stacked panes — desktop on top, terminal below.
- **Mobile < 640px:** bottom tab toggle switches between the two panes; only one is visible at a time.

## What's new in v3

DavOS v3 (Sprint B) is a complete rewrite of the OS shell on top of a real
window manager:

- **Window manager** — drag, resize, snap (Win+arrows), maximize, minimize, multi-window, taskbar running-app strip, session-restored windows
- **Native apps** — `Settings`, `Mail`, `CV Viewer`, `Apps Grid`, `Boring View` (recruiter-mode plain-text CV)
- **Command palette** — `Ctrl+K` fuzzy-search every command, project, theme, and shortcut
- **Shortcuts cheatsheet** — `F1` opens a grouped overview of every keyboard combo
- **Persona-driven** — a single `data/persona.json` (with embedded JS fallback) drives `/about`, `/availability`, `/cv-window`, `/boring`, the `About this PC` panel, the boot greeting
- **Lore + personality** — `/motd`, `/version`, `/changelog`, `/man <topic>`, `/docs <project>`, `/availability`, `/references`, `/lang en|da`, `/ask <question>`, `/interview` (60s recruiter tour), `/demo` (autopilot)
- **Virtual filesystem** — `/pwd`, `/cd`, `/ls`, `/cat`, `/tree`, `/open`, `./swarm.app` shorthand, persistent cwd
- **Multi-tab terminal** — `Ctrl+T` new, `Ctrl+W` close, `Ctrl+Tab` next
- **Sleep mode** — 5-minute idle locks the screen with a clock, any key wakes it
- **Notifications** — toast stack + bell + log panel (`⌗` icon in the taskbar)
- **System tray** — fake net rate, volume, battery, EQ ticker
- **Wallpaper context menu** — right-click the desktop for refresh / theme / about
- **Visual polish** — per-theme wallpaper overlays, project-specific glyphs (`:::`, `▼▼`, `◇■`, etc.), ASCII trash, systemd-style boot log

## Commands

Too many to list in full — `/help` shows the visible set, `Ctrl+K` searches all
of them. Highlights:

| Group        | Commands |
|--------------|----------|
| **Discovery**| `/help`, `/projects`, `/apps`, `/games`, `/grid`, `/palette` (`Ctrl+K`) |
| **Persona**  | `/about`, `/contact`, `/skills`, `/experience`, `/resume`, `/cv-window`, `/availability`, `/references` |
| **Personality** | `/motd`, `/version`, `/changelog`, `/man <topic>`, `/docs <project>`, `/ask <question>`, `/interview`, `/demo`, `/lang en\|da` |
| **Native apps** | `/settings`, `/mail`, `/grid`, `/boring`, `/cv-window` |
| **Filesystem** | `/pwd`, `/cd <path>`, `/ls`, `/cat <path>`, `/tree`, `/open <path>`, `./<file>` |
| **Theming**  | `/theme <name>`, `/wallpaper <name>` (alias) |
| **Project play** | `/<project>`, `/play <project>`, `/launch <project>` |
| **OS**       | `/htop`, `/desktop`, `/shutdown`, `/logout`, `/clear`, `/history`, `/stats` |
| **Easter eggs** | `/sudo`, `/rm`, `/vim`, `/emacs`, `/cowsay`, `/fortune`, `/matrix`, `42`, Konami, … |

Full architectural and command spec: [`PLAN-OS-V3.md`](.sdlc/archive/PLAN-OS-V3.md)
and [`PLAN-OS-V4.md`](.sdlc/archive/PLAN-OS-V4.md). The pre-v3 OS shell is
preserved in [`PLAN-OS.md`](.sdlc/archive/PLAN-OS.md) and the single-pane v1
layout in [`PLAN.md`](PLAN.md).

## Adding a Project

Edit `js/projects.js` and add an object to the `projects` array:

```js
{
  command: '/myproject',
  title: 'MY PROJECT',
  tagline: 'One-line description',
  category: 'app',          // 'app' or 'game'
  glyph: '◆',               // 1–3 chars used as the icon
  description: ['Longer description', 'split across lines.'],
  stack: 'html / css / js',
  liveUrl: 'https://...',
  sourceUrl: 'https://github.com/...'
}
```

The command auto-registers. `/help`, `/projects`, the desktop icon grid, the
apps-grid window, the file system (`~/projects/myproject.app`,
`~/docs/myproject.md`), and tab completion all auto-update.

## Themes

4 color themes: `green` (default), `amber`, `blue`, `matrix`. Each theme also
defines a wallpaper overlay and soft-tint CSS vars used across windows + apps.
Run `/theme <name>` (or click `theme ▾` in the taskbar) to switch — radial
wipe animation honors `prefers-reduced-motion`. Choice persists via
localStorage.

## Personalisation

`data/persona.json` is the single source of truth for everything personal —
name, role, comp range, references, languages, contact links, experience,
education. Every command and app reads from it (with an embedded JS fallback
for `file://` use). Edit the JSON, reload, you're done.

## Testing

```sh
npm install
npm test
```

**615 tests** covering: command output, XSS protection, accessibility, easter
eggs, theming, stress + performance, the v2 OS shell (icons / splitter /
context menu / pane toggle / taskbar), and the full v3 surface (window
manager, palette, cheatsheet, persona, session, notifications, shortcuts,
all 5 native apps, lore + tour commands, virtual FS, terminal tabs, sleep
mode). Runs headless via jsdom — same code path that runs in the browser.

## Deployment

Push to `main` — GitHub Actions runs tests and deploys to GitHub Pages
automatically. No build step.

## Tech Stack

- HTML / CSS / JavaScript (vanilla, **zero runtime dependencies**)
- JetBrains Mono font (Google Fonts)
- jsdom (dev dependency, headless test runner)
- GitHub Actions CI/CD

## Architecture

See [`PLAN-OS-V3.md`](.sdlc/archive/PLAN-OS-V3.md) and [`PLAN-OS-V4.md`](.sdlc/archive/PLAN-OS-V4.md) for the full v3/v4 specs. In short: ~45 ES5
modules, no bundler, IIFE-scoped, idempotent inits. The window manager is the
spine; everything visible is either a window or chrome. Persona JSON is the
spine of all copy. Session storage round-trips theme, settings, terminal
tabs, cwd, window geometry, and visit count.

## History

- v1 — single-pane terminal-only ([`PLAN.md`](PLAN.md))
- v2 — OS desktop + terminal pane ([`PLAN-OS.md`](.sdlc/archive/PLAN-OS.md))
- v3 — window manager + native apps + persona + lore ([`PLAN-OS-V3.md`](.sdlc/archive/PLAN-OS-V3.md))
- v4 — visual fidelity, launcher, lock/login screens, widgets ([`PLAN-OS-V4.md`](.sdlc/archive/PLAN-OS-V4.md))
