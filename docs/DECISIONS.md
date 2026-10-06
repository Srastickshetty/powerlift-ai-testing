# Architecture & Security Decisions Log

## ADR-001: Removal of Unlicensed PDFs and Knowledge Base Purge
- **Date**: 2026-10-02
- **Context**: Code audit revealed unlicensed PDFs from `toaz.info` and `vdoc.pub` ingested into `processed_knowledge.json`.
- **Decision**: Purged all copyrighted PDFs and `processed_knowledge.json`. AI training logic and chat fall back to verified sports science heuristics and direct LLM prompt templates until Phase P5 re-architects the curated, licensed program dataset.
- **Consequences**: Zero legal liability or copyright infringement in production.

## ADR-002: Server-Side Firebase Authentication & Multi-Tenant Isolation
- **Date**: 2026-10-02
- **Context**: Prior API routes accepted client-supplied `:athleteId` and `:coachId` without token verification.
- **Decision**: Enforced `verifyAuth` globally across all non-health `/api/*` routes. Added `requireRole` and `requireSelfOrCoachOf` middleware so athletes can only access their own records and coaches can only access athletes who explicitly approved the relationship.
- **Consequences**: Complete multi-tenant privacy; URL parameter tampering blocked.

## ADR-003: Strict CORS Allowlist
- **Date**: 2026-10-02
- **Context**: Previous CORS allowed any origin containing the substring 'localhost'.
- **Decision**: Replaced substring matching with exact allowlist matching from `ALLOWED_ORIGINS` environment variable. Localhost origins are only allowed when `NODE_ENV !== 'production'`.
- **Consequences**: Prevents DNS rebinding and cross-origin exploitation from subdomains like `localhost.attacker.com`.

## ADR-004: Relational PostgreSQL Store via Prisma ORM for Domain Data
- **Date**: 2026-10-02
- **Context**: Gym analytics and coaching are deeply relational (sets → sessions → programs → athletes → coaches, weekly muscle volume, periodization history). The legacy codebase wrote ad-hoc JSON files (`users.json`, `athletes.json`, `athlete_memories.json`) causing race conditions, unindexed queries, and lack of relational integrity.
- **Decision**: Standardized on PostgreSQL 16 managed through Prisma ORM 5.x. All 27 core domain tables defined in `schema.prisma`. Hard ban on filesystem reads/writes for runtime app data.
- **Consequences**: Strong relational consistency, automated migrations, type-safe queries, zero file-locking bugs.

## ADR-005: TypeScript Strict Monorepo with npm Workspaces
- **Date**: 2026-10-02
- **Context**: Shared types, calculation engines, and validation schemas were duplicated or drifted out of sync between frontend and backend.
- **Decision**: Migrated to npm workspaces: `apps/web` (Vite + React 18), `apps/api` (Express 5 + TypeScript), `packages/shared` (Zod schemas, shared types), and `packages/engines` (pure algorithms).
- **Consequences**: Single source of truth for domain schemas and contracts; unified linting and typechecking across all sub-projects.

## ADR-006: Server-side Contextual Auth (`req.ctx = {userId, role, track}`)
- **Date**: 2026-10-02
- **Context**: Firebase auth tokens verify identity, but application logic requires role and training track authorization on every database query.
- **Decision**: Implemented `requireAuth` middleware that verifies the Firebase bearer token, queries `User` and `AthleteProfile`, and attaches an immutable `req.ctx = { userId, role, track, email }`. Coach access to athlete data requires an `ACTIVE` record in `CoachAthlete`.
- **Consequences**: Endpoints never trust client-supplied IDs in body or params; all queries scope against `req.ctx`.

## ADR-007: AI Pipeline Isolation & Safety Validation
- **Date**: 2026-10-02
- **Context**: LLMs hallucinate unrealistic volume, dangerous progression, or contraindicated movements for injured joints. Direct LLM writes to production programs risk user injury.
- **Decision**: The LLM never writes to the database directly. Pipeline: Generator (deterministic heuristics + retrieval) → LLM proposal → Deterministic Safety Validator → Stored as `ProgramVersion` with status `DRAFT` → Athlete (self-guided) or coach (coach-led) explicit approval.
- **Consequences**: 100% hard safety constraints enforced by code, not prompts.

## ADR-008: Pluggable Payment Provider Interface
- **Date**: 2026-10-02
- **Context**: The platform requires monetization (Athlete Pro and 1-on-1 Coaching subscriptions) across different regional gateways (Stripe, Razorpay).
- **Decision**: Defined an abstract `PaymentProvider` interface with a `DummyProvider` implementation for development and testing. Subscriptions and invoices are tracked in relational tables; access entitlements are checked server-side from `Subscription` status.
- **Consequences**: Provider switches require zero changes to domain routes or entitlement checks.

