/**
 * apps/api/src/lib/telemetry.ts
 * Telemetry, Sentry instrumentation stub, and in-memory observability metrics for Phase P8.
 */

import { logger } from './logger';

export interface LatencyMetric {
  path: string;
  durationMs: number;
  statusCode: number;
  timestamp: number;
}

class TelemetryCollector {
  private startTime: number = Date.now();
  private requestCount: number = 0;
  private errorCount: number = 0;
  private latencies: number[] = [];
  private activeUsers: Set<string> = new Set();
  private aiTotalEvents: number = 0;
  private aiTotalTokens: number = 0;
  private aiCostUsd: number = 0;

  // Record an incoming/completed request
  recordRequest(userId: string | undefined, durationMs: number, statusCode: number) {
    this.requestCount++;
    this.latencies.push(durationMs);
    // Keep sliding window of latest 2,000 latencies to avoid memory leak
    if (this.latencies.length > 2000) {
      this.latencies.shift();
    }

    if (statusCode >= 400) {
      this.errorCount++;
    }

    if (userId) {
      this.activeUsers.add(userId);
    }
  }

  // Record an AI generation event
  recordAiUsage(tokens: number, costEstimateUsd: number = 0.0005) {
    this.aiTotalEvents++;
    this.aiTotalTokens += tokens;
    this.aiCostUsd += costEstimateUsd;
  }

  // Get current operational metrics snapshot
  getSnapshot() {
    const uptimeSeconds = Math.floor((Date.now() - this.startTime) / 1000);
    const sorted = [...this.latencies].sort((a, b) => a - b);
    const count = sorted.length;

    const p50 = count ? sorted[Math.floor(count * 0.50)] : 0;
    const p90 = count ? sorted[Math.floor(count * 0.90)] : 0;
    const p95 = count ? sorted[Math.floor(count * 0.95)] : 0;
    const p99 = count ? sorted[Math.floor(count * 0.99)] : 0;

    const errorRate = this.requestCount > 0 ? (this.errorCount / this.requestCount) * 100 : 0;
    const isDegraded = p95 > 500 || errorRate > 5.0;

    return {
      status: isDegraded ? 'DEGRADED' : 'HEALTHY',
      uptimeSeconds,
      requests: {
        total: this.requestCount,
        errors: this.errorCount,
        errorRatePct: Number(errorRate.toFixed(2))
      },
      latencyMs: {
        p50: Number(p50.toFixed(1)),
        p90: Number(p90.toFixed(1)),
        p95: Number(p95.toFixed(1)),
        p99: Number(p99.toFixed(1))
      },
      aiUsage: {
        totalEvents: this.aiTotalEvents,
        totalTokens: this.aiTotalTokens,
        estimatedCostUsd: Number(this.aiCostUsd.toFixed(4))
      },
      activeUsersCount: this.activeUsers.size,
      timestamp: new Date().toISOString()
    };
  }

  // Reset counters (e.g. for testing)
  reset() {
    this.startTime = Date.now();
    this.requestCount = 0;
    this.errorCount = 0;
    this.latencies = [];
    this.activeUsers.clear();
    this.aiTotalEvents = 0;
    this.aiTotalTokens = 0;
    this.aiCostUsd = 0;
  }
}

export const telemetry = new TelemetryCollector();

// Sentry Monitoring Stub
export const sentry = {
  init: (dsn?: string) => {
    if (dsn) {
      logger.info({ dsn: dsn.replace(/:\/\/.*@/, '://[REDACTED]@') }, 'Sentry instrumentation initialized');
    } else {
      logger.debug('Sentry stub active (no SENTRY_DSN provided)');
    }
  },
  captureException: (err: any, context?: Record<string, any>) => {
    logger.error({ err, context }, '[Sentry.captureException]');
  },
  captureMessage: (message: string, level: 'info' | 'warning' | 'error' = 'info', context?: Record<string, any>) => {
    logger.info({ message, level, context }, '[Sentry.captureMessage]');
  }
};
