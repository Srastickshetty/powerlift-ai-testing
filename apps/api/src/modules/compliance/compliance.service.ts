/**
 * apps/api/src/modules/compliance/compliance.service.ts
 * Trust, Privacy & Safety Compliance Service (Phase P7)
 * - Versioned Consent Tracking (GDPR / Health Data / AI Opt-In)
 * - Full Data Export (Right to Access & Data Portability)
 * - Account Deletion with 30-Day Grace Period & Hard Purge Job
 * - Content & Coach Moderation Reporting Queue
 */

import crypto from 'crypto';
import { prisma } from '../../lib/prisma';
import { logger } from '../../lib/logger';

export interface ConsentInput {
  scope: 'HEALTH_DATA' | 'COACH_MEDIA_SHARING' | 'AI_TRAINING_OPT_IN' | 'TERMS_AND_PRIVACY';
  granted: boolean;
  version?: string;
}

export interface ModerationReportInput {
  targetUserId?: string;
  mediaId?: string;
  reason: 'HARASSMENT' | 'UNSAFE_ADVICE' | 'INAPPROPRIATE_MEDIA' | 'SPAM' | 'OTHER';
  details: string;
}

export class ComplianceService {
  /**
   * Record one or more versioned consent grants/revocations
   */
  static async recordConsent(
    userId: string,
    consents: ConsentInput[],
    meta?: { ipAddress?: string; userAgent?: string }
  ) {
    const records = [];
    const consentMap: Record<string, boolean> = {};

    for (const c of consents) {
      const rec = await prisma.consentRecord.create({
        data: {
          userId,
          scope: c.scope,
          granted: c.granted,
          version: c.version || '1.0',
          ipAddress: meta?.ipAddress || null,
          userAgent: meta?.userAgent || null
        }
      });
      records.push(rec);
      consentMap[c.scope] = c.granted;
    }

    // Mirror current state onto athleteProfile.consent JSON
    try {
      const existing = await prisma.athleteProfile.findUnique({ where: { userId } });
      if (existing) {
        const merged = { ...(existing.consent as object || {}), ...consentMap };
        await prisma.athleteProfile.update({
          where: { userId },
          data: { consent: merged }
        });
      }
    } catch (err) {
      logger.warn({ err, userId }, 'Could not mirror consent to athleteProfile');
    }

    await prisma.auditLog.create({
      data: {
        actorId: userId,
        action: 'CONSENT_UPDATED',
        entity: 'User',
        entityId: userId,
        meta: { scopes: consents.map(c => ({ scope: c.scope, granted: c.granted })) }
      }
    });

    return records;
  }

  /**
   * Get user's latest consent status for all scopes
   */
  static async getConsents(userId: string) {
    const records = await prisma.consentRecord.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    // Deduplicate by scope keeping latest
    const latest: Record<string, any> = {};
    for (const r of records) {
      if (!latest[r.scope]) {
        latest[r.scope] = {
          scope: r.scope,
          granted: r.granted,
          version: r.version,
          updatedAt: r.createdAt
        };
      }
    }

    return Object.values(latest);
  }