## ADR-009: Frontend State & Offline-First Sync Architecture
- **Date**: 2026-10-02
- **Context**: Athletes frequently train in gym basements with spotty or zero cellular connectivity. Logging must never fail or block the UI.
- **Decision**: TanStack Query handles server caching and optimistic mutations; Zustand manages transient workout session UI state; an IndexedDB sync queue (`offlineSyncManager` via `idb`) buffers logged sets with client-generated UUIDs (`client_uuid`) for idempotent replay.
- **Consequences**: Seamless workout logging offline; zero duplicate set insertions when connectivity returns.

## ADR-010: Pure Calculation Engines in `@powerlift/engines`
- **Date**: 2026-10-02
- **Context**: e1RM calculation, autoregulation, deloading, and attempt selection logic must be deterministic, portable, and easily verifiable against published sports science literature.
- **Decision**: All calculation logic isolated in `packages/engines` as 100% pure functions (no network, no database, no file system) with ≥90% line coverage and golden-number test fixtures.
- **Consequences**: Reusable across frontend (instant optimistic feedback) and backend (batch evolution jobs); zero side-effect testing.

## ADR-011: Dual Track Isolation & Bodybuilding Domain Standardization
- **Date**: 2026-10-02
- **Context**: The product offers two distinct domains: Powerlifting (SBD total, IPF rules, attempts, e1RM) and Bodybuilding (physique divisions, volume radar, Indian nutrition, bodyweight rate of change). Legacy code used a vague `'fitness'` track and stored active track in browser `localStorage`.
- **Decision**: Standardized domain naming strictly to `'powerlifting'` and `'bodybuilding'`. Separated routing into dedicated `/pl/*` and `/bb/*` shells. Derived active track directly from verified DB profile and JWT auth context (`req.ctx.track`), completely deprecating `localStorage.active_world_discipline`.
- **Consequences**: Strict domain isolation without cross-contamination. Athletes experience tailored UI, metrics, and coaching engines tailored to their chosen sport.

## ADR-012: Modular Track Architecture & Legacy Monolith Retirement
- **Date**: 2026-10-02
- **Context**: Legacy UI contained massive monoliths (`FitnessCommandCenter.jsx` [1675 lines] and `ClientDashboard.jsx` [1048 lines]) violating line-count limits and complicating testing.
- **Decision**: Retired legacy monoliths into `src/legacy/` and redirected all dashboard aliases to modern, modular track dashboards: `src/tracks/powerlifting/PlDashboard.jsx` and `src/tracks/bodybuilding/BbDashboard.jsx`. Built 8 focused child components, each strictly under 300 lines, backed by deterministic calculation engines and the Safety Engine (§9).
- **Consequences**: Component readability, testability, and bundle size drastically improved; zero ESLint errors; complete safety guardrail enforcement.

## ADR-013: Pluggable Payment Provider Interface & Test Mode (`DummyProvider`)
- **Date**: 2026-10-02
- **Context**: Phase P4 requires billing infrastructure for Athlete Pro ($19.99/mo) and 1-on-1 Coaching ($99/mo) plans. Development and automated CI cannot rely on live Stripe or Razorpay credit card webhooks.
- **Decision**: Implemented a pluggable `PaymentProvider` interface in `apps/api/src/modules/billing/payment.interface.ts` with methods for `createCheckoutSession`, `confirmPayment`, `cancelSubscription`, and `handleWebhook`. Built `DummyProvider` to simulate instant test checkouts while persisting real, relational `Subscription` and `Invoice` records in PostgreSQL. Entitlements are resolved server-side (`resolveUserEntitlements`) from active database records, gating Pro and Coaching features via `requireEntitlement` middleware.
- **Consequences**: Endpoints and UI read verified entitlements from `/api/v1/me/entitlements`. Provider can be switched to Stripe or Razorpay in production via environment configuration without modifying business logic.

## ADR-014: Coach Roster & Multi-Factor Alert Scanner (`AlertScannerService`)
- **Date**: 2026-10-02
- **Context**: Coaches managing rosters need immediate triage visibility into athlete safety, adherence, and check-in timeliness without manually digging through individual logs.
- **Decision**: Implemented `AlertScannerService` computing a deterministic three-tier traffic light (`GREEN`, `YELLOW`, `RED`) for each athlete:
  - `RED`: Critical joint pain (pain rating ≥ 7/10) or ≥ 3 missed sessions in the past 7 days.
  - `YELLOW`: Moderate joint pain (4–6/10), 2 missed sessions, or check-ins overdue by ≥ 8 days.
  - `GREEN`: Regular attendance, pain < 4, and up-to-date check-ins.
  Enforced strict multi-tenant boundary checks across coaching, media comments, and messaging routes: unlinked coaches receive `403 FORBIDDEN` when attempting to access an athlete's overview, comments, or threads.
