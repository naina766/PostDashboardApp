/**
 * ErrorReporter Abstraction
 * Centralizes error reporting and telemetry across the PostHub backend.
 * Provides a drop-in integration point for Sentry, Datadog, or OpenTelemetry in future phases.
 */

class ErrorReporter {
  constructor() {
    this.serviceName = "posthub-api";
    this.environment = process.env.NODE_ENV || "development";
  }

  /**
   * Capture an exception with contextual request telemetry
   * @param {Error} error - The caught Error or ApiError instance
   * @param {Object} context - Contextual request details (reqId, userId, route, ip)
   */
  captureException(error, context = {}) {
    const errorPayload = {
      timestamp: new Date().toISOString(),
      service: this.serviceName,
      environment: this.environment,
      error: {
        name: error.name || "Error",
        message: error.message,
        statusCode: error.statusCode || 500,
        stack: this.environment === "development" ? error.stack : undefined,
      },
      context: {
        requestId: context.requestId || context.req?.id || "unknown",
        userId: context.userId || context.req?.user?._id || "anonymous",
        method: context.method || context.req?.method,
        url: context.url || context.req?.originalUrl,
        ip: context.ip || context.req?.ip,
      },
    };

    // Log structured error for stdout aggregators (CloudWatch, Render, Datadog Agent)
    console.error("[ERROR_REPORTER]", JSON.stringify(errorPayload));

    // Future extension point:
    // if (process.env.SENTRY_DSN) {
    //   Sentry.captureException(error, { extra: context });
    // }
  }

  /**
   * Log an operational warning or non-fatal anomaly
   */
  captureMessage(message, level = "warn", context = {}) {
    const payload = {
      timestamp: new Date().toISOString(),
      service: this.serviceName,
      level,
      message,
      context,
    };
    console.warn(`[REPORTER_${level.toUpperCase()}]`, JSON.stringify(payload));
  }
}

export const errorReporter = new ErrorReporter();
export default errorReporter;
