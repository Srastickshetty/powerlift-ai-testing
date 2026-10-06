/**
 * apps/api/src/modules/coaching/coaching.routes.ts
 * Express 5 router for Coach Marketplace & Coaching features.
 */

import { Router } from 'express';
import { CoachingService } from './coaching.service';
import { CoachApplicationService } from './coachApplication.service';
import { CoachProfileSchema, CoachRequestSchema, AcceptRequestSchema, CoachProgramEditSchema, CheckinReplySchema, CoachApplySchema } from './coaching.schema';
import { requireAuth, requireRole } from '../../middleware/requireAuth';

export const coachMarketplaceRouter: Router = Router();
export const coachPrivateRouter: Router = Router();

// ==========================================
// 1. Public Coach Marketplace (GET /api/v1/coaches)
// ==========================================
coachMarketplaceRouter.get('/', async (req, res, next) => {
  try {
    const { track, specialty, language } = req.query;
    const coaches = await CoachingService.getPublicCoaches({
      track: typeof track === 'string' ? track : undefined,
      specialty: typeof specialty === 'string' ? specialty : undefined,
      language: typeof language === 'string' ? language : undefined
    });
    res.json({ success: true, coaches });
  } catch (err) {
    next(err);
  }
});

// Prospective coach onboarding application (POST /api/v1/coaches/apply)
coachMarketplaceRouter.post('/apply', async (req, res, next) => {
  try {
    const input = CoachApplySchema.parse(req.body);
    const result = await CoachApplicationService.submitApplication(input);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

// Athlete requests coach (POST /api/v1/coaches/:id/request)
coachMarketplaceRouter.post('/:id/request', requireAuth, async (req, res, next) => {
  try {
    const athleteId = req.ctx?.userId;
    if (!athleteId) {
      const err: any = new Error('Unauthorized');
      err.status = 401;
      throw err;
    }

    const { hasGuardianConsent } = CoachRequestSchema.parse({
      coachId: req.params.id,
      hasGuardianConsent: req.body.hasGuardianConsent
    });

    const result = await CoachingService.requestCoach(athleteId, {
      coachId: req.params.id as string,
      hasGuardianConsent
    });

    res.status(201).json({ success: true, message: 'Coaching request submitted.', request: result });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// 2. Coach Private Endpoints (requireRole('coach'))
// ==========================================

// PATCH /api/v1/coach/profile
coachPrivateRouter.patch('/profile', requireAuth, requireRole('coach'), async (req, res, next) => {
  try {
    const input = CoachProfileSchema.parse(req.body);
    const result = await CoachingService.upsertCoachProfile(req.ctx!.userId, input);
    res.json({ success: true, profile: result });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/coach/requests
coachPrivateRouter.get('/requests', requireAuth, requireRole('coach'), async (req, res, next) => {
  try {
    const requests = await CoachingService.getCoachRequests(req.ctx!.userId);
    res.json({ success: true, requests });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/coach/requests/:id/accept
coachPrivateRouter.post('/requests/:id/accept', requireAuth, requireRole('coach'), async (req, res, next) => {
  try {
    const { mode } = AcceptRequestSchema.parse(req.body);
    const linkId = req.params.id as string;
    const result = await CoachingService.acceptRequest(req.ctx!.userId, linkId, mode);
    res.json({ success: true, message: 'Athlete request accepted.', relationship: result });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/coach/requests/:id/decline
coachPrivateRouter.post('/requests/:id/decline', requireAuth, requireRole('coach'), async (req, res, next) => {
  try {
    const linkId = req.params.id as string;
    const result = await CoachingService.declineRequest(req.ctx!.userId, linkId);
    res.json({ success: true, message: 'Athlete request declined.', relationship: result });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/coach/roster
coachPrivateRouter.get('/roster', requireAuth, requireRole('coach'), async (req, res, next) => {
  try {
    const roster = await CoachingService.getCoachRoster(req.ctx!.userId);
    res.json({ success: true, roster });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/coach/athletes/:id/overview
coachPrivateRouter.get('/athletes/:id/overview', requireAuth, requireRole('coach'), async (req, res, next) => {
  try {
    const athleteId = req.params.id as string;
    const detail = await CoachingService.getAthleteDetail(req.ctx!.userId, athleteId);
    res.json({ success: true, ...detail });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/v1/coach/athletes/:id/program
coachPrivateRouter.patch('/athletes/:id/program', requireAuth, requireRole('coach'), async (req, res, next) => {
  try {
    const athleteId = req.params.id as string;
    const input = CoachProgramEditSchema.parse(req.body);
    const result = await CoachingService.editAthleteProgram(req.ctx!.userId, athleteId, input);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/coach/checkins/queue
coachPrivateRouter.get('/checkins/queue', requireAuth, requireRole('coach'), async (req, res, next) => {
  try {
    const queue = await CoachingService.getCheckinQueue(req.ctx!.userId);
    res.json({ success: true, queue });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/coach/checkins/:id/reply
coachPrivateRouter.post('/checkins/:id/reply', requireAuth, requireRole('coach'), async (req, res, next) => {
  try {
    const checkinId = req.params.id as string;
    const input = CheckinReplySchema.parse(req.body);
    const result = await CoachingService.replyToCheckin(req.ctx!.userId, checkinId, input);
    res.json({ success: true, message: 'Check-in review saved.', checkin: result });
  } catch (err) {
    next(err);
  }
});
