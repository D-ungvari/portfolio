# Portfolio Terminal — Project Plan

## Concept Summary

A portfolio website built as a terminal/CLI interface. Black background, green monospace text, blinking cursor. Visitors navigate by typing `/commands` or clicking command chips on mobile. Projects are launched via commands like `/uxcrimes`. The terminal is the hook — the content and personality are the substance.

Built with vanilla HTML/CSS/JS. No frameworks, no build step. Hosted on GitHub Pages.

**Design philosophy:** "Modern developer terminal" (think VS Code integrated terminal or iTerm2), NOT "90s hacker movie." Clean, readable, unmistakably terminal. Fast to load, fast to understand, fast to find projects.

---

## Visual Design Specs

### Color Scheme

| Role          | Color     | Usage                                  |
| ------------- | --------- | -------------------------------------- |
| Background    | `#0a0a0a` | Terminal background                    |
| Primary text  | `#4af626` | All standard output                    |
| Accent/links  | `#00d4ff` | Clickable links, interactive elements  |
| Dim text      | `#3a7a3a` | Hints, comments, secondary info        |
| Error text    | `#ff4444` | Error messages                         |
| Input text    | `#ffffff` | What the user types at the prompt      |
| Prompt        | `#4af626` | The prompt prefix (`visitor@dave:~$`)  |

### Typography

- **Font:** `'JetBrains Mono', 'Fira Code', 'Courier New', monospace`
- **Load:** Google Fonts — JetBrains Mono, weight 400 + 700
- **Size:** 15px desktop, 13px mobile
- **Line height:** 1.6

### Effects (tasteful, not overdone)

- **Text glow:** `text-shadow: 0 0 5px rgba(74, 246, 38, 0.3)` on primary text
- **Cursor:** Blinking block character (`█`), CSS animation toggling opacity every 530ms. Solid (no blink) while user is actively typing.
- **Scanlines:** Very subtle CSS overlay, opacity 0.03–0.05. Barely visible, adds texture.
- **NO:** CRT curvature, screen flicker, phosphor trails, heavy distortion — these hurt readability.
- **`prefers-reduced-motion`:** Disable boot animation, glow pulse, scanlines.

### Layout

- Full viewport terminal, black background edge-to-edge
- Content container: `max-width: 800px`, centered, `padding: 40px` sides (desktop), `16px` (mobile)
- Optional subtle top bar: `visitor@dave ~ /portfolio` to sell the terminal window feel
- Output scrolls naturally; auto-scroll to bottom on new output

---

## Feature List

### MVP (v1)

1. **Terminal UI** — input field, output area, blinking cursor, prompt
2. **Boot sequence** — fast (<1.5s), 3 lines typed rapidly, then welcome screen
3. **Welcome message** — ASCII art name + tagline + available commands listed
4. **`/help`** — lists all available commands with descriptions
5. **`/projects`** — lists all projects with one-line descriptions
6. **`/uxcrimes`** — project detail: description, tech stack, live link, source link
7. **`/about`** — short bio with personality
8. **`/contact`** — GitHub, email, LinkedIn links
9. **`/clear`** — clears terminal output
10. **Command history** — up/down arrow keys cycle through previous commands
11. **Mobile support** — clickable command chip buttons below terminal
12. **Error handling** — unknown commands get a friendly error + `/help` hint
13. **Easter eggs** — `/sudo`, `/rm`, `/exit`, `/hire`, bare `hello`/`hi`
14. **Meta tags** — proper title, description, Open Graph image
15. **Favicon** — terminal-themed favicon
16. **Clickable links** — links in output are clickable (open in new tab)
17. **XSS protection** — user input rendered via `textContent`, never `innerHTML`

### Nice-to-Have (v2+)

- Tab completion for commands
- `/theme` — switch between green, amber (`#ffb000`), blue (`#00d4ff`) color schemes
- `/matrix` — brief matrix rain effect
- More easter eggs (Konami code, `/cowsay`, etc.)
- Command aliases (`/?` for `/help`)
- Sound effects (key clicks, beeps) — toggleable
- ASCII art project screenshots
- `/resume` — formatted resume view, print-friendly
- Custom 404.html in terminal style
- Visitor counter display (cosmetic)
- `/portfolio` — meta-project showcasing the portfolio itself
- Animated typing effect for output (toggleable in settings)

### Cut Entirely

- Fake filesystem / `cd` / `ls` navigation
- Contact form
- Chat or messaging
- Full bash emulation
- Framework or build tools

---

## UX Flow (Step by Step)

### 1. Page Load → Boot (0–1.5s)

Black screen. Three lines appear rapidly (staggered 300ms each):

```
> booting portfolio v1.0...
> loading projects... done
> ready.
```

