import rateLimit from "express-rate-limit";

const isTest = process.env.NODE_ENV === "test";

const createLimiter = (options) => {
  if (isTest) {
    // In automated testing environments, avoid throttling tests
    return (req, res, next) => next();
  }
  return rateLimit({
    standardHeaders: true,
    legacyHeaders: false,
    ...options,
  });
};

// 1. Global API Limiter
export const globalLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_GLOBAL_MAX || "1000", 10),
  message: {
    success: false,
    message: "Too many requests to the PostHub API. Please slow down.",
    error: { code: "RATE_LIMIT_EXCEEDED" },
  },
});

// 2. Authentication Limiter (Login, Register)
export const authLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_AUTH_MAX || "35", 10),
  message: {
    success: false,
    message: "Too many authentication attempts. Please try again after 15 minutes.",
    error: { code: "AUTH_RATE_LIMIT_EXCEEDED" },
  },
});

// 3. Content Creation Limiter (Post Creation)
export const contentLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_CONTENT_MAX || "40", 10),
  message: {
    success: false,
    message: "Post publishing rate limit reached. Please wait a few minutes before sharing more.",
    error: { code: "CONTENT_RATE_LIMIT_EXCEEDED" },
  },
});

// 4. Commenting Limiter
export const commentLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 80,
  message: {
    success: false,
    message: "Comment rate limit reached. Please wait a moment.",
    error: { code: "COMMENT_RATE_LIMIT_EXCEEDED" },
  },
});

// 5. Search Limiter
export const searchLimiter = createLimiter({
  windowMs: 60 * 1000,
  max: 120,
  message: {
    success: false,
    message: "Search query frequency exceeded. Please pause briefly.",
    error: { code: "SEARCH_RATE_LIMIT_EXCEEDED" },
  },
});

// 6. Moderation Report Limiter
export const reportLimiter = createLimiter({
  windowMs: 60 * 60 * 1000,
  max: 15,
  message: {
    success: false,
    message: "Report submission limit reached. Our moderation team is already reviewing your reports.",
    error: { code: "REPORT_RATE_LIMIT_EXCEEDED" },
  },
});
