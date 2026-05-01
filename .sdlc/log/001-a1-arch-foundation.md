# Log: A1 - Palette + font + brand foundation
Started: 2026-05-01T11:26:24+02:00

## SPEC SOURCE
.sdlc/plans/arch-linux-redesign.md#task-A1

## DEV
### Step 1: Recon
- Files: .sdlc/recon/theme-system.md
- Result: done
- Notes: Captured theme engine, CSS tokens, theme commands, saved-theme migration, fallback content, and theme tests.

### Step 2: Tokens and font foundation
- Files: css/tokens.css, css/reset.css, component CSS files
- Result: done
- Notes: Default tokens now Catppuccin Mocha. Added --color-arch, --color-ok, --color-fail, --color-warn, --font-mono, and --color-surface. Replaced hardcoded JetBrains Mono stacks with var(--font-mono).

### Step 3: Theme engine migration
- Files: js/themes.js, js/session-store.js, js/boot.js, js/quick-settings.js, js/extras.js, js/easter-eggs.js, js/snake.js
- Result: done
- Notes: Replaced green/amber/blue/matrix with catppuccin/gruvbox/tokyonight/nord. Added legacy theme-name migration for localStorage and applyTheme input.

### Step 4: Content and tests
- Files: js/lore.js, data/man.json, data/tour.json, tests/index.html, tests/tests-v2.js, tests/tests-v3.js, tests/tests-v4.js, tests/tests-v7.js, tests/tests-v8.js, tests/tests-os.js
- Result: done
- Notes: Updated hardcoded theme names in tour/man fallback data and theme assertions. Added tests for legacy migration and --color-arch.

### Step 5: Registry
- Files: .sdlc/plans/COORDINATION.md
- Result: done
- Notes: Marked A1 constants as implemented and appended A1 change-log entry.

## TEST
- Command: node tests/run-tests.js
- Result: PASS (658 passing, 0 failing)

## VERIFY
- Type-check: not applicable (vanilla JS, no build/type step)
- Self-review findings: Broad font-family rewrite stayed limited to CSS monospace stacks; boring-mode Helvetica stacks were left intact. Existing user-owned dirty files remain present.
- Registry updates: COORDINATION.md §5 Named Constants and Change Log
- Critic: skipped; no .claude/commands/critic.md exists in this project
