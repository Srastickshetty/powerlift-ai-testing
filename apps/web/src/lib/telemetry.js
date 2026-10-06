/**
 * apps/web/src/lib/telemetry.js
 * Client-side monitoring, Sentry stub, and error tracking for Phase P8.
 */

class WebTelemetry {
  constructor() {
    this.initialized = false;
    this.dsn = null;
  }

  init(dsn = null) {
    this.dsn = dsn;
    this.initialized = true;
    if (dsn) {
      // In production, integrate Sentry browser SDK
      console.info('[Telemetry] Sentry client initialized');
    }

    // Global uncaught error listener
    if (typeof window !== 'undefined') {
      window.addEventListener('error', (event) => {
        this.captureException(event.error || new Error(event.message), {
          source: 'window.onerror',
          lineno: event.lineno,
          colno: event.colno
        });
      });

      window.addEventListener('unhandledrejection', (event) => {
        this.captureException(event.reason || new Error('Unhandled Promise Rejection'), {
          source: 'unhandledrejection'
        });
      });
    }
  }

  captureException(err, context = {}) {
    if (import.meta.env?.DEV) {
      console.warn('[Telemetry.captureException]', err, context);
    }
    // Stub forward to remote logging if configured
  }

  captureMessage(message, level = 'info', context = {}) {
    if (import.meta.env?.DEV) {
      console.info(`[Telemetry.${level}]`, message, context);
    }
  }
}

export const webTelemetry = new WebTelemetry();
