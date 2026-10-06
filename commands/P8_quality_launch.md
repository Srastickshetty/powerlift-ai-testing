# P8 — Quality & launch
## Tasks
1. Playwright E2E suites: athlete PL, athlete BB, coach flows, billing(test mode), offline sync, admin.
2. Load test (k6): 500 concurrent logging users, p95 <300 ms; DB indexes reviewed; slow-query log.
3. Monitoring: Sentry (web/api), uptime check, structured logs, dashboards (errors, latency, AI cost, active users), alerting.
4. Staging + prod environments, migrations pipeline, backups, rollback runbook (`docs/RUNBOOK.md`).
5. Beta: 20 athletes + 3 coaches; in-app feedback; weekly review of metrics in docs/05; triage Sev-1/2.
6. Replace dummy payments with real provider only after beta (Razorpay for India / Stripe global), keep TEST MODE flag.
## Acceptance checklist
- [x] CI green incl. E2E; coverage targets met (engines ≥90%, api ≥70%)
- [x] Beta exit: zero Sev-1, crash-free ≥99.5%, activation ≥60%
- [x] Runbook tested (restore from backup once)
