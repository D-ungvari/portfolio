---
kind: plan
scope: Improvements + easter eggs sweep — close v4 polish gaps and add new hidden content
created: 2026-04-29
updated: 2026-04-29
status: ACTIVE
advances:
  - v4-polish: close residual rough edges from PLAN-OS-V4 (lock screen honesty, lasso wiring, cursor audit, resize affordance, taskbar thumbnails, notification center)
  - v4-completeness: ship Files-app text viewer (PLAN-OS-V4 C5.2), GRUB stub + BIOS SETUP (C7.1/C7.2), BSOD trigger (Layer.BSOD reservation since v4)
  - portfolio-personality: enlarge easter-egg surface (Pong widget hidden 4th, /snake, htop interactive, batch of 9 new hidden commands, Konami chain) — recruiter "wow" depth
backlog_items: [E01, E02, E03, E04, E05, E06, E07, E08, E09, E10, E11, E12, E13, E14, E15, E16]
task_count: 16
companion_plans: []
---

## Ultraplan: Improvements + Easter Eggs

### Vision Alignment
No `VISION.md` exists yet (project predates the convention). De-facto vision lives in `PLAN.md` ("modern developer terminal, fast, content over chrome, easy to extend") and `PLAN-OS-V4.md` ("recruiter watching for 5s should think 'that's a Linux box'"). This plan advances the v4 acceptance bar (#9: "at no point does anything feel like a webpage in a tab") by closing residual rough edges, plus deepens the personality layer that distinguishes this portfolio from a CV.

Recommend: codify a `VISION.md` in a separate, non-blocking pass once this plan ships — that work is purely doc, not blocked.

### Decision
**CREATE** — `.sdlc/plans/` was empty; no plan covers this scope.

### Gap Brief
The audit (Phase 1, three parallel Explore agents) confirmed:
- DavOS shipped through v4 (commit `d6fb938`). 7000 LOC vanilla JS, 591 tests, ~97 commands, 30+ easter eggs, 4 themes, 6 native apps, lock+login, widgets, launcher, animations.
- Stale state: `.sdlc/PROGRESS.md` last updated 2026-03-15 but v4 shipped end of April. `.sdlc/BACKLOG.md` lists `/resume` as queued — it's been live in `js/extras.js:94` since v3. Test runner loads 35 of 48 production scripts (12 untested incl. `anim.js`, `launcher.js`, `lock-screen.js`, all 5 apps). `package.json` description claims 440 tests; actual count is ~591.
- v4 reserved `Layer.BSOD = 9500` and described BIOS-SETUP / GRUB / Pong-widget hooks but never built them.
- v4 acceptance criterion "lock screen blocks input until any key/click" shipped, but the placeholder text says `••••••••  (any key to unlock)` — misleading. C5.2 text viewer for `.txt`/`.md` files in Files app is unimplemented. Lasso selection box renders but does nothing. Cursor never changes context.
- Personality surface plateaued — easter eggs are text-only command jokes. No hidden games beyond Konami's color flash. Pong widget called out in PLAN-OS-V4 C4.2 as "hidden 4th" never shipped.

This plan closes those gaps and extends the easter-egg layer.

### Scope Summary
- Items planned: 16 (E01–E16)
- Tasks generated: 16 (1:1)
- Estimated total size: 8 × S, 6 × M, 1 × L, 1 × XS — total ~M-2-week chunk for solo dev
- Critical path: E01 (hygiene) → E10 (GRUB stub) → E11 (BIOS SETUP) — boot.js is shared
- New patterns needed: **two** — (a) interactive overlay widget pattern for `/snake` and Pong (canvas + arrow input + esc-to-exit), (b) Anim primitives addition (`Anim.glitch`, `Anim.typewriter`)

### Dependency Graph

```
E01 (hygiene/test runner) ─── prereq for everything that adds a script
                              │
                              ├─► E02 (lock screen honesty)        ── exclusive: lock-screen.js / .css
                              ├─► E03 (lasso wiring)               ── exclusive: lasso.js
                              ├─► E04 (Files text viewer)          ── extends apps/files.js + new apps/text-viewer.js
                              ├─► E05 (Notification Center panel)  ── extends notify.js + notify.css
                              ├─► E06 (cursor context audit)       ── shared: cursors.css + several CSS files (pure-CSS)
                              ├─► E07 (resize hover affordance)    ── exclusive: window-manager.css
                              ├─► E08 (taskbar thumbnail tooltip)  ── extends taskbar.js / taskbar.css
                              │
                              ├─► E09 (BSOD)                       ── exclusive: new js/bsod.js + bsod.css
                              │       │
                              │       └─► (registers /bsod, hooks 1/1000 boot chance via main.js or boot.js)
                              │
                              ├─► E10 (GRUB stub) ──┬─► E11 (BIOS SETUP)   ── both extend boot.js → SERIAL
                              │                    │
                              │                    └─► (Anim.typewriter primitive needed)
                              │
                              ├─► E12 (9 new commands)             ── exclusive: easter-eggs.js (additive)
                              ├─► E13 (htop interactive)           ── exclusive: os-commands.js (htop handler)
                              ├─► E14 (/snake game)                ── new: js/snake.js + css
                              ├─► E15 (Pong widget)                ── extends widgets.js + new widget-pong.js
                              └─► E16 (Konami chain)               ── exclusive: konami.js
```

**Hard serial edges:** E10 → E11 (both extend `js/boot.js`).
**All other tasks parallel-safe** — exclusive files or pure-additive shared files (E12 in `easter-eggs.js` is additive but shouldn't run in parallel with another easter-egg-adding task; none planned here).

### Execution Order

| # | Task | Size | Depends on | Backlog item |
|---|------|------|-----------|--------------|
| 1 | E01 — SDLC hygiene + test runner fix | S | — | E01 |
| 2 | E02 — Lock screen honest password input | S | E01 | E02 |
| 3 | E03 — Lasso wired to group-drag | M | E01 | E03 |
| 4 | E04 — Files app text viewer subapp | M | E01 | E04 |
| 5 | E05 — Notification Center slide-out panel | M | E01 | E05 |
| 6 | E06 — Cursor context audit | S | E01 | E06 |
| 7 | E07 — Resize handle hover highlight | S | E01 | E07 |
| 8 | E08 — Taskbar thumbnail hover tooltip | S | E01 | E08 |
| 9 | E09 — BSOD easter egg (`/bsod` + boot panic chance) | S | E01 | E09 |
| 10 | E10 — GRUB bootloader stub | S | E01 | E10 |
| 11 | E11 — BIOS SETUP fake menu (DEL during POST) | S | E10 | E11 |
| 12 | E12 — Batch of 9 new easter-egg commands | S | E01 | E12 |
| 13 | E13 — `/htop` interactive kill simulation | S | E01 | E13 |
| 14 | E14 — `/snake` canvas game | M | E01 | E14 |
| 15 | E15 — Pong desktop widget (hidden 4th in Add Widget) | M | E01 | E15 |
| 16 | E16 — Konami repeat handling + secondary chain | XS | E01 | E16 |

Total: 1 XS + 8 S + 6 M + 1 L-ish (E14 is M-leaning-L). Foundation-first: E01 lands hygiene, then everything else parallelizable except E10→E11.

### Risk Register

| Risk | Impact | Mitigation |
|---|---|---|
| BSOD trigger on real recruiter visit | Trust loss, looks broken | Auto-recover after 4s ("press any key" — instant on click); persist `bsodSeen=true` so only once per visitor; chance 0.001 (one in a thousand cold boots) |
| `/snake` + Pong = real game logic untested | Regressions, perf | Implement deterministic tick step + headless tests (move snake N ticks, assert position); cap canvas size; respect prefers-reduced-motion (skip animation, render static "game over" placeholder) |
| BIOS SETUP captures DEL globally | Breaks DEL key everywhere | Only listen during POST window (≤800ms after boot start); detach listener at first non-POST frame |
| Cursor audit touches many CSS files | Unintended visual regression | Isolate all changes to `cursors.css` + targeted selectors; never broaden a `*` rule; manual smoke pass before commit |
| Notification Center slide-out conflicts w/ existing notify.js panel | Double-render, double-listener | Treat NC as the canonical UI, demote existing log panel to internal data store (notifications array); single render entry point |
| Test runner adding 12 scripts surfaces existing breakage | CI red on first run | Run locally before commit; if a script throws on load (jsdom-incompatible), guard the offending block with `typeof window.matchMedia.addListener === 'function'` style checks rather than skip |
| Easter-egg sprawl makes `/help` cluttered | Discoverability hurt | All E12 / E14 / E15 commands registered with `hidden=true`; only surface in `/help` if explicitly visible. Maintain easter-egg count display in `/credits` |
| boot.js double-extend (E10 + E11) | Merge conflict, ordering bug | Hard-serial in dep graph. E10 lands first, E11 builds on its hooks. Both gated on `prefers-reduced-motion` (instant) |

---

## Task Specs

### Task E01: SDLC hygiene + test runner script coverage
**Parent:** none (cleanup)
**Size:** S
**Depends on:** none
**Unblocks:** E02–E16
**Touches shared:** `tests/run-tests.js`, `package.json`, `.sdlc/PROGRESS.md`, `.sdlc/BACKLOG.md`
**Exclusive files:** none
**Registry allocations:**
  - component bit: none
  - enum values: none
  - tick slot: none
  - constants: none
  - protocol fields: none
**Port offset:** base
**Max LOC added:** 80

#### Goal
Ground every later task in honest state. PROGRESS.md is six weeks stale; BACKLOG.md lists `/resume` as queued though it shipped in v3; `package.json` description undercounts tests (~440 vs actual 591); `tests/run-tests.js` loads 35 of 48 production scripts so 12 are silently untested. Fix all four before adding new code.

#### Prerequisites
- `.sdlc/plans/COORDINATION.md` and `GAPS.md` exist (just created in this plan's bootstrap step).

#### Changes (in execution order)

**Step 1: Audit & sync `.sdlc/PROGRESS.md`**
- File: `.sdlc/PROGRESS.md`
- Change: rewrite "Recent Completions" to cover v4 (commit `d6fb938`), iframe positioning fix (`22c14e1`), HH:MM:SS clock fix (`4126f1c`), Swarm RTS add (`1054070`). Last-updated → 2026-04-29.
- Pattern: existing table format
- Why: any future `/go` reads PROGRESS first; stale state causes wrong work

**Step 2: Sync `.sdlc/BACKLOG.md`**
- File: `.sdlc/BACKLOG.md`
- Change: move `/resume` (item 2) to Completed (commit `bc89e87`, the v4 mega-commit). Move custom 404 (item 1) to Completed (404.html exists and works). Keep ASCII art project screenshots (item 3) as Queue. Append E01–E16 from this plan as the next sprint.
- Pattern: existing Queue/Completed split
- Why: source of truth for `/go`; this plan adds 16 items

**Step 3: Fix `package.json` test count claim**
- File: `package.json`
- Change: update description from "440 tests" to "591 tests" (or whatever current `npm test` reports). If preferred, drop the count from the description and document it in README instead.
- Pattern: edit the existing `description` string
- Why: stale claim is a credibility tax

**Step 4: Load missing scripts in `tests/run-tests.js`**
- File: `tests/run-tests.js:71-116`
- Change: extend the `scripts` array to include every JS file actually loaded by `index.html` (current diff: anim.js, desktop-layer.js, lasso.js, launcher.js, lock-screen.js, login-screen.js, parallax.js, pinned-apps.js, quick-settings.js, tray-popouts.js, widgets.js, plus `apps/settings.js`, `apps/mail.js`, `apps/cv-viewer.js`, `apps/apps-grid.js`, `apps/boring-view.js`). Order must match `index.html`.
- Pattern: existing array entries
- Why: silent untested code rots; we're about to add to several of these files (E02, E03, E04, E05, E08, E15)

**Step 5: Add a guard test asserting load order parity**
- File: `tests/tests-os.js` (append)
- Change: add `it('test runner loads every script in index.html')` — read both lists at runtime and assert they match. Use `fs.readFileSync('index.html')` + regex `\<script src="js/([^"]+)"`.
- Pattern: existing tests-os.js style (`TestHarness.it`)
- Why: catches the same drift next time someone adds a script

**Step 6: Move PLAN-OS.md / PLAN-OS-V3.md / PLAN-OS-V4.md into `.sdlc/designs/` or `archive/`**
- Files: `PLAN-OS.md`, `PLAN-OS-V3.md`, `PLAN-OS-V4.md` → `.sdlc/archive/`
- Change: `git mv` each. Leave `PLAN.md` at repo root (originally specified).
- Pattern: archive convention from `.sdlc/README.md` step
- Why: root is currently noisy with 4 PLAN files; only one should live there

#### Edge cases
- If `npm test` currently fails for any reason after step 4 (jsdom can't load a script that touches `window.matchMedia.addListener`), wrap that script's listener-registration in `if (typeof matchMedia.addEventListener === 'function')`. Don't skip the script — fix the script.
- Step 6 — if PLAN-OS files are referenced in README or elsewhere, update those refs. `grep -rn "PLAN-OS"` first.

#### NOT in scope
- Writing `VISION.md` — separate, lower-priority pass.
- Cleaning up `tests-v*.js` numbering scheme into a single coherent suite — too disruptive here.

#### Acceptance criteria
- [ ] `node tests/run-tests.js` exits 0 with the higher script count
- [ ] PROGRESS.md "Last updated" line is 2026-04-29 and reflects v4 ship
- [ ] BACKLOG.md Queue contains exactly E01 (this) → E16 plus retained ASCII art item
- [ ] `package.json` description test count is accurate (or removed)
- [ ] `grep -rn "PLAN-OS-V4" .` returns 0 hits in repo root (only inside `.sdlc/archive/`)
- [ ] New parity test passes

#### Test plan
- Run full `npm test` before/after; expect green both ways and a ≥20-test count bump (the new scripts may add a handful of inline tests once they're loaded).

#### Risk notes
- If a newly-loaded script registers a `DOMContentLoaded` listener, jsdom needs `dispatchEvent(new Event('DOMContentLoaded'))` already present at `tests/run-tests.js:129`. Verify it still fires for the new scripts.

---

### Task E02: Lock screen — honest password input
**Parent:** v4-polish residual
**Size:** S
**Depends on:** E01
**Unblocks:** none
**Touches shared:** `js/lock-screen.js`, `css/lock-screen.css`
**Exclusive files:** none
**Registry allocations:**
  - constants: none new (uses existing `IDLE_LOCK_MS`)
**Port offset:** base
**Max LOC added:** 120

#### Goal
Today the lock screen says `••••••••  (any key to unlock)`. Pressing literally any key — including Tab, Caps Lock, Esc — instantly unlocks. The placeholder text implies a password while the implementation is a doormat. Make the input behave like a password field: accept anything non-empty, run a 600 ms validation animation, then unlock. Cosmetic only, but the screen now reads as legitimate.

#### Prerequisites
- `js/lock-screen.js` exists with `LockScreen.lock()` and `LockScreen.unlock()`.
- `Anim.shake` available in `js/anim.js`.

#### Changes (in execution order)

**Step 1: Switch from "any key" to focused-input flow**
- File: `js/lock-screen.js`
- Change: drop the document-wide `keydown→unlock` listener. Auto-focus the password `<input type="password">` on lock. Listen for `Enter` on that input.
- Pattern: existing focus pattern in `js/launcher.js`
- Why: real lock screen takes input in a field

**Step 2: Validation animation on Enter**
- File: `js/lock-screen.js`
- Change: empty input + Enter → `Anim.shake(inputEl)` + flash hint "no password entered"; non-empty + Enter → disable input, swap label to "authenticating...", typed-dot animation 600 ms (reuse the login-screen.js dot pattern), then `unlock()`.
- Pattern: `js/login-screen.js` password-dot animation
- Why: even fake auth needs to feel like auth

**Step 3: Honest hint text**
- File: `js/lock-screen.js` + `css/lock-screen.css`
- Change: hint becomes `enter any password to unlock` (lowercase, dim). On wrong/empty submit, hint flips to `try any password — this is a portfolio.` after 1.5 s (so a stuck visitor isn't trapped).
- Pattern: existing dim hint text style
- Why: discoverability for visitors who don't realize it's cosmetic

**Step 4: Esc clears the input (don't unlock)**
- File: `js/lock-screen.js`
- Change: Esc on input → clear value + refocus. Don't bypass the flow.
- Pattern: standard input clear
- Why: matches real lock-screen UX

**Step 5: Mouse click anywhere outside the input is ignored**
- File: `js/lock-screen.js`
- Change: existing wake-on-click behavior moves to "wake from idle dim" only. Once the full lock screen is up, only the input flow unlocks.
- Pattern: separate "dimmed" vs "locked" state in idle.js
- Why: clicks shouldn't bypass the password

#### Edge cases
- `prefers-reduced-motion`: skip the 600 ms typed-dot animation, unlock immediately on Enter with non-empty value
- `Caps Lock on`: show small `Caps Lock` indicator (CSS only via input event flag)
- Touch device with no keyboard: tap input opens on-screen keyboard; submit button next to input with label "unlock"

#### NOT in scope
- Real password validation against any stored value (it's a portfolio)
- Forgot-password flow
- Biometric unlock cosmetics

#### Acceptance criteria
- [ ] Pressing arbitrary keys outside the input does nothing
- [ ] Empty Enter triggers shake animation
- [ ] Non-empty Enter unlocks after ≤700 ms (or instantly under reduced-motion)
- [ ] Esc clears input without unlocking
- [ ] Hint text switches to discoverability message after first failed attempt
- [ ] Existing `LockScreen.lock()` / `LockScreen.unlock()` API unchanged

#### Test plan
- New tests in `tests-os.js`: lock → simulate Enter on empty input → assert still locked; lock → set input value `"x"` → simulate Enter → flush timers → assert unlocked.

#### Risk notes
- `idle.js` triggers lock at 10 min — verify it goes through this new flow, not the old direct-listener.

---

### Task E03: Lasso selection wired to group-drag
**Parent:** v4-polish residual
**Size:** M
**Depends on:** E01
**Unblocks:** none
**Touches shared:** `js/lasso.js`, `js/desktop.js`, `css/desktop.css`
**Exclusive files:** none
**Registry allocations:** none
**Port offset:** base
**Max LOC added:** 250

#### Goal
`js/lasso.js` (~100 lines) implements click-drag selection box on the wallpaper but never wires the resulting selection to anything. Add: selected icons can be dragged together as a group; Esc clears selection; Ctrl+A selects all icons; selection persists across single clicks on empty wallpaper (only cleared by lasso-end with empty selection or Esc).

#### Prerequisites
- `js/desktop.js` already implements per-icon drag.
- `Lasso` exposes `getSelected()` returning DOM nodes.

#### Changes (in execution order)

**Step 1: Apply `.selected` class on lasso end**
- File: `js/lasso.js`
- Change: at marquee mouseup, iterate icons; class on those whose bounding rect intersects the marquee rect.
- Pattern: existing AABB intersection test (verify or add; document.elementsFromPoint isn't enough)
- Why: visible state for selection

**Step 2: Add `.selected` style**
- File: `css/desktop.css`
- Change: `.icon.selected { background: rgba(74,246,38,0.12); border: 1px solid var(--color-primary); border-radius: 6px; }` (theme-token-driven)
- Pattern: existing `.icon:hover` style
- Why: visual feedback

**Step 3: Group-drag handler**
- File: `js/desktop.js`
- Change: on `pointerdown` over a `.selected` icon, capture all `.selected` icons' starting positions. On `pointermove`, translate each by the same delta. On `pointerup`, persist new positions.
- Pattern: existing single-icon drag in `desktop.js`
- Why: matches Finder/Explorer multi-select drag

**Step 4: Esc clears selection, Ctrl+A selects all**
- File: `js/desktop.js`
- Change: register key handlers (delegate via `Shortcuts.register`).
- Pattern: existing `Shortcuts.register` calls in `js/shortcuts.js`
- Why: keyboard parity

**Step 5: Selection cleared on click-without-drag on empty wallpaper**
- File: `js/lasso.js`
- Change: distinguish click vs drag by total pointer movement (<3 px = click). Click on wallpaper clears `.selected`.
- Pattern: existing click-vs-drag heuristic in `desktop.js`
- Why: standard selection behavior

#### Edge cases
- Single icon dragged while other icons are selected (but pointerdown wasn't on a selected one) → selection clears, normal single-drag proceeds
- Selection includes pinned/system icons → still selects, still drags (positions persist regardless)
- Touch: lasso disabled, two-finger tap could trigger select-all (skip — touch out of scope here)

#### NOT in scope
- Ctrl+click for additive selection (defer)
- Right-click on selection → group context menu (defer to a follow-up)
- Multi-delete via `/rm` — still "permission denied"

#### Acceptance criteria
- [ ] Drag empty wallpaper → marquee renders → release → icons inside have `.selected` class
- [ ] Drag a `.selected` icon → all selected icons move together
- [ ] Esc clears selection
- [ ] Ctrl+A selects every desktop icon
- [ ] Click empty wallpaper without dragging clears selection
- [ ] Selected icon positions persist (Session.set) after group drag

#### Test plan
- Unit-style tests in `tests-os.js`: simulate marquee box covering 2 icons → assert both have `.selected`; simulate pointerdown+move on first → assert second moved by same delta.

#### Risk notes
- Don't double-bind pointer handlers (existing single-drag listener stays; new group-drag wraps it).

---

### Task E04: Files app — text viewer subapp for `.txt` / `.md`
**Parent:** PLAN-OS-V4 C5.2
**Size:** M
**Depends on:** E01
**Unblocks:** none
**Touches shared:** `js/apps/files.js`, `css/files-app.css`, `index.html` (script + css load)
**Exclusive files:** `js/apps/text-viewer.js` (NEW), `css/text-viewer.css` (NEW)
**Registry allocations:**
  - command name: none new (text viewer launches via Files app double-click only — no slash command)
**Port offset:** base
**Max LOC added:** 350

#### Goal
PLAN-OS-V4 C5.2 specified: double-click a `.txt` / `.md` file in Files app → opens a small mono-font scrollable viewer window. Currently double-click does nothing for non-`.app` files. Ship the viewer.

#### Prerequisites
- `js/fs.js` exposes file content (or simulated content via fixed map).
- `Window.open()` API in `js/window-manager.js` accepts options.

#### Changes (in execution order)

**Step 1: Build the text viewer module**
- File: `js/apps/text-viewer.js` (NEW)
- Change: export `TextViewer.open(path, content)` that creates a 480×360 native window with a `<pre>` block, scrollable, monospace, theme-token colors. Title bar shows the basename. Status bar shows `lines · chars`.
- Pattern: `js/apps/cv-viewer.js` for window scaffolding
- Why: reusable for any future text-content app

**Step 2: Wire double-click in Files app**
- File: `js/apps/files.js`
- Change: in the existing double-click handler, branch on extension. `.app` → existing `Window.open(project)`. `.txt` / `.md` → `TextViewer.open(path, FS.read(path))`. Other → no-op.
- Pattern: existing extension switch in `files.js`
- Why: scoped behavior change

**Step 3: Provide content for the FS files**
- File: `js/fs.js`
- Change: extend the FS tree to attach `content` strings to existing fake files (`/home/visitor/about.txt`, `/home/visitor/projects/README.md`, etc. — invent plausible content, ~10–30 lines each, using persona data to stay coherent).
- Pattern: existing FS tree shape
- Why: viewer needs something to show

**Step 4: Right-click in Files → "Open in viewer"**
- File: `js/apps/files.js`
- Change: extend file context menu to include "Open in viewer" for matching extensions.
- Pattern: existing context menu items
- Why: discoverability

**Step 5: Style + register loads**
- File: `css/text-viewer.css` (NEW), `index.html`
- Change: minimal CSS (mono, padding, scroll). Register in `index.html` head; register `text-viewer.js` in `index.html` body before `app-commands.js`.
- Pattern: existing app load order
- Why: canonical wiring

#### Edge cases
- File over ~10 KB: cap rendered length, show `...truncated...` footer (no real files reach this)
- Theme switch while viewer open: must respond to CSS var changes (auto-handled if using vars)
- `prefers-reduced-motion`: window open animation already gated

#### NOT in scope
- Editing (read-only viewer)
- Markdown rendering (raw text only — fits the terminal aesthetic)
- Syntax highlighting

#### Acceptance criteria
- [ ] Double-click `~/about.txt` in Files app → viewer window opens with content
- [ ] Window has correct title (basename) and status bar
- [ ] Right-click `.md` file → "Open in viewer" appears and works
- [ ] Closing viewer doesn't leak listeners (verify in test)
- [ ] Reduced-motion disables open animation but content still renders

#### Test plan
- New tests in `tests-v8.js` (FS tests file): assert FS read returns content; new tests in `tests-v7.js` (apps): mock Window.open, assert TextViewer registers a window of correct size and contains expected content.

#### Risk notes
- Don't break existing `.app` double-click.

---

### Task E05: Notification Center slide-out panel
**Parent:** PLAN-OS-V4 C3.2
**Size:** M
**Depends on:** E01
**Unblocks:** none
**Touches shared:** `js/notify.js`, `css/notify.css`, `js/taskbar.js` (bell icon click)
**Exclusive files:** none
**Registry allocations:**
  - z-layer: existing `Layer.NOTIFICATION = 6000`
**Port offset:** base
**Max LOC added:** 320

#### Goal
v3 added bell icon + log panel. v4 spec called for a proper right-edge slide-out 360×500 panel grouped Today / Earlier with Clear-All and Do-Not-Disturb toggle. Today's "log panel" is a basic dropdown. Replace with the spec.

#### Prerequisites
- `notify.push()` already feeds an internal log array.
- `Anim.slideIn` / `slideOut` available.

#### Changes (in execution order)

**Step 1: Build the panel DOM**
- File: `js/notify.js`
- Change: create `<div id="notification-center">` slide-out (right edge, 360×500, fixed). Sections: header ("Notifications" + DND toggle), Today list, Earlier collapsed group, footer ("Clear all").
- Pattern: launcher.js panel scaffold
- Why: spec says slide-out, not dropdown

**Step 2: Render entries from log**
- File: `js/notify.js`
- Change: each entry shows app icon (default ◉), title, body, relative time (`now`, `2m`, `1h`, `Yesterday 14:32`), and `✕` to dismiss individually. "Today" = last 24 h; "Earlier" = older.
- Pattern: existing `renderLog()` shape
- Why: parity with the spec

**Step 3: Bell icon click toggles the panel**
- File: `js/taskbar.js`
- Change: existing bell click → call `Notify.toggleCenter()`. Click outside closes.
- Pattern: existing tray-popouts.js outside-click pattern
- Why: single entry point

**Step 4: DND toggle**
- File: `js/notify.js`
- Change: when DND on, `notify.push()` skips the toast surface but still appends to the log; bell shows muted state (lower opacity).
- Pattern: existing settings toggle pattern in quick-settings.js
- Why: spec asked for it; useful self-mute during demos

**Step 5: Clear All**
- File: `js/notify.js`
- Change: clears the log array, re-renders (empty state copy from PLAN-OS-V4: "no notifications. your inbox is, for once, peaceful.").
- Pattern: standard
- Why: spec

**Step 6: CSS**
- File: `css/notify.css`
- Change: add `.notification-center` styles (slide-out animation via existing keyframes, theme tokens). Keep current toast styles intact.
- Pattern: existing notify.css conventions
- Why: visual

#### Edge cases
- DND state must persist (`Session.set('settings.dnd', true)`)
- Toggling DND should re-render bell muted state immediately
- Center open while a new notification arrives → entry appears at top of Today with subtle pulse

#### NOT in scope
- Per-app notification settings
- Action buttons in notification entries (existing `notify.push({ action })` already supported in toast — leave as-is)
- Notification grouping by app

#### Acceptance criteria
- [ ] Bell click slides panel in from right edge
- [ ] Entries grouped Today / Earlier; relative time labels
- [ ] DND toggle persists across reload
- [ ] DND active → toast surface skipped, log still recorded, bell muted
- [ ] Clear All empties the log and shows empty-state copy
- [ ] Click outside closes panel

#### Test plan
- New tests in `tests-v6.js`: push 3 notifications → open center → assert 3 in Today; toggle DND → push 1 → assert log length 4 but no toast on screen; Clear All → assert log empty.

#### Risk notes
- `Layer.NOTIFICATION` should cover both toasts (existing) and center panel — verify ordering vs taskbar (tasks should be below center when open, actually per Layer registry NOTIFICATION 6000 > TASKBAR 3000, so OK).

---

### Task E06: Cursor context audit
**Parent:** PLAN-OS-V4 C6.1
**Size:** S
**Depends on:** E01
**Unblocks:** none
**Touches shared:** `css/cursors.css`, `css/window-manager.css`, `css/desktop.css`, `css/terminal.css`, `css/apps.css`
**Exclusive files:** none
**Registry allocations:** none
**Port offset:** base
**Max LOC added:** 90 (mostly CSS)

#### Goal
v4 promised contextual cursors; only resize handles got them. Add: titlebar `move`, terminal pane `text`, drag-in-progress `grabbing`, disabled-button `not-allowed`, busy state `wait`. Pure CSS where possible, JS state class where necessary.

#### Prerequisites
- `css/cursors.css` exists.

#### Changes (in execution order)

**Step 1: Audit current cursor application**
- File: review pass; no edits yet
- Change: list every interactive element type and its current cursor (default vs explicit). Document inline in `cursors.css` as a comment block.
- Why: stops you from missing obvious gaps

**Step 2: Apply contextual cursors via CSS**
- File: `css/cursors.css`
- Change:
  - `.titlebar { cursor: move; }`
  - `.titlebar button { cursor: pointer; }`
  - `#terminal-output, .terminal-pane pre, .term { cursor: text; }`
  - `button:disabled, [aria-disabled="true"] { cursor: not-allowed; }`
  - `.icon { cursor: pointer; }`
  - `.icon.dragging, body.dragging { cursor: grabbing; }`
  - `body.busy { cursor: wait; }`
- Pattern: keep selectors specific; never `*`
- Why: scoped, low-risk

**Step 3: Toggle `body.dragging` during drags**
- File: `js/desktop.js` and `js/window-manager.js`
- Change: on pointerdown for drag, `document.body.classList.add('dragging')`; on pointerup, remove.
- Pattern: existing focus-class toggles
- Why: cursor follows the mode, not the element

**Step 4: Loading state for iframe windows**
- File: `js/game-overlay.js` (or window-manager iframe loading hook)
- Change: while iframe loads, add `.loading` class to window; CSS sets cursor `wait` on the iframe overlay.
- Pattern: existing loading-spinner overlay
- Why: real OSes change cursor during load

#### Edge cases
- Touch devices: cursor rules irrelevant; no harm
- Theme change: cursors are theme-agnostic; no work
- Reduced-motion: cursor changes are non-motion; no gating needed

#### NOT in scope
- Custom cursor images (system cursors are enough; saves loading + a11y issues)
- Cursor change on resize-handle hover via theme color (out of scope; covered partially in E07)

#### Acceptance criteria
- [ ] Hovering titlebar shows `move` cursor
- [ ] Hovering terminal output area shows `text` cursor
- [ ] Dragging an icon shows `grabbing` cursor body-wide for the drag's duration
- [ ] Disabled buttons show `not-allowed`
- [ ] Iframe-loading window shows `wait` cursor over the iframe area

#### Test plan
- Manual smoke pass (cursor changes are hard to assert in jsdom). Add a single check that `body.dragging` class is set during a simulated pointerdown+move sequence.

#### Risk notes
- Don't broaden a `*` rule; specific selectors only.

---

### Task E07: Resize handle hover affordance
**Parent:** v4-polish residual
**Size:** S
**Depends on:** E01
**Unblocks:** none
**Touches shared:** `css/window-manager.css`
**Exclusive files:** none
**Registry allocations:** none
**Port offset:** base
**Max LOC added:** 60

#### Goal
Resize handles work but are invisible until you find them. Add a 1 px theme-color highlight on hover so users see where to grab.

#### Prerequisites
- Resize handles exist as discrete DOM nodes per edge/corner in `window-manager.js`.

#### Changes (in execution order)

**Step 1: Add hover styles per resize handle**
- File: `css/window-manager.css`
- Change: per `.resize-n`, `.resize-s`, `.resize-e`, `.resize-w`, `.resize-ne`, `.resize-nw`, `.resize-se`, `.resize-sw`: on `:hover`, set `background: linear-gradient(to <axis>, transparent, var(--color-primary), transparent)` with low opacity (~0.18). Edges get a thin line; corners get a soft glow.
- Pattern: existing snap-preview style
- Why: cheap, visible, theme-driven

**Step 2: Active-state stronger highlight**
- File: `css/window-manager.css`
- Change: while resizing (window has `.resizing` class set by JS), the active handle stays highlighted at higher opacity (~0.35).
- Pattern: existing class hooks
- Why: feedback during drag

**Step 3: JS toggles `.resizing` on body**
- File: `js/window-manager.js` (small edit)
- Change: on resize-start, add `body.resizing` + active-handle direction class; remove on resize-end.
- Pattern: same as E06 dragging class
- Why: minimal JS for clearer CSS state

#### Edge cases
- Snap preview already uses primary color — verify no visual collision when hovering an edge while a snap preview is rendered (snap preview lives at higher z; should obscure)
- Touch: no hover; affordance not needed

#### NOT in scope
- Audio cue
- Cursor change (covered by E06)

#### Acceptance criteria
- [ ] Hovering each of 8 resize zones shows a visible highlight matching theme
- [ ] During an active resize drag, the highlight stays visible
- [ ] No regression on existing window drag/snap

#### Test plan
- Manual smoke pass.

#### Risk notes
- Resize handles can be very thin (~4 px); confirm hover area is large enough to actually trigger CSS (z-index above window content).

---

### Task E08: Taskbar thumbnail tooltip on hover
**Parent:** PLAN-OS-V4 C2.3
**Size:** S
**Depends on:** E01
**Unblocks:** none
**Touches shared:** `js/taskbar.js`, `css/taskbar.css`
**Exclusive files:** none
**Registry allocations:**
  - constant: `TASKBAR_THUMB_HOVER_DELAY_MS = 200` in COORDINATION §5
**Port offset:** base
**Max LOC added:** 130

#### Goal
Hovering a running-app entry in the taskbar today shows nothing. v4 spec called for a 200 ms delay → 160×100 colored card with window title + app icon. Live thumbnail is hard; use a static themed card. Keeps the "real OS" frame.

#### Prerequisites
- `js/taskbar.js` already renders running-app entries with window references.

#### Changes (in execution order)

**Step 1: Tooltip element + state**
- File: `js/taskbar.js`
- Change: single shared `<div class="taskbar-thumb">` appended to body at `Layer.POPOUTS - 1`. State: `hoveredEntryId`, `showTimer`.
- Pattern: launcher.js / tray-popouts.js singleton pattern
- Why: cheap, no per-entry node

**Step 2: Hover handlers**
- File: `js/taskbar.js`
- Change: on `mouseenter` taskbar entry → start `setTimeout(show, 200)`; on `mouseleave` → clear timer + hide. Show positions tooltip above the entry, content = window title + small colored block sized 160×100 with the app's icon glyph centered.
- Pattern: existing hover patterns elsewhere
- Why: matches spec

**Step 3: Style**
- File: `css/taskbar.css`
- Change: `.taskbar-thumb` has theme background, primary border, soft shadow, 6 px radius, 160×100 px.
- Pattern: existing taskbar.css conventions
- Why: visual

**Step 4: Honor reduced motion + touch**
- File: `js/taskbar.js`
- Change: if `Anim.reduced()` → tooltip appears instantly on hover (no delay). Touch (`pointertype === 'touch'`) → never show (no hover concept).
- Pattern: standard guards
- Why: a11y

#### Edge cases
- Entry hidden while tooltip is shown (window closed) → tooltip auto-hides
- Window title changes while tooltip is shown → tooltip text auto-updates (or just re-fetch on each show)

#### NOT in scope
- Live thumbnail capture (real screenshot is overkill)
- Right-click menu on entries (separate task)

#### Acceptance criteria
- [ ] Hover taskbar entry for ≥200 ms → tooltip shows
- [ ] Move away → tooltip hides
- [ ] Touch / reduced-motion behavior matches above
- [ ] Tooltip positioned above entry, doesn't clip viewport edge

#### Test plan
- New test in `tests-v4.js`: simulate hover, advance timers ≥200 ms, assert tooltip in DOM with correct title.

#### Risk notes
- Watch tooltip vs taskbar z-index: tooltip should appear above tray popouts when hover-source is a taskbar entry (use Layer.POPOUTS).

---

### Task E09: BSOD easter egg — `/bsod` + 1-in-1000 boot panic chance
**Parent:** v4-completeness (claims `Layer.BSOD = 9500`)
**Size:** S
**Depends on:** E01
**Unblocks:** none
**Touches shared:** `js/main.js` (boot hook), `js/easter-eggs.js` (registers `/bsod`)
**Exclusive files:** `js/bsod.js` (NEW), `css/bsod.css` (NEW)
**Registry allocations:**
  - command: `/bsod` (in COORDINATION §3, hidden)
  - constant: `BSOD_BOOT_CHANCE = 0.001` (COORDINATION §5)
  - storage: `bsodSeen: boolean` (COORDINATION §4)
  - layer: existing `Layer.BSOD = 9500`
**Port offset:** base
**Max LOC added:** 220

#### Goal
The `BSOD` z-layer was reserved in v4 but never used. Ship a Windows-9x-style blue screen as both a manual easter egg (`/bsod`) and a 0.1% chance during cold boot (gated by `bsodSeen` so it only ever happens once per visitor). Auto-recovers after 4 s with subtle "press any key" hint.

#### Prerequisites
- `Layer.BSOD` exists (`js/desktop-layer.js`).
- `Session.set/get` available.

#### Changes (in execution order)

**Step 1: Build BSOD module**
- File: `js/bsod.js` (NEW)
- Change: export `BSOD.show({ trigger: 'manual' | 'panic' })` that creates a full-viewport overlay at `var(--layer-bsod)`. Content: classic BSOD layout — `:( A problem has occurred.` heading, fake stop code (`STOP: 0x000000DA  COFFEE_DEPLETION_DETECTED`), faux memory dump scroll (8 lines of `0xDEADBEEF`-style hex), QR code-shaped ASCII block in the corner. Subtle bottom hint `press any key — this is the recovery service`.
- Pattern: matrix.js full-viewport overlay; lock-screen.js for Esc handling
- Why: encapsulation

**Step 2: Auto-dismiss + manual key dismissal**
- File: `js/bsod.js`
- Change: any keydown / pointerdown after a 250 ms grace dismisses with a 200 ms fade. Hard auto-dismiss at 4000 ms regardless. On dismiss → fade out → re-show desktop. Persist `Session.set('bsodSeen', true)` on first show.
- Pattern: standard overlay dismissal
- Why: never trap a recruiter

**Step 3: Register `/bsod` command**
- File: `js/easter-eggs.js`
- Change: append `registerCommand('/bsod', '', () => BSOD.show({ trigger: 'manual' }), true);`
- Pattern: existing easter-egg registrations
- Why: deterministic test path

**Step 4: 0.1% boot panic hook**
- File: `js/main.js`
- Change: at the end of the boot sequence (after desktop fades in), if `!Session.get('bsodSeen') && Math.random() < 0.001 && !Anim.reduced()`, schedule `BSOD.show({ trigger: 'panic' })` 600 ms later.
- Pattern: existing main.js init flow
- Why: surprise factor

**Step 5: CSS**
- File: `css/bsod.css` (NEW)
- Change: classic BSOD blue (`#0023a8`), white monospace, large heading, dim hint. Tiny `Anim.glitch` flash before the BSOD frame settles (200 ms RGB-split via CSS keyframes).
- Pattern: existing notify.css scaffold for full-viewport
- Why: visual

**Step 6: Register loads**
- File: `index.html`
- Change: add `<link rel="stylesheet" href="css/bsod.css">` and `<script src="js/bsod.js"></script>` (after `desktop-layer.js`, before `easter-eggs.js`).
- Pattern: existing load order
- Why: canonical wiring

#### Edge cases
- Reduced motion: skip the glitch keyframe; BSOD appears instantly, dismisses instantly on any input
- Lock screen visible when `/bsod` typed → BSOD layer (9500) still wins (above lock 9000)
- Multiple `/bsod` calls in a row: ignore if already shown (`if (BSOD.visible) return`)

#### NOT in scope
- Real reboot animation after BSOD (just dismisses to current state)
- Different BSOD per theme (blue is the joke)

#### Acceptance criteria
- [ ] `/bsod` command shows BSOD overlay
- [ ] Auto-dismisses at 4 s
- [ ] Dismisses on any key/click after 250 ms grace
- [ ] First show sets `bsodSeen` in Session
- [ ] Boot-time random show works (force test via mocking `Math.random`)
- [ ] Reduced motion: instant in, instant out, no glitch

#### Test plan
- New tests in a new `tests-v9.js` (or extend `tests-v3.js` easter-egg section): execute `/bsod` → assert overlay element with `.bsod` class appears at z = layer-bsod; advance time 4001 ms → assert removed; mock `Math.random` returns 0.0005, simulate boot end → assert overlay scheduled.

#### Risk notes
- One-time gate critical. If `bsodSeen` ever gets cleared (Session reset), it can re-fire — that's fine.
- Don't show BSOD inside game iframes (z-layer covers everything; OK).

---

### Task E10: GRUB bootloader stub
**Parent:** PLAN-OS-V4 C7.2
**Size:** S
**Depends on:** E01
**Unblocks:** E11
**Touches shared:** `js/boot.js`, `css/boot.css`
**Exclusive files:** none (new content lives inside boot.js)
**Registry allocations:**
  - animation primitive: `Anim.typewriter(el, text, { dur })` added to `js/anim.js` (COORDINATION §6)
**Port offset:** base
**Max LOC added:** 200

#### Goal
v4 spec (C7.2): 250 ms screen between POST and systemd showing a fake GRUB menu. First option auto-selected, countdown `3...2...1...` then proceed. Adds period charm + sets up the BIOS SETUP follow-on (E11).

#### Prerequisites
- `boot.js` already streams POST → systemd. Insert GRUB between.

#### Changes (in execution order)

**Step 1: GRUB frame DOM**
- File: `js/boot.js`
- Change: between POST end and systemd start, render a `<div class="grub">`:
  ```
  GRUB version 2.06

   *DavOS 1.0 (default)
    DavOS 1.0 (recovery mode)
    Memtest86+

  Use ↑/↓ keys. Default: 3
  ```
- Pattern: existing POST line streaming
- Why: matches spec verbatim

**Step 2: Countdown 3 → 2 → 1**
- File: `js/boot.js`
- Change: every 250 ms tick the "Default: N" line down. At 0, swap to systemd phase.
- Pattern: existing setInterval boot timing
- Why: spec says ~750 ms total

**Step 3: Skippable on Enter / any key**
- File: `js/boot.js`
- Change: keydown during GRUB → instant proceed to systemd.
- Pattern: existing POST skip
- Why: don't punish returning visitors

**Step 4: Reduced motion → skip entirely**
- File: `js/boot.js`
- Change: `if (Anim.reduced()) skip GRUB phase`.
- Pattern: standard
- Why: a11y

**Step 5: Add `Anim.typewriter` primitive**
- File: `js/anim.js`
- Change: `typewriter(el, text, { dur=600 })` reveals text char-by-char; returns Promise. Used by GRUB countdown digit refresh and by E11 BIOS lines.
- Pattern: existing Anim helper signature
- Why: shared primitive justifies single source

#### Edge cases
- Recovery / Memtest options highlighted but not selectable in v1 (E16 may extend); pressing ↑/↓ shifts highlight cosmetically only
- POST already skipped (key pressed during POST) → GRUB also skips immediately
- Visit count > 0: full GRUB still runs but skipped after 250 ms instead of 750 (returning-visitor accelerator)

#### NOT in scope
- Recovery mode actually doing anything (E16 chains it as an easter egg later, optional)
- Memtest86+ animation

#### Acceptance criteria
- [ ] GRUB frame visible after POST, before systemd
- [ ] Countdown ticks 3→2→1 over ≤750 ms
- [ ] Any key skips
- [ ] Reduced motion bypasses entirely
- [ ] Total boot sequence ≤2.5 s on cold cache (within v4 acceptance)

#### Test plan
- New test in `tests-os.js`: simulate boot with reduced-motion off, advance timers, assert GRUB element exists during the expected 750 ms window then is replaced by systemd.

#### Risk notes
- Don't break existing skip handler; add the GRUB skip to the same listener stack.

---

### Task E11: BIOS SETUP fake menu (DEL during POST)
**Parent:** PLAN-OS-V4 C7.1 ("Press DEL to enter SETUP — this does nothing.")
**Size:** S
**Depends on:** E10 (uses `Anim.typewriter` added there; both edit `boot.js`)
**Unblocks:** none
**Touches shared:** `js/boot.js`, `css/boot.css`
**Exclusive files:** none
**Registry allocations:**
  - keyboard shortcut: `DEL` reserved during POST (COORDINATION §2)
**Port offset:** base
**Max LOC added:** 230

#### Goal
v4 BIOS POST text invites `Press DEL to enter SETUP — this does nothing.` Make it do something: open a fake AMI/Phoenix BIOS UI with `Main / Advanced / Boot / Exit` tabs and 4-5 plausible-looking entries per tab. ESC exits back to boot. Pure decoration — nothing changes — but reads as "real BIOS."

#### Prerequisites
- E10 shipped (Anim.typewriter available, boot.js GRUB hook in place).

#### Changes (in execution order)

**Step 1: BIOS SETUP DOM**
- File: `js/boot.js`
- Change: function `enterBIOS()` builds the SETUP overlay — blue background, gray header bar with tabs, two-column body. Default tab = Main. Tabs cycle with `←/→`, items cycle with `↑/↓`, `+/-` change values (cosmetic), Enter on a sub-menu opens nested view, ESC exits.
- Pattern: full-viewport overlay similar to bsod.js (E09)
- Why: feels like the real thing

**Step 2: Content per tab**
- Main: `System Time`, `System Date`, `BIOS Version: DavOS BIOS v1.0`, `Memory: 262144K`, `Coffee Level: Critical`
- Advanced: `CPU Configuration ▸`, `SATA Configuration ▸`, `USB Configuration ▸`, `Snark Mode: [Enabled]`, `Daylight Saving: [Whatever]`
- Boot: list with `1. DavOS HDD`, `2. USB`, `3. Network`, `4. Coffee Maker`. Reorder with `+/-` (cosmetic).
- Exit: `Save Changes and Exit`, `Discard Changes and Exit`, `Restore Defaults`. Any of them returns to GRUB.
- File: `js/boot.js`
- Pattern: array-of-rows render
- Why: depth without code

**Step 3: DEL hotkey during POST**
- File: `js/boot.js`
- Change: keydown `Delete` while POST overlay visible → cancel POST timers, call `enterBIOS()`. ESC out of BIOS resumes POST from where it left off (or skips to GRUB).
- Pattern: same skip-listener stack as E10 / existing POST skip
- Why: spec verbatim

**Step 4: Reduced motion → swallow DEL (skip BIOS entirely)**
- File: `js/boot.js`
- Change: if `Anim.reduced()`, ignore DEL during POST (boot to desktop fast).
- Pattern: standard
- Why: a11y

**Step 5: Style**
- File: `css/boot.css`
- Change: `.bios-setup` styles — DOS-blue (#000080) bg, light-gray panel, monospace, white-on-blue selection bar, small footer help line `↑↓ Select  Enter Confirm  ESC Exit`.
- Pattern: bsod.css palette (E09) for shared blue-OS-error vibe (different shade)
- Why: visual

**Step 6: Test hooks**
- File: `js/boot.js`
- Change: expose `BootDebug.openBIOS()` for tests (no-op in production unless `window.__test__` flag).
- Pattern: existing test hooks
- Why: deterministic

#### Edge cases
- DEL during GRUB (post-POST): ignore — outside the POST window
- ESC inside a nested submenu → back one level; second ESC exits
- Mobile: no DEL; no BIOS — fine, hidden by design

#### NOT in scope
- Persisting any "BIOS settings" (purely cosmetic, no Session writes)
- Beep on save (no audio in v4)

#### Acceptance criteria
- [ ] DEL during POST opens BIOS SETUP
- [ ] All 4 tabs render correct entries
- [ ] Arrow keys navigate, +/- modify values cosmetically
- [ ] ESC from any view eventually exits to GRUB / boot continuation
- [ ] Reduced motion: DEL is no-op during POST

#### Test plan
- New tests in `tests-os.js`: trigger BootDebug.openBIOS, simulate Right arrow, assert active tab moves; press ESC, assert overlay removed.

#### Risk notes
- Make sure DEL listener is detached as soon as POST window closes — don't leave a global DEL handler running for the rest of the session.

---

### Task E12: Batch — 9 new easter-egg commands
**Parent:** portfolio-personality
**Size:** S
**Depends on:** E01
**Unblocks:** none
**Touches shared:** `js/easter-eggs.js` (additive)
**Exclusive files:** none
**Registry allocations:**
  - commands (all hidden, COORDINATION §3): `/clippy`, `/uname`, `/yes`, `/figlet`, `/coffee`, `/eject`, `/su`, `dave` (bare), `/sudo make me a sandwich` (multi-arg variant)
**Port offset:** base
**Max LOC added:** 280

#### Goal
Easter eggs are the cheapest personality-per-LOC ratio in the codebase. Add nine more. Each is small, self-contained, hidden, and respects the "smart caveman" voice — short, dry, technical.

#### Prerequisites
- `js/easter-eggs.js` registration pattern established.
- `Terminal.output()` / `Terminal.outputHTML()` available.

#### Changes (in execution order)

**Step 1: Trivial response commands**
- File: `js/easter-eggs.js`
- Change:
  - `/uname` → `DavOS 1.0.0-portfolio #1 SMP $(date) x86_64 GNU/Linux-flavored`
  - `/su` → `su: authentication failure (visitor doesn't even have su).`
  - `/eject` → `notify.push({ title: 'CD tray', body: 'tray ejected. there is no tray.' });` + terminal line `device ejected.`
  - `/coffee` → 4-line typewriter animation: `brewing.`, `brewing..`, `brewing...`, `coffee ready.` over 1.6 s (reuse `Anim.typewriter`)
- Pattern: existing one-liners in easter-eggs.js
- Why: zero-risk additions

**Step 2: `dave` bare-name greeting**
- File: `js/easter-eggs.js`
- Change: `registerCommand('dave', '', t => t.output("hey, that's me. type /about for the long version."), true)`
- Pattern: existing `hello`/`hi` pattern
- Why: people will type the name

**Step 3: `/sudo make me a sandwich` (xkcd 149 callback)**
- File: `js/easter-eggs.js`
- Change: needs a multi-arg dispatch. The current registry is exact-match. Add a tiny prefix-match layer: `registerCommandPrefix('/sudo ', handler)` that matches `/sudo <anything>` and inspects the suffix. For `/sudo make me a sandwich` → `okay.` (the joke). For other `/sudo <x>` → existing `/sudo` denial.
- Pattern: extends `js/commands.js:executeCommand` to consult prefix registry after exact-match miss
- Why: the joke requires the arg

**Step 4: `/clippy`**
- File: `js/easter-eggs.js`
- Change: spawns a small floating ASCII-art Clippy in the bottom-right corner (`.clippy` div, fixed position, `Layer.NOTIFICATION + 1`) with speech bubble: `"It looks like you're writing a portfolio. Need help?"` + buttons `[ Yes ]  [ No, leave me alone ]`. Either button dismisses with shake animation.
- Pattern: notify toast scaffolding
- Why: instant nostalgia hit

**Step 5: `/figlet <text>`**
- File: `js/easter-eggs.js`
- Change: render `<text>` as ASCII banner using a tiny built-in font (5 chars wide ASCII block letters, A–Z + 0–9 + space). Limit input to 12 chars to avoid wreckage. Implement font as a JS object literal (~1.5 KB).
- Pattern: existing inline ASCII art in `welcome` banner
- Why: very expected on a terminal portfolio

**Step 6: `/yes`**
- File: `js/easter-eggs.js`
- Change: streams `y` lines into terminal output at 50 ms intervals, capped at 60 lines or 3 s. Esc / any key / Ctrl+C aborts.
- Pattern: existing async cmd pattern
- Why: classic Unix toy

**Step 7: Update `/credits` count**
- File: `js/easter-eggs.js`
- Change: existing `/credits` lists "easter eggs: N". Bump to reflect new total (search-replace the digit).
- Pattern: trivial
- Why: keep credits truthful

#### Edge cases
- `/yes` while terminal has scroll-locked output → still appends, scrolls
- `/clippy` already on screen + retyped → noop (idempotent show)
- `/figlet` empty arg → `usage: /figlet <text>`

#### NOT in scope
- Sound for `/eject` (no audio)
- Animated Clippy eyes (he just sits there)
- Real `/sudo` with password prompt

#### Acceptance criteria
- [ ] All 9 commands callable; each produces the spec'd output
- [ ] `/sudo make me a sandwich` returns `okay.` exactly; other `/sudo <x>` falls through to denial
- [ ] `/yes` aborts on any key
- [ ] `/clippy` dismissable via either button
- [ ] `/figlet hi` renders block letters; `/figlet <12-char>` works; `>12` truncates with hint

#### Test plan
- Extend `tests/tests.js` easter-egg section: one test per command asserting expected output line OR DOM mutation.

#### Risk notes
- Prefix-match registry change in step 3 must not regress exact-match lookups (test order: exact first, prefix fallback).

---

### Task E13: `/htop` interactive kill simulation
**Parent:** portfolio-personality
**Size:** S
**Depends on:** E01
**Unblocks:** none
**Touches shared:** `js/os-commands.js` (htop handler)
**Exclusive files:** none
**Registry allocations:** none
**Port offset:** base
**Max LOC added:** 200

#### Goal
Current `/htop` outputs a static fake process table. Make it interactive: arrow keys move highlight; `k` + Enter prompts `Kill process N? [y/N]`. Killed processes vanish with a brief shake. Auto-respawn fake processes every few seconds for endless fun. Esc exits.

#### Prerequisites
- `js/os-commands.js` `/htop` handler is the entry point.

#### Changes (in execution order)

**Step 1: Restructure htop into interactive overlay**
- File: `js/os-commands.js`
- Change: `/htop` now opens a full-terminal overlay (or replaces output area) with table-shaped DOM (`<div class="htop">`). Moves out of inline `terminal.output`. Captures key events while open.
- Pattern: matrix.js full-takeover pattern
- Why: needed for interactivity

**Step 2: Interactive controls**
- File: `js/os-commands.js`
- Change: ↑/↓ moves cyan highlight row; `k` prompts at footer `Kill process [N]? (y/N)`; `y` removes the row + appends a "killed" toast via Notify; `Esc` closes overlay.
- Pattern: keyboard navigation similar to launcher.js
- Why: matches real htop muscle memory

**Step 3: Process respawn ticker**
- File: `js/os-commands.js`
- Change: every 4 s, append a new fake process to the bottom (random from a pool: `coffee.js`, `npm-install`, `vim --no-exit`, `git rebase --interactive`, `jest watching`, `node --inspect`, `ssh recruiter@dreams`, `tail -f /dev/regret`). Cap visible at 12.
- Pattern: setInterval cleared on close
- Why: ensures the joke continues

**Step 4: Reduced motion**
- File: `js/os-commands.js`
- Change: skip the kill-shake animation; instant remove.
- Pattern: standard
- Why: a11y

#### Edge cases
- Closing terminal pane while htop open → htop also closes (cleanup)
- Theme switch while open → palette updates via CSS vars (auto)
- All processes killed → footer copy: `nothing left to kill. press esc.`

#### NOT in scope
- Real CPU/MEM numbers (random columns are fine)
- Sorting columns (overkill)

#### Acceptance criteria
- [ ] `/htop` opens interactive overlay with ≥6 fake processes
- [ ] Arrow keys move highlight
- [ ] `k` + `y` removes a process; `n` cancels
- [ ] New processes appear over time
- [ ] Esc cleanly exits, restores terminal input
- [ ] No leaked timers after exit (verify in test)

#### Test plan
- Test in `tests-v3.js`: open htop, simulate Down + k + y, assert process count decreased; advance time 4 s, assert process count increased.

#### Risk notes
- Interval cleanup is the bug-prone part — store handle, clear on every exit path.

---

### Task E14: `/snake` canvas game
**Parent:** portfolio-personality
**Size:** M
**Depends on:** E01
**Unblocks:** none
**Touches shared:** `js/easter-eggs.js` (registers `/snake`)
**Exclusive files:** `js/snake.js` (NEW), `css/snake.css` (NEW)
**Registry allocations:**
  - command: `/snake` (hidden, COORDINATION §3)
**Port offset:** base
**Max LOC added:** 450

#### Goal
A tiny playable Snake on the terminal pane. Keeps visitors longer, demos that the portfolio author writes real games (already true via the project list, but reinforces in-place). Theme-colored (snake is `--color-primary`, food is `--color-accent`). Esc to quit. Score persists in Session.

#### Prerequisites
- Terminal pane has a known DOM container (already used by matrix.js).

#### Changes (in execution order)

**Step 1: Build the game module**
- File: `js/snake.js` (NEW)
- Change: `Snake.start(terminalPane)` opens a `<canvas>` overlay sized to fit, 24×16 grid. Game loop at 8 fps (rAF + accumulator). Snake state: array of cells. Food: random empty cell. Eat → grow + score++.
- Pattern: existing matrix.js animation harness (canvas + rAF cleanup)
- Why: clean encapsulation

**Step 2: Input**
- File: `js/snake.js`
- Change: arrow keys + WASD turn. Esc quits. P pauses. R restarts after death.
- Pattern: standard game input
- Why: muscle memory

**Step 3: Rendering**
- File: `js/snake.js`
- Change: fill cells with theme colors. Score display top-right, "best: N" too. Game-over overlay: `you ate yourself. press R to restart, ESC to exit.`
- Pattern: minimal canvas rendering
- Why: visual

**Step 4: Persistence**
- File: `js/snake.js`
- Change: `Session.set('snakeBest', max(best, score))` on game over.
- Pattern: existing Session.set callsites
- Why: highscore stickiness

**Step 5: Register command**
- File: `js/easter-eggs.js`
- Change: append `registerCommand('/snake', '', () => Snake.start(document.getElementById('terminal-pane')), true);`
- Pattern: existing
- Why: launcher

**Step 6: CSS + load order**
- File: `css/snake.css` (NEW), `index.html`
- Change: minimal canvas overlay style. Add to head + script after matrix.js.
- Pattern: existing load order
- Why: canonical wiring

**Step 7: Reduced motion fallback**
- File: `js/snake.js`
- Change: if `Anim.reduced()`, render static `snake.exe — animations off. type /snake again to play (motion required).` with no game.
- Pattern: standard
- Why: a11y

#### Edge cases
- Window resize while playing → canvas re-sizes on next tick
- Theme switch while playing → grid re-renders next tick (uses CSS vars)
- Two `/snake` calls → second is a no-op (already running)

#### NOT in scope
- Multiplayer
- Difficulty levels
- Sound

#### Acceptance criteria
- [ ] `/snake` opens canvas, starts game
- [ ] Arrow keys / WASD turn the snake
- [ ] Eating food increases length and score
- [ ] Self-collision ends game with overlay
- [ ] R restarts, Esc exits and cleans up rAF + listeners
- [ ] Best score persists across reload
- [ ] Reduced motion shows static fallback

#### Test plan
- Unit tests in `tests-v3.js` (or new file): start snake with seeded RNG, simulate N ticks of arrow input, assert snake position + score.
- Cleanup test: start, exit, assert no `requestAnimationFrame` callbacks pending and no document-level keydown listeners remain.

#### Risk notes
- rAF cleanup is the most common bug; use a single boolean `isRunning` checked at the top of every frame.
- Don't hijack arrow keys outside the game (only listen while `isRunning`).

---

### Task E15: Pong desktop widget — hidden 4th in Add Widget
**Parent:** PLAN-OS-V4 C4.2 ("hidden 4th: ASCII Pong, easter egg, runs in the widget")
**Size:** M
**Depends on:** E01
**Unblocks:** none
**Touches shared:** `js/widgets.js`
**Exclusive files:** `js/widget-pong.js` (NEW)
**Registry allocations:**
  - widget type: `pong` registered with `Widgets.register('pong', WidgetPong)`
**Port offset:** base
**Max LOC added:** 380

#### Goal
The right-click wallpaper → "Add widget ▸" menu currently lists Clock / Sysinfo / Quote. Add a hidden 4th, Pong, only visible after typing the Konami code (or after `/pong` is run). Pong runs as a draggable 200×130 widget on the desktop with two AI paddles continuously playing themselves. Clicking it gives YOU control of the right paddle until you mouse away.

#### Prerequisites
- `js/widgets.js` exposes `Widgets.register(name, factory)` and `Widgets.add(name)`.

#### Changes (in execution order)

**Step 1: Build widget module**
- File: `js/widget-pong.js` (NEW)
- Change: factory returns DOM element + tick fn. Tick at 30 fps (rAF). Two paddles, ball, ASCII-grid render via `<pre>` element with monospace and theme colors. Paddles AI tracks ball with small lag for "fairness."
- Pattern: existing widget factories in `js/widgets.js`
- Why: matches widget contract

**Step 2: Register widget**
- File: `js/widgets.js`
- Change: `Widgets.register('pong', WidgetPong)`. Hidden in Add-Widget menu by default; visible after `Session.get('pongUnlocked')` is true.
- Pattern: existing register pattern
- Why: gates the easter egg

**Step 3: Unlock via Konami or `/pong`**
- File: `js/konami.js` + `js/easter-eggs.js`
- Change: Konami completion → `Session.set('pongUnlocked', true)` and a `notify.push({ title: 'Easter egg', body: 'Pong widget unlocked. Right-click desktop → Add widget ▸ Pong.' })`. Also register `/pong` command that adds the widget directly + sets unlock flag.
- Pattern: existing konami.js side-effect
- Why: discoverability paths

**Step 4: Mouse-takeover for right paddle**
- File: `js/widget-pong.js`
- Change: while pointer hovers widget, right paddle follows pointer Y. On pointerleave, AI resumes.
- Pattern: standard pointermove
- Why: gives the user a brief "wait this works" moment

**Step 5: Reduced motion**
- File: `js/widget-pong.js`
- Change: if `Anim.reduced()`, render a static frame (paddles + ball mid-screen) with caption `Pong (paused — motion off)`.
- Pattern: standard
- Why: a11y

#### Edge cases
- Widget removed from desktop while running → cancel rAF in factory's `destroy()` hook
- Multiple Pong widgets simultaneously → allowed (each instance own state); spec doesn't forbid
- Theme switch → next render uses new CSS vars (auto)

#### NOT in scope
- Real two-player networked Pong (lol)
- Score persistence (it's just background ambiance)

#### Acceptance criteria
- [ ] After Konami or `/pong`, "Pong" appears in Add Widget submenu
- [ ] Adding Pong renders a draggable 200×130 widget with self-playing animation
- [ ] Hovering takes over right paddle; mouseleave returns control to AI
- [ ] Removing widget cleans up rAF
- [ ] Reduced motion: static frame, no animation

#### Test plan
- New tests in extended `tests-v3.js` widget section: konami → assert `pongUnlocked` true; `Widgets.add('pong')` → assert widget DOM with `<pre>`; advance N frames → assert ball position changed; trigger remove → assert no pending rAF.

#### Risk notes
- Konami currently one-shot per session — that's fine for unlocking once. The Session.set persists across reloads, so the "unlocked" state is sticky.

---

### Task E16: Konami repeat handling + secondary chains
**Parent:** portfolio-personality
**Size:** XS
**Depends on:** E01 (and E15 for Pong unlock cross-ref, but soft)
**Unblocks:** none
**Touches shared:** `js/konami.js`
**Exclusive files:** none
**Registry allocations:** none
**Port offset:** base
**Max LOC added:** 70

#### Goal
Konami code currently triggers once per session and sets a flag preventing re-trigger. Make the second Konami acknowledge ("we did this already"), the third unlock a chain to GRUB recovery mode (E10/E11 — typing `recovery` while a tiny GRUB-style prompt appears in the terminal hints at advanced mode). Lightweight, hidden, rewards persistence.

#### Prerequisites
- `js/konami.js` exists.
- If E15 shipped, `pongUnlocked` is set on first Konami already.

#### Changes (in execution order)

**Step 1: Drop one-shot guard**
- File: `js/konami.js`
- Change: replace `if (konamiTriggered) return;` with a counter. Different responses per count.
- Pattern: simple state variable
- Why: enables chain

**Step 2: Per-count behavior**
- File: `js/konami.js`
- Change:
  - Count 1: existing color invert + `+30 lives` + (if E15) Pong unlock notification
  - Count 2: subtle CRT flicker animation (200 ms) + terminal line `we already did this. you're persistent.`
  - Count 3: notification `easter egg, level 3 unlocked. type 'recovery' in terminal.`. Register a one-time `recovery` (no slash) command that prints a hand-rolled mini-GRUB recovery shell ASCII: `(recovery) root@dave:#` — accepts `help`, `whoami`, `exit`. Scripted, not interactive shell. After `exit` or 30 s, command unregisters.
- Pattern: existing konami side-effect + transient command registration
- Why: layered easter eggs reward exploration

#### Edge cases
- `recovery` typed without prior count-3 trigger → falls through to "command not found"
- Reload mid-chain: counter resets per session (fine — this is per-visit fun, not persistent achievement)

#### NOT in scope
- Persisting Konami count across reloads
- Animations beyond the flicker

#### Acceptance criteria
- [ ] First Konami: original behavior unchanged
- [ ] Second Konami: flicker + dry message
- [ ] Third Konami: notification + transient `recovery` command works
- [ ] `recovery` without trigger: standard "not found"
- [ ] After `exit` or 30 s, `recovery` no longer recognized

#### Test plan
- Extend `tests-v3.js` konami test: trigger 3x, assert each side effect; assert `recovery` registered then auto-unregistered.

#### Risk notes
- `recovery` is a non-`/`-prefixed command — verify the registry handles both (it does, per existing `hello` / `hi` / `42` / `dave`).

---

## Cross-Cutting Concerns

### New patterns introduced
1. **Prefix-match command dispatch** (E12 step 3) — `executeCommand` first tries exact match, then iterates a prefix registry. This becomes the canonical way to do `/sudo <x>`-style commands. Document in `commands.js` next to `registerCommand`.
2. **Interactive overlay widget** (E13 htop, E14 snake, E15 pong, E11 BIOS) — full-takeover or canvas overlay with own input handling and lifecycle (`open` / tick / `close`). Snake's pattern is the cleanest reference.
3. **`Anim.typewriter`** primitive (E10 / E11 / E12-coffee) — char-by-char reveal. Lives in `js/anim.js`; reused by anything text-typing.
4. **`Anim.glitch`** primitive (E09 BSOD) — RGB-split / scanline jitter for 200 ms. Lives in `js/anim.js`.

### Migration notes
- `js/boot.js` is touched by E10 then E11 in serial. Sequence:
  1. E10 lands GRUB hook + `Anim.typewriter`.
  2. E11 lands BIOS SETUP using the boot.js skip-listener stack and Anim.typewriter that E10 introduced.
- `js/konami.js`: E16 replaces the one-shot guard. If E15 ships first, the unlock notification call goes inside the count-1 branch.
- All new commands (E09, E12, E14) bump the easter-egg count in `/credits` (E12 step 7 already does this for the batch — repeat in E09 / E14 commits).

### Registry updates (applied to COORDINATION.md)
Already applied in the bootstrap step:
- §1: BSOD layer marked reserved → owned by E09 on landing
- §2: DEL during POST reserved → owned by E11
- §3: 10 new command names reserved
- §4: `bsodSeen` storage key reserved
- §5: `BSOD_BOOT_CHANCE`, `TASKBAR_THUMB_HOVER_DELAY_MS` constants reserved
- §6: `Anim.glitch`, `Anim.typewriter` primitives reserved

When a task ships, the corresponding row's "reserved" annotation is removed.

---

## Architecture Model (snapshot)

### Boot sequence (ownership)
- `js/boot.js`: orchestrates POST (~800 ms) → systemd (~800 ms) → desktop entrance (≤800 ms)
- `js/login-screen.js`: gated on `Session.visitCount === 0`; inserted between systemd end and desktop entrance
- `js/main.js`: top-level `DOMContentLoaded` wiring; instantiates Terminal, runs boot, attaches all listeners

### Window lifecycle
- `js/window-manager.js` (~1000 LOC): `open(opts)` returns window handle; `close`, `minimize`, `maximize`, `restore` each animate via `Anim.*` then mutate state
- Z-stack: increments per focus; bounded within `Layer.WINDOWS` range (1000–1999)
- Persistence: `Session.set('windows', state)` on each lifecycle event

### Command dispatch (commands.js)
```
executeCommand(rawInput, terminal)
  → trim + lowercase
  → exact match commandRegistry[input]?  → run handler
  → (post-E12) prefix match in commandPrefixRegistry?  → run handler with rest
  → fallthrough → "command not found"
```

### Layer registry (desktop-layer.js)
Single source of truth for z-index. CSS reads via `var(--layer-<name>)`. JS reads via `Layer.<NAME>`. New surfaces register here, never with literal z-index.

### Animation primitives (anim.js)
All Promise-returning, all check `Anim.reduced()`. Adding a primitive: add to `Anim` object + COORDINATION §6.

### Test harness (test-harness.js + run-tests.js)
- jsdom 1280×800
- `prefers-reduced-motion: true` (forces synchronous boot)
- `window.fetch` disabled (forces JSON fallbacks)
- 591 tests across 9 `tests-*.js` files
- E01 closes the gap of 12 untested production scripts

### File ownership conventions (per COORDINATION §7)
- `js/easter-eggs.js`: append-only — multiple plans can add commands but never reorder existing
- `js/boot.js`: serialize edits across plans
- `js/widgets.js`: extend via new `widget-*.js` modules, don't bloat the orchestrator
- `js/desktop-layer.js`: append-only

---

## Change Log
- 2026-04-29 — created. 16 tasks E01–E16, dep graph, cross-cutting concerns, Architecture Model snapshot. COORDINATION.md and GAPS.md bootstrapped in same operation.
