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
      data: user
    });
  } catch (err) {
    next(err);
  }
};

export const loginController = async (req, res, next) => {
  try {
    const data = await AuthService.loginUser(req.body);
    sendResponse(res, { 
      statusCode: 200, 
      success: true, 
      message: "Login successful", 
      data 
    });
  } catch (err) {
    next(err);
  }
};

export const getProfileController = async (req, res, next) => {
  try {
    const user = req.user;
    const postsCount = await Post.countDocuments({ user: user._id });

    const stats = await Post.aggregate([
      { $match: { user: user._id } },
      {
        $project: {
          likesCount: { $size: { $ifNull: ["$likes", []] } },
          commentsCount: { $size: { $ifNull: ["$comments", []] } },
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

    const likesReceived = stats[0]?.totalLikes || 0;
    const commentsReceived = stats[0]?.totalComments || 0;

    sendResponse(res, { 
      statusCode: 200, 
      success: true, 
      message: "Profile fetched successfully", 
      data: { 
        _id: user._id, 
        name: user.name, 
        email: user.email,
        postsCount,
        likesReceived,
        commentsReceived
      } 
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
      data: { _id: user._id, name: user.name, email: user.email } 
    });
  } catch (err) {
    next(err);
  }
};

