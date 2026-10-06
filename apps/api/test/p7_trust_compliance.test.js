/**
 * apps/api/test/p7_trust_compliance.test.js
 * Integration test suite for Phase P7 (Trust, Privacy, Safety UX):
 * - Versioned Consent Tracking (GDPR / Health Data / AI Opt-In)
 * - Complete Data Export with SHA-256 Checksum (Right to Access)
 * - Account Deletion Lifecycle (30-Day Grace Period, Cancellation, Hard Purge)
 * - Content & Coach Moderation Queue
 * - Safety Constraint Verification (§9 Hard Rules: Nutrition Deficit, Youth, Pain)
 * - Multi-Tenant Admin Boundary & Security Controls
 */

const { describe, it } = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const crypto = require('crypto');

process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/powerlift_dev';

const { app } = require('../dist/server');
const { prisma } = require('../dist/lib/prisma');
const {
  validatePainThreshold,
  validateLoadJump,
  validateYouthSafeguards,
  validateNutritionDeficit
} = require('@powerlift/engines');

describe('P7 — Trust, Privacy & Safety Compliance Integration Test Suite', () => {
  const runId = Math.random().toString(36).substring(2, 7);
  const adminToken = `Bearer dev_mock_p7adm${runId}_admin_powerlifting`;
  const athleteToken = `Bearer dev_mock_p7ath${runId}_athlete_powerlifting`;
  const rogueAthleteToken = `Bearer dev_mock_p7rog${runId}_athlete_powerlifting`;

  let athleteUserId = '';
  let reportId = '';

  describe('1. Setup & Profile Verification', () => {
    it('Onboards an athlete for compliance testing', async () => {
      const res = await request(app)
        .post('/api/v1/me/onboarding')
        .set('Authorization', athleteToken)
        .send({
          track: 'powerlifting',
          name: 'P7 Athlete',
          age: 26,
          sex: 'male',
          heightCm: 178,
          bodyweightKg: 83,
          trainingAgeYears: 2,
          daysPerWeek: 4,
          plDetails: {
            squat1rm: 180,
            bench1rm: 125,
            deadlift1rm: 220
          }
        });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.ok(res.body.profile);
      athleteUserId = res.body.profile.userId;
      assert.ok(athleteUserId, 'athleteUserId should be created');
    });
  });

  describe('2. Versioned Consent Management', () => {
    it('POST /api/v1/compliance/consent records versioned consent grants', async () => {
      const res = await request(app)
        .post('/api/v1/compliance/consent')
        .set('Authorization', athleteToken)
        .send({
          consents: [
            { scope: 'HEALTH_DATA', granted: true, version: '1.2' },
            { scope: 'COACH_MEDIA_SHARING', granted: true, version: '1.0' },
            { scope: 'AI_TRAINING_OPT_IN', granted: false, version: '1.0' },
            { scope: 'TERMS_AND_PRIVACY', granted: true, version: '2026.1' }
          ]
        });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.consents.length, 4);

      // Verify audit log record
      const audit = await prisma.auditLog.findFirst({
        where: { actorId: athleteUserId, action: 'CONSENT_UPDATED' },
        orderBy: { at: 'desc' }
      });
      assert.ok(audit, 'AuditLog should record consent update');
    });

    it('GET /api/v1/compliance/consent returns current deduplicated consents', async () => {
      const res = await request(app)
        .get('/api/v1/compliance/consent')
        .set('Authorization', athleteToken);

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      const scopes = res.body.consents.map(c => c.scope);
      assert.ok(scopes.includes('HEALTH_DATA'));
      assert.ok(scopes.includes('COACH_MEDIA_SHARING'));
      assert.ok(scopes.includes('AI_TRAINING_OPT_IN'));
      assert.ok(scopes.includes('TERMS_AND_PRIVACY'));
    });
  });

  describe('3. Right of Access & Data Portability (Full Export)', () => {
    it('POST /api/v1/me/export returns structured archive with valid SHA-256 digest', async () => {
      const res = await request(app)
        .post('/api/v1/me/export')
        .set('Authorization', athleteToken);

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.ok(res.body.checksum, 'Export must include checksum');
      assert.ok(res.body.data, 'Export must include user data bundle');

      // Verify checksum integrity
      const calculatedChecksum = crypto.createHash('sha256').update(JSON.stringify(res.body.data, null, 2)).digest('hex');
      assert.strictEqual(res.body.checksum, calculatedChecksum, 'Checksum must match payload digest');

      // Verify bundle contents
      assert.strictEqual(res.body.data.user.id, athleteUserId);
      assert.ok(res.body.data.user.profiles.athlete, 'Athlete profile included');
      assert.ok(Array.isArray(res.body.data.training.sessions), 'Sessions included');
      assert.ok(Array.isArray(res.body.data.consents), 'Consents included');
    });
  });

  describe('4. Right to Erasure / Deletion with 30-Day Grace Period', () => {
    it('POST /api/v1/me/delete schedules deletion in 30 days and sets soft delete', async () => {
      const res = await request(app)
        .post('/api/v1/me/delete')
        .set('Authorization', athleteToken)
        .send({
          confirmation: 'DELETE_MY_ACCOUNT',
          reason: 'Switching to another gym routine'
        });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.deletion.status, 'PENDING');

      // Verify 30-day grace period
      const scheduledDate = new Date(res.body.deletion.scheduledPurgeAt);
      const diffDays = Math.round((scheduledDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      assert.ok(diffDays >= 29 && diffDays <= 31, 'Scheduled purge must be ~30 days in the future');

      // Check user record is soft-deleted
      const user = await prisma.user.findUnique({ where: { id: athleteUserId } });
      assert.ok(user.deletedAt, 'User deletedAt must be set');
    });

    it('POST /api/v1/me/delete/cancel cancels deletion and restores user account', async () => {
      const res = await request(app)
        .post('/api/v1/me/delete/cancel')
        .set('Authorization', athleteToken);

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.deletion.status, 'CANCELLED');

      const user = await prisma.user.findUnique({ where: { id: athleteUserId } });
      assert.strictEqual(user.deletedAt, null, 'User deletedAt must be cleared upon cancellation');
    });

    it('Admin hard-purge job removes expired accounts past 30 days', async () => {
      // 1. Create temporary expired user
      const purgeId = Math.random().toString(36).substring(2, 7);
      const expiredUser = await prisma.user.create({
        data: {
          firebaseUid: `expired_${purgeId}`,
          email: `expired_${purgeId}@test.com`,
          name: 'Expired Lifter',
          role: 'ATHLETE',
          deletedAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000)
        }
      });

      await prisma.deletionRequest.create({
        data: {
          userId: expiredUser.id,
          status: 'PENDING',
          scheduledPurgeAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days past due
        }
      });

      // 2. Trigger admin purge
      const res = await request(app)
        .post('/api/v1/admin/purge-expired')
        .set('Authorization', adminToken);

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.ok(res.body.purgedIds.includes(expiredUser.id), 'Expired user must be purged');

      // 3. Verify user is completely deleted
      const check = await prisma.user.findUnique({ where: { id: expiredUser.id } });
      assert.strictEqual(check, null, 'User row must be completely removed from database');
    });
  });

  describe('5. Moderation & Reporting Queue', () => {
    it('POST /api/v1/compliance/reports submits a moderation report', async () => {
      const res = await request(app)
        .post('/api/v1/compliance/reports')
        .set('Authorization', athleteToken)
        .send({
          reason: 'UNSAFE_ADVICE',
          details: 'Coach recommended doing 1RM squats despite knee swelling.'
        });

      assert.strictEqual(res.status, 201);
      assert.strictEqual(res.body.success, true);
      assert.ok(res.body.reportId);
      reportId = res.body.reportId;
    });

    it('GET /api/v1/admin/reports allows admin to inspect report queue', async () => {
      const res = await request(app)
        .get('/api/v1/admin/reports')
        .set('Authorization', adminToken);

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      const found = res.body.reports.find(r => r.id === reportId);
      assert.ok(found, 'Report should be present in admin queue');
      assert.strictEqual(found.status, 'PENDING');
    });

    it('POST /api/v1/admin/reports/:id/action resolves the moderation report', async () => {
      const res = await request(app)
        .post(`/api/v1/admin/reports/${reportId}/action`)
        .set('Authorization', adminToken)
        .send({
          action: 'RESOLVED',
          resolution: 'Investigated and sent formal safety warning to coach regarding §9 pain rules.'
        });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.report.status, 'RESOLVED');
    });
  });

  describe('6. Safety Engine Constraints (§9) Property Verification', () => {
    it('Rule 1: validatePainThreshold halts training when pain >= 7 or neurological signs appear', () => {
      const severe = validatePainThreshold(8, []);
      assert.strictEqual(severe.allowed, false);
      assert.strictEqual(severe.actionRequired, 'MEDICAL_REFERRAL_REQUIRED');

      const neuro = validatePainThreshold(3, ['shooting pain down left leg']);
      assert.strictEqual(neuro.allowed, false);
      assert.strictEqual(neuro.actionRequired, 'MEDICAL_REFERRAL_REQUIRED');

      const moderate = validatePainThreshold(5, []);
      assert.strictEqual(moderate.allowed, true);
      assert.strictEqual(moderate.actionRequired, 'AUTO_REDUCE_OR_SWAP');
    });

    it('Rule 2: validateLoadJump strictly enforces 5% load increase cap', () => {
      const excessive = validateLoadJump(100, 115, 2.0); // +15%
      assert.strictEqual(excessive.allowed, false);
      assert.strictEqual(excessive.clampedLoadKg, 105);

      const safe = validateLoadJump(100, 102.5, 2.0); // +2.5%
      assert.strictEqual(safe.allowed, true);
    });

    it('Rule 5: validateYouthSafeguards restricts minors from contest prep & unconsented coaching', () => {
      const youth = validateYouthSafeguards(16, 'contest_prep', false);
      assert.strictEqual(youth.allowed, false);
      assert.ok(youth.blockedFeatures.includes('contest_prep'));
      assert.ok(youth.blockedFeatures.includes('coach_marketplace'));

      const adult = validateYouthSafeguards(24, 'contest_prep', true);
      assert.strictEqual(adult.allowed, true);
      assert.strictEqual(youth.isYouthSafeMode, true);
      assert.strictEqual(adult.isYouthSafeMode, false);
    });

    it('Rule 6 & 7: validateNutritionDeficit prevents starvation (<80% BMR) and ensures protein floor (>=1.2g/kg)', () => {
      const bmr = 1800;
      const bodyweightKg = 80;

      // Deficit too severe: 1200 kcal (< 80% BMR = 1440)
      const starvation = validateNutritionDeficit(bmr, 1200, bodyweightKg, 120);
      assert.strictEqual(starvation.allowed, false);
      assert.ok(starvation.violations.some(v => v.includes('Extreme caloric deficit blocked')));

      // Inadequate protein: 60g (< 80 * 1.2 = 96g)
      const lowProtein = validateNutritionDeficit(bmr, 1600, bodyweightKg, 60);
      assert.strictEqual(lowProtein.allowed, false);
      assert.ok(lowProtein.violations.some(v => v.includes('Inadequate protein intake')));

      // Safe deficit
      const safe = validateNutritionDeficit(bmr, 1650, bodyweightKg, 160);
      assert.strictEqual(safe.allowed, true);
      assert.strictEqual(safe.violations.length, 0);
    });
  });

  describe('7. Multi-Tenant Authorization Security', () => {
    it('Rogue athlete cannot access admin reports queue (403 Forbidden)', async () => {
      const res = await request(app)
        .get('/api/v1/admin/reports')
        .set('Authorization', rogueAthleteToken);

      assert.strictEqual(res.status, 403);
    });

    it('Rogue athlete cannot trigger admin purge job (403 Forbidden)', async () => {
      const res = await request(app)
        .post('/api/v1/admin/purge-expired')
        .set('Authorization', rogueAthleteToken);

      assert.strictEqual(res.status, 403);
    });
  });
});
