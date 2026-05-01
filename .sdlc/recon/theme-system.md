---
subsystem: Theme system and visual tokens
last_verified: 2026-05-01
created_for: A1 arch-linux-redesign palette + font + brand foundation
files_in_scope: css/tokens.css, css/reset.css, js/themes.js, js/session-store.js, js/boot.js, js/lore.js, js/quick-settings.js, js/os-commands.js, data/man.json, data/tour.json, tests/tests-v2.js, tests/tests-v3.js, tests/tests-v4.js, tests/tests-v7.js, tests/tests-v8.js, tests/tests-os.js, tests/index.html
---

## Recon: Theme system and visual tokens

**Codebase patterns:** Vanilla globals. `themes.js` defines `themes`, `currentTheme`, `applyTheme()`, `loadSavedTheme()`, and registers `/theme` command variants at script load. Tests execute scripts in production order through `tests/run-tests.js`; `main.js` is skipped by tests.

### Files in scope
| File | Purpose | Key patterns |
|------|---------|--------------|
| `css/tokens.css` | Production CSS custom-property source | Root-level token block consumed by component CSS |
| `css/reset.css` | Earlier global defaults | Duplicates core color/font defaults before `tokens.css` loads |
| `js/themes.js` | Theme palette data + theme commands | Theme object shape must remain stable for `applyTheme()` and menu renderers |
| `js/session-store.js` | Session defaults | Default `theme` key should match current theme names |
| `js/boot.js` | Boot output reads `currentTheme` | Has fallback theme name for systemd lines |
| `js/lore.js` | Embedded fallback data + theme tagline | Demo tour and manpage fallback hardcode theme names |
| `js/quick-settings.js` | Theme picker fallback | Uses `Object.keys(themes)` when available |
| `js/os-commands.js` | `/wallpaper` alias | Registers one command per theme key |
| `data/man.json`, `data/tour.json` | Fetch-backed content mirrors lore fallback | Must not reference removed theme names |
| `tests/tests-v2.js`, `tests/tests-v3.js`, `tests/tests-v4.js`, `tests/tests-v7.js`, `tests/tests-v8.js`, `tests/tests-os.js`, `tests/index.html` | Theme assertions and harness tokens | Update old theme-name expectations |

### Architecture context
- Theme state is persisted to `localStorage['portfolio-theme']`; A1 needs a read-time migration for `green`, `amber`, `blue`, and `matrix`.
- `/theme <name>` and `/wallpaper <name>` command variants are generated at script load from `Object.keys(themes)`.
- Some content modules execute fallback tour steps by calling `applyTheme(s.name)`; stale theme names become silent no-ops.
- Tests do not load production CSS files, so root token assertions need the harness token style updated or must assert JS-set inline properties.

### Adjacent files (DO NOT MODIFY)
- `js/taskbar.js` and `css/taskbar.css`: A2 owns the polybar rewrite.
- `js/window-manager.js` and `css/window-manager.css`: A3/A4 own chrome and workspaces.
- `js/pinned-apps.js` and dock CSS: A4 owns removal.

### Existing test coverage
- Theme data, command registration, CSS custom-property writes, `/wallpaper`, tour/demo safety, command registry stress, and script-order coverage are already present.
- A1 should add direct coverage for legacy localStorage migration and `--color-arch`.

### Changelog
- 2026-05-01: Initial recon for A1.
