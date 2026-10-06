/**
 * apps/api/src/modules/analytics/analytics.service.ts
 *
 * Provides historical e1RM tracking, weekly volume/tonnage distributions,
 * and workout history timelines.
 */

import { prisma } from '../../lib/prisma';
import { calculateE1RM } from '@powerlift/engines';

export class AnalyticsService {
  /**
   * Get e1RM progression over time for an athlete.
   */
  static async getE1rmTimeline(athleteId: string, exerciseName?: string) {
    const sets = await prisma.set.findMany({
      where: {
        session: { athleteId },
        ...(exerciseName ? { exercise: { name: { contains: exerciseName, mode: 'insensitive' } } } : {})
      },
      include: {
        exercise: true,
        session: { select: { startedAt: true } }
      },
      orderBy: { id: 'asc' }
    });

    const dataPoints = sets.map(s => {
      const e1rm = calculateE1RM({
        loadKg: s.weightKg,
        reps: s.reps,
        rpe: s.rpe || 10
      }).e1rmKg;

      return {
        date: s.session.startedAt,
        exerciseId: s.exerciseId,
        exerciseName: s.exercise.name,
        loadKg: s.weightKg,
        reps: s.reps,
        rpe: s.rpe,
        e1rmKg: e1rm,
        isPr: s.isPr
      };
    });

    return dataPoints;
  }

  /**
   * Get weekly volume (sets and tonnage) grouped by muscle and exercise pattern.
   */
  static async getVolumeDistribution(athleteId: string) {
    const sessions = await prisma.session.findMany({
      where: { athleteId },
      include: {
        sets: {
          include: { exercise: true }
        }
      },
      orderBy: { startedAt: 'desc' },
      take: 12
    });

    const muscleTonnage: Record<string, number> = {};
    const muscleSets: Record<string, number> = {};
    let totalTonnageKg = 0;

    for (const session of sessions) {
      for (const set of session.sets) {
        const tonnage = set.weightKg * set.reps;
        totalTonnageKg += tonnage;

        for (const muscle of set.exercise.primaryMuscles) {
          muscleTonnage[muscle] = (muscleTonnage[muscle] || 0) + tonnage;
          muscleSets[muscle] = (muscleSets[muscle] || 0) + 1;
        }
      }
    }

    return {
      totalTonnageKg,
      muscleTonnage,
      muscleSets,
      analyzedSessionsCount: sessions.length
    };
  }

  /**
   * Get historical workout session list with PR and volume summaries.
   */
  static async getHistory(athleteId: string, limit = 20) {
    const sessions = await prisma.session.findMany({
      where: { athleteId },
      include: {
        sets: {
          include: { exercise: true }
        }
      },
      orderBy: { startedAt: 'desc' },
      take: limit
    });

    return sessions.map(sess => {
      const totalVolume = sess.sets.reduce((sum, s) => sum + s.weightKg * s.reps, 0);
      const prs = sess.sets.filter(s => s.isPr);

      return {
        id: sess.id,
        startedAt: sess.startedAt,
        endedAt: sess.endedAt,
        sessionRpe: sess.sessionRpe,
        notes: sess.notes,
        totalSets: sess.sets.length,
        totalVolumeKg: totalVolume,
        prsAchievedCount: prs.length,
        exercises: Array.from(new Set(sess.sets.map(s => s.exercise.name)))
      };
    });
  }
}
