# 004 - A4 Workspaces And Tiling

Date: 2026-05-01

## Summary
- Added `js/workspaces.js` with 5 workspace slots, observer state, session persistence, shortcut registration, and opt-in tiling.
- Added `workspaceId` and `floating` window fields plus `WindowManager.move`, `setWorkspace`, and `showWorkspace`.
- Rendered live polybar workspace pills with active, occupied, and tiling states.
- Added `css/workspaces.css` for workspace hiding and pill indicators.
- Removed the pinned-apps dock script and localStorage key migration path.

## Verification
- `node tests/run-tests.js` -> 667 passing, 0 failing.
