/**
 * apps/api/src/modules/coaching/coachApplication.service.ts
 * Dedicated service handling prospective coach onboarding applications,
 * verification vetting, and Superadmin approvals.
 * Adheres strictly to small files rule (<400 lines).
 */

import { prisma } from '../../lib/prisma';
import { CoachApplyInput } from './coaching.schema';
import { logger } from '../../lib/logger';

export class CoachApplicationService {
  /**
   * Submits a new coach onboarding application.
   */
  static async submitApplication(input: CoachApplyInput) {
    logger.info({ email: input.email, tracks: input.tracks }, 'Received coach application');

    // 1. Find or create user account for applicant
    let user = await prisma.user.findUnique({
      where: { email: input.email }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          firebaseUid: `coach_app_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
          email: input.email,
          name: input.name,
          role: 'ATHLETE' // Remains ATHLETE until admin verifies and promotes to COACH
        }
      });
    }

    // 2. Package sport-specific application data
    const applicationData = {
      phone: input.phone || null,
      country: input.country,
      socialUrl: input.socialUrl || null,
      plDetails: input.plDetails || null,
      bbDetails: input.bbDetails || null,
      certifications: input.certifications,
      athleticAchievements: input.athleticAchievements || null,
      experienceYears: input.experienceYears,
      portfolioUrl: input.portfolioUrl || null,
      submittedAt: new Date().toISOString()
    };

    // 3. Upsert unverified coach profile
    const coachProfile = await prisma.coachProfile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        tracks: input.tracks as any,
        bio: input.bio,
        specialties: input.certifications.length > 0 ? input.certifications : ['Strength & Conditioning'],
        languages: input.languages,
        priceMonthlyMinor: Math.round(input.priceMonthly * 100),
        currency: 'USD',
        capacity: input.capacity,
        verifiedAt: null, // Pending Superadmin verification
        applicationData: applicationData as any
      },
      update: {
        tracks: input.tracks as any,
        bio: input.bio,
        specialties: input.certifications.length > 0 ? input.certifications : ['Strength & Conditioning'],
        languages: input.languages,
        priceMonthlyMinor: Math.round(input.priceMonthly * 100),
        capacity: input.capacity,
        verifiedAt: null,
        applicationData: applicationData as any
      }
    });

    // 4. Log audit event
    await prisma.auditLog.create({
      data: {
        actorId: user.id,
        action: 'COACH_APPLICATION_SUBMITTED',
        entity: 'CoachProfile',
        entityId: coachProfile.userId,
        meta: { tracks: input.tracks, name: input.name, email: input.email }
      }
    });

    return {
      success: true,
      coachId: user.id,
      message: 'Coach application submitted successfully. Pending Superadmin review.'
    };
  }

  /**
   * Retrieves all unverified coach applications for Superadmin inspection.
   */
  static async getPendingApplications() {
    const pending = await prisma.coachProfile.findMany({
      where: { verifiedAt: null },
      include: {
        user: { select: { id: true, name: true, email: true, createdAt: true } }
      },
      orderBy: { user: { createdAt: 'desc' } }
    });

    return pending.map((p) => ({
      id: p.userId,
      name: p.user.name,
      email: p.user.email,
      tracks: p.tracks,
      bio: p.bio,
      specialties: p.specialties,
      languages: p.languages,
      priceMonthly: Math.round(p.priceMonthlyMinor / 100),
      capacity: p.capacity,
      applicationData: p.applicationData,
      submittedAt: (p.applicationData as any)?.submittedAt || p.user.createdAt
    }));
  }

  /**
   * Superadmin approves and onboards a coach.
   */
  static async approveApplication(coachId: string, adminId: string) {
    logger.info({ coachId, adminId }, 'Admin approving coach application');

    // 1. Verify profile
    const profile = await prisma.coachProfile.update({
      where: { userId: coachId },
      data: { verifiedAt: new Date() }
    });

    // 2. Promote user to COACH role
    const user = await prisma.user.update({
      where: { id: coachId },
      data: { role: 'COACH' }
    });

    // 3. Audit log
    await prisma.auditLog.create({
      data: {
        actorId: adminId,
        action: 'COACH_APPLICATION_APPROVED',
        entity: 'CoachProfile',
        entityId: coachId,
        meta: { approvedBy: adminId }
      }
    });

    return { success: true, user, profile };
  }

  /**
   * Superadmin declines a coach application.
   */
  static async declineApplication(coachId: string, adminId: string, reason = 'Did not meet credential threshold') {
    logger.info({ coachId, adminId, reason }, 'Admin declining coach application');

    // Remove pending profile
    await prisma.coachProfile.delete({
      where: { userId: coachId }
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        actorId: adminId,
        action: 'COACH_APPLICATION_DECLINED',
        entity: 'CoachProfile',
        entityId: coachId,
        meta: { reason, declinedBy: adminId }
      }
    });

    return { success: true, message: 'Coach application declined.' };
  }
}
