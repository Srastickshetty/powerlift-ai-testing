/**
 * apps/api/test/p3_dual_tracks.test.js
 * Comprehensive integration test suite for P3:
 * - Dual-Track Isolation (Powerlifting vs Bodybuilding)
 * - Pure Sports Science Engines Verification
 * - Safety Engine Hard Rules (§9) Non-Negotiable Constraints
 * - Weekly Evolution Job (ProgramVersion DRAFT -> ACTIVE)
 */

const { describe, it } = require('node:test');
const assert = require('node:assert');
const request = require('supertest');

process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/powerlift_dev';

const { app } = require('../dist/server');
const {
  calculateDots,
  calculateIpfGl,
  calculateWilks,
  calculateSetInol,
  getVariationsForWeakPoint,
  evaluateMuscleVolume,
  evaluateDoubleProgression,
  generateIndianDietPlan,
  validateLoadJump,
  validatePainThreshold,
  validateYouthSafeguards,
  evaluateIntensityTechniqueGating
} = require('@powerlift/engines');

describe('P3 — Dual Tracks & Safety Integration Test Suite', () => {
  const plAthleteToken = 'Bearer dev_mock_p3pl_athlete_powerlifting';
  const bbAthleteToken = 'Bearer dev_mock_p3bb_athlete_bodybuilding';
  let createdDraftVersionId = '';

  describe('1. Track Isolation & Separate Domain Onboarding', () => {
    it('Powerlifting onboarding creates IPF-ready profile and protocol', async () => {
      const plPayload = {
        track: 'powerlifting',
        name: 'PL Champion',
        age: 26,
        sex: 'male',
        bodyweightKg: 83,
        heightCm: 175,
        units: 'kg',
        trainingAgeYears: 4,
        daysPerWeek: 4,
        sessionLengthMinutes: 90,
        equipment: ['barbell', 'rack', 'bench', 'plates'],
        injuries: [],
        plDetails: {
          federation: 'IPF',
          weightClass: '83kg',
          equipClass: 'raw',
          squat1rm: 200,
          bench1rm: 140,
          deadlift1rm: 240
        }
      };

      const res = await request(app)
        .post('/api/v1/me/onboarding')
        .set('Authorization', plAthleteToken)
        .send(plPayload);

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.profile.track, 'POWERLIFTING');
      assert.ok(res.body.programId);
      assert.ok(res.body.programVersionId);
      assert.ok(res.body.coachBrief);
    });

    it('Bodybuilding onboarding creates physique profile with division and target weight', async () => {
      const bbPayload = {
        track: 'bodybuilding',
        name: 'Aesthetic Lifter',
        age: 24,
        sex: 'male',
        bodyweightKg: 78,
        heightCm: 180,
        units: 'kg',
        trainingAgeYears: 3,
        daysPerWeek: 5,
        sessionLengthMinutes: 60,
        equipment: ['dumbbells', 'cables', 'machines'],
        injuries: [],
        bbDetails: {
          division: 'mens_physique',
          splitPreference: 'PPL',
          dietPattern: 'vegetarian',
          goal: 'hypertrophy'
        }
      };

      const res = await request(app)
        .post('/api/v1/me/onboarding')
        .set('Authorization', bbAthleteToken)
        .send(bbPayload);

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.profile.track, 'BODYBUILDING');
      assert.ok(res.body.programId);
      assert.ok(res.body.coachBrief);
    });

    it('GET /api/v1/me returns verified DB-backed track without localStorage dependency', async () => {
      const res = await request(app)
        .get('/api/v1/me')
        .set('Authorization', plAthleteToken);

      assert.strictEqual(res.status, 200);
      assert.ok(res.body.user);
      assert.strictEqual(res.body.user.track, 'powerlifting');
      assert.ok(res.body.profile);
    });
  });

  describe('2. Safety Engine Hard Rules Enforcement (§9)', () => {
    it('Rule 1: Weekly load jump > 5% is strictly capped and flagged', () => {
      const result = validateLoadJump(100, 107.5, 3.0); // 7.5% jump for intermediate lifter
      assert.strictEqual(result.allowed, false);
      assert.strictEqual(result.percentageJump, 7.5);
      assert.strictEqual(result.maxAllowedPercent, 5.0);
      assert.strictEqual(result.clampedLoadKg, 105);
    });

    it('Rule 2: Joint pain >= 7 triggers emergency safety stop and physician referral', () => {
      const result = validatePainThreshold(8);
      assert.strictEqual(result.allowed, false);
      assert.strictEqual(result.actionRequired, 'MEDICAL_REFERRAL_REQUIRED');
      assert.ok(result.guidance.includes('Safety Rule §9 Violation'));
    });

    it('Rule 3: Youth (<18) contest prep restrictions are enforced strictly', () => {
      const result = validateYouthSafeguards(16, 'contest_prep');
      assert.strictEqual(result.isYouthSafeMode, true);
      assert.ok(result.blockedFeatures.includes('contest_prep'));
      assert.ok(result.reasons.some(r => r.includes('Under-18 athletes are strictly blocked')));
    });

    it('Rule 4: Intensity techniques gating blocks novice drop sets on compound axial lifts', () => {
      const resultCompound = evaluateIntensityTechniqueGating('drop_set', 3.0, false, true);
      assert.strictEqual(resultCompound.allowed, false);
      assert.ok(resultCompound.reason.includes('heavy axial loading'));

      const resultNovice = evaluateIntensityTechniqueGating('drop_set', 0.8, false, false);
      assert.strictEqual(resultNovice.allowed, false);
      assert.ok(resultNovice.reason.includes('Athletes with <1.5 years of training age'));
    });
  });

  describe('3. Pure Calculation Engines Verification', () => {
    it('Powerlifting Points: Calculates DOTS, IPF GL, and Wilks correctly', () => {
      const dots = calculateDots(83, 650, 'male');
      assert.ok(dots > 425 && dots < 445, `DOTS should be ~435, got ${dots}`);

      const ipfGl = calculateIpfGl(63, 420, 'female');
      assert.ok(ipfGl > 80 && ipfGl < 105, `IPF GL should be ~90, got ${ipfGl}`);

      const wilks = calculateWilks(93, 700, 'male');
      assert.ok(wilks > 400 && wilks < 460, `Wilks should be ~430, got ${wilks}`);
    });

    it('Volume / Fatigue: Calculates INOL deterministically', () => {
      const inol = calculateSetInol(5, 160, 200); // 160/200 = 80%
      assert.strictEqual(inol.setInol, 0.25);
      assert.strictEqual(inol.intensityPercent, 80);
    });

    it('Weak Point Mapper: Prescribes compound variations for sticking point', () => {
      const variations = getVariationsForWeakPoint('deadlift', 'off_floor');
      assert.ok(variations.length >= 1);
      assert.ok(variations.some(v => v.variationName.includes('Deficit')));
    });

    it('Hypertrophy Volume Radar: Evaluates MV, MEV, MAV, MRV zones', () => {
      const sweetSpot = evaluateMuscleVolume('chest', 16);
      assert.strictEqual(sweetSpot.status, 'optimal_mav');
      assert.strictEqual(sweetSpot.landmarks.mavMin, 12);
      assert.strictEqual(sweetSpot.landmarks.mavMax, 20);
    });

    it('Double Progression Engine: Advances load when top of rep range is hit', () => {
      const decision = evaluateDoubleProgression(8, 12, 30, [
        { loadKg: 30, reps: 12, rir: 1 },
        { loadKg: 30, reps: 12, rir: 1 },
        { loadKg: 30, reps: 12, rir: 1 }
      ]);
      assert.strictEqual(decision.action, 'INCREASE_LOAD');
      assert.strictEqual(decision.nextLoadKg, 32.5);
    });

    it('Indian Diet & Nutrition Engine: Optimizes protein targets within INR budget', () => {
      const plan = generateIndianDietPlan({ bodyweightKg: 75, dietType: 'vegetarian' });
      assert.strictEqual(plan.dietType, 'vegetarian');
      assert.ok(plan.meals.length >= 4);
      assert.ok(plan.estimatedDailyCostINR <= 160);
      assert.ok(plan.staplesHighlighted.includes('Soya Chunks'));
    });
  });

  describe('4. Weekly Evolution Job & Program Versioning', () => {
    it('POST /api/v1/training/evolve-week generates ProgramVersion(DRAFT) with rationale', async () => {
      const checkInPayload = {
        fatigueScore1To10: 8,
        sorenessScore1To10: 7,
        jointPain0To10: 2,
        sessionsCompleted: 4,
        sessionsTargeted: 4,
        averageSessionRpe: 9.0,
        bodyweightKg: 83.2
      };

      const res = await request(app)
        .post('/api/v1/training/evolve-week')
        .set('Authorization', plAthleteToken)
        .send(checkInPayload);

      assert.strictEqual(res.status, 201);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.status, 'DRAFT');
      assert.ok(res.body.rationale);
      assert.ok(res.body.draftVersionId);
      createdDraftVersionId = res.body.draftVersionId;
    });

    it('POST /api/v1/training/approve-draft/:versionId promotes DRAFT to ACTIVE', async () => {
      assert.ok(createdDraftVersionId, 'Draft version must exist from previous step');

      const res = await request(app)
        .post(`/api/v1/training/approve-draft/${createdDraftVersionId}`)
        .set('Authorization', plAthleteToken);

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.status, 'ACTIVE');
      assert.ok(res.body.message.includes('ACTIVE'));
    });
  });
});
