import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import path from "path";
import mongoose from "mongoose";

import validateEnvironment from "./src/config/env.validator.js";
import connectDB, { closeDB } from "./src/config/db.js";
import configureCors from "./src/middlewares/cors.middleware.js";
import requestLogger from "./src/middlewares/logging.middleware.js";
import { globalLimiter, authLimiter } from "./src/middlewares/rateLimiter.js";
import authRoutes from "./src/modules/auth/auth.routes.js";
import userRoutes from "./src/modules/users/user.routes.js";
import postRoutes from "./src/modules/posts/post.routes.js";
import exploreRoutes from "./src/modules/explore/explore.routes.js";
import notificationRoutes from "./src/modules/notifications/notification.routes.js";
import reportRoutes from "./src/modules/reports/report.routes.js";
import adminRoutes from "./src/modules/admin/admin.routes.js";
import analyticsRoutes from "./src/modules/analytics/analytics.routes.js";
import { errorHandler } from "./src/middlewares/error.middleware.js";

// 1. Initialize environment & validate required variables
dotenv.config();
validateEnvironment();

// 2. Connect Database
connectDB();

const app = express();
const __dirname = path.resolve();

// 3. Security Headers (Helmet)
app.use(
  helmet({
    crossOriginResourcePolicy: false,
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: false, // Managed via CDN/Vercel reverse proxy for SPA
  })
);

// 4. Production-Hardened CORS
app.use(configureCors());

// 5. Request Correlation ID & Telemetry Logger
app.use(requestLogger);

// 6. Body Parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// 7. Rate Limiters
app.use("/api", globalLimiter);
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);

// 8. Static uploads serving
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// 9. Liveness & Observability Endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "posthub-api",
    version: "4.0.0",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    memoryUsageMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
  });
});

// 10. Readiness Endpoint (Verifies MongoDB connection state)
app.get("/api/ready", (req, res) => {
  const isDbReady = mongoose.connection.readyState === 1;

  if (isDbReady) {
    return res.status(200).json({
      status: "ready",
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  }

  return res.status(503).json({
    status: "not_ready",
    database: "disconnected",
    timestamp: new Date().toISOString(),
  });
});

// 11. API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/explore", exploreRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/analytics", analyticsRoutes);

// 12. Centralized Error Handling
app.use(errorHandler);

const PORT = parseInt(process.env.PORT || "5000", 10);
const HOST = "0.0.0.0"; // Bind to all interfaces for Docker & Render compatibility

const server = app.listen(PORT, HOST, () => {
  console.log(`🚀 PostHub 4.0 API Server running on http://${HOST}:${PORT} [${process.env.NODE_ENV || "development"}]`);
});

// 13. Graceful Shutdown Handler
const gracefulShutdown = async (signal) => {
  console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);
  
  server.close(async () => {
    console.log("🔒 HTTP server closed. Draining database connections...");
    await closeDB();
    console.log("👋 Process terminated cleanly.\n");
    process.exit(0);
  });

  // Force shutdown after 10 seconds if connections fail to drain
  setTimeout(() => {
    console.error("⚠️  Forceful shutdown initiated after timeout.");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

export { server };
export default app;
