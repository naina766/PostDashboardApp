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
    const result = await AdminService.toggleUserSuspension(req.params.id);
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
    const { role } = req.body;
    const user = await AdminService.updateUserRole(req.params.id, role);
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
    const result = await AdminService.adminDeletePost(req.params.id, req.user);
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
