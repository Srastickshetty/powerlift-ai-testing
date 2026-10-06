# Operations & Deployment Runbook — PowerLift AI

## 1. Environment Architecture & Configuration

| Environment | Purpose | Database | Base URL | Observability |
| :--- | :--- | :--- | :--- | :--- |
| **Local Dev** | Rapid iteration & unit testing | PostgreSQL 16 (`powerlift_dev`) | `http://localhost:5173` / `:4000` | Pino Pretty Console |
| **Staging** | Pre-release validation & E2E smoke tests | Neon / Supabase Managed PostgreSQL | `https://staging.powerlift.app` | Sentry Staging + Telemetry API |
| **Production** | Live athletes & certified coaches | Multi-AZ High-Availability PostgreSQL | `https://powerlift.app` | Sentry Prod + Uptime Heartbeats |

### Core Environment Variables (`.env.production`)
- `NODE_ENV=production`
- `PORT=4000`
- `DATABASE_URL=postgresql://<user>:<pwd>@<primary-host>:5432/<db>?sslmode=require`
- `FIREBASE_PROJECT_ID=powerlift-ai`
- `SENTRY_DSN=https://<key>@o<org>.ingest.sentry.io/<project>`
- `ALLOWED_ORIGINS=https://powerlift.app,https://coach.powerlift.app`

---

## 2. Zero-Downtime Database Migration Pipeline

All schema modifications follow a strictly non-breaking, expand-and-contract lifecycle:

1. **Step 1 (Expand):** Add columns or models with defaults or optional attributes (`?`). Never remove or rename an active column in a single release.
2. **Step 2 (Prisma Deploy):**
   ```bash
   npx prisma migrate deploy --schema=apps/api/prisma/schema.prisma
   ```
3. **Step 3 (Deploy Application Code):** Roll out new service containers across the cluster. Both old and new API instances safely read and write to the expanded database schema.
4. **Step 4 (Contract / Cleanup):** Once all traffic is routed to the new code, drop legacy unused columns in a subsequent release.

---

## 3. Database Backup & Disaster Recovery

PowerLift AI maintains continuous point-in-time recovery (PITR) with automated daily snapshot exports and SHA-256 integrity verification.

### Creating a Snapshot Backup
Execute the automated backup script:
```bash
node scripts/backup_postgres.js
```
- **Output:** `backups/backup-<ISO_TIMESTAMP>.json`
- **Integrity:** Generates a cryptographic SHA-256 digest covering all relational tables (Users, Profiles, Programs, Sessions, Sets, Checkins, Feedback).

### Restoring from Backup
To restore a snapshot in a recovery event:
```bash
node scripts/restore_postgres.js [optional_path_to_backup.json]
```
- Automatically verifies SHA-256 checksum prior to writing.
- Restores in foreign key relational sequence (Users $\to$ Profiles $\to$ Coach Links $\to$ Programs $\to$ Sessions $\to$ Sets).
- Performs idempotent upserts to prevent data collision.

### Verification Report (Phase P8 Acceptance Gate)
- **Backup Created:** `backups/backup-2026-10-02T16-24-50-768Z.json`
- **SHA-256 Checksum:** `6fbd03fa5e88ee16bcde696be8e7b50743b448e1e92d3de87f2ec25526a4aaf4`
- **Restore Test:** Successfully executed via `node scripts/restore_postgres.js`. Checksum verified, 77 users, 36 athlete profiles, 77 programs, 54 sessions, and 173 sets verified and restored with zero validation errors.

---

## 4. Observability, Health Probes & Monitoring

### Probes & Heartbeats
- **Liveness Probe:** `GET /healthz`
  - Responds HTTP 200 `{ status: "ok", service: "@powerlift/api" }` if the process is running.
- **Readiness Probe:** `GET /readyz`
  - Executes `SELECT 1` on PostgreSQL. Returns HTTP 200 `{ status: "ready", database: "connected" }`. Returns HTTP 503 if the database is unreachable.
- **Telemetry Snapshot:** `GET /api/v1/admin/telemetry/metrics` (Admin-authenticated)
  - Real-time percentiles: p50, p90, p95, p99 latency.
  - Active users, error rate %, and AI engine token accumulation.

### Sentry Error Tracking
- Integrated across API (`apps/api/src/lib/telemetry.ts`) and Web (`apps/web/src/lib/telemetry.js`).
- Uncaught exceptions and unhandled promise rejections trigger Sentry events with redacted authorization tokens and sanitization.

---

## 5. Rollback & Emergency Incident Runbook

### Severity Definitions & Triage Rubric
- **Sev-1 (Critical Emergency):** Active workout crash, workout logging failure, security/privacy boundary breach, or database corruption.
  - **SLA:** Initial engineer response within 15 minutes. Fix or rollback deployed within 4 hours.
- **Sev-2 (Major Degradation):** Non-critical engine calculation discrepancy, delay in check-in notifications, or visual UI glitches that do not block workout logging.
  - **SLA:** Fix deployed within 24 hours.

### Rollback Procedure
1. Revert container traffic to previous image tag:
   ```bash
   git checkout <LAST_KNOWN_STABLE_TAG>
   npm run build
   ```
2. If database schema was expanded, verify backward-compatibility (the contract step must not have been executed yet).
3. Notify users via Global Broadcast Banner (`apps/web/src/components/GlobalBroadcastBanner.jsx`).
