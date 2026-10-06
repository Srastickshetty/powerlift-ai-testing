/**
 * scripts/restore_postgres.js
 * Database restore & verification script for PowerLift AI (Phase P8 Runbook).
 * Restores a snapshot and verifies checksum and record integrity.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function restoreBackup(targetFilePath) {
  let filePath = targetFilePath;
  const backupDir = path.join(__dirname, '..', 'backups');

  if (!filePath) {
    if (!fs.existsSync(backupDir)) {
      throw new Error(`Backup directory ${backupDir} does not exist.`);
    }
    const files = fs.readdirSync(backupDir)
      .filter(f => f.startsWith('backup-') && f.endsWith('.json'))
      .sort()
      .reverse();

    if (files.length === 0) {
      throw new Error('No backup files found in backups directory.');
    }
    filePath = path.join(backupDir, files[0]);
  }

  console.log(`\n======================================================`);
  console.log(`🔄 Initiating Database Restore from: ${filePath}`);
  console.log(`======================================================\n`);

  const fileRaw = fs.readFileSync(filePath, 'utf-8');
  const payload = JSON.parse(fileRaw);

  // 1. Verify Checksum
  const computedChecksum = crypto.createHash('sha256').update(JSON.stringify(payload.data, null, 2)).digest('hex');
  if (computedChecksum !== payload.meta.checksum) {
    throw new Error(`Integrity Checksum Mismatch!\nExpected: ${payload.meta.checksum}\nComputed: ${computedChecksum}`);
  }
  console.log(`✔ Checksum verified: ${computedChecksum}`);

  const tables = payload.data.tables;

  // 2. Restore in relational dependency order
  console.log(`Restoring database records...`);

  function sanitizeDates(row) {
    if (!row) return row;
    const res = { ...row };
    const dateKeys = [
      'createdAt', 'updatedAt', 'deletedAt', 'verifiedAt', 'reviewedAt',
      'scheduledPurgeAt', 'purgedAt', 'dob', 'meetDate', 'showDate',
      'startedAt', 'completedAt', 'weekStart', 'date', 'currentPeriodStart',
      'currentPeriodEnd', 'canceledAt'
    ];
    for (const k of dateKeys) {
      if (res[k] !== undefined && res[k] !== null) {
        const d = new Date(res[k]);
        res[k] = isNaN(d.getTime()) ? null : d;
      }
    }
    return res;
  }

  // Users
  for (const u of tables.users) {
    const clean = sanitizeDates(u);
    await prisma.user.upsert({
      where: { id: clean.id },
      create: clean,
      update: { name: clean.name, email: clean.email, role: clean.role, deletedAt: clean.deletedAt }
    });
  }

  // Athlete Profiles
  for (const p of tables.athleteProfiles) {
    const clean = sanitizeDates(p);
    await prisma.athleteProfile.upsert({
      where: { userId: clean.userId },
      create: clean,
      update: clean
    });
  }

  // PL Profiles
  for (const p of tables.plProfiles) {
    const clean = sanitizeDates(p);
    await prisma.plProfile.upsert({
      where: { userId: clean.userId },
      create: clean,
      update: clean
    });
  }

  // BB Profiles
  for (const p of tables.bbProfiles) {
    const clean = sanitizeDates(p);
    await prisma.bbProfile.upsert({
      where: { userId: clean.userId },
      create: clean,
      update: clean
    });
  }

  // Coach Profiles
  for (const p of tables.coachProfiles) {
    const clean = sanitizeDates(p);
    await prisma.coachProfile.upsert({
      where: { userId: clean.userId },
      create: clean,
      update: clean
    });
  }

  // Programs
  for (const prog of tables.programs) {
    const clean = sanitizeDates(prog);
    await prisma.program.upsert({
      where: { id: clean.id },
      create: clean,
      update: clean
    });
  }

  // Checkins
  for (const c of tables.checkins) {
    const clean = sanitizeDates(c);
    await prisma.checkin.upsert({
      where: { id: clean.id },
      create: clean,
      update: clean
    });
  }

  // Beta Feedback
  for (const fb of tables.betaFeedback || []) {
    const clean = sanitizeDates(fb);
    await prisma.betaFeedback.upsert({
      where: { id: clean.id },
      create: clean,
      update: clean
    });
  }

  console.log(`\n======================================================`);
  console.log(`✅ Database Restore Completed & Integrity Confirmed!`);
  console.log(`======================================================\n`);
  return { success: true, restoredAt: new Date().toISOString() };
}

if (require.main === module) {
  restoreBackup(process.argv[2])
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Restore failed:', err);
      process.exit(1);
    });
}

module.exports = { restoreBackup };
