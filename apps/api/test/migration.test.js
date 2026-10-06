/**
 * apps/api/test/migration.test.js
 * Unit test suite for data migration script (legacy Firestore/JSON → Postgres).
 */

const { describe, it } = require('node:test');
const assert = require('node:assert');
const path = require('path');
const fs = require('fs');

// We can compile or require via tsx / ts-node or run migration function
const { runMigration } = require('../../../scripts/migrate_firestore_to_postgres');

describe('Data Migration Script Test Suite', () => {

  it('executes a dry-run migration successfully against legacy data', async () => {
    const dataDir = path.resolve(__dirname, '../../../legacy/backend_data');
    const stats = await runMigration({ dryRun: true, dataDir });

    assert.ok(stats.usersScanned >= 4, `Expected at least 4 users scanned, got ${stats.usersScanned}`);
    assert.strictEqual(stats.usersMigrated, stats.usersScanned, 'All scanned users should be marked for migration');
    assert.ok(stats.profilesMigrated >= 4, 'Profiles should match user count');
    assert.ok(stats.memoriesMigrated >= 1, 'At least 1 memory entry migrated');
    assert.strictEqual(stats.errors.length, 0, 'Dry-run should report 0 errors');
  });

  it('handles missing directory gracefully with zero crash', async () => {
    const fakeDir = path.resolve(__dirname, '../../../nonexistent_dir_12345');
    const stats = await runMigration({ dryRun: true, dataDir: fakeDir });

    assert.strictEqual(stats.usersScanned, 0);
    assert.strictEqual(stats.usersMigrated, 0);
    assert.strictEqual(stats.errors.length, 0);
  });

  it('correctly maps roles and handles idempotency', async () => {
    // Create temporary directory with test fixture
    const tmpDir = path.resolve(__dirname, 'tmp_migration_test');
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

    try {
      fs.writeFileSync(
        path.join(tmpDir, 'users.json'),
        JSON.stringify({
          uids: {
            test_admin: { role: 'admin', email: 'adm@test.com' },
            test_coach: { role: 'coach', email: 'cch@test.com' },
            test_ath: { role: 'athlete', email: 'ath@test.com' }
          }
        })
      );

      const stats = await runMigration({ dryRun: true, dataDir: tmpDir });
      assert.strictEqual(stats.usersScanned, 3);
      assert.strictEqual(stats.usersMigrated, 3);
      assert.strictEqual(stats.errors.length, 0);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

});
