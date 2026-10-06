/**
 * apps/api/src/middleware/requireEntitlement.ts
 * Server-side feature gate middleware checking active subscriptions & roles.
 */

import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';
import { BillingService } from '../modules/billing/billing.service';

export type EntitlementKey = 'coach_chat' | 'video_review' | 'ai_generation_quota' | 'is_pro';

export function requireEntitlement(entitlement: EntitlementKey) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    if (!req.ctx) {
      return next(new AppError('UNAUTHORIZED', 'Authentication required.', 401));
    }

    // Admins and coaches bypass consumer entitlement restrictions
    if (req.ctx.role === 'admin' || req.ctx.role === 'coach') {
      return next();
    }

    try {
      const entitlements = await BillingService.resolveUserEntitlements(req.ctx.userId, req.ctx.role);
      const value = (entitlements as any)[entitlement];

      if (value === true || (typeof value === 'number' && value > 0)) {
        return next();
      }

      return next(new AppError('UPGRADE_REQUIRED', `Access to this feature (${entitlement}) requires an active Pro or Coaching subscription.`, 402));
    } catch (err) {
      return next(err);
    }
  };
}