  /**
   * Export complete user data archive with SHA-256 integrity checksum
   */
  static async exportUserData(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        athleteProfile: true,
        plProfile: true,
        bbProfile: true,
        coachProfile: true,
        subscriptions: true,
        mediaItems: true,
      }
    });

    if (!user) {
      const err: any = new Error('User not found');
      err.status = 404;
      throw err;
    }

    // Gather related training and communication data
    const sessions = await prisma.session.findMany({
      where: { athleteId: userId },
      include: { sets: true },
      orderBy: { startedAt: 'asc' }
    });

    const nutritionLogs = await prisma.nutritionLog.findMany({
      where: { athleteId: userId },
      orderBy: { date: 'asc' }
    });

    const checkins = await prisma.checkin.findMany({
      where: { athleteId: userId },
      orderBy: { createdAt: 'asc' }
    });

    const consents = await prisma.consentRecord.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' }
    });

    const auditLogs = await prisma.auditLog.findMany({
      where: { actorId: userId },
      orderBy: { at: 'asc' }
    });

    const exportBundle = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
        profiles: {
          athlete: user.athleteProfile,
          powerlifting: user.plProfile,
          bodybuilding: user.bbProfile,
          coach: user.coachProfile
        }
      },
      training: {
        sessionCount: sessions.length,
        sessions
      },
      nutrition: nutritionLogs,
      checkins,
      media: user.mediaItems,
      consents,
      subscriptions: user.subscriptions,
      auditHistory: auditLogs
    };

    const bundleString = JSON.stringify(exportBundle, null, 2);
    const checksum = crypto.createHash('sha256').update(bundleString).digest('hex');

    await prisma.auditLog.create({
      data: {
        actorId: userId,
        action: 'DATA_EXPORT_REQUESTED',
        entity: 'User',
        entityId: userId,
        meta: { checksum, sessionCount: sessions.length }
      }
    });

    return {
      checksum,
      generatedAt: new Date().toISOString(),
      data: exportBundle
    };
  }

  /**
   * Schedule account deletion with 30-day grace period
   */
  static async requestAccountDeletion(userId: string, reason?: string) {
    const scheduledPurgeAt = new Date();
    scheduledPurgeAt.setDate(scheduledPurgeAt.getDate() + 30);

    // 1. Soft-delete user
    await prisma.user.update({
      where: { id: userId },
      data: { deletedAt: new Date() }
    });

    // 2. Upsert DeletionRequest
    const req = await prisma.deletionRequest.upsert({
      where: { userId },
      create: {
        userId,
        reason: reason || null,
        status: 'PENDING',
        scheduledPurgeAt
      },
      update: {
        reason: reason || null,
        status: 'PENDING',
        requestedAt: new Date(),
        scheduledPurgeAt,
        purgedAt: null
      }
    });

    // 3. Pause active coaching links
    await prisma.coachAthlete.updateMany({
      where: { athleteId: userId, status: 'ACTIVE' },
      data: { status: 'PAUSED' }
    });

    // 4. Cancel active subscriptions
    await prisma.subscription.updateMany({
      where: { payerId: userId, status: 'active' },
      data: { status: 'CANCELLED' }
    });

    await prisma.auditLog.create({
      data: {
        actorId: userId,
        action: 'ACCOUNT_DELETION_SCHEDULED',
        entity: 'User',
        entityId: userId,
        meta: { scheduledPurgeAt, reason }
      }
    });

    return req;
  }

  /**
   * Cancel pending account deletion within grace period
   */
  static async cancelAccountDeletion(userId: string) {
    await prisma.user.update({
      where: { id: userId },
      data: { deletedAt: null }
    });

    const updated = await prisma.deletionRequest.update({
      where: { userId },
      data: { status: 'CANCELLED' }
    });

    await prisma.auditLog.create({
      data: {
        actorId: userId,
        action: 'ACCOUNT_DELETION_CANCELLED',
        entity: 'User',
        entityId: userId,
        meta: { restoredAt: new Date() }
      }
    });

    return updated;
  }

  /**
   * Hard purge expired deletion requests (cron / admin job)
   */
  static async purgeExpiredAccounts() {
    const expired = await prisma.deletionRequest.findMany({
      where: {
        status: 'PENDING',
        scheduledPurgeAt: { lte: new Date() }
      }
    });

    const purgedIds: string[] = [];

    for (const d of expired) {
      try {
        const uid = d.userId;

        // Cascade delete child entities
        await prisma.set.deleteMany({ where: { session: { athleteId: uid } } });
        await prisma.session.deleteMany({ where: { athleteId: uid } });
        await prisma.nutritionLog.deleteMany({ where: { athleteId: uid } });
        await prisma.checkin.deleteMany({ where: { athleteId: uid } });
        await prisma.alert.deleteMany({ where: { athleteId: uid } });
        await prisma.program.deleteMany({ where: { athleteId: uid } });
        await prisma.coachAthlete.deleteMany({ where: { OR: [{ athleteId: uid }, { coachId: uid }] } });
        await prisma.videoComment.deleteMany({ where: { authorId: uid } });
        await prisma.media.deleteMany({ where: { ownerId: uid } });
        await prisma.subscription.deleteMany({ where: { payerId: uid } });
        await prisma.consentRecord.deleteMany({ where: { userId: uid } });
        await prisma.athleteProfile.deleteMany({ where: { userId: uid } });
        await prisma.plProfile.deleteMany({ where: { userId: uid } });
        await prisma.bbProfile.deleteMany({ where: { userId: uid } });
        await prisma.coachProfile.deleteMany({ where: { userId: uid } });

        // Finally delete user row
        await prisma.user.delete({ where: { id: uid } });

        await prisma.deletionRequest.update({
          where: { id: d.id },
          data: { status: 'PURGED', purgedAt: new Date() }
        });

        purgedIds.push(uid);
      } catch (err) {
        logger.error({ err, userId: d.userId }, 'Failed to hard purge expired account');
      }
    }

    return { purgedCount: purgedIds.length, purgedIds };
  }

  /**
   * Submit coach or content moderation report
   */
  static async createModerationReport(reporterId: string, input: ModerationReportInput) {
    const report = await prisma.moderationReport.create({
      data: {
        reporterId,
        targetUserId: input.targetUserId || null,
        mediaId: input.mediaId || null,
        reason: input.reason,
        details: input.details,
        status: 'PENDING'
      }
    });

    await prisma.auditLog.create({
      data: {
        actorId: reporterId,
        action: 'MODERATION_REPORT_CREATED',
        entity: 'ModerationReport',
        entityId: report.id,
        meta: { reason: input.reason, targetUserId: input.targetUserId }
      }
    });

    return report;
  }

  /**
   * Admin lists moderation reports
   */
  static async listModerationReports(status?: string) {
    return prisma.moderationReport.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Admin takes action on moderation report
   */
  static async actionModerationReport(
    reportId: string,
    action: 'RESOLVED' | 'DISMISSED',
    resolution: string,
    adminId: string
  ) {
    const report = await prisma.moderationReport.update({
      where: { id: reportId },
      data: {
        status: action,
        resolution,
        reviewedAt: new Date()
      }
    });

    await prisma.auditLog.create({
      data: {
        actorId: adminId,
        action: `MODERATION_REPORT_${action}`,
        entity: 'ModerationReport',
        entityId: reportId,
        meta: { resolution }
      }
    });

    return report;
  }
}
