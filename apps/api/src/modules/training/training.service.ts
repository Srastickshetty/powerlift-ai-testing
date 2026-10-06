/**
 * apps/api/src/modules/training/training.service.ts
 *
 * Core training execution service:
 * - Today session loading with ghost values & warm-up ladders
 * - Idempotent set logging via client_uuid
 * - Live autoregulation adjustments
 * - Session completion & PR detection
 * - Exercise swapping & missed session handling
 */

import { prisma } from '../../lib/prisma';
import { autoregulateNextSet, evaluatePersonalRecord } from '@powerlift/engines';
import { AppError } from '../../middleware/errorHandler';
import {
  LogSetInput,
  StartSessionInput,
  FinishSessionInput,
  SwapExerciseInput,
  MissedSessionInput
} from './training.schema';

export class TrainingService {
  /**
   * Get today's workout session with prescription, ghost values, and warm-up ladders.
   */
  static async getTodaySession(athleteId: string) {
    // 1. Find active planned session
    let plannedSession = await prisma.plannedSession.findFirst({
      where: {
        athleteId,
        status: { in: ['SCHEDULED', 'IN_PROGRESS'] }
      },
      include: {
        plannedSets: {
          include: { exercise: true },
          orderBy: { order: 'asc' }
        },
        programVersion: true
      },
      orderBy: { date: 'asc' }
    });

    if (!plannedSession) {
      // Pick or materialize a default session from active program version
      const activeVersion = await prisma.programVersion.findFirst({
        where: {
          status: 'ACTIVE',
          program: { athleteId }
        }
      });

      if (activeVersion) {
        plannedSession = await prisma.plannedSession.create({
          data: {
            athleteId,
            programVersionId: activeVersion.id,
            date: new Date(),
            week: 1,
            day: 1,
            status: 'SCHEDULED'
          },
          include: {
            plannedSets: {
              include: { exercise: true },
              orderBy: { order: 'asc' }
            },
            programVersion: true
          }
        });
      }
    }

    // 2. Fetch or initialize live active session
    let activeSession = await prisma.session.findFirst({
      where: {
        athleteId,
        endedAt: null
      },
      include: {
        sets: {
          orderBy: { clientUuid: 'asc' }
        }
      }
    });

    // 3. Compute ghost values & warm-up ladders for each exercise
    const ghostValues: Record<string, { weightKg: number; reps: number; rpe: number }> = {};
    const warmupLadders: Record<string, Array<{ setNumber: number; weightKg: number; reps: number }>> = {};

    if (plannedSession?.plannedSets && plannedSession.plannedSets.length > 0) {
      const exerciseIds = Array.from(new Set(plannedSession.plannedSets.map(ps => ps.exerciseId)));
      const prevSets = await prisma.set.findMany({
        where: {
          exerciseId: { in: exerciseIds },
          session: { athleteId }
        },
        orderBy: { id: 'desc' }
      });

      const latestSetMap = new Map<string, typeof prevSets[0]>();
      for (const s of prevSets) {
        if (!latestSetMap.has(s.exerciseId)) latestSetMap.set(s.exerciseId, s);
      }

      for (const ps of plannedSession.plannedSets) {
        if (!ghostValues[ps.exerciseId]) {
          const prevSet = latestSetMap.get(ps.exerciseId);
          if (prevSet) {
            ghostValues[ps.exerciseId] = {
              weightKg: prevSet.weightKg,
              reps: prevSet.reps,
              rpe: prevSet.rpe || 8
            };
          }

          // Build warm-up ladder for working load
          const targetObj = typeof ps.target === 'object' && ps.target !== null && !Array.isArray(ps.target)
            ? (ps.target as Record<string, unknown>)
            : null;
          const prescribedLoad = typeof targetObj?.prescribedLoadKg === 'number' ? targetObj.prescribedLoadKg : undefined;
          const targetLoad = prescribedLoad ?? ghostValues[ps.exerciseId]?.weightKg ?? 100;
          warmupLadders[ps.exerciseId] = [
            { setNumber: 1, weightKg: 20, reps: 10 },
            { setNumber: 2, weightKg: Math.round((targetLoad * 0.5) / 2.5) * 2.5, reps: 5 },
            { setNumber: 3, weightKg: Math.round((targetLoad * 0.7) / 2.5) * 2.5, reps: 3 },
            { setNumber: 4, weightKg: Math.round((targetLoad * 0.85) / 2.5) * 2.5, reps: 1 }
          ];
        }
      }
    }

    return {
      plannedSession,
      activeSession,
      ghostValues,
      warmupLadders
    };
  }

  /**
   * Start a workout session.
   */
  static async startSession(athleteId: string, input: StartSessionInput) {
    let session = await prisma.session.findFirst({
      where: { athleteId, endedAt: null }
    });

    if (!session) {
      session = await prisma.session.create({
        data: {
          athleteId,
          plannedSessionId: input.plannedSessionId,
          readiness: input.readiness || {},
          notes: input.notes,
          startedAt: new Date()
        }
      });
    }

    if (input.plannedSessionId) {
      await prisma.plannedSession.update({
        where: { id: input.plannedSessionId },
        data: { status: 'IN_PROGRESS' }
      });
    }

    return session;
  }

