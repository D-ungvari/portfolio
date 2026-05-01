---
kind: coordination
updated: 2026-05-01
---

# COORDINATION — Portfolio / DavOS

Single source of truth for cross-plan registries. Every plan that allocates a new layer, shortcut, command name, persisted-storage key, or named constant updates this file in the same change.

## §1 Z-index Layer Registry
Defined in `js/desktop-layer.js`. CSS reads via `var(--layer-<name>)` injected at boot.

| Name | Value | Used by |
|---|---|---|
| WALLPAPER | 0 | wallpaper, parallax |
| WIDGETS | 100 | desktop widgets |
| ICONS | 200 | desktop icon grid |
| WINDOWS | 1000 | window-manager (1000–1999 dynamic) |
| TASKBAR | 3000 | taskbar |
| POPOUTS | 4000 | launcher, calendar, quick settings, tray dropdowns |
| CONTEXT_MENU | 5000 | right-click menus |
| NOTIFICATION | 6000 | toast stack, notification log |
| MODAL | 7000 | About, settings modal, confirm dialogs |
| LOCK_SCREEN | 9000 | lock screen overlay |
| BSOD | 9500 | **reserved — unallocated** (planned: improvements-and-eastereggs E09) |

## §2 Keyboard Shortcut Reservations
Registered via `Shortcuts.register(combo, label, group, fn)` in `js/shortcuts.js`.

| Combo | Action | Group |
|---|---|---|
| `Meta+Space` / `Ctrl+Space` | Open launcher | System |
| `Ctrl+\`` | Toggle terminal pane | Layout |
| `F1` | Shortcuts cheatsheet | Help |
| `Meta+ArrowLeft` / `Ctrl+Alt+ArrowLeft` | Snap left half | Windows |
| `Meta+ArrowRight` / `Ctrl+Alt+ArrowRight` | Snap right half | Windows |
| `Meta+ArrowUp` / `Ctrl+Alt+ArrowUp` | Maximize | Windows |
| `Meta+ArrowDown` / `Ctrl+Alt+ArrowDown` | Restore / minimize | Windows |
| `↑↑↓↓←→←→ba` | Konami easter egg | Easter |
| `Ctrl+L` | Clear terminal | Terminal |
| `Tab` | Tab-complete command | Terminal |
| `↑` / `↓` | History prev/next | Terminal |
| `Esc` | Close popout / lock input clear | System |
| `DEL` (during POST) | **reserved** — BIOS SETUP easter egg (improvements-and-eastereggs E11) |
| `Meta+1` … `Meta+5` / `Ctrl+Alt+1..5` | Switch workspace | Workspaces |
| `Meta+T` | Toggle tiling on current workspace | Workspaces |

## §3 Command Name Reservations
Registered via `registerCommand(name, desc, handler, hidden)`. Lower-case match. `/` prefix optional but conventional.

Active commands: see `js/commands.js`, `js/easter-eggs.js`, `js/extras.js`, `js/lore.js`, `js/os-commands.js`, `js/app-commands.js`, `js/projects.js`, `js/themes.js`, `js/matrix.js`. 100+ callable.

**Implemented allocations:**
| Command | Plan | Notes |
|---|---|---|
| `/bsod` | E09 | Manual BSOD trigger |
| `/clippy` | E12 | MS Office Clippy callback |
| `/uname` | E12 | Kernel string |
| `/yes` | E12 | y-loop until any key |
| `/figlet` | E12 | ASCII banner generator |
| `/coffee` | E12 | Brewing animation |
| `/eject` | E12 | CD tray notification |
| `/su` | E12 | Permission denied variant |
| `dave` | E12 | Bare-name greeting |
| `/snake` | E14 | Canvas snake game |
| `/pacman`, `/yay`, `/paru`, `/aur` | A7 | Fake pacman/AUR transcript commands |
| `/dotfiles` | A7 | Opens external GitHub dotfiles repo in browser; guarded in jsdom tests |
| `btw` (bare) | A7 | `i use arch btw.` cultural surface |

## §4 Session-Storage Keys
`Session.set(key, value)` in `js/session-store.js`.

| Key | Type | Owner |
|---|---|---|
| `theme` | string | themes.js |
| `windows` | array | window-manager.js |
| `terminalHistory` | array | terminal.js |
| `visitCount` | number | login-screen.js |
| `settings` | object | quick-settings.js |
| `widgets` | object | widgets.js |
| `lang` | string | lore.js |
| `cwd` | string | fs.js |
| `bsodSeen` | boolean | **reserved** E09 — gates one-time boot panic chance |
| `workspaces` | object | workspaces.js - workspace map, current workspace, per-workspace tiling |

## §5 Named Constants
Cross-cutting magic numbers. Define in their owning module; reference here.

