/**
 * apps/api/src/lib/prisma.ts
 * Prisma Client singleton with connection pooling and transient error retry resilience.
 */

import { PrismaClient } from '@prisma/client';
import { env } from '../config/env';
import { logger } from './logger';

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
}

export const prisma =
  global.prismaGlobal ||
  new PrismaClient({
    log: env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error']
  });

if (env.NODE_ENV !== 'production') {
  global.prismaGlobal = prisma;
}

/**
 * Execute a database operation with exponential backoff on transient connection failures.
 * Handles Prisma connection pool exhaustion (P2024), deadlock, or momentary network resets.
 */
export async function withDbRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delayMs = 150
): Promise<T> {
  let attempt = 0;
  while (true) {
    try {
      return await operation();
    } catch (err: any) {
      attempt++;
      const isTransient =
        err?.code === 'P2024' || // Timed out fetching connection from pool
        err?.code === 'P2028' || // Transaction API error
        err?.code === 'P2034' || // Transaction conflict / deadlock
        err?.message?.includes('Connection closed') ||
        err?.message?.includes('ETIMEDOUT') ||
        err?.message?.includes('ECONNRESET');

      if (!isTransient || attempt >= maxRetries) {
        throw err;
      }

      const backoff = delayMs * Math.pow(2, attempt - 1);
      logger.warn(
        { attempt, maxRetries, code: err?.code, backoff },
        'Transient DB error encountered. Retrying operation...'
      );
      await new Promise((resolve) => setTimeout(resolve, backoff));
    }
  }
}
