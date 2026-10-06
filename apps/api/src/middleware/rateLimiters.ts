/**
 * apps/api/src/middleware/rateLimiters.ts
 * Tiered rate limiting middleware for high-concurrency resilience and DDoS defense.
 */

import rateLimit from 'express-rate-limit';

// Global API general traffic limiter (protects database & CPU from flooding)
export const apiGlobalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 600, // 600 requests per 15 min per IP (~40 req/min)
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skip: (req) => req.path === '/healthz' || req.path === '/readyz',
  message: {
    status: 429,
    code: 'RATE_LIMIT_EXCEEDED',
    error: 'Too many requests. Please slow down and try again shortly.'
  }
});

// Sensitive auth & token exchange rate limiter
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 30, // 30 auth requests per 15 min per IP
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    status: 429,
    code: 'AUTH_RATE_LIMIT_EXCEEDED',
    error: 'Too many authentication attempts. Please wait 15 minutes.'
  }
});

// Data export & account deletion limiter (prevents resource-intensive dump abuse)
export const exportRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 10, // 10 export/deletion requests per hour
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    status: 429,
    code: 'EXPORT_RATE_LIMIT_EXCEEDED',
    error: 'Data export rate limit reached. Maximum 10 exports allowed per hour.'
  }
});

// AI generation & assistant query limiter (protects LLM quota and downstream token cost)
export const aiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  limit: 30, // 30 requests per minute
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    status: 429,
    code: 'AI_RATE_LIMIT_EXCEEDED',
    error: 'AI query rate limit reached. Please wait a moment before sending more queries.'
  }
});
