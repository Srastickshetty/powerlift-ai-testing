# PowerLift AI — Master Docs Pack
Drop this whole folder into the project root (next to `frontend/` and `backend/`). Copy `AGENTS.md` to the root too (also save a copy as `CLAUDE.md` / `.cursorrules` depending on your IDE agent).

## How to use with your IDE agent
1. Prompt: `Read AGENTS.md and docs/00_AUDIT.md. Then execute commands/P0_security.md. Stop when its acceptance checklist passes and report.`
2. Run phases IN ORDER (P0 → P8). Never skip P0–P2: everything else sits on them.
3. After each phase: commit, run the checklist, then start the next command file in a fresh agent chat (saves tokens).

## Contents
| File | Role voice | Purpose |
|---|---|---|
| docs/00_AUDIT.md | All teams | What is wrong today, with evidence from your code, ranked |
| docs/01_COACHING_SPEC.md | Intl. powerlifting + bodybuilding coach | Domain rules, features, safety — the "what" |
| docs/02_ARCHITECTURE.md | Senior engineer | Target architecture, data model, API, auth, payments |
| docs/03_UX_DESIGN.md | UI/UX + design lead | Flows, screens, design system |
| docs/04_AI_DATA.md | ML lead | Program dataset, generator, training, eval |
| docs/05_ROADMAP.md | Product/eng lead | Phases, order, definition of done |
| commands/P0..P8_*.md | — | One agent prompt per phase |
