# Progress — Portfolio Terminal / DavOS

> Last updated: 2026-05-01
> Last session: Ran `/dev A7` for arch-linux-redesign cultural commands and hash-route paths.

## Current Work Item
None — Phase 3 Arch Linux redesign shipped. All 7 tasks A1–A7 complete, 700 tests passing.

## Phase: IDLE

### Test status
`node tests/run-tests.js` -> **700 passing, 0 failing** after A7.

### Phase 3 — Arch Linux redesign (shipped)
| # | Task | Notes |
|---|------|-------|
| A1 | Palette + font + brand foundation | Complete. Default theme is Catppuccin; available themes are Catppuccin, Gruvbox, Tokyo Night, Nord. Added `--color-arch` `#1793D1`, status tokens, `--font-mono`, and legacy theme migration. |
| A2 | Polybar-style status bar | Complete. Bar now has workspace placeholder left, active window title center, and system-stat pills right. Removed bar theme dropdown and About panel. |
| A3 | i3-minimal window chrome | Complete. Window titlebars now use one `[X]` close button, Arch-cyan focus borders, and slide-fade minimize/restore. |
| A4 | Workspace switcher + opt-in tiling | Complete. Five workspace pills, `Meta+1..5`/`Ctrl+Alt+1..5`, `Meta+T` tiling, `workspaces` session state, and pinned-apps dock removal. |
| A5 | Neofetch `/about` + Arch ASCII | Complete. `/about`, `/neofetch`, `/fastfetch`, `/banner`, and boot welcome now render the Arch neofetch profile. |
| A6 | Powerline prompt + vim mode | Complete. Terminal input now uses a two-line powerline prompt, live cwd/git segments, focus-driven mode indicator, and vim/nvim gag commands. |
| A7 | Pacman + btw + dotfiles + path URLs | Complete. Added pacman/AUR transcripts, `btw`, `/dotfiles`, Arch-flavored boot text, hash-route command bridge, and path-style URLs. |

### Sprint E — completed (this session)
| # | Task | Notes |
|---|------|-------|
| E01 | SDLC hygiene + test runner | Loaded 12 missing scripts in jsdom (anim, desktop-layer, lasso, launcher, lock-screen, login-screen, parallax, pinned-apps, quick-settings, tray-popouts, widgets, apps/files). Parity check enforces drift. main.js skipped (constructs real Terminal). Window-manager close/minimize bypass Anim under reduced-motion (sync). PLAN-OS-V*.md archived under `.sdlc/archive/`. |
| E02 | Lock screen honest password | Shake on empty submit. 600 ms auth animation. Esc clears input. |
| E03 | Lasso multi-select | Persistent `.lasso-selected`, Ctrl+A, Esc clear, group-drag visual. |
| E04 | Files text viewer | Right-click context menu (Open / Open in viewer / Properties). FS .secrets folder fleshed out. Note: TextViewer infra was already partly shipped — this finished the wiring. |
| E05 | Notification Center | Right-edge slide-out 360x500, Today/Earlier groups, DND toggle (persisted), Clear All. Defensive `visible[]` cleanup. |
| E06 | Cursor context audit | `body.dragging`, `body.resizing-*`, `body.busy` global cursor classes. Iframe loading state. |
| E07 | Resize hover affordance | Theme-color highlight on 8 resize zones via CSS. |
| E08 | Taskbar thumbnail tooltip | 200ms delay, 160x100 themed card with app glyph + title. |
| E09 | BSOD easter egg | `/bsod` command + 1-in-1000 boot panic. Layer.BSOD activated. Glitch animation (bypassed under reduced-motion). |
| E10 | GRUB bootloader stub | 250ms-tick countdown 3→2→1 between POST and systemd. `Anim.typewriter` primitive added. |
| E11 | BIOS SETUP | DEL during POST opens 4-tab fake BIOS UI. Esc returns to GRUB. `BootDebug.renderBiosSetup` test hook. |
| E12 | 9 new easter eggs | `/uname` `/su` `/eject` `/coffee` `dave` `/clippy` `/yes` `/figlet <text>` `/sudo make me a sandwich`. Prefix-match dispatcher added (`registerCommandPrefix`). |
| E13 | Interactive /htop | Static snapshot (test compat) + overlay with arrow nav, k-to-kill, auto-respawning processes, Esc to exit. |
| E14 | /snake game | Canvas-based Snake on terminal pane. Theme-color, persistent best score. Reduced-motion fallback. |
| E15 | Pong widget | Hidden 4th in widget builders. Self-playing AI; mouse-takeover on hover. Unlocked by Konami or `/pong`. |
| E16 | Konami chain | Count 1: original + Pong unlock. Count 2: glitch + dry message. Count 3: notification + transient `recovery` shell with help/whoami/exit. |

### Pre-Sprint-E completions
| Item | Completed | Commit |
|------|-----------|--------|
| Initial build through v4 | 2026-03 / 2026-04 | bc89e87, c0e1c65, 53f5cea, 1054070, ca9873f, d6fb938, 4126f1c, 22c14e1 |

## Next session
Phase 4 (content + recruiter polish) — ASCII art project tiles, `/experience` + `/resume` polish, real dotfiles repo, README screenshot, Lighthouse a11y, GitHub Pages deploy.
