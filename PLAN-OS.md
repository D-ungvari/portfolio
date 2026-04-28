# Portfolio v2 — DavOS Redesign

**Status:** spec, not yet built
**Supersedes:** the single-pane terminal layout in `PLAN.md` (kept as historical reference for v1)
**Author:** plan generated 2026-04-28
**Goal:** transform the portfolio from a one-pane terminal into a fake desktop OS — clickable project icons on the left, persistent terminal pane on the right.

---

## Vision in one sentence

Boot into **DavOS** — a fake retro-unix desktop. Project icons sit on a wallpaper grid, a working terminal docks on the right, and a thin taskbar at the top shows clock + theme. Clicking an icon launches the project full-screen (existing iframe overlay). Typing in the terminal still drives every command from v1.

The terminal aesthetic is preserved everywhere — desktop chrome uses the same monospace font, theme colors, and CRT glow. Nothing here is skeuomorphic Windows-95; this is "what if a developer's daily-driver Linux desktop was the portfolio."

---

## Layout

### Desktop (≥ 1024px wide)

```
┌─────────────────────────────────────────────────────────────────────┐
│ ●●●  DavOS 1.0   ─ workspace 1 ─                  [theme▾]  14:32 │  ← taskbar (top, 32px)
├──────────────────────────────────────────┬──────────────────────────┤
│                                          │ visitor@dave ~ /portfolio│
│   ┌────┐  ┌────┐  ┌────┐  ┌────┐         │  > booting...            │
│   │ ▣  │  │ ▣  │  │ ▣  │  │ ▣  │         │  > ready.                │
│   │swarm│ │uxc │  │horde│ │job │          │                          │
│   └────┘  └────┘  └────┘  └────┘         │  visitor@dave:~$ /help   │
│                                          │                          │
│   ┌────┐  ┌────┐  ┌────┐                 │  ...                     │
│   │ ▣  │  │ ▣  │  │ ▣  │                 │                          │
│   │plat│  │kb  │  │port│                 │                          │
│   └────┘  └────┘  └────┘                 │                          │
│                                          │ visitor@dave:~$ █        │
│                              [trash]🗑️    │                          │
└──────────────────────────────────────────┴──────────────────────────┘
        ← desktop pane (60%) →                ← terminal pane (40%) →
```

- Top **taskbar**: 32px tall, dark-glassmorphism strip. Left = "DavOS 1.0" + workspace label. Right = theme dropdown + live clock.
- **Desktop pane**: scrollable wallpaper area, icon grid laid out as flex-wrap top-left. Trash icon pinned bottom-right.
- **Terminal pane**: docked right, 40% width default, resizable via drag handle on the divider, collapsible (`Ctrl+\`` toggles).
- **Divider**: 4px wide, cursor `col-resize`, drag updates a CSS var `--terminal-width`.

### Tablet (640–1023px)

- Taskbar fixed
- Desktop pane on top, terminal pane below (stacked, 50/50 default)
- Drag handle becomes horizontal (`row-resize`)

### Mobile (< 640px)

- Taskbar fixed (clock only, theme moves to the OS menu)
- **Tab toggle** at the bottom: `[ DESKTOP ]  [ TERMINAL ]`
- Only one pane visible at a time, swipeable
- Existing mobile command chips appear above the bottom tab bar when terminal is active
- Icons in desktop view: smaller grid, 3 across

---

## OS Aesthetic

