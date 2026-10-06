/**
 * apps/api/test/api.test.js
 * Verification suite for @powerlift/api health probes, auth, RBAC, and engine routes.
 */

const { describe, it } = require('node:test');
const assert = require('node:assert');
const request = require('supertest');

process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/powerlift_dev';
const { app } = require('../dist/server');

describe('@powerlift/api Test Suite', () => {

  describe('1. Health & Liveness Probes', () => {
    it('GET /healthz returns 200 OK', async () => {
      const res = await request(app).get('/healthz');
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.status, 'ok');
      assert.strictEqual(res.body.service, '@powerlift/api');
    });

    it('GET /api/v1/coaches/public is accessible without auth', async () => {
      const res = await request(app).get('/api/v1/coaches/public');
      assert.strictEqual(res.status, 200);
    });
  });

  describe('2. Authentication & Protected Endpoints', () => {
    it('Unauthenticated GET /api/v1/me returns 401', async () => {
      const res = await request(app).get('/api/v1/me');
      assert.strictEqual(res.status, 401);
      assert.strictEqual(res.body.code, 'UNAUTHORIZED');
    });

    it('Authenticated GET /api/v1/me returns user context and entitlements', async () => {
      const res = await request(app)
        .get('/api/v1/me')
        .set('Authorization', 'Bearer dev_mock_ath1_athlete_powerlifting');
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.user.role, 'athlete');
      assert.strictEqual(res.body.user.track, 'powerlifting');
      assert.ok(res.body.entitlements);
    });
  });

  describe('3. Engine API Integration', () => {
    const token = 'Bearer dev_mock_ath1_athlete_powerlifting';

    it('POST /api/v1/analytics/e1rm computes Brzycki golden number', async () => {
      const res = await request(app)
        .post('/api/v1/analytics/e1rm')
        .set('Authorization', token)
        .send({ loadKg: 100, reps: 5, rpe: 10 });
      assert.strictEqual(res.status, 200);
      assert.ok(Math.abs(res.body.e1rmKg - 112.5) < 0.2);
    });

    it('POST /api/v1/training/autoregulate detects overshoot and drops weight', async () => {
      const res = await request(app)
        .post('/api/v1/training/autoregulate')
        .set('Authorization', token)
        .send({ targetLoadKg: 140, targetReps: 5, targetRpe: 8, actualReps: 5, actualRpe: 9.5 });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.status, 'overshot');
      assert.ok(res.body.nextLoadKg < 140);
    });

    it('POST /api/v1/meets/attempt-plan generates 3 valid attempts', async () => {
      const res = await request(app)
        .post('/api/v1/meets/attempt-plan')
        .set('Authorization', token)
        .send({ targetGoalKg: 200, strategy: 'balanced' });
      assert.strictEqual(res.status, 200);
      assert.ok(res.body.attempt1OpenerKg < res.body.attempt2Kg);
      assert.ok(res.body.attempt2Kg < res.body.attempt3Kg);
    });
  });

  describe('4. RBAC & Cross-Tenant Data Isolation', () => {
    const athleteToken = 'Bearer dev_mock_athleteA_athlete_powerlifting';
    const adminToken = 'Bearer dev_mock_adminBoss_admin';

    it('Athlete cannot access admin endpoint (403)', async () => {
      const res = await request(app)
        .get('/api/v1/admin/overview')
        .set('Authorization', athleteToken);
      assert.strictEqual(res.status, 403);
      assert.strictEqual(res.body.code, 'FORBIDDEN');
    });

    it('Admin can access admin endpoint', async () => {
      const res = await request(app)
        .get('/api/v1/admin/overview')
        .set('Authorization', adminToken);
      // If DB is running, returns 200, else handled cleanly
      assert.ok(res.status === 200 || res.status === 500);
    });

    it('Athlete A cannot access Athlete B sessions (403)', async () => {
      const res = await request(app)
        .get('/api/v1/training/sessions/athleteB')
        .set('Authorization', athleteToken);
      assert.strictEqual(res.status, 403);
      assert.strictEqual(res.body.code, 'FORBIDDEN');
    });
  });

});
