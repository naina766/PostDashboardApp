import sendResponse from "../utils/sendResponse.js";
import ApiError from "../utils/ApiError.js";
import errorReporter from "../utils/ErrorReporter.js";
import multer from "multer";

export const errorHandler = (err, req, res, next) => {
  const isProduction = process.env.NODE_ENV === "production";

  if (err instanceof ApiError) {
    return sendResponse(res, {
      statusCode: err.statusCode,
      success: false,
      message: err.message,
      error: {
        code: err.code || `ERROR_${err.statusCode}`,
        message: err.message,
      },
    });
  }

  if (err instanceof multer.MulterError) {
    const msg = err.code === "LIMIT_FILE_SIZE" ? "Image size cannot exceed 5MB" : err.message;
    return sendResponse(res, {
      statusCode: 400,
      success: false,
      message: msg,
      error: { code: "UPLOAD_LIMIT_EXCEEDED", details: err.code },
    });
  }

  if (err.message && err.message.includes("image formats are supported")) {
    return sendResponse(res, {
      statusCode: 400,
      success: false,
      message: err.message,
      error: { code: "INVALID_FILE_FORMAT" },
    });
  }

  // Record unhandled 500 error in structured reporter
  errorReporter.captureException(err, { req });

  const clientMessage = isProduction
    ? "An unexpected internal error occurred. Please try again later."
    : err.message || "Internal Server Error";

  return sendResponse(res, {
    statusCode: 500,
    success: false,
    message: clientMessage,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      requestId: req.id,
    },
  });
};

