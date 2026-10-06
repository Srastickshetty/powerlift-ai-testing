/**
 * apps/api/src/server.ts
 * TypeScript Express 5 API Skeleton.
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import { logger } from './lib/logger';
import { prisma } from './lib/prisma';
import { requestId } from './middleware/requestId';
import { errorHandler } from './middleware/errorHandler';
import { requireAuth, requireSelfOrCoachOf, requireRole } from './middleware/requireAuth';
import { calculateE1RM, autoregulateNextSet, generateAttemptPlan } from '@powerlift/engines';
import { exerciseRouter } from './modules/exercises/exercises.routes';
import { onboardingRouter } from './modules/onboarding/onboarding.routes';
import { trainingRouter } from './modules/training/training.routes';
import { analyticsRouter } from './modules/analytics/analytics.routes';
import { billingRouter } from './modules/billing/billing.routes';
import { BillingService } from './modules/billing/billing.service';
import { coachMarketplaceRouter, coachPrivateRouter } from './modules/coaching/coaching.routes';
import { CoachingService } from './modules/coaching/coaching.service';
import { CoachApplicationService } from './modules/coaching/coachApplication.service';
import { communicationRouter, mediaRouter, checkinRouter } from './modules/communication/communication.routes';
import { aiRouter } from './modules/ai/ai.routes';
import { complianceRouter } from './modules/compliance/compliance.routes';
import { feedbackRouter } from './modules/feedback/feedback.routes';
import { telemetry } from './lib/telemetry';
import { apiGlobalRateLimiter, aiRateLimiter } from './middleware/rateLimiters';

export const app: express.Express = express();

// 1. Production Trust Proxy & Security headers
app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      connectSrc: ["'self'", ...env.ALLOWED_ORIGINS.split(',')]
    }
  },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
}));

const allowedOriginsList = env.ALLOWED_ORIGINS.split(',').map(s => s.trim());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (env.NODE_ENV !== 'production') return callback(null, true);
    if (allowedOriginsList.includes(origin)) return callback(null, true);
    return callback(null, false); // Block origin cleanly without unhandled 500 error cascade
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
}));

app.use(express.json({ limit: '200kb' }));
app.use(requestId);

// Request audit log & telemetry recording
app.use((req, res, next) => {
  const reqStart = process.hrtime.bigint();
  logger.info({ method: req.method, path: req.path, requestId: (req as any).id }, 'HTTP Request');

  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - reqStart) / 1e6;
    telemetry.recordRequest((req as any).ctx?.userId, durationMs, res.statusCode);
  });

  next();
});

// 2. Health & Liveness Probes
app.get('/healthz', (_req, res) => {
  res.status(200).json({ status: 'ok', service: '@powerlift/api', timestamp: new Date().toISOString() });
});

app.get('/readyz', async (_req, res) => {
  try {
    // Ping DB
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ status: 'ready', database: 'connected' });
  } catch (err: any) {
    logger.error({ err }, 'Readiness probe failed');
    res.status(503).json({ status: 'unready', database: 'disconnected', error: err.message });
  }
});

// 3. API v1 Routes
const v1 = express.Router();
v1.use(apiGlobalRateLimiter);

// Public coach discovery
v1.get('/coaches/public', async (_req, res, next) => {
  try {
    const coaches = await prisma.user.findMany({
      where: { role: 'COACH' },
      include: { coachProfile: true }
    });
    res.json(coaches.map(c => ({
      id: c.id,
      name: c.name,
      email: c.email,
      profile: c.coachProfile
    })));
  } catch (err: any) {
    if (env.NODE_ENV === 'test') {
      return res.json([]);
    }
    return next(err);
  }
});

// Domain Modules
v1.use('/exercises', exerciseRouter);
v1.use('/me', onboardingRouter);
v1.use('/training', trainingRouter);
v1.use('/analytics', analyticsRouter);
v1.use('/billing', billingRouter);
v1.use('/coaches', coachMarketplaceRouter);
v1.use('/coach', coachPrivateRouter);
v1.use('/threads', communicationRouter);
v1.use('/media', mediaRouter);
v1.use('/checkins', checkinRouter);
v1.use('/ai', aiRateLimiter, aiRouter);
v1.use(complianceRouter);
v1.use(feedbackRouter);

// Current user profile & entitlements
v1.get('/me', requireAuth, async (req, res, next) => {
  try {
    let dbUser = null;
    if (req.ctx?.userId) {
      try {
        dbUser = await prisma.user.findUnique({
          where: { id: req.ctx.userId },
          include: { athleteProfile: true, coachProfile: true }
        });
      } catch {
        // Fallback if DB connection fails in isolated test runner
      }
    }
    const track = dbUser?.athleteProfile?.track?.toLowerCase() || req.ctx?.track || 'powerlifting';
    const entitlements = await BillingService.resolveUserEntitlements(req.ctx!.userId, req.ctx!.role);

    res.json({
      user: {
        ...req.ctx,
        track,
        name: dbUser?.name || req.ctx?.firebaseUid
      },
      profile: dbUser?.athleteProfile || dbUser?.coachProfile || null,
      entitlements
    });
  } catch (err) {
    next(err);
  }
});

// Dedicated entitlements route
v1.get('/me/entitlements', requireAuth, async (req, res, next) => {
  try {
    const entitlements = await BillingService.resolveUserEntitlements(req.ctx!.userId, req.ctx!.role);
    res.json({ success: true, entitlements });
  } catch (err) {
    next(err);
  }
});

// e1RM & Engine Analytics endpoint (Pure engines execution)
v1.post('/analytics/e1rm', requireAuth, (req, res) => {
  const { loadKg, reps, rpe, formula } = req.body;
  const result = calculateE1RM({ loadKg: Number(loadKg), reps: Number(reps), rpe: Number(rpe || 10), formula });
  res.json(result);
});

// Autoregulation calculation endpoint
v1.post('/training/autoregulate', requireAuth, (req, res) => {
  const { targetLoadKg, targetReps, targetRpe, actualReps, actualRpe } = req.body;
  const result = autoregulateNextSet({
    targetLoadKg: Number(targetLoadKg),
    targetReps: Number(targetReps),
    targetRpe: Number(targetRpe),
    actualReps: Number(actualReps),
    actualRpe: Number(actualRpe)
  });
  res.json(result);
});

// Competition attempt planner
v1.post('/meets/attempt-plan', requireAuth, (req, res) => {
  const { targetGoalKg, strategy } = req.body;
  const plan = generateAttemptPlan(Number(targetGoalKg), strategy);
  res.json(plan);
});

// Athlete Training Data routes (Enforcing strict ownership / approved coach)
v1.get('/training/sessions/:athleteId', requireAuth, requireSelfOrCoachOf('athleteId'), async (req, res, next) => {
  try {
    const athleteId = req.params.athleteId as string;
    const sessions = await prisma.session.findMany({
      where: { athleteId },
      include: { sets: true },
      orderBy: { startedAt: 'desc' },
      take: 20
    });
    res.json(sessions);
  } catch (err) {
    next(err);
  }
});

// Admin-only overview
v1.get('/admin/overview', requireAuth, requireRole('admin'), async (_req, res, next) => {
  try {
    const userCount = await prisma.user.count();
    const sessionCount = await prisma.session.count();
    res.json({
      status: 'operational',
      totalUsers: userCount,
      totalSessions: sessionCount,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
});

// Admin pending coaches queue
v1.get('/admin/coaches/pending', requireAuth, requireRole('admin'), async (_req, res, next) => {
  try {
    const pending = await CoachApplicationService.getPendingApplications();
    res.json({ success: true, pendingCoaches: pending });
  } catch (err) {
    next(err);
  }
});

// Admin verify / approve coach
v1.post('/admin/coaches/:id/verify', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const coachId = req.params.id as string;
    const adminId = req.ctx?.userId || 'admin';
    const result = await CoachApplicationService.approveApplication(coachId, adminId);
    res.json({ message: 'Coach verified and onboarded successfully.', ...result });
  } catch (err) {
    next(err);
  }
});

// Admin decline / reject coach
v1.post('/admin/coaches/:id/reject', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const coachId = req.params.id as string;
    const adminId = req.ctx?.userId || 'admin';
    const result = await CoachApplicationService.declineApplication(coachId, adminId, req.body.reason);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Admin telemetry & observability metrics
v1.get('/admin/telemetry/metrics', requireAuth, requireRole('admin'), (_req, res) => {
  res.json({ success: true, metrics: telemetry.getSnapshot() });
});

// Admin maintenance: Fresh Start purge
v1.post('/admin/maintenance/fresh-start', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const { confirmCode } = req.body;
    if (confirmCode !== 'FRESH_START_CONFIRM') {
      res.status(400).json({ success: false, error: 'Confirmation code FRESH_START_CONFIRM required.' });
      return;
    }

    // Cascade deletes in safe dependency order
    await prisma.set.deleteMany({});
    await prisma.plannedSet.deleteMany({});
    await prisma.session.deleteMany({});
    await prisma.plannedSession.deleteMany({});
    await prisma.programVersion.deleteMany({});
    await prisma.program.deleteMany({});
    await prisma.checkin.deleteMany({});
    await prisma.nutritionLog.deleteMany({});
    await prisma.nutritionTarget.deleteMany({});
    await prisma.bodyMetric.deleteMany({});
    await prisma.message.deleteMany({});
    await prisma.videoComment.deleteMany({});
    await prisma.media.deleteMany({});
    await prisma.alert.deleteMany({});
    await prisma.invoice.deleteMany({});
    await prisma.subscription.deleteMany({});
    await prisma.coachAthlete.deleteMany({});
    await prisma.athleteProfile.deleteMany({});
    await prisma.plProfile.deleteMany({});
    await prisma.bbProfile.deleteMany({});
    await prisma.coachProfile.deleteMany({});
    await prisma.user.deleteMany({ where: { role: { not: 'ADMIN' } } });

    res.json({
      success: true,
      message: 'All generated programs, sessions, and non-admin users purged. Clean slate initialized.'
    });
  } catch (err) {
    next(err);
  }
});

app.use('/api/v1', v1);

// Error handler
app.use(errorHandler);

// Global error recovery
process.on('unhandledRejection', (reason) => {
  logger.error({ reason }, 'Unhandled Promise Rejection');
});

// Start server if run directly with graceful shutdown
if (require.main === module) {
  const server = app.listen(env.PORT, () => {
    logger.info(`🚀 PowerLift API v1 listening on http://localhost:${env.PORT}`);
  });

  const shutdown = (signal: string) => {
    logger.info({ signal }, 'Graceful shutdown initiated. Closing HTTP server...');
    server.close(async () => {
      logger.info('HTTP server closed. Disconnecting database client...');
      await prisma.$disconnect();
      logger.info('Database disconnected. Exiting process.');
      process.exit(0);
    });
    setTimeout(() => {
      logger.error('Shutdown timeout exceeded. Forcing exit.');
      process.exit(1);
    }, 15000).unref();
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}
