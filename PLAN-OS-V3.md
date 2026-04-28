# Portfolio v3 — DavOS: Windows + Apps + Persona

**Status:** spec, not yet built
**Builds on:** `PLAN-OS.md` (v2 OS shell)
**Author:** plan generated 2026-04-28
**Goal:** v2 made the desktop. v3 makes it a real OS — floating windows, native apps, single-source persona, AI signal, recruiter conversion paths.

Same direction. Bigger.

---

## What changes between v2 and v3

| Concept | v2 (now) | v3 (this spec) |
|---|---|---|
| Project launch | Full-screen iframe overlay | Draggable, resizable, minimizable window with title bar |
| Concurrency | One project at a time | Multiple windows, z-stacking, taskbar entries |
| Apps | Only project iframes | Native apps (Settings, Mail, CV viewer, Apps grid) live in same window manager |
| Persona | Hardcoded across `/about`, `/skills`, About panel, README | Single `data/persona.json` drives all of it |
| Recruiter path | Type `/help` and figure it out | `/interview` guided tour, `/demo` autopilot, "Boring view" static CV, Apps grid card layout |
| AI signal | Mentioned in stack list | `/ask` answers Q&A about Dave (static keyword RAG v1, Claude proxy v2) |
| Lore | None | `/motd`, `/version`, `/changelog`, returning-visitor memory, per-theme tagline |
| Filesystem | `/ls` is a static joke | `~/projects/` real to `ls`/`cat`/`cd`/`pwd`/`tree`; `cat swarm.app` opens window |
| Terminal | Single instance | Multi-tab via `Ctrl+T`/`Ctrl+W`/`Ctrl+Tab`, each with own history |
| Discovery | `/help` listing | `Cmd+K` palette + `F1` cheatsheet + right-click wallpaper menu |
| Visual depth | One color per theme | Per-theme wallpaper signature, beveled icons, POST diagnostics, radial-wipe theme switch |
| Notifications | Ad-hoc toasts in `desktop.js` | `Notify.push()` queue + tray indicator + delayed recruiter-toast easter egg |
| Idle | Matrix rain after 5min | Sleep mode (screen darkens, lock-screen prompt, wake on input) |

Everything still vanilla. Zero deps. No build step. GitHub Pages deploys statically.

---

## Architectural backbone

Three pieces of infra make the rest possible. Build them first.

### 1. `data/persona.json` — single source of truth
```json
{
  "name": "David Ungvari",
  "role": "Full-stack Developer",
  "company": "Omada A/S",
  "location": "Copenhagen, DK",
  "languages": ["English", "Danish", "Hungarian"],
  "availability": {
    "status": "open to interviews",
    "notice_period_weeks": 3,
    "comp_dkk_min": 750000,
    "comp_dkk_max": 950000,
    "remote": "hybrid",
    "onsite_radius": "Greater Copenhagen"
  },
  "currently_shipping": ["React", "TypeScript", "GraphQL", "C#/.NET", "SQL Server"],
  "recently_shipped": ["Next.js", "PostgreSQL", "pgvector", "Claude API", "PixiJS", "Vanilla JS games"],
  "education": [...],
  "contact": {...},
  "references": [...]
}
```
Drives: About panel, `/about`, `/availability`, `/references`, "Boring view", `/ask` knowledge base, Apps grid metadata.

### 2. `js/window-manager.js` — replaces `game-overlay.js`
`Window.open({ url?, title, content?, app? })` returns a window handle. Manages:
- DOM creation: title bar (●●● close/min/max), content area (iframe OR DOM node for native apps), resize handles on all 4 edges + 4 corners
- Drag from title bar updates `transform: translate3d()`
- Resize from edges updates width/height
- Z-stacking: clicking any part of a window calls `bringToFront()` which assigns the highest z-index in the stack
- Minimize: hides DOM, taskbar entry remains
- Maximize: snap to fill workspace area (taskbar excluded)
- Close: tear down DOM + taskbar entry + remove from registry
- State: `Map<windowId, { x, y, w, h, z, minimized, maximized, app, project }>` — serialized to session store

