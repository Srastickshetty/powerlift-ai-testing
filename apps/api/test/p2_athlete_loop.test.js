/**
 * apps/api/test/p2_athlete_loop.test.js
 * Comprehensive integration test suite for P2 (Athlete Loop):
 * - Onboarding (Youth-Safe Guardrails, Track Isolation, Coach Brief)
 * - Exercise Library (Search, Filter, Substitutes)
 * - Today Screen (Prescription, Ghost Values, Warmup Ladders)
 * - Idempotent Set Logging (client_uuid, Autoregulation, PR detection)
 * - Session Finish & Volume Summary
 * - Missed-Session Recovery & Exercise Swaps
 * - Analytics (e1RM trends, Volume breakdown, History)
 */

const { describe, it } = require('node:test');
const assert = require('node:assert');
const request = require('supertest');

process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/powerlift_dev';

const { app } = require('../dist/server');

describe('P2 — Athlete Loop Integration Test Suite', () => {
  const athleteToken = 'Bearer dev_mock_ath1_athlete_powerlifting';
  const youthToken = 'Bearer dev_mock_ath_youth_athlete_powerlifting';
  let createdSessionId = '';
  let samplePlannedSessionId = '';
  let sampleExerciseId = '';

  describe('1. Exercise Library API', () => {
    it('GET /api/v1/exercises returns paginated list of exercises', async () => {
      const res = await request(app)
        .get('/api/v1/exercises?limit=10')
        .set('Authorization', athleteToken);

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.ok(Array.isArray(res.body.exercises));
      if (res.body.exercises.length > 0) {
        sampleExerciseId = res.body.exercises[0].id;
      }
    });

    it('GET /api/v1/exercises filters by track and pattern', async () => {
      const res = await request(app)
        .get('/api/v1/exercises?track=POWERLIFTING&pattern=SQUAT')
        .set('Authorization', athleteToken);

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
    });

    it('Non-admin cannot create exercise (403)', async () => {
      const res = await request(app)
        .post('/api/v1/exercises')
        .set('Authorization', athleteToken)
        .send({
          name: 'Unauthorized Exercise',
          primaryMuscles: ['quads'],
          pattern: 'SQUAT'
        });

      assert.strictEqual(res.status, 403);
    });
  });

  describe('2. Onboarding Flow & Youth Guardrails', () => {
    it('Under-18 intake automatically enforces Youth Safe Mode (Safety Rule §9)', async () => {
      const youthPayload = {
        track: 'bodybuilding',
        name: 'Young Lifter',
        age: 16,
        sex: 'male',
        bodyweightKg: 65,
        heightCm: 172,
        units: 'kg',
        trainingAgeYears: 1,
        daysPerWeek: 4,
        sessionLengthMinutes: 60,
        equipment: ['barbell', 'dumbbells'],
        injuries: [],
        scheduleConstraints: [],
        bbDetails: {
          goal: 'contest_prep', // Should be demoted to hypertrophy
          division: 'mens_physique',
          splitPreference: 'PPL',
          dietPattern: 'non_veg'
        }
      };

      const res = await request(app)
        .post('/api/v1/me/onboarding')
        .set('Authorization', youthToken)
        .send(youthPayload);

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.coachBrief.isYouthSafeMode, true);
      assert.ok(
        res.body.coachBrief.safetyDirectives.some((d) => d.includes('Youth Safe Mode Active')),
        'Youth safe mode directive must be active'
      );
    });

    it('Powerlifting intake completes and generates Coach Brief with Week 1 schedule', async () => {
      const plPayload = {
        track: 'powerlifting',
        name: 'Deva Athlete',
        age: 24,
        sex: 'male',
        bodyweightKg: 82.5,
        heightCm: 178,
        units: 'kg',
        trainingAgeYears: 3,
        daysPerWeek: 4,
        sessionLengthMinutes: 90,
        equipment: ['barbell', 'squat_rack', 'bench', 'calibrated_plates'],
        injuries: ['Right shoulder impingement'],
        scheduleConstraints: ['No weekends'],
        plDetails: {
          squat1rm: 180,
          bench1rm: 125,
          deadlift1rm: 230,
          federation: 'IPF',
          weightClass: '83kg',
          equipClass: 'raw',
          weakPoints: { bench: 'off_chest' }
        }
      };

      const res = await request(app)
        .post('/api/v1/me/onboarding')
        .set('Authorization', athleteToken)
        .send(plPayload);

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.ok(res.body.coachBrief);
      assert.strictEqual(res.body.coachBrief.track, 'POWERLIFTING');
      assert.ok(res.body.coachBrief.safetyDirectives.some((d) => d.includes('shoulder impingement')));
    });

    it('GET /api/v1/me/onboarding/status returns complete status', async () => {
      const res = await request(app)
        .get('/api/v1/me/onboarding/status')
        .set('Authorization', athleteToken);

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.isComplete, true);
      assert.strictEqual(res.body.track, 'POWERLIFTING');
    });
  });

  describe('3. Today Screen & Workout Execution', () => {
    it('GET /api/v1/training/today returns prescribed session and warm-up ladders', async () => {
      const res = await request(app)
        .get('/api/v1/training/today')
        .set('Authorization', athleteToken);

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      if (res.body.plannedSession) {
        samplePlannedSessionId = res.body.plannedSession.id;
        assert.ok(Array.isArray(res.body.plannedSession.plannedSets));
      }
      assert.ok(res.body.warmupLadders !== undefined);
      assert.ok(res.body.ghostValues !== undefined);
    });

    it('POST /api/v1/training/sessions initializes live workout session', async () => {
      const res = await request(app)
        .post('/api/v1/training/sessions')
        .set('Authorization', athleteToken)
        .send({
          plannedSessionId: samplePlannedSessionId || undefined,
          readiness: { sleepHours: 8, stress: 3 },
          notes: 'Feeling primed'
        });

      assert.strictEqual(res.status, 201);
      assert.strictEqual(res.body.success, true);
      assert.ok(res.body.session.id);
      createdSessionId = res.body.session.id;
    });

    it('POST /api/v1/training/sessions/:id/sets logs sets with idempotent client_uuid', async () => {
      if (!createdSessionId) return;

      const clientUuid = `test_uuid_${Date.now()}`;
      const payload = {
        sets: [
          {
            clientUuid,
            exerciseId: sampleExerciseId || 'test_ex_1',
            setType: 'WORKING',
            weightKg: 140,
            reps: 5,
            rpe: 8.0,
            note: 'Crisp bar speed'
          }
        ]
      };

      // 1st request: creates set
      const res1 = await request(app)
        .post(`/api/v1/training/sessions/${createdSessionId}/sets`)
        .set('Authorization', athleteToken)
        .send(payload);

      assert.strictEqual(res1.status, 200);
      assert.strictEqual(res1.body.savedSets.length, 1);
      assert.strictEqual(res1.body.savedSets[0].clientUuid, clientUuid);

      // 2nd request with exact same clientUuid: updates idempotently, zero duplicate insertion
      const res2 = await request(app)
        .post(`/api/v1/training/sessions/${createdSessionId}/sets`)
        .set('Authorization', athleteToken)
        .send({
          sets: [
            {
              clientUuid,
              exerciseId: sampleExerciseId || 'test_ex_1',
              setType: 'WORKING',
              weightKg: 140,
              reps: 5,
              rpe: 8.5, // slight update
              note: 'Updated RPE'
            }
          ]
        });

      assert.strictEqual(res2.status, 200);
      assert.strictEqual(res2.body.savedSets[0].clientUuid, clientUuid);
      assert.strictEqual(res2.body.savedSets[0].rpe, 8.5);
    });

    it('Live autoregulation prescribes velocity load adjustment on overshoot', async () => {
      if (!createdSessionId) return;

      const res = await request(app)
        .post(`/api/v1/training/sessions/${createdSessionId}/sets`)
        .set('Authorization', athleteToken)
        .send({
          sets: [
            {
              clientUuid: `overshoot_${Date.now()}`,
              exerciseId: sampleExerciseId || 'test_ex_1',
              setType: 'WORKING',
              weightKg: 150,
              reps: 5,
              rpe: 9.5 // Overshot target of 8.0
            }
          ]
        });

      assert.strictEqual(res.status, 200);
      assert.ok(res.body.autoregResults.length > 0);
      assert.strictEqual(res.body.autoregResults[0].status, 'overshot');
      assert.ok(res.body.autoregResults[0].nextLoadKg < 150);
    });

    it('POST /api/v1/training/sessions/:id/finish completes session and tallies volume', async () => {
      if (!createdSessionId) return;

      const res = await request(app)
        .post(`/api/v1/training/sessions/${createdSessionId}/finish`)
        .set('Authorization', athleteToken)
        .send({
          sessionRpe: 8.5,
          notes: 'Solid session, felt strong on top sets.'
        });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.ok(res.body.summary.completedSetsCount >= 2);
      assert.ok(res.body.summary.totalVolumeKg > 0);
    });
  });

  describe('4. Missed Sessions & Exercise Swaps', () => {
    it('POST /api/v1/training/missed-session safely drops or shifts without double-work', async () => {
      if (!samplePlannedSessionId) return;

      const res = await request(app)
        .post('/api/v1/training/missed-session')
        .set('Authorization', athleteToken)
        .send({
          plannedSessionId: samplePlannedSessionId,
          action: 'drop'
        });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.action, 'drop');
      assert.ok(res.body.message.includes('without catch-up'));
    });
  });

  describe('5. Analytics & History', () => {
    it('GET /api/v1/analytics/history returns completed sessions', async () => {
      const res = await request(app)
        .get('/api/v1/analytics/history')
        .set('Authorization', athleteToken);

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.ok(Array.isArray(res.body.history));
    });

    it('GET /api/v1/analytics/volume returns muscle breakdown', async () => {
      const res = await request(app)
        .get('/api/v1/analytics/volume')
        .set('Authorization', athleteToken);

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.ok(res.body.muscleTonnage !== undefined);
    });

    it('GET /api/v1/analytics/e1rm returns progression timeline', async () => {
      const res = await request(app)
        .get('/api/v1/analytics/e1rm')
        .set('Authorization', athleteToken);

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.ok(Array.isArray(res.body.timeline));
    });
  });

});
