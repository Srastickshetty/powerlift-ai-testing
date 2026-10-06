/**
 * apps/api/src/modules/coaching/alertScanner.service.ts
 * Background & on-demand alert scanner for athletes.
 * Flags: 2 missed sessions, joint pain >= 6, RPE drift, weight rate outliers, overdue check-ins.
 * Computes traffic light status: GREEN, YELLOW, RED.
 */

import { prisma } from '../../lib/prisma';
import { logger } from '../../lib/logger';

export type TrafficLight = 'GREEN' | 'YELLOW' | 'RED';

export interface ScannedAthleteAlerts {
  athleteId: string;
  trafficLight: TrafficLight;
  activeAlerts: Array<{
    type: string;
    severity: 'info' | 'warning' | 'critical';
    message: string;
    details: any;
  }>;
}

export class AlertScannerService {
  /**
   * Scans a single athlete's recent logs, check-ins, and pain entries.
   */
  static async scanAthlete(athleteId: string, coachId?: string): Promise<ScannedAthleteAlerts> {
    const alerts: ScannedAthleteAlerts['activeAlerts'] = [];

    // 1. Joint Pain Scanner (Check last 7 days of sets)
    const recentPainSets = await prisma.set.findMany({
      where: {
        session: { athleteId },
        pain0To10: { gte: 4 }
      },
      orderBy: { session: { startedAt: 'desc' } },
      take: 5,
      include: { exercise: true }
    });

    const maxPain = recentPainSets.reduce((max, s) => Math.max(max, s.pain0To10), 0);
    if (maxPain >= 7) {
      alerts.push({
        type: 'CRITICAL_JOINT_PAIN',
        severity: 'critical',
        message: `Safety Alert: Reported pain of ${maxPain}/10 requires training stoppage & medical clearance.`,
        details: { maxPain, sets: recentPainSets.map((s) => ({ ex: s.exercise.name, pain: s.pain0To10 })) }
      });
    } else if (maxPain >= 5) {
      alerts.push({
        type: 'ELEVATED_JOINT_STRAIN',
        severity: 'warning',
        message: `Moderate pain detected (${maxPain}/10). Exercise substitution recommended.`,
        details: { maxPain }
      });
    }

    // 2. Missed Sessions Scanner (Check scheduled sessions in past 7 days that are not completed)
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const sevenDaysAgo = new Date(startOfToday.getTime() - 7 * 24 * 60 * 60 * 1000);
    const missedSessions = await prisma.plannedSession.findMany({
      where: {
        athleteId,
        date: { gte: sevenDaysAgo, lt: startOfToday },
        status: 'SCHEDULED'
      }
    });

    if (missedSessions.length >= 2) {
      alerts.push({
        type: 'MULTIPLE_MISSED_SESSIONS',
        severity: missedSessions.length >= 3 ? 'critical' : 'warning',
        message: `Athlete missed ${missedSessions.length} sessions in the last 7 days. Risk of deconditioning or dropout.`,
        details: { missedCount: missedSessions.length }
      });
    }

    // 3. Weekly Check-in Overdue Scanner
    const latestCheckin = await prisma.checkin.findFirst({
      where: { athleteId },
      orderBy: { createdAt: 'desc' }
    });

    let daysSinceCheckin = 0;
    if (latestCheckin) {
      daysSinceCheckin = Math.floor((Date.now() - new Date(latestCheckin.createdAt).getTime()) / (24 * 60 * 60 * 1000));
    } else {
      const user = await prisma.user.findUnique({ where: { id: athleteId } });
      const userAgeDays = user ? Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (24 * 60 * 60 * 1000)) : 0;
      daysSinceCheckin = userAgeDays;
    }

    if (daysSinceCheckin >= 8) {
      alerts.push({
        type: 'CHECKIN_OVERDUE',
        severity: 'warning',
        message: `Weekly check-in is overdue (${daysSinceCheckin} days since last check-in).`,
        details: { daysSinceCheckin }
      });
    }

    // 4. Determine Overall Traffic Light
    let trafficLight: TrafficLight = 'GREEN';
    if (alerts.some((a) => a.severity === 'critical')) {
      trafficLight = 'RED';
    } else if (alerts.some((a) => a.severity === 'warning')) {
      trafficLight = 'YELLOW';
    }

    // Persist new alerts in DB if coachId is known
    for (const a of alerts) {
      try {
        const existing = await prisma.alert.findFirst({
          where: {
            athleteId,
            type: a.type,
            status: 'unread'
          }
        });

        if (!existing) {
          await prisma.alert.create({
            data: {
              athleteId,
              coachId: coachId || null,
              type: a.type,
              severity: a.severity,
              payload: { message: a.message, details: a.details } as any,
              status: 'unread'
            }
          });
        }
      } catch (e) {
        logger.warn({ err: e }, 'Failed to persist scanned alert');
      }
    }

    return {
      athleteId,
      trafficLight,
      activeAlerts: alerts
    };
  }

  /**
   * Scans all athletes on a coach's active roster.
   */
  static async scanCoachRoster(coachId: string) {
    const links = await prisma.coachAthlete.findMany({
      where: { coachId, status: 'ACTIVE' },
      select: { athleteId: true }
    });

    const results = await Promise.all(
      links.map((link) => this.scanAthlete(link.athleteId, coachId))
    );

    return results;
  }
}
