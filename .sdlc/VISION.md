---
kind: vision
created: 2026-05-01
updated: 2026-05-01
owner: Dave Ungvari
---

# VISION — Portfolio Terminal / DavOS

> Product-owner layer. Defines **why**, **who-for**, **pillars**, **non-goals**, and **phase roadmap with DoD per phase**. Every plan in `.sdlc/plans/` advances ≥1 DoD bullet here. Plans never edit this file — propose diffs.

---

## Why

A developer portfolio that is **itself the work sample**. Visiting it should be the interview's first signal: this person ships, has taste, codes for keyboard-first developers, and has cultural fluency in the Linux/dotfile ecosystem. Static CVs and Notion pages are commodity; an interactive Arch-styled terminal-WM is a self-evident demo of frontend craft, attention to detail, and cultural alignment with the target audience.

## Who-for (audience, in priority order)

1. **Senior dev / staff eng / EM hiring managers in Copenhagen Linux/devops/backend orgs.** Recognize i3, polybar, neofetch, gruvbox, `btw I use arch`. Glance → 5s decision: "this person is one of us."
2. **Recruiters screening for Copenhagen full-stack roles.** Don't recognize the references but should still find the path to projects/CV/contact in <30s.
3. **Other developers (peers, GitHub visitors).** r/unixporn-style aesthetic appeals; might share or star.

**Anti-audience:** Mac-only design-focused recruiters, executives expecting a glossy product page. Acceptable trade — Copenhagen tech market skews backend/Linux.

## Pillars

### P1 — Tiling-WM Arch dev box, not a desktop OS pastiche
Visual identity reads as a real dev's i3/Hyprland/sway box on first paint: gapped tiling layout, polybar across the top with workspace pills + system stats, i3-minimal window chrome (no traffic lights, thin focus border in Arch-cyan `#1793D1`), neofetch as the about page, dotfile-canon palettes (catppuccin/gruvbox/tokyonight/nord). Recruiter watching for 5s thinks "that's an Arch box."

### P2 — Keyboard-first navigation
Every primary action reachable via keyboard. `Meta+1..5` workspaces, `Meta+T` tiling toggle, `Meta+Space` launcher, `Ctrl+K` palette, `hjkl` focus, `:command` mode. Mouse always works; keyboard always faster.

### P3 — Cultural fluency as taste signal
In-jokes target audience grins at, others don't notice: `btw I use arch`, `pacman -Syu` transcripts, `vim` exit jokes (`:q`, `:wq`), `/dotfiles` link, `// btw I use arch` HTML comment in source. Each joke is a shibboleth — recognition signals "we're the same kind of dev."

### P4 — Vanilla everything, no build step
Zero dependencies, zero bundler, plain `index.html` + script tags + CSS variables. Ships statically to GitHub Pages. Demonstrates that a 7000-LOC interactive shell needs no React or Vite. Acceptance: clone, open `index.html`, it works.

### P5 — Test discipline
≥600 tests in jsdom. New features ship with tests in the same commit. CI/CD via GitHub Actions. Demonstrates that "vanilla" doesn't mean "untested."

### P6 — Content over chrome
Aesthetic frames the work, never replaces it. Project tiles route to live demos in <2 clicks. About / Contact / Resume reachable from anywhere. No animation lasts longer than 300ms. `prefers-reduced-motion` honored everywhere.

## Non-goals

- **Full Linux emulation.** No real bash, no real package install, no real filesystem writes. Authentic surface, not VM.
- **Mobile parity.** Mobile = legible static fallback; no recruiter is screening on phone for senior backend roles. Tablet OK; phone tolerable.
- **Multi-language UI past EN/DA.** Hungarian ≤ welcome message Easter egg.
- **Real-time / multiplayer / accounts.** Static site forever.
- **Framework migration.** Vanilla is the point. Don't rewrite in React / Vue / Svelte.
- **Dark/light theme parity.** Dark only. Dotfile aesthetic doesn't have a light mode.
- **Pixel-identical Mac mode.** "Mac mode" theme acceptable as easter egg, not as default or supported alt.

---

## Phase Roadmap

> ✅ shipped · 🟨 partial · ⬜ pending. Phases sequential; later phases assume earlier shipped.

