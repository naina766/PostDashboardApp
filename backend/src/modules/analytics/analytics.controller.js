import * as AnalyticsService from "./analytics.service.js";
import sendResponse from "../../utils/sendResponse.js";

export const getCreatorAnalyticsController = async (req, res, next) => {
  try {
    const data = await AnalyticsService.getCreatorAnalytics(req.user._id);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Creator analytics fetched successfully",
      data,
    });
  } catch (err) {
    next(err);
  }
};
