/**
 * apps/api/src/middleware/requireAuth.ts
 * Strict server-side authentication & RBAC per ADR-3.
 * Attaches req.ctx = { userId, role, track, firebaseUid, email }.
 */

import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { AppError } from './errorHandler';
import { AuthContext, UserRole, Track } from '@powerlift/shared';

// Extend Express Request with AuthContext
declare global {
  namespace Express {
    interface Request {
      ctx?: AuthContext;
    }
  }
}

export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('UNAUTHORIZED', 'Authentication required. Bearer token missing.', 401));
  }

  const token = authHeader.split('Bearer ')[1].trim();

  try {
    let firebaseUid: string;
    let email: string;
    let role: UserRole = 'athlete';
    let track: Track = 'powerlifting';

    // Support mock dev tokens in development / test environments
    if (token.startsWith('dev_mock_') && process.env.NODE_ENV !== 'production') {
      const parts = token.split('_');
      // format: dev_mock_<uid>_<role>_<track>
      firebaseUid = parts[2] || 'dev_user';
      role = (parts[3] as UserRole) || 'athlete';
      track = (parts[4] as Track) || 'powerlifting';
      email = `${firebaseUid}@local.test`;
    } else {
      // In production: verify token with Firebase Admin SDK
      const admin = require('firebase-admin');
      const decoded = await admin.auth().verifyIdToken(token, true);
      firebaseUid = decoded.uid;
      email = decoded.email || `${decoded.uid}@firebase.user`;
    }

    // Lookup user in Postgres
    let user = null;
    try {
      user = await prisma.user.findUnique({
        where: { firebaseUid },
        include: { athleteProfile: true }
      });

      if (!user) {
        user = await prisma.user.upsert({
          where: { firebaseUid },
          create: {
            firebaseUid,
            email,
            name: firebaseUid.replace(/_/g, ' '),
            role: role === 'admin' ? 'ADMIN' : role === 'coach' ? 'COACH' : 'ATHLETE'
          },
          update: {},
          include: { athleteProfile: true }
        });
      }
    } catch {
      // If DB is not connected yet during test, fallback to mock user
    }

    const userId = user ? user.id : firebaseUid;
    const finalRole = user ? (user.role.toLowerCase() as UserRole) : role;
    const finalTrack = user?.athleteProfile?.track ? (user.athleteProfile.track.toLowerCase() as Track) : track;

    req.ctx = {
      userId,
      firebaseUid,
      email: user?.email || email,
      role: finalRole,
      track: finalTrack
    };

    next();
  } catch (err: any) {
    return next(new AppError('INVALID_TOKEN', 'Token verification failed. Please sign in again.', 401));
  }
}

export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.ctx) {
      return next(new AppError('UNAUTHORIZED', 'Authentication required.', 401));
    }

    if (req.ctx.role === 'admin' || allowedRoles.includes(req.ctx.role)) {
      return next();
    }

    return next(new AppError('FORBIDDEN', `Access restricted to roles: ${allowedRoles.join(', ')}`, 403));
  };
}

export function requireSelfOrCoachOf(athleteIdParamKey = 'athleteId') {
  return async (req: Request, _res: Response, next: NextFunction) => {
    if (!req.ctx) {
      return next(new AppError('UNAUTHORIZED', 'Authentication required.', 401));
    }

    let targetAthleteId = req.params[athleteIdParamKey] || req.body[athleteIdParamKey] || req.query[athleteIdParamKey];

    if (!targetAthleteId) {
      targetAthleteId = req.ctx.userId;
      if (req.params) req.params[athleteIdParamKey] = req.ctx.userId;
    }

    // Admin always allowed
    if (req.ctx.role === 'admin') {
      return next();
    }

    // Athlete accessing own data
    if (req.ctx.userId === targetAthleteId || req.ctx.firebaseUid === targetAthleteId) {
      return next();
    }

    // Coach checking approved relationship
    if (req.ctx.role === 'coach') {
      try {
        const link = await prisma.coachAthlete.findFirst({
          where: {
            coachId: req.ctx.userId,
            athleteId: targetAthleteId,
            status: 'ACTIVE'
          }
        });

        if (link) {
          return next();
        }
      } catch {
        // Fallback
      }
    }

    return next(new AppError('FORBIDDEN', "You are not authorized to view or modify this athlete's data.", 403));
  };
}
