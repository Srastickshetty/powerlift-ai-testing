# P2 — Core athlete loop (the gym simulation)
Read: docs/01 §1–2, §5; docs/03 flows 1–4.
## Tasks
1. Onboarding API+UI: track choice screen → stepper (common + track-specific fields) → Coach Brief → Week 1. Persist in `athlete_profiles`/`pl_profile`/`bb_profile`. Resume support. Under-18 flag → safe mode.
2. Exercise library: CRUD (admin), search, filters, substitutes, import 300-exercise seed (own data; no scraped media — use placeholders).
3. Programs minimal: template program per track assigned at onboarding (full AI in P5). `planned_sessions/sets` materialised weekly.
4. `GET /today`, workout mode UI: set cards, steppers, RPE/RIR chips, set types, pain flag, as-prescribed tap, ghost values, rest timer, plate calculator, warm-up ladder (reuse existing logic), swap exercise, finish sheet, summary with PRs.
5. Idempotent set sync: `client_uuid`; offline queue on IndexedDB; conflict policy server-wins by `updated_at`; sync badge.
6. History + basic charts (e1RM, volume, bodyweight) via `/analytics/*`.
7. Live autoregulation suggestions via `engines/autoreg` with safety clamps.
8. Missed-session handling (shift/compress/drop).
9. E2E (Playwright): onboard → start → log 10 sets offline → reconnect → summary matches server.
## Acceptance checklist
- [ ] Log a set in ≤2 taps; UI responds <100 ms
- [ ] Full session works offline and syncs without duplicates
- [ ] Data visible in history/analytics; PR detection correct (unit tests)
- [ ] a11y: all inputs labelled, targets ≥56 px in workout mode
