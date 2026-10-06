/**
 * apps/api/src/modules/coaching/coaching.service.ts
 * Coach marketplace, roster management, request approval workflow, program edits, and check-ins.
 * Strictly adheres to small files rule (<400 lines).
 */

import { prisma } from '../../lib/prisma';
import { CoachProfileInput, CoachRequestInput, CoachProgramEditInput, CheckinReplyInput } from './coaching.schema';
import { AlertScannerService } from './alertScanner.service';
import { validateYouthSafeguards } from '@powerlift/engines';
import { logger } from '../../lib/logger';

export class CoachingService {
  /**
   * Public directory of coaches with search filters.
   */
  static async getPublicCoaches(filters: { track?: string; specialty?: string; language?: string }) {
    const where: any = {};
    if (filters.track) where.tracks = { has: filters.track.toUpperCase() as any };
    if (filters.specialty) where.specialties = { has: filters.specialty };
    if (filters.language) where.languages = { has: filters.language };

    const profiles = await prisma.coachProfile.findMany({
      where,
      include: { user: { select: { id: true, name: true, email: true } } }
    });

    return profiles.map((p) => ({
      id: p.userId,
      name: p.user.name,
      email: p.user.email,
      tracks: p.tracks,
      bio: p.bio,
      specialties: p.specialties,
      languages: p.languages,
      priceMonthlyMinor: p.priceMonthlyMinor,
      currency: p.currency,
      ratingAvg: p.ratingAvg,
      verified: !!p.verifiedAt,
      capacity: p.capacity
    }));
  }

  /**
   * Upsert coach profile details.
   */
  static async upsertCoachProfile(coachId: string, input: CoachProfileInput) {
    return prisma.coachProfile.upsert({
      where: { userId: coachId },
      create: {
        userId: coachId,
        tracks: input.tracks as any,
        bio: input.bio,
        specialties: input.specialties,
        languages: input.languages,
        priceMonthlyMinor: input.priceMonthlyMinor,
        currency: input.currency,
        capacity: input.capacity
      },
      update: {
        tracks: input.tracks as any,
        bio: input.bio,
        specialties: input.specialties,
        languages: input.languages,
        priceMonthlyMinor: input.priceMonthlyMinor,
        currency: input.currency,
        capacity: input.capacity
      }
    });
  }

  /**
   * Athlete requests to hire a coach.
   */
  static async requestCoach(athleteId: string, input: CoachRequestInput) {
    // 1. Check under-18 consent guardrail (Safety Rule §9)
    const profile = await prisma.athleteProfile.findUnique({
      where: { userId: athleteId }
    });

    const age = (profile?.goals as any)?.age || 25;
    const youthCheck = validateYouthSafeguards(age, undefined, input.hasGuardianConsent);
    if (!youthCheck.allowed && youthCheck.blockedFeatures.includes('coach_marketplace')) {
      const err: any = new Error('Safety Rule §9: Under-18 athletes require parental or guardian consent to access human coaching.');
      err.status = 403;
      throw err;
    }

    // 2. Check coach capacity
    const coachProfile = await prisma.coachProfile.findUnique({
      where: { userId: input.coachId }
    });

    const activeCount = await prisma.coachAthlete.count({
      where: { coachId: input.coachId, status: 'ACTIVE' }
    });

    if (coachProfile && activeCount >= coachProfile.capacity) {
      const err: any = new Error('Coach has reached maximum active athlete capacity.');
      err.status = 400;
      throw err;
    }

    // 3. Upsert relationship to REQUESTED
    const existing = await prisma.coachAthlete.findFirst({
      where: { coachId: input.coachId, athleteId }
    });

    if (existing) {
      return prisma.coachAthlete.update({
        where: { id: existing.id },
        data: { status: 'REQUESTED' }
      });
    }

    return prisma.coachAthlete.create({
      data: {
        coachId: input.coachId,
        athleteId,
        status: 'REQUESTED'
      }
    });
  }

  /**
   * Coach lists pending athlete requests.
   */
  static async getCoachRequests(coachId: string) {
    return prisma.coachAthlete.findMany({
      where: { coachId, status: 'REQUESTED' },
      include: {
        athlete: {
          select: {
            id: true,
            name: true,
            email: true,
            athleteProfile: true,
            plProfile: true,
            bbProfile: true
          }
        }
      }
    });
  }

  /**
   * Coach accepts an athlete request.
   */
  static async acceptRequest(coachId: string, linkId: string, mode: 'COACH_LED' | 'COPILOT') {
    const link = await prisma.coachAthlete.findUnique({ where: { id: linkId } });
    if (!link || link.coachId !== coachId) {
      const err: any = new Error('Request not found or unauthorized.');
      err.status = 404;
      throw err;
    }

    return prisma.coachAthlete.update({
      where: { id: linkId },
      data: {
        status: 'ACTIVE',
        mode: mode as any,
        startedAt: new Date()
      }
    });
  }

  /**
   * Coach declines an athlete request.
   */
  static async declineRequest(coachId: string, linkId: string) {
    const link = await prisma.coachAthlete.findUnique({ where: { id: linkId } });
    if (!link || link.coachId !== coachId) {
      const err: any = new Error('Request not found or unauthorized.');
      err.status = 404;
      throw err;
    }

    return prisma.coachAthlete.update({
      where: { id: linkId },
      data: { status: 'ENDED', endedAt: new Date() }
    });
  }

