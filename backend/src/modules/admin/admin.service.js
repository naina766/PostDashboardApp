import mongoose from "mongoose";
import User from "../auth/auth.model.js";
import Post from "../posts/post.model.js";
import Report from "../reports/report.model.js";
import AuditLog from "./auditLog.model.js";
import * as PostService from "../posts/post.service.js";
import ApiError from "../../utils/ApiError.js";

export const getDashboardStats = async () => {
  const [totalUsers, totalPosts, totalReports, pendingReports] = await Promise.all([
    User.countDocuments(),
    Post.countDocuments({ isDeleted: false }),
    Report.countDocuments(),
    Report.countDocuments({ status: "PENDING" }),
  ]);

  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const postsLast24h = await Post.countDocuments({ createdAt: { $gte: oneDayAgo }, isDeleted: false });
  const usersLast24h = await User.countDocuments({ createdAt: { $gte: oneDayAgo } });
  const suspendedUsers = await User.countDocuments({ isSuspended: true });

  return {
    totalUsers,
    totalPosts,
    totalReports,
    pendingReports,
    postsLast24h,
    usersLast24h,
    suspendedUsers,
  };
};

export const getUsers = async ({ page = 1, limit = 20, search = "", role = "" } = {}) => {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (pageNum - 1) * limitNum;

  const filter = {};
  if (search && search.trim()) {
    const regex = new RegExp(search.trim(), "i");
    filter.$or = [{ name: regex }, { username: regex }, { email: regex }];
  }
  if (role) {
    filter.role = role;
  }

  const total = await User.countDocuments(filter);
  const users = await User.find(filter)
    .select("-password")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum)
    .lean();

  return {
    users,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
      hasNextPage: pageNum * limitNum < total,
    },
  };
};

export const toggleUserSuspension = async (userId, adminUser, ipAddress = "") => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "Invalid User ID");
  }

  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, "User not found");

  if (user.role === "admin") {
    throw new ApiError(403, "Cannot suspend an administrator account");
  }

  user.isSuspended = !user.isSuspended;
  await user.save();

  // Audit trail
  await AuditLog.create({
    actor: adminUser._id,
    action: user.isSuspended ? "USER_SUSPENDED" : "USER_RESTORED",
    targetType: "USER",
    targetId: user._id,
    details: user.isSuspended ? "Account suspended for policy violation" : "Account access restored",
    ipAddress,
  });

  return {
    userId: user._id,
    isSuspended: user.isSuspended,
    message: user.isSuspended ? "User account suspended" : "User account restored",
  };
};

export const updateUserRole = async (userId, role, adminUser, ipAddress = "") => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "Invalid User ID");
  }

  const validRoles = ["user", "moderator", "admin"];
  if (!validRoles.includes(role)) {
    throw new ApiError(400, "Invalid role");
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { role },
    { new: true }
  ).select("-password");

  if (!user) throw new ApiError(404, "User not found");

  // Audit trail
  await AuditLog.create({
    actor: adminUser._id,
    action: "USER_ROLE_CHANGE",
    targetType: "USER",
    targetId: user._id,
    details: `Role updated to ${role}`,
    ipAddress,
  });

  return user;
};

export const adminDeletePost = async (postId, adminUser, ipAddress = "") => {
  const result = await PostService.deletePost(postId, adminUser._id, adminUser.role);

  // Audit trail
  await AuditLog.create({
    actor: adminUser._id,
    action: "CONTENT_REMOVED",
    targetType: "POST",
    targetId: postId,
    details: "Post removed during administrative moderation",
    ipAddress,
  });

  return result;
};

export const getAuditLogs = async ({ page = 1, limit = 20, action = "" } = {}) => {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (pageNum - 1) * limitNum;

  const filter = {};
  if (action) filter.action = action;

  const total = await AuditLog.countDocuments(filter);
  const logs = await AuditLog.find(filter)
    .populate("actor", "name username role")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum)
    .lean();

  return {
    logs,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
      hasNextPage: pageNum * limitNum < total,
    },
  };
};
