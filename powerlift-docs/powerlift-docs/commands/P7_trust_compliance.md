# P7 — Trust, privacy, safety UX
## Tasks
1. Consent screens (health data, photos/video sharing with coach, AI-training opt-in), versioned consent records.
2. Data export (`POST /me/export` → ZIP JSON/CSV) and account deletion (30-day grace, hard delete job, media purge, audit).
3. Privacy Policy, Terms, medical/coaching disclaimer, coach agreement; cookie/analytics consent.
4. Safety UX for docs/01 §9: pain escalation sheet, youth mode, weight-cut/eating-disorder guards, crisis responses, "report coach/content" flow, admin moderation queue.
5. Security hardening: dependency audit, CSP, upload scanning/type checks, signed URL expiry, secrets scanning in CI, backup/restore runbook, rate limits, audit log views.
6. Accessibility statement and content review of all AI copy.
## Acceptance checklist
- [ ] Export + delete verified end-to-end
- [ ] Safety rule audit doc (`docs/SAFETY_AUDIT.md`) maps each rule → code → test
- [ ] Pen-test checklist (OWASP ASVS L2 subset) completed
