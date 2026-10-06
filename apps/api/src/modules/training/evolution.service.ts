/**
 * apps/api/src/modules/training/evolution.service.ts
 * Weekly evolution job generating versioned program drafts (DRAFT) with transparent rationale.
 * Strictly adheres to safety constraints (<400 lines).
 */

import { prisma } from '../../lib/prisma';
import { evolveWeeklyMesocycle, validatePainThreshold, evaluateDeloadTrigger } from '@powerlift/engines';
import { EvolveWeekInput } from './training.schema';

export class EvolutionService {
  /**
   * Evaluates weekly check-in, applies safety constraints, and produces a versioned ProgramVersion(DRAFT).
   */
  static async evolveWeeklyProgram(athleteId: string, input: EvolveWeekInput) {
    // 1. Fetch athlete profile & active program
    const profile = await prisma.athleteProfile.findUnique({
      where: { userId: athleteId }
    });

    const activeProgram = await prisma.program.findFirst({
      where: { athleteId },
      include: {
        versions: {
          orderBy: { version: 'desc' },
          take: 1
        }
      }
    });

    if (!activeProgram || activeProgram.versions.length === 0) {
      const err: any = new Error('No active program found for athlete to evolve.');
      err.status = 404;
      throw err;
    }

    const latestVersion = activeProgram.versions[0];
    const currentWeekNumber = (latestVersion.dsl as any)?.nextWeekNumber || 1;

    // 2. Safety Rule §9: Evaluate Joint Pain & Deload triggers
    const painEval = validatePainThreshold(input.jointPain0To10);
    const deloadTrigger = evaluateDeloadTrigger(
      input.averageSessionRpe >= 9.0 ? 2 : 0,
      input.fatigueScore1To10 >= 8 ? 2 : 0
    );

    // 3. Evolve using calculation engine
    let decision = evolveWeeklyMesocycle({
      currentWeekNumber,
      totalCycleWeeks: 12,
      checkIn: {
        fatigueScore1To10: input.fatigueScore1To10,
        sorenessScore1To10: input.sorenessScore1To10,
        jointPain0To10: input.jointPain0To10,
        sessionsCompleted: input.sessionsCompleted,
        sessionsTargeted: input.sessionsTargeted,
        averageSessionRpe: input.averageSessionRpe
      },
      trainingMaxes: {
        squat: 140,
        bench: 100,
        deadlift: 180
      },
      currentWeeklySets: 16
    });

    // Override if safety engine mandated deload or medical referral
    if (!painEval.allowed) {
      decision.phase = 'deload';
      decision.volumeAdjustmentPct = -50;
      decision.rationale = `${painEval.guidance} ${decision.rationale}`;
    } else if (deloadTrigger.shouldDeload) {
      decision.phase = 'deload';
      decision.volumeAdjustmentPct = -35;
      decision.rationale = `${deloadTrigger.rationale} ${decision.rationale}`;
    }

    // 4. Create ProgramVersion with status DRAFT
    const nextVersionNumber = latestVersion.version + 1;
    const draftVersion = await prisma.programVersion.create({
      data: {
        programId: activeProgram.id,
        version: nextVersionNumber,
        status: 'DRAFT',
        createdBy: athleteId,
        rationale: {
          explanation: decision.rationale,
          phase: decision.phase,
          volumeAdjustmentPct: decision.volumeAdjustmentPct,
          intensityAdjustmentPct: decision.intensityAdjustmentPct,
          painScore: input.jointPain0To10,
          adherencePct: Math.round((input.sessionsCompleted / input.sessionsTargeted) * 100)
        },
        dsl: {
          track: profile?.track || 'POWERLIFTING',
          nextWeekNumber: decision.nextWeekNumber,
          phase: decision.phase,
          volumeAdjustmentPct: decision.volumeAdjustmentPct,
          intensityAdjustmentPct: decision.intensityAdjustmentPct
        },
        diff: {
          previousVersion: latestVersion.version,
          weekDelta: decision.nextWeekNumber - currentWeekNumber,
          phaseChange: `${(latestVersion.dsl as any)?.phase || 'accumulation'} → ${decision.phase}`
        }
      }
    });

    // 5. Materialize Draft Planned Sessions for next week
    const daysPerWeek = profile?.daysPerWeek || 4;
    const today = new Date();

    for (let day = 1; day <= daysPerWeek; day++) {
      const sessionDate = new Date(today);
      sessionDate.setDate(today.getDate() + day);

      await prisma.plannedSession.create({
        data: {
          athleteId,
          programVersionId: draftVersion.id,
          date: sessionDate,
          week: decision.nextWeekNumber,
          day,
          status: 'SCHEDULED'
        }
      });
    }

    return {
      success: true,
      draftVersionId: draftVersion.id,
      versionNumber: draftVersion.version,
      status: 'DRAFT',
      nextWeekNumber: decision.nextWeekNumber,
      phase: decision.phase,
      rationale: decision.rationale
    };
  }

  /**
   * Approves a DRAFT ProgramVersion, promoting it to ACTIVE and archiving previous versions.
   */
  static async approveDraftVersion(athleteId: string, versionId: string) {
    const version = await prisma.programVersion.findUnique({
      where: { id: versionId },
      include: { program: true }
    });

    if (!version || version.program.athleteId !== athleteId) {
      const err: any = new Error('Draft version not found or unauthorized.');
      err.status = 404;
      throw err;
    }

    // Archive previous active versions
    await prisma.programVersion.updateMany({
      where: {
        programId: version.programId,
        status: 'ACTIVE'
      },
      data: { status: 'ARCHIVED' }
    });

    // Activate this draft
    const updated = await prisma.programVersion.update({
      where: { id: versionId },
      data: {
        status: 'ACTIVE',
        approvedBy: athleteId
      }
    });

    return {
      success: true,
      message: `Program version v${updated.version} is now ACTIVE.`,
      activeVersionId: updated.id,
      status: updated.status
    };
  }
}
