# Portfolio v4 — DavOS: Visual Fidelity Pass

**Status:** spec, not yet built
**Builds on:** `PLAN-OS-V3.md` (windows, apps, persona, FS)
**Author:** plan generated 2026-04-28
**Goal:** v3 made it functionally an OS. v4 makes it *feel* like one. Every surface reads as a real desktop environment — not a webpage cosplaying as one.

The bar: a recruiter watching over your shoulder for 5 seconds should think "that's a Linux box" before "that's a portfolio site." Today they think the latter — chrome is too thin, animations are missing, and the taskbar is one strip of text.

Everything still vanilla. Zero deps. No build step.

---

## What's missing today (audit)

Walked the current build. Visual gaps that break the OS illusion, ordered by how much they cost the metaphor:

| Gap | Symptom | OS analog |
|---|---|---|
| No launcher / start menu | Taskbar OS label opens an About modal, not an app menu | Win Start, GNOME Activities, macOS Launchpad |
| Windows pop in instantly | No open / close / minimize animation | Genie, scale-fade, compositor effects |
| Static wallpaper | Dot grid + theme tint, otherwise dead | Per-distro wallpapers, parallax, particle layers |
| Taskbar = text strip | No app icons, no pinned apps, no quick toggles | macOS Dock, Win11 taskbar, Plasma panel |
| No login / lock screen | Boot drops straight to desktop | gdm, lightdm, lock screen on idle |
| No quick settings / control center | Theme dropdown only; no consolidated panel | Win11 Quick Settings, macOS Control Center |
| No calendar / clock popout | Clock is a label | Every desktop OS since 1995 |
| No notification center panel | Toasts disappear, no history surface | Win Action Center, macOS Notification Center |
| Window chrome is minimal | One titlebar, no status bar, no menu bar, no shadow ramp by focus | Real apps have menubars + footers |
| No icon depth / shadow below windows | Windows float on flat bg | Compositor drop-shadows, ambient occlusion |
| No drag affordances | Selection lasso, drag ghost, snap-to-grid all absent | Standard file-manager UX |
| No widgets on desktop | Empty wallpaper outside icon grid | Conky, KDE plasmoids, macOS widgets |
| Cursor never changes | Always default | OS uses crosshair / move / busy / text cursors per context |
| No window thumbnails in taskbar | Hovering a running app shows nothing | Win Aero peek, GNOME hover preview |
| Mouse trails / focus glow weak | Nothing tells you which window is "live" beyond border | Active-window glow, dimmed inactive |

Fixing all of this is the v4 program. It splits cleanly into seven phases, each independently mergeable.

---

## Architectural backbone (build first)

Two new infra pieces unlock most of v4. Build before chasing polish.

### 1. `js/anim.js` — animation primitives
Shared helpers for the rest of v4. No animation lib; just thin wrappers over `Element.animate()`:

```js
Anim.scaleIn(el, { from: 0.92, dur: 180 })
Anim.genie(el, targetRect, { dur: 280 })          // minimize → taskbar
Anim.crossfade(elOut, elIn, { dur: 220 })
Anim.shake(el, { px: 6, dur: 320 })
Anim.flyTo(el, fromRect, toRect, { dur: 240 })
```

Every helper checks `prefers-reduced-motion` and short-circuits to instant. Single place to disable animation globally for tests / a11y.

### 2. `js/desktop-layer.js` — z-index registry
Today, z-indexes are scattered string literals across CSS files (`z-index: 4000`, `7000`, `9500`...). v4 needs strict layering for popouts (calendar above taskbar above windows above wallpaper but below modals). Centralize:

