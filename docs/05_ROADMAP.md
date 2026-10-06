# 05 — Roadmap (execute in order; each phase = one `commands/` file)
Estimates assume one developer + IDE agent. Don't start phase N+1 before N's checklist passes.

| Phase | Goal | Time | Exit gate |
|---|---|---|---|
| P0 Security & cleanup | Stop being hackable; remove legal risk | 2–3 d | No unauthenticated data route; secrets rotated; PDFs removed |
| P1 Foundation | Monorepo, TS, Postgres, auth middleware, CI | 4–6 d | `npm test` green in CI; /healthz; migrations run |
| P2 Core athlete loop | Onboarding, Today, workout logging, history, offline | 1.5–2 wk | Full session loggable offline→sync; e2e test |
| P3 Dual tracks | Powerlifting & Bodybuilding engines + screens | 2–3 wk | Both tracks generate, adapt, analyse |
| P4 Coach & payments | Marketplace, roster, check-ins, chat, video, dummy billing | 2–3 wk | Athlete hires coach end-to-end in test mode |
| P5 AI engine | DSL, corpus, generator, validator, eval | 2–3 wk | Eval gates pass; AI proposals explainable |
| P6 UI/UX overhaul | Design system, split god components, a11y | 1.5–2 wk | Lighthouse ≥90 PWA/perf/a11y; old dashboards deleted |
| P7 Trust & compliance | Privacy, export/delete, consent, safety UX, moderation | 1 wk | Policy pages, data export works, safety rules audited |
| P8 Quality & launch | E2E, load test, monitoring, beta | 1–2 wk | 20-athlete + 3-coach beta with zero Sev-1 |

## Definition of Done (every task)
Types + zod · authz check · unit tests · happy-path + error-path · loading/empty/error UI · a11y pass · logged via logger · docs/DECISIONS.md updated if a decision was made.

## Parking lot (flag-gated, after P8)
Indian meet finder, Instagram scout, vision biomechanics/bar-path, tempo audio coach, wearable import (HRV/sleep), federation integrations, coach marketplace payouts via real provider, native apps (Capacitor), team/gym accounts, community leaderboards.

## Success metrics
Activation: onboarding→first logged session within 48 h ≥ 60% · W4 retention ≥ 40% · adherence ≥ 75% · AI proposal acceptance ≥ 70% · coach time per athlete/week ↓ 50% vs spreadsheet · crash-free sessions ≥ 99.5%.
