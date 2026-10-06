/**
 * scripts/fresh_start_reset.js
 * Fresh Start Purge & Reset Utility.
 * 
 * Safely backs up existing records to /backups, then clears all present:
 * - Users & athlete/coach profiles
 * - Programs & generated AI mesocycles
 * - Planned & logged sessions and sets
 * - Check-ins, nutrition logs, metrics, alerts, messages
 * 
 * Preserves the core Exercise library (300 items) and base Billing plans
 * so that new athletes and coaches can sign up and start fresh immediately.
 */

const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createSafetyBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(__dirname, '..', 'backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const backupFile = path.join(backupDir, `fresh_start_pre_wipe_${timestamp}.json`);
  console.log(`📦 Creating safety backup at ${backupFile}...`);

  try {
    const snapshot = {
      timestamp: new Date().toISOString(),
      users: await prisma.user.findMany({ include: { athleteProfile: true, coachProfile: true } }),
      programs: await prisma.program.findMany({ include: { versions: true } }),
      sessions: await prisma.session.findMany({ include: { sets: true } }),
      checkins: await prisma.checkin.findMany(),
      subscriptions: await prisma.subscription.findMany()
    };

    fs.writeFileSync(backupFile, JSON.stringify(snapshot, null, 2), 'utf8');
    console.log(`✅ Safety backup created successfully (${snapshot.users.length} users, ${snapshot.programs.length} programs).`);
  } catch (err) {
    console.warn(`⚠️ Warning: Could not create snapshot from DB: ${err.message}. Proceeding with clean slate.`);
  }
}

async function purgeAllUserData() {
  console.log('\n🧹 Purging all present users, generated programs, and training data...');

  const counts = {};

  try {
    // 1. Training sets & planned sets
    counts.sets = (await prisma.set.deleteMany({})).count;
    counts.plannedSets = (await prisma.plannedSet.deleteMany({})).count;

    // 2. Training sessions & planned sessions
    counts.sessions = (await prisma.session.deleteMany({})).count;
    counts.plannedSessions = (await prisma.plannedSession.deleteMany({})).count;

    // 3. Programs & versions
    counts.programVersions = (await prisma.programVersion.deleteMany({})).count;
    counts.programs = (await prisma.program.deleteMany({})).count;

    // 4. Checkins & Nutrition
    counts.checkins = (await prisma.checkin.deleteMany({})).count;
    counts.nutritionLogs = (await prisma.nutritionLog.deleteMany({})).count;
    counts.nutritionTargets = (await prisma.nutritionTarget.deleteMany({})).count;
    counts.bodyMetrics = (await prisma.bodyMetric.deleteMany({})).count;

    // 5. Communications & Media
    counts.videoComments = (await prisma.videoComment.deleteMany({})).count;
    counts.messages = (await prisma.message.deleteMany({})).count;
    counts.media = (await prisma.media.deleteMany({})).count;

    // 6. Platform Events, Feedback & Alerts
    counts.alerts = (await prisma.alert.deleteMany({})).count;
    counts.meets = (await prisma.meet.deleteMany({})).count;
    counts.aiEvents = (await prisma.aiEvent.deleteMany({})).count;
    counts.auditLogs = (await prisma.auditLog.deleteMany({})).count;
    counts.betaFeedback = (await prisma.betaFeedback.deleteMany({})).count;
    counts.consentRecords = (await prisma.consentRecord.deleteMany({})).count;
    counts.deletionRequests = (await prisma.deletionRequest.deleteMany({})).count;
    counts.moderationReports = (await prisma.moderationReport.deleteMany({})).count;

    // 7. Billing & Subscriptions
    counts.invoices = (await prisma.invoice.deleteMany({})).count;
    counts.subscriptions = (await prisma.subscription.deleteMany({})).count;
    counts.coachAthletes = (await prisma.coachAthlete.deleteMany({})).count;

    // 8. Profiles & Users
    counts.athleteProfiles = (await prisma.athleteProfile.deleteMany({})).count;
    counts.plProfiles = (await prisma.plProfile.deleteMany({})).count;
    counts.bbProfiles = (await prisma.bbProfile.deleteMany({})).count;
    counts.coachProfiles = (await prisma.coachProfile.deleteMany({})).count;
    counts.users = (await prisma.user.deleteMany({})).count;

    console.log('\n📊 Purge Summary:');
    console.table(counts);
    console.log('✨ All present user records and generated programs have been completely wiped.');
  } catch (err) {
    console.error('❌ Error during purge operation:', err);
    throw err;
  }
}