```js
const Layer = {
  WALLPAPER: 0,
  WIDGETS: 100,
  ICONS: 200,
  WINDOWS: 1000,         // window-manager owns 1000-1999 internally
  TASKBAR: 3000,
  POPOUTS: 4000,         // calendar, quick settings, start menu
  CONTEXT_MENU: 5000,
  NOTIFICATION: 6000,
  MODAL: 7000,
  LOCK_SCREEN: 9000,
  BSOD: 9500
};
```
Replace literal z-indexes with `var(--layer-popout)` etc. via CSS custom props injected at boot. Saves a class of bugs where a new feature lands above or below something it shouldn't.

---

## Phase C1 — Window chrome & motion (the big one)

Highest visual ROI. Today windows just appear; v4 they breathe.

### C1.1 Open / close animations
- **Open:** scale from 0.92 + opacity 0 → 1.0 + opacity 1 over 180ms, ease-out. Origin = where the click came from (`transform-origin` set from click event). Falls back to center if launched via terminal.
- **Close:** reverse, 140ms ease-in. Window deletes after animation.
- **Minimize:** "genie" — `clip-path: inset()` collapses toward the matching taskbar entry's bounding rect over 280ms. Uses `flyTo()` from `anim.js`. On restore, reverses.
- **Maximize:** width/height transition from current rect → workspace rect over 200ms.
- **Snap:** existing snap preview gets a 100ms scale-in pulse so the user sees the snap target appear, not blink.

### C1.2 Window depth & focus
- **Active window:** stronger glow (current 24px → 40px), border becomes `--color-primary`, shadow ramps from 12px to 32px.
- **Inactive windows:** scale shadow down + desaturate border + drop opacity to 0.96 (subtle — must not look broken).
- **Drop shadow under windows:** layered shadow (`0 1px 2px`, `0 4px 12px`, `0 16px 48px`) for a real compositor look. Per theme.

### C1.3 Window menubar + status bar
Native apps (Settings, Mail, CV viewer, Apps grid) get:
- **Menubar row** under titlebar: `File | Edit | View | Help` (clicking opens dropdowns with at least 2-3 plausible items each — most are decorative, e.g. `View → Refresh`, `Help → About`)
- **Status bar** at window bottom: contextual text (e.g. Settings: "All changes saved"; Mail: "3 messages, 1 unread"; FileExplorer: "12 items").

Iframe windows skip menubar (the app inside has its own UI).

### C1.4 Focus ring chrome
Title bars get a subtle 1px inset highlight when the window is active and a desaturated state when not. Mac-style traffic light dots dim to gray when window is inactive. Standard convention.

**Acceptance:**
- All window state changes animate < 320ms
- `prefers-reduced-motion` skips every transition
- Active vs inactive windows distinguishable from 2 meters away
- Native apps have menubar + status bar; iframe apps don't

---

## Phase C2 — Taskbar transformation

Taskbar today is a text strip. v4: a real panel with launcher, pinned apps, running apps, system tray, clock cluster.

### C2.1 Start menu / Launcher
- Click `DavOS 1.0` → opens **Launcher** popout (slides up from taskbar, 320×420px, anchored bottom-left).
- Top: search input (filters as-you-type, fuzzy match against app names + project names + commands).
- Middle: grid of installed apps (Settings, Mail, CV, Apps grid, Boring view, every project).
- Bottom row: 4 quick-actions: `About`, `Sleep`, `Lock`, `Restart` (= `/shutdown` easter egg).
- Esc / click-outside closes. Up/Down arrow keys navigate, Enter launches.
- Replaces the existing About-modal-on-OS-label behavior; About moves under "About" quick action.

### C2.2 Pinned apps strip
Between launcher and running apps. 4-6 icons (Terminal, Files, Settings, CV, Mail, Browser/Apps grid). Click launches; right-click → "Unpin from taskbar". Order persists in session.

### C2.3 Running apps with thumbnails
- Already have `taskbar-running` strip from v3.
- Hover any running app entry → 200ms delay → thumbnail tooltip pops up (160×100px) showing window title + small icon (live thumbnail = hard, skip; static colored card with title is fine).
- Right-click running app → menu: `Restore`, `Minimize`, `Close`, `Move to workspace 2` (decorative).

