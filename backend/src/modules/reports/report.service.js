import mongoose from "mongoose";
import Report from "./report.model.js";
import Post from "../posts/post.model.js";
import User from "../auth/auth.model.js";
import ApiError from "../../utils/ApiError.js";

export const createReport = async (reporterId, { targetType, targetId, reason, details }) => {
  if (!targetType || !targetId || !reason) {
    throw new ApiError(400, "Target type, target ID, and reason are required");
  }

  if (!mongoose.Types.ObjectId.isValid(targetId)) {
    throw new ApiError(400, "Invalid target ID");
  }

  const validReasons = ["SPAM", "HARASSMENT", "HATE", "VIOLENCE", "SEXUAL", "MISLEADING", "OTHER"];
  if (!validReasons.includes(reason.toUpperCase())) {
    throw new ApiError(400, "Invalid report reason");
  }

  const report = await Report.create({
    reporter: reporterId,
    targetType: targetType.toUpperCase(),
    targetId,
    reason: reason.toUpperCase(),
    details: details ? details.trim() : "",
  });

  return report;
};

export const getReports = async ({ page = 1, limit = 20, status = "PENDING" } = {}) => {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (pageNum - 1) * limitNum;

  const filter = {};
  if (status && status !== "ALL") {
    filter.status = status.toUpperCase();
  }

  const total = await Report.countDocuments(filter);
  const reports = await Report.find(filter)
    .populate("reporter", "name username avatar")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum)
    .lean();

  return {
    reports,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
      hasNextPage: pageNum * limitNum < total,
    },
  };
};

export const updateReportStatus = async (reportId, status) => {
  if (!mongoose.Types.ObjectId.isValid(reportId)) {
    throw new ApiError(400, "Invalid Report ID");
  }

  const validStatuses = ["PENDING", "RESOLVED", "DISMISSED"];
  if (!validStatuses.includes(status.toUpperCase())) {
    throw new ApiError(400, "Invalid report status");
  }

  const report = await Report.findByIdAndUpdate(
    reportId,
    { status: status.toUpperCase() },
    { new: true }
  );

  if (!report) throw new ApiError(404, "Report not found");
  return report;
};
