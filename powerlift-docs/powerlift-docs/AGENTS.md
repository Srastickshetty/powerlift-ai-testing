# AGENTS.md — rules for any coding agent on this repo
Product: PowerLift AI — a coach↔client gym simulation. Athlete picks **Powerlifting** or **Bodybuilding** at onboarding (two separate domains, not one app with a toggle). Athlete trains from AI programs, logs everything, optionally hires a human coach (paid; dummy payment now).

## Non-negotiables
1. Never trust the client. Every API route verifies the Firebase ID token server-side and checks ownership/role/relationship. IDs in URLs are never authority.
2. One source of truth for data (see docs/02). No `fs.readFileSync/writeFileSync` for app data.
3. Never commit secrets. Never print or paste key values. Use `.env.example`.
4. Track isolation: `track = 'powerlifting' | 'bodybuilding'` is a first-class field; each track has its own engines, schemas and screens. Shared code only for logging primitives, auth, billing, UI kit.
5. Safety rules in docs/01 §9 are hard constraints in code (not prompts).
6. Validate all inputs (zod). Return typed errors. No `console.log` in prod paths — use the logger.
7. Every change ships with tests. Don't mark a task done without running them.
8. Small files: components < 300 lines, services < 400. Split before adding.
9. Don't delete user data files without asking; move legacy to `/legacy`.
10. Match the design tokens in docs/03. No ad-hoc colors/spacing.

## Working style (token-efficient)
- Read only the files a task needs. Prefer `grep` to opening big files.
- Plan in ≤10 lines, then implement. Report: changed files, tests run, open issues. No long essays.
- If a spec is ambiguous, choose the simplest option, note it in `docs/DECISIONS.md`, continue.

## Commands
`npm run dev` (both), `npm test`, `npm run lint`, `npm run typecheck`. If missing, P1 creates them.
