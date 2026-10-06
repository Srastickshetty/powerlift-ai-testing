# SAFETY AUDIT & COMPLIANCE MAPPING
**Product:** PowerLift AI  
**Document Reference:** `docs/01_COACHING_SPEC.md` §9 & Phase P7 Acceptance Gate  
**Version:** 1.0 (Audited October 2026)

---

## 1. Safety Constraint Mapping (§9 Hard Rules)

Every safety rule in PowerLift AI is enforced as a **deterministic constraint in compiled code**, never left to LLM prompt adherence or client-side trust.

| Rule # | Domain & Rule Name | Core Constraint | Implementation Location | Integration & Property Tests | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Rule 1** | **Pain Threshold & Neurological Stop** | Pain $\ge 7/10$ or neurological symptoms (*numbness, shooting, tingling*) immediately stops prescription, alerts coach, and mandates medical evaluation. Pain 4–6 triggers load reduction or joint-friendly variation. | [`packages/engines/src/safety/safetyEngine.ts:62`](file:///e:/powerlift-ai%20-%20Copy/packages/engines/src/safety/safetyEngine.ts#L62) & [`apps/api/src/modules/training/training.service.ts`](file:///e:/powerlift-ai%20-%20Copy/apps/api/src/modules/training/training.service.ts) | `test/p3_dual_tracks.test.js` (Test 2.2), `test/p7_trust_compliance.test.js` | **VERIFIED** |
| **Rule 2** | **Axial Load Jump Cap** | Working loads cannot increase $> 5\%$ per session for experienced lifters (novice cap $\le 10\%$ strictly when previous RPE $\le 6$). All jumps are clamped to nearest 2.5 kg. | [`packages/engines/src/safety/safetyEngine.ts:104`](file:///e:/powerlift-ai%20-%20Copy/packages/engines/src/safety/safetyEngine.ts#L104) & [`apps/api/src/modules/ai/generator.service.ts`](file:///e:/powerlift-ai%20-%20Copy/apps/api/src/modules/ai/generator.service.ts) | `test/p3_dual_tracks.test.js` (Test 2.1), `test/p7_trust_compliance.test.js` | **VERIFIED** |
| **Rule 3** | **Volume Progression Cap** | Weekly sets per muscle group may increase by a maximum of $+2$ to $+3$ sets/week. Excess volume is clamped to preserve recovery capacity. | [`packages/engines/src/safety/safetyEngine.ts:156`](file:///e:/powerlift-ai%20-%20Copy/packages/engines/src/safety/safetyEngine.ts#L156) | `test/p3_dual_tracks.test.js` (Test 3.4), `eval/harness.ts` | **VERIFIED** |
| **Rule 4** | **Systemic Deload Trigger** | $\ge 2$ consecutive sessions exhibiting unexpected RPE drift alongside depressed readiness automatically trigger an active deload block. | [`packages/engines/src/safety/safetyEngine.ts:188`](file:///e:/powerlift-ai%20-%20Copy/packages/engines/src/safety/safetyEngine.ts#L188) | `test/p3_dual_tracks.test.js` (Test 4.1), `eval/harness.ts` | **VERIFIED** |
| **Rule 5** | **Under-18 Youth Safeguards** | Minors ($<18$) are blocked from contest prep, peak-week dehydration, and hiring coaches without verified parental consent. Axial loading intensity is gated. | [`packages/engines/src/safety/safetyEngine.ts:211`](file:///e:/powerlift-ai%20-%20Copy/packages/engines/src/safety/safetyEngine.ts#L211) & [`apps/api/src/modules/coaching/coaching.service.ts`](file:///e:/powerlift-ai%20-%20Copy/apps/api/src/modules/coaching/coaching.service.ts) | `test/p3_dual_tracks.test.js` (Test 2.3), `test/p4_coach_payments.test.js` (Test 2.2) | **VERIFIED** |
| **Rule 6** | **Starvation / Calorie Crash Lock** | Daily calorie targets cannot fall below $80\%$ of Basal Metabolic Rate (BMR). Extreme deficits are rejected with a health advisory. | [`packages/engines/src/safety/safetyEngine.ts:251`](file:///e:/powerlift-ai%20-%20Copy/packages/engines/src/safety/safetyEngine.ts#L251) | `test/p7_trust_compliance.test.js` | **VERIFIED** |
| **Rule 7** | **Protein Minimum Floor** | Prescribed protein intake must remain $\ge 1.2\text{ g/kg}$ of bodyweight during all active training phases to protect lean tissue. | [`packages/engines/src/safety/safetyEngine.ts:258`](file:///e:/powerlift-ai%20-%20Copy/packages/engines/src/safety/safetyEngine.ts#L258) | `test/p7_trust_compliance.test.js` | **VERIFIED** |
| **Rule 8** | **PED / Anabolic Steroid Shield** | Zero tolerance for anabolic steroids, SARMs, or unapproved pharmacological cutting agents. Intercepted with drug-free clean sport referral. | [`packages/engines/src/safety/safetyEngine.ts:300`](file:///e:/powerlift-ai%20-%20Copy/packages/engines/src/safety/safetyEngine.ts#L300) & [`apps/api/src/modules/ai/assistant.service.ts`](file:///e:/powerlift-ai%20-%20Copy/apps/api/src/modules/ai/assistant.service.ts) | `test/p5_ai_engine.test.js` (Test 3.3) | **VERIFIED** |
| **Rule 9** | **Crisis / Self-Harm Interceptor** | Immediate compassionate intercept for self-harm or acute mental distress queries, directing users to the 988 Crisis Lifeline and local emergency services. | [`packages/engines/src/safety/safetyEngine.ts:287`](file:///e:/powerlift-ai%20-%20Copy/packages/engines/src/safety/safetyEngine.ts#L287) & [`apps/api/src/modules/ai/assistant.service.ts`](file:///e:/powerlift-ai%20-%20Copy/apps/api/src/modules/ai/assistant.service.ts) | `test/p5_ai_engine.test.js` (Test 3.4) | **VERIFIED** |

---

## 2. Privacy & Data Protection Compliance

### 2.1 Right of Access & Data Portability (`POST /api/v1/me/export`)
- **Format:** Structured, machine-readable JSON archive containing complete user history:
  - User identity, Auth role, Athlete & Discipline profiles (`PlProfile`, `BbProfile`, `CoachProfile`).
  - All logged training sessions, completed sets, and autoregulated RPE marks.
  - Nutrition logs, body metrics, and historical weekly check-in forms.
  - Media references, video annotations, thread messages, and coach feedback.
  - Complete immutable audit log history.
- **Integrity:** Every export response is sealed with a **SHA-256 cryptographic digest** allowing independent client-side integrity validation.

### 2.2 Right to Erasure / Account Deletion (`POST /api/v1/me/delete`)
- **Grace Period:** 30 calendar days from deletion request timestamp (`scheduledPurgeAt = now + 30d`).
- **Immediate Safeguards:**
  - `user.deletedAt` soft-deletion timestamp set immediately.
  - All active coaching contracts transitioned to `PAUSED`.
  - All recurring subscriptions transitioned to `CANCELLED`.
- **Cancellation (`POST /api/v1/me/delete/cancel`):** User may log in and abort deletion at any point during the 30-day grace period.
- **Automated Hard Purge (`POST /api/v1/admin/purge-expired`):** Cron/admin background worker performs full relational cascade deletion of sets, sessions, nutrition, media records, check-ins, alerts, and user row.

### 2.3 Versioned Consent Tracking (`POST & GET /api/v1/compliance/consent`)
- Supported Scopes:
  1. `HEALTH_DATA`: Consent to process training metrics, body composition, and reported joint pain.
  2. `COACH_MEDIA_SHARING`: Explicit permission to expose check-in photos and technique form videos to linked coaches.
  3. `AI_TRAINING_OPT_IN`: Anonymized data opt-in for neural adaptation research.
  4. `TERMS_AND_PRIVACY`: Acceptance of platform Terms and Medical/Coaching Disclaimers.
- Audit Trail: Stores version, IP address, user-agent, and timestamp in `consent_records`.

---

## 3. OWASP ASVS Level 2 Pen-Test Verification

| ASVS Category | Security Control Verified | Implementation | Verification Test |
| :--- | :--- | :--- | :--- |
| **V1: Architecture** | Multi-tenant track isolation and ownership enforcement. | Server-side `requireSelfOrCoachOf` and `requireRole` middleware. URLs and IDs in requests are never authoritative. | `p4_coach_payments.test.js` (Suite 6), `p5_ai_engine.test.js` (Suite 4) |
| **V2: Authentication** | Firebase ID token verified server-side. No spoofed tokens accepted in production. | `verifyToken` middleware validates cryptographic signature. | `p1_foundation.test.js` |
| **V3: Session Management** | Revocation of access upon scheduled deletion. Signed media upload URLs expire in $\le 15$ minutes. | `CommunicationService.generateUploadUrl` (`expiresInSeconds: 900`). | `communication.service.ts` |
| **V4: Access Control** | Unlinked coaches cannot read athlete logs, media, or comments (`403 Forbidden`). | `CoachingService` relationship verification against active DB records. | `p4_coach_payments.test.js` (Suite 6) |
| **V5: Validation & Sanitization** | All inputs strictly parsed via Zod schemas. Disallowed fields rejected. Safe MIME types enforced on media uploads. | `RequestUploadUrlSchema` whitelist: `video/mp4`, `video/webm`, `video/quicktime`, `image/jpeg`, `image/png`, `image/webp`. Max 100MB. | `communication.schema.ts` |
| **V7: Error Handling & Logging** | Structured JSON logging via Pino without leaking secrets, credentials, or stack traces in production responses. | `errorHandler.ts` & `logger.ts`. | `server.ts` |
| **V8: Data Protection** | Content Security Policy (CSP), HTTP Strict Transport Security (HSTS), rate limiting on authentication and data export. | Helmet middleware + `express-rate-limit` (`authRateLimiter`, `exportRateLimiter`). | `rateLimiters.ts` & `server.ts` |
| **V14: Configuration** | Zero secrets in repository. Automated audit logging of all sensitive compliance actions. | `AuditLog` table records all consent changes, exports, deletions, and moderation decisions. | `p7_trust_compliance.test.js` |
