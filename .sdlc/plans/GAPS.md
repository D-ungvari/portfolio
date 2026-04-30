---
kind: gaps
updated: 2026-04-29
---

# GAPS — open questions blocking execution

| ID | Severity | Question | Raised by |
|---|---|---|---|
| G01 | P2 | Should lock-screen "any password works" stay (current behavior, hidden door open) or become "any non-empty password works after 600ms validation animation" (E02)? Plan currently picks the latter. | improvements-and-eastereggs |
| G02 | P2 | `/snake` (E14) — keep inside terminal pane (canvas overlay) or open as a windowed app? Plan picks terminal overlay (cheaper, fits aesthetic). | improvements-and-eastereggs |
| G03 | P2 | BSOD on boot (E09) — chance 0.001 (~1 in 1000 cold boots) too rare to ever be seen, too hot to ship? Plan keeps 0.001 + manual `/bsod` so testers can trigger it deterministically. | improvements-and-eastereggs |
| G04 | P3 | Workspace switcher (PLAN-OS-V4 C2.6) — explicitly out of scope of this plan; track separately. | improvements-and-eastereggs |
