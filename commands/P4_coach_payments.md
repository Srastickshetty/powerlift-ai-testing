# P4 — Coach layer + (dummy) payments
Read: docs/01 §6–7; docs/02 (coaching, billing, authz matrix); docs/03 flows 7–8, 10.
## Tasks
1. Coach onboarding + profile (tracks, bio, specialties, languages, price, capacity); admin verification queue; public coach directory with filters (`GET /coaches`).
2. Request→accept flow via `coach_athlete`; modes COACH_LED / COPILOT; pause/end; capacity limits.
3. Billing: `PaymentProvider` interface (`createCheckout, confirm, cancel, handleWebhook`); `DummyProvider` (instant success, creates real subscription+invoice rows, clearly labelled TEST MODE); plans table; server-side entitlements middleware (`requireEntitlement('coach_chat')`); renewals job; swap point documented for Razorpay/Stripe.
4. Coach dashboard: roster with traffic lights (computed by alert scanner), filters, athlete detail tabs, program editor (edit DRAFT, approve → ACTIVE, version diff, templates, bulk-assign), private notes, calendar.
5. Check-ins: weekly form (athlete) → review queue → reply; photo consent flag.
6. Messaging: threads per coach-athlete (polling/SSE), unread counts, notifications.
7. Media: signed-upload URLs, video upload for form checks, timestamped comments, size/type limits, private by default.
8. Alert scanner job: 2 missed sessions, pain ≥6, RPE drift, weight-rate out of range, check-in overdue, dropout risk (heuristic for now).
9. Authorization tests for every coach endpoint (no ACTIVE link → 403).
## Acceptance checklist
- [x] E2E: athlete requests → coach accepts → dummy subscribe → coach edits & approves program → athlete trains → coach sees logs, replies to check-in, comments on video
- [x] No coach can see non-linked athletes (tests)
- [x] Entitlements enforced server-side; UI reads from `/me/entitlements`