### Phase 0 — Terminal MVP (✅ shipped, 2026-03)
v1 spec from `PLAN.md`. Single-pane CLI, ~5 commands, boot sequence, easter eggs.

**DoD:**
- ✅ Black-bg green-text terminal renders, accepts input, processes commands
- ✅ `/help`, `/projects`, `/about`, `/contact`, `/clear` work
- ✅ Tab completion + command history
- ✅ Mobile chip fallback
- ✅ Deployed on GitHub Pages

### Phase 1 — DavOS Shell v2/v3/v4 (✅ shipped, 2026-04)
Full desktop OS metaphor: window manager, taskbar, native apps, lock/login, BIOS/POST/GRUB/systemd boot, widgets, lasso, FS, idle/sleep.

**DoD:**
- ✅ Floating window manager with drag/resize/snap/multi/persist
- ✅ Two-stage boot (POST → systemd) with skip + reduced-motion respect
- ✅ Native apps (Settings/Mail/CV/Apps grid/Boring view)
- ✅ Right-pane terminal pane with multi-tab
- ✅ Lock + login screens
- ✅ Themes engine + persistence
- ✅ ≥615 tests passing
- 🟨 "Looks like a Linux box on 5s glance" — partial; surface drifted to Mac metaphors. **Closed by Phase 3.**

### Phase 2 — Sprint E polish + easter eggs (✅ shipped, 2026-04-30)
v4 polish closing rough edges + personality depth. Governed by `.sdlc/plans/improvements-and-eastereggs.md`.

**DoD:**
- ✅ Lock screen honest password input
- ✅ Lasso multi-select wired
- ✅ Files app text viewer
- ✅ Notification Center slide-out
- ✅ Cursor context audit + resize affordance
- ✅ Taskbar thumbnail tooltips
- ✅ BSOD easter egg
- ✅ GRUB stub + BIOS SETUP overlay
- ✅ 9 new easter-egg commands + interactive `/htop` + `/snake` + Pong widget + Konami chains
- ✅ 655 tests passing (was 615)

### Phase 3 — Arch Linux redesign (✅ shipped, 2026-05-01)
Re-skin DavOS shell to tiling-WM Arch dev aesthetic. Governed by `.sdlc/plans/arch-linux-redesign.md` (tasks A1–A7).

**DoD:**
- ✅ **dotfile-palette** — themes are `catppuccin` (default), `gruvbox`, `tokyonight`, `nord`. Phosphor palettes (`green/amber/blue/matrix`) retired or migrated. (A1)
- ✅ **brand-cyan** — `#1793D1` Arch cyan available as theme-invariant `--color-arch` token. Used for window focus borders, neofetch logo, brand mark. (A1)
- ✅ **typography** — JetBrains Mono / Iosevka / Fira Code via `--font-mono`, single source of truth. (A1)
- ✅ **polybar-bar** — top bar is i3bar/polybar layout: workspace pills left, focused-window title center, segmented system-stats pills right (CPU/MEM/NET/kernel/branch/clock). Mac menu bar + theme dropdown + "About this PC" panel removed from bar. (A2)
- ✅ **i3-chrome** — windows have no Mac traffic-lights. Thin 1px border default, 2px Arch-cyan border on focus. Optional 22px title strip with single `[X]` close. Genie minimize replaced with slide-fade. (A3)
- ✅ **workspace-switcher** — 5 numbered workspaces, switchable via `Meta+1..5`, `Ctrl+Alt+1..5`, or pill click. Each workspace holds its own window set. Resolves GAPS G04. (A4)
- ✅ **opt-in-tiling** — `Meta+T` toggles tiling on current workspace. With ≥2 windows, auto-tile in gapped grid (`--window-gap: 12px`). Floating remains default. (A4)
- ✅ **dock-removed** — Mac-style pinned-apps dock at the bottom is gone. `js/pinned-apps.js` deleted. `pinnedApps` session-storage key migrated out. (A4)
- ✅ **neofetch-about** — `/about`, `/neofetch`, `/fastfetch` render canonical Arch pyramid in `--color-arch` + aligned `key: value` system info from persona.json. Boot-screen welcome uses neofetch. (A5)
- ✅ **powerline-prompt** — terminal pane prompt is two-line starship/p10k style: `╭─ user@host  cwd  branch !N ?M` over `╰─λ`. Powerline-pill segments via HTML spans (no Nerd Font dep). (A6)
- ✅ **vim-mode-indicator** — `-- NORMAL --` / `-- INSERT --` badge bottom-right of terminal pane, toggling on focus/blur. (A6)
- ✅ **cultural-commands** — `btw` (bare → `i use arch btw.`), `/pacman -Syu`, `/yay`, `/paru`, `/aur`, `/dotfiles`, `/vim`, `/nvim`, `:q`, `:q!`, `:wq` registered with appropriate gags / transcripts. (A7)
- ✅ **path-as-URL** — hash router treats URLs like filesystem paths. `#/~/projects` runs `/projects` on load; document title updates `~/path — dave`. (A7)
- ✅ **boot-arch-authentic** — GRUB stub titled `Arch Linux`, systemd lines use `--color-ok` green / `--color-fail` red. (A7)
- ✅ **source-shibboleth** — `<!-- // btw I use arch -->` HTML comment near `</body>`. (A7)
- ✅ **tests-green** — ≥655 tests still passing post-redesign. New tests added per task. (all)
- ✅ **5s-glance** — recruiter test: load page, watch for 5s, recognize "that's an Arch box" — recovers DoD bullet missed in Phase 1. (cumulative across A1–A7)