### 3. `js/session-store.js` — `localStorage` wrapper
Single key `daveos:session:v1` holding:
```ts
{
  theme: string,
  terminalWidthPx: number,
  terminalCollapsed: boolean,
  activePane: 'desktop' | 'terminal',
  windows: WindowState[],
  terminalHistory: string[],
  visitCount: number,
  lastVisit: ISO8601,
  shortcutsCheatsheetSeen: boolean,
  notificationLog: NotifEntry[]
}
```
Debounced write (200ms) on any change. One read on boot. Migrations versioned by `:v1` suffix.

Plus two utility infra pieces:

### 4. `js/notify.js` — notification system
`Notify.push({ title, body, action?, ttlMs? })` enqueues. Toasts stack bottom-right with auto-dismiss. Tray bell icon in taskbar shows unread count, click opens log panel. Replaces ad-hoc `showToast()` calls in `desktop.js`.

### 5. `js/shortcuts.js` — keybind registry
Declarative `shortcuts[]` array (`{combo, when, action, label, group}`). Single source for `Ctrl+\``, `Cmd+K`, `F1`, `Ctrl+T`, etc. F1 cheatsheet overlay reads this array. Adding a shortcut anywhere in the codebase = adding one entry to this registry.

---

## Native apps (in window manager)

| App icon | Window content | Why |
|---|---|---|
| Project (×7) | iframe | Existing, now in real window |
| `Apps` folder | Card grid view of projects | Recruiter-friendly entry |
| `CV.pdf` | iframe → `assets/cv.pdf` | Recruiters need PDF |
| `Mail` | Fake inbox: 3 messages incl. unread "Interview request" with `/contact` CTA | Lowers contact friction, dry humor |
| `Settings` | Toggles: scanlines, glow strength, density, font size, motion override | Real first-party app, proves windows aren't iframe-only |
| `Boring View` | Static CV layout (no chrome) | Hiring managers who hate gimmicks |

---

## Visual polish

Pick the seven that compound — the rest is bonus:

1. **Per-theme wallpaper signature** — green: scanlines, amber: phosphor radial, blue: starfield drift, matrix: pre-baked falling chars
2. **Project-specific ASCII glyphs** — `:::` swarm, `▼▼▼` horde, `[!]` uxcrimes, `▤▤` jobtracker, etc. Add `glyph` field to `projects.js`
3. **Beveled icons** — 3-layer box-shadow stack (outer glow + inset highlight + inset shadow), 1px lift on hover/focus
4. **Rich BIOS POST** — replace static stage 1 with hex address probes, animated `262144K OK` count-up, fake IDE/USB scan
5. **Radial wipe theme switch** — clip-path circle expanding from click coordinates over 350ms
6. **System tray cluster** — `↑↓ 1.2M/s`, `▮▮▮▯▯`, `[██▌  ]`, animated audio meter
7. **ASCII trash bin** replacing emoji — consistent monospace across platforms

Lower-priority polish: divider grip dots, mobile pane slide transition, scanline+CRT flicker overlay, cursor heartbeat pulse, loading shimmer on icon launch.

---

## Personality + lore

| Command | What it does |
|---|---|
| `/interview` | Auto-typed 60s recruiter tour: 3 strongest projects, elevator pitches, ends at `/contact` |
| `/demo` | Autopilot mode — input locked, theme cycles, projects open + close, easter egg revealed. Press any key to exit |
| `/availability` | Reads persona.json: notice period, comp range (DKK), remote/onsite |
| `/references` | Reads persona.json |
| `/docs <project>` | Per-project deep-dive: problem, ASCII architecture diagram, key decisions, tradeoffs, metrics |
| `man <topic>` | Real manpage format. `man dave`, `man portfolio`, `man swarm` |
| `/motd` | Daily rotating quote/dev tip |
| `/version` | Fake git log of the persona ("v1.4.0 — added swarm-command", "v1.3.0 — joined Omada") |
| `/changelog` | Human-readable career history |
| `/lang en\|da` | Switch About + key copy between English/Danish |
| `/ask <question>` | v1: static keyword match against `data/dave-knowledge.json`. v2: serverless proxy → Claude API |

Returning-visitor memory: on boot, if `session.visitCount > 0`, add line `[ OK ] Restored session — last visit: {relative time}, ran {N} commands`. Per-theme boot tagline below the ASCII welcome (green: "ship it", amber: "warning: vibes", blue: "enterprise mode", matrix: "wake up, neo").

