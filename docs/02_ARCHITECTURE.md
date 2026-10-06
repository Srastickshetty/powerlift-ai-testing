# 02 — Target Architecture (senior engineer voice)

## ADRs (decisions)
- **ADR-1 Data store:** Postgres (Neon/Supabase) + Prisma for all app data. Reason: coaching analytics are relational (sets→sessions→programs→athletes→coaches, volume per muscle per week). Keep **Firebase Auth only**. *Fallback if you insist on Firestore:* single store, strict security rules, denormalised weekly aggregates — never mix with JSON files.
- **ADR-2 Language:** TypeScript across backend + frontend (incremental: new code TS, migrate on touch). Shared `packages/shared` for zod schemas/types.
- **ADR-3 Auth:** Firebase ID token → backend middleware `requireAuth` → loads `users` row → `req.ctx = {userId, role, track}`. Roles: `athlete | coach | admin`. Coach access to an athlete only via an `ACTIVE` `coach_athlete` link.
- **ADR-4 AI:** LLM never writes to DB directly. Pipeline = generator (rules/retrieval) → LLM explanation/edits as *proposal* → **safety validator** → stored as `program_version(status=draft)` → athlete (self-guided) or coach (coach-led) approves.
- **ADR-5 Payments:** `PaymentProvider` interface; `DummyProvider` now (always succeeds, writes real `subscriptions`/`invoices` rows); `RazorpayProvider`/`StripeProvider` later. Entitlements read server-side from `subscriptions`.
- **ADR-6 Frontend state:** TanStack Query (server state) + Zustand (UI/session state) + offline queue (keep `offlineSyncManager`, rebuild on IndexedDB via `idb`). No domain state in `localStorage` except offline queue/theme.
- **ADR-7 Monorepo:** npm workspaces: `apps/web`, `apps/api`, `packages/shared`, `packages/engines` (pure TS: e1RM, volume, progression, safety — 100% unit-tested, no I/O).

## Folder layout
```
apps/api/src/{modules/<domain>/{routes,service,repo,schema}.ts, middleware/, lib/, jobs/}
apps/web/src/{app/, tracks/{powerlifting,bodybuilding}/, features/{log,program,coach,billing,...}/, ui/, lib/}
packages/engines/src/{e1rm,volume,periodization,autoreg,safety,nutrition,attempts}/
packages/shared/src/{schemas,types,constants}/
legacy/            # moved old files, not imported
docs/ commands/ AGENTS.md
```
Modules: auth, users, profiles, exercises, programs, sessions, sets, checkins, bodymetrics, nutrition, coaching, messaging, media, billing, notifications, analytics, ai, admin, meets.

## Data model (core tables)
```
users(id, firebase_uid, role, email, name, created_at, deleted_at)
athlete_profiles(user_id PK, track, sex, dob, height_cm, units, training_age, days_per_week,
  equipment jsonb, injuries jsonb, goals jsonb, diet jsonb, consent jsonb)
pl_profile(user_id, federation, equip_class, weight_class, meet_date, weak_points jsonb, style jsonb)
bb_profile(user_id, division, show_date, lagging jsonb, split_pref, measurements_baseline jsonb)
coach_profiles(user_id, tracks[], bio, specialties[], languages[], price_monthly_minor, currency, verified_at, rating_avg, capacity)
coach_athlete(id, coach_id, athlete_id, status[REQUESTED|ACTIVE|PAUSED|ENDED], mode[COACH_LED|COPILOT], started_at, ended_at)
plans(id, kind[ATHLETE_PRO|COACHING], price_minor, currency, interval)
subscriptions(id, payer_id, plan_id, coach_athlete_id?, status, provider, provider_ref, current_period_end)
invoices(id, subscription_id, amount_minor, status, provider_ref, issued_at)
exercises(id, name, track_tags[], primary_muscles[], secondary[], equipment[], pattern, is_competition_lift, cues, media_url, substitutes[])
programs(id, owner_id, athlete_id?, track, name, source[AI|COACH|TEMPLATE|MARKET], is_template)
program_versions(id, program_id, version, status[DRAFT|APPROVED|ACTIVE|ARCHIVED], dsl jsonb, rationale jsonb, diff jsonb, created_by, approved_by)
planned_sessions(id, athlete_id, program_version_id, date, week, day, status)
planned_sets(id, planned_session_id, exercise_id, order, set_type, target jsonb)  -- reps/load/%/rpe/rir/tempo
sessions(id, athlete_id, planned_session_id?, started_at, ended_at, session_rpe, notes, readiness jsonb)
sets(id, session_id, planned_set_id?, exercise_id, set_type, weight_kg, reps, rpe, rir, tempo, pain_0_10, pain_area, is_pr, video_id?, note, client_uuid UNIQUE)
checkins(id, athlete_id, week_start, data jsonb, photos[], coach_reply, status)
body_metrics(id, athlete_id, date, bodyweight_kg, measurements jsonb)
nutrition_targets(id, athlete_id, from_date, kcal, p, c, f, steps, source)
nutrition_logs(id, athlete_id, date, items jsonb, totals jsonb)
messages(id, thread_id, sender_id, body, media_id?, created_at, read_at)
media(id, owner_id, kind[VIDEO|PHOTO], storage_key, visibility[PRIVATE|COACH], created_at)
video_comments(id, media_id, author_id, t_ms, body)
alerts(id, athlete_id, coach_id?, type, severity, payload, status, created_at)
meets(id, athlete_id, name, date, federation, weight_class, attempts jsonb, results jsonb)
ai_events(id, athlete_id, kind, input_hash, output jsonb, validator_result jsonb, model, latency_ms)
audit_log(id, actor_id, action, entity, entity_id, at, meta)
```
Indexes: `sets(session_id)`, `sessions(athlete_id, started_at)`, `coach_athlete(coach_id,status)`, unique `sets.client_uuid` (idempotent offline sync).
Rules: soft-delete users; hard-delete export/delete flow (P7); money in minor units.