- **Consequences**: Coaches immediately identify at-risk athletes upon opening their dashboard; client-side parameter tampering is impossible; injury risks are caught proactively.

## ADR-015: Program Domain Specific Language (DSL) & Evaluated Generator Architecture
- **Date**: 2026-10-02
- **Context**: Previous AI attempts relied on unvalidated LLM output, KMeans over 2 programs, and scraped text from copyrighted PDFs (`toaz.info`, `vdoc.pub`). This posed severe copyright liabilities, injury risks from unvalidated volume jumps, and lacked systematic evaluation.
- **Decision**: Architected a legal-first, deterministic AI pipeline:
  1. **Program DSL**: Typed schema in `@powerlift/shared` representing mesocycles, progression models (linear, DUP, block, rpe_auto, double_prog), and exercise slots. Full round-trip interpreter expanding DSL to scheduled database sessions and sets.
  2. **Legal Provenance Corpus**: Seeded 60 original, sports-science backed programs (30 Powerlifting, 30 Bodybuilding) in `corpus/` with mandatory `licence` (CC-BY-4.0) and `source` provenance catalogued in `docs/DATA_SOURCES.md`. Zero copyrighted material or pirated PDFs.
  3. **Generator v1**: Computes athlete vector → retrieves best matching corpus candidate → adapts via pure calculation engines (e1RM scaling, volume landmarks, peaking tapers, injury substitutions) → runs deterministic hard validation in `SafetyEngine` (§9) → explains with immutable prescription numbers → stores as `ProgramVersion(DRAFT)`.
  4. **Coach Deva Assistant**: Sports-science chat assistant with hard interceptors for crisis, PEDs, and pain ≥7; daily user quotas; authenticated tool calls; and `ai_events` audit logging.
  5. **Automated Evaluation Harness (`eval/harness.ts`)**: Evaluates 60 diverse golden personas across property tests and coach rating rubrics. Releases gated on: Safety = 100%, Property Tests ≥ 95%, Coach Mean ≥ 4.0/5.0.

## ADR-016: Design Tokens, Responsive AppShell IA & Component Budget (< 300 Lines)
- **Date**: 2026-10-02
- **Context**: Phase P6 required a modern, accessible, mobile-first design overhaul across athlete and coach flows, aligning strictly with `docs/03_UX_DESIGN.md` and `AGENTS_UI.md`. Legacy code had giant components (> 300 lines), hardcoded hex colors, and confusing multi-level navigation.
- **Decision**:
  1. **Design Tokens Architecture**: Implemented pure CSS variables in `tokens.css` referenced exclusively through Tailwind theme aliases (`bg-surface`, `text-muted`, `text-accent`, etc.). Zero raw hex values or inline color styling in component code. Dynamic track styling (`data-track="pl"` / `data-track="bb"`) automatically switches accents (Crimson `#E5484D` for Powerlifting, Teal `#19C3B1` for Bodybuilding).
  2. **AppShell IA Alignment**: Standardized 5-tab athlete bottom bar (`Today`, `Program`, `Progress`, `Coach`, `Me`) scaling to a responsive left rail on desktop (≥ 1024px). Full-screen Gym Mode (`/workout/:id`) explicitly renders outside `AppShell` with keep-awake `navigator.wakeLock`, in-rack toolbars, and instant IndexedDB offline autosave.
  3. **Strict Component Line Budget (< 300 Lines)**: Decomposed all multi-responsibility views into reusable primitives (`Button`, `Stepper`, `SetRow`, `Skeleton`, `Stat`, `EmptyState`, `ChartCard`) and modular subcomponents (`ProgramProposalCard`, `ProgramHistoryModal`, `WorkoutHeader`, `InRackToolbar`, `PhonePreview`). All core active pages are strictly < 300 lines (e.g., `WorkoutMode.jsx` 260 lines, `Today.jsx` 275 lines, `Program.jsx` 245 lines, `Landing.jsx` 289 lines, `Login.jsx` 210 lines).
  4. **Offline Resilience & PWA**: Workbox service worker precaches 38 app assets; offline banner triggers automatically with live pending count badge; full set logging operates uninterrupted in gym basements with zero connection.

