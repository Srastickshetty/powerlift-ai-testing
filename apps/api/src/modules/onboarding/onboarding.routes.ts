import { Router } from 'express';
import { OnboardingService } from './onboarding.service';
import { OnboardingInputSchema } from '@powerlift/shared';
import { requireAuth } from '../../middleware/requireAuth';

export const onboardingRouter: Router = Router();

// POST /api/v1/me/onboarding
onboardingRouter.post('/onboarding', requireAuth, async (req, res, next) => {
  try {
    const input = OnboardingInputSchema.parse(req.body);
    const userId = req.ctx?.userId;
    if (!userId) {
      const err: any = new Error('Unauthorized');
      err.status = 401;
      throw err;
    }

    const result = await OnboardingService.completeOnboarding(userId, input);
    res.status(200).json({
      success: true,
      message: 'Onboarding completed successfully. Week 1 protocol generated.',
      ...result
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/me/onboarding/status
onboardingRouter.get('/onboarding/status', requireAuth, async (req, res, next) => {
  try {
    const userId = req.ctx?.userId;
    if (!userId) {
      const err: any = new Error('Unauthorized');
      err.status = 401;
      throw err;
    }

    const status = await OnboardingService.getOnboardingStatus(userId);
    res.json({
      success: true,
      ...status
    });
  } catch (err) {
    next(err);
  }
});
