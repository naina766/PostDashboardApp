import sendResponse from "../utils/sendResponse.js";
import ApiError from "../utils/ApiError.js";

export const errorHandler = (err, req, res, next) => {
  if (err instanceof ApiError) {
    return sendResponse(res, {
      statusCode: err.statusCode,
      success: false,
      message: err.message,
    });
  }

  console.error(err);
  return sendResponse(res, {
    statusCode: 500,
    success: false,
    message: "Internal Server Error",
  });
};
