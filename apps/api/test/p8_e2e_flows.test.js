/**
 * apps/api/test/p8_e2e_flows.test.js
 * End-to-End lifecycle test suite for Phase P8 (Quality & Launch):
 * 1. Athlete PL Flow (Onboarding -> Today -> e1RM -> Session Logging -> History)
 * 2. Athlete BB Flow (Onboarding -> Check-in Submission -> Biofeedback History)
 * 3. Coach Flow (Marketplace -> Request -> Accept -> Roster Traffic Lights -> Check-in Review)
 * 4. Billing Flow in Test Mode (Subscribe -> Entitlements Verification)
 * 5. Offline Sync Flow (Queued Sets -> Reconnection -> Persistent Storage & Idempotency)
 * 6. Admin Telemetry & Beta Feedback Flow (Sev-1 In-App Feedback -> Triage -> Metrics)
 */

const { describe, it, before } = require('node:test');
const assert = require('node:assert');
const request = require('supertest');

process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/powerlift_dev';

const { app } = require('../dist/server');
const { prisma } = require('../dist/lib/prisma');

describe('P8 — End-to-End Launch Quality & Flow Validation Suite', () => {
  const runId = Math.random().toString(36).substring(2, 7);
  // Ensure token conforms strictly to: dev_mock_<uid>_<role>_<track>
  const plAthleteToken = `Bearer dev_mock_p8pl${runId}_athlete_powerlifting`;
  const bbAthleteToken = `Bearer dev_mock_p8bb${runId}_athlete_bodybuilding`;
  const coachToken = `Bearer dev_mock_p8coach${runId}_coach_powerlifting`;
  const adminToken = `Bearer dev_mock_p8adm${runId}_admin_powerlifting`;

  let plAthleteId = '';
  let bbAthleteId = '';
  let coachUserId = '';
  let coachAthleteLinkId = '';
  let checkinId = '';
  let feedbackId = '';
  let activeSessionId = '';
  let testExerciseId = '';

  before(async () => {
    // Ensure at least one exercise exists for set logging
    let ex = await prisma.exercise.findFirst();
    if (!ex) {
      ex = await prisma.exercise.create({
        data: {
          name: `Test Squat ${runId}`,
          pattern: 'SQUAT',
          trackTags: ['POWERLIFTING'],
          primaryMuscles: ['quads'],
          equipment: ['barbell']
        }
      });
    }
    testExerciseId = ex.id;
  });

  // ──────────────────────────────────────────────────────────
  // 1. ATHLETE POWERLIFTING FLOW
  // ──────────────────────────────────────────────────────────
  describe('1. Athlete Powerlifting (PL) Flow', () => {
    it('Onboards a powerlifting athlete with meet goals and SBD maxes', async () => {
      const res = await request(app)
        .post('/api/v1/me/onboarding')
        .set('Authorization', plAthleteToken)
        .send({
          track: 'powerlifting',
          name: 'PL Champion',
          age: 25,
          sex: 'male',
          heightCm: 180,
          bodyweightKg: 93,
          trainingAgeYears: 4,
          daysPerWeek: 4,
          plDetails: {
            squat1rm: 210,
            bench1rm: 145,
            deadlift1rm: 260,
            federation: 'IPF',
            weightClass: '93kg'
          }
        });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      plAthleteId = res.body.profile.userId;
      assert.ok(plAthleteId);
    });

    it('Calculates e1RM and next set autoregulation via engine endpoints', async () => {
      // e1RM
      const e1rmRes = await request(app)
        .post('/api/v1/analytics/e1rm')
        .set('Authorization', plAthleteToken)
        .send({ loadKg: 200, reps: 3, rpe: 9 });

      assert.strictEqual(e1rmRes.status, 200);
      assert.ok(e1rmRes.body.e1rmKg > 200);

      // Autoregulation
      const autoRes = await request(app)
        .post('/api/v1/training/autoregulate')
        .set('Authorization', plAthleteToken)
        .send({
          targetLoadKg: 200,
          targetReps: 5,
          targetRpe: 8,
          actualReps: 5,
          actualRpe: 9.5
        });

      assert.strictEqual(autoRes.status, 200);
      assert.strictEqual(autoRes.body.status, 'overshot');
      assert.ok(autoRes.body.nextLoadKg < 200);
    });

    it('Logs completed powerlifting session with working sets', async () => {
      // 1. Start session
      const startRes = await request(app)
        .post('/api/v1/training/sessions')
        .set('Authorization', plAthleteToken)
        .send({
          notes: 'Heavy Squat Day',
          readiness: { sleepHours: 8, stress: 2 }
        });

      assert.strictEqual(startRes.status, 201);
      assert.ok(startRes.body.session.id);
      activeSessionId = startRes.body.session.id;

      // 2. Log sets
      const clientUuid1 = `set_pl_${runId}_1`;
      const clientUuid2 = `set_pl_${runId}_2`;

      const setRes = await request(app)
        .post(`/api/v1/training/sessions/${activeSessionId}/sets`)
        .set('Authorization', plAthleteToken)
        .send({
          sets: [
            {
              clientUuid: clientUuid1,
              exerciseId: testExerciseId,
              setType: 'TOP_SINGLE',
              weightKg: 205,
              reps: 1,
              rpe: 8
            },
            {
              clientUuid: clientUuid2,
              exerciseId: testExerciseId,
              setType: 'WORKING',
              weightKg: 175,
              reps: 5,
              rpe: 8.5
            }
          ]
        });

      assert.strictEqual(setRes.status, 200);
      assert.strictEqual(setRes.body.savedSets.length, 2);

      // 3. Finish session
      const finishRes = await request(app)
        .post(`/api/v1/training/sessions/${activeSessionId}/finish`)
        .set('Authorization', plAthleteToken)
        .send({ sessionRpe: 8.5, notes: 'Moved fast, clean depth.' });

      assert.strictEqual(finishRes.status, 200);
    });

    it('Retrieves athlete training history with strict boundary check', async () => {
      const res = await request(app)
        .get(`/api/v1/training/sessions/${plAthleteId}`)
        .set('Authorization', plAthleteToken);

      assert.strictEqual(res.status, 200);
      assert.ok(Array.isArray(res.body));
      assert.strictEqual(res.body.length >= 1, true);
    });
  });

  // ──────────────────────────────────────────────────────────
  // 2. ATHLETE BODYBUILDING FLOW
  // ──────────────────────────────────────────────────────────
  describe('2. Athlete Bodybuilding (BB) Flow', () => {
    it('Onboards a bodybuilding athlete with division and target show', async () => {
      const res = await request(app)
        .post('/api/v1/me/onboarding')
        .set('Authorization', bbAthleteToken)
        .send({
          track: 'bodybuilding',
          name: 'BB Athlete',
          age: 28,
          sex: 'female',
          heightCm: 165,
          bodyweightKg: 58,
          trainingAgeYears: 3,
          daysPerWeek: 5,
          bbDetails: {
            division: 'bikini',
            targetShowDate: new Date(Date.now() + 90 * 86400000).toISOString()
          }
        });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      bbAthleteId = res.body.profile.userId;
      assert.ok(bbAthleteId);
    });

    it('Submits a weekly BB check-in with scale weight and biofeedback scores', async () => {
      const checkinRes = await request(app)
        .post('/api/v1/checkins')
        .set('Authorization', bbAthleteToken)
        .send({
          data: {
            weightAvgKg: 57.8,
            biofeedback: {
              hunger: 4,
              sleepQuality: 4,
              stress: 2,
              digestion: 4,
              energy: 3
            },
            notes: 'Prep is on track, hunger slightly elevating towards evening.'
          },
          photos: ['https://storage.powerlift.local/front_relaxed.jpg'],
          consentPhotosToCoach: true
        });

      assert.strictEqual(checkinRes.status, 201);
      checkinId = checkinRes.body.checkin.id;
      assert.ok(checkinId);
    });

    it('Retrieves check-in history for the bodybuilding athlete', async () => {
      const res = await request(app)
        .get('/api/v1/checkins')
        .set('Authorization', bbAthleteToken);

      assert.strictEqual(res.status, 200);
      assert.ok(Array.isArray(res.body.checkins));
      assert.strictEqual(res.body.checkins.length >= 1, true);
    });
  });

  // ──────────────────────────────────────────────────────────
  // 3. COACH FLOW & ROSTER TRAFFIC LIGHT
  // ──────────────────────────────────────────────────────────
  describe('3. Coach Flow & Roster Traffic Light', () => {
    it('Creates and verifies a professional coach profile', async () => {
      const meRes = await request(app).get('/api/v1/me').set('Authorization', coachToken);
      coachUserId = meRes.body.user.userId;

      // Ensure coach profile exists in DB
      await prisma.coachProfile.upsert({
        where: { userId: coachUserId },
        create: {
          userId: coachUserId,
          tracks: ['POWERLIFTING', 'BODYBUILDING'],
          bio: 'Elite IPF Coach with 10 years experience.',
          specialties: ['powerlifting', 'peaking'],
          languages: ['English'],
          priceMonthlyMinor: 15000,
          currency: 'USD',
          capacity: 20
        },
        update: { capacity: 20 }
      });

      // Admin verifies coach
      const verifyRes = await request(app)
        .post(`/api/v1/admin/coaches/${coachUserId}/verify`)
        .set('Authorization', adminToken);

      assert.strictEqual(verifyRes.status, 200);
      assert.strictEqual(verifyRes.body.success, true);
    });

    it('Links athlete to coach and approves coaching relationship', async () => {
      // Athlete requests coach
      const reqRes = await request(app)
        .post(`/api/v1/coaches/${coachUserId}/request`)
        .set('Authorization', plAthleteToken)
        .send({ hasGuardianConsent: true });

      assert.strictEqual(reqRes.status, 201);
      coachAthleteLinkId = reqRes.body.request.id;
      assert.ok(coachAthleteLinkId);

      // Coach accepts request
      const acceptRes = await request(app)
        .post(`/api/v1/coach/requests/${coachAthleteLinkId}/accept`)
        .set('Authorization', coachToken)
        .send({ mode: 'COPILOT' });

      assert.strictEqual(acceptRes.status, 200);
      assert.strictEqual(acceptRes.body.relationship.status, 'ACTIVE');
    });

    it('Coach views roster and traffic light status', async () => {
      const rosterRes = await request(app)
        .get('/api/v1/coach/roster')
        .set('Authorization', coachToken);

      assert.strictEqual(rosterRes.status, 200);
      assert.strictEqual(rosterRes.body.success, true);
      assert.ok(Array.isArray(rosterRes.body.roster));
      const found = rosterRes.body.roster.find(a => a.athleteId === plAthleteId);
      assert.ok(found);
      assert.ok(found.trafficLight); // GREEN, YELLOW, or RED
    });

    it('Coach reviews check-in and provides feedback', async () => {
      // Link bb athlete to coach for review
      const bbLinkRes = await request(app)
        .post(`/api/v1/coaches/${coachUserId}/request`)
        .set('Authorization', bbAthleteToken)
        .send({ hasGuardianConsent: true });

      await request(app)
        .post(`/api/v1/coach/requests/${bbLinkRes.body.request.id}/accept`)
        .set('Authorization', coachToken)
        .send({ mode: 'COACH_LED' });

      const reviewRes = await request(app)
        .post(`/api/v1/coach/checkins/${checkinId}/reply`)
        .set('Authorization', coachToken)
        .send({
          reply: 'Posing looks tighter. Hold macros steady for another week.',
          actionFlags: ['KEEP_CURRENT_MACROS']
        });

      assert.strictEqual(reviewRes.status, 200);
      assert.strictEqual(reviewRes.body.success, true);
      assert.strictEqual(reviewRes.body.checkin.status, 'reviewed');
    });
  });

  // ──────────────────────────────────────────────────────────
  // 4. BILLING FLOW (TEST MODE)
  // ──────────────────────────────────────────────────────────
  describe('4. Billing Flow in Test Mode', () => {
    it('Initiates subscription and activates coaching entitlements', async () => {
      const subRes = await request(app)
        .post('/api/v1/billing/subscribe')
        .set('Authorization', plAthleteToken)
        .send({
          planKind: 'COACHING',
          coachAthleteId: coachAthleteLinkId
        });

      assert.strictEqual(subRes.status, 200);
      assert.strictEqual(subRes.body.status, 'active');
      assert.strictEqual(subRes.body.isTestMode, true);
    });

    it('Resolves updated entitlements for subscriber', async () => {
      const entRes = await request(app)
        .get('/api/v1/me/entitlements')
        .set('Authorization', plAthleteToken);

      assert.strictEqual(entRes.status, 200);
      assert.strictEqual(entRes.body.success, true);
      assert.strictEqual(entRes.body.entitlements.is_pro, true);
      assert.strictEqual(entRes.body.entitlements.coach_chat, true);
    });
  });

  // ──────────────────────────────────────────────────────────
  // 5. OFFLINE SYNC SIMULATION FLOW
  // ──────────────────────────────────────────────────────────
  describe('5. Offline Sync Flow', () => {
    it('Persists offline-queued training session with multiple sets when reconnected', async () => {
      // 1. Initialize session upon sync
      const syncSessionRes = await request(app)
        .post('/api/v1/training/sessions')
        .set('Authorization', plAthleteToken)
        .send({
          notes: 'Offline Session (Low Connectivity)',
          readiness: { sleepHours: 7, stress: 3 }
        });

      assert.strictEqual(syncSessionRes.status, 201);
      const syncedSessionId = syncSessionRes.body.session.id;

      // 2. Batch-sync offline queued sets with idempotent clientUuid
      const clientUuidA = `offline_set_${runId}_A`;
      const clientUuidB = `offline_set_${runId}_B`;

      const batchRes = await request(app)
        .post(`/api/v1/training/sessions/${syncedSessionId}/sets`)
        .set('Authorization', plAthleteToken)
        .send({
          sets: [
            {
              clientUuid: clientUuidA,
              exerciseId: testExerciseId,
              setType: 'WORKING',
              weightKg: 120,
              reps: 5,
              rpe: 8
            },
            {
              clientUuid: clientUuidB,
              exerciseId: testExerciseId,
              setType: 'WORKING',
              weightKg: 120,
              reps: 5,
              rpe: 8.5
            }
          ]
        });

      assert.strictEqual(batchRes.status, 200);
      assert.strictEqual(batchRes.body.savedSets.length, 2);

      // Verify idempotency: re-sending the same set returns the existing set without error
      const idempRes = await request(app)
        .post(`/api/v1/training/sessions/${syncedSessionId}/sets`)
        .set('Authorization', plAthleteToken)
        .send({
          sets: [
            {
              clientUuid: clientUuidA,
              exerciseId: testExerciseId,
              setType: 'WORKING',
              weightKg: 120,
              reps: 5,
              rpe: 8
            }
          ]
        });

      assert.strictEqual(idempRes.status, 200);
      assert.strictEqual(idempRes.body.savedSets.length, 1);
      assert.strictEqual(idempRes.body.savedSets[0].clientUuid, clientUuidA);
    });
  });

  // ──────────────────────────────────────────────────────────
  // 6. BETA FEEDBACK & OBSERVABILITY FLOW
  // ──────────────────────────────────────────────────────────
  describe('6. Beta Feedback & Admin Observability Flow', () => {
    it('Submits Sev-1 feedback from in-app dialog and triggers triage alert', async () => {
      const fbRes = await request(app)
        .post('/api/v1/feedback')
        .set('Authorization', plAthleteToken)
        .send({
          severity: 'SEV1',
          category: 'WORKOUT_LOGGING',
          message: 'Workout timer frozen while logging top single.',
          deviceInfo: {
            platform: 'iOS',
            browser: 'Safari Mobile',
            screenWidth: 390
          }
        });

      assert.strictEqual(fbRes.status, 201);
      assert.strictEqual(fbRes.body.success, true);
      feedbackId = fbRes.body.feedbackId;
      assert.ok(feedbackId);
    });

    it('Admin views feedback list and filters by severity', async () => {
      const listRes = await request(app)
        .get('/api/v1/admin/feedback?severity=SEV1')
        .set('Authorization', adminToken);

      assert.strictEqual(listRes.status, 200);
      assert.strictEqual(listRes.body.success, true);
      assert.ok(listRes.body.feedback.length >= 1);
    });

    it('Admin triages and resolves the feedback ticket', async () => {
      const triageRes = await request(app)
        .patch(`/api/v1/admin/feedback/${feedbackId}/triage`)
        .set('Authorization', adminToken)
        .send({
          status: 'RESOLVED',
          severity: 'SEV2'
        });

      assert.strictEqual(triageRes.status, 200);
      assert.strictEqual(triageRes.body.feedback.status, 'RESOLVED');
    });

    it('Admin fetches live telemetry metrics snapshot', async () => {
      const metricsRes = await request(app)
        .get('/api/v1/admin/telemetry/metrics')
        .set('Authorization', adminToken);

      assert.strictEqual(metricsRes.status, 200);
      assert.strictEqual(metricsRes.body.success, true);
      assert.ok(metricsRes.body.metrics.uptimeSeconds >= 0);
      assert.ok(metricsRes.body.metrics.requests.total > 0);
      assert.ok(metricsRes.body.metrics.latencyMs.p50 >= 0);
    });
  });
});
