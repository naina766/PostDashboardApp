import sendResponse from "../utils/sendResponse.js";
import ApiError from "../utils/ApiError.js";
import multer from "multer";

export const errorHandler = (err, req, res, next) => {
  if (err instanceof ApiError) {
    return sendResponse(res, {
      statusCode: err.statusCode,
      success: false,
      message: err.message,
    });
  }

  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return sendResponse(res, {
        statusCode: 400,
        success: false,
        message: "Image size cannot exceed 5MB",
      });
    }
    return sendResponse(res, {
      statusCode: 400,
      success: false,
      message: err.message,
    });
  }

  if (err.message && err.message.includes("image formats are supported")) {
    return sendResponse(res, {
      statusCode: 400,
      success: false,
      message: err.message,
    });
  }

  console.error(err);
  return sendResponse(res, {
    statusCode: 500,
    success: false,
    message: err.message || "Internal Server Error",
  });
};

