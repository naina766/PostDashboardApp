import cors from "cors";

/**
 * Production-hardened CORS configuration
 * Restricts access to configured frontend origins in production while allowing local development.
 */
export function configureCors() {
  const isProduction = process.env.NODE_ENV === "production";
  const rawOrigins = process.env.CLIENT_URL || process.env.FRONTEND_URL || "http://localhost:5173";
  const allowedOrigins = rawOrigins
    .split(",")
    .map((o) => o.trim().replace(/\/$/, ""))
    .filter(Boolean);

  return cors({
    origin: (origin, callback) => {
      // Allow server-to-server or non-browser requests (e.g. Postman, health check pings, curl)
      if (!origin) {
        return callback(null, true);
      }

      // Check if incoming origin matches allowed list
      const isAllowed = allowedOrigins.some((allowed) => {
        return origin === allowed || (allowed.endsWith("*") && origin.startsWith(allowed.slice(0, -1)));
      });

      if (isAllowed) {
        return callback(null, true);
      }

      // In non-production, permit localhost origins
      if (!isProduction && /^http:\/\/localhost(:\d+)?$/.test(origin)) {
        return callback(null, true);
      }

      // Reject unauthorized origins
      const err = new Error(`CORS Error: Origin '${origin}' is not permitted by CORS policy.`);
      err.status = 403;
      return callback(err, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "x-request-id"],
    exposedHeaders: ["x-request-id"],
    maxAge: 86400, // Preflight cache for 24 hours
  });
}

export default configureCors;