| Constant | Value | Owner |
|---|---|---|
| `IDLE_DIM_MS` | 5 * 60 * 1000 | idle.js |
| `IDLE_LOCK_MS` | 10 * 60 * 1000 | idle.js |
| `TOAST_DEFAULT_TTL_MS` | 4000 | notify.js |
| `BOOT_POST_MS` | ~800 | boot.js |
| `BOOT_SYSTEMD_MS` | ~800 | boot.js |
| `WINDOW_OPEN_MS` | 180 | window-manager.js / anim.js |
| `WINDOW_CLOSE_MS` | 140 | window-manager.js |
| `WINDOW_MINIMIZE_MS` | 140 | window-manager.js / anim.js |
| `WINDOW_GENIE_MS` | 280 | anim.js (legacy only) |
| `BSOD_BOOT_CHANCE` | 0.001 | **reserved** E09 |
| `TASKBAR_THUMB_HOVER_DELAY_MS` | 200 | **reserved** E08 |
| `--color-arch` | `#1793D1` | tokens.css (A1) - Arch brand cyan, theme-invariant |
| `--color-ok` | `#a6e3a1` | tokens.css (A1) - `[ OK ]` green |
| `--color-fail` | `#f38ba8` | tokens.css (A1) - `[FAILED]` red |
| `--color-warn` | `#f9e2af` | tokens.css (A1) - warning yellow |
| `--font-mono` | `'JetBrains Mono', 'Iosevka', 'Fira Code', ui-monospace, monospace` | tokens.css (A1) |
| `--bar-pill-gap` | `6px` | tokens.css (A2) - polybar pill spacing |
| `--window-gap` | `12px` | tokens.css (A3/A4) - tiling gaps |
| `--window-border-focus` | `2px solid var(--color-arch)` | tokens.css (A3) |
| `--window-border-blur` | `1px solid var(--color-border)` | tokens.css (A3) |
| `WORKSPACE_COUNT` | 5 | workspaces.js |

## §6 Animation Primitive Inventory
`js/anim.js`. New animations register here.

`scaleIn`, `scaleOut`, `fadeIn`, `fadeOut`, `crossfade`, `shake`, `pulse`, `flyTo`, `genie`, `ungenie`, `slideIn`, `slideOut`. All Promise-returning. All check `Anim.reduced()`.

Reserved additions: `Anim.glitch()` (E09 — pre-BSOD distortion), `Anim.typewriter()` (E11 — GRUB countdown).

## §7 File Ownership
| File | Owner plan / module |
|---|---|
| `js/easter-eggs.js` | shared, additive only — append commands w/o reordering existing |
| `js/boot.js` | core — coordinate carefully (E10 + E11 both extend) |
| `js/widgets.js` | extensions add new widget modules instead of editing core |
| `js/desktop-layer.js` | append-only — never reorder existing layers |
| `js/taskbar.js` | arch-linux-redesign A2 - polybar layout and pill renderer |
| `js/window-manager.js` | core — A3 chrome-only, A4 workspaceId field. Drag/resize/snap/persist OFF-LIMITS to redesign tasks |
| `css/window-manager.css` | arch-linux-redesign A3 - i3-minimal chrome and slide-fade styling |
| `js/workspaces.js` | arch-linux-redesign A4 - workspace state and tiling |
| `css/workspaces.css` | arch-linux-redesign A4 - workspace visibility and pill indicators |
| `js/neofetch.js` | arch-linux-redesign A5 - `/about`, `/neofetch`, `/fastfetch` renderer |
| `css/neofetch.css` | arch-linux-redesign A5 - neofetch terminal layout |
| `js/router.js` | arch-linux-redesign A7 - hash-route to terminal command bridge |
| `js/themes.js` | shared — A1 replaces palette set; engine code unchanged |
| `css/tokens.css` | append-only across plans — A1/A2/A3/A4 each add tokens, never edit existing |

## Change Log
- 2026-04-29 — initial registry, captures v4 ship state. Reserves BSOD layer/command/constant for E09; DEL hotkey for E11; widget/notification/storage hooks for in-flight plan.
- 2026-05-01 — arch-linux-redesign plan (A1–A7). Reserves: brand color tokens (`--color-arch` `#1793D1`, `--color-ok`, `--color-fail`, `--color-warn`); font token (`--font-mono`); polybar/window/tiling layout tokens (`--bar-pill-gap`, `--window-gap`, `--window-border-focus`, `--window-border-blur`); `WORKSPACE_COUNT=5`. Reserves `Meta+1..5`/`Ctrl+Alt+1..5`/`Meta+T` for workspaces. Reserves command names: `/neofetch`, `/fastfetch`, `/pacman`, `/yay`, `/paru`, `/aur`, `/dotfiles`, bare `btw`, `/vim`, `/nvim`, `:q`, `:q!`, `:wq`. Reserves session key `workspaces`; marks `pinnedApps` REMOVED post-A4. Reserves `Anim.slideOut`. Marks `js/taskbar.js` for rewrite by A2; locks drag/resize/snap/persist code paths in `window-manager.js` off-limits to redesign tasks.
- 2026-05-01 - A1 (arch-linux-redesign): replaced palette set (`green`/`amber`/`blue`/`matrix` -> `catppuccin`/`gruvbox`/`tokyonight`/`nord`). Added brand + status color tokens. Default theme now `catppuccin`.
- 2026-05-01 - A2 (arch-linux-redesign): replaced Mac menu bar with polybar layout. Workspace pill left, focused title center, system-stat pills right. Removed theme dropdown and About panel from bar.
- 2026-05-01 - A3 (arch-linux-redesign): replaced traffic-light window controls with i3-style `[X]`, added focus/blur border tokens, and switched minimize/restore to slide-fade via `Anim.slideOut`.
- 2026-05-01 - A4 (arch-linux-redesign): shipped 5 workspaces, `Meta+1..5`/`Ctrl+Alt+1..5` switching, `Meta+T` opt-in tiling, `workspaces` session state, and removed the pinned-apps dock.
- 2026-05-01 - A5 (arch-linux-redesign): routed `/about`, `/neofetch`, `/fastfetch`, `/banner`, and boot welcome through the Arch neofetch renderer.
- 2026-05-01 - A6 (arch-linux-redesign): replaced the terminal prompt with a two-line powerline prompt, added the vim mode indicator, and registered `/nvim`, `:q`, `:q!`, and `:wq`.
- 2026-05-01 - A7 (arch-linux-redesign): added pacman/AUR commands, bare `btw`, `/dotfiles`, Arch boot copy, and a hash-route bridge for path-style URLs.
