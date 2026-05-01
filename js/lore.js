/**
 * Lore + personality module — Sprint B Phase 6 (B26-B34)
 *
 * Registers commands: /motd, /version, /changelog, /man, /docs, /availability,
 * /references, /lang, /ask, /interview, /demo
 *
 * Exposes window.Lore.formatReturningLine() and window.Lore.themeTagline()
 * for boot.js to consume.
 *
 * Loads JSON via fetch with embedded JS fallback for file:// — same pattern
 * used by persona.js / persona-data.js.
 */
(function () {
  'use strict';

  // ─────────────────────────────────────────────────────────────────────
  // Embedded fallback data (mirror of data/*.json — for file:// loads)
  // ─────────────────────────────────────────────────────────────────────
  var FALLBACK = {
    motd: {
      tips: [
        "ship it before it ships you.",
        "the best code is the code you didn't write.",
        "production is just staging with anxiety.",
        "git push --force is never the answer. except when it is.",
        "rubber duck debugging works. so does crying.",
        "your future self will hate your past self regardless. write tests anyway.",
        "the docs lie. the source tells the truth.",
        "if it's stupid and it works, it isn't stupid — but write tests.",
        "estimate in coffee, not story points.",
        "every TODO is a love letter to your replacement."
      ]
    },
    changelog: {
      entries: [
        { version: "v1.4.0", date: "2026-04", type: "feat",     msg: "ship DavOS v3 portfolio (windows + apps + persona)" },
        { version: "v1.3.4", date: "2026-03", type: "feat",     msg: "ship DavOS v2 portfolio (OS desktop + terminal pane)" },
        { version: "v1.3.3", date: "2026-02", type: "feat",     msg: "swarm-command RTS — 13 units, fog of war, adaptive AI" },
        { version: "v1.3.0", date: "2025-08", type: "refactor", msg: "platform-shooter + horde-shooter — vanilla canvas games" },
        { version: "v1.2.0", date: "2024-09", type: "feat",     msg: "uxcrimes — 20 levels of dark UX patterns" },
        { version: "v1.1.0", date: "2023-08", type: "feat",     msg: "joined Omada A/S — full-stack on identity governance" },
        { version: "v1.0.0", date: "2022-06", type: "feat",     msg: "shipped M.Sc. Information Science — Aalborg University" },
        { version: "v0.5.0", date: "2018-06", type: "feat",     msg: "shipped B.Tech Product Development — KEA Copenhagen" },
        { version: "v0.0.1", date: "1995",    type: "init",     msg: "initial commit" }
      ]
    },
    man: {
      "dave": {
        name: "dave — full-stack developer, copenhagen",
        synopsis: "dave [--available] [--remote=hybrid] [--language=en|da|hu]",
        description: "Dave Ungvari is a full-stack developer at Omada A/S in Copenhagen. By day: React, TypeScript, GraphQL, C#/.NET, SQL Server. By night: vanilla JS Canvas games, TypeScript RTS, AI-powered side projects (Claude API, pgvector RAG).",
        options: [
          "--available       check current availability status (see /availability)",
          "--remote=MODE     accepted modes: hybrid (preferred), onsite (Copenhagen), remote (case-by-case)",
          "--language=LANG   en (fluent), da (working), hu (native)"
        ],
        see_also: "portfolio(1), swarm(1), /ask, /interview, /contact"
      },
      "portfolio": {
        name: "portfolio — terminal-themed developer portfolio",
        synopsis: "portfolio [--theme=NAME] [--mode=desktop|terminal|boring]",
        description: "An OS-style developer portfolio. Click icons or type commands. 7 projects, 4 themes, 50+ commands, easter eggs, recruiter mode. Zero dependencies, vanilla HTML/CSS/JS, ~7000 LOC.",
        options: [
          "--theme=NAME      catppuccin (default), gruvbox, tokyonight, nord",
          "--mode=MODE       desktop (default), terminal-only, boring (static CV)"
        ],
        see_also: "dave(1), /help, /grid, /boring"
      },
      "swarm": {
        name: "swarm — starcraft-inspired browser RTS",
        synopsis: "swarm [--difficulty=1-4] [--units=13]",
        description: "Real-time strategy game. TypeScript + PixiJS v8. Hand-rolled ECS with TypedArrays for cache-efficient simulation. 13 units, fog of war, spatial hash queries, adaptive AI with 4 difficulty levels and multi-prong attacks. 180 tests. 60 UPS fixed timestep, frame-rate input.",
        options: [
          "--difficulty=1    rookie",
          "--difficulty=4    insane (will crush you)"
        ],
        see_also: "dave(1), /docs swarm"
      },
      "horde": {
        name: "horde — roguelike survival shooter",
        synopsis: "horde",
        description: "Wave-based survival shooter. Vanilla Canvas 2D, no engine. 3 biomes, procedural audio, weapon evolutions, gold-based meta-progression.",
        options: ["(controls in-game)"],
        see_also: "/docs horde"
      },
      "uxcrimes": {
        name: "uxcrimes — dark UX patterns puzzle game",
        synopsis: "uxcrimes",
        description: "20 levels of escape rooms built around manipulative UI: cookie banners, deceptive checkboxes, hostile unsubscribes. Vanilla JS.",
        options: ["(no flags — just escape)"],
        see_also: "/docs uxcrimes"
      },
      "platformer": {
        name: "platformer — arcade platform shooter",
        synopsis: "platformer",
        description: "2D arcade shooter on floating platforms. Mouse-aim shooting, 3 enemy types, weapon pickups, parallax backgrounds, screen-wrap.",
        options: ["(controls in-game)"],
        see_also: "/docs platformer"
      }
    },
    i18n: {
      en: {
        boot_tagline: "full-stack developer. browser game builder.",
        about_role: "Full-stack Developer",
        about_languages: "Languages: English, Danish, Hungarian",
        availability_status: "open to interviews",
        availability_notice: "notice period: %d weeks",
        availability_remote: "remote: %s"
      },
      da: {
        boot_tagline: "fuld-stack udvikler. browser-spil bygger.",
        about_role: "Fuld-stack Udvikler",
        about_languages: "Sprog: Engelsk, Dansk, Ungarsk",
        availability_status: "åben for samtaler",
        availability_notice: "opsigelsesvarsel: %d uger",
        availability_remote: "fjernarbejde: %s"
      }
    },
    knowledge: {
      qa: [
        { keywords: ["available", "availability", "open", "hire", "hiring"],
          answer: "Yes — open to senior full-stack roles in Copenhagen (hybrid). 3-week notice. Type /availability for full details." },
        { keywords: ["remote", "onsite", "hybrid"],
          answer: "Hybrid preferred (2-3 days office in Greater Copenhagen). Full remote case-by-case." },
        { keywords: ["salary", "comp", "compensation", "pay", "dkk"],
          answer: "Comp range 750-950k DKK base, depends on role + level + remote split. Type /availability for the source." },
        { keywords: ["dotnet", ".net", "c#", "csharp"],
          answer: "C#/.NET in production daily for 3+ years at Omada A/S. Built REST + GraphQL services, SQL Server data layer." },
        { keywords: ["react", "typescript", "frontend"],
          answer: "React + TypeScript is the daily driver. Built the entire frontend at Omada (identity governance UI, complex tables, GraphQL hooks). Side projects use Next.js + Tailwind." },
        { keywords: ["ai", "claude", "rag", "pgvector", "llm"],
          answer: "Comfortable with Claude API, prompt caching, tool use, embeddings, and retrieval pipelines." },
        { keywords: ["games", "canvas", "rts", "pixi"],
          answer: "Three browser games (vanilla Canvas 2D) and one TypeScript RTS (Swarm Command, PixiJS v8). The RTS has a hand-rolled ECS with TypedArrays, fog of war, spatial hash queries, adaptive AI. 180 tests." },
        { keywords: ["language", "danish", "hungarian", "english"],
          answer: "Hungarian native. English fluent (work language). Danish working level — improving daily, comfortable in casual + standup contexts." },
        { keywords: ["education", "university", "degree", "master", "msc"],
          answer: "M.Sc. Information Science (Aalborg University, software engineering focus). B.Tech Product Development (KEA Copenhagen, IT & electronics)." },
        { keywords: ["contact", "email", "reach", "linkedin"],
          answer: "Type /contact for github, linkedin, email. /mail opens the inbox if you prefer that vibe." }
      ],
      fallback: "Not sure I have a canned answer for that. Try /about, /availability, or /contact for direct ways to reach Dave."
    },
    tour: {
      interview: [
        { type: "say", text: "→ Quick tour, ~60 seconds." },
        { type: "say", text: "→ Three projects worth highlighting." },
        { type: "wait", ms: 800 },
        { type: "run", cmd: "/swarm" },
        { type: "wait", ms: 2500 },
        { type: "say", text: "→ TypeScript + PixiJS RTS. 180 tests. Hand-rolled ECS." },
        { type: "wait", ms: 1500 },
        { type: "run", cmd: "/horde" },
        { type: "wait", ms: 2500 },
        { type: "say", text: "→ Wave-based survival shooter. Vanilla Canvas 2D, no engine." },
        { type: "wait", ms: 1500 },
        { type: "run", cmd: "/uxcrimes" },
        { type: "wait", ms: 2500 },
        { type: "say", text: "→ 20 levels of dark UX patterns. Vanilla JS." },
        { type: "wait", ms: 1500 },
        { type: "say", text: "→ Tour complete. Type /contact to start a conversation." }
      ],
      demo: [
        { type: "say", text: "[ DEMO MODE — input locked. press any key to exit. ]" },
        { type: "wait", ms: 500 },
        { type: "theme", name: "gruvbox" },
        { type: "wait", ms: 1000 },
        { type: "run", cmd: "/about" },
        { type: "wait", ms: 2500 },
        { type: "theme", name: "tokyonight" },
        { type: "wait", ms: 600 },
        { type: "run", cmd: "/skills" },
        { type: "wait", ms: 2500 },
        { type: "theme", name: "nord" },
        { type: "wait", ms: 600 },
        { type: "run", cmd: "/projects" },
        { type: "wait", ms: 2500 },
        { type: "theme", name: "catppuccin" },
        { type: "wait", ms: 800 },
        { type: "run", cmd: "/contact" },
        { type: "wait", ms: 1500 },
        { type: "say", text: "→ End of demo." }
      ]
    },
    docs: {
      "/swarm": {
        title: "swarm-command — design notes",
        problem: "Build a real-time strategy game in the browser. Sub-16ms frame budget across 100+ units with line-of-sight and AI.",
        architecture: [
          "  ┌──────────────┐    ┌──────────────┐",
          "  │  Input layer │───▶│  Game state  │",
          "  └──────────────┘    │  (TypedArrays)│",
          "                       └──────┬───────┘",
          "                              │",
          "      ┌─────────┬──────────┬──┴──┬─────────┐",
          "      ▼         ▼          ▼     ▼         ▼",
          "   Movement  Combat   Pathfind  Vision  Render",
          "   system    system   system    system  (PixiJS)"
        ],
        decisions: [
          "TypedArrays > class instances — cache locality matters with 100+ units",
          "Fixed 60 UPS, frame-rate input — deterministic, replayable",
          "Hand-rolled ECS over a library — total control, ~400 LOC",
          "Spatial hash for queries — 10x speedup over naive O(n²)"
        ],
        tradeoffs: [
          "ECS adds boilerplate vs OOP — paid for itself by unit 50",
          "Fixed timestep adds input lag risk — mitigated by frame-rate input"
        ],
        metrics: { loc: "~3500", tests: 180, fps: "60 stable, 100+ units", stack: "TypeScript, PixiJS v8, Vite, Vitest" }
      },
      "/horde": {
        title: "horde-shooter — design notes",
        problem: "Wave-based survival shooter in vanilla Canvas 2D, no engine, 60fps with hundreds of enemies.",
        architecture: [
          "  Game loop ──▶ Spatial bins ──▶ Collision pass",
          "       │                              │",
          "       ▼                              ▼",
          "    Entities                       Render (Canvas)"
        ],
        decisions: [
          "Spatial bins instead of quadtree — simpler, faster for uniform distributions",
          "Object pools for bullets + particles — zero GC during waves",
          "Procedural audio via WebAudio oscillators — no asset pipeline"
        ],
        tradeoffs: ["Audio sounds 'retro' — fits the aesthetic, would need samples for AAA polish"],
        metrics: { stack: "Vanilla JS, Canvas 2D, WebAudio" }
      },
      "/uxcrimes": {
        title: "uxcrimes — design notes",
        problem: "Teach dark UX patterns by trapping the player inside one. Each level is an escape room built from a real anti-pattern.",
        architecture: ["Per-level mini-game, declarative level config, shared chrome/score system."],
        decisions: [
          "Each level is its own self-contained module — easy to add",
          "No build step, drop in a folder + register in level list"
        ],
        tradeoffs: ["Hard to share state across levels — accepted, levels are self-contained by design"],
        metrics: { levels: 20, stack: "Vanilla HTML/CSS/JS" }
      },
      "/platformer": {
        title: "platform-shooter — design notes",
        problem: "Arcade-style 2D shooter with mouse aim, screen wrap, and parallax.",
        architecture: ["Per-frame: input → physics → collisions → render. Server: Express + Postgres for leaderboard (optional)."],
        decisions: ["Screen-wrap simplifies world bounds + lets the parallax loop seamlessly", "Mouse aim with click-to-fire — lower skill floor than dual-stick"],
        tradeoffs: ["No mobile support — desktop-only by design"],
        metrics: { stack: "Vanilla JS, Canvas 2D, Express, Postgres" }
      },
      "/portfolio": {
        title: "portfolio — design notes",
        problem: "A portfolio that's also the demo. OS metaphor + terminal, zero dependencies, deploys statically.",
        architecture: [
          "  index.html ──▶ ~25 vanilla JS modules (no bundler)",
          "                       │",
          "                       ├──▶ Terminal engine + commands",
          "                       ├──▶ Window manager (drag/resize/multi)",
          "                       ├──▶ Desktop + icons + context menu",
          "                       ├──▶ Native apps (Settings/Mail/CV/etc.)",
          "                       └──▶ Persona JSON drives all copy"
        ],
        decisions: [
          "Vanilla everything — no build step, no deps, ships to GH Pages as static",
          "Single persona.json source of truth — About, /availability, CV, /ask all read it",
          "Real window manager not just full-screen overlay — multi-window proves it",
          "440+ tests run in jsdom — same code works headless"
        ],
        tradeoffs: [
          "More LOC than a static page — paid back in 'this is the demo' factor",
          "Some duplication across native apps — acceptable, each is small"
        ],
        metrics: { loc: "~7000", tests: 440, deps: 0 }
      }
    }
  };

  // ─────────────────────────────────────────────────────────────────────
  // JSON loader with file:// fallback
  // ─────────────────────────────────────────────────────────────────────
  var dataCache = {};

  function loadJSON(path) {
    if (dataCache[path] !== undefined) return Promise.resolve(dataCache[path]);
    if (typeof fetch !== 'function') return Promise.reject(new Error('no fetch'));
    return fetch(path).then(function (r) {
      if (!r.ok) throw new Error('http ' + r.status);
      return r.json();
    }).then(function (data) {
      dataCache[path] = data;
      return data;
    });
  }

  function loadOrFallback(path, fallbackKey) {
    return loadJSON(path).catch(function () {
      return FALLBACK[fallbackKey];
    });
  }

  // ─────────────────────────────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────────────────────────────
  function wrapLines(text, width) {
    width = width || 68;
    if (!text) return [''];
    var re = new RegExp('.{1,' + width + '}(\\s|$)', 'g');
    var matches = text.match(re);
    if (!matches || !matches.length) return [text];
    var out = [];
    for (var i = 0; i < matches.length; i++) {
      var line = matches[i].replace(/\s+$/, '');
      if (line.length) out.push(line);
    }
    return out.length ? out : [text];
  }

  function todayIndex(len) {
    if (!len) return 0;
    var d = new Date();
    var start = new Date(d.getFullYear(), 0, 0);
    var diff = d - start;
    var day = Math.floor(diff / 86400000);
    return day % len;
  }

  function getPersona() {
    if (window.Persona && typeof window.Persona.get === 'function') {
      var p = window.Persona.get();
      if (p) return p;
    }
    if (window.__PERSONA_FALLBACK) return window.__PERSONA_FALLBACK;
    return null;
  }

  function currentLang() {
    if (window.Session && typeof window.Session.get === 'function') {
      var l = window.Session.get('lang');
      if (l) return l;
    }
    return 'en';
  }

  // ─────────────────────────────────────────────────────────────────────
  // /motd — message of the day (B26)
  // ─────────────────────────────────────────────────────────────────────
  registerCommand('/motd', 'message of the day', function (terminal) {
    loadOrFallback('data/motd.json', 'motd').then(function (data) {
      var tips = (data && data.tips) ? data.tips : [];
      if (!tips.length) { terminal.output('no tips today.', 'dim'); return; }
      var idx = todayIndex(tips.length);
      terminal.output('');
      terminal.output('  ' + tips[idx], 'accent');
      terminal.output('');
    });
  });

  // ─────────────────────────────────────────────────────────────────────
  // /version + /changelog (B27)
  // ─────────────────────────────────────────────────────────────────────
  function renderChangelog(terminal) {
    loadOrFallback('data/changelog.json', 'changelog').then(function (data) {
      var entries = (data && data.entries) ? data.entries : [];
      terminal.output('DavOS v3.0 — synthesized 2026-04-28');
      terminal.output('git log --persona', 'dim');
      terminal.output(SEPARATOR, 'dim');
      terminal.output('');
      for (var i = 0; i < entries.length; i++) {
        var e = entries[i];
        terminal.outputHTML(
          '<span class="ok">[' + e.version + ']</span> ' +
          '<span style="color:var(--color-dim)">' + e.date + ' ' + e.type + ':</span> ' +
          e.msg
        );
      }
      terminal.output('');
    });
  }

  registerCommand('/version', 'show DavOS version + persona git log', renderChangelog);
  registerCommand('/changelog', 'show career changelog', renderChangelog);

  // ─────────────────────────────────────────────────────────────────────
  // /man <topic> (B28)
  // ─────────────────────────────────────────────────────────────────────
  registerCommand('/man', 'show manpage', function (terminal) {
    loadOrFallback('data/man.json', 'man').then(function (data) {
      terminal.output('usage: /man <topic>', 'dim');
      terminal.output('');
      terminal.output('topics:');
      var keys = Object.keys(data || {});
      for (var i = 0; i < keys.length; i++) terminal.output('  ' + keys[i], 'dim');
      terminal.output('');
    });
  });

  function renderMan(terminal, entry) {
    terminal.output('');
    terminal.output('NAME', 'dim');
    terminal.output('       ' + entry.name);
    terminal.output('');
    terminal.output('SYNOPSIS', 'dim');
    terminal.output('       ' + entry.synopsis);
    terminal.output('');
    terminal.output('DESCRIPTION', 'dim');
    var desc = wrapLines(entry.description, 68);
    for (var i = 0; i < desc.length; i++) terminal.output('       ' + desc[i]);
    terminal.output('');
    terminal.output('OPTIONS', 'dim');
    for (var j = 0; j < entry.options.length; j++) terminal.output('       ' + entry.options[j]);
    terminal.output('');
    terminal.output('SEE ALSO', 'dim');
    terminal.output('       ' + entry.see_also);
    terminal.output('');
  }

  loadOrFallback('data/man.json', 'man').then(function (data) {
    var keys = Object.keys(data || {});
    for (var i = 0; i < keys.length; i++) {
      (function (k) {
        registerCommand('/man ' + k, 'manpage: ' + k, function (terminal) {
          renderMan(terminal, data[k]);
        }, true);
      })(keys[i]);
    }
  });

  // ─────────────────────────────────────────────────────────────────────
  // /docs <project> (B29)
  // ─────────────────────────────────────────────────────────────────────
  registerCommand('/docs', 'project deep-dive docs', function (terminal) {
    loadOrFallback('data/docs.json', 'docs').then(function (data) {
      terminal.output('usage: /docs <project>', 'dim');
      terminal.output('');
      terminal.output('available:');
      var keys = Object.keys(data || {});
      for (var i = 0; i < keys.length; i++) {
        terminal.output('  /docs ' + keys[i].replace(/^\//, ''), 'dim');
      }
      terminal.output('');
    });
  });

  function renderDocs(terminal, entry) {
    terminal.output('');
    terminal.output('  ' + entry.title);
    terminal.output(SEPARATOR);
    terminal.output('');
    terminal.output('  PROBLEM', 'dim');
    var p = wrapLines(entry.problem, 68);
    for (var i = 0; i < p.length; i++) terminal.output('  ' + p[i]);
    terminal.output('');
    terminal.output('  ARCHITECTURE', 'dim');
    for (var a = 0; a < entry.architecture.length; a++) terminal.output(entry.architecture[a]);
    terminal.output('');
    terminal.output('  KEY DECISIONS', 'dim');
    for (var d = 0; d < entry.decisions.length; d++) terminal.output('  • ' + entry.decisions[d]);
    terminal.output('');
    if (entry.tradeoffs && entry.tradeoffs.length) {
      terminal.output('  TRADEOFFS', 'dim');
      for (var t = 0; t < entry.tradeoffs.length; t++) terminal.output('  • ' + entry.tradeoffs[t]);
      terminal.output('');
    }
    if (entry.metrics) {
      terminal.output('  METRICS', 'dim');
      for (var k in entry.metrics) {
        if (Object.prototype.hasOwnProperty.call(entry.metrics, k)) {
          terminal.output('  ' + k + ': ' + entry.metrics[k]);
        }
      }
      terminal.output('');
    }
    terminal.output(SEPARATOR);
    terminal.output('');
  }

  loadOrFallback('data/docs.json', 'docs').then(function (data) {
    var keys = Object.keys(data || {});
    for (var i = 0; i < keys.length; i++) {
      (function (k) {
        var shortName = k.replace(/^\//, '');
        registerCommand('/docs ' + shortName, 'docs for ' + shortName, function (terminal) {
          renderDocs(terminal, data[k]);
        }, true);
      })(keys[i]);
    }
  });

  // ─────────────────────────────────────────────────────────────────────
  // /availability + /references (B30)
  // ─────────────────────────────────────────────────────────────────────
  registerCommand('/availability', 'work availability + comp', function (terminal) {
    var p = getPersona();
    if (!p || !p.availability) { terminal.output('persona unavailable.', 'error'); return; }
    var a = p.availability;
    var cur = currentLang();
    var i18n = (window.__I18N || FALLBACK.i18n)[cur] || {};
    var statusLabel = i18n.availability_status || a.status;

    var compMin = (typeof a.comp_dkk_min === 'number') ? a.comp_dkk_min.toLocaleString() : a.comp_dkk_min;
    var compMax = (typeof a.comp_dkk_max === 'number') ? a.comp_dkk_max.toLocaleString() : a.comp_dkk_max;

    terminal.output('');
    terminal.output('  AVAILABILITY');
    terminal.output(SEPARATOR);
    terminal.output('');
    terminal.output('  status:    ' + statusLabel);
    terminal.output('  notice:    ' + a.notice_period_weeks + ' weeks');
    terminal.output('  comp:      ' + compMin + '–' + compMax + ' DKK');
    terminal.output('  work mode: ' + a.remote);
    terminal.output('  location:  ' + a.onsite_radius);
    terminal.output('  start:     ' + a.start_date);
    terminal.output('');
    terminal.output(SEPARATOR);
    terminal.output('');
  });

  registerCommand('/references', 'references on request', function (terminal) {
    var p = getPersona();
    if (!p || !p.references || !p.references.length) {
      terminal.output('no references on file.', 'dim');
      return;
    }
    terminal.output('');
    terminal.output('  REFERENCES');
    terminal.output(SEPARATOR);
    terminal.output('');
    for (var i = 0; i < p.references.length; i++) {
      var r = p.references[i];
      terminal.output('  status:  ' + r.available);
      if (r.note) terminal.output('  note:    ' + r.note);
    }
    terminal.output('');
    terminal.output('  contact /contact to request references.', 'dim');
    terminal.output('');
  });

  // ─────────────────────────────────────────────────────────────────────
  // /lang (B31)
  // ─────────────────────────────────────────────────────────────────────
  registerCommand('/lang', 'switch language', function (terminal) {
    terminal.output('available: en, da');
    terminal.output('current: ' + currentLang(), 'dim');
    terminal.output('usage: /lang <code>', 'dim');
  });

  ['en', 'da'].forEach(function (code) {
    registerCommand('/lang ' + code, 'switch to ' + code, function (terminal) {
      if (window.Session && typeof window.Session.set === 'function') {
        window.Session.set('lang', code);
      }
      terminal.output('language set to ' + code + '.', 'accent');
    }, true);
  });

  // Pre-load i18n into a window global for synchronous availability access
  loadOrFallback('data/i18n.json', 'i18n').then(function (data) {
    window.__I18N = data || FALLBACK.i18n;
  });

  // ─────────────────────────────────────────────────────────────────────
  // /ask (B33)
  // ─────────────────────────────────────────────────────────────────────
  function answerQuestion(question, knowledge) {
    var q = (question || '').toLowerCase();
    if (!q || !knowledge || !knowledge.qa) {
      return (knowledge && knowledge.fallback) || 'ask me something specific.';
    }
    var best = null;
    var bestScore = 0;
    for (var i = 0; i < knowledge.qa.length; i++) {
      var entry = knowledge.qa[i];
      var score = 0;
      for (var k = 0; k < entry.keywords.length; k++) {
        if (q.indexOf(entry.keywords[k]) !== -1) score += entry.keywords[k].length;
      }
      if (score > bestScore) { bestScore = score; best = entry; }
    }
    return best ? best.answer : (knowledge.fallback || 'no good answer for that.');
  }

  registerCommand('/ask', 'ask a question about Dave', function (terminal) {
    terminal.output('usage: /ask <your question>', 'dim');
    terminal.output('try: /ask are you available?  /ask how much react?  /ask salary range', 'dim');
  });

  // Wrap executeCommand once to handle freeform "/ask <question>" payloads.
  if (typeof executeCommand === 'function' && !window.__askWrapped) {
    var _origExec = executeCommand;
    executeCommand = function (rawInput, terminal) {
      var trimmed = (rawInput || '').trim();
      if (trimmed.toLowerCase().indexOf('/ask ') === 0) {
        var question = trimmed.slice(5).trim();
        if (!question) {
          return _origExec('/ask', terminal);
        }
        loadOrFallback('data/dave-knowledge.json', 'knowledge').then(function (k) {
          terminal.output('');
          terminal.output('> ' + question, 'dim');
          terminal.output('');
          var answer = answerQuestion(question, k);
          var lines = wrapLines(answer, 68);
          for (var i = 0; i < lines.length; i++) terminal.output('  ' + lines[i], 'accent');
          terminal.output('');
          terminal.output('  (this is a static keyword-match stub. v2 uses real Claude.)', 'dim');
          terminal.output('');
        });
        return;
      }
      return _origExec(rawInput, terminal);
    };
    window.__askWrapped = true;
  }

  // ─────────────────────────────────────────────────────────────────────
  // /interview + /demo tours (B34)
  // ─────────────────────────────────────────────────────────────────────
  function runTour(terminal, steps, onComplete) {
    var i = 0;
    var aborted = false;
    function abort() { aborted = true; }
    function step() {
      if (aborted) { if (onComplete) onComplete(true); return; }
      if (!steps || i >= steps.length) { if (onComplete) onComplete(false); return; }
      var s = steps[i++];
      if (s.type === 'say') {
        terminal.output(s.text, 'accent');
        setTimeout(step, 250);
      } else if (s.type === 'wait') {
        setTimeout(step, s.ms || 500);
      } else if (s.type === 'run') {
        if (typeof executeCommand === 'function') executeCommand(s.cmd, terminal);
        setTimeout(step, 200);
      } else if (s.type === 'theme') {
        if (typeof applyTheme === 'function') applyTheme(s.name);
        setTimeout(step, 200);
      } else {
        setTimeout(step, 100);
      }
    }
    step();
    return abort;
  }

  registerCommand('/interview', 'guided 60s recruiter tour', function (terminal) {
    loadOrFallback('data/tour.json', 'tour').then(function (data) {
      runTour(terminal, (data && data.interview) || []);
    });
  });

  registerCommand('/demo', 'autopilot demo mode', function (terminal) {
    loadOrFallback('data/tour.json', 'tour').then(function (data) {
      var inp = document.getElementById('command-input');
      if (inp) inp.disabled = true;
        var savedTheme = (typeof currentTheme !== 'undefined') ? currentTheme : 'catppuccin';
      var abort = runTour(terminal, (data && data.demo) || [], function (wasAborted) {
        if (inp) inp.disabled = false;
        if (typeof applyTheme === 'function' && savedTheme) applyTheme(savedTheme);
        terminal.output(wasAborted ? '> demo aborted.' : '> demo complete.', 'dim');
      });
      var exitHandler = function () {
        document.removeEventListener('keydown', exitHandler, true);
        abort();
      };
      setTimeout(function () {
        document.addEventListener('keydown', exitHandler, true);
      }, 500);
    });
  });

  // ─────────────────────────────────────────────────────────────────────
  // B32 Returning-visitor + per-theme tagline — exposed for boot.js
  // ─────────────────────────────────────────────────────────────────────
  function relativeTime(iso) {
    if (!iso) return null;
    try {
      var then = new Date(iso).getTime();
      if (isNaN(then)) return null;
      var now = Date.now();
      var sec = Math.max(0, Math.floor((now - then) / 1000));
      if (sec < 60) return 'moments ago';
      if (sec < 3600) return Math.floor(sec / 60) + ' min ago';
      if (sec < 86400) return Math.floor(sec / 3600) + ' hr ago';
      if (sec < 86400 * 30) return Math.floor(sec / 86400) + ' days ago';
      return Math.floor(sec / 86400 / 30) + ' months ago';
    } catch (e) {
      return null;
    }
  }

  function formatReturningLine() {
    var visit = window.__lastVisit;
    if (!visit || !visit.previousVisit) return null;
    var rel = relativeTime(visit.previousVisit);
    if (!rel) return null;
    return 'Restored session — last visit: ' + rel + ', visits this device: ' + visit.count;
  }

  function themeTagline() {
    var t = (typeof currentTheme !== 'undefined' && currentTheme) ? currentTheme : 'catppuccin';
    var taglines = {
      catppuccin: 'mocha profile loaded.',
      gruvbox: 'warm compile cache.',
      tokyonight: 'night shift engaged.',
      nord: 'frosted shell ready.'
    };
    return taglines[t] || taglines.catppuccin;
  }

  window.Lore = {
    formatReturningLine: formatReturningLine,
    themeTagline: themeTagline,
    runTour: runTour,
    answerQuestion: answerQuestion
  };
})();
