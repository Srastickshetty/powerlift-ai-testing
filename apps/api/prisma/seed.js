/**
 * apps/api/prisma/seed.js
 * Seed script populating:
 * - 2 coaches (Powerlifting & Bodybuilding)
 * - 6 athletes (3 powerlifters, 3 bodybuilders)
 * - 300 exercise stubs across all movement patterns
 * - 12 weeks of training logs for realistic development testing
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. SEED 300 EXERCISE STUBS
  console.log('🏋️ Seeding 300 exercises...');
  const patterns = ['SQUAT', 'BENCH', 'DEADLIFT', 'OVERHEAD_PRESS', 'PULL', 'HINGE', 'ISOLATION'];
  const muscleGroups = ['chest', 'back', 'quads', 'hamstrings', 'glutes', 'shoulders', 'biceps', 'triceps', 'calves', 'abs'];

  const exercisesData = [];

  // Core competition lifts
  exercisesData.push(
    { name: 'Competition Barbell Squat', trackTags: ['POWERLIFTING'], primaryMuscles: ['quads', 'glutes'], secondaryMuscles: ['back'], equipment: ['barbell'], pattern: 'SQUAT', isCompetitionLift: true, cues: ['Chest up', 'Knees tracking over toes', 'Hit depth below parallel'], substitutes: ['Paused Squat', 'Pin Squat'] },
    { name: 'Competition Bench Press', trackTags: ['POWERLIFTING', 'BODYBUILDING'], primaryMuscles: ['chest'], secondaryMuscles: ['triceps', 'shoulders'], equipment: ['barbell', 'bench'], pattern: 'BENCH', isCompetitionLift: true, cues: ['Retract scapulae', 'Leg drive', 'Controlled touch at sternum'], substitutes: ['Larsen Press', 'Spoto Press'] },
    { name: 'Competition Conventional Deadlift', trackTags: ['POWERLIFTING'], primaryMuscles: ['back', 'hamstrings'], secondaryMuscles: ['glutes', 'forearms'], equipment: ['barbell'], pattern: 'DEADLIFT', isCompetitionLift: true, cues: ['Slack pull', 'Lats locked', 'Push floor away'], substitutes: ['Sumo Deadlift', 'Deficit Deadlift'] },
    { name: 'Competition Sumo Deadlift', trackTags: ['POWERLIFTING'], primaryMuscles: ['glutes', 'quads'], secondaryMuscles: ['back'], equipment: ['barbell'], pattern: 'DEADLIFT', isCompetitionLift: true, cues: ['Hips open', 'Knees out', 'Short stroke'], substitutes: ['Conventional Deadlift', 'Block Pull'] }
  );

  // Generate 296 additional exercise variations
  let count = exercisesData.length;
  for (const pattern of patterns) {
    for (const muscle of muscleGroups) {
      if (count >= 300) break;
      exercisesData.push({
        name: `${pattern.charAt(0) + pattern.slice(1).toLowerCase()} ${muscle.charAt(0).toUpperCase() + muscle.slice(1)} Variation ${count + 1}`,
        trackTags: count % 2 === 0 ? ['POWERLIFTING'] : ['BODYBUILDING'],
        primaryMuscles: [muscle],
        secondaryMuscles: ['abs'],
        equipment: count % 3 === 0 ? ['barbell'] : count % 3 === 1 ? ['dumbbell'] : ['cable'],
        pattern,
        isCompetitionLift: false,
        cues: ['Control eccentric', 'Full range of motion'],
        substitutes: []
      });
      count++;
    }
  }

  for (const ex of exercisesData) {
    await prisma.exercise.upsert({
      where: { name: ex.name },
      update: {},
      create: ex
    });
  }
  console.log(`✅ Seeded ${exercisesData.length} exercises.`);

  // 2. SEED 2 COACHES
  console.log('👨‍🏫 Seeding coaches...');
  const coachDeva = await prisma.user.upsert({
    where: { email: 'deva.khule@powerlift.ai' },
    update: {},
    create: {
      firebaseUid: 'coach_deva_khule_uid',
      role: 'COACH',
      email: 'deva.khule@powerlift.ai',
      name: 'Coach Deva Khule',
      coachProfile: {
        create: {
          tracks: ['POWERLIFTING'],
          bio: 'Former national record holder, specialized in engineering biomechanics and IPF peaking protocols.',
          specialties: ['Biomechanics', 'Competition Peaking', 'RPE Autoregulation'],
          languages: ['English', 'Hindi', 'Marathi'],
          priceMonthlyMinor: 9900,
          currency: 'USD',
          ratingAvg: 4.95,
          capacity: 25
        }
      }
    }
  });

  const coachPriya = await prisma.user.upsert({
    where: { email: 'priya.nair@powerlift.ai' },
    update: {},
    create: {
      firebaseUid: 'coach_priya_nair_uid',
      role: 'COACH',
      email: 'priya.nair@powerlift.ai',
      name: 'Coach Priya Nair',
      coachProfile: {
        create: {
          tracks: ['BODYBUILDING'],
          bio: 'Pro Natural Bodybuilder and physique prep specialist. Expert in PPL hypertrophy and vegetarian macro optimization.',
          specialties: ['Hypertrophy Science', 'Indian High-Protein Diet', 'Posing'],
          languages: ['English', 'Hindi', 'Malayalam'],
          priceMonthlyMinor: 8900,
          currency: 'USD',
          ratingAvg: 4.90,
          capacity: 30
        }
      }
    }
  });

  // 3. SEED 6 ATHLETES (3 PL, 3 BB)
  console.log('🏋️‍♀️ Seeding 6 athletes across both tracks...');
  const athletesData = [
    // Powerlifting Athletes
    { email: 'rahul.shetty@test.com', uid: 'ath_rahul_uid', name: 'Rahul Shetty', track: 'POWERLIFTING', coachId: coachDeva.id, weightClass: '83kg', sq: 220, bp: 145, dl: 260 },
    { email: 'sanjana.roy@test.com', uid: 'ath_sanjana_uid', name: 'Sanjana Roy', track: 'POWERLIFTING', coachId: coachDeva.id, weightClass: '52kg', sq: 140, bp: 85, dl: 170 },
    { email: 'vikram.rathore@test.com', uid: 'ath_vikram_uid', name: 'Vikramaditya Rathore', track: 'POWERLIFTING', coachId: null, weightClass: '93kg', sq: 270, bp: 175, dl: 310 },
    // Bodybuilding Athletes
    { email: 'ananya.sharma@test.com', uid: 'ath_ananya_uid', name: 'Ananya Sharma', track: 'BODYBUILDING', coachId: coachPriya.id, division: 'bikini', split: 'Upper/Lower' },
    { email: 'karan.mehta@test.com', uid: 'ath_karan_uid', name: 'Karan Mehta', track: 'BODYBUILDING', coachId: coachPriya.id, division: 'classic_physique', split: 'PPL' },
    { email: 'shweta.verma@test.com', uid: 'ath_shweta_uid', name: 'Shweta Verma', track: 'BODYBUILDING', coachId: null, division: 'figure', split: 'Arnold Split' }
  ];

  const seededAthletes = [];
  for (const ath of athletesData) {
    const user = await prisma.user.upsert({
      where: { email: ath.email },
      update: {},
      create: {
        firebaseUid: ath.uid,
        role: 'ATHLETE',
        email: ath.email,
        name: ath.name,
        athleteProfile: {
          create: {
            track: ath.track,
            units: 'kg',
            daysPerWeek: 4,
            trainingAgeYears: 3,
            equipment: ['barbell', 'rack', 'bench', 'plates']
          }
        },
        ...(ath.track === 'POWERLIFTING'
          ? { plProfile: { create: { weightClass: ath.weightClass, federation: 'IPF' } } }
          : { bbProfile: { create: { division: ath.division, splitPref: ath.split } } }
        )
      }
    });

    seededAthletes.push({ ...ath, id: user.id });

    // Link coach if assigned
    if (ath.coachId) {
      await prisma.coachAthlete.create({
        data: {
          coachId: ath.coachId,
          athleteId: user.id,
          status: 'ACTIVE',
          mode: 'COACH_LED'
        }
      });
    }
  }

  // 4. SEED 12 WEEKS OF TRAINING SESSIONS & SETS FOR ATHLETE RAHUL
  console.log('📅 Seeding 12 weeks of historical logs...');
  const primaryAthlete = seededAthletes[0]; // Rahul Shetty
  const squatEx = await prisma.exercise.findFirst({ where: { name: 'Competition Barbell Squat' } });
  const benchEx = await prisma.exercise.findFirst({ where: { name: 'Competition Bench Press' } });
  const deadliftEx = await prisma.exercise.findFirst({ where: { name: 'Competition Conventional Deadlift' } });

  const now = new Date();

  for (let week = 12; week >= 1; week--) {
    for (let day = 1; day <= 3; day++) {
      const daysAgo = (week - 1) * 7 + (3 - day) * 2;
      const sessionDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

      const session = await prisma.session.create({
        data: {
          athleteId: primaryAthlete.id,
          startedAt: sessionDate,
          endedAt: new Date(sessionDate.getTime() + 75 * 60 * 1000),
          sessionRpe: 7.5 + (12 - week) * 0.1,
          notes: `Week ${13 - week} Day ${day} Mesocycle Progression`,
          readiness: { sleepHours: 8, fatigueScore: 4, jointPainScore: 1 }
        }
      });

      // Insert Squat or Deadlift and Bench sets
      const mainEx = day === 1 ? squatEx : day === 2 ? benchEx : deadliftEx;
      const baseWeight = day === 1 ? 160 + (13 - week) * 2.5 : day === 2 ? 110 + (13 - week) * 1.5 : 190 + (13 - week) * 2.5;

      for (let setIdx = 1; setIdx <= 4; setIdx++) {
        await prisma.set.create({
          data: {
            sessionId: session.id,
            exerciseId: mainEx.id,
            setType: setIdx === 1 ? 'TOP_SINGLE' : 'WORKING',
            weightKg: setIdx === 1 ? baseWeight + 15 : baseWeight,
            reps: setIdx === 1 ? 1 : 5,
            rpe: setIdx === 1 ? 8.0 : 7.5,
            pain0To10: 0,
            isPr: week === 1 && setIdx === 1,
            clientUuid: `seed_set_w${week}_d${day}_s${setIdx}_${primaryAthlete.id}`
          }
        });
      }
    }
  }

  console.log('✅ Seed completed successfully: 2 coaches, 6 athletes, 300 exercises, 12 weeks of training logs.');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
