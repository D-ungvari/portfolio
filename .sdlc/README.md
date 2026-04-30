# SDLC Layout — Portfolio Terminal / DavOS

Convention for this project's SDLC artifacts.

## Files
- `PROGRESS.md` — current phase, last work item, cross-session pickup state
- `BACKLOG.md` — ordered queue + completed table
- `DECISIONS.md` — append-only ADRs

## Dirs
- `plans/` — `/ultraplan` outputs. One file per scope. Frontmatter required.
- `plans/COORDINATION.md` — registry of constants/layers/keyboard shortcuts/command-name reservations shared across plans
- `plans/GAPS.md` — open questions (P0/P1/P2)
- `designs/` — design exploration (lore, art direction, mechanical pitches)
- `recon/` — durable subsystem deep-dives (loaded by future ultraplans instead of re-exploring)
- `log/` — per-backlog-item audit logs (`NNN-slug.md`), append-only
- `archive/` — superseded plans

## Conventions
- Vanilla JS. No build step. Script tag load order in `index.html` is authoritative.
- Tests run via `node tests/run-tests.js` (jsdom, `prefers-reduced-motion: true`).
- New CSS file → register in `index.html` head before JS scripts.
- New JS file → append to `index.html` script list respecting dep order.
- Easter-egg commands: register via `registerCommand(name, '', handler, true)` in `js/easter-eggs.js` (or dedicated module if non-trivial).
- Z-index: never literal. Use `Layer.*` from `js/desktop-layer.js` or CSS var `--layer-*`.
