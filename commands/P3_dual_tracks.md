# P3 — Dual tracks (separate domains)
Read: docs/01 §3–4, §9; docs/03.
## Tasks
1. Rename pathway `'fitness'` → `'bodybuilding'` everywhere (migration + code). Track lives in DB profile and JWT-backed `/me`, not localStorage. Routing: `/pl/*` and `/bb/*` shells; shared `features/` only for log/history/checkins.
2. **Powerlifting engine** (`engines/periodization`, `attempts`): linear, DUP, block, RPE-auto, percentage templates; weak-point→variation mapping; weekly volume/INOL/fatigue index; peaking+taper; attempt planner; DOTS/IPF GL/Wilks; meet mode UI (port existing Competition components, simplified).
3. **Bodybuilding engine** (`engines/volume`, `nutrition`): MV/MEV/MAV/MRV per muscle, mesocycle builder with RIR ramp + deload, double progression, split selector, exercise rotation, volume radar (planned vs actual), intensity techniques gating, bodyweight 7-day avg + rate, measurements/photos, TDEE→targets→weekly auto-adjust, Indian food/budget engine (port existing), prep phases (age ≥18; peak week only with coach).
4. Break up `FitnessCommandCenter.jsx` and `ClientDashboard.jsx` by feature into track folders (each <300 lines).
5. Safety engine (`engines/safety`) with every rule in docs/01 §9 + unit tests; used by both tracks and by AI.
6. Weekly evolution job per track producing `program_version(DRAFT)` + rationale.
## Acceptance checklist
- [ ] Two separate onboarding→program→log→analytics journeys pass E2E
- [ ] Safety rule tests 100% pass; guard cannot be bypassed via API
- [ ] No `fitness` string left; no track data in localStorage
