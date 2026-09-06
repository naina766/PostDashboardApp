import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "path";

import connectDB from "./src/config/db.js";
import authRoutes from "./src/modules/auth/auth.routes.js";
import userRoutes from "./src/modules/users/user.routes.js";
import postRoutes from "./src/modules/posts/post.routes.js";
import exploreRoutes from "./src/modules/explore/explore.routes.js";
import notificationRoutes from "./src/modules/notifications/notification.routes.js";
import reportRoutes from "./src/modules/reports/report.routes.js";
import adminRoutes from "./src/modules/admin/admin.routes.js";
import analyticsRoutes from "./src/modules/analytics/analytics.routes.js";
import { errorHandler } from "./src/middlewares/error.middleware.js";

dotenv.config();
connectDB();

const app = express();
const __dirname = path.resolve();

// Security Headers
app.use(
  helmet({
    crossOriginResourcePolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

// CORS configuration
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

// Body Parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Rate Limiters
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: { success: false, message: "Too many requests from this IP, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: { success: false, message: "Too many authentication attempts, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api", generalLimiter);
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);

// Static uploads serving
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Health & Observability Endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "posthub-api",
    version: "2.0.0",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/explore", exploreRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/analytics", analyticsRoutes);

// Centralized Error Handling
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 PostHub 2.0 API Server running on port ${PORT}`);
});

export default app;
