import * as UserService from "./user.service.js";
import sendResponse from "../../utils/sendResponse.js";

export const getProfileController = async (req, res, next) => {
  try {
    const { username } = req.params;
    const currentUserId = req.user?._id;
    const profile = await UserService.getProfileByUsername(username, currentUserId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Profile fetched successfully",
      data: profile,
    });
  } catch (err) {
    next(err);
  }
};

export const updateProfileController = async (req, res, next) => {
  try {
    const updated = await UserService.updateProfile(req.user._id, req.body);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Profile updated successfully",
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

export const updateAvatarController = async (req, res, next) => {
  try {
    const avatarUrl = req.file ? req.file.path : req.body.avatar;
    const updated = await UserService.updateAvatar(req.user._id, avatarUrl);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Avatar updated successfully",
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

export const updateCoverController = async (req, res, next) => {
  try {
    const coverUrl = req.file ? req.file.path : req.body.coverImage;
    const updated = await UserService.updateCover(req.user._id, coverUrl);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Cover photo updated successfully",
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

export const followUserController = async (req, res, next) => {
  try {
    const result = await UserService.followUser(req.user._id, req.params.id);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "User followed",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const unfollowUserController = async (req, res, next) => {
  try {
    const result = await UserService.unfollowUser(req.user._id, req.params.id);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "User unfollowed",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const getFollowersController = async (req, res, next) => {
  try {
    const data = await UserService.getFollowers(req.params.id, req.query);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Followers fetched successfully",
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const getFollowingController = async (req, res, next) => {
  try {
    const data = await UserService.getFollowing(req.params.id, req.query);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Following fetched successfully",
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const getSuggestionsController = async (req, res, next) => {
  try {
    const suggestions = await UserService.getSuggestions(req.user._id, req.query.limit);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Suggestions fetched successfully",
      data: suggestions,
    });
  } catch (err) {
    next(err);
  }
};
