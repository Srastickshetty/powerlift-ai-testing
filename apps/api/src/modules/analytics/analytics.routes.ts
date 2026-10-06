import { Router } from 'express';
import { AnalyticsService } from './analytics.service';
import { requireAuth, requireSelfOrCoachOf } from '../../middleware/requireAuth';

export const analyticsRouter: Router = Router();

// GET /api/v1/analytics/e1rm - Athlete e1RM timeline
analyticsRouter.get('/e1rm', requireAuth, async (req, res, next) => {
  try {
    const athleteId = (req.query.athleteId as string) || req.ctx?.userId;
    if (!athleteId) {
      const err: any = new Error('Unauthorized');
      err.status = 401;
      throw err;
    }

    const exerciseName = req.query.exercise as string | undefined;
    const timeline = await AnalyticsService.getE1rmTimeline(athleteId, exerciseName);
    res.json({
      success: true,
      count: timeline.length,
      timeline
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/analytics/volume - Volume by muscle group & tonnage
analyticsRouter.get('/volume', requireAuth, async (req, res, next) => {
  try {
    const athleteId = (req.query.athleteId as string) || req.ctx?.userId;
    if (!athleteId) {
      const err: any = new Error('Unauthorized');
      err.status = 401;
      throw err;
    }

    const volume = await AnalyticsService.getVolumeDistribution(athleteId);
    res.json({
      success: true,
      ...volume
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/analytics/history - Workout session history
analyticsRouter.get('/history', requireAuth, async (req, res, next) => {
  try {
    const athleteId = (req.query.athleteId as string) || req.ctx?.userId;
    if (!athleteId) {
      const err: any = new Error('Unauthorized');
      err.status = 401;
      throw err;
    }

    const limit = Number(req.query.limit || 20);
    const history = await AnalyticsService.getHistory(athleteId, limit);
    res.json({
      success: true,
      count: history.length,
      history
    });
  } catch (err) {
    next(err);
  }
});
