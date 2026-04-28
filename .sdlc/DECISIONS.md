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
