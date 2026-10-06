/**
 * scripts/backup_postgres.js
 * Database backup script for PowerLift AI (Phase P8 Runbook).
 * Exports database snapshot to backups/backup-<timestamp>.json with SHA-256 checksum.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(__dirname, '..', 'backups');

  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const backupFilePath = path.join(backupDir, `backup-${timestamp}.json`);
  console.log(`📦 Initiating database snapshot to: ${backupFilePath}`);

  try {
    const data = {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      database: 'powerlift_dev',
      tables: {
        users: await prisma.user.findMany(),
        athleteProfiles: await prisma.athleteProfile.findMany(),
        plProfiles: await prisma.plProfile.findMany(),
        bbProfiles: await prisma.bbProfile.findMany(),
        coachProfiles: await prisma.coachProfile.findMany(),
        coachAthletes: await prisma.coachAthlete.findMany(),
        programs: await prisma.program.findMany(),
        programVersions: await prisma.programVersion.findMany(),
        plannedSessions: await prisma.plannedSession.findMany(),
        sessions: await prisma.session.findMany(),
        sets: await prisma.set.findMany(),
        checkins: await prisma.checkin.findMany(),
        nutritionLogs: await prisma.nutritionLog.findMany(),
        subscriptions: await prisma.subscription.findMany(),
        consentRecords: await prisma.consentRecord.findMany(),
        moderationReports: await prisma.moderationReport.findMany(),
        betaFeedback: await prisma.betaFeedback.findMany()
      }
    };

    const counts = {};
    for (const [table, rows] of Object.entries(data.tables)) {
      counts[table] = rows.length;
    }

    const rawJson = JSON.stringify(data, null, 2);
    const checksum = crypto.createHash('sha256').update(rawJson).digest('hex');

    const backupPayload = {
      meta: {
        checksum,
        timestamp: data.timestamp,
        tableCounts: counts
      },
      data
    };

    fs.writeFileSync(backupFilePath, JSON.stringify(backupPayload, null, 2), 'utf-8');

    console.log(`✅ Backup successfully created!`);
    console.log(`- File: ${backupFilePath}`);
    console.log(`- SHA-256 Checksum: ${checksum}`);
    console.log(`- Table Summary:`, JSON.stringify(counts, null, 2));

    return backupFilePath;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  createBackup()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Backup failed:', err);
      process.exit(1);
    });
}

module.exports = { createBackup };
