# 003 - A3 i3 Window Chrome

Date: 2026-05-01

## Summary
- Replaced Mac traffic-light window controls with a single i3-style `[X]` close button.
- Added focus/blur border and window gap tokens for the Arch redesign.
- Swapped minimize/restore from genie-to-dock animation to slide-fade via `Anim.slideOut` and `Anim.fadeIn`.
- Updated window-manager CSS to use minimal titlebars, Arch-cyan focus rings, and hidden legacy taskbar app strips.

## Verification
- `node tests/run-tests.js` -> 660 passing, 0 failing.
