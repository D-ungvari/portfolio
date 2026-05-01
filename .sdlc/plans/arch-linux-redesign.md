---
kind: plan
scope: Re-skin DavOS (Mac/macOS metaphor) to Arch Linux developer aesthetic — tiling WM, polybar status bar, neofetch about, dotfile palette, workspace switcher
created: 2026-05-01
updated: 2026-05-01
status: ACTIVE
advances:
  - phase-3: dotfile-palette
  - phase-3: brand-cyan
  - phase-3: typography
  - phase-3: polybar-bar
  - phase-3: i3-chrome
  - phase-3: workspace-switcher
  - phase-3: opt-in-tiling
  - phase-3: dock-removed
  - phase-3: neofetch-about
  - phase-3: powerline-prompt
  - phase-3: vim-mode-indicator
  - phase-3: cultural-commands
  - phase-3: path-as-URL
  - phase-3: boot-arch-authentic
  - phase-3: source-shibboleth
  - phase-3: tests-green
  - phase-3: 5s-glance
backlog_items: []
task_count: 7
companion_plans: []
---

## Ultraplan: Arch Linux Redesign

### Vision Alignment
No `VISION.md` exists. PLAN.md is the original v1 terminal spec (pre-DavOS). Archived `PLAN-OS-V4.md` declared "recruiter watching for 5s should think 'that's a Linux box'" but the v3/v4 implementation drifted toward macOS metaphors (top menu bar with dropdowns, pinned-apps dock at bottom, traffic-light window controls, genie minimize). Dave's feedback: as a non-Mac user, the current chrome reads as Mac, not Linux.

This plan re-skins the existing DavOS shell to a tiling-WM Arch dev aesthetic. Underlying primitives (window manager, launcher, boot, themes, animations, easter eggs) are kept; their visual + interaction layer is replaced.

**Recommend follow-up:** author `VISION.md` codifying:
- **Pillar 1** — "Looks like a real dev's tiling-WM box, not a desktop OS pastiche."
- **Pillar 2** — "Keyboard-first navigation: workspace numbers, vim/i3 keybinds, command palette."
- **Pillar 3** — "Cultural in-jokes signal taste to the target audience (`btw I use arch`, neofetch, dotfiles repo link, gruvbox/catppuccin)."
- **Non-goal** — full bash/Linux emulation; this is a portfolio with Arch surface, not a virtual machine.

### Decision
**CREATE** — new plan, no existing plan covers this scope. The active `improvements-and-eastereggs.md` is orthogonal (Sprint E shipped polish + hidden content); this is a visual identity overhaul that touches different files.

### Gap Brief
Audit (Phase 1 reading + Arch dotfile research) confirmed:

**What's already Arch-shaped (keep, don't rebuild):**
- Boot sequence: POST → GRUB → systemd is already the canonical Linux boot. Just re-skin POST/GRUB to look more authentic.
- Launcher (`js/launcher.js`, 328 LOC): already a rofi-style centered fuzzy palette. Just restyle.
- Themes infrastructure (`js/themes.js`, 169 LOC): generic palette-swap engine. Replace the four palettes (`green/amber/blue/matrix`) with dotfile-canon palettes (`gruvbox/catppuccin/tokyonight/nord`).
- Easter-egg scaffold (`js/easter-eggs.js`): trivial to add `btw`, `pacman -Syu`, `/dotfiles`, etc.
- Vanilla CSS variables in `tokens.css`: re-skin via `--color-*` overrides. No structural changes needed.