---

## Filesystem illusion + terminal depth

In-memory FS rooted at `/home/visitor/`:
```
/home/visitor/
├── about.txt
├── contact.txt
├── resume.txt
├── projects/
│   ├── swarm.app
│   ├── horde.app
│   ├── uxcrimes.app
│   ├── platformer.app
│   ├── portfolio.app
│   ├── jobtracker.app
│   └── knowledgebase.app
├── docs/
│   ├── swarm.md
│   ├── horde.md
│   └── ... (one per project)
└── .secrets/    ← restricted, easter egg if cd'd into
```

`pwd` / `cd` / `ls` / `cat` / `tree` actually navigate this tree. `cat ~/projects/swarm.app` prints project card; running `./swarm.app` (or `open` builtin) launches the window via `Window.open`.

Multi-tab terminal: `Ctrl+T` new tab, `Ctrl+W` close tab, `Ctrl+Tab` cycle. Tab strip above terminal pane: `tab1 ✕ | tab2 ✕ | +`. Each tab independent `cwd`, history, scrollback. Persisted in session.

---

## Shortcuts (cheatsheet via F1)

| Combo | Action |
|---|---|
| `Cmd/Ctrl+K` | Command palette |
| `Cmd/Ctrl+Space` | Same as above (alias) |
| `F1` | Show this cheatsheet |
| `Ctrl+\`` | Collapse/expand terminal pane |
| `Ctrl+T` | New terminal tab |
| `Ctrl+W` | Close terminal tab |
| `Ctrl+Tab` | Next terminal tab |
| `Cmd/Ctrl+Shift+T` | Reopen closed tab |
| `Esc` | Close any open menu / window with focus / palette |
| `Win+←` / `Win+→` | Snap window to half |
| `Win+↑` | Maximize window |
| Arrow keys (desktop pane) | Navigate icons |
| Enter / Space | Launch selected icon |
| Drag icon → terminal pane | Run icon's command |

---

## Acceptance criteria summary

Phase B1 (Foundation): persona.json drives About + `/about`. Notify.push replaces all `showToast()` calls. Session-store reads on boot, writes debounced. Shortcuts registry holds at least the 6 v2 keybinds.
Phase B2 (Windows): GameOverlay-style iframe replaced by draggable window. 3+ windows can open at once. Taskbar shows running-apps. Win+arrow snaps. State persists across reloads.
Phase B3 (Discovery): Cmd+K opens fuzzy palette listing all commands + projects. Right-click wallpaper opens menu. F1 lists every shortcut. Drag icon to terminal runs its command.
Phase B4 (Polish): All four themes visibly distinct beyond hue. Each project has unique glyph. Boot stage 1 has at least 6 lines of POST diagnostics. Theme change animates as radial wipe. Tray has 4 indicators.
Phase B5 (Apps): Settings, Mail, CV viewer, Apps grid, Boring view all reachable. Each opens in a window managed by B2 infra.
Phase B6 (Persona): `/interview`, `/demo`, `/availability`, `/references`, `/docs/<p>`, `man`, `/motd`, `/version`, `/changelog`, `/lang`, `/ask` all registered. Returning-visitor memory shows on 2nd+ boot. Per-theme tagline shows.
Phase B7 (FS + Terminal): `cd ~/projects && ls && cat swarm.app` works as expected. `./swarm.app` launches. Multi-tab works. Sleep mode after 5min idle.

Test target: ≥ 600 tests, 0 fail.

---

## Out of scope (icebox for v4)

- Workspace switching 1/2/3 (decorative label stays)
- Selection lasso multi-select on desktop
- Pinned/recents dock on taskbar
- Hidden Snake game in terminal
- `/github` live contribution feed (rate limits, fragile)
- Seasonal Easter eggs (December snow, April 1 shuffle)
- `/opensource` repo list (defer until repo count justifies)
- `/endorsements` (needs real consent collection)
- Undo/redo for desktop ops
- Real file system writes (`touch` stays a joke)

These ship in Sprint C if calendar permits before Copenhagen application push.

---

## Migration order — 35 items across 7 phases

See `.sdlc/BACKLOG.md` Sprint B for the ordered task list (B01–B35).