### C2.4 System tray expansion
Current tray: net rate, volume, EQ, battery (decorative). v4 makes them clickable popouts:
- **Volume:** click → vertical slider popout, drag changes the bar count (purely cosmetic, no audio). 60×140px.
- **Network:** click → "Wired (eth0)  ↑ 1.2M/s ↓ 4.8M/s   [disconnect]" panel.
- **Battery:** click → "Battery: 87%   Time remaining: ∞   [Power saver]".
- **Notifications bell:** new tray slot. Badge count. Click opens **Notification Center** (Phase C3.2).

### C2.5 Clock + Calendar popout
Click clock → calendar popout slides up. 280×320px:
- Month grid (today highlighted)
- Time below: HH:MM:SS, day name, ISO date
- Bottom: "Copenhagen · UTC+1" — pulled from persona
- Esc closes.

### C2.6 Workspace switcher
The deco `─ workspace 1 ─` becomes a real dropdown. Click opens 3-column popout showing workspace 1/2/3 with mini live-thumbs of windows on each. Switch animates a horizontal slide of the workspace area (windows on workspace 2 are hidden, not closed). v4 ships 3 workspaces; only 1 has anything in it.

**Acceptance:**
- Launcher opens via OS label click + `Cmd+Space`
- All tray items have a popout
- Calendar shows correct date, today highlighted
- Workspace switcher actually moves windows on/off screen
- Pinned apps survive reload (session-store)

---

## Phase C3 — Control surfaces

Consolidate scattered settings into proper system panels.

### C3.1 Quick Settings panel
Top-right of taskbar gets a Quick Settings icon (≡ or ⚙). Click opens 320×360px popout:
- **Theme:** 4 swatches (active highlighted) — replaces the `[theme▾]` dropdown from v3
- **Effects:** scanlines toggle, glow strength slider, motion override
- **Density:** comfortable / compact (changes spacing CSS var)
- **Font size:** S / M / L
- **Sleep now** + **Lock** buttons
- Bottom: "All settings →" link → opens full Settings app window

Settings app and Quick Settings share the same store. Edits in one are reflected in the other.

### C3.2 Notification Center
Bell icon in tray (C2.4) opens a 360×500px slide-out from right edge:
- **Today** group: all unread + last 24h notifications
- **Earlier** group: collapsed
- Each entry: app icon, title, body, relative time, ✕ to dismiss
- Bottom: "Clear all" + "Do not disturb" toggle
- DND active = bell shows muted state, new notifications go to log silently.

Notify.push() already feeds the log; just add the panel UI.

### C3.3 Lock screen + sleep mode
Today, idle = matrix rain. v4 layers it:
- After 5min idle → screen darkens to 60% over 800ms (CSS filter)
- After 10min → full lock screen overlay: large clock, date, "press any key to unlock", subtle wallpaper-blur backdrop
- Wake on any input → 250ms fade out
- Lock screen visible immediately after `/lock` or Quick Settings → Lock

Lock screen has an avatar (use ASCII portrait or initials), name from persona, blurred wallpaper underneath, password input that accepts anything (cosmetic — "any key unlocks").

### C3.4 Login screen (first visit only)
First-ever boot (`session.visitCount === 0`):
- After BIOS POST + systemd log, instead of fading directly to desktop, show login screen
- Avatar centered, "visitor" username, password input
- Auto-typed `••••••••` after 1.2s (skippable on any keypress)
- "Welcome, visitor" splash → desktop fades in
- Subsequent boots: skip to desktop directly (just like v3)

Reinforces the "this is a real OS" frame on the first impression that matters most.

**Acceptance:**
- Quick Settings + full Settings agree on every value
- Notification Center shows full history; "Clear all" wipes
- Lock screen blocks input until any key/click; Esc on input clears the dummy password
- Login only on first visit; subsequent boots go straight to desktop

---

## Phase C4 — Wallpaper & desktop life

