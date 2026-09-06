import * as AdminService from "./admin.service.js";
import sendResponse from "../../utils/sendResponse.js";

export const getDashboardStatsController = async (req, res, next) => {
  try {
    const stats = await AdminService.getDashboardStats();
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Admin statistics fetched",
      data: stats,
    });
  } catch (err) {
    next(err);
  }
};

export const getUsersController = async (req, res, next) => {
  try {
    const { page, limit, search, role } = req.query;
    const result = await AdminService.getUsers({ page, limit, search, role });
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Users fetched",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const toggleUserSuspensionController = async (req, res, next) => {
  try {
    const ip = req.ip || req.connection.remoteAddress || "";
    const result = await AdminService.toggleUserSuspension(req.params.id, req.user, ip);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: result.message,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const updateUserRoleController = async (req, res, next) => {
  try {
    const ip = req.ip || req.connection.remoteAddress || "";
    const { role } = req.body;
    const user = await AdminService.updateUserRole(req.params.id, role, req.user, ip);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "User role updated successfully",
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

export const adminDeletePostController = async (req, res, next) => {
  try {
    const ip = req.ip || req.connection.remoteAddress || "";
    const result = await AdminService.adminDeletePost(req.params.id, req.user, ip);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Post removed by admin",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const getAuditLogsController = async (req, res, next) => {
  try {
    const { page, limit, action } = req.query;
    const result = await AdminService.getAuditLogs({ page, limit, action });
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Audit logs fetched",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};