| Element | Spec |
|---|---|
| Wallpaper | Solid `var(--color-bg)` (`#0a0a0a`) with subtle 32px dot grid (1px dots, `var(--color-border)`, opacity 0.15) |
| Taskbar | `rgba(10,10,10,0.92)` + 1px bottom border `var(--color-border)`, backdrop-blur 8px |
| Icon | 80×80px, monospace box-drawing border, project initial inside (e.g. `▣ S` for Swarm). Label below in primary color |
| Selected icon | Border becomes solid `var(--color-primary)`, slight glow |
| Hover | Border brightens, tooltip with tagline appears after 500ms |
| Trash | Empty: `🗑️`. Drag-target for icons (easter egg only, doesn't actually remove anything) |
| Terminal pane chrome | Reuses current `#terminal-bar` (3 dots + title), now embedded in the right pane |
| Theme switching | Applies to desktop wallpaper grid, taskbar, icons, AND terminal — single set of CSS vars |

The four existing themes (green / amber / blue / matrix) re-skin every surface. No new color tokens needed; just plumb the existing `--color-primary`, `--color-dim`, `--color-glow`, `--color-border` into the desktop CSS.

---

## Boot sequence

Replaces v1's 4-line terminal boot. Two stages:

### Stage 1: BIOS-style splash (0–800ms)
Black screen, centered:
```
   DavOS v1.0
   Copyright (c) 2026 Dave Ungvari Industries

   [ POST: ok ]
   [ memory: ∞ ]
   [ devices: keyboard, mouse, vibes ]
```

### Stage 2: systemd-style log (800–1600ms)
Lines stream into the terminal pane (which is already mounted, terminal-side):
```
[  OK  ] Started portfolio service
[  OK  ] Mounted /projects (7 items)
[  OK  ] Loaded theme: green
[  OK  ] Reached target: desktop
```
Then the desktop pane fades in (200ms). Total boot ≤ 1.6s, skippable on any keypress / click.

`prefers-reduced-motion`: skip both stages, render the desktop immediately.

---

## Interaction model

### Icon
- **Click** = select (border highlights, single-click does NOT launch — desktop convention)
- **Double-click / Enter** = launch via existing `GameOverlay.open(p.liveUrl, p.title, terminal)`
- **Right-click** = context menu: `Open`, `View source`, `Show details` (= run `/<projectcmd>` in terminal pane), `Copy live URL`
- **Long-press** (mobile) = context menu
- **Arrow keys** when desktop pane focused = navigate icons; **Enter** = launch
- **Drag onto trash** = playful: terminal echoes "nice try, that's a project not a file" + trash wiggles

### Terminal
- All v1 commands continue to work, unchanged
- New commands:
  - `/desktop` — focus the desktop pane (mobile: switch tab)
  - `/launch <project>` — alias of `/play <project>`
  - `/wallpaper <theme>` — alias of `/theme <name>` for OS feel
  - `/shutdown` — easter egg: BSOD-style "It is now safe to turn off your portfolio." then auto-reboot in 3s
  - `/logout` — same as `/shutdown` but cheekier
  - `/htop` — fake process list (joke commands like `node coffee.js` running 99% CPU)

### Cross-pane sync
- Launching a project from the icon also writes `> launching swarm-command...` into the terminal output
- Launching from `/play swarm` (terminal) briefly highlights the icon
- Theme change from the taskbar dropdown writes `> theme set to amber.` to the terminal

---

## File structure (after redesign)

```
portfolio/
├── index.html                       ← rewritten: OS shell layout
├── PLAN.md                          ← kept (v1 historical)
├── PLAN-OS.md                       ← this file
├── README.md                        ← updated to describe v2
├── css/
│   ├── reset.css                    ← unchanged
│   ├── tokens.css                   ← NEW: CSS vars (theme-agnostic) extracted
│   ├── os-shell.css                 ← NEW: layout grid (taskbar + desktop + terminal)
│   ├── desktop.css                  ← NEW: wallpaper, icon grid, icon, trash, context menu
│   ├── taskbar.css                  ← NEW: top bar, clock, theme dropdown, OS menu
│   ├── terminal.css                 ← updated: terminal scoped to .terminal-pane
│   ├── effects.css                  ← unchanged
│   ├── mobile.css                   ← rewritten: stacked + tab toggle
│   ├── game-overlay.css             ← unchanged (overlay still works as-is)
│   └── boot.css                     ← NEW: BIOS splash + fade-in
├── js/
│   ├── terminal.js                  ← unchanged (engine)
│   ├── commands.js                  ← unchanged + new: /desktop, /launch, /wallpaper, /shutdown, /logout, /htop
│   ├── projects.js                  ← unchanged (data drives the icon grid)
│   ├── extras.js                    ← unchanged
│   ├── easter-eggs.js               ← unchanged
│   ├── themes.js                    ← extended: applyTheme() also touches taskbar + desktop CSS vars
│   ├── matrix.js                    ← unchanged
│   ├── boot.js                      ← rewritten: two-stage OS boot
│   ├── konami.js                    ← unchanged
│   ├── idle.js                      ← unchanged
│   ├── game-overlay.js              ← unchanged
│   ├── desktop.js                   ← NEW: renders icon grid from projects[], selection state, dbl-click → GameOverlay
│   ├── icon.js                      ← NEW: factory for one icon DOM element + event wiring
│   ├── taskbar.js                   ← NEW: clock tick, theme dropdown, OS menu
│   ├── context-menu.js              ← NEW: right-click + long-press menu
│   ├── splitter.js                  ← NEW: drag the divider, persist width to localStorage
│   ├── pane-toggle.js               ← NEW: mobile tab toggle, Ctrl+` collapse
│   └── main.js                      ← rewired: instantiate Desktop, Taskbar, Terminal, run boot
└── tests/
    ├── (existing tests updated for new DOM)
    └── tests-os.js                  ← NEW: icon grid render, click → launch, splitter, taskbar clock, mobile toggle
```

Script load order in `index.html` keeps the global-namespace pattern (no modules):
```html
<script src="js/terminal.js"></script>
<script src="js/commands.js"></script>
<script src="js/projects.js"></script>
<script src="js/extras.js"></script>
<script src="js/easter-eggs.js"></script>
<script src="js/themes.js"></script>
<script src="js/matrix.js"></script>
<script src="js/game-overlay.js"></script>
<script src="js/icon.js"></script>
<script src="js/desktop.js"></script>
<script src="js/context-menu.js"></script>
<script src="js/taskbar.js"></script>
<script src="js/splitter.js"></script>
<script src="js/pane-toggle.js"></script>
<script src="js/boot.js"></script>
<script src="js/konami.js"></script>
<script src="js/idle.js"></script>
<script src="js/main.js"></script>
```

No build step, no bundler, no framework. Same deploy: push to `main`, GitHub Pages serves it.

---

## Acceptance criteria (per phase)

### Phase 1 — Layout shell
- [ ] On desktop ≥ 1024px, page shows top bar + left pane + right pane (terminal)
- [ ] CSS Grid drives the layout, no JS for layout
- [ ] Resizing the divider stores width in localStorage, restored on reload
- [ ] All four themes correctly recolor the new chrome
- [ ] Page renders without JS as a "browser too old" message in the terminal pane (graceful degradation)

### Phase 2 — Desktop + icons
- [ ] One icon per entry in `projects[]`, label = project command without slash, initial = first letter of title
- [ ] Click selects (border highlight); only one icon selected at a time; click empty desktop deselects
- [ ] Double-click opens `GameOverlay` with the project's `liveUrl`
- [ ] Hover shows tagline tooltip after 500ms (no tooltip on touch devices)
- [ ] Arrow keys when desktop has focus navigate icons (wraps grid edges); Enter launches selected
- [ ] Trash icon: dragging an icon onto it triggers an easter-egg toast and the icon snaps back

### Phase 3 — Terminal pane
- [ ] All v1 commands still work, identical output, identical history
- [ ] Terminal input keeps focus by default; clicking the desktop hands focus to the desktop pane
- [ ] New commands `/desktop`, `/launch <p>`, `/wallpaper <t>`, `/shutdown`, `/logout`, `/htop` registered and tested
- [ ] Cross-pane sync: launching from icon writes a line to terminal output

### Phase 4 — Taskbar + boot
- [ ] Taskbar shows live clock, updates every second
- [ ] Theme dropdown lists all four themes, click switches + persists, marks active
- [ ] OS menu (left "DavOS 1.0" label) is clickable and opens an "About this PC" panel showing skills/years/contact (replaces hardcoded `/skills` % bars with "currently shipping" / "previously shipped" buckets)
- [ ] New two-stage boot runs in ≤ 1.6s and is skippable
- [ ] `prefers-reduced-motion` skips boot

### Phase 5 — Mobile + a11y
- [ ] On < 640px: bottom tab bar toggles desktop ↔ terminal, only one visible
- [ ] On 640–1023px: stacked panes (desktop top, terminal bottom)
- [ ] Tab order is sensible: taskbar → desktop icons → terminal input
- [ ] All interactive surfaces have aria-labels; live region on terminal output unchanged
- [ ] Color contrast ≥ 4.5:1 for text on every theme (verified per theme)
- [ ] Lighthouse a11y score ≥ 95

### Phase 6 — Tests + ship
- [ ] All existing tests updated to find new DOM, still pass
- [ ] New tests-os.js covers: icon render count == projects.length, double-click triggers GameOverlay.open mock, splitter drag updates width, taskbar clock format, mobile toggle switches active pane
- [ ] Total test count ≥ current 342
- [ ] CI green on push
- [ ] GitHub Pages deploy verified visually

---

## Out of scope (explicit non-goals)

- Floating draggable windows for projects (deferred to v3 — full window manager)
- Multiple workspaces / virtual desktops (UI hint only, "workspace 1" is decorative)
- File system / `cd` / `ls` for real (still easter eggs)
- Drag-and-drop icon rearrangement (icons are positioned by data order)
- Login screen / user picker
- Right-click on the desktop wallpaper itself (only icons get the menu in v1)

---

## Risks + mitigations

| Risk | Mitigation |
|---|---|
| Tests are tightly coupled to v1 DOM | Phase 6 dedicated to test migration; keep v1 selectors where possible (e.g. `#terminal`, `#output`, `#command-input`) |
| Mobile UX feels cramped with two panes stacked | Bottom tab toggle is the safety net — only one pane at a time |
| iframe overlay blocked by sites that send X-Frame-Options | Already handled in v1 (10s fallback) — no change needed |
| Recruiters don't immediately understand the OS metaphor | Boot sequence ends with a terminal line `> tip: double-click an icon to launch a project, or type /help` |
| New layout breaks existing /clear, /history, etc. | Terminal engine is unchanged; only its container moves. All commands are DOM-isolated within `.terminal-pane` |
| GitHub Pages deploy regression | No build step added. Static files only. |

---

## Voice / copy

Brand voice stays: dry, technical, slight cheek. No emoji in primary copy (one or two in easter eggs is fine). Examples:

- Boot last line: `[  OK  ] Reached target: desktop`
- Tooltip on a project icon: same as `tagline` field in `projects.js`
- Trash easter egg: `nice try. that's a project, not a file.`
- `/shutdown`: `It is now safe to turn off your portfolio.` (full-screen blue overlay, white monospace, auto-reboots after 3s)
- About panel: `Dave Ungvari · Full-stack @ Omada A/S · Copenhagen · DK/EN/HU`

---

## Migration order (sprint phases)

The redesign ships in 6 phases mapping 1:1 to BACKLOG items A1..A25. Each phase is independently mergeable; v1 keeps working until the final integration in Phase 3. See `.sdlc/BACKLOG.md` Sprint A for the ordered task list.