  /**
   * Log a set or batch of sets idempotently using clientUuid.
   */
  static async logSets(athleteId: string, sessionId: string, sets: LogSetInput[]) {
    const session = await prisma.session.findUnique({
      where: { id: sessionId }
    });

    if (!session || session.athleteId !== athleteId) {
      throw new AppError('NOT_FOUND', 'Workout session not found or forbidden', 404);
    }

    const savedSets = [];
    const autoregResults = [];
    const prAlerts = [];

    // 1. Batch fetch historical sets for all exercises in this payload
    const distinctExIds = Array.from(new Set(sets.map(s => s.exerciseId)));
    const allHistory = await prisma.set.findMany({
      where: {
        exerciseId: { in: distinctExIds },
        session: { athleteId }
      },
      select: { exerciseId: true, weightKg: true, reps: true, rpe: true }
    });

    const historyByEx = new Map<string, Array<{ weightKg: number; reps: number; rpe?: number }>>();
    for (const h of allHistory) {
      if (!historyByEx.has(h.exerciseId)) historyByEx.set(h.exerciseId, []);
      historyByEx.get(h.exerciseId)!.push({ weightKg: h.weightKg, reps: h.reps, rpe: h.rpe || undefined });
    }

    for (const s of sets) {
      const history = historyByEx.get(s.exerciseId) || [];
      const prEval = evaluatePersonalRecord(
        { weightKg: s.weightKg, reps: s.reps, rpe: s.rpe },
        history
      );

      // 2. Idempotent upsert by unique clientUuid
      const loggedSet = await prisma.set.upsert({
        where: { clientUuid: s.clientUuid },
        create: {
          sessionId,
          plannedSetId: s.plannedSetId,
          exerciseId: s.exerciseId,
          setType: s.setType,
          weightKg: s.weightKg,
          reps: s.reps,
          rpe: s.rpe,
          rir: s.rir,
          tempo: s.tempo,
          pain0To10: s.painScale0To10,
          painArea: s.painArea,
          isPr: prEval.isPr,
          note: s.note,
          clientUuid: s.clientUuid
        },
        update: {
          weightKg: s.weightKg,
          reps: s.reps,
          rpe: s.rpe,
          rir: s.rir,
          pain0To10: s.painScale0To10,
          painArea: s.painArea,
          isPr: prEval.isPr,
          note: s.note
        }
      });

      savedSets.push(loggedSet);

      if (prEval.isPr) {
        prAlerts.push({
          exerciseId: s.exerciseId,
          description: prEval.description
        });
      }

      // 3. Live autoregulation evaluation
      if (s.rpe) {
        const targetRpe = 8.0;
        const autoreg = autoregulateNextSet({
          targetLoadKg: s.weightKg,
          targetReps: s.reps,
          targetRpe,
          actualReps: s.reps,
          actualRpe: s.rpe
        });

        autoregResults.push({
          exerciseId: s.exerciseId,
          ...autoreg
        });
      }
    }

    return {
      savedSets,
      autoregResults,
      prAlerts
    };
  }

  /**
   * Complete workout session, compute total volume, and detect session accomplishments.
   */
  static async finishSession(athleteId: string, sessionId: string, input: FinishSessionInput) {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { sets: true }
    });

    if (!session || session.athleteId !== athleteId) {
      throw new AppError('NOT_FOUND', 'Session not found or forbidden', 404);
    }

    const totalVolume = session.sets.reduce((sum, s) => sum + s.weightKg * s.reps, 0);
    const prCount = session.sets.filter(s => s.isPr).length;

    const finished = await prisma.session.update({
      where: { id: sessionId },
      data: {
        endedAt: new Date(),
        sessionRpe: input.sessionRpe,
        notes: input.notes
      }
    });

    if (session.plannedSessionId) {
      await prisma.plannedSession.update({
        where: { id: session.plannedSessionId },
        data: { status: 'COMPLETED' }
      });
    }

    return {
      session: finished,
      summary: {
        completedSetsCount: session.sets.length,
        totalVolumeKg: totalVolume,
        prsCount: prCount,
        sessionRpe: input.sessionRpe
      }
    };
  }

  /**
   * Swap an exercise with a substitute across planned sets.
   */
  static async swapExercise(athleteId: string, input: SwapExerciseInput) {
    const plannedSession = await prisma.plannedSession.findUnique({
      where: { id: input.plannedSessionId }
    });

    if (!plannedSession || plannedSession.athleteId !== athleteId) {
      throw new AppError('NOT_FOUND', 'Planned session not found', 404);
    }

    await prisma.plannedSet.updateMany({
      where: {
        plannedSessionId: input.plannedSessionId,
        exerciseId: input.originalExerciseId
      },
      data: {
        exerciseId: input.replacementExerciseId
      }
    });

    return { success: true, message: 'Exercise swapped successfully.' };
  }

  /**
   * Handle missed workout session (shift / compress / drop).
   */
  static async handleMissedSession(athleteId: string, input: MissedSessionInput) {
    const planned = await prisma.plannedSession.findUnique({
      where: { id: input.plannedSessionId }
    });

    if (!planned || planned.athleteId !== athleteId) {
      throw new AppError('NOT_FOUND', 'Planned session not found', 404);
    }

    if (input.action === 'drop') {
      await prisma.plannedSession.update({
        where: { id: input.plannedSessionId },
        data: { status: 'SKIPPED' }
      });
      return { action: 'drop', message: 'Session dropped. Moving to next scheduled workout without catch-up fatigue.' };
    }

    if (input.action === 'shift') {
      // Shift all upcoming scheduled sessions forward by 1 day
      await prisma.plannedSession.updateMany({
        where: {
          athleteId,
          status: 'SCHEDULED',
          date: { gte: planned.date }
        },
        data: {
          date: new Date(planned.date.getTime() + 24 * 60 * 60 * 1000)
        }
      });
      return { action: 'shift', message: 'Sessions shifted forward by 1 day.' };
    }

    // compress: retain priority competition sets, drop secondary accessories
    await prisma.plannedSet.deleteMany({
      where: {
        plannedSessionId: input.plannedSessionId,
        order: { gt: 2 } // Keep first 2 compound movements
      }
    });

    return { action: 'compress', message: 'Session compressed to high-priority compound lifts.' };
  }
}