Wallpaper area today is a dot grid. Make it feel inhabited.

### C4.1 Layered wallpaper
Each theme gets 3 layers stacked with `mix-blend-mode`:
1. **Base:** solid color (current bg)
2. **Pattern:** existing dot grid OR theme-specific (matrix: pre-rendered glyph rain frame; amber: phosphor radial; blue: starfield)
3. **Vignette:** radial darken from edges → center

Mouse parallax: top layer translates up to ±8px following cursor (very subtle, throttled to 30fps via rAF). Skip on `prefers-reduced-motion` and touch.

### C4.2 Desktop widgets
Pinned to wallpaper, draggable, persist position. v4 ships 3:
- **Clock widget** — large ASCII digital clock, top-right of wallpaper area
- **System info** — `host: daveos · uptime: 2m 18s · load: 0.42 0.51 0.39 · mem: ∞` (refreshes every 5s)
- **Quote of the day** — pulls from existing `/motd` content; rotates daily

Right-click widget → "Remove widget" / "Lock position". Right-click empty wallpaper → "Add widget ▸" submenu lists available widgets (the 3 above + a hidden 4th: ASCII Pong, easter egg, runs in the widget).

### C4.3 Wallpaper context menu (richer)
v3 right-click wallpaper menu is minimal. v4:
```
Open Terminal
Open File Explorer
─────────────
View ▸           Large icons / Medium icons / List
Sort by ▸        Name / Type / Recently added
Refresh
─────────────
Add widget ▸
Change wallpaper ▸   (= theme picker inline)
─────────────
Display settings...
About DavOS
```

