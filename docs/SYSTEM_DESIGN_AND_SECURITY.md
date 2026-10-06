# PowerLift AI — High-Scale System Design, Security Architecture & Domain Separation

> **Status:** Production-Ready & Security Audited  
> **Target Audience:** Engineering, DevOps, SecOps, Coaches & Superadmin Team  
> **Date:** October 2026  

---

## 1. High-Level Design (HLD)

### 1.1 Architecture Topology
```
                     +---------------------------------------+
                     |         Clients (Mobile / Web)        |
                     |  - React 18 SPA + PWA Service Worker  |
                     |  - Offline Outbox / IndexedDB Sync    |
                     +-------------------+-------------------+
                                         | HTTPS / WSS
                                         v
                     +---------------------------------------+
                     |         Hardened Reverse Proxy        |
                     |           (Nginx Edge / Cloud)        |
                     |  - SSL Offloading, Security Headers   |
                     |  - Static Asset Compression & Caching |
                     +-------------------+-------------------+
                                         |
                                         v
                     +---------------------------------------+
                     |         API Gateway Layer             |
                     |  - CORS Safe Origin Validation        |
                     |  - Sliding-Window Rate Limiters       |
                     |  - Firebase Admin Token Authenticator |
                     |  - Request Tracing & Correlation ID   |
                     +-------------------+-------------------+
                                         |
        +--------------------------------+--------------------------------+
        |                                |                                |
        v                                v                                v
+---------------+               +-----------------+             +------------------+
| Training Svc  |               |  Coaching Svc   |             |   Admin Svc      |
| - SBD Sets    |               | - Client Roster |             | - Sport Domain   |
| - Hypertrophy |               | - Check-ins     |             | - Hierarchy Tree |
| - Deloads     |               | - Feedback      |             | - System Health  |
+-------+-------+               +--------+--------+             +--------+---------+
        |                                |                               |
        +--------------------------------+-------------------------------+
                                         |
                                         v
                     +---------------------------------------+
                     |       Data Layer & Concurrency        |
                     |  - PostgreSQL 16 (PgBouncer Pool)     |
                     |  - Redis 7 (LRU Session/Rate Cache)   |
                     |  - Exponential Transient DB Retries   |
                     +---------------------------------------+
```

### 1.2 Core Invariants
1. **Zero Client Trust:** Authentication is verified using Firebase Admin SDK server-side on every request. URL query parameters and payload IDs never confer authority.
2. **Strict Sport Isolation:** Powerlifting (`pl`) and Bodybuilding (`bb`) operate with independent parameter envelopes, fatigue calculations, and reporting logic.
3. **Resilience by Default:** Client-side offline cache and server-side fallback engines ensure zero disruption when upstream services or database connections experience transient lag.

---

## 2. Low-Level Design (LLD)

### 2.1 Concurrency & Connection Pooling
- **Prisma Connection Tuning:** Configured with `connection_limit=30`, `pool_timeout=10` per replica, preventing connection starvation during spike traffic.
- **Transient Retry Wrapper (`withDbRetry`):**
  - Catches transient connection faults (`P1001`, `P1002`, `P1008`, `P1017`).
  - Employs exponential backoff with jitter up to 3 retries.
