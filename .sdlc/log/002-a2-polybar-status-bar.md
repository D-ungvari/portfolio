# Log: A2 - Polybar-style status bar
Started: 2026-05-01T11:47:00+02:00

## SPEC SOURCE
.sdlc/plans/arch-linux-redesign.md#task-A2

## DEV
### Step 1: Taskbar structure
- Files: js/taskbar.js, index.html, tests/index.html
- Result: done
- Notes: Replaced Mac-style menu bar structure with bar-left workspace placeholder, bar-center active title, and bar-right stat strip.

### Step 2: System stats
- Files: js/taskbar.js, css/taskbar.css, css/tokens.css
- Result: done
- Notes: Added CPU/MEM random-walk stats, NET/KERNEL/BRANCH static pills, and YYYY-MM-DD HH:MM:SS clock pill. Added --bar-pill-gap.

### Step 3: Remove menu/about bar affordances
- Files: js/taskbar.js, css/taskbar.css, tests/tests-os.js
- Result: done
- Notes: Removed taskbar theme dropdown and About panel code. Theme switching remains available through `/theme <name>` and quick settings.

### Step 4: Active-window title hook
- Files: js/window-manager.js, js/taskbar.js, tests/tests-os.js
- Result: done
- Notes: Added WindowManager.activeTitle() and WindowManager.onActiveChange(cb). No drag/resize/snap/persist paths were redesigned.

### Step 5: Launcher compatibility
- Files: js/launcher.js
- Result: done
- Notes: Launcher positioning now anchors to #taskbar-launcher. Quick About action routes through terminal `/about` instead of removed Taskbar.showAbout().

### Step 6: Tests and registry
- Files: tests/tests-v3.js, tests/tests-os.js, .sdlc/plans/COORDINATION.md
- Result: done
- Notes: Migrated tray/menu/about taskbar assertions to polybar assertions and appended A2 registry entry.

## TEST
- Command: node tests/run-tests.js
- Result: PASS (659 passing, 0 failing)

## VERIFY
- Type-check: not applicable (vanilla JS, no build/type step)
- Self-review findings: `#taskbar-running` remains hidden for WindowManager compatibility until A4 removes the old pinned/running app surface. Tray popouts retain clock/network anchors; removed volume/battery/EQ visual tray modules per A2 polybar stat scope.
- Registry updates: COORDINATION.md §5 Named Constants, §7 File Ownership, and Change Log
- Critic: skipped; no .claude/commands/critic.md exists in this project