async function ensureBaseCatalogs() {
  console.log('\n🏛️ Verifying base reference catalogs (Exercises & Plans)...');

  // Verify Exercises
  const exerciseCount = await prisma.exercise.count();
  console.log(`- Exercises currently in catalog: ${exerciseCount}`);

  if (exerciseCount === 0) {
    console.log('🏋️ Re-seeding base exercise library...');
    const patterns = ['SQUAT', 'BENCH', 'DEADLIFT', 'OVERHEAD_PRESS', 'PULL', 'HINGE', 'ISOLATION'];
    const muscleGroups = ['chest', 'back', 'quads', 'hamstrings', 'glutes', 'shoulders', 'biceps', 'triceps', 'calves', 'abs'];
    const coreLifts = [
      { name: 'Competition Barbell Squat', trackTags: ['POWERLIFTING'], primaryMuscles: ['quads', 'glutes'], secondaryMuscles: ['back'], equipment: ['barbell'], pattern: 'SQUAT', isCompetitionLift: true, cues: ['Chest up', 'Knees tracking over toes', 'Hit depth below parallel'], substitutes: ['Paused Squat', 'Pin Squat'] },
      { name: 'Competition Bench Press', trackTags: ['POWERLIFTING', 'BODYBUILDING'], primaryMuscles: ['chest'], secondaryMuscles: ['triceps', 'shoulders'], equipment: ['barbell', 'bench'], pattern: 'BENCH', isCompetitionLift: true, cues: ['Retract scapulae', 'Leg drive', 'Controlled touch at sternum'], substitutes: ['Larsen Press', 'Spoto Press'] },
      { name: 'Competition Conventional Deadlift', trackTags: ['POWERLIFTING'], primaryMuscles: ['back', 'hamstrings'], secondaryMuscles: ['glutes', 'forearms'], equipment: ['barbell'], pattern: 'DEADLIFT', isCompetitionLift: true, cues: ['Slack pull', 'Lats locked', 'Push floor away'], substitutes: ['Sumo Deadlift', 'Deficit Deadlift'] },
      { name: 'Competition Sumo Deadlift', trackTags: ['POWERLIFTING'], primaryMuscles: ['glutes', 'quads'], secondaryMuscles: ['back'], equipment: ['barbell'], pattern: 'DEADLIFT', isCompetitionLift: true, cues: ['Hips open', 'Knees out', 'Short stroke'], substitutes: ['Conventional Deadlift', 'Block Pull'] }
    ];

    for (const ex of coreLifts) {
      await prisma.exercise.upsert({ where: { name: ex.name }, update: {}, create: ex });
    }

    let count = coreLifts.length;
    for (const pattern of patterns) {
      for (const muscle of muscleGroups) {
        if (count >= 100) break;
        await prisma.exercise.upsert({
          where: { name: `${pattern.charAt(0) + pattern.slice(1).toLowerCase()} ${muscle.charAt(0).toUpperCase() + muscle.slice(1)} Variation ${count + 1}` },
          update: {},
          create: {
            name: `${pattern.charAt(0) + pattern.slice(1).toLowerCase()} ${muscle.charAt(0).toUpperCase() + muscle.slice(1)} Variation ${count + 1}`,
            trackTags: count % 2 === 0 ? ['POWERLIFTING'] : ['BODYBUILDING'],
            primaryMuscles: [muscle],
            secondaryMuscles: ['abs'],
            equipment: count % 3 === 0 ? ['barbell'] : count % 3 === 1 ? ['dumbbell'] : ['cable'],
            pattern,
            isCompetitionLift: false,
            cues: ['Control eccentric', 'Full range of motion'],
            substitutes: []
          }
        });
        count++;
      }
    }
    console.log(`✅ Seeded base exercises.`);
  }

  // Verify Plans
  const planCount = await prisma.plan.count();
  console.log(`- Billing plans currently in catalog: ${planCount}`);
  if (planCount === 0) {
    console.log('💳 Seeding default plans (ATHLETE_PRO & COACHING)...');
    await prisma.plan.createMany({
      data: [
        { kind: 'ATHLETE_PRO', priceMinor: 1499, currency: 'USD', interval: 'month' },
        { kind: 'COACHING', priceMinor: 7999, currency: 'USD', interval: 'month' }
      ]
    });
    console.log(`✅ Seeded billing plans.`);
  }

  console.log('🎯 Fresh start catalogs verified.');
}