- **Batch Processing & N+1 Elimination:**
  - Converted set logging and session hydration from sequential inserts to batched `createMany` transactions in [training.service.ts](file:///e:/powerlift-ai%20-%20Copy/apps/api/src/modules/training/training.service.ts).
  - Preloaded exercise references in bulk and batched planned set insertions via `createMany` in [ai.routes.ts](file:///e:/powerlift-ai%20-%20Copy/apps/api/src/modules/ai/ai.routes.ts), reducing hundreds of database round-trips to $O(1)$ operations per session.
- **High-Throughput Composite Indexing:**
  - `planned_sessions`: `@@index([athleteId, date])`
  - `sessions`: `@@index([athleteId, startedAt])`
  - `sets`: `@@index([sessionId])`
  - `checkins`: `@@index([athleteId, weekStart])`
  - `nutrition_logs`: `@@index([athleteId, date])`
  - `body_metrics`: `@@index([athleteId, date])`
  - `nutrition_targets`: `@@index([athleteId, fromDate])`
  - `meets`: `@@index([athleteId, date])`
  - `ai_events`: `@@index([athleteId, createdAt])`
  - `audit_log`: `@@index([actorId, at])`
  - `beta_feedback`: `@@index([severity, status])`
  - `alerts`: `@@index([coachId, status])` and `@@index([athleteId])`
  - `messages`: `@@index([threadId, createdAt])`
  - `coach_athlete`: `@@index([coachId, status])`

### 2.2 Rate Limiting Infrastructure
- **Global API Limiter:** 300 requests / 15 minutes per IP.
- **Authentication Limiter:** 20 requests / 15 minutes per IP (guards against brute-force credential stuffing).
- **AI Gateway Limiter:** 30 requests / 1 minute per IP (guards against token quota exhaustion).

---

## 3. OWASP ASVS & Security Vulnerability Remediation

| Vulnerability Vector | Risk | Remediation Implemented |
| :--- | :--- | :--- |
| **Exposed Secrets** | Critical | Stripped hardcoded Firebase private keys, Gemini keys, Groq keys from `render.yaml` and `.env`. Switched to `.env.example` templates and runtime environment injection. |
| **CORS Misconfiguration** | High | Replaced naive origin reflection with strict whitelist validator. Non-whitelisted origins fail cleanly with `callback(null, false)` instead of 500 stack trace leakage. |
| **Broken Object Level Auth (BOLA)** | Critical | Mandatory RBAC middleware (`authenticateUser`, `requireRole`) verifying that the caller's Firebase UID owns or coaches the requested resource. |
| **DoS via Unbounded Requests** | High | Implemented sliding-window rate limiters on all route tiers. Added body size limits (`1mb`). |
| **Process Crash on Unhandled Error** | Medium | Implemented graceful shutdown hooks (`SIGTERM`, `SIGINT`) and top-level `unhandledRejection` handlers to flush open connections before clean termination. |
| **Credential Reset Enumeration** | Medium | Forgot Password flow uses Firebase client SDK (`sendPasswordResetEmail`) with non-revealing generic responses. |

---

## 4. Superadmin & Coach Domain Separation (PL vs BB)

### 4.1 Powerlifting Domain (`pl`)
- **Key Performance Indicators:**
  - SBD Total (Squat + Bench + Deadlift in kg/lbs)
  - DOTS / Wilks / GL Relative Strength Scoring
  - 9-for-9 Competition Attempt Completion Rate
- **Sport-Specific Parameters:**
  - Peak Taper Max Cap: 88% default
  - INOL (Intensity $\times$ Number of Lifts) Weekly Ceiling: 2.1
  - RPE Overcap Threshold: RPE 9.5
  - Epley vs Brzycki 1RM Estimation Formula Selector

### 4.2 Bodybuilding Domain (`bb`)
- **Key Performance Indicators:**
  - Weekly Set Volume Landmarks (MEV: Minimum Effective Volume, MAV: Maximum Adaptive Volume, MRV: Maximum Recoverable Volume)
  - Division Profiles (Men's Open, Classic Physique, Men's Physique, Bikini, Figure, Wellness)
  - Posing & Physique Check-in Submission Frequency (front, side, back)
- **Sport-Specific Parameters:**
  - Weekly Sets per Muscle Group Ceiling: 22 sets/week
  - Calorie Deficit Floor: 1,850 kcal/day (prevents extreme metabolic crashes)
  - Deload Volume Drop: 45% reduction from peak week

### 4.3 Superadmin Hierarchy Tree
- **Coach-Client Drilldown:**
  - Superadmin can toggle between Powerlifting and Bodybuilding views.
  - Expandable accordion displays each active Coach, their credential tier, client count, and an interactive drawer of all athletes managed under that coach.
- **Unattached Solo Athletes:**
  - Distinct section listing independent athletes training directly via AI programs without a human coach.
  - Ability to filter by division/weight-class and review adherence metrics.

---

## 5. Production Deployment Guide

### 5.1 Docker Orchestration
To deploy the entire production stack:
```bash
# 1. Populate production secrets
cp apps/api/.env.example .env
# Edit .env with valid credentials

# 2. Build and launch containers
docker compose -f docker-compose.prod.yml up -d --build

# 3. Apply Prisma migrations
docker compose -f docker-compose.prod.yml exec api npx prisma migrate deploy
```

### 5.2 Health Checks & Monitoring
- **API Healthz:** `http://localhost:5001/healthz`
- **Web SPA:** `http://localhost:80/`
- **Postgres:** `pg_isready -U powerlift_admin -d powerlift_prod`
- **Redis:** `redis-cli ping`
