import mongoose from "mongoose";
import User from "../auth/auth.model.js";
import Follow from "./follow.model.js";
import Notification from "../notifications/notification.model.js";
import ApiError from "../../utils/ApiError.js";

export const getProfileByUsername = async (username, currentUserId = null) => {
  const user = await User.findOne({ username: username.toLowerCase().trim() })
    .select("-password")
    .lean();

  if (!user) throw new ApiError(404, "User not found");

  let isFollowing = false;
  if (currentUserId && currentUserId.toString() !== user._id.toString()) {
    isFollowing = Boolean(
      await Follow.exists({
        follower: currentUserId,
        following: user._id,
      })
    );
  }

  return {
    ...user,
    isFollowing,
  };
};

export const updateProfile = async (userId, data) => {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, "User not found");

  if (data.name && data.name.trim()) user.name = data.name.trim();
  if (data.bio !== undefined) user.bio = data.bio.trim().slice(0, 300);
  if (data.location !== undefined) user.location = data.location.trim();
  if (data.website !== undefined) user.website = data.website.trim();
  if (Array.isArray(data.skills)) {
    user.skills = data.skills.map((s) => String(s).trim()).filter(Boolean);
  }
  if (data.socialLinks && typeof data.socialLinks === "object") {
    user.socialLinks = {
      github: data.socialLinks.github?.trim() || "",
      twitter: data.socialLinks.twitter?.trim() || "",
      linkedin: data.socialLinks.linkedin?.trim() || "",
    };
  }

  await user.save();

  const userObj = user.toObject();
  delete userObj.password;
  return userObj;
};

export const updateAvatar = async (userId, avatarUrl) => {
  if (!avatarUrl) throw new ApiError(400, "Avatar image required");
  const user = await User.findByIdAndUpdate(
    userId,
    { avatar: avatarUrl },
    { new: true }
  ).select("-password");

  if (!user) throw new ApiError(404, "User not found");
  return user;
};

export const updateCover = async (userId, coverUrl) => {
  if (!coverUrl) throw new ApiError(400, "Cover image required");
  const user = await User.findByIdAndUpdate(
    userId,
    { coverImage: coverUrl },
    { new: true }
  ).select("-password");

  if (!user) throw new ApiError(404, "User not found");
  return user;
};

export const followUser = async (currentUserId, targetId) => {
  if (!mongoose.Types.ObjectId.isValid(targetId)) {
    throw new ApiError(400, "Invalid user ID");
  }

  if (currentUserId.toString() === targetId.toString()) {
    throw new ApiError(400, "You cannot follow yourself");
  }

  const targetUser = await User.findById(targetId);
  if (!targetUser) throw new ApiError(404, "Target user not found");

  const existingFollow = await Follow.findOne({
    follower: currentUserId,
    following: targetId,
  });

  if (existingFollow) {
    return {
      following: true,
      followersCount: targetUser.followersCount,
      message: "Already following this user",
    };
  }

  await Follow.create({
    follower: currentUserId,
    following: targetId,
  });

  // Update counts
  const updatedTarget = await User.findByIdAndUpdate(
    targetId,
    { $inc: { followersCount: 1 } },
    { new: true }
  );

  await User.findByIdAndUpdate(currentUserId, {
    $inc: { followingCount: 1 },
  });

  // Create notification
  await Notification.create({
    recipient: targetId,
    actor: currentUserId,
    type: "FOLLOW",
    message: "started following you",
  });

  return {
    following: true,
    followersCount: updatedTarget.followersCount,
  };
};

export const unfollowUser = async (currentUserId, targetId) => {
  if (!mongoose.Types.ObjectId.isValid(targetId)) {
    throw new ApiError(400, "Invalid user ID");
  }

  const deleted = await Follow.findOneAndDelete({
    follower: currentUserId,
    following: targetId,
  });

  if (!deleted) {
    const user = await User.findById(targetId);
    return {
      following: false,
      followersCount: user?.followersCount || 0,
    };
  }

  const updatedTarget = await User.findByIdAndUpdate(
    targetId,
    { $inc: { followersCount: -1 } },
    { new: true }
  );

  await User.findByIdAndUpdate(currentUserId, {
    $inc: { followingCount: -1 },
  });

  return {
    following: false,
    followersCount: Math.max(0, updatedTarget ? updatedTarget.followersCount : 0),
  };
};

export const getFollowers = async (userId, { page = 1, limit = 20 } = {}) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "Invalid user ID");
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (pageNum - 1) * limitNum;

  const total = await Follow.countDocuments({ following: userId });
  const follows = await Follow.find({ following: userId })
    .populate("follower", "name username avatar bio isVerified")
    .skip(skip)
    .limit(limitNum)
    .lean();

  return {
    users: follows.map((f) => f.follower).filter(Boolean),
    total,
    page: pageNum,
    totalPages: Math.ceil(total / limitNum) || 1,
  };
};

export const getFollowing = async (userId, { page = 1, limit = 20 } = {}) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "Invalid user ID");
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (pageNum - 1) * limitNum;

  const total = await Follow.countDocuments({ follower: userId });
  const follows = await Follow.find({ follower: userId })
    .populate("following", "name username avatar bio isVerified")
    .skip(skip)
    .limit(limitNum)
    .lean();

  return {
    users: follows.map((f) => f.following).filter(Boolean),
    total,
    page: pageNum,
    totalPages: Math.ceil(total / limitNum) || 1,
  };
};

export const getSuggestions = async (currentUserId, limit = 5) => {
  const limitNum = Math.min(20, Math.max(1, parseInt(limit, 10) || 5));

  const followed = await Follow.find({ follower: currentUserId }).distinct("following");
  const excludeIds = [currentUserId, ...followed];

  const suggestions = await User.find({
    _id: { $nin: excludeIds },
    isSuspended: false,
  })
    .select("name username avatar bio isVerified followersCount")
    .sort({ followersCount: -1, createdAt: -1 })
    .limit(limitNum)
    .lean();

  return suggestions;
};
