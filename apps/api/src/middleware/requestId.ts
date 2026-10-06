/**
 * apps/api/src/middleware/requestId.ts
 * Attaches unique request ID to incoming requests.
 */

import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

export function requestId(req: Request, res: Response, next: NextFunction) {
  const existingId = req.headers['x-request-id'] as string;
  const id = existingId || randomUUID();
  (req as any).id = id;
  res.setHeader('x-request-id', id);
  next();
}
