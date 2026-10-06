/**
 * apps/api/src/middleware/errorHandler.ts
 * Centralized typed error handler returning standard { code, message, details }.
 */

import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../lib/logger';

export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 400,
    public details?: any
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  const reqId = (req as any).id;

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      code: 'VALIDATION_ERROR',
      message: 'Request payload failed schema validation.',
      details: err.flatten().fieldErrors,
      requestId: reqId
    });
  }

  // Handle known AppErrors or errors with status / statusCode
  const statusCode = err instanceof AppError ? err.statusCode : (err.statusCode || err.status);
  if (statusCode && statusCode >= 400 && statusCode < 600) {
    return res.status(statusCode).json({
      code: err.code || (statusCode === 403 ? 'FORBIDDEN' : statusCode === 401 ? 'UNAUTHORIZED' : statusCode === 404 ? 'NOT_FOUND' : 'BAD_REQUEST'),
      message: err.message,
      details: err.details,
      requestId: reqId
    });
  }

  // Handle unhandled exceptions
  logger.error({ err, requestId: reqId }, 'Unhandled server error');

  return res.status(500).json({
    code: 'INTERNAL_SERVER_ERROR',
    message: process.env.NODE_ENV === 'production'
      ? 'An unexpected error occurred.'
      : err.message || 'Internal server error',
    requestId: reqId
  });
}
