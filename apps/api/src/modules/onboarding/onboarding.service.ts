/**
 * apps/api/src/modules/onboarding/onboarding.service.ts
 *
 * Handles athlete onboarding, profile persistence (athlete_profiles, pl_profile, bb_profile),
 * youth-safety enforcement (<18), Coach Brief generation, and initial Week 1 program materialization.
 */

import { prisma } from '../../lib/prisma';
import { OnboardingInput } from '@powerlift/shared';
import { Track } from '@prisma/client';

export interface CoachBrief {
  athleteName: string;
  track: 'POWERLIFTING' | 'BODYBUILDING';
  isYouthSafeMode: boolean;
  trainingAgeYears: number;
  weeklySchedule: string;
  equipmentSummary: string[];
  injuryFlags: string[];
  primaryObjective: string;
  safetyDirectives: string[];
  week1Overview: string;
}

export class OnboardingService {
  /**
   * Save onboarding answers, configure track profile, generate Coach Brief & Week 1 program.
   */
  static async completeOnboarding(userId: string, input: OnboardingInput) {
    const isYouth = input.age < 18;
    const trackUpper = input.track.toUpperCase() as Track;

    // Safety rule §9: Youth under 18 blocked from contest prep & aggressive weight cuts
    const safetyDirectives: string[] = [];
    if (isYouth) {
      safetyDirectives.push('Youth Safe Mode Active: Extreme deficits, dehydration protocols, and contest prep blocked.');
      if (input.bbDetails && input.bbDetails.goal === 'contest_prep') {
        input.bbDetails.goal = 'hypertrophy';
      }
    }

    if (input.injuries && input.injuries.length > 0) {
      safetyDirectives.push(`Joint Pain / Injury Precaution: Active monitoring for ${input.injuries.join(', ')}.`);
    }

    // 1. Upsert AthleteProfile
    const profile = await prisma.athleteProfile.upsert({
      where: { userId },
      create: {
        userId,
        track: trackUpper,
        sex: input.sex,
        heightCm: input.heightCm,
        units: input.units,
        trainingAgeYears: Math.floor(input.trainingAgeYears),
        daysPerWeek: input.daysPerWeek,
        equipment: input.equipment,
        injuries: input.injuries,
        goals: {
          age: input.age,
          bodyweightKg: input.bodyweightKg,
          sessionLengthMinutes: input.sessionLengthMinutes,
          isYouthSafeMode: isYouth,
          scheduleConstraints: input.scheduleConstraints
        }
      },
      update: {
        track: trackUpper,
        sex: input.sex,
        heightCm: input.heightCm,
        units: input.units,
        trainingAgeYears: Math.floor(input.trainingAgeYears),
        daysPerWeek: input.daysPerWeek,
        equipment: input.equipment,
        injuries: input.injuries,
        goals: {
          age: input.age,
          bodyweightKg: input.bodyweightKg,
          sessionLengthMinutes: input.sessionLengthMinutes,
          isYouthSafeMode: isYouth,
          scheduleConstraints: input.scheduleConstraints
        }
      }
    });

    // 2. Upsert Track-Specific Profile
    if (trackUpper === Track.POWERLIFTING && input.plDetails) {
      await prisma.plProfile.upsert({
        where: { userId },
        create: {
          userId,
          federation: input.plDetails.federation || 'IPF',
          weightClass: input.plDetails.weightClass || '83kg',
          equipClass: input.plDetails.equipClass || 'raw',
          weakPoints: {
            ...input.plDetails.weakPoints,
            baselineMaxes: {
              squat: input.plDetails.squat1rm || 140,
              bench: input.plDetails.bench1rm || 100,
              deadlift: input.plDetails.deadlift1rm || 180
            }
          },
          style: input.plDetails.preferredStyles || {}
        },
        update: {
          federation: input.plDetails.federation || 'IPF',
          weightClass: input.plDetails.weightClass || '83kg',
          equipClass: input.plDetails.equipClass || 'raw',
          weakPoints: {
            ...input.plDetails.weakPoints,
            baselineMaxes: {
              squat: input.plDetails.squat1rm || 140,
              bench: input.plDetails.bench1rm || 100,
              deadlift: input.plDetails.deadlift1rm || 180
            }
          },
          style: input.plDetails.preferredStyles || {}
        }
      });
    } else if (trackUpper === Track.BODYBUILDING && input.bbDetails) {
      await prisma.bbProfile.upsert({
        where: { userId },
        create: {
          userId,
          division: input.bbDetails.division || 'mens_physique',
          showDate: input.bbDetails.showDate ? new Date(input.bbDetails.showDate) : null,
          lagging: input.bbDetails.laggingMuscles || [],
          splitPref: input.bbDetails.splitPreference || 'PPL',
          measurementsBaseline: {
            dietPattern: input.bbDetails.dietPattern,
            goal: input.bbDetails.goal
          }
        },
        update: {
          division: input.bbDetails.division || 'mens_physique',
          showDate: input.bbDetails.showDate ? new Date(input.bbDetails.showDate) : null,
          lagging: input.bbDetails.laggingMuscles || [],
          splitPref: input.bbDetails.splitPreference || 'PPL',
          measurementsBaseline: {
            dietPattern: input.bbDetails.dietPattern,
            goal: input.bbDetails.goal
          }
        }
      });
    }

    // 3. Generate Coach Brief
    const coachBrief: CoachBrief = {
      athleteName: input.name,
      track: trackUpper,
      isYouthSafeMode: isYouth,
      trainingAgeYears: input.trainingAgeYears,
      weeklySchedule: `${input.daysPerWeek} training sessions per week (${input.sessionLengthMinutes} min/session)`,
      equipmentSummary: input.equipment,
      injuryFlags: input.injuries,
      primaryObjective: trackUpper === Track.POWERLIFTING
        ? `Maximize S/B/D Total for ${input.plDetails?.federation || 'IPF'} in ${input.plDetails?.weightClass || '83kg'} class`
        : `Targeted hypertrophy: ${input.bbDetails?.splitPreference || 'PPL'} with emphasis on ${input.bbDetails?.laggingMuscles?.join(', ') || 'overall symmetry'}`,
      safetyDirectives,
      week1Overview: 'Base Accumulation Microcycle: Calibrating baseline movement velocity, technique consistency, and RPE accuracy.'
    };

    // 4. Materialize Week 1 Program
    const program = await prisma.program.create({
      data: {
        ownerId: userId,
        athleteId: userId,
        track: trackUpper,
        name: trackUpper === Track.POWERLIFTING ? 'PowerLift AI 12-Week Peaking Cycle' : 'Hypertrophy Master 8-Week Mesocycle',
        source: 'TEMPLATE'
      }
    });

    const programVersion = await prisma.programVersion.create({
      data: {
        programId: program.id,
        version: 1,
        status: 'ACTIVE',
        createdBy: userId,
        approvedBy: userId,
        dsl: {
          coachBrief: coachBrief as any,
          weeks: 1,
          daysPerWeek: input.daysPerWeek
        },
        rationale: {
          summary: 'Auto-generated Week 1 calibrated to intake metrics.',
          coachBrief: coachBrief as any
        }
      }
    });

    // Materialize 3 to 5 planned sessions for Week 1
    const dayTemplates = trackUpper === Track.POWERLIFTING
      ? [
          { name: 'Day 1: Heavy Squat & Bench Volume', exercises: ['Competition Barbell Squat', 'Competition Bench Press'] },
          { name: 'Day 2: Deadlift Technique & Back Hypertrophy', exercises: ['Competition Conventional Deadlift'] },
          { name: 'Day 3: Heavy Bench & Squat Variation', exercises: ['Competition Bench Press', 'Competition Barbell Squat'] },
          { name: 'Day 4: Accessory & Posterior Chain', exercises: ['Competition Conventional Deadlift'] }
        ]
      : [
          { name: 'Push: Chest, Shoulders & Triceps Focus', exercises: ['Competition Bench Press'] },
          { name: 'Pull: Upper Back & Bicep Volume', exercises: ['Competition Conventional Deadlift'] },
          { name: 'Legs: Quad Dominant & Core', exercises: ['Competition Barbell Squat'] },
          { name: 'Upper: Chest / Back Antagonist', exercises: ['Competition Bench Press'] }
        ];

    const today = new Date();
    for (let dayIdx = 0; dayIdx < Math.min(input.daysPerWeek, dayTemplates.length); dayIdx++) {
      const template = dayTemplates[dayIdx];
      const sessionDate = new Date(today);
      sessionDate.setDate(today.getDate() + dayIdx);

      const plannedSession = await prisma.plannedSession.create({
        data: {
          athleteId: userId,
          programVersionId: programVersion.id,
          date: sessionDate,
          week: 1,
          day: dayIdx + 1,
          status: 'SCHEDULED'
        }
      });

      // Materialize working sets
      let order = 1;
      for (const exName of template.exercises) {
        let ex = await prisma.exercise.findFirst({ where: { name: exName } });
        if (!ex) {
          ex = await prisma.exercise.findFirst();
        }
        if (ex) {
          for (let s = 1; s <= 3; s++) {
            await prisma.plannedSet.create({
              data: {
                plannedSessionId: plannedSession.id,
                exerciseId: ex.id,
                order: order++,
                setType: s === 1 ? 'TOP_SINGLE' : 'WORKING',
                target: {
                  reps: s === 1 ? 3 : 6,
                  targetRpe: s === 1 ? 8.0 : 7.5,
                  prescribedLoadKg: s === 1 ? 140 : 120
                }
              }
            });
          }
        }
      }
    }

    return {
      profile,
      coachBrief,
      programId: program.id,
      programVersionId: programVersion.id
    };
  }

  /**
   * Get onboarding completion status and active brief
   */
  static async getOnboardingStatus(userId: string) {
    const profile = await prisma.athleteProfile.findUnique({
      where: { userId }
    });

    if (!profile) {
      return { isComplete: false };
    }

    const plProfile = await prisma.plProfile.findUnique({ where: { userId } });
    const bbProfile = await prisma.bbProfile.findUnique({ where: { userId } });
    const activeProgram = await prisma.program.findFirst({
      where: { athleteId: userId },
      include: {
        versions: {
          where: { status: 'ACTIVE' },
          orderBy: { version: 'desc' },
          take: 1
        }
      }
    });

    return {
      isComplete: true,
      track: profile.track,
      profile,
      plProfile,
      bbProfile,
      activeProgramVersion: activeProgram?.versions[0] || null
    };
  }
}