**What's Mac-shaped (replace):**
- Top **taskbar** (`js/taskbar.js`, 229 LOC + `css/taskbar.css`): Apple-style menu bar with theme dropdown + "About this PC" panel + system tray. Replace with i3bar/polybar layout: workspace pills `[1] [2] [3] [4] [5]` left, focused-window title center, segmented system stats `CPU 12% | MEM 4.2G | ETH 192.168 | Linux 6.8.9-arch1-1 | 2026-05-01 14:32` right.
- Bottom **pinned-apps dock** (`js/pinned-apps.js`, 91 LOC + `css/apps.css`): Mac dock metaphor. Replace with tmux-style status footer (numbered "windows" 0–N for sections, `*` on active) OR remove entirely (tiling WMs don't have docks).
- Window chrome (`js/window-manager.js`, 1068 LOC + `css/window-manager.css`): Mac traffic-light close/min/max buttons (●●●), genie minimize. Replace with i3-minimal: thin 2px focused border in Arch-cyan, optional top title strip with single `[X]` close, no traffic lights, slide-fade close instead of genie.
- "About this PC" modal (panel inside taskbar.js): Mac-System-Profiler vibe. Replace with neofetch render — ASCII Arch pyramid in `#1793D1` left + `key: value` system info right.
- Themes (`green/amber/blue/matrix`): phosphor-terminal palettes, not dotfile-canon palettes. Replace with `gruvbox/catppuccin/tokyonight/nord`.

**What's missing (add):**
- **Workspace switcher** (currently in GAPS as G04, P3) — `Super+1..9` cycles through 5 workspaces. Each workspace holds its own window set. THE central interaction of a tiling WM, can no longer be deferred.
- **Tiling layout** — when ≥2 windows are open in a workspace, auto-tile them in a gapped grid (12px gaps, 2px Arch-cyan border on focus). Floating mode toggle for windows that need it (e.g. game iframes).
- **Vim mode indicator** in terminal: `-- NORMAL --` / `-- INSERT --` badge. Cosmetic; sells the dev signal.
- **Powerline / starship prompt** in terminal pane: two-line prompt with git branch, dirty marker, exit-code chip. Replaces the current single-line `visitor@dave:~$`.
- **Pacman-styled transitions** — when user runs `/install` or any heavy command, render a few `:: Synchronizing package databases...` lines + ASCII progress bar before the actual output.
- **Cultural easter eggs** — `btw` (bare command → `btw I use arch.`), `/pacman -Syu`, `/yay`, `/neofetch` (alias for new `/about`), `/dotfiles` (opens GitHub link to a real or fake dotfiles repo).
- **Path-as-URL convention** — bookmarkable section paths like `#/~/projects`, `#/~/.config/about`, `#/~/dotfiles`. Hash-router style; all routes still resolve client-side.
- **Arch-cyan brand** — `#1793D1` (the actual Arch logo Curious Blue) introduced as `--color-arch` accent across all themes. Not a theme — a brand color, like macOS keeps the rainbow apple regardless of dark/light.

### Scope Summary
- Items planned: 1 visual identity overhaul, decomposed into 7 atomic tasks
- Tasks generated: 7 (A1–A7)
- Estimated total size: 1×L, 4×M, 2×S (≈ 1 sprint, 1–1.5 weeks solo)
- Critical path: A1 → A2 → A3 → A4 (foundation → bar → chrome → tiling). A5/A6/A7 parallel after A1.
- New patterns needed:
  - Workspace state model (currently no concept; `Window.open()` is flat)
  - Polybar-pill component (modular system-stat strip — fake CPU/MEM/etc. animated)
  - Tiling layout engine (auto-position N windows into a gapped grid)
  - Two-line powerline prompt rendering in terminal output
- Dropped from current build: Mac-style dock (`pinned-apps.js` becomes dead code or pivots to tmux footer), genie minimize animation (kept as opt-in alt under settings), top menu-bar dropdown component (`taskbar-menu` class — repurposed for polybar pill click affordances).

### Dependency Graph

```
A1 (foundation: palettes + fonts + brand + COORDINATION updates)
  │
  ├──► A2 (polybar status bar) ──┐
  │                              │
  ├──► A3 (window chrome) ───────┼──► A4 (workspace switcher + tiling)
  │                              │       │
  ├──► A5 (neofetch about) ──────┘       │
  │                                      │
  ├──► A6 (powerline prompt + vim mode)  │
  │                                      │
  └──► A7 (pacman + btw + dotfiles + path URLs) ◄──── (independent of A4)
```

**Hard edges:**
- A2/A3/A5/A6/A7 all depend on A1 (palettes + brand var must exist).
- A4 depends on A2 (workspace pills live in the new polybar) AND A3 (window chrome already migrated; A4 manipulates window position/size).
- A2 and A3 both touch `tokens.css` for new shell tokens — serialize: A2 first (adds bar tokens), A3 next (adds chrome tokens). They do not touch overlapping CSS rules.

**Soft edges (not blocking):**
- A5 cleaner if A1 has shipped (uses brand cyan for ASCII logo); does not need A2/A3.

### Execution Order

| # | Task | Size | Depends on | Touches shared | Backlog item |
|---|------|------|-----------|----------------|--------------|
| 1 | A1 — Palette + font + brand foundation | M | none | tokens.css, themes.js, index.html, COORDINATION.md | (new — recommend ARCH01) |
| 2 | A2 — Polybar-style status bar | M | A1 | tokens.css, taskbar.js, taskbar.css, COORDINATION.md | (new — ARCH02) |
| 3 | A3 — i3-minimal window chrome | M | A1 | tokens.css, window-manager.js, window-manager.css | (new — ARCH03) |
| 4 | A4 — Workspace switcher + tiling | L | A1, A2, A3 | desktop.js, desktop.css, window-manager.js, shortcuts.js, COORDINATION.md, GAPS.md | (resolves G04) |
| 5 | A5 — Neofetch /about + Arch ASCII brand | S | A1 | lore.js, login-screen.js, css (one new file) | (new — ARCH05) |
| 6 | A6 — Powerline prompt + vim mode indicator | M | A1 | terminal.js, terminal.css, easter-eggs.js | (new — ARCH06) |
| 7 | A7 — Pacman transitions + btw + dotfiles + path URLs | S | A1 | easter-eggs.js, boot.js, main.js, anim.js | (new — ARCH07) |

### Risk Register
| Risk | Impact | Mitigation |
|------|--------|------------|
| Existing 655 tests assert specific DOM structure (taskbar children, window chrome buttons, traffic-light classes). | Mass test failure cascade. | Each task includes a "tests touched" checklist. Update assertions in same commit as DOM changes; never let a task land with broken tests. Re-run `node tests/run-tests.js` after every task. |
| Window manager refactor (A3) is in a 1068-LOC file with snap, drag, resize, persist, animate logic intertwined. | Regressions in non-cosmetic behavior (drag stops working, persist breaks). | A3 is **chrome-only**: edit only render functions and CSS. Touch no drag/resize/snap/persist code paths. Lock LOC delta with `Max LOC added: 250`. |
| Tiling engine (A4) has no precedent in this codebase; risk of fighting the existing absolute-positioned floating window model. | A4 grows from L to XL, blows session budget. | Keep "floating" mode as the default; tiling is opt-in via Super+T. Initial scope: 2 tile slots (left/right halves) for proof-of-concept. Full N-window tiling deferred to a follow-up if needed. |
| Workspace switcher requires per-workspace window state — current `Window` map is flat. | Schema migration needed in `js/window-manager.js` + persisted-storage `windows` key. | Versioned migration: add `workspaceId` field to window state with default `1` for legacy entries. Bump session-store schema version. Document in DECISIONS.md. |
| Theme palette swap (A1) breaks visual assertions in tests that compare computed colors. | Test churn. | Tests already use theme-agnostic checks (class-based, not color-based). Spot-check `tests/tests-os.js`, `tests/tests-v7.js`, `tests/tests-v3.js` for hard-coded hex values; replace with CSS-var references. |
| Removing pinned-apps dock leaves orphan code. | Dead code, lingering session-storage key `pinnedApps`. | A4 explicitly addresses: either pivot pinned-apps to a tmux footer renderer, or remove the file + `pinnedApps` storage key + tests. Choice locked in A4 task spec. |
| Recruiter who *is* a Mac user dislikes the change. | Loss of broader-appeal aesthetic. | Keep "Mac mode" as a hidden theme toggle (`/theme darwin`) reachable via easter egg, not in the default theme menu. Defaults Arch. Reversible. |
| `#1793D1` Arch-cyan clashes with existing accent `#00d4ff` blue theme. | Visual collision. | Drop "blue" theme; add `#1793D1` as cross-theme `--color-arch` brand var. Logo + focus border use `--color-arch` regardless of theme. |

---

## Task Specs

### Task A1: Palette + font + brand foundation
**Parent:** none
**Size:** M
**Depends on:** none
**Unblocks:** A2, A3, A4, A5, A6, A7
**Touches shared:** `css/tokens.css`, `js/themes.js`, `index.html`, `.sdlc/plans/COORDINATION.md`
**Exclusive files:** none (new themes are entries in existing `themes` map; new tokens are entries in existing `:root`)
**Registry allocations:**
  - component bit: none
  - enum values: none
  - tick slot: none
  - constants:
    - `--color-arch: #1793D1` in tokens.css (NEW token, theme-agnostic)
    - `--color-ok: #a6e3a1` (Catppuccin green, used for `[ OK ]` boot lines, replaces theme-tied green)
    - `--color-fail: #f38ba8` (Catppuccin red, used for `[FAILED]`)
    - `--font-mono: 'JetBrains Mono', 'Iosevka', 'Fira Code', ui-monospace, monospace` (replaces Courier-fallback only; JetBrains Mono already loaded)
  - protocol fields: none
**Port offset:** base
**Max LOC added:** 250

#### Goal
Establish Arch-dotfile visual foundation: replace the four phosphor-terminal palettes (`green/amber/blue/matrix`) with four dotfile-canon palettes (`gruvbox/catppuccin/tokyonight/nord`), introduce theme-agnostic `--color-arch` brand cyan, and ensure JetBrains Mono / Iosevka are the primary fonts. All later tasks consume these tokens; nothing visible to the user changes structurally yet — only colors and fonts.

#### Prerequisites
- `css/tokens.css` exists with current `--color-*` set (verified)
- `js/themes.js` exists with `themes` map of 4 entries (verified)
- JetBrains Mono already loaded in `index.html` (verified — used in current PLAN.md spec)

#### Changes (in execution order)

**Step 1: Add brand + status tokens to `css/tokens.css`**
- File: `css/tokens.css`
- Change: append after the existing color block:
  ```css
  /* Theme-agnostic brand + status — never overridden by theme */
  --color-arch: #1793D1;        /* Arch logo cyan, used for focus borders, brand mark, links */
  --color-ok: #a6e3a1;          /* systemd [ OK ] green */
  --color-fail: #f38ba8;        /* systemd [FAILED] red */
  --color-warn: #f9e2af;        /* warnings, dirty git, partial states */
  ```
- Pattern: existing `:root` block, append before closing brace
- Why: brand color and status colors must be theme-invariant

**Step 2: Replace the four theme palette objects in `js/themes.js`**
- File: `js/themes.js`
- Change: rewrite `themes` map. Keys become: `catppuccin` (default), `gruvbox`, `tokyonight`, `nord`. Each entry preserves the same shape (`primary`, `dim`, `glow`, `scrollbar`, `border`, `chipBg`, `wallpaperOverlay`, `primaryBgSoft`, `primaryBgSofter`) so `applyTheme()` works unchanged.
  - **catppuccin (default):** primary `#cdd6f4`, dim `#6c7086`, bg `#1e1e2e` via separate `--color-bg` override added to applyTheme, accent `#cba6f7`, surface `#313244`. Wallpaper overlay: subtle dot grid `radial-gradient(...)`.
  - **gruvbox:** primary `#ebdbb2`, dim `#928374`, bg `#282828`, accent `#fabd2f`, surface `#3c3836`. Wallpaper overlay: warm radial vignette.
  - **tokyonight:** primary `#c0caf5`, dim `#565f89`, bg `#1a1b26`, accent `#7aa2f7`, surface `#24283b`. Wallpaper overlay: starfield dots.
  - **nord:** primary `#d8dee9`, dim `#4c566a`, bg `#2e3440`, accent `#88c0d0`, surface `#3b4252`. Wallpaper overlay: subtle horizontal lines.
- Default theme: change `currentTheme = 'catppuccin'`. Migration: read legacy `localStorage['portfolio-theme']`, if value is one of the old four (`green/amber/blue/matrix`), map to `catppuccin` and rewrite the key.
- Pattern: existing `themes` object literal at top of file (`js/themes.js:6-55`)
- Why: replacing palettes is a value-change in the data model; engine code is unchanged

**Step 3: Extend `applyTheme()` to also set `--color-bg` and `--color-surface`**
- File: `js/themes.js`
- Change: in `doApply()` (around line 67), add two new `root.style.setProperty()` calls for `--color-bg` and `--color-surface`. Add the matching `bg` and `surface` fields to each theme object in step 2.
- Pattern: existing setProperty pattern at `js/themes.js:70-78`
- Why: dotfile palettes have distinct bg + surface values (e.g. Catppuccin base vs surface0); single primary isn't enough.

**Step 4: Add `--color-bg`, `--color-surface` to `:root` defaults in tokens.css**
- File: `css/tokens.css`
- Change: replace `--color-bg: #0a0a0a` with `--color-bg: #1e1e2e` (Catppuccin base). Add `--color-surface: #313244;` after.
- Pattern: existing token in `:root`
- Why: matching defaults to new default theme (catppuccin)

**Step 5: Add font fallback chain**
- File: `css/tokens.css`
- Change: add `--font-mono: 'JetBrains Mono', 'Iosevka', 'Fira Code', ui-monospace, monospace;` to `:root`.
- File: `css/terminal.css` and any other CSS with hardcoded `font-family: 'JetBrains Mono', ...` — replace with `font-family: var(--font-mono);`.
- Pattern: existing CSS-var usage throughout codebase
- Why: single source of truth for font stack; later tasks add Iosevka via Google Fonts if needed

**Step 6: Verify Google Fonts include + add Iosevka as fallback**
- File: `index.html`
- Change: locate existing `<link>` for Google Fonts JetBrains Mono. Confirm it's preconnect + 400/700. No structural change unless missing.
- Why: confirm prerequisite; do not duplicate

**Step 7: Update COORDINATION.md**
- File: `.sdlc/plans/COORDINATION.md`
- Change:
  - §5 Named Constants — append `--color-arch | #1793D1 | tokens.css (brand)`, `--color-ok | #a6e3a1 | tokens.css`, `--color-fail | #f38ba8 | tokens.css`, `--color-warn | #f9e2af | tokens.css`
  - Change Log — append: `2026-05-01 — A1 (arch-linux-redesign): replaced palette set (green/amber/blue/matrix → catppuccin/gruvbox/tokyonight/nord). Added brand + status color tokens. Default theme now catppuccin.`
- Why: registry hygiene per project conventions

**Step 8: Test migration**
- File: `tests/tests.js` and `tests/themes` (find via Grep) — replace any hardcoded `'green'`/`'amber'`/`'blue'`/`'matrix'` theme name strings with new names.
- Pattern: tests should use `Object.keys(themes)` where possible to be palette-agnostic
- Why: avoid brittle string assertions

#### Edge cases
- **Legacy theme name in localStorage:** map `green→catppuccin`, `amber→gruvbox`, `blue→tokyonight`, `matrix→catppuccin` (matrix has no obvious analog; default to catppuccin). Map on read in `themes.js` boot.
- **Tests asserting `currentTheme === 'green'`:** update to `'catppuccin'` or remove specificity.
- **Reduced motion:** no animation changes here, all theme swaps already respect `Anim.reduced()` via `applyTheme`.

#### NOT in scope
- Changing taskbar / window chrome / desktop layout (A2/A3/A4)
- Adding new themes beyond the four (deferred — `/theme custom` is a future easter egg)
- Removing the radial-wipe theme transition animation (orthogonal to palette identity)

#### Acceptance criteria
- [ ] `node tests/run-tests.js` → 655 passing, 0 failing
- [ ] Visual smoke: load page, default theme is Catppuccin Mocha (purple/pastel on dark)
- [ ] `/theme gruvbox` switches to Gruvbox warm palette
- [ ] `/theme tokyonight`, `/theme nord` work
- [ ] No console errors on theme switch
- [ ] CSS var `--color-arch` resolves to `#1793D1` regardless of active theme (verify via DevTools `getComputedStyle(document.documentElement).getPropertyValue('--color-arch')`)
- [ ] Old localStorage value `'green'` boots into catppuccin without crash

#### Test plan
- Run full suite after each step.
- Add 1 new test: `applyTheme('catppuccin')` followed by `getComputedStyle(...).getPropertyValue('--color-arch')` returns `#1793D1` (trim).
- Manual: open in browser, cycle all four themes via `/theme <name>`, eyeball.

#### Risk notes
- **Don't rename `applyTheme()` or change its signature** — many call sites (`taskbar.js`, `os-commands.js`, `palette.js`).
- **Keep the `themes` global on `window`** — `taskbar.js:39` reads `themes` directly.

---

### Task A2: Polybar-style status bar
**Parent:** none
**Size:** M
**Depends on:** A1
**Unblocks:** A4
**Touches shared:** `css/tokens.css` (one new token), `js/taskbar.js`, `css/taskbar.css`, `.sdlc/plans/COORDINATION.md`
**Exclusive files:** none (new — all changes are inside existing taskbar files)
**Registry allocations:**
  - constants: `--bar-pill-gap: 6px` in tokens.css (NEW)
  - protocol fields: none
**Port offset:** base
**Max LOC added:** 500

#### Goal
Replace the macOS-style top menu bar with an i3bar/polybar layout: workspace pills on the left, focused-window title in the center, segmented system-stats strip on the right (CPU, MEM, kernel, branch, clock). Keep the launcher trigger reachable; keep the existing tray-popouts mechanism. The bar becomes the primary navigation affordance for A4 (workspace switcher).

#### Prerequisites
- A1 complete (color tokens + brand var)
- `js/taskbar.js` (229 LOC) and `css/taskbar.css` exist
- `js/launcher.js` and `js/quick-settings.js` integrate via taskbar already (verified)

#### Changes (in execution order)

**Step 1: Restructure taskbar HTML in `taskbar.js` init**
- File: `js/taskbar.js`
- Change: rewrite the `init()` function (or wherever the bar children are mounted) to produce three sections:
  - `.bar-left`: workspace pills container (will hold 5 pills `[1] [2] [3] [4] [5]`, populated by A4. For A2, render placeholder pill `[1]` only, marked `.active`).
  - `.bar-center`: window-title display, reads `Window.activeTitle()` (add this getter to `window-manager.js` if absent — append-only).
  - `.bar-right`: system-stats pill strip (see step 2).
- Pattern: existing `taskbar-running` segment (`taskbar.js`, search "taskbar-running")
- Why: i3bar canonical layout

**Step 2: Implement system-stats pill strip**
- File: `js/taskbar.js`
- Change: add `function renderSystemStats(container)`. Renders six pills, each `<span class="bar-pill bar-pill-<modulename>">`:
  1. **CPU**: `` 12%`` — Nerd Font CPU glyph + animated value (random walk between 5–25% on a 2s tick; stored in module local state, not session)
  2. **MEM**: ` 4.2G` — animated 3.9–4.4G
  3. **NET**: ` 192.168.1.42` — static fake IP (or dot-formatted random on boot)
  4. **KERNEL**: ` 6.8.9-arch1-1` — static
  5. **BRANCH**: ` main` — static (uses GitHub repo branch if reachable; static otherwise)
  6. **CLOCK**: existing live clock — repurposed, restyled
- Each pill is dimmed background `--color-surface`, primary text, has 6px `--bar-pill-gap` spacing.
- Pattern: existing `setInterval(updateClock, 1000)` for the tick (`taskbar.js:19`)
- Why: signature polybar visual

**Step 3: Drop the Mac "About this PC" panel + theme dropdown from the bar**
- File: `js/taskbar.js`
- Change: remove `themeBtn`, `showThemeMenu`, "About this PC" `<span>` and its panel logic. Theme switching moves to: (a) `/theme <name>` command (already exists via `os-commands.js`), (b) Quick Settings popout (already exists, untouched). About info moves to `/about` neofetch render in A5.
- Pattern: clean delete of unused code
- Why: polybar has no app menu; keep the bar minimal

**Step 4: Restyle taskbar in `css/taskbar.css`**
- File: `css/taskbar.css`
- Change: full rewrite of layout rules. New structure:
  ```css
  #taskbar { display: flex; align-items: center; height: var(--taskbar-height); padding: 0 8px; gap: 12px; background: var(--color-surface); border-bottom: 1px solid var(--color-border); }
  .bar-left, .bar-right { display: flex; gap: var(--bar-pill-gap); align-items: center; }
  .bar-center { flex: 1; text-align: center; color: var(--color-dim); font-size: 12px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .bar-pill { padding: 2px 8px; border-radius: 3px; font-size: 12px; color: var(--color-primary); background: rgba(255,255,255,0.04); display: inline-flex; align-items: center; gap: 4px; }
  .bar-pill.active { background: var(--color-arch); color: var(--color-bg); }  /* active workspace pill */
  ```
- Drop existing rules for `.taskbar-menu`, `.taskbar-menu-item`, `.about-panel`. Move tray-popout positioning (still anchors to bar-right) to `tray-popouts.css` if it isn't already.
- Pattern: CSS file rewrite — keep structure, swap rule contents
- Why: polybar canonical look

**Step 5: Window-title binding**
- File: `js/window-manager.js`
- Change: append `Window.activeTitle = function() { ... }` returning the `title` of the focused window or empty string. Append `Window.onActiveChange = function(cb) { ... }` for taskbar to subscribe.
- File: `js/taskbar.js`
- Change: `Window.onActiveChange((title) => { document.querySelector('.bar-center').textContent = title; });`
- Pattern: existing event-emitter style in window-manager.js (search for `onChange` / observers)
- Why: i3 status bar always shows focused window title

**Step 6: Update COORDINATION.md**
- File: `.sdlc/plans/COORDINATION.md`
- Change:
  - §5 Named Constants — append `--bar-pill-gap | 6px | tokens.css (taskbar)`
  - §7 File Ownership — append `js/taskbar.js | shell-redesign — polybar layout, pill renderer`
  - Change Log — `2026-05-01 — A2 (arch-linux-redesign): replaced Mac menu bar with polybar layout. Workspace pills (left), title (center), system-stats pills (right). Removed theme dropdown + About panel from bar.`
- Why: registry

#### Edge cases
- **Long window titles overflow:** CSS handles via `text-overflow: ellipsis`. No JS truncation needed.
- **No focused window:** `bar-center` shows empty string. Don't render placeholder text.
- **Reduced motion:** the random-walk animation on CPU/MEM pills must skip when `Anim.reduced()`; show static values instead.
- **Window-title getter on cold boot:** `Window.activeTitle()` returns `''` before any window opens.

#### NOT in scope
- Workspace pills functionality (A4 implements clicks, switching, populating dynamically). A2 only renders pill `[1]` as placeholder.
- Replacing the bottom pinned-apps dock (A4)
- Changing window chrome (A3)

#### Acceptance criteria
- [ ] Top bar reads `[1]` left, focused window title center, six right-side pills
- [ ] System-stats pills update on a 2s tick (suspended under `prefers-reduced-motion`)
- [ ] Clock pill shows `YYYY-MM-DD HH:MM:SS` (matches v4 format)
- [ ] Theme dropdown is gone from the bar; `/theme catppuccin` still works via terminal
- [ ] `node tests/run-tests.js` → 655 passing (after updating any tests asserting `.taskbar-menu` or "About this PC")
- [ ] Visual: bar feels like polybar, not Apple

#### Test plan
- Update `tests/tests-os.js` (Grep first to locate existing taskbar tests). Replace assertions on `.taskbar-menu` / "About this PC" with assertions on `.bar-pill`, six right-side pills, one left-side pill.
- Add: `tests-os.js` — assert `.bar-center` updates when `Window.open({title: 'Foo'})` runs.
- Manual: open three windows, check title in `.bar-center` reflects active.

#### Risk notes
- **Tray popouts** (`js/tray-popouts.js`) — they currently anchor relative to taskbar-right children. Verify positioning still works after restyle. If broken, adjust anchor selector to `.bar-right`.
- **`/about` command currently opens a panel from taskbar.js** — remove the side-effect; A5 reroutes to neofetch render.
- **LOC delta** — taskbar.js may grow toward the 500-LOC budget. If hitting limit, extract polybar-pill renderer to a new `js/bar-pills.js` (NEW exclusive file).

---

### Task A3: i3-minimal window chrome
**Parent:** none
**Size:** M
**Depends on:** A1
**Unblocks:** A4
**Touches shared:** `css/tokens.css` (window-chrome tokens), `js/window-manager.js`, `css/window-manager.css`
**Exclusive files:** none
**Registry allocations:**
  - constants:
    - `--window-gap: 12px` in tokens.css (NEW; consumed by A4)
    - `--window-border-focus: 2px solid var(--color-arch)` (NEW)
    - `--window-border-blur: 1px solid var(--color-border)` (NEW)
  - protocol fields: none
**Port offset:** base
**Max LOC added:** 250

#### Goal
Replace Mac traffic-light close/min/max buttons with i3-minimal chrome: thin colored border (Arch-cyan when focused, dim border otherwise), optional 22px title strip with single `[X]` close glyph in the top-right (no min/max — those move to keyboard shortcuts only). No genie minimize; replace with a 140ms slide-fade. **Render-layer only** — drag/resize/snap/persist code paths untouched.

#### Prerequisites
- A1 complete
- `js/window-manager.js` (1068 LOC) — drag/resize/snap/persist all in this file
- `css/window-manager.css` — current chrome rules: `.window-titlebar`, `.window-traffic-light`, etc.

#### Changes (in execution order)

**Step 1: Restyle window border + chrome in CSS**
- File: `css/window-manager.css`
- Change: replace existing chrome rules. New:
  ```css
  .window { border: var(--window-border-blur); border-radius: 4px; padding: 0; background: var(--color-bg); }
  .window.focused { border: var(--window-border-focus); }
  .window-titlebar { height: 22px; padding: 0 8px; background: var(--color-surface); display: flex; align-items: center; justify-content: space-between; font-size: 11px; color: var(--color-dim); }
  .window-titlebar .title { font-family: var(--font-mono); }
  .window-close { background: transparent; border: 0; color: var(--color-dim); font-family: var(--font-mono); cursor: pointer; padding: 0 4px; }
  .window-close:hover { color: var(--color-fail); }
  /* Hide Mac traffic-light containers if still rendered */
  .window-traffic-light { display: none; }
  ```
- Drop: rounded macOS-style 8px corners, traffic-light specific colors (red/yellow/green dot styling).
- Pattern: full rule swap, keep selectors that the JS still queries
- Why: i3 minimal chrome look

**Step 2: Render single `[X]` close instead of three traffic lights**
- File: `js/window-manager.js`
- Change: locate the title-bar render function (search `traffic-light` or `window-titlebar`). Replace the three-button render with a single `<button class="window-close" aria-label="Close">[X]</button>`. Wire its click to the existing `closeWindow(id)` function (no logic change).
- Pattern: existing button render in title bar
- Why: i3 has no min/max buttons; keyboard does it

**Step 3: Replace genie minimize with slide-fade**
- File: `js/window-manager.js`
- Change: locate where `Anim.genie()` is called (likely `minimizeWindow`). Replace with a slide-down + fade-out using existing `Anim.fadeOut()` + a transform translate. Or add a new `Anim.slideOut()` primitive in `js/anim.js` (ADD NEW, append-only). Duration `WINDOW_CLOSE_MS` (140ms).
- File: `js/anim.js`
- Change: append `Anim.slideOut = function(el, opts) { ... }`. Promise-returning, respects `Anim.reduced()`.
- Pattern: existing animations in `anim.js` (e.g., `Anim.fadeOut`)
- Why: Mac genie is iconic; remove it

**Step 4: Add window gap CSS var**
- File: `css/tokens.css`
- Change: append the three window vars listed in Registry allocations.
- Why: A4 consumes `--window-gap` for tiling

**Step 5: Update tests**
- File: `tests/tests-os.js` and `tests-v3.js` (search for `traffic-light`, `windowTrafficLight`, `genie`)
- Change: replace assertions on traffic-light DOM with assertions on `.window-close` button. Replace genie animation timing assertions with slide-fade assertions.
- Why: prevent test regression

**Step 6: Update DECISIONS.md**
- File: `.sdlc/DECISIONS.md`
- Change: append ADR `2026-05-01 ADR-N — Window chrome: Mac traffic-lights → i3 minimal. Rationale: portfolio target audience (Linux dev hiring managers in Copenhagen) responds more strongly to i3/polybar aesthetic than Mac metaphor. Single [X] close + keyboard-only min/max. Genie animation replaced with slide-fade.`
- Why: capture irreversible direction shift

#### Edge cases
- **Already-minimized windows on cold boot:** schema unchanged; restored windows render with new chrome automatically.
- **Maximize/min keyboard shortcuts (`Meta+ArrowUp/Down`):** unchanged; just the buttons disappear.
- **Window titles read by `Window.activeTitle()` (A2):** still rendered in `.window-titlebar .title` — no change to data flow.

#### NOT in scope
- Tiling layout (A4)
- Removing window drag/resize behavior (kept fully)
- Replacing snap zones (kept fully — A4 will integrate snap with workspaces)

#### Acceptance criteria
- [ ] Windows have a 1px border by default, 2px Arch-cyan border when focused
- [ ] Title bar is 22px high, has only `[X]` close button on the right
- [ ] No green/yellow/red traffic-light dots visible
- [ ] Close button works (window closes); hover turns red (`--color-fail`)
- [ ] Minimize uses slide-fade, not genie
- [ ] Drag, resize, snap, persist all still work (regression test)
- [ ] `node tests/run-tests.js` → 655 passing
- [ ] DECISIONS.md updated with ADR

#### Test plan
- Run full suite. Update DOM assertions (Step 5). Re-run.
- Manual: open window, drag, resize, snap left, close, reopen via launcher. All should work.

#### Risk notes
- **Do not** edit drag, resize, snap, or persist code paths in `window-manager.js`. If a function is more than 30 lines from a render call, leave it alone.
- **Keep `.window-traffic-light` selector available** in CSS as `display: none` — some tests may still query it; safer than removing.

---

### Task A4: Workspace switcher + tiling layout
**Parent:** none (resolves GAPS G04)
**Size:** L
**Depends on:** A1, A2, A3
**Unblocks:** none (final visual task)
**Touches shared:** `js/window-manager.js`, `js/desktop.js`, `css/desktop.css`, `js/shortcuts.js`, `js/taskbar.js` (workspace-pill click + render — touched by A2 first, then A4), `js/session-store.js` (schema migration), `.sdlc/plans/COORDINATION.md`, `.sdlc/plans/GAPS.md`
**Exclusive files:** `js/workspaces.js` (NEW), `css/workspaces.css` (NEW)
**Registry allocations:**
  - keyboard shortcuts: `Meta+1` … `Meta+5` / `Ctrl+Alt+1` … `Ctrl+Alt+5` for workspace switching (5 pills)
  - keyboard shortcuts: `Meta+T` for floating-toggle (per-window) — opt-in tiling
  - constants: `WORKSPACE_COUNT = 5` in `js/workspaces.js`, referenced by COORDINATION §5
  - session-storage keys: `workspaces` (NEW; map `{ workspaceId: [windowIds] }`); migrate existing flat `windows` to workspace 1
  - protocol fields: window state gains `workspaceId: number` field
**Port offset:** base
**Max LOC added:** 1000

#### Goal
Add the central interaction of a tiling WM: 5 numbered workspaces, switchable via `Meta+1`…`Meta+5` and pill clicks. Each workspace holds its own window set; switching hides current set, shows other. Add an opt-in tiling layout (toggle per workspace via `Meta+T`): when active, all windows in that workspace auto-position into a 2-tile or N-tile gapped grid. Default mode stays floating (existing behavior). Resolves GAPS G04. Decommission Mac-style pinned-apps dock at the bottom — replace with nothing (tiling WMs don't have docks) OR with a tmux-style status footer (decided in Step 8).

#### Prerequisites
- A1, A2, A3 complete (palettes, polybar, window chrome shipped)
- `Window.open({...})` returns a window handle, persists state (verified)
- Session-store has `windows` key (verified, COORDINATION §4)

#### Changes (in execution order)

**Step 1: New `js/workspaces.js` — workspace state model**
- File: `js/workspaces.js` (NEW)
- Change: implement:
  ```js
  var Workspaces = {
    current: 1,
    count: 5,
    map: {},  // { 1: { windowIds: [], tiling: false }, 2: {...}, ... }
    init: function() { /* migrate from session-store */ },
    switchTo: function(id) { /* hide current, show target, update bar */ },
    addWindow: function(windowId) { /* attach to current */ },
    removeWindow: function(windowId) { /* detach */ },
    toggleTiling: function() { /* on current */ },
    onChange: function(cb) { /* observer for taskbar pills */ }
  };
  ```
- Pattern: module pattern matching `js/session-store.js`
- Why: encapsulates workspace state away from window-manager

**Step 2: Migrate session-store schema**
- File: `js/session-store.js`
- Change: add migration: when reading existing `windows` key without `workspaceId` field, assign `workspaceId: 1` to each, save under new `workspaces` key. Bump schema version. Old key tolerated for two boots, then removed.
- Pattern: existing migration logic if present; else add
- Why: backward compatibility

**Step 3: Hook `Window.open()` to call `Workspaces.addWindow()`**
- File: `js/window-manager.js`
- Change: in `Window.open()` (search for the function), append `Workspaces.addWindow(handle.id)`. In `closeWindow()`, append `Workspaces.removeWindow(id)`. Hidden-via-workspace state: when `Workspaces.switchTo(target)` runs, set `display: none` on windows whose `workspaceId !== target`, restore on switch back.
- Pattern: existing window lifecycle hooks
- Why: integrate workspace lifecycle without rewriting window-manager

**Step 4: Render workspace pills in taskbar**
- File: `js/taskbar.js`
- Change: replace the placeholder `[1]` pill from A2 with a real renderer. Subscribe to `Workspaces.onChange()`. Render 5 pills. Active pill gets `.active` class (Arch-cyan bg from A2). Click handler: `Workspaces.switchTo(N)`. Workspaces with windows show a dot indicator.
- Pattern: A2's pill render
- Why: bar is now live workspace switcher

**Step 5: Register `Meta+1`…`Meta+5` shortcuts**
- File: `js/shortcuts.js`
- Change: append registrations:
  ```js
  for (var i = 1; i <= 5; i++) {
    (function(n) {
      Shortcuts.register('Meta+' + n, 'Switch to workspace ' + n, 'Workspaces', function() { Workspaces.switchTo(n); });
      Shortcuts.register('Ctrl+Alt+' + n, '...', 'Workspaces', function() { Workspaces.switchTo(n); });
    })(i);
  }
  Shortcuts.register('Meta+T', 'Toggle tiling on current workspace', 'Workspaces', function() { Workspaces.toggleTiling(); });
  ```
- Pattern: existing `Shortcuts.register()` calls in shortcuts.js
- Why: keyboard parity with i3

**Step 6: Tiling layout engine (initial: 2-tile)**
- File: `js/workspaces.js`
- Change: add `function applyTilingLayout(workspaceId)`. Reads windows in workspace, positions them: 1 window → fullscreen (minus bar/gap), 2 windows → left half + right half with `--window-gap`, 3+ → left half + right column split (master + stack, like i3 default). Recompute on window add/close while tiling is on. Use `Window.move(id, x, y, w, h)` (add to window-manager.js if absent — append-only).
- Pattern: existing `Window.snapLeft()`/`Window.snapRight()` (already implements half-screen positioning)
- Why: tiling is the headline feature

**Step 7: Workspace-switch animation**
- File: `css/workspaces.css` (NEW)
- Change: define a brief slide-fade for windows entering/leaving a workspace. Respect `prefers-reduced-motion`.
- Why: i3 has no animation; we add a subtle slide for clarity since browser users aren't WM users

**Step 8: Decommission pinned-apps dock OR repurpose**
- File: `js/pinned-apps.js`, `css/apps.css` (pinned-apps section)
- Decision: **remove the bottom dock entirely.** Tiling WMs don't have docks; the polybar (A2) plus workspace pills is the navigation.
- Change:
  - In `index.html`, remove the `<script src="js/pinned-apps.js">` tag.
  - Delete `js/pinned-apps.js`.
  - Remove pinned-apps CSS rules from `css/apps.css`.
  - Remove `pinnedApps` from session-storage on next boot (one-time cleanup).
  - Update COORDINATION §4 — remove `pinnedApps` from session keys.
  - Update `tests/run-tests.js` — remove `pinned-apps.js` from the load list.
- Pattern: clean delete
- Why: dock metaphor doesn't fit tiling WM aesthetic

**Step 9: Update COORDINATION.md and GAPS.md**
- File: `.sdlc/plans/COORDINATION.md`
- Change:
  - §2 Keyboard Shortcut Reservations — append rows for `Meta+1..5`, `Ctrl+Alt+1..5`, `Meta+T`
  - §4 Session-Storage Keys — append `workspaces | object | workspaces.js`; mark `pinnedApps` as REMOVED with a note
  - §5 Named Constants — append `WORKSPACE_COUNT | 5 | workspaces.js`
  - §7 File Ownership — append `js/workspaces.js | arch-linux-redesign — workspace state, tiling`
  - Change Log — entry for A4
- File: `.sdlc/plans/GAPS.md`
- Change: mark G04 as RESOLVED with reference to this plan.

#### Edge cases
- **Cold-boot migration:** legacy `windows` array → all assigned `workspaceId: 1`. Logged once.
- **Workspace switch during animation:** debounce 100ms; ignore re-entries.
- **Toggle tiling with 0 windows:** no-op, but persist the intent (next opened window auto-tiles).
- **Window dragged across workspaces:** out of scope; tiling WMs handle this with `Meta+Shift+N`. Defer to follow-up.
- **Floating mode + tiling toggle:** if a window has explicit `floating: true`, exclude it from tiling layout.

#### NOT in scope
- Drag-window-between-workspaces (`Meta+Shift+1..5`) — defer
- Per-workspace wallpapers — defer
- Tabbed/stacking layouts (i3's other modes) — only floating + 2/3-tile in this task
- Tmux-style bottom status footer — explicitly skipped (Step 8 chose "remove dock entirely")

#### Acceptance criteria
- [ ] 5 workspace pills visible in left-side bar
- [ ] `Meta+1`…`Meta+5` switch active workspace; pill `.active` class follows
- [ ] Windows opened in workspace 1 invisible after switching to workspace 2
- [ ] `Meta+T` on current workspace toggles tiling; with 2 windows they snap to halves with 12px gap
- [ ] Active-workspace pill is Arch-cyan; inactive pills are dim
- [ ] Bottom dock is GONE (no pinned-apps)
- [ ] Window state survives reload (`workspaces` session key)
- [ ] `node tests/run-tests.js` → all passing (after updating tests asserting pinned-apps presence)
- [ ] GAPS.md G04 marked RESOLVED
- [ ] DECISIONS.md adds ADR for "remove dock"

#### Test plan
- New file `tests/tests-workspaces.js`: workspace switch, window-attach, tiling layout 2-tile, schema migration, keyboard shortcut.
- Update `tests-os.js` to drop pinned-apps assertions.
- Manual: open 3 windows, switch to ws 2, open 1 more, `Meta+T` tiles them, switch back to ws 1, all 3 still there.

#### Risk notes
- **Largest task in plan.** If LOC budget exceeded, split: A4a (workspaces only) + A4b (tiling engine + dock removal).
- **`Workspaces.switchTo()` performance** with many windows: `display: none` is cheap, but if total windows >50 add virtualization (out of scope for v1; flag as future).
- **Decommissioning pinned-apps** is a destructive change. Take a git commit before removing, in case rollback needed.

---

### Task A5: Neofetch /about + Arch ASCII brand
**Parent:** none
**Size:** S
**Depends on:** A1
**Unblocks:** none
**Touches shared:** `js/lore.js` (existing `/about` handler), `js/login-screen.js` (welcome message)
**Exclusive files:** `js/neofetch.js` (NEW), `css/neofetch.css` (NEW)
**Registry allocations:**
  - command names: `/neofetch` (alias for new `/about`); `/fastfetch` (same)
  - protocol fields: none
**Port offset:** base
**Max LOC added:** 250

#### Goal
Replace the existing `/about` panel and the boot-screen welcome ASCII with a neofetch render: Arch pyramid in `--color-arch` on the left, aligned `key: value` info on the right (Name, Role, Location, Stack, Editor, WM, Uptime, Github, Email). This is the single most copied "Arch screenshot" — must look correct.

#### Prerequisites
- A1 complete (palette, brand var)
- `js/lore.js` registers `/about` (verified)
- `js/login-screen.js` renders boot welcome (verified)

#### Changes (in execution order)

**Step 1: New `js/neofetch.js` — render function**
- File: `js/neofetch.js` (NEW)
- Change: implement `Neofetch.render(target)` that injects the canonical Arch ASCII pyramid (multi-line string, 18 rows) on the left as `<pre class="neofetch-logo">` colored `--color-arch`, plus a right-side info block with persona-driven values:
  ```
  user@dave-arch                      ← persona.name + hostname
  ----------------
  OS: Arch Linux x86_64
  Kernel: 6.8.9-arch1-1
  Uptime: 3 years @ Omada A/S         ← (now() - persona.startedOmada) in years
  Packages: 1247 (pacman)             ← static
  Shell: zsh 5.9
  WM: Hyprland
  Editor: nvim
  Theme: Catppuccin Mocha             ← currentTheme dynamic
  CPU: Intel i7-1370P                 ← static
  Memory: 4234MiB / 16384MiB          ← random tick
  Location: Copenhagen, DK            ← persona.location
  Role: Full-stack Developer          ← persona.role
  Stack: TypeScript / React / .NET    ← persona.stack
  GitHub: github.com/D-ungvari        ← persona.github
  Email: qkaturo95@gmail.com          ← persona.email
  ```
- Pattern: existing `Persona.get()` reads in `js/persona.js`
- Why: canonical neofetch layout

**Step 2: Pull from persona.json**
- File: `js/neofetch.js`
- Change: read fields via `Persona.get()`. Fallback strings for missing fields.
- Pattern: persona accessor in lore.js
- Why: single source of truth

**Step 3: Reroute `/about` and add aliases**
- File: `js/lore.js`
- Change: `/about` handler now calls `Neofetch.render(terminal)` (renders into terminal pane). Register `/neofetch` and `/fastfetch` as aliases pointing to the same handler.
- Pattern: existing command registration
- Why: a Linux dev's first instinct is `neofetch`, give it to them

**Step 4: Login-screen welcome → neofetch**
- File: `js/login-screen.js`
- Change: where the welcome ASCII art is rendered post-boot, swap to neofetch render.
- Pattern: existing welcome render
- Why: visual anchor on first paint

**Step 5: Style in `css/neofetch.css`**
- File: `css/neofetch.css` (NEW)
- Change: two-column flex grid (logo + info). Logo is `var(--color-arch)`, info keys `var(--color-arch)`, info values `var(--color-primary)`. Monospace, line-height 1.2.

**Step 6: Drop the old "About this PC" Mac-style panel** (already removed in A2 step 3 — confirm gone)
- Verify A2 deleted that code path; no further action.

#### Edge cases
- **Persona missing field:** show `unknown` or skip line.
- **Reduced motion:** no animation here — render is static (pyramid + text).
- **Terminal output truncation on narrow viewport:** width-aware fallback to single-column on <600px.

#### NOT in scope
- `/help` reformat (separate)
- Editing persona.json content
- ASCII art for project tiles (B-tier follow-up)

#### Acceptance criteria
- [ ] `/about`, `/neofetch`, `/fastfetch` all render the same Arch pyramid + info
- [ ] Pyramid colored `var(--color-arch)` (`#1793D1`)
- [ ] Boot welcome shows neofetch instead of generic ASCII
- [ ] Persona fields populate (name, location, role, stack)
- [ ] Looks visually identical to `neofetch` on a real Arch box (compare side-by-side)
- [ ] `node tests/run-tests.js` passing

#### Test plan
- Add `tests/tests-neofetch.js` — render produces a `.neofetch-logo` pre + `.neofetch-info` block with N expected fields.
- Manual: `/about`, eyeball.

#### Risk notes
- **Pyramid ASCII is non-trivial.** Use the official fastfetch arch logo verbatim from `https://github.com/fastfetch-cli/fastfetch/blob/dev/src/logo/ascii/arch.txt`. Don't hand-draw.

---

### Task A6: Powerline prompt + vim mode indicator
**Parent:** none
**Size:** M
**Depends on:** A1
**Unblocks:** none
**Touches shared:** `js/terminal.js`, `css/terminal.css`, `js/easter-eggs.js` (vim/nvim commands)
**Exclusive files:** none
**Registry allocations:**
  - constants: `--prompt-corner: '╭─'` / `'╰─'` glyphs added in tokens.css
  - protocol fields: none
**Port offset:** base
**Max LOC added:** 400

#### Goal
Replace the single-line `visitor@dave:~$ ` prompt with a two-line starship/p10k-style prompt:

```
╭─ visitor@dave-arch  ~/portfolio  main !2 ?1
╰─λ
```

Plus a small `-- NORMAL --` / `-- INSERT --` mode indicator at the bottom-right of the terminal pane that toggles when the user focuses the input. Cosmetic; doesn't change command parsing.

#### Prerequisites
- A1 complete
- `js/terminal.js` (196 LOC) renders the prompt currently as `<span class="prompt">visitor@dave:~$&nbsp;</span>`

#### Changes (in execution order)

**Step 1: Two-line prompt in `terminal.js`**
- File: `js/terminal.js`
- Change: refactor prompt render. Prompt becomes two stacked lines:
  - Top: `╭─ ` + user-host segment (cyan bg, dark text) + ` ` + cwd segment (blue bg) + ` ` + git segment (yellow bg if dirty, green if clean) + powerline arrow `` between segments.
  - Bottom: `╰─λ ` + actual input.
- The `λ` glyph in `--color-arch`. Use HTML spans with backgrounds to fake powerline pills (no Nerd Font dependency).
- Pattern: existing prompt render — keep input element intact, wrap in two-line structure
- Why: signature dev signal

**Step 2: cwd reads from FS module**
- File: `js/terminal.js`
- Change: cwd segment reads `FS.cwd()` (existing `js/fs.js` module). Update on `cd` command (already in fs.js).
- Pattern: fs.js export pattern
- Why: live cwd

**Step 3: Git segment — fake but plausible**
- File: `js/terminal.js`
- Change: render ` main !N ?M` where N (modified) and M (untracked) are random small ints chosen on boot, persistent within session. Updates only when terminal cleared.
- Why: zero-cost dotfile signal

**Step 4: Vim mode indicator**
- File: `js/terminal.js`
- Change: append a `<div class="terminal-mode">-- NORMAL --</div>` to terminal pane (CSS-positioned bottom-right). Default INSERT when input focused, NORMAL when blurred. Toggle class on focus/blur of `#command-input`.
- File: `css/terminal.css`
- Change: position absolute bottom-right of terminal pane, faded.

**Step 5: vim/nvim easter-egg commands**
- File: `js/easter-eggs.js`
- Change: register `/vim`, `/nvim`, `:q`, `:q!`, `:wq` — render brief "no buffer to save" or "Vim 9.1 — type `:q` to exit" messages. Cultural dev humor.

**Step 6: Style updates**
- File: `css/terminal.css`
- Change: powerline-pill backgrounds, `╭─/╰─` prefix glyphs, mode-indicator pill.

#### Edge cases
- **Cwd longer than 30 chars:** truncate middle.
- **Reduced motion:** no animations on segment changes.
- **Tab completion tests:** ensure prompt structure change doesn't break input-element selectors.

#### NOT in scope
- Real git status (not feasible without server)
- Multi-line prompt history persistence

#### Acceptance criteria
- [ ] Prompt is two lines with `╭─` and `╰─λ` corner glyphs
- [ ] Three segments visible: user@host, cwd, git
- [ ] `-- INSERT --` shown when typing, `-- NORMAL --` when blurred
- [ ] `/vim` returns a culturally-appropriate gag
- [ ] Tab-complete still works (regression)
- [ ] Tests passing

#### Test plan
- Update terminal tests to assert two-line prompt structure (`.prompt-top`, `.prompt-bottom`).
- Add: assert `-- INSERT --` text appears on focus, `-- NORMAL --` on blur.

#### Risk notes
- Multiple existing tests assume `<span class="prompt">` is a single element. Update selectors.

---

### Task A7: Pacman + btw + dotfiles + path-as-URL + boot polish
**Parent:** none
**Size:** S
**Depends on:** A1
**Unblocks:** none
**Touches shared:** `js/easter-eggs.js`, `js/boot.js` (POST/GRUB text refinement), `js/main.js` (hash router), `js/anim.js` (typewriter — already added in Sprint E10)
**Exclusive files:** none
**Registry allocations:**
  - command names: `btw`, `/pacman`, `/yay`, `/paru`, `/dotfiles`, `/aur`
  - protocol fields: none
**Port offset:** base
**Max LOC added:** 400

#### Goal
Cultural surface: pacman/yay command stubs, `btw` easter egg, `/dotfiles` link out, GRUB / POST text refined to actual Arch boot output, hash-router treating URLs like filesystem paths (`#/~/projects`, `#/~/.config/about`, `#/~/dotfiles`).

#### Prerequisites
- A1, A5 (neofetch render exists for /about path)

#### Changes (in execution order)

**Step 1: Cultural commands**
- File: `js/easter-eggs.js`
- Change: register the six commands listed in Registry allocations.
  - `btw` (bare, no slash) → `i use arch btw.` in `var(--color-arch)`.
  - `/pacman -Syu` → render a 12-line fake pacman update transcript with `:: Synchronizing package databases...`, `[#####] 100%`, `==> Installing...`, ending in `:: Transaction complete.`. Use `Anim.typewriter()` (added in Sprint E10) to type lines progressively.
  - `/yay`, `/paru` → similar transcripts with AUR phrasing.
  - `/dotfiles` → opens (in new tab) `https://github.com/D-ungvari/dotfiles` (or notes "dotfiles repo coming soon" if not yet created).
  - `/aur` → "you don't need yay btw, paru is faster."
- Pattern: existing easter-egg registration in `js/easter-eggs.js`
- Why: cultural shibboleth

**Step 2: GRUB / POST text refinement**
- File: `js/boot.js`
- Change: locate POST and GRUB text strings (already exist post-Sprint E10/E11). Edit copy:
  - GRUB stub: title becomes `Arch Linux`, options `Arch Linux`, `Advanced options for Arch Linux`, `Memory test (memtest86+)`. Three-second countdown to default.
  - systemd lines: edit any obviously-non-Arch service names. Keep `[ OK ]` green / `[FAILED]` red structure (uses `--color-ok`/`--color-fail` from A1).
- Pattern: existing string array
- Why: authenticity

**Step 3: Path-as-URL hash router**
- File: `js/main.js` (or new `js/router.js` exclusive)
- Change: parse `window.location.hash`. If hash matches `#/~/<section>` (e.g. `#/~/projects`, `#/~/.config/about`, `#/~/dotfiles`, `#/~/.config/contact`), execute the matching command on boot. Update hash on command runs.
  - `#/~/projects` → `/projects`
  - `#/~/.config/about` → `/about`
  - `#/~/.config/contact` → `/contact`
  - `#/~/dotfiles` → `/dotfiles`
- Pattern: hash router via `window.addEventListener('hashchange', ...)`
- Why: shareable bookmarkable URLs that look like filesystem paths

**Step 4: HTML `<title>` updates per route**
- File: `js/main.js`
- Change: when route changes, update document title to `~/path — dave` format.
- Why: browser-tab signal

**Step 5: Footer `// btw` Easter egg comment**
- File: `index.html`
- Change: add HTML comment near `</body>`: `<!-- // btw I use arch -->`. Visible to anyone who views source.
- Why: bonus shibboleth

#### Edge cases
- **Initial load with no hash:** default behavior, no command run on boot.
- **Hash with unknown route:** echo `bash: cd: ~/foo: No such file or directory` to terminal.
- **`/dotfiles` URL not real:** fallback to "coming soon" toast.
- **Reduced motion:** typewriter animations on `pacman -Syu` skip; render full transcript instantly.

#### NOT in scope
- Real package installation
- Real git operations
- Adding actual dotfiles repo (out of code; Dave can create the repo separately)

#### Acceptance criteria
- [ ] `btw` (no slash, bare command) prints `i use arch btw.` in `--color-arch`
- [ ] `/pacman -Syu` renders fake update transcript with progress bars
- [ ] `/dotfiles` opens new tab to GitHub link (or shows toast)
- [ ] URL `#/~/projects` triggers `/projects` on load
- [ ] Document title updates on route change
- [ ] Source view shows `// btw I use arch` comment
- [ ] Tests passing

#### Test plan
- Update `tests/tests-easter-eggs.js` to cover the six new commands.
- Add: `tests/tests-router.js` — `window.location.hash = '#/~/projects'` triggers correct command.

#### Risk notes
- **Hash router conflicts:** check for existing hash handling. Append, don't replace.

---

## Cross-Cutting Concerns

### New patterns introduced
- **Workspace state model** (`js/workspaces.js`) — first stateful sub-system besides session-store and window-manager. Pattern: module-singleton with observer subscription. Future sub-systems should follow.
- **Polybar-pill component** (`taskbar.js`, possibly extracted to `bar-pills.js`) — reusable strip of segmented stat pills. Future use: extend with more modules without touching core taskbar.
- **Hash-route → command bridge** (`main.js`) — first time the codebase exposes URL state. Pattern: declarative route map. Future shareable URLs go through this.
- **Two-line prompt rendering** (`terminal.js`) — terminal becomes structurally richer; tests should bind to logical roles (`.prompt-top`, `.prompt-bottom`), not single-element assumptions.

### Migration notes
- **Pinned-apps removal** (A4 step 8) is destructive. Commit before, in case rollback. Session-storage `pinnedApps` deleted on first boot post-deploy.
- **Theme name migration** (A1) — legacy `green/amber/blue/matrix` → `catppuccin/gruvbox/tokyonight/catppuccin`. One-time on read.
- **Window state migration** (A4) — legacy `windows` flat array → workspaced `workspaces` map with all legacy items in workspace 1. One-time, then old key dropped.

### Registry updates (consolidated for COORDINATION.md)
| Section | Add |
|---------|-----|
| §2 Shortcuts | `Meta+1..5` / `Ctrl+Alt+1..5` (workspaces); `Meta+T` (toggle tiling) |
| §3 Commands | `/neofetch`, `/fastfetch`, `/pacman`, `/yay`, `/paru`, `/dotfiles`, `/aur`, `/vim`, `/nvim`, `:q`, `:q!`, `:wq`, bare `btw` |
| §4 Storage | `workspaces` (NEW); REMOVED: `pinnedApps` |
| §5 Constants | `--color-arch`, `--color-ok`, `--color-fail`, `--color-warn`, `--font-mono`, `--bar-pill-gap`, `--window-gap`, `--window-border-focus`, `--window-border-blur`, `WORKSPACE_COUNT` |
| §6 Animation | `Anim.slideOut` (NEW) |
| §7 Ownership | `js/workspaces.js` (NEW), `js/neofetch.js` (NEW), `js/taskbar.js` (rewrite for polybar) |

### GAPS resolution
- **G04** — Workspace switcher: RESOLVED by A4

### Testing strategy
- Each task has its own test file or extends an existing one. Task acceptance includes test pass.
- Add a single `tests/tests-arch.js` that runs after all others, asserting end-to-end visual identity: cyan brand var, polybar pill count, neofetch render present, two-line prompt, ≥5 workspace pills.

### Files added (summary)
- `js/workspaces.js` (A4)
- `js/neofetch.js` (A5)
- `css/workspaces.css` (A4)
- `css/neofetch.css` (A5)
- (optionally) `js/bar-pills.js` (A2 extraction if needed)

### Files removed (summary)
- `js/pinned-apps.js` (A4)
- `css/apps.css` pinned-apps section (A4)
- pinned-apps tests (A4)

---

## Architecture Model (snapshot)

### Boot flow (unchanged; surface re-skinned in A1, A7)
`index.html` → `main.js` `DOMContentLoaded` → `login-screen.js` (visit count check) → `boot.js` (POST → GRUB → systemd) → `desktop.js` (mount wallpaper, parallax, icons, widgets) → `taskbar.js` (mount bar) → `terminal.js` (mount terminal pane). Sequence is script-tag-load-order in `index.html`.

### Window lifecycle (unchanged)
`Window.open(opts)` returns handle → state stored in `window-manager.js` internal map + persisted to session-storage `windows` key. Drag/resize/snap/persist all in `window-manager.js`. After A4: also registers in `Workspaces.map[currentWorkspace]`.

### Theme system (refactored in A1)
`themes.js` exports `themes` map and `applyTheme(name)`. `applyTheme` writes `--color-*` CSS vars on `document.documentElement`. Persisted in localStorage `portfolio-theme`. After A1: legacy theme names migrate.

### Command system (extended)
`commands.js` exports `registerCommand(name, desc, handler, hidden)` and `executeCommand(input, terminal)`. `~97` callable. Easter eggs in `easter-eggs.js`, project commands in `projects.js`, theme commands in `themes.js`/`os-commands.js`, lore commands in `lore.js`, app commands in `app-commands.js`. After A4/A7: `+15` (workspace shortcuts route through Shortcuts API, not commands; `pacman/yay/paru/dotfiles/btw/vim/nvim/aur/neofetch/fastfetch/:q/:q!/:wq` add ~12).

### Session-storage schema
| Key | Owner | Notes |
|---|---|---|
| `theme` | themes.js | renamed values post-A1 |
| `windows` | window-manager.js | LEGACY post-A4 (migrated to `workspaces`) |
| `workspaces` | workspaces.js | NEW (A4) |
| `terminalHistory` | terminal.js | unchanged |
| `visitCount` | login-screen.js | unchanged |
| `settings` | quick-settings.js | unchanged |
| `widgets` | widgets.js | unchanged |
| `pinnedApps` | pinned-apps.js | REMOVED post-A4 |
| `lang` | lore.js | unchanged |
| `cwd` | fs.js | unchanged |
| `bsodSeen` | bsod.js | unchanged |

### Z-index layers (unchanged)
Defined in `js/desktop-layer.js`. No new layers introduced; existing reservations sufficient.

### Test infrastructure
`tests/run-tests.js` loads N production scripts via jsdom, executes test files in order. Tasks update the load list when adding/removing JS files. After A4: drop `pinned-apps.js`; add `workspaces.js`. After A5: add `neofetch.js`.

### Coupling hotspots
1. **`js/window-manager.js` (1068 LOC)** — A3 (chrome-only) + A4 (workspaceId field, hide/show). Strict no-touch on drag/resize/snap/persist.
2. **`js/taskbar.js` (229 LOC)** — A2 (rewrite layout) + A4 (workspace pills). Serial: A2 first establishes structure, A4 fills.
3. **`css/tokens.css`** — A1, A2, A3, A4 each add tokens. Append-only; never edit existing.
4. **`.sdlc/plans/COORDINATION.md`** — every task updates §5/§7 + Change Log. Append-only; never reorder.

### Constraints
- No build step (vanilla JS — script-tag load order is the dependency mechanism)
- No new runtime deps (CDN-only fonts; no npm packages)
- All animations respect `prefers-reduced-motion` via `Anim.reduced()`
- Tests run headlessly via `node tests/run-tests.js` (jsdom)
- Vanilla CSS variables; no preprocessor