### Phase 4 — Content + recruiter polish (⬜ pending, post-Phase-3)
Land the redesign on substance: project tiles ASCII art, `/experience` + `/resume` polish, screenshots, real `dotfiles` repo link, README screenshot of arch-themed portfolio, deploy + Lighthouse a11y check.

**DoD:**
- ⬜ All 5 project tiles have ASCII art previews in `/projects` detail view
- ⬜ `/experience` command renders timeline with Omada A/S start date, role progression
- ⬜ `/resume` command + downloadable PDF
- ⬜ Real dotfiles repo at `github.com/D-ungvari/dotfiles` linked from `/dotfiles` (or fake-but-plausible content)
- ⬜ README.md updated with arch-themed screenshot
- ⬜ Lighthouse a11y ≥ 95
- ⬜ Deployed to GitHub Pages on `main`

### Phase 5 — Maintenance + cultural drift (⬜ ongoing)
Sustain the codebase. Add easter eggs as inspiration strikes. Update neofetch fields when role/stack changes. Refresh palette options as dotfile fashion evolves.

**DoD (rolling):**
- ⬜ Persona fields (role, location, stack, uptime) reflect current reality
- ⬜ At least 1 new easter-egg command per quarter
- ⬜ Tests stay ≥ baseline; no regressions

---

## Conventions

- **Plans live in `.sdlc/plans/`** and reference DoD bullets in `advances:` frontmatter
- **Designs live in `.sdlc/designs/`** for art-direction / lore exploration before plan
- **Recon lives in `.sdlc/recon/`** for durable subsystem deep-dives
- **Decisions in `.sdlc/DECISIONS.md`** for ADRs (one-liner per decision, append-only)
- **Backlog in `.sdlc/BACKLOG.md`** ordered queue
- **Coordination in `.sdlc/plans/COORDINATION.md`** for cross-plan registries
- **Gaps in `.sdlc/plans/GAPS.md`** for open questions blocking execution

## Editing this file

User-owned. `/ultraplan` and `/dev` propose diffs but never apply unilaterally. Tick `⬜ → ✅` only after the corresponding plan has shipped (tests green, manual smoke check passed). Move full phases to a `## Shipped Phases` archive section once 100% MET to keep this file lean.

## Open vision questions

- Should Phase 4 include a `/blog` command or stay out of scope? (Cost: 1 sprint. Benefit: SEO + ongoing cultural-drift outlet. Lean: defer.)
- Phase 5 cadence — quarterly easter-egg drops, or only when inspired? (Lean: only when inspired; "performative cadence" is the opposite of taste.)
- Hungarian language toggle as Phase 5 item or never? (Lean: never; non-goal stated.)
- Real `dotfiles` repo content — actual Dave dotfiles, or fake/curated? (Lean: actual; the link must hold up to scrutiny from someone who clicks.)