### C4.4 Selection lasso
Click-drag on empty wallpaper draws marquee rectangle (1px dashed `--color-primary`, fill `rgba(primary, 0.08)`). Icons inside become selected. `Ctrl+A` selects all. Affects icons only — no batch-launch (that's chaos), but selected icons can be dragged together.

### C4.5 Icon drop shadow + lift
Today icons sit flat on wallpaper. v4:
- Icon glyph gets ambient shadow `0 4px 8px rgba(0,0,0,0.4)` always
- On hover: shadow grows + lift transform
- On drag: shadow extends + scale 1.04 + slight rotation
- Drop animation: shadow shrinks back as icon settles

**Acceptance:**
- Each theme's wallpaper is recognizable at a glance with no labels
- Parallax works on mouse, disabled on touch + reduced motion
- Widgets draggable, position persists
- Lasso selects icons within drawn rectangle
- All icon interactions have lift/shadow response

---

## Phase C5 — File Explorer app

The persona FS (v3 `js/fs.js`) is currently terminal-only. v4 surfaces it as a real app.

### C5.1 Files window
New native app, accessible via:
- Pinned taskbar icon (Files)
- Right-click wallpaper → "Open File Explorer"
- Double-click any folder icon if v4 adds folders (out of scope, defer)
- Terminal: `/files` or `nautilus`/`finder` commands as aliases

Window chrome:
- **Sidebar** (160px): tree of `/home/visitor/`, `/home/visitor/projects/`, `/home/visitor/docs/`, `/home/visitor/.secrets/`. Expandable triangles.
- **Toolbar:** back, forward, up, refresh, address bar (`~/projects/`).
- **Main pane:** grid view of files in current directory. File icons + filename below.
- **Status bar:** `12 items, 0 selected`.

### C5.2 File interactions
- Single-click file: select (highlight)
- Double-click `*.app` file: launches that project window (delegates to `Window.open`)
- Double-click `*.txt`/`*.md`: opens in **Text Viewer** sub-app (mini window, scrollable monospace pane)
- Right-click file: `Open`, `Open in terminal`, `Properties` (= modal with size, type, modified date — all decorative)

### C5.3 Address bar
Editable. Type `~/projects/` + Enter → navigates. Tab autocompletes paths from FS. Sync with terminal `cd` so the most recent terminal cwd is reflected (or vice versa — bidirectional bind via session-store).

**Acceptance:**
- Files app ships, launchable 4 ways
- All FS files render with correct icons (`.app`, `.txt`, `.md`, folder)
- Double-click `.app` opens project window
- Address bar typing + Tab works
- Properties dialog opens

---

## Phase C6 — Cursor + micro-interactions

Small details that compound. Real OSes change the cursor 30 times a second; we don't even change it once today.

### C6.1 Contextual cursors
- Default: standard arrow
- Title bar: `move`
- Resize edges: `n-resize` / `s-resize` / etc. (already partial — verify all 8 directions)
- Terminal pane content: `text`
- Loading state: custom CSS busy spinner cursor (or `wait`)
- Drag in progress: `grabbing`
- Disabled buttons: `not-allowed`

### C6.2 Hover states everywhere
Audit pass: every button, icon, menu item must have a hover state with ≥150ms transition. Today most do; missing spots: tray items, workspace label, mobile pane toggles.

### C6.3 Click feedback
- Buttons: brief scale-down (`0.97`) on `:active`, 80ms
- Icons: existing translateY(1px) on active is good
- Title bar buttons: ripple-like brightness pulse on click
- Menu items: 80ms background fade on click before menu closes (so the user sees what they picked)

### C6.4 Loading states
- Window iframe loading: replace static "Loading..." with terminal-style animated dots `Loading.`, `Loading..`, `Loading...` cycling 400ms
- Slow-load (>2s): add ASCII spinner `⠋ ⠙ ⠹ ⠸ ⠼ ⠴ ⠦ ⠧ ⠇ ⠏`
- App launching from launcher: 300ms shimmer pass over the icon before the window appears

### C6.5 Focus indicators
Every focusable element needs a visible focus ring (`outline: 2px solid var(--color-accent)`). Today some have it, some don't. a11y win + visual polish.

**Acceptance:**
- Cursor changes appropriately in 6+ contexts
- All interactive elements have hover + active state
- Focus visible on every focusable element
- Loading animations don't freeze (rAF based)

---

## Phase C7 — Boot sequence redux

Today's boot is good but front-loaded — POST + systemd log + desktop fade. v4 lengthens it slightly to include login (when first visit) and adds polish.

### C7.1 BIOS POST upgrade
- Animated memory count-up: `262144K OK` ticks from 0 to final over 350ms
- Hex address probes scroll past: `Probing 0xC0000... ok`, `Probing 0xC8000... ok` (4-5 lines)
- Device detection: `Found: keyboard`, `Found: mouse`, `Found: 1 webcam (covered with tape, smart)`
- Final: `Press DEL to enter SETUP — this does nothing.`

### C7.2 Bootloader stub
Brief 250ms screen between POST and systemd:
```
GRUB version 2.06
> DavOS 1.0 (default)
  DavOS 1.0 (recovery mode)
  Memtest86+
```
First option auto-selected, countdown `3...2...1...` then proceeds.

### C7.3 systemd log polish
- Each `[ OK ]` is colored green (already)
- Add `[ FAIL ]` line in red for joke service: `[ FAIL ] Started user motivation` followed by `[ OK ] Started user motivation (after coffee)`
- 2-3 services show progress bars `[ ▰▰▰▱▱▱ ] Loading projects...`

### C7.4 Login screen (if first visit)
See C3.4 above. Inserted between systemd log and desktop fade.

### C7.5 Desktop entrance
Today: pane fades in. v4: layered:
- Wallpaper fades in first (200ms)
- Icons stagger in (each 30ms after the previous), scale-up + fade
- Taskbar slides down from top edge (200ms, 60ms after wallpaper)
- Terminal pane slides in from right
- Total entrance ≤ 800ms

`prefers-reduced-motion` skips everything; goes straight to fully-rendered desktop.

**Acceptance:**
- Boot sequence ≤ 2.5s total on a cold cache, skippable on any input
- First visit: login screen shown; subsequent: skipped
- Reduced motion: instant render, no animation
- All boot text legible / no flash of unstyled content

---

## File structure additions (v4)

```
portfolio/
├── PLAN-OS-V4.md                      ← this file
├── css/
│   ├── anim.css                       ← NEW: shared keyframes, easing curves
│   ├── launcher.css                   ← NEW: start menu popout
│   ├── tray-popouts.css               ← NEW: volume/net/battery/calendar
│   ├── quick-settings.css             ← NEW
│   ├── notification-center.css        ← NEW
│   ├── lock-screen.css                ← NEW (replaces sleep.css OR extends)
│   ├── login-screen.css               ← NEW
│   ├── widgets.css                    ← NEW: clock / sysinfo / quote widgets
│   ├── files-app.css                  ← NEW
│   ├── window-manager.css             ← extended: focus chrome, menubar, status bar
│   ├── desktop.css                    ← extended: lasso, drop shadows, parallax host
│   └── cursors.css                    ← NEW: contextual cursor rules
├── js/
│   ├── anim.js                        ← NEW: animation primitives
│   ├── desktop-layer.js               ← NEW: z-index registry
│   ├── launcher.js                    ← NEW
│   ├── tray-popouts.js                ← NEW
│   ├── quick-settings.js              ← NEW
│   ├── notification-center.js         ← NEW (extends notify.js)
│   ├── lock-screen.js                 ← extends idle.js
│   ├── login-screen.js                ← NEW
│   ├── widgets.js                     ← NEW
│   ├── widget-clock.js                ← NEW
│   ├── widget-sysinfo.js              ← NEW
│   ├── widget-quote.js                ← NEW
│   ├── lasso.js                       ← NEW: marquee selection on desktop
│   ├── parallax.js                    ← NEW: mouse parallax for wallpaper
│   ├── apps/files.js                  ← NEW: file explorer app
│   ├── apps/text-viewer.js            ← NEW: opens .txt/.md
│   ├── window-manager.js              ← extended: open/close/genie animations, menubar/statusbar slots
│   ├── taskbar.js                     ← extended: pinned apps, thumbnails, workspace switcher
│   ├── boot.js                        ← extended: POST upgrade, GRUB, login hook, staggered entrance
│   └── fs.js                          ← extended: bidirectional bind with files app
└── tests/
    └── tests-v4.js                    ← NEW: covers all C1–C7 acceptance criteria
```

Total: ~22 new files, ~6 extended. No build step. Same script-tag load order pattern.

---

## Phase order & sizing

| Phase | Title | Items | Size | Visual ROI |
|---|---|---|---|---|
| C1 | Window chrome & motion | 4 sub | L | ★★★★★ |
| C2 | Taskbar transformation | 6 sub | XL | ★★★★★ |
| C3 | Control surfaces | 4 sub | L | ★★★★ |
| C4 | Wallpaper & desktop life | 5 sub | L | ★★★★ |
| C5 | File Explorer app | 3 sub | M | ★★★ |
| C6 | Cursor + micro-interactions | 5 sub | M | ★★★ |
| C7 | Boot sequence redux | 5 sub | M | ★★★ |

If time-boxed: ship **C1 + C2** for max impact. Those two alone close the gap from "themed terminal" to "real desktop." C3–C7 are layered polish that compounds.

If shipping in order, each phase is independently mergeable and visibly improves the build. Recommend small PRs per sub-item, not per phase.

---

## Out of scope (icebox for v5+)

- Real audio (volume slider stays cosmetic)
- Actual workspace switching with separate window stacks per workspace (v4 has 3 workspaces but only #1 holds windows; switching is animated but doesn't isolate state)
- Drag-and-drop between Files app and Trash
- Desktop folders (`/home/visitor/Documents/` etc. as openable folder icons)
- Multi-monitor mock (a "second display" toggle would be funny but adds layout complexity)
- Theme editor (visual color picker that writes back to tokens.css)
- Login users picker (multiple personas — overkill for solo portfolio)
- Real keyboard shortcuts cheatsheet customization
- Animated `/htop` with live-updating fake processes (already a joke in v3, leave it)
- Actual blur on backdrop-filter for lock screen (perf — fake it with a static blurred snapshot)
- Voice-over / TTS easter egg
- Mobile parity for windows (tablets stack, phones single-pane — keep v3 behavior)

---

## Risks + mitigations

| Risk | Mitigation |
|---|---|
| Animation budget cost on low-end devices | Every transition behind `prefers-reduced-motion`; rAF-throttle parallax; cap simultaneous animations at 4 |
| Taskbar gets visually busy with all the additions | Strict order + spacing; hide tray items < 640px (already done); test at 1280px (recruiter laptop) |
| Login screen annoys returning visitors | Only first visit (`session.visitCount === 0`); skippable on any keypress; default 1.2s |
| Lock screen + idle matrix conflict | Replace matrix as default idle behavior; matrix becomes opt-in via Settings or `/matrix` command |
| Z-index regressions during migration to Layer registry | Migrate one feature at a time, verify each layer renders correctly before next |
| File Explorer sync with terminal `cd` causes confusion | Bidirectional bind off by default; toggle in Settings; or omit and let each track its own cwd |
| 22 new files increases load time | All <5KB each, no blocking; total <60KB unminified; defer non-critical (`widgets.js`, `parallax.js`) |
| Tests get harder with animation | Anim primitives have a test mode flag that resolves animations instantly; existing tests unaffected |

---

## Acceptance criteria (top-line)

A recruiter on a 1440×900 laptop, first visit, with sound off, watching for 30 seconds:

1. Sees a BIOS → bootloader → systemd → login → desktop sequence and reads "this is an OS"
2. Notices the dock-style taskbar with launcher, pinned apps, running apps, tray, clock
3. Sees the wallpaper has depth (parallax + layers + widgets), not a flat tint
4. Opens a project — window animates in, has chrome that looks like a real app, casts a shadow
5. Minimizes it — sees the genie animation toward the taskbar entry
6. Clicks the clock — calendar pops out
7. Clicks Quick Settings — sees a real control center, not just a theme dropdown
8. Goes idle 5min — screen dims; 10min — lock screen with their avatar
9. At no point does anything feel like a webpage in a tab

If all 9 land, v4 ships.

---

## Migration order — 32 items across 7 phases

Will land as Sprint C in `.sdlc/BACKLOG.md` (C01–C32):

```
C01–C04   Phase C1  (window animations, focus chrome, menubar, status bar)
C05–C10   Phase C2  (launcher, pinned apps, thumbnails, tray popouts, calendar, workspaces)
C11–C14   Phase C3  (quick settings, notif center, lock screen, login screen)
C15–C19   Phase C4  (wallpaper layers, widgets, context menu, lasso, icon shadows)
C20–C22   Phase C5  (files app, file interactions, address bar)
C23–C27   Phase C6  (cursors, hover, click feedback, loading, focus)
C28–C32   Phase C7  (POST, GRUB, systemd polish, login hook, staggered entrance)
```

Each item: plan → develop → test → review → commit, per orchestrator workflow. No item exceeds M complexity individually.

---

## Voice / copy notes

- Stay terminal-aesthetic everywhere. New surfaces (login, lock, calendar) use mono font + theme tokens
- Login welcome line: `Welcome back, visitor. Last login: {relative time}`
- Lock screen tagline: `screen locked. press any key.` (lowercase intentional)
- Empty notification center: `no notifications. your inbox is, for once, peaceful.`
- File explorer empty folder: `(empty — but full of potential)`
- Login screen username: stays `visitor`. Don't roleplay the recruiter.

Brand voice unchanged: dry, technical, slight cheek. No emoji in primary copy.
