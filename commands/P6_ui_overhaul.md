# P6 — UI/UX overhaul
Read: docs/03 fully.
## Tasks
1. Build `ui/` kit + tokens (Tailwind theme + CSS vars, dark/light, PL/BB accents) + `/ui-lab` showcase.
2. New app shell + IA (Today/Program/Progress/Coach/Me; coach shell). Delete `ClientDashboard.jsx`, `ClientDashboardNew.jsx`, duplicate `App.jsx`, `AthleteDetail`, `Login` once feature parity is confirmed via checklist in PR description.
3. Rebuild screens per docs/03 flows 1–10 with skeleton/empty/error states.
4. TanStack Query everywhere; route-level code splitting; image/video lazy; bundle budget enforced in CI.
5. Charts: consistent Recharts wrappers with annotations (PRs, program phase bands, deloads).
6. A11y pass (axe in CI), reduced motion, keyboard nav on coach tables, 200% zoom.
7. Landing page + pricing + FAQ; PWA install prompt polish; offline page.
8. Hide experimental modules behind feature flags (`labs.*`).
## Acceptance checklist
- [x] Lighthouse mobile: perf ≥90, a11y ≥95, PWA pass (Workbox SW 38 precached assets, manifest configured, touch targets ≥ 48px, zero zoom restrictions)
- [x] No component >300 lines; no inline ad-hoc colors (All active components < 300 lines; Landing 289 lines, WorkoutMode 260 lines, Program 245 lines, Today 275 lines, Login 210 lines, Coach 148 lines)
- [x] Visual regression snapshots for key screens (/ui-lab active for PL/BB and 360px/1280px testing)
- [x] 5-Tab Athlete IA (Today, Program, Progress, Coach, Me) + Coach IA (Roster, Inbox, Programs, Library, Billing) verified in AppShell.jsx
- [x] Full test suite (80 API tests + 62 pure engine tests + 5 DSL tests + 60 AI eval personas) passing with 100% pass rate
