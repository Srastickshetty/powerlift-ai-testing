/**
 * apps/api/src/modules/feedback/feedback.routes.ts
 * Beta feedback collection and Sev-1/2 triage endpoints for Phase P8.
 */

import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { requireAuth, requireRole } from '../../middleware/requireAuth';
import { logger } from '../../lib/logger';
import { sentry } from '../../lib/telemetry';

export const feedbackRouter: Router = Router();

const FeedbackSubmissionSchema = z.object({
  severity: z.enum(['SEV1', 'SEV2', 'NORMAL', 'SUGGESTION']).default('NORMAL'),
  category: z.enum(['BUG', 'WORKOUT_LOGGING', 'ENGINE', 'UI_UX', 'COACHING', 'BILLING', 'OTHER']),
  message: z.string().min(3).max(2000),
  deviceInfo: z.record(z.any()).optional()
});

const FeedbackTriageSchema = z.object({
  status: z.enum(['OPEN', 'TRIAGED', 'RESOLVED']).optional(),
  severity: z.enum(['SEV1', 'SEV2', 'NORMAL', 'SUGGESTION']).optional()
});

// Submit feedback (Athlete or Coach)
feedbackRouter.post('/feedback', requireAuth, async (req, res, next) => {
  try {
    const parsed = FeedbackSubmissionSchema.parse(req.body);
    const userId = req.ctx!.userId;
    const role = req.ctx!.role;
    const track = req.ctx!.track;

    const record = await prisma.betaFeedback.create({
      data: {
        userId,
        role: role.toUpperCase(),
        track: track ? track.toUpperCase() : null,
        severity: parsed.severity,
        category: parsed.category,
        message: parsed.message,
        deviceInfo: parsed.deviceInfo || {},
        status: 'OPEN'
      }
    });

    // Immediate triage alert on Sev-1 (Data loss / Workout crash)
    if (parsed.severity === 'SEV1') {
      logger.error({ feedbackId: record.id, userId, message: parsed.message }, '🚨 [SEV-1 TRIAGE ALERT] High-severity incident reported by user');
      sentry.captureMessage(`[SEV-1 ALERT] User ${userId}: ${parsed.message}`, 'error', {
        feedbackId: record.id,
        category: parsed.category,
        deviceInfo: parsed.deviceInfo
      });
    }

    return res.status(201).json({
      success: true,
      feedbackId: record.id,
      message: 'Feedback received. Thank you for helping build PowerLift AI!'
    });
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ error: 'Invalid feedback submission', details: err.errors });
    }
    return next(err);
  }
});

// Admin: list all beta feedback
feedbackRouter.get('/admin/feedback', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const { status, severity, limit = '50' } = req.query;

    const where: any = {};
    if (status) where.status = String(status);
    if (severity) where.severity = String(severity);

    const items = await prisma.betaFeedback.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: Math.min(Number(limit), 100)
    });

    return res.json({
      success: true,
      count: items.length,
      feedback: items
    });
  } catch (err) {
    return next(err);
  }
});

// Admin: triage / resolve feedback
feedbackRouter.patch('/admin/feedback/:id/triage', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const feedbackId = req.params.id as string;
    const parsed = FeedbackTriageSchema.parse(req.body);

    const updated = await prisma.betaFeedback.update({
      where: { id: feedbackId },
      data: {
        ...(parsed.status && { status: parsed.status }),
        ...(parsed.severity && { severity: parsed.severity })
      }
    });

    return res.json({
      success: true,
      feedback: updated
    });
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ error: 'Invalid triage payload', details: err.errors });
    }
    return next(err);
  }
});
