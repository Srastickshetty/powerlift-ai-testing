# AGENTS.md — rules for any coding agent on this repo
Product: PowerLift AI — a coach↔client gym platform. Athlete picks **Powerlifting** or **Bodybuilding** at onboarding (two separate domains). Athlete trains from AI programs, logs everything, optionally hires a human coach.

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
10. Match the design tokens in tokens.css. No ad-hoc colors/spacing.

## Working style (token-efficient)
- Read only the files a task needs. Prefer `grep` to opening big files.
- Plan in ≤10 lines, then implement. Report: changed files, tests run, open issues.
- If a spec is ambiguous, choose the simplest option, note it in `docs/DECISIONS.md`, continue.

## UI Rules (AGENTS_UI.md)
1. **Mobile-first.** Build at 360 px, then scale up at `md` 768 and `lg` 1024/1280. Never ship a screen that scrolls sideways.
2. **Tokens only.** Colors/spacing/radius come from `tokens.css` via Tailwind theme names (`bg-surface`, `text-muted`, `text-accent`). No raw hex, no inline `style={{}}` for color/spacing.
3. **One component per job, < 300 lines.** Reuse `src/ui/*`. Don't create a new button/card/modal style.
4. **Touch targets ≥ 44 px** (≥ 56 px in workout mode). Inputs ≥ 16 px font (stops iOS zoom). Numeric fields use `inputMode="decimal|numeric"`.
5. **Do not disable zoom.** Never use `maximum-scale` / `user-scalable=no`.
6. **Every screen has loading (skeleton), empty, error, offline states.**
7. **Navigation**: bottom tab bar < `lg`, left rail ≥ `lg`. Max 5 primary destinations. No search-in-sidebar mega menus for athletes.
8. **Safe areas**: use `pb-safe`/`pt-safe` utilities on fixed bars.
9. **Motion** ≤ 200 ms, respects `prefers-reduced-motion`. No decorative animation in workout mode.
10. **Copy**: direct coach tone, no "TITAN OS" jargon, no hype, no fake stats/testimonials.
11. Before finishing a task: check 360×800, 768×1024, 1280×800 and report any screen that fails.
