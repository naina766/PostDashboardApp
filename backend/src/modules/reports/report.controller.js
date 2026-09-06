import * as ReportService from "./report.service.js";
import sendResponse from "../../utils/sendResponse.js";

export const createReportController = async (req, res, next) => {
  try {
    const report = await ReportService.createReport(req.user._id, req.body);

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Report submitted successfully. Our team will review it.",
      data: report,
    });
  } catch (err) {
    next(err);
  }
};

export const getReportsController = async (req, res, next) => {
  try {
    const { page, limit, status } = req.query;
    const result = await ReportService.getReports({ page, limit, status });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Reports fetched successfully",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const updateReportStatusController = async (req, res, next) => {
  try {
    const { status } = req.body;
    const report = await ReportService.updateReportStatus(req.params.id, status);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Report status updated",
      data: report,
    });
  } catch (err) {
    next(err);
  }
};
