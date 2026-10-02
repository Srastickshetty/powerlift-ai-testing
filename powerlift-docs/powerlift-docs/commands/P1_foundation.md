# P1 — Foundation (monorepo, TS, DB, CI)
Read: docs/02_ARCHITECTURE.md. Preserve behaviour of working features; move old code to `/legacy` and port by module in later phases.
## Tasks
1. Convert to npm workspaces: `apps/web` (existing frontend, Vite), `apps/api` (new TS Express 5), `packages/shared`, `packages/engines`.
2. Tooling: TypeScript strict, ESLint + Prettier, Vitest (engines/shared/web), Vitest+Supertest (api), Husky pre-commit (lint, typecheck), root scripts `dev, test, lint, typecheck, build`.
3. Postgres via Docker compose; Prisma schema for ALL tables in docs/02 (users, profiles, coach, billing, exercises, programs, sessions, sets, checkins, media, messages, alerts, audit, ai_events). First migration + seed script (2 coaches, 6 athletes both tracks, 12 weeks fake logs, 300 exercises stub).
4. API skeleton: config (zod env), logger (pino), error handler, request-id, `requireAuth` (port from P0), module folders, `/healthz`, `/readyz`, OpenAPI generated from zod.
5. Port `e1rmCalculator`, `deloadEngine`, `autoregulationEngine`, `competitionAttemptEngine`, `weeklyEvolutionEngine` into `packages/engines` as pure functions with unit tests (golden numbers from known e1RM tables).
6. Data migration script from Firestore/JSON → Postgres (dry-run flag, idempotent).
7. GitHub Actions: install, lint, typecheck, test, build, prisma validate.
8. docs/DECISIONS.md started.
## Acceptance checklist
- [ ] `docker compose up` + `npm run dev` runs api+web; `/healthz` ok
- [ ] `npm test`, `npm run typecheck`, `npm run lint` green in CI
- [ ] Engines ≥90% line coverage
- [ ] Seed produces browsable data; no `fs` writes for app data anywhere
