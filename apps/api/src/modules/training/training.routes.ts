import { Router } from 'express';
import { TrainingService } from './training.service';
import { EvolutionService } from './evolution.service';
import {
  StartSessionSchema,
  BatchLogSetsSchema,
  FinishSessionSchema,
  SwapExerciseSchema,
  MissedSessionSchema,
  EvolveWeekSchema
} from './training.schema';
import { requireAuth } from '../../middleware/requireAuth';

export const trainingRouter: Router = Router();

// GET /api/v1/training/today - Today's prescribed session, ghost values, ladders
trainingRouter.get('/today', requireAuth, async (req, res, next) => {
  try {
    const athleteId = req.ctx?.userId;
    if (!athleteId) {
      const err: any = new Error('Unauthorized');
      err.status = 401;
      throw err;
    }

    const data = await TrainingService.getTodaySession(athleteId);
    res.json({
      success: true,
      ...data
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/training/sessions - Start active session
trainingRouter.post('/sessions', requireAuth, async (req, res, next) => {
  try {
    const athleteId = req.ctx?.userId;
    if (!athleteId) {
      const err: any = new Error('Unauthorized');
      err.status = 401;
      throw err;
    }

    const input = StartSessionSchema.parse(req.body);
    const session = await TrainingService.startSession(athleteId, input);
    res.status(201).json({
      success: true,
      session
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/training/sessions/:id/sets - Log batch or single set (idempotent by clientUuid)
trainingRouter.post('/sessions/:id/sets', requireAuth, async (req, res, next) => {
  try {
    const athleteId = req.ctx?.userId;
    if (!athleteId) {
      const err: any = new Error('Unauthorized');
      err.status = 401;
      throw err;
    }

    const payload = Array.isArray(req.body.sets) ? req.body : { sets: [req.body] };
    const input = BatchLogSetsSchema.parse(payload);
    const result = await TrainingService.logSets(athleteId, req.params.id as string, input.sets);
    res.json({
      success: true,
      ...result
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/training/sessions/:id/finish - Complete workout session
trainingRouter.post('/sessions/:id/finish', requireAuth, async (req, res, next) => {
  try {
    const athleteId = req.ctx?.userId;
    if (!athleteId) {
      const err: any = new Error('Unauthorized');
      err.status = 401;
      throw err;
    }

    const input = FinishSessionSchema.parse(req.body);
    const result = await TrainingService.finishSession(athleteId, req.params.id as string, input);
    res.json({
      success: true,
      ...result
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/training/swap-exercise - Swap planned exercise with substitute
trainingRouter.post('/swap-exercise', requireAuth, async (req, res, next) => {
  try {
    const athleteId = req.ctx?.userId;
    if (!athleteId) {
      const err: any = new Error('Unauthorized');
      err.status = 401;
      throw err;
    }

    const input = SwapExerciseSchema.parse(req.body);
    const result = await TrainingService.swapExercise(athleteId, input);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/training/missed-session - Handle missed workout (shift/compress/drop)
trainingRouter.post('/missed-session', requireAuth, async (req, res, next) => {
  try {
    const athleteId = req.ctx?.userId;
    if (!athleteId) {
      const err: any = new Error('Unauthorized');
      err.status = 401;
      throw err;
    }

    const input = MissedSessionSchema.parse(req.body);
    const result = await TrainingService.handleMissedSession(athleteId, input);
    res.json({
      success: true,
      ...result
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/training/evolve-week - Weekly check-in evolution producing ProgramVersion(DRAFT)
trainingRouter.post('/evolve-week', requireAuth, async (req, res, next) => {
  try {
    const athleteId = req.ctx?.userId;
    if (!athleteId) {
      const err: any = new Error('Unauthorized');
      err.status = 401;
      throw err;
    }

    const input = EvolveWeekSchema.parse(req.body);
    const result = await EvolutionService.evolveWeeklyProgram(athleteId, input);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/training/approve-draft/:versionId - Athlete/Coach approves DRAFT to ACTIVE
trainingRouter.post('/approve-draft/:versionId', requireAuth, async (req, res, next) => {
  try {
    const athleteId = req.ctx?.userId;
    if (!athleteId) {
      const err: any = new Error('Unauthorized');
      err.status = 401;
      throw err;
    }

    const versionId = Array.isArray(req.params.versionId) ? req.params.versionId[0] : req.params.versionId;
    const result = await EvolutionService.approveDraftVersion(athleteId, versionId);
    res.json(result);
  } catch (err) {
    next(err);
  }
});
