import mongoose from "mongoose";
import bcrypt from "bcrypt";
import User from "../auth/auth.model.js";
import Follow from "./follow.model.js";
import Notification from "../notifications/notification.model.js";
import RefreshToken from "../auth/refreshToken.model.js";
import ApiError from "../../utils/ApiError.js";
import { validatePassword } from "../auth/auth.service.js";

export const getProfileByUsername = async (username, currentUserId = null) => {
  const user = await User.findOne({ username: username.toLowerCase().trim() })
    .select("-password")
    .lean();

  if (!user) throw new ApiError(404, "User not found");

  let isFollowing = false;
  let isBlocked = false;
  let isMuted = false;
  let mutualFollowers = [];

  if (currentUserId) {
    const currUser = await User.findById(currentUserId).select("blockedUsers mutedUsers");
    if (currUser) {
      isBlocked = (currUser.blockedUsers || []).some((id) => id.toString() === user._id.toString());
      isMuted = (currUser.mutedUsers || []).some((id) => id.toString() === user._id.toString());
    }

    if (currentUserId.toString() !== user._id.toString()) {
      isFollowing = Boolean(
        await Follow.exists({
          follower: currentUserId,
          following: user._id,
        })
      );

      // Compute mutual followers
      const myFollowingIds = await Follow.find({ follower: currentUserId }).distinct("following");
      const targetFollowerIds = await Follow.find({ following: user._id, follower: { $in: myFollowingIds } })
        .limit(3)
        .populate("follower", "name username avatar")
        .lean();

      mutualFollowers = targetFollowerIds.map((f) => f.follower).filter(Boolean);
    }
  }

  return {
    ...user,
    isFollowing,
    isBlocked,
    isMuted,
    mutualFollowers,
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

  const [currentUser, targetUser] = await Promise.all([
    User.findById(currentUserId),
    User.findById(targetId),
  ]);

  if (!targetUser) throw new ApiError(404, "Target user not found");

  // Check if blocked in either direction
  if (currentUser.blockedUsers?.includes(targetId) || targetUser.blockedUsers?.includes(currentUserId)) {
    throw new ApiError(403, "Cannot follow a blocked user");
  }

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

  const updatedTarget = await User.findByIdAndUpdate(
    targetId,
    { $inc: { followersCount: 1 } },
    { new: true }
  );

  await User.findByIdAndUpdate(currentUserId, {
    $inc: { followingCount: 1 },
  });

  // Notification (if target has follows enabled)
  if (targetUser.notificationSettings?.follows !== false) {
    await Notification.create({
      recipient: targetId,
      actor: currentUserId,
      type: "FOLLOW",
      message: "started following you",
    });
  }

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

  const user = await User.findById(currentUserId).select("blockedUsers mutedUsers");
  const followed = await Follow.find({ follower: currentUserId }).distinct("following");
  const excludeIds = [currentUserId, ...followed, ...(user?.blockedUsers || [])];

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

// Social Safety: Block & Unblock
export const blockUser = async (currentUserId, targetId) => {
  if (!mongoose.Types.ObjectId.isValid(targetId)) throw new ApiError(400, "Invalid user ID");
  if (currentUserId.toString() === targetId.toString()) throw new ApiError(400, "Cannot block yourself");

  await User.findByIdAndUpdate(currentUserId, { $addToSet: { blockedUsers: targetId } });

  // Sever follows in both directions
  const deleted1 = await Follow.findOneAndDelete({ follower: currentUserId, following: targetId });
  if (deleted1) {
    await User.findByIdAndUpdate(currentUserId, { $inc: { followingCount: -1 } });
    await User.findByIdAndUpdate(targetId, { $inc: { followersCount: -1 } });
  }

  const deleted2 = await Follow.findOneAndDelete({ follower: targetId, following: currentUserId });
  if (deleted2) {
    await User.findByIdAndUpdate(targetId, { $inc: { followingCount: -1 } });
    await User.findByIdAndUpdate(currentUserId, { $inc: { followersCount: -1 } });
  }

  return { blocked: true, message: "User blocked successfully" };
};

export const unblockUser = async (currentUserId, targetId) => {
  if (!mongoose.Types.ObjectId.isValid(targetId)) throw new ApiError(400, "Invalid user ID");
  await User.findByIdAndUpdate(currentUserId, { $pull: { blockedUsers: targetId } });
  return { blocked: false, message: "User unblocked successfully" };
};

// Social Safety: Mute & Unmute
export const muteUser = async (currentUserId, targetId) => {
  if (!mongoose.Types.ObjectId.isValid(targetId)) throw new ApiError(400, "Invalid user ID");
  if (currentUserId.toString() === targetId.toString()) throw new ApiError(400, "Cannot mute yourself");

  await User.findByIdAndUpdate(currentUserId, { $addToSet: { mutedUsers: targetId } });
  return { muted: true, message: "User muted successfully" };
};

export const unmuteUser = async (currentUserId, targetId) => {
  if (!mongoose.Types.ObjectId.isValid(targetId)) throw new ApiError(400, "Invalid user ID");
  await User.findByIdAndUpdate(currentUserId, { $pull: { mutedUsers: targetId } });
  return { muted: false, message: "User unmuted successfully" };
};

// Account Settings & Security
export const changePassword = async (userId, oldPassword, newPassword) => {
  if (!oldPassword || !newPassword) throw new ApiError(400, "Old and new password required");
  validatePassword(newPassword);

  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, "User not found");

  const valid = await bcrypt.compare(oldPassword, user.password);
  if (!valid) throw new ApiError(400, "Incorrect current password");

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  // Invalidate other sessions
  await RefreshToken.updateMany({ user: userId }, { revoked: true });

  return { message: "Password updated successfully. Other active sessions revoked." };
};

export const updateSettings = async (userId, { privacy, notificationSettings }) => {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, "User not found");

  if (privacy && typeof privacy === "object") {
    user.privacy = {
      profileVisibility: privacy.profileVisibility || user.privacy?.profileVisibility || "public",
      whoCanComment: privacy.whoCanComment || user.privacy?.whoCanComment || "everyone",
      whoCanMention: privacy.whoCanMention || user.privacy?.whoCanMention || "everyone",
    };
  }

  if (notificationSettings && typeof notificationSettings === "object") {
    user.notificationSettings = {
      likes: notificationSettings.likes ?? user.notificationSettings?.likes ?? true,
      comments: notificationSettings.comments ?? user.notificationSettings?.comments ?? true,
      replies: notificationSettings.replies ?? user.notificationSettings?.replies ?? true,
      follows: notificationSettings.follows ?? user.notificationSettings?.follows ?? true,
      mentions: notificationSettings.mentions ?? user.notificationSettings?.mentions ?? true,
      saves: notificationSettings.saves ?? user.notificationSettings?.saves ?? true,
    };
  }

  await user.save();

  return {
    privacy: user.privacy,
    notificationSettings: user.notificationSettings,
  };
};

export const deleteAccount = async (userId, password) => {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, "User not found");

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new ApiError(400, "Incorrect password. Account deletion aborted.");

  user.isSuspended = true;
  user.name = "Deactivated Member";
  user.email = `deactivated_${userId}_${Date.now()}@posthub.local`;
  user.bio = "This account has been deactivated.";
  user.avatar = "";
  user.coverImage = "";
  await user.save();

  await RefreshToken.updateMany({ user: userId }, { revoked: true });

  return { message: "Account has been deactivated successfully." };
};
