---
kind: gaps
updated: 2026-05-01
---

# GAPS — open questions blocking execution

| ID | Severity | Question | Raised by | Status |
|---|---|---|---|---|
| G01 | P2 | Should lock-screen "any password works" stay (current behavior, hidden door open) or become "any non-empty password works after 600ms validation animation" (E02)? Plan currently picks the latter. | improvements-and-eastereggs | open |
| G02 | P2 | `/snake` (E14) — keep inside terminal pane (canvas overlay) or open as a windowed app? Plan picks terminal overlay (cheaper, fits aesthetic). | improvements-and-eastereggs | open |
| G03 | P2 | BSOD on boot (E09) — chance 0.001 (~1 in 1000 cold boots) too rare to ever be seen, too hot to ship? Plan keeps 0.001 + manual `/bsod` so testers can trigger it deterministically. | improvements-and-eastereggs | open |
| G04 | P3 | Workspace switcher (PLAN-OS-V4 C2.6) — explicitly out of scope of this plan; track separately. | improvements-and-eastereggs | **RESOLVED by arch-linux-redesign A4** (5 workspaces, `Meta+1..5`, opt-in tiling via `Meta+T`) |
| G05 | P2 | Should "Mac mode" survive as hidden theme (`/theme darwin`) once arch redesign ships, for users who prefer it? Plan A1 risk register says yes; default arch, easter-egg toggle. | arch-linux-redesign | open |
| G06 | P3 | A4 step 8 chooses to remove pinned-apps dock entirely instead of pivoting to tmux-style footer. Reconsider if tiling looks bare without a bottom strip? | arch-linux-redesign | **RESOLVED by arch-linux-redesign A4** (dock removed; polybar + workspace pills are the navigation surface) |
