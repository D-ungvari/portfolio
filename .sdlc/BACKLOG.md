# Backlog — Portfolio Terminal / DavOS

> Items worked top-to-bottom. Move completed items to the bottom section.
> Sprint E (improvements + easter eggs) is governed by `.sdlc/plans/improvements-and-eastereggs.md`.

## Queue

### E01. chore: SDLC hygiene + test runner script coverage
**Type:** chore  **Complexity:** S  **Plan:** improvements-and-eastereggs (Task E01)
Sync PROGRESS / BACKLOG to v4 ship state, fix `package.json` test count, load 12 missing scripts in `tests/run-tests.js`, archive PLAN-OS-V*.md.

### E02. fix: Lock screen — honest password input
**Type:** fix  **Complexity:** S  **Plan:** Task E02
Replace any-key-unlocks with focused password input, validation animation, honest hint text.

### E03. feat: Lasso selection wired to group-drag
**Type:** feat  **Complexity:** M  **Plan:** Task E03
Wire `lasso.js` to apply `.selected`, enable group drag, Esc/Ctrl+A bindings.

### E04. feat: Files app — text viewer subapp for `.txt` / `.md`
**Type:** feat  **Complexity:** M  **Plan:** Task E04
Ship PLAN-OS-V4 C5.2: double-click text files in Files app opens a viewer window.

### E05. feat: Notification Center slide-out panel
**Type:** feat  **Complexity:** M  **Plan:** Task E05
Replace dropdown log with right-edge 360×500 slide-out, Today/Earlier groups, DND toggle, Clear All.

### E06. polish: Cursor context audit
**Type:** polish  **Complexity:** S  **Plan:** Task E06
PLAN-OS-V4 C6.1 — apply `move`, `text`, `grabbing`, `not-allowed`, `wait` cursors per context.

### E07. polish: Resize handle hover affordance
**Type:** polish  **Complexity:** S  **Plan:** Task E07
Theme-color highlight on the 8 resize zones via CSS.

### E08. feat: Taskbar thumbnail tooltip on hover
**Type:** feat  **Complexity:** S  **Plan:** Task E08
PLAN-OS-V4 C2.3 — 200 ms delay → 160×100 themed card with window title + icon.

### E09. feat: BSOD easter egg — `/bsod` + 1-in-1000 boot panic chance
**Type:** feat  **Complexity:** S  **Plan:** Task E09
Activate the long-reserved `Layer.BSOD = 9500`. Manual + rare boot trigger; one-time per visitor.

### E10. feat: GRUB bootloader stub
**Type:** feat  **Complexity:** S  **Plan:** Task E10
PLAN-OS-V4 C7.2 — GRUB frame with countdown between POST and systemd. Adds `Anim.typewriter` primitive.

### E11. feat: BIOS SETUP fake menu (DEL during POST)
**Type:** feat  **Complexity:** S  **Plan:** Task E11  **Depends on:** E10
PLAN-OS-V4 C7.1 — DEL opens 4-tab fake BIOS UI; ESC exits.

### E12. feat: Batch — 9 new easter-egg commands
**Type:** feat  **Complexity:** S  **Plan:** Task E12
`/clippy`, `/uname`, `/yes`, `/figlet`, `/coffee`, `/eject`, `/su`, bare `dave`, `/sudo make me a sandwich`. Adds prefix-match dispatch.

### E13. feat: `/htop` interactive kill simulation
**Type:** feat  **Complexity:** S  **Plan:** Task E13
Promote static htop to interactive overlay — arrow nav, `k` to kill, auto-respawning processes.

### E14. feat: `/snake` canvas game
**Type:** feat  **Complexity:** M  **Plan:** Task E14
Tiny playable Snake on the terminal pane, theme-colored, persistent best score.

### E15. feat: Pong desktop widget — hidden 4th in Add Widget
**Type:** feat  **Complexity:** M  **Plan:** Task E15
PLAN-OS-V4 C4.2 — self-playing Pong widget; mouse-takeover on hover. Unlocked by Konami or `/pong`.

### E16. feat: Konami repeat handling + secondary chains
**Type:** feat  **Complexity:** XS  **Plan:** Task E16
Drop one-shot guard. Count 2 → flicker + dry message. Count 3 → unlocks transient `recovery` shell command.

### Retained from prior sprint
**ASCII art project screenshots** — Type: feat  Complexity: M
Add small ASCII previews per project in `/projects` and detail views.

### Future (out of Sprint E scope)
- **Workspace switcher** (PLAN-OS-V4 C2.6, GAPS G04) — animated 3-workspace switching
- **VISION.md** — codify product-owner layer; current de-facto vision lives in `PLAN.md` + archived `PLAN-OS-V*.md`

---

## Completed
| # | Title | Type | Completed | Commit |
|---|-------|------|-----------|--------|
| E01–E16 | Sprint E — improvements + easter eggs | feat/fix/polish | 2026-04-30 | (uncommitted) |
| — | Initial build: full terminal portfolio | feat | 2026-03-14 | bc89e87 |
| — | v2 features: themes, matrix, aliases, skills, history | feat | 2026-03-14 | bc89e87 |
| — | v3: easter eggs, 404 page, konami, CI/CD | feat | 2026-03-14 | bc89e87 |
| — | v4: /play command, Ctrl+L, README | feat | 2026-03-14 | bc89e87 |
| — | CV info update, game iframe overlay, idle matrix | feat | 2026-03-15 | c0e1c65 |
| — | Fix platform-shooter URL (client/ subdir) | fix | 2026-03-15 | 53f5cea |
| 1 (was) | Custom 404 routing for GitHub Pages | feat | shipped in initial build | — |
| 2 (was) | `/resume` command | feat | shipped in v3 (`js/extras.js:94`) | bc89e87 |
| — | Swarm Command RTS to projects list | feat | 2026-04-?? | 1054070 |
| — | DavOS v4 visual fidelity pass + DaveOS → DavOS rebrand | feat | 2026-04-?? | d6fb938 |
| — | Accept HH:MM:SS clock format (v4 added seconds) | test | 2026-04-?? | 4126f1c |
| — | Fix Anim post-effects clobbering window transform positioning | fix | 2026-04-?? | 22c14e1 |
