# 007 - A7 Arch cultural commands and path URLs

Date: 2026-05-01
Plan: arch-linux-redesign
Task: A7 - Pacman + btw + dotfiles + path URLs

## Summary
- Added Arch cultural terminal commands: `/pacman`, `/pacman -syu`, `/yay`, `/paru`, `/aur`, bare `btw`, and `/dotfiles`.
- Added `js/router.js` to bridge hash paths to terminal commands:
  - `#/~/projects` -> `/projects`
  - `#/~/.config/about` -> `/about`
  - `#/~/.config/contact` -> `/contact`
  - `#/~/dotfiles` -> `/dotfiles`
- Updated boot text from Mac-adjacent copy to Arch-flavored GRUB, EFI, initramfs, and systemd lines.
- Added a footer easter-egg comment: `// btw I use arch`.
- Added A7 coverage in `tests/tests-arch.js`.

## Verification
`node tests/run-tests.js` -> 700 passing, 0 failing.
