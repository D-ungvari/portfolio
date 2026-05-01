# Architecture Decisions — Portfolio Terminal

## ADR-001: Vanilla JS, no build step
**Date:** 2026-03-14
**Status:** Accepted
**Context:** Portfolio needs to be simple, fast to load, and easy to deploy.
**Decision:** No frameworks, no bundler, no npm runtime deps. Just HTML/CSS/JS loaded via script tags.
**Consequences:** No module imports, global scope for all scripts, load order matters. Trade-off is simplicity vs scalability — fine for a portfolio.

## ADR-002: CSS custom properties for theming
**Date:** 2026-03-14
**Status:** Accepted
**Context:** Theme switching needs to update colors globally.
**Decision:** All colors use CSS custom properties (--color-primary, etc). JS theme switcher updates these on document.documentElement.
**Consequences:** Themes work instantly without class toggling. localStorage persists choice.

## ADR-003: Game overlay via iframe (not new tab)
**Date:** 2026-03-15
**Status:** Accepted
**Context:** User wanted games to feel integrated into the portal, not a redirect.
**Decision:** /play command loads games in a full-screen iframe overlay with ESC to close.
**Consequences:** Same-origin requirement (all on github.io). Terminal state preserved underneath. Added game-overlay.js and game-overlay.css.

## ADR-004: Command registry pattern
**Date:** 2026-03-14
**Status:** Accepted
**Context:** Need extensible command system where adding a project = adding one object.
**Decision:** Global commandRegistry object. registerCommand(name, desc, handler, hidden). Projects auto-register from array.
**Consequences:** /help auto-generates from registry. Hidden commands don't show in help. Easy to extend.

## ADR-005: i3-minimal window chrome
**Date:** 2026-05-01
**Status:** Accepted
**Context:** The Arch redesign removes Mac traffic-light affordances and dock-target minimize behavior.
**Decision:** Windows render a thin i3-style titlebar with a single `[X]` close button. Minimize/restore remain available through keyboard/API paths and use slide-fade animation primitives instead of genie-to-dock geometry.
**Consequences:** Window chrome is visually aligned with polybar/i3. Legacy `Anim.genie` remains exported for compatibility, but `window-manager.js` no longer calls it.

## ADR-006: Workspace state and dock removal
**Date:** 2026-05-01
**Status:** Accepted
**Context:** Tiling-WM navigation depends on numbered workspaces, while the old pinned-apps dock kept a Mac metaphor alive.
**Decision:** Add a `workspaces` session key with 5 workspace slots, active workspace, and per-workspace tiling state. Keep the legacy `windows` array for restore compatibility, but add `workspaceId` to each window. Remove `js/pinned-apps.js` and its script tag.
**Consequences:** Polybar workspace pills replace dock navigation. Legacy window restore still works, and old `pinnedApps` localStorage data is dropped during session migration.

## ADR-007: Hash-route command bridge
**Date:** 2026-05-01
**Status:** Accepted
**Context:** The Arch redesign needs path-like URLs without adding a routed SPA framework or duplicating command behavior.
**Decision:** Add `js/router.js` as a small hash-route bridge that maps known `#/...` paths to terminal commands and updates the document title. Terminal commands may also push matching hash paths after execution.
**Consequences:** URLs like `#/~/projects`, `#/~/.config/about`, and `#/~/dotfiles` deep-link into the existing command surface. Unknown path hashes render a shell-style path error in the terminal.
