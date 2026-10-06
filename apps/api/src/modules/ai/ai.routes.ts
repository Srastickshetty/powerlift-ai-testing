/**
 * apps/api/src/modules/ai/ai.routes.ts
 * Express routes for AI Program Generator v1 and Coach Deva chat assistant.
 */

import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { requireAuth } from '../../middleware/requireAuth';
import { GeneratorService } from './generator.service';
import { AssistantService } from './assistant.service';
import { BillingService } from '../billing/billing.service';
import { ProgramDslInterpreter } from '@powerlift/shared';
import { prisma } from '../../lib/prisma';

export const aiRouter: Router = Router();

// 1. Generate new AI program proposal (DRAFT)
aiRouter.post('/generate', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.ctx?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const result = await GeneratorService.generateAndSave(userId);
    return res.status(201).json({
      success: true,
      proposal: result
    });
  } catch (err: any) {
    return next(err);
  }
});

// 2. Fetch latest AI proposal
aiRouter.get('/proposals/latest', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.ctx?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const latest = await prisma.programVersion.findFirst({
      where: {
        program: { athleteId: userId },
        status: 'DRAFT'
      },
      orderBy: { version: 'desc' }
    });

    if (!latest) {
      return res.status(404).json({ success: false, message: 'No draft proposal found' });
    }

    return res.json({
      success: true,
      proposal: {
        id: latest.id,
        version: latest.version,
        status: latest.status,
        dsl: latest.dsl,
        rationale: latest.rationale,
        diff: latest.diff,
        createdAt: latest.createdAt
      }
    });
  } catch (err: any) {
    return next(err);
  }
});

// 3. Approve AI proposal -> promotes to ACTIVE and materializes planned sessions
aiRouter.post('/proposals/:versionId/approve', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.ctx?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const versionId = Array.isArray(req.params.versionId) ? req.params.versionId[0] : req.params.versionId;

    const version = await prisma.programVersion.findUnique({
      where: { id: versionId }
    });

    if (!version) {
      return res.status(404).json({ success: false, message: 'Program version not found' });
    }

    const program = await prisma.program.findUnique({
      where: { id: version.programId }
    });

    if (!program) {
      return res.status(404).json({ success: false, message: 'Parent program not found' });
    }

    // Authorization: athlete can approve own, or active coach/admin
    const userRole = req.ctx?.role || 'athlete';
    if (program.athleteId !== userId && userRole !== 'coach' && userRole !== 'admin') {
      return res.status(403).json({ success: false, error: 'FORBIDDEN' });
    }

    // Archive any currently active versions for this program
    await prisma.programVersion.updateMany({
      where: { programId: version.programId, status: 'ACTIVE' },
      data: { status: 'ARCHIVED' }
    });

    // Promote DRAFT to ACTIVE
    const activated = await prisma.programVersion.update({
      where: { id: versionId },
      data: {
        status: 'ACTIVE',
        approvedBy: userId
      }
    });

    // Materialize planned sessions and sets into database
    const athleteId = program.athleteId || userId;
    const dsl = version.dsl as any;
    if (dsl && dsl.weeks) {
      const expanded = ProgramDslInterpreter.expand(dsl, { athleteId });

      // 1. Preload referenced exercises in a single batch query
      const exerciseNames = new Set<string>();
      for (const s of expanded) {
        for (const set of s.plannedSets) {
          if (set.exerciseRef) exerciseNames.add(set.exerciseRef);
        }
      }

      const exercises = await prisma.exercise.findMany({
        where: { name: { in: Array.from(exerciseNames) } }
      });
      const exMap = new Map(exercises.map(e => [e.name, e.id]));
      let fallbackExId: string | undefined = exercises[0]?.id;
      if (!fallbackExId) {
        const anyEx = await prisma.exercise.findFirst();
        fallbackExId = anyEx?.id;
      }

      // 2. Materialize sessions with batched set inserts
      for (const s of expanded) {
        const plannedSession = await prisma.plannedSession.create({
          data: {
            athleteId,
            programVersionId: activated.id,
            date: s.date,
            week: s.week,
            day: s.day,
            status: 'SCHEDULED'
          }
        });

        const setsToInsert = s.plannedSets.map((set, idx) => {
          const exId = exMap.get(set.exerciseRef) || fallbackExId;
          if (!exId) return null;
          return {
            plannedSessionId: plannedSession.id,
            exerciseId: exId as string,
            order: idx + 1,
            setType: (set.setType as any) || 'WORKING',
            target: {
              targetWeightKg: set.targetWeightKg,
              targetReps: set.targetReps,
              repRange: set.repRange,
              targetRpe: set.targetRpe,
              targetRir: set.targetRir,
              technique: set.technique,
              notes: set.notes
            } as any
          };
        }).filter((s): s is NonNullable<typeof s> => s !== null);

        if (setsToInsert.length > 0) {
          await prisma.plannedSet.createMany({ data: setsToInsert });
        }
      }
    }

    return res.json({
      success: true,
      message: 'Proposal approved and materialized into active schedule',
      activeVersion: activated
    });
  } catch (err: any) {
    return next(err);
  }
});

// 4. Reject AI proposal -> archives draft
aiRouter.post('/proposals/:versionId/reject', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.ctx?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const versionId = Array.isArray(req.params.versionId) ? req.params.versionId[0] : req.params.versionId;

    const version = await prisma.programVersion.findUnique({
      where: { id: versionId }
    });

    if (!version) {
      return res.status(404).json({ success: false, message: 'Program version not found' });
    }

    const program = await prisma.program.findUnique({
      where: { id: version.programId }
    });

    const userRole = req.ctx?.role || 'athlete';
    if (program && program.athleteId !== userId && userRole !== 'coach' && userRole !== 'admin') {
      return res.status(403).json({ success: false, error: 'FORBIDDEN' });
    }

    const archived = await prisma.programVersion.update({
      where: { id: versionId },
      data: { status: 'ARCHIVED' }
    });

    return res.json({ success: true, archived });
  } catch (err: any) {
    return next(err);
  }
});

// 5. Coach Deva chat assistant
const ChatPromptSchema = z.object({
  prompt: z.string().min(1).max(2000)
});

aiRouter.post('/chat', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.ctx?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const parsed = ChatPromptSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: 'Invalid prompt' });
    }

    // Check Pro entitlement for higher daily quota
    const entitlements = await BillingService.resolveUserEntitlements(userId, req.ctx?.role || 'athlete');
    const isPro = entitlements.is_pro;

    const response = await AssistantService.chat(userId, parsed.data.prompt, isPro);
    return res.json({
      success: true,
      response
    });
  } catch (err: any) {
    return next(err);
  }
});