  /**
   * Coach roster with traffic light indicators and alert scan summary.
   */
  static async getCoachRoster(coachId: string) {
    const links = await prisma.coachAthlete.findMany({
      where: { coachId, status: 'ACTIVE' },
      include: {
        athlete: {
          include: { athleteProfile: true, plProfile: true, bbProfile: true }
        }
      }
    });

    const roster = await Promise.all(
      links.map(async (link) => {
        const scan = await AlertScannerService.scanAthlete(link.athleteId, coachId);
        const lastSession = await prisma.session.findFirst({
          where: { athleteId: link.athleteId },
          orderBy: { startedAt: 'desc' }
        });

        return {
          linkId: link.id,
          athleteId: link.athleteId,
          athleteName: link.athlete.name,
          email: link.athlete.email,
          track: link.athlete.athleteProfile?.track || 'POWERLIFTING',
          mode: link.mode,
          startedAt: link.startedAt,
          trafficLight: scan.trafficLight,
          activeAlerts: scan.activeAlerts,
          lastActiveAt: lastSession?.startedAt || null
        };
      })
    );

    return roster;
  }

  /**
   * Coach inspects complete athlete profile and logs.
   * STRICT AUTHZ: Only allowed if link status is ACTIVE.
   */
  static async getAthleteDetail(coachId: string, athleteId: string) {
    const link = await prisma.coachAthlete.findFirst({
      where: { coachId, athleteId, status: 'ACTIVE' }
    });

    if (!link) {
      const err: any = new Error('Access denied: You do not have an active coaching relationship with this athlete.');
      err.status = 403;
      throw err;
    }

    const athlete = await prisma.user.findUnique({
      where: { id: athleteId },
      include: {
        athleteProfile: true,
        plProfile: true,
        bbProfile: true
      }
    });

    const recentSessions = await prisma.session.findMany({
      where: { athleteId },
      include: { sets: { include: { exercise: true } } },
      orderBy: { startedAt: 'desc' },
      take: 10
    });

    const activeProgram = await prisma.program.findFirst({
      where: { athleteId },
      include: {
        versions: { orderBy: { version: 'desc' }, take: 2 }
      }
    });

    const checkins = await prisma.checkin.findMany({
      where: { athleteId },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    const alerts = await AlertScannerService.scanAthlete(athleteId, coachId);

    return {
      athlete,
      relationship: link,
      recentSessions,
      activeProgram,
      checkins,
      alerts
    };
  }

  /**
   * Coach edits or modifies an athlete's program version.
   */
  static async editAthleteProgram(coachId: string, athleteId: string, input: CoachProgramEditInput) {
    const link = await prisma.coachAthlete.findFirst({
      where: { coachId, athleteId, status: 'ACTIVE' }
    });

    if (!link) {
      const err: any = new Error('Unauthorized');
      err.status = 403;
      throw err;
    }

    const targetVersion = await prisma.programVersion.findUnique({
      where: { id: input.versionId },
      include: { program: true }
    });

    if (!targetVersion || targetVersion.program.athleteId !== athleteId) {
      const err: any = new Error('Program version not found.');
      err.status = 404;
      throw err;
    }

    // Create a new version with coach modifications
    const newVersion = await prisma.programVersion.create({
      data: {
        programId: targetVersion.programId,
        version: targetVersion.version + 1,
        status: link.mode === 'COACH_LED' ? 'ACTIVE' : 'DRAFT',
        createdBy: coachId,
        approvedBy: link.mode === 'COACH_LED' ? coachId : null,
        dsl: {
          ...(targetVersion.dsl as any),
          ...input.diff
        },
        rationale: {
          summary: input.coachNotes || 'Coach updated program parameters directly.',
          coachId,
          diff: input.diff
        },
        diff: input.diff
      }
    });

    if (newVersion.status === 'ACTIVE') {
      await prisma.programVersion.updateMany({
        where: { programId: targetVersion.programId, id: { not: newVersion.id }, status: 'ACTIVE' },
        data: { status: 'ARCHIVED' }
      });
    }

    return {
      success: true,
      version: newVersion,
      status: newVersion.status,
      message: `Program version v${newVersion.version} created.`
    };
  }

  /**
   * Coach replies to an athlete's weekly check-in.
   */
  static async replyToCheckin(coachId: string, checkinId: string, input: CheckinReplyInput) {
    const checkin = await prisma.checkin.findUnique({ where: { id: checkinId } });
    if (!checkin) {
      const err: any = new Error('Check-in not found.');
      err.status = 404;
      throw err;
    }

    const link = await prisma.coachAthlete.findFirst({
      where: { coachId, athleteId: checkin.athleteId, status: 'ACTIVE' }
    });

    if (!link) {
      const err: any = new Error('Unauthorized.');
      err.status = 403;
      throw err;
    }

    return prisma.checkin.update({
      where: { id: checkinId },
      data: {
        coachReply: input.reply,
        status: 'reviewed'
      }
    });
  }

  /**
   * Lists check-ins needing coach review.
   */
  static async getCheckinQueue(coachId: string) {
    const links = await prisma.coachAthlete.findMany({
      where: { coachId, status: 'ACTIVE' },
      select: { athleteId: true }
    });
    const athleteIds = links.map((l) => l.athleteId);

    return prisma.checkin.findMany({
      where: {
        athleteId: { in: athleteIds },
        status: 'pending'
      },
      orderBy: { createdAt: 'asc' }
    });
  }

  /**
   * Admin verifies a coach profile.
   */
  static async verifyCoach(coachId: string) {
    return prisma.coachProfile.update({
      where: { userId: coachId },
      data: { verifiedAt: new Date() }
    });
  }
}
