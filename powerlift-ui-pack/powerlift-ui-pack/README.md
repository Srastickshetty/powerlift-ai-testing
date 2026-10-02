# PowerLift AI — UI/UX Pack (separate from the Master Docs Pack)
Fixes: bad layout/arrangement, weak landing page, poor mobile+desktop behaviour.
Contains **docs** (what & why), **ready-to-use code** (tokens, Tailwind config, Landing, responsive App Shell, workout set row) and **commands** (agent prompts).

## Where to put things
```
<project root>/
  docs-ui/        <- copy this pack's docs/ here
  commands-ui/    <- copy this pack's commands/ here
  AGENTS_UI.md    <- copy to root (append its rules to AGENTS.md)
frontend/
  tailwind.config.js        <- REPLACE with code/tailwind.config.js (merge your keyframes if you still need them)
  src/styles/tokens.css     <- copy code/tokens.css ; import it FIRST in main.jsx
  src/pages/Landing.jsx     <- REPLACE with code/Landing.jsx
  src/components/layout/AppShell.jsx  <- copy code/AppShell.jsx
  src/ui/*                  <- copy code/ui/*
  index.html                <- fix viewport (see commands-ui/U0)
```
## Order (do not skip)
1. U0 foundation (tokens, tailwind, viewport, fonts) — 1 hr
2. U1 landing page — half day
3. U2 app shell + navigation — 1 day
4. U3 workout mode (the most important screen) — 1–2 days
5. U4 Today / Progress / Program screens — 2–3 days
6. U5 coach dashboard (desktop-first, mobile-usable) — 2–3 days
7. U6 polish: a11y, performance, visual QA at 360 / 768 / 1280 px

## Prompt to start (paste into your IDE agent, fresh chat per step)
`Read AGENTS_UI.md and docs-ui/U1_DESIGN_SYSTEM.md. Execute commands-ui/U0_foundation.md. Stop when its checklist passes and report in ≤10 lines.`
Then the same with U1, U2, … Run `npm run dev` and look at it in browser device mode (360×800 and 1280×800) after every step.

## Honesty note
This was written from reading your code (landing, sidebar, dashboards, config), not from running/seeing the app. Judge the result visually; the checklists tell the agent what "done" looks like.