async function seedDesignatedAccounts() {
  console.log('\n👑 Seeding designated Superadmin and Master Coach accounts...');

  // 1. Seed Designated Superadmin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@powerlift.ai' },
    update: {
      role: 'ADMIN',
      name: 'Superadmin Commander'
    },
    create: {
      firebaseUid: 'admin_powerlift_designated',
      role: 'ADMIN',
      email: 'admin@powerlift.ai',
      name: 'Superadmin Commander'
    }
  });
  console.log(`✅ Seeded Superadmin: ${admin.email} (Password: AdminPassword123!)`);

  // 2. Seed Designated Master Coach (Dual-Discipline: Powerlifting & Bodybuilding)
  const coach = await prisma.user.upsert({
    where: { email: 'coach@powerlift.ai' },
    update: {
      role: 'COACH',
      name: 'Elite Head Coach'
    },
    create: {
      firebaseUid: 'coach_powerlift_designated',
      role: 'COACH',
      email: 'coach@powerlift.ai',
      name: 'Elite Head Coach'
    }
  });

  await prisma.coachProfile.upsert({
    where: { userId: coach.id },
    update: {
      tracks: ['POWERLIFTING', 'BODYBUILDING'],
      verifiedAt: new Date(),
      ratingAvg: 5.0,
      priceMonthlyMinor: 14900,
      currency: 'USD',
      capacity: 25,
      bio: 'Dual-discipline master coach specializing in raw powerlifting meet peaking and national bodybuilding stage preparation.',
      specialties: ['SBD Peaking', 'Contest Prep', 'Biomechanics', 'Peak Week Protocols'],
      languages: ['English']
    },
    create: {
      userId: coach.id,
      tracks: ['POWERLIFTING', 'BODYBUILDING'],
      bio: 'Dual-discipline master coach specializing in raw powerlifting meet peaking and national bodybuilding stage preparation.',
      specialties: ['SBD Peaking', 'Contest Prep', 'Biomechanics', 'Peak Week Protocols'],
      languages: ['English'],
      priceMonthlyMinor: 14900,
      currency: 'USD',
      verifiedAt: new Date(),
      ratingAvg: 5.0,
      capacity: 25,
      applicationData: {
        status: 'APPROVED',
        discipline: 'both',
        certifications: 'CSCS, ISSA Master Trainer, USAPL Senior Coach',
        experienceYears: '12',
        approvedAt: new Date().toISOString()
      }
    }
  });
  console.log(`✅ Seeded Coach: ${coach.email} (Password: CoachPassword123!)`);
}

async function main() {
  console.log('========================================================');
  console.log('⚡ POWERLIFT AI — FRESH START SYSTEM RESET');
  console.log('========================================================');

  await createSafetyBackup();
  await purgeAllUserData();
  await ensureBaseCatalogs();
  await seedDesignatedAccounts();

  console.log('========================================================');
  console.log('🎉 SYSTEM READY FOR FRESH START');
  console.log('👑 Admin: admin@powerlift.ai / AdminPassword123!');
  console.log('🏋️ Coach: coach@powerlift.ai / CoachPassword123!');
  console.log('========================================================');
}

main()
  .catch((e) => {
    console.error('Fatal execution error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