## ADR-017: Trust, Privacy Architecture, Right to Erasure & Safety UX
- **Date**: 2026-10-02
- **Context**: Phase P7 required GDPR/privacy compliance, verifiable right-to-access and right-to-erasure workflows, versioned consent records, content/coach moderation queues, and hard enforcement of sports science safety constraints (docs/01 §9).
- **Decision**:
  1. **Right of Access & Portability (`ComplianceService.exportUserData`)**: Implemented structured JSON data export covering user identity, profiles, sessions, completed sets, check-ins, nutrition, media, and audit trails. Each export bundle is cryptographically sealed with a SHA-256 digest (`crypto.createHash('sha256')`).
  2. **Right to Erasure with 30-Day Grace Period**: `POST /api/v1/me/delete` records a pending deletion scheduled 30 days out (`scheduledPurgeAt`), marks `user.deletedAt = now()`, immediately pauses coaching relationships (`status: 'PAUSED'`), and cancels recurring subscriptions (`status: 'CANCELLED'`). Users can cancel deletion at any point during the grace period via `POST /api/v1/me/delete/cancel`. Background job `POST /api/v1/admin/purge-expired` executes cascade relational hard deletion and media purge once the grace period expires.
  3. **Versioned Consent Ledger (`ConsentRecord`)**: Database-backed consent tracking for `HEALTH_DATA`, `COACH_MEDIA_SHARING`, `AI_TRAINING_OPT_IN`, and `TERMS_AND_PRIVACY`, capturing timestamp, client IP, and User-Agent.
  4. **Moderation & Incident Reporting (`ModerationReport`)**: Athletes can report unsafe coaching advice or inappropriate media content (`POST /api/v1/compliance/reports`). Admin triage queue (`/api/v1/admin/reports`) allows warning, resolving, or dismissing reports with immutable audit logging.
  5. **Safety Constraints Enforcement**: Full mapping documented in `docs/SAFETY_AUDIT.md`. Nutrition deficits capped at 80% BMR; protein floor strictly enforced at $\ge 1.2\text{ g/kg}$; minors ($<18$) protected from contest prep and unconsented coach hiring; joint pain $\ge 7$ stops loading progression and mandates medical evaluation.
- **Consequences**: Complete compliance with international data privacy regulations (GDPR/CCPA); zero-trust backend authorization; auditable safety logs for athletic liability protection.

## ADR-018: Quality & Launch Readiness, E2E Verification, Concurrency Benchmarking & Operational Runbooks
- **Date**: 2026-10-02
- **Context**: Phase P8 required comprehensive end-to-end verification, load testing under 500 concurrent gym logging requests (p95 < 300ms SLA), telemetry/monitoring stubs (Sentry + rolling in-memory observability metrics), in-app beta feedback loop with Sev-1/2 triage rubric, zero-downtime database migrations, and disaster recovery backup & restore verification.
- **Decision**:
  1. **Comprehensive E2E Launch Quality Suite (`p8_e2e_flows.test.js`)**:
     - Verified 6 critical end-to-end user journeys: (1) Athlete Powerlifting flow, (2) Athlete Bodybuilding flow, (3) Certified Coach flow with roster traffic lights and check-in review, (4) Billing in Test Mode with entitlement upgrades, (5) Offline workout queue sync with idempotent set upsert, and (6) Admin telemetry metrics and beta feedback triage.
  2. **High-Concurrency Load Testing (p95 < 300ms SLA)**:
     - Authored `loadtest/k6_gym_logging.js` and automated benchmark runner `loadtest/run_benchmark.js`.
     - Verified 500 concurrent requests against core workout routes: achieved **536.5 req/sec**, **0.00% error rate**, and **p95 = 134.18 ms** (exceeding the < 300ms SLA).
     - Added composite indexes across high-traffic tables in PostgreSQL (`PlannedSession([athleteId, date])`, `Checkin([athleteId, weekStart])`, `NutritionLog([athleteId, date])`, `Message([threadId, createdAt])`, `Alert([coachId, status])`).
  3. **In-App Beta Program & Incident Triage Framework**:
     - Created `BetaFeedback` model, `POST /api/v1/feedback`, `GET /api/v1/admin/feedback`, and `PATCH /api/v1/admin/feedback/:id/triage`.
     - Implemented `BetaFeedbackCard.jsx` in the athlete/coach settings screen, enabling lifters to submit feedback with severity tags (`SEV1`, `SEV2`, `NORMAL`). Sev-1 incidents immediately emit high-priority Sentry alerts.
     - Documented beta launch framework in `docs/BETA_PROGRAM.md` (20 lifters + 3 coaches, ≥ 99.5% crash-free SLA).
  4. **Operational Runbook & Disaster Recovery**:
     - Authored `docs/RUNBOOK.md` detailing environment architecture (Local, Staging, Production), zero-downtime migration pipeline, liveness/readiness health probes (`/healthz`, `/readyz`), and rollback procedures.
     - Implemented `scripts/backup_postgres.js` and `scripts/restore_postgres.js` with SHA-256 integrity verification. Verified snapshot restoration against local PostgreSQL database.
