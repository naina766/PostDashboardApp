import crypto from "crypto";

/**
 * Structured request logging and correlation ID middleware
 * Attaches 'x-request-id' to incoming requests and logs execution time and status.
 */
export function requestLogger(req, res, next) {
  // Generate or forward correlation ID
  const requestId = req.headers["x-request-id"] || crypto.randomUUID();
  req.id = requestId;
  res.setHeader("x-request-id", requestId);

  const start = process.hrtime();

  res.on("finish", () => {
    // Skip logging static files or health pings during high frequency monitoring
    if (req.originalUrl === "/api/health" || req.originalUrl.startsWith("/uploads/")) {
      return;
    }

    const diff = process.hrtime(start);
    const timeInMs = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2);

    const logEntry = {
      timestamp: new Date().toISOString(),
      requestId,
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      durationMs: `${timeInMs}ms`,
      ip: req.ip || req.headers["x-forwarded-for"] || "127.0.0.1",
      userAgent: req.headers["user-agent"] ? req.headers["user-agent"].slice(0, 100) : "unknown",
    };

    // Color code / format appropriately based on status
    if (res.statusCode >= 500) {
      console.error(`[ERROR] ${logEntry.method} ${logEntry.url} ${logEntry.status} - ${logEntry.durationMs} (reqId: ${requestId})`);
    } else if (res.statusCode >= 400) {
      console.warn(`[WARN]  ${logEntry.method} ${logEntry.url} ${logEntry.status} - ${logEntry.durationMs} (reqId: ${requestId})`);
    } else {
      console.log(`[INFO]  ${logEntry.method} ${logEntry.url} ${logEntry.status} - ${logEntry.durationMs}`);
    }
  });

  next();
}

export default requestLogger;