Then the welcome message fades/types in.

### 2. Welcome Screen (idle state)

```
 ██████╗  █████╗ ██╗   ██╗███████╗
 ██╔══██╗██╔══██╗██║   ██║██╔════╝
 ██║  ██║███████║██║   ██║█████╗
 ██║  ██║██╔══██║╚██╗ ██╔╝██╔══╝
 ██████╔╝██║  ██║ ╚████╔╝ ███████╗
 ╚═════╝ ╚═╝  ╚═╝  ╚═══╝  ╚══════╝

 web developer. vanilla js enthusiast.

 type /help to see available commands.

visitor@dave:~$ █
```

On mobile, command chips appear below: `/help` `/projects` `/about` `/contact`

*Note: Replace "DAVE" ASCII art with actual name/handle.*

### 3. User Types a Command

- Characters appear at the prompt as typed (white text)
- Cursor moves right with each character
- On **Enter**: command is processed
- Command echo + output appear in the output area
- New prompt appears below, ready for next command
- Terminal auto-scrolls to show latest output

### 4. `/help` Output

```
available commands:
────────────────────────────────────

  /projects    list all projects
  /about       about me
  /contact     get in touch
  /clear       clear terminal

project shortcuts:
────────────────────────────────────

  /uxcrimes    UXCrimes — dark patterns game
```

### 5. `/projects` Output

```
projects:
────────────────────────────────────

  /uxcrimes
  UXCrimes — An interactive browser game about dark UX patterns
  vanilla html / css / js

────────────────────────────────────

type a project command for details.
```