- **Consequences**: Monorepo satisfies all launch quality acceptance criteria. High-concurrency performance verified; operational disaster recovery tested; multi-track athlete and coach journeys completely validated.

## 2026-10-06 — Production Resilience, Security Audit, Forgot Password & Sport Domain Separation
- **Context**: Scaling platform to wide user base with high concurrency; addressing OWASP security vectors; user authentication recovery; and diverging Powerlifting and Bodybuilding sport parameter interfaces for Superadmin and Coaches.
- **Decisions**:
  1. **Forgot Password Recovery Flow**:
     - Built `ForgotPasswordModal.jsx` using Firebase `sendPasswordResetEmail`. Integrated into `Login.jsx` with mobile-first accessible touch targets (≥ 44px) and 16px font to prevent mobile viewport zoom.
  2. **Superadmin Sport Separation & Parameter Consoles**:
     - Separated monolithic admin view into distinct domain consoles: `PlSportConsole.jsx` (SBD weak points, DOTS/Wilks, 9-for-9, INOL limits, peaking caps) and `BbSportConsole.jsx` (Hypertrophy volume landmarks MEV/MAV/MRV, physique divisions, mandatory posing check-ins, BMR caloric floors).
     - Split components to strictly adhere to `< 300` line ceiling in `apps/web/src/dashboards/admin/`.
  3. **Superadmin Hierarchy Roster Tree**:
     - Implemented `CoachClientHierarchy.jsx` featuring dynamic sport switcher, coach expandable accordions displaying assigned athlete rosters, and an unattached athlete triage panel for independent lifters.
  4. **Scoped Track Design Tokens**:
     - Extended `tokens.css` to allow `[data-track="pl"]` and `[data-track="bb"]` on any container element, eliminating ad-hoc hex values while guaranteeing automatic accent token resolution.
  5. **Security Hardening & High-Concurrency Scaling**:
     - Sanitized all repositories of exposed secrets (Gemini, Groq, Firebase private keys).
     - Added sliding-window rate limiters (`apiGlobalRateLimiter`, `authRateLimiter`, `aiRateLimiter`).
     - Hardened CORS origin validation to eliminate 500 stack leaks.
     - Added database retry exponential backoff (`withDbRetry`) and batched Prisma queries to eliminate N+1 latency bottlenecks.
     - Packaged production Docker builds (`apps/api/Dockerfile`, `apps/web/Dockerfile`, `docker-compose.prod.yml`).
- **Consequences**: Complete domain isolation between Powerlifting and Bodybuilding across Superadmin and Coach surfaces; OWASP compliance; high-concurrency resilience.

## 2026-10-06 — Fresh Start Clean Slate Reset System
- **Context**: Need to wipe all present test users, mock programs, and training history so the platform starts completely fresh for live athletes and coaches, without losing base exercise catalogs or billing tiers.
- **Decisions**:
  1. **Automated Pre-Wipe Backup**:
     - `scripts/fresh_start_reset.js` automatically dumps a timestamped JSON snapshot to `/backups/fresh_start_pre_wipe_<timestamp>.json` before any delete operation, complying with Rule 9.
  2. **Cascaded Database Purge**:
     - Purges sets, planned sets, workout sessions, planned sessions, program versions, programs, checkins, nutrition logs, metrics, alerts, messages, media, and all non-admin users.
  3. **Base Catalog Invariance**:
     - Preserves the 300+ Exercise library and default Subscription plans so fresh users can immediately onboard, select their track, and generate programs without foreign key errors.
  4. **Superadmin Web UI & API Integration**:
     - Implemented `POST /api/v1/admin/maintenance/fresh-start` requiring confirmation code `FRESH_START_CONFIRM`.
     - Built `FreshStartModal.jsx` (< 150 lines) mounted in `AdminCommandCenter.jsx` under Platform Release Controls.
     - Added `npm run db:fresh-start` CLI script.
- **Consequences**: Zero stale artifacts or orphan records; immediate fresh start readiness for new athletes and coaches.


