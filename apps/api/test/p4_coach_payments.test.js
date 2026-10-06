/**
 * apps/api/test/p4_coach_payments.test.js
 * Comprehensive integration test suite for P4 (Coach Layer + Payments):
 * - Coach Onboarding, Profile & Admin Verification
 * - Public Directory & Search
 * - Request -> Accept Flow (Youth Guardrails & Capacity)
 * - Billing: Plans, DummyProvider, Subscriptions, Invoices & Entitlements
 * - Coach Roster & Alert Scanner (Traffic Light: GREEN -> RED on Pain)
 * - Program Review, Coach Edits & Approval
 * - Messaging, Video Uploads, Timestamped Comments & Weekly Check-ins
 * - Multi-Tenant Authorization Security (Non-linked Coach -> 403)
 */

const { describe, it } = require('node:test');
const assert = require('node:assert');
const request = require('supertest');

process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/powerlift_dev';

const { app } = require('../dist/server');

describe('P4 — Coach Layer & Payments Integration Test Suite', () => {
  const runId = Math.random().toString(36).substring(2, 7);
  const adminToken = `Bearer dev_mock_p4adm${runId}_admin_powerlifting`;
  const coachToken = `Bearer dev_mock_p4cch${runId}_coach_powerlifting`;
  const unlinkedCoachToken = `Bearer dev_mock_p4rog${runId}_coach_powerlifting`;
  const athleteToken = `Bearer dev_mock_p4ath${runId}_athlete_powerlifting`;
  const youthToken = `Bearer dev_mock_p4yth${runId}_athlete_powerlifting`;

  let coachUserId = '';
  let athleteUserId = '';
  let coachAthleteLinkId = '';
  let programVersionId = '';
  let checkinId = '';
  let mediaId = '';
  let threadId = '';

  describe('1. Coach Profile, Directory & Admin Verification', () => {
    it('PATCH /api/v1/coach/profile creates/updates coach profile', async () => {
      const res = await request(app)
        .patch('/api/v1/coach/profile')
        .set('Authorization', coachToken)
        .send({
          tracks: ['POWERLIFTING'],
          bio: 'Elite IPF Coach with 10+ National Champions.',
          specialties: ['Squat Mechanics', 'Peaking', 'Attempt Strategy'],
          languages: ['English', 'Hindi'],
          priceMonthlyMinor: 9900,
          currency: 'USD',
          capacity: 15
        });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.profile.priceMonthlyMinor, 9900);
      coachUserId = res.body.profile.userId;
    });

    it('GET /api/v1/admin/coaches/pending lists unverified coaches for admin review', async () => {
      const res = await request(app)
        .get('/api/v1/admin/coaches/pending')
        .set('Authorization', adminToken);

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.ok(Array.isArray(res.body.pendingCoaches));
    });

    it('POST /api/v1/admin/coaches/:id/verify verifies the coach', async () => {
      const res = await request(app)
        .post(`/api/v1/admin/coaches/${coachUserId}/verify`)
        .set('Authorization', adminToken);

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.ok(res.body.profile.verifiedAt);
    });

    it('GET /api/v1/coaches returns verified coach in public marketplace directory', async () => {
      const res = await request(app)
        .get('/api/v1/coaches?track=powerlifting');

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      const coach = res.body.coaches.find((c) => c.id === coachUserId);
      assert.ok(coach, 'Verified coach must be visible in public marketplace');
      assert.strictEqual(coach.verified, true);
    });
  });

  describe('2. Coach-Athlete Request Flow & Safety Guardrails', () => {
    it('Onboards athlete and captures athleteUserId', async () => {
      const res = await request(app)
        .post('/api/v1/me/onboarding')
        .set('Authorization', athleteToken)
        .send({
          track: 'powerlifting',
          name: 'P4 Test Athlete',
          age: 24,
          sex: 'male',
          bodyweightKg: 85,
          heightCm: 178,
          units: 'kg',
          trainingAgeYears: 2,
          daysPerWeek: 4,
          sessionLengthMinutes: 75,
          equipment: ['barbell', 'squat_rack', 'bench'],
          injuries: [],
          plDetails: {
            squat1rm: 180,
            bench1rm: 120,
            deadlift1rm: 220
          }
        });

      assert.strictEqual(res.status, 200);
      athleteUserId = res.body.profile.userId;
      programVersionId = res.body.programVersionId;
    });

    it('Under-18 athlete is blocked from hiring coach without parental consent (Rule §9)', async () => {
      // Onboard youth athlete
      await request(app)
        .post('/api/v1/me/onboarding')
        .set('Authorization', youthToken)
        .send({
          track: 'powerlifting',
          name: 'Youth Lifter',
          age: 16,
          sex: 'male',
          bodyweightKg: 65,
          heightCm: 170,
          units: 'kg',
          trainingAgeYears: 1,
          daysPerWeek: 3,
          sessionLengthMinutes: 60,
          equipment: ['barbell'],
          injuries: []
        });

      const res = await request(app)
        .post(`/api/v1/coaches/${coachUserId}/request`)
        .set('Authorization', youthToken)
        .send({ hasGuardianConsent: false });

      assert.strictEqual(res.status, 403);
    });

    it('Adult athlete submits coaching request (POST /api/v1/coaches/:id/request)', async () => {
      const res = await request(app)
        .post(`/api/v1/coaches/${coachUserId}/request`)
        .set('Authorization', athleteToken)
        .send({ hasGuardianConsent: true });

      assert.strictEqual(res.status, 201);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.request.status, 'REQUESTED');
      coachAthleteLinkId = res.body.request.id;
    });

    it('Coach inspects requests and accepts athlete into COPILOT mode', async () => {
      const reqList = await request(app)
        .get('/api/v1/coach/requests')
        .set('Authorization', coachToken);

      assert.strictEqual(reqList.status, 200);
      assert.ok(reqList.body.requests.some((r) => r.id === coachAthleteLinkId));

      const acceptRes = await request(app)
        .post(`/api/v1/coach/requests/${coachAthleteLinkId}/accept`)
        .set('Authorization', coachToken)
        .send({ mode: 'COPILOT' });

      assert.strictEqual(acceptRes.status, 200);
      assert.strictEqual(acceptRes.body.relationship.status, 'ACTIVE');
    });
  });

  describe('3. Billing, Subscriptions & Entitlements', () => {
    it('GET /api/v1/billing/plans returns seeded subscription plans', async () => {
      const res = await request(app).get('/api/v1/billing/plans');
      assert.strictEqual(res.status, 200);
      assert.ok(res.body.plans.length >= 2);
    });

    it('Athlete subscribes via DummyProvider creating real Subscription & Invoice rows', async () => {
      const res = await request(app)
        .post('/api/v1/billing/subscribe')
        .set('Authorization', athleteToken)
        .send({
          planKind: 'COACHING',
          coachAthleteId: coachAthleteLinkId
        });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.status, 'active');
      assert.strictEqual(res.body.isTestMode, true);
    });

    it('GET /api/v1/me/entitlements verifies coaching features unlocked', async () => {
      const res = await request(app)
        .get('/api/v1/me/entitlements')
        .set('Authorization', athleteToken);

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.entitlements.is_pro, true);
      assert.strictEqual(res.body.entitlements.coach_chat, true);
      assert.strictEqual(res.body.entitlements.video_review, true);
    });

    it('GET /api/v1/billing/invoices returns paid invoice', async () => {
      const res = await request(app)
        .get('/api/v1/billing/invoices')
        .set('Authorization', athleteToken);

      assert.strictEqual(res.status, 200);
      assert.ok(res.body.invoices.length >= 1);
      assert.strictEqual(res.body.invoices[0].status, 'paid');
    });
  });

  describe('4. Coach Roster, Alert Scanner & Program Editing', () => {
    it('GET /api/v1/coach/roster displays athlete with GREEN traffic light', async () => {
      const res = await request(app)
        .get('/api/v1/coach/roster')
        .set('Authorization', coachToken);

      assert.strictEqual(res.status, 200);
      const athlete = res.body.roster.find((a) => a.athleteId === athleteUserId);
      assert.ok(athlete);
      assert.strictEqual(athlete.trafficLight, 'GREEN');
    });

    it('Severe pain log triggers Alert Scanner and turns athlete traffic light RED', async () => {
      // 1. Start workout session
      const sessionRes = await request(app)
        .post('/api/v1/training/sessions')
        .set('Authorization', athleteToken)
        .send({ readiness: { sleepHours: 7 } });

      const sessionId = sessionRes.body.session.id;

      // 2. Fetch exercise ID
      const exRes = await request(app)
        .get('/api/v1/exercises?limit=1')
        .set('Authorization', athleteToken);
      const exerciseId = exRes.body.exercises[0].id;

      // 3. Log set with severe joint pain (pain = 8/10)
      await request(app)
        .post(`/api/v1/training/sessions/${sessionId}/sets`)
        .set('Authorization', athleteToken)
        .send({
          clientUuid: `pain_set_${Date.now()}`,
          exerciseId,
          weightKg: 140,
          reps: 3,
          rpe: 8,
          painScale0To10: 8,
          painArea: 'Left Patellar Tendon'
        });

      // 4. Coach roster reflects RED traffic light and critical alert
      const rosterRes = await request(app)
        .get('/api/v1/coach/roster')
        .set('Authorization', coachToken);

      const athlete = rosterRes.body.roster.find((a) => a.athleteId === athleteUserId);
      assert.strictEqual(athlete.trafficLight, 'RED');
      assert.ok(athlete.activeAlerts.some((a) => a.type === 'CRITICAL_JOINT_PAIN'));
    });

    it('Coach inspects athlete overview (GET /api/v1/coach/athletes/:id/overview)', async () => {
      const res = await request(app)
        .get(`/api/v1/coach/athletes/${athleteUserId}/overview`)
        .set('Authorization', coachToken);

      assert.strictEqual(res.status, 200);
      assert.ok(res.body.athlete);
      assert.ok(res.body.recentSessions.length > 0);
    });

    it('Coach edits athlete program version and creates v2', async () => {
      const res = await request(app)
        .patch(`/api/v1/coach/athletes/${athleteUserId}/program`)
        .set('Authorization', coachToken)
        .send({
          versionId: programVersionId,
          diff: { substituteExercise: 'Pin Squat', loadReductionPct: 20 },
          coachNotes: 'Swapped to Pin Squat to deload patellar tendon.'
        });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.version.version, 2);
    });
  });

  describe('5. Communication, Media, Timestamp Comments & Check-Ins', () => {
    it('Athlete submits weekly check-in (POST /api/v1/checkins)', async () => {
      const res = await request(app)
        .post('/api/v1/checkins')
        .set('Authorization', athleteToken)
        .send({
          data: {
            soreness: 6,
            fatigue: 7,
            bodyweightKg: 85.4,
            notes: 'Patellar tendon felt much better during warm-ups.'
          },
          photos: [],
          consentPhotosToCoach: true
        });

      assert.strictEqual(res.status, 201);
      assert.strictEqual(res.body.success, true);
      checkinId = res.body.checkin.id;
    });

    it('Coach views check-in queue and submits reply', async () => {
      const queueRes = await request(app)
        .get('/api/v1/coach/checkins/queue')
        .set('Authorization', coachToken);

      assert.strictEqual(queueRes.status, 200);
      assert.ok(queueRes.body.queue.some((c) => c.id === checkinId));

      const replyRes = await request(app)
        .post(`/api/v1/coach/checkins/${checkinId}/reply`)
        .set('Authorization', coachToken)
        .send({
          reply: 'Good recovery on the knee. We stick to the Pin Squats for this week.'
        });

      assert.strictEqual(replyRes.status, 200);
      assert.strictEqual(replyRes.body.checkin.status, 'reviewed');
    });

    it('Athlete requests signed upload URL and registers video media', async () => {
      const urlRes = await request(app)
        .post('/api/v1/media/upload-url')
        .set('Authorization', athleteToken)
        .send({
          fileName: 'squat_set_check.mp4',
          contentType: 'video/mp4',
          kind: 'VIDEO',
          sizeBytes: 15000000
        });

      assert.strictEqual(urlRes.status, 200);
      assert.ok(urlRes.body.storageKey);

      const mediaRes = await request(app)
        .post('/api/v1/media')
        .set('Authorization', athleteToken)
        .send({
          kind: 'VIDEO',
          storageKey: urlRes.body.storageKey,
          visibility: 'COACH'
        });

      assert.strictEqual(mediaRes.status, 201);
      mediaId = mediaRes.body.media.id;
    });

    it('Coach leaves timestamped video comment on athlete form video (tMs: 1400)', async () => {
      const res = await request(app)
        .post(`/api/v1/media/${mediaId}/comments`)
        .set('Authorization', coachToken)
        .send({
          tMs: 1400,
          body: 'Depth was parallel. Keep knees pushing out on ascent.'
        });

      assert.strictEqual(res.status, 201);
      assert.strictEqual(res.body.comment.tMs, 1400);

      const listRes = await request(app)
        .get(`/api/v1/media/${mediaId}/comments`)
        .set('Authorization', athleteToken);

      assert.strictEqual(listRes.status, 200);
      assert.strictEqual(listRes.body.comments.length, 1);
    });

    it('Athlete and coach exchange messages in dedicated thread', async () => {
      threadId = `thread_${coachUserId}_${athleteUserId}`;

      const sendRes = await request(app)
        .post(`/api/v1/threads/${threadId}/messages`)
        .set('Authorization', athleteToken)
        .send({ body: 'Hey Coach, knee feels 100% ready for Monday!' });

      assert.strictEqual(sendRes.status, 201);

      const coachReplyRes = await request(app)
        .post(`/api/v1/threads/${threadId}/messages`)
        .set('Authorization', coachToken)
        .send({ body: 'Awesome! We ramp loads conservatively.' });

      assert.strictEqual(coachReplyRes.status, 201);

      const threadRes = await request(app)
        .get(`/api/v1/threads/${threadId}/messages`)
        .set('Authorization', athleteToken);

      assert.strictEqual(threadRes.status, 200);
      assert.strictEqual(threadRes.body.messages.length, 2);
    });
  });

  describe('6. Multi-Tenant Authorization Security', () => {
    it('Unlinked rogue coach CANNOT view athlete overview (403 FORBIDDEN)', async () => {
      const res = await request(app)
        .get(`/api/v1/coach/athletes/${athleteUserId}/overview`)
        .set('Authorization', unlinkedCoachToken);

      assert.strictEqual(res.status, 403);
    });

    it('Unlinked coach CANNOT comment on athlete video (403 FORBIDDEN)', async () => {
      const res = await request(app)
        .post(`/api/v1/media/${mediaId}/comments`)
        .set('Authorization', unlinkedCoachToken)
        .send({ tMs: 500, body: 'Intruder comment' });

      assert.strictEqual(res.status, 403);
    });

    it('Non-participant CANNOT access messaging thread (403 FORBIDDEN)', async () => {
      const res = await request(app)
        .get(`/api/v1/threads/${threadId}/messages`)
        .set('Authorization', unlinkedCoachToken);

      assert.strictEqual(res.status, 403);
    });
  });
});