## API (REST, `/api/v1`, all require auth unless stated)
Auth/me: `GET /me`, `POST /me/onboarding`, `PATCH /me/profile`, `POST /me/export`, `DELETE /me`.
Programs: `POST /programs/generate` (track-aware), `GET /programs/:id/versions`, `POST /program-versions/:id/{approve|activate}`, `PATCH /program-versions/:id` (coach edit).
Training: `GET /today`, `POST /sessions`, `POST /sessions/:id/sets` (batch, idempotent), `PATCH /sets/:id`, `POST /sessions/:id/finish`, `GET /history`.
Analytics: `GET /analytics/{e1rm|volume|adherence|readiness|bodyweight}`.
Check-ins/body: `POST /checkins`, `GET /checkins`, `POST /body-metrics`.
Coach: `GET /coaches` (public list, filters), `POST /coaches/:id/request`, `POST /coach/requests/:id/{accept|decline}`, `GET /coach/roster`, `GET /coach/athletes/:id/{overview|sessions|checkins}`, `POST /coach/athletes/:id/{notes|program}`, `POST /checkins/:id/reply`.
Messaging/media: `GET/POST /threads/:id/messages`, `POST /media/upload-url`, `POST /media/:id/comments`.
Billing: `GET /billing/plans`, `POST /billing/subscribe`, `POST /billing/cancel`, `GET /billing/invoices`, webhook `POST /billing/webhook/:provider` (signature verified).
Admin: `GET /admin/{overview|users|coaches/pending}`, `POST /admin/coaches/:id/verify`, feature flags.
Conventions: zod validate body/query/params; errors `{code, message, details}`; pagination cursor; rate limits per route class; idempotency key on POSTs that create sets/payments.

## Authorization matrix (enforce in middleware + tested)
- athlete → only own rows.
- coach → rows of athletes where `coach_athlete.status='ACTIVE'`; photos/video only if athlete consent flag.
- admin → read-all with audit log; no silent writes to athlete data.
- Entitlements: feature gates (`ai_generation_quota`, `coach_chat`, `video_review`) from `subscriptions`, checked server-side.

## Realtime & jobs
SSE/WebSocket (or Firebase RTDB-free polling at first) for chat/alerts. Jobs (cron/queue): weekly evolution run, alert scanner (missed sessions, pain, RPE drift, weight-rate), check-in reminders, nightly aggregates, subscription renewals.

## Observability & ops
pino logs (no PII), Sentry (web+api), `/healthz`, `/readyz`, request IDs, migration via Prisma, seed script with 2 coaches/6 athletes/12 weeks of fake logs, env validation at boot (zod), `.env.example`, Docker compose (api+pg), GitHub Actions: lint, typecheck, test, build, `prisma migrate diff`.

## Performance targets
Log a set → UI update < 100 ms (optimistic); API p95 < 300 ms; Today screen TTI < 2 s on mid Android over 4G; bundle per route < 200 KB gz; works offline for a full session.
