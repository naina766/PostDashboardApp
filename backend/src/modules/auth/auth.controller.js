import * as AuthService from "./auth.service.js";
import sendResponse from "../../utils/sendResponse.js";
import Post from "../posts/post.model.js";

export const registerController = async (req, res, next) => {
  try {
    const user = await AuthService.registerUser(req.body);
    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "User registered successfully",
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

export const loginController = async (req, res, next) => {
  try {
    const ip = req.ip || req.connection.remoteAddress || "";
    const userAgent = req.headers["user-agent"] || "";
    const data = await AuthService.loginUser(req.body, ip, userAgent);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Login successful",
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const refreshController = async (req, res, next) => {
  try {
    const ip = req.ip || req.connection.remoteAddress || "";
    const userAgent = req.headers["user-agent"] || "";
    const token = req.body.refreshToken;

    const data = await AuthService.refreshSession(token, ip, userAgent);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Session refreshed successfully",
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const logoutController = async (req, res, next) => {
  try {
    const token = req.body.refreshToken;
    await AuthService.revokeSession(token);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Logged out successfully",
      data: null,
    });
  } catch (err) {
    next(err);
  }
};

export const logoutAllController = async (req, res, next) => {
  try {
    const result = await AuthService.revokeAllUserSessions(req.user._id);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: result.message,
      data: null,
    });
  } catch (err) {
    next(err);
  }
};

export const getProfileController = async (req, res, next) => {
  try {
    const user = req.user;
    let postsCount = 0;
    let likesReceived = 0;
    let commentsReceived = 0;

    try {
      postsCount = await Post.countDocuments({ user: user._id, isDeleted: false });

      const stats = await Post.aggregate([
        { $match: { user: user._id, isDeleted: false } },
        {
          $project: {
            likesCount: { $ifNull: ["$likesCount", { $size: { $ifNull: ["$likes", []] } }] },
            commentsCount: { $ifNull: ["$commentsCount", { $size: { $ifNull: ["$comments", []] } }] },
          },
        },
        {
          $group: {
            _id: null,
            totalLikes: { $sum: "$likesCount" },
            totalComments: { $sum: "$commentsCount" },
          },
        },
      ]);

      likesReceived = stats[0]?.totalLikes || 0;
      commentsReceived = stats[0]?.totalComments || 0;
    } catch (statErr) {
      // Non-fatal fallback for stats calculation
    }

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Profile fetched successfully",
      data: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        coverImage: user.coverImage,
        bio: user.bio,
        location: user.location,
        website: user.website,
        skills: user.skills,
        socialLinks: user.socialLinks,
        followersCount: user.followersCount,
        followingCount: user.followingCount,
        postsCount,
        likesReceived,
        commentsReceived,
        role: user.role,
        isVerified: user.isVerified,
        privacy: user.privacy,
        notificationSettings: user.notificationSettings,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const updateProfileController = async (req, res, next) => {
  try {
    const user = req.user;
    if (req.body.name && req.body.name.trim()) {
      user.name = req.body.name.trim();
    }
    if (req.body.email && req.body.email.trim()) {
      user.email = req.body.email.toLowerCase().trim();
    }
    await user.save();
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Profile updated successfully",
      data: { _id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    next(err);
  }
};
