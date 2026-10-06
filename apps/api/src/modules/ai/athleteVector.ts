/**
 * apps/api/src/modules/ai/athleteVector.ts
 * Builds a normalized athlete feature vector from database records.
 */

import { prisma } from '../../lib/prisma';
import { calculateE1RM } from '@powerlift/engines';

export interface AthleteVector {
  athleteId: string;
  track: 'powerlifting' | 'bodybuilding';
  level: 'novice' | 'intermediate' | 'advanced' | 'elite';
  daysPerWeek: number;
  trainingAgeYears: number;
  equipment: string[];
  injuries: string[];
  weakPoints: Record<string, any>;
  laggingMuscles: string[];
  goals: Record<string, any>;
  e1rms: Record<string, number>;
  meetDate: Date | null;
  showDate: Date | null;
}

export class AthleteVectorBuilder {
  /**
   * Constructs an AthleteVector from the database.
   */
  static async buildVector(athleteId: string): Promise<AthleteVector> {
    const profile = await prisma.athleteProfile.findUnique({
      where: { userId: athleteId }
    });

    const track = (profile?.track?.toLowerCase() === 'bodybuilding' ? 'bodybuilding' : 'powerlifting') as 'powerlifting' | 'bodybuilding';
    const trainingAge = profile?.trainingAgeYears ?? 0;

    let level: AthleteVector['level'] = 'novice';
    if (trainingAge >= 5) level = 'elite';
    else if (trainingAge >= 3) level = 'advanced';
    else if (trainingAge >= 1) level = 'intermediate';

    let meetDate: Date | null = null;
    let weakPoints: Record<string, any> = {};
    if (track === 'powerlifting') {
      const pl = await prisma.plProfile.findUnique({ where: { userId: athleteId } });
      if (pl) {
        meetDate = pl.meetDate;
        weakPoints = (pl.weakPoints as any) || {};
      }
    }

    let showDate: Date | null = null;
    let laggingMuscles: string[] = [];
    if (track === 'bodybuilding') {
      const bb = await prisma.bbProfile.findUnique({ where: { userId: athleteId } });
      if (bb) {
        showDate = bb.showDate;
        laggingMuscles = Array.isArray(bb.lagging) ? (bb.lagging as string[]) : [];
      }
    }

    // Query recent best sets for e1RM
    const e1rms: Record<string, number> = {};
    const recentSets = await prisma.set.findMany({
      where: {
        session: { athleteId },
        reps: { gt: 0 },
        weightKg: { gt: 0 }
      },
      include: { exercise: true },
      take: 100,
      orderBy: { createdAt: 'desc' }
    });

    for (const s of recentSets) {
      const exName = s.exercise.name;
      const res = calculateE1RM({ loadKg: s.weightKg, reps: s.reps, rpe: s.rpe || 8 });
      const currentE1rm = res.e1rmKg;
      if (!e1rms[exName] || currentE1rm > e1rms[exName]) {
        e1rms[exName] = Math.round(currentE1rm * 10) / 10;
      }
    }

    // Default fallbacks if no logged sets exist yet
    if (track === 'powerlifting') {
      if (!e1rms['Competition Barbell Squat']) e1rms['Competition Barbell Squat'] = 140;
      if (!e1rms['Competition Bench Press']) e1rms['Competition Bench Press'] = 100;
      if (!e1rms['Competition Conventional Deadlift']) e1rms['Competition Conventional Deadlift'] = 180;
    }

    return {
      athleteId,
      track,
      level,
      daysPerWeek: profile?.daysPerWeek || 4,
      trainingAgeYears: trainingAge,
      equipment: Array.isArray(profile?.equipment) ? (profile.equipment as string[]) : [],
      injuries: Array.isArray(profile?.injuries) ? (profile.injuries as string[]) : [],
      weakPoints,
      laggingMuscles,
      goals: (profile?.goals as any) || {},
      e1rms,
      meetDate,
      showDate
    };
  }
}
