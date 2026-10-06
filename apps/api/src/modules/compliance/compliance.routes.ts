/**
 * apps/api/src/modules/compliance/compliance.routes.ts
 * Express Router for Phase P7: Trust, Privacy & Safety Compliance
 */

import { Router } from 'express';
import { z } from 'zod';
import { ComplianceService } from './compliance.service';
import { requireAuth, requireRole } from '../../middleware/requireAuth';
import { exportRateLimiter } from '../../middleware/rateLimiters';

export const complianceRouter: Router = Router();

const ConsentSchema = z.object({
  consents: z.array(z.object({
    scope: z.enum(['HEALTH_DATA', 'COACH_MEDIA_SHARING', 'AI_TRAINING_OPT_IN', 'TERMS_AND_PRIVACY']),
    granted: z.boolean(),
    version: z.string().optional()
  })).min(1)
});

const DeletionRequestSchema = z.object({
  reason: z.string().max(500).optional(),
  confirmation: z.literal('DELETE_MY_ACCOUNT')
});

const ReportSchema = z.object({
  targetUserId: z.string().optional(),
  mediaId: z.string().optional(),
  reason: z.enum(['HARASSMENT', 'UNSAFE_ADVICE', 'INAPPROPRIATE_MEDIA', 'SPAM', 'OTHER']),
  details: z.string().min(5).max(1000)
});

const ReportActionSchema = z.object({
  action: z.enum(['RESOLVED', 'DISMISSED']),
  resolution: z.string().min(3).max(500)
});

// ──────────────────────────────────────────────
// 1. Versioned Consent Management
// ──────────────────────────────────────────────

complianceRouter.post('/compliance/consent', requireAuth, async (req, res, next) => {
  try {
    const { consents } = ConsentSchema.parse(req.body);
    const ip = req.ip || req.headers['x-forwarded-for']?.toString();
    const userAgent = req.headers['user-agent'];

    const result = await ComplianceService.recordConsent(req.ctx!.userId, consents, {
      ipAddress: typeof ip === 'string' ? ip : undefined,
      userAgent
    });

    res.status(200).json({
      success: true,
      message: 'Consent preferences recorded successfully.',
      consents: result
    });
  } catch (err) {
    next(err);
  }
});

complianceRouter.get('/compliance/consent', requireAuth, async (req, res, next) => {
  try {
    const consents = await ComplianceService.getConsents(req.ctx!.userId);
    res.json({ success: true, consents });
  } catch (err) {
    next(err);
  }
});

// ──────────────────────────────────────────────
// 2. Data Export (Right to Access & Portability)
// ──────────────────────────────────────────────

complianceRouter.post('/me/export', requireAuth, exportRateLimiter, async (req, res, next) => {
  try {
    const exportResult = await ComplianceService.exportUserData(req.ctx!.userId);
    res.status(200).json({
      success: true,
      ...exportResult
    });
  } catch (err) {
    next(err);
  }
});

// ──────────────────────────────────────────────
// 3. Account Deletion with 30-Day Grace Period
// ──────────────────────────────────────────────

complianceRouter.post('/me/delete', requireAuth, exportRateLimiter, async (req, res, next) => {
  try {
    const { reason } = DeletionRequestSchema.parse(req.body);
    const deletion = await ComplianceService.requestAccountDeletion(req.ctx!.userId, reason);

    res.status(200).json({
      success: true,
      message: 'Account deletion scheduled. Your account will be permanently purged in 30 days unless cancelled.',
      deletion
    });
  } catch (err) {
    next(err);
  }
});

complianceRouter.post('/me/delete/cancel', requireAuth, async (req, res, next) => {
  try {
    const updated = await ComplianceService.cancelAccountDeletion(req.ctx!.userId);
    res.status(200).json({
      success: true,
      message: 'Account deletion cancelled. Your account and access have been fully restored.',
      deletion: updated
    });
  } catch (err) {
    next(err);
  }
});

// ──────────────────────────────────────────────
// 4. Moderation & Content Reporting
// ──────────────────────────────────────────────

complianceRouter.post('/compliance/reports', requireAuth, async (req, res, next) => {
  try {
    const body = ReportSchema.parse(req.body);
    const report = await ComplianceService.createModerationReport(req.ctx!.userId, body);

    res.status(201).json({
      success: true,
      message: 'Report submitted. Our safety team will review it within 24 hours.',
      reportId: report.id
    });
  } catch (err) {
    next(err);
  }
});

// Admin Queue & Actions
complianceRouter.get('/admin/reports', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const status = req.query.status?.toString();
    const reports = await ComplianceService.listModerationReports(status);
    res.json({ success: true, reports });
  } catch (err) {
    next(err);
  }
});

complianceRouter.post('/admin/reports/:id/action', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const reportId = req.params.id as string;
    const { action, resolution } = ReportActionSchema.parse(req.body);
    const updated = await ComplianceService.actionModerationReport(
      reportId,
      action,
      resolution,
      req.ctx!.userId
    );

    res.json({
      success: true,
      message: `Report status updated to ${action}.`,
      report: updated
    });
  } catch (err) {
    next(err);
  }
});

// Admin / Cron Job: Purge Expired Accounts
complianceRouter.post('/admin/purge-expired', requireAuth, requireRole('admin'), async (_req, res, next) => {
  try {
    const result = await ComplianceService.purgeExpiredAccounts();
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
});
