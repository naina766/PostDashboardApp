import mongoose from "mongoose";
import User from "../auth/auth.model.js";
import Post from "../posts/post.model.js";
import Report from "../reports/report.model.js";
import * as PostService from "../posts/post.service.js";
import ApiError from "../../utils/ApiError.js";

export const getDashboardStats = async () => {
  const [totalUsers, totalPosts, totalReports, pendingReports] = await Promise.all([
    User.countDocuments(),
    Post.countDocuments(),
    Report.countDocuments(),
    Report.countDocuments({ status: "PENDING" }),
  ]);

  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const postsLast24h = await Post.countDocuments({ createdAt: { $gte: oneDayAgo } });
  const usersLast24h = await User.countDocuments({ createdAt: { $gte: oneDayAgo } });

  return {
    totalUsers,
    totalPosts,
    totalReports,
    pendingReports,
    postsLast24h,
    usersLast24h,
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

export const toggleUserSuspension = async (userId) => {
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

  return {
    userId: user._id,
    isSuspended: user.isSuspended,
    message: user.isSuspended ? "User account suspended" : "User account restored",
  };
};

export const updateUserRole = async (userId, role) => {
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
  return user;
};

export const adminDeletePost = async (postId, adminUser) => {
  return await PostService.deletePost(postId, adminUser._id, adminUser.role);
};