*(More projects added here as they're built — each gets its own line block.)*

### 6. `/uxcrimes` Output (Project Detail)

```
  UXCRIMES
────────────────────────────────────

  An interactive browser game about
  dark UX patterns. Each level puts
  you face-to-face with a different
  manipulative design. Your job:
  figure out how to escape.

  stack: html / css / javascript

  > play   https://[username].github.io/UXCrimes
  > source https://github.com/[username]/UXCrimes

────────────────────────────────────
```

The URLs are clickable links (styled in accent color, open in new tab).

### 7. `/about` Output

```
> about
────────────────────────────────────

  I build things for the browser.

  No frameworks. No build steps.
  Just HTML, CSS, and JavaScript
  doing what they do best.

  Interested in:
    - interactive browser experiences
    - creative frontend development
    - making the web weirder

────────────────────────────────────
```

### 8. `/contact` Output

```
> contact
────────────────────────────────────

  github     github.com/[handle]
  email      [email]
  linkedin   linkedin.com/in/[handle]

────────────────────────────────────
```

### 9. Unknown Command

```
command not found: banana
type /help for available commands.
```

### 10. Empty Enter

Just prints a new prompt. No error, no output.

### 11. Easter Eggs

```
/sudo       → permission denied. you're a visitor, not root.
/rm -rf /   → nice try. this portfolio has backups.
/rm          → (same as above)
/exit        → there is no exit. only /contact.
/hire        → great idea. check /contact for details.
hello        → hey! type /help to see what I can do.
hi           → hey! type /help to see what I can do.
```

---

## Technical Architecture

### File Structure

```
portfolio/
├── index.html              main (and only) HTML page
├── css/
│   ├── reset.css            minimal CSS reset
│   ├── terminal.css         core terminal layout and styling
│   ├── effects.css          glow, scanlines, cursor animation
│   └── mobile.css           mobile overrides, command chips
├── js/
│   ├── terminal.js          terminal engine: input, output, history, scrolling
│   ├── commands.js          command registry + built-in commands (/help, /about, etc.)
│   ├── projects.js          project data array + /projects and /[project] commands
│   ├── easter-eggs.js       hidden commands
│   ├── boot.js              boot sequence animation
│   └── main.js              initialization, wires everything together
├── assets/
│   ├── screenshots/         project screenshots (if used)
│   ├── favicon.ico          terminal-themed favicon
│   └── og-image.png         Open Graph preview image
├── PLAN.md                  this file
└── README.md                repo readme (if desired)
```

### Script Load Order (in index.html)

```html
<script src="js/terminal.js"></script>
<script src="js/commands.js"></script>
<script src="js/projects.js"></script>
<script src="js/easter-eggs.js"></script>
<script src="js/boot.js"></script>
<script src="js/main.js"></script>
```

No modules, no import/export. Scripts loaded in order, each adds to the global scope.

### Core Patterns

#### Terminal Engine (`terminal.js`)

Exposes a global `Terminal` object (or constructor) that manages:

- **Output area:** A `<div id="output">` that gets `<div>` children appended for each line/block of output
- **Input:** A real `<input type="text">` element, styled to be transparent/overlaid on the prompt line. Using a real input gives us mobile keyboard support for free.
- **Prompt display:** A `<span>` showing `visitor@dave:~$`, next to the input
- **Cursor:** A `<span class="cursor">█</span>` after the input, positioned via CSS
- **Command history:** An array of past commands + an index. Up/Down arrow keys cycle through history.
- **Auto-scroll:** After appending output, scroll the terminal container to the bottom
- **`output(text, className)`:** Appends a line/block to the output area. `className` can be `'error'`, `'dim'`, `'accent'`, etc.
- **`outputHTML(html)`:** For output that needs clickable links — but ONLY for trusted content (never user input)

```
terminal.output('hello world');               // green text
terminal.output('command not found', 'error'); // red text
terminal.outputHTML('<a href="..." target="_blank" rel="noopener">link</a>', 'accent');
```

#### Command Registry (`commands.js`)

```js
const commandRegistry = {};

function registerCommand(name, description, handler) {
  commandRegistry[name.toLowerCase()] = { description, handler };
}

function executeCommand(rawInput, terminal) {
  const input = rawInput.trim().toLowerCase();
  if (input === '') return; // empty enter, do nothing

  if (commandRegistry[input]) {
    commandRegistry[input].handler(terminal);
  } else {
    terminal.output(`command not found: ${rawInput.trim()}`, 'error');
    terminal.output('type /help for available commands.', 'dim');
  }
}
```

Built-in commands (`/help`, `/about`, `/contact`, `/clear`) registered in this file.

#### Project Data (`projects.js`)

```js
const projects = [
  {
    command: '/uxcrimes',
    title: 'UXCRIMES',
    tagline: 'An interactive browser game about dark UX patterns',
    description: [
      'Each level puts you face-to-face with a different',
      'manipulative UX pattern. Your job: figure out how',
      'to escape.'
    ],
    stack: 'html / css / javascript',
    liveUrl: 'https://[username].github.io/UXCrimes',
    sourceUrl: 'https://github.com/[username]/UXCrimes'
  }
];
```

On load, this file iterates `projects` and calls `registerCommand` for each, plus registers the `/projects` list command. Adding a new project = adding an object to this array.

#### Easter Eggs (`easter-eggs.js`)

Registers hidden commands via `registerCommand`. These don't appear in `/help`.

#### Boot Sequence (`boot.js`)

Exposes a `runBoot(terminal, callback)` function. Types out 3 boot lines with staggered delays, then calls `callback` (which shows the welcome message and activates the input).

#### Main (`main.js`)

```js
document.addEventListener('DOMContentLoaded', () => {
  const term = new Terminal(document.getElementById('terminal'));
  runBoot(term, () => {
    showWelcome(term);
    term.activateInput();
  });
});
```

### HTML Structure

```html
<div id="terminal">
  <div id="output"></div>
  <div id="input-line">
    <span class="prompt">visitor@dave:~$&nbsp;</span>
    <input type="text" id="command-input"
           autofocus autocomplete="off"
           spellcheck="false" autocapitalize="off">
  </div>
</div>
<div id="mobile-commands">
  <button data-cmd="/help">/help</button>
  <button data-cmd="/projects">/projects</button>
  <button data-cmd="/about">/about</button>
  <button data-cmd="/contact">/contact</button>
</div>
```

### How to Add a New Project

1. Open `js/projects.js`
2. Add an object to the `projects` array:
   ```js
   {
     command: '/myproject',
     title: 'MY PROJECT',
     tagline: 'One-line description',
     description: ['Longer description', 'split across lines.'],
     stack: 'html / css / js',
     liveUrl: 'https://...',
     sourceUrl: 'https://github.com/...'
   }
   ```
3. Optionally add a screenshot to `assets/screenshots/`
4. Done. The command auto-registers; `/help` and `/projects` auto-update.

---

## Content & Copy

### Boot Lines
```
> booting portfolio v1.0...
> loading projects... done
> ready.
```

### Welcome ASCII Art
```
 ██████╗  █████╗ ██╗   ██╗███████╗
 ██╔══██╗██╔══██╗██║   ██║██╔════╝
 ██║  ██║███████║██║   ██║█████╗
 ██║  ██║██╔══██║╚██╗ ██╔╝██╔══╝
 ██████╔╝██║  ██║ ╚████╔╝ ███████╗
 ╚═════╝ ╚═╝  ╚═╝  ╚═══╝  ╚══════╝

 web developer. vanilla js enthusiast.

 type /help to see available commands.
```

*(Replace with actual name. Generate ASCII art with a tool like patorjk.com/software/taag using the "ANSI Shadow" font.)*

### Prompt
```
visitor@dave:~$
```

### /help
```
available commands:
────────────────────────────────────

  /projects    list all projects
  /about       about me
  /contact     get in touch
  /clear       clear terminal

project shortcuts:
────────────────────────────────────

  /uxcrimes    UXCrimes — dark patterns game
```

### /about
```
> about
────────────────────────────────────

  I build things for the browser.

  No frameworks. No build steps.
  Just HTML, CSS, and JavaScript
  doing what they do best.

  Interested in:
    - interactive browser experiences
    - creative frontend development
    - making the web weirder

────────────────────────────────────
```

### /contact
```
> contact
────────────────────────────────────

  github     github.com/[handle]
  email      [email]
  linkedin   linkedin.com/in/[handle]

────────────────────────────────────
```

### /projects
```
projects:
────────────────────────────────────

  /uxcrimes
  UXCrimes — An interactive browser game about dark UX patterns
  vanilla html / css / js

────────────────────────────────────

type a project command for details.
```

### /uxcrimes
```
  UXCRIMES
────────────────────────────────────

  An interactive browser game about
  dark UX patterns. Each level puts
  you face-to-face with a different
  manipulative design. Your job:
  figure out how to escape.

  stack: html / css / javascript

  > play   [live url]
  > source [repo url]

────────────────────────────────────
```

### Error
```
command not found: [input]
type /help for available commands.
```

### Easter Eggs
```
/sudo       → permission denied. you're a visitor, not root.
/rm -rf /   → nice try. this portfolio has backups.
/rm          → (same as above)
/exit        → there is no exit. only /contact.
/hire        → great idea. check /contact for details.
hello        → hey! type /help to see what I can do.
hi           → hey! type /help to see what I can do.
```

---

## Implementation Order

Build and test each step before moving to the next.

### Phase 1: Foundation
1. **Create `index.html`** with basic structure (terminal div, output div, input line, meta tags)
2. **Create `css/reset.css`** — minimal reset (box-sizing, margin/padding zero, 100vh body)
3. **Create `css/terminal.css`** — black background, green text, monospace font, layout, prompt styling, output area styling
4. **Create `js/terminal.js`** — Terminal class: output(), input handling, Enter key processing, auto-scroll
5. **Create `js/main.js`** — instantiate Terminal, basic test (type anything, it echoes back)
6. **Test:** Open in browser. Type text, hit enter, see output. Green on black.

### Phase 2: Commands
7. **Create `js/commands.js`** — command registry, executeCommand(), register `/help` and `/clear`
8. **Wire `main.js`** to use executeCommand instead of echo
9. **Add `/about` and `/contact`** commands to `commands.js`
10. **Test:** `/help` works, `/about` works, `/contact` works, `/clear` works, unknown commands show error

### Phase 3: Projects
11. **Create `js/projects.js`** — project data array, auto-register project commands, register `/projects` list command
12. **Add UXCrimes** as first project entry
13. **Make links clickable** — outputHTML method for trusted content with `<a>` tags
14. **Test:** `/projects` lists UXCrimes, `/uxcrimes` shows detail with clickable links

### Phase 4: Polish & Effects
15. **Create `css/effects.css`** — text glow, blinking cursor animation, scanlines overlay
16. **Create `js/boot.js`** — boot sequence (3 lines, staggered timing)
17. **Add welcome message** with ASCII art name
18. **Add command history** — up/down arrow key support in terminal.js
19. **Test:** Full flow — page loads, boot runs, welcome shows, commands all work, history works

### Phase 5: Mobile & Accessibility
20. **Create `css/mobile.css`** — responsive adjustments, command chip buttons
21. **Add mobile command chips** in HTML + JS click handlers
22. **Add ARIA attributes** — live region on output, label on input
23. **Add `prefers-reduced-motion`** media query — skip animations
24. **Test on mobile** — chips work, keyboard works, layout is good

### Phase 6: Easter Eggs & Final Polish
25. **Create `js/easter-eggs.js`** — register hidden commands
26. **Add favicon** and **OG image**
27. **Final pass:** test all commands, check contrast ratios, check link targets, check mobile
28. **Deploy to GitHub Pages**

---

## Key Principles

- **Speed over spectacle.** Every interaction should feel instant. The boot sequence is the only "wait" and it's under 2 seconds.
- **Content over chrome.** The terminal aesthetic is the frame, not the painting. Good writing and interesting projects matter more than effects.
- **Easy to extend.** Adding a project is adding an object to an array. No wiring, no new files needed.
- **Accessible by default.** Screen readers, keyboard navigation, reduced motion — all handled.
- **Mobile-first mindset.** The terminal works on phones via tappable command chips. Nobody is SSH-ing into a portfolio on their iPhone.
