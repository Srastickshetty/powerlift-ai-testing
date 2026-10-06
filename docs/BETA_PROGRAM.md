# Beta Program Framework — PowerLift AI

## 1. Beta Cohort Architecture

The closed beta operates with a targeted initial cohort designed to validate both tracks and the human coaching loop:

- **Athletes:** 20 verified lifters
  - **10 Powerlifting Athletes:** Ranging from novice to competitive IPF/WRPF athletes testing SBD attempt strategy, autoregulation, and meet prep peak protocols.
  - **10 Bodybuilding Athletes:** Testing hypertrophy volume landmarks (MV, MEV, MAV, MRV), weekly scale weight & photo check-ins, and biofeedback tracking.
- **Coaches:** 3 Certified Human Coaches
  - Managing rosters, reviewing check-ins, delivering direct video/macro feedback, and adapting client programs via Copilot mode.

---

## 2. In-App Feedback & Incident Triage Rubric

Athletes and coaches submit feedback directly in-app through the **Beta Program Feedback Card** located in the `Me` settings tab (`/api/v1/feedback`).

| Severity | Definition | Alert Escalation | Target Resolution Time |
| :--- | :--- | :--- | :--- |
| **SEV-1** | Workout mode crash, set data loss, timer failure during active set, auth lockout, privacy leak | Immediate Sentry high-priority notification + Discord engineer webhook | **< 4 Hours** |
| **SEV-2** | Calculation discrepancy (e.g., e1RM rounding error), slow screen transition, delayed check-in sync | Daily engineering triage queue | **< 24 Hours** |
| **NORMAL** | Feature request, UI aesthetic tweak, minor copy change | Weekly sprint grooming | Planned backlog |

---

## 3. Weekly Review Metrics & Exit Gates

Weekly reviews track core performance against the metrics framework documented in `docs/05_METRICS.md`:

### Exit Criteria for Public Launch
1. **Zero Active Sev-1 Incidents:** No unresolved Sev-1 bugs in the last 14 consecutive days of beta operation.
2. **Crash-Free Session Rate:** $\ge 99.5\%$ of recorded workout sessions completed and saved without exception or unhandled promise rejection.
3. **Weekly Active Athlete Activation:** $\ge 60\%$ of onboarded beta athletes log $\ge 3$ workouts/week.
4. **Coach Check-In Review Latency:** $\le 24$ hours median response time from coach to athlete check-in submissions.
5. **Data Portability & Erasure SLA:** Complete export archive generated in $< 500\text{ ms}$, with verified SHA-256 digest.
