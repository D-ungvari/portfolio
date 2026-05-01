# 006 - A6 Powerline Prompt And Vim Mode

Date: 2026-05-01

## Summary
- Replaced the terminal prompt with a two-line powerline-style prompt.
- Added live cwd and session-stable fake git status segments.
- Added a bottom-right terminal mode indicator that toggles NORMAL/INSERT on input blur/focus.
- Added `/nvim`, `:q`, `:q!`, and `:wq` commands while preserving `/vim` compatibility.

## Verification
- `node tests/run-tests.js` -> 687 passing, 0 failing.
