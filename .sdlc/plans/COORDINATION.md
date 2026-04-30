---
kind: coordination
updated: 2026-04-29
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

## §3 Command Name Reservations
Registered via `registerCommand(name, desc, handler, hidden)`. Lower-case match. `/` prefix optional but conventional.

Active commands: see `js/commands.js`, `js/easter-eggs.js`, `js/extras.js`, `js/lore.js`, `js/os-commands.js`, `js/app-commands.js`, `js/projects.js`, `js/themes.js`, `js/matrix.js`. ~97 callable.

**Reserved (planned, not yet built):**
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
| `pinnedApps` | array | pinned-apps.js |
| `lang` | string | lore.js |
| `cwd` | string | fs.js |
| `bsodSeen` | boolean | **reserved** E09 — gates one-time boot panic chance |

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
| `WINDOW_GENIE_MS` | 280 | anim.js |
| `BSOD_BOOT_CHANCE` | 0.001 | **reserved** E09 |
| `TASKBAR_THUMB_HOVER_DELAY_MS` | 200 | **reserved** E08 |

## §6 Animation Primitive Inventory
`js/anim.js`. New animations register here.

`scaleIn`, `scaleOut`, `fadeIn`, `fadeOut`, `crossfade`, `shake`, `pulse`, `flyTo`, `genie`, `ungenie`, `slideIn`. All Promise-returning. All check `Anim.reduced()`.

Reserved additions: `Anim.glitch()` (E09 — pre-BSOD distortion), `Anim.typewriter()` (E11 — GRUB countdown).

## §7 File Ownership
| File | Owner plan / module |
|---|---|
| `js/easter-eggs.js` | shared, additive only — append commands w/o reordering existing |
| `js/boot.js` | core — coordinate carefully (E10 + E11 both extend) |
| `js/widgets.js` | extensions add new widget modules instead of editing core |
| `js/desktop-layer.js` | append-only — never reorder existing layers |

## Change Log
- 2026-04-29 — initial registry, captures v4 ship state. Reserves BSOD layer/command/constant for E09; DEL hotkey for E11; widget/notification/storage hooks for in-flight plan.
