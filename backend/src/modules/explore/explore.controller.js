import * as ExploreService from "./explore.service.js";
import sendResponse from "../../utils/sendResponse.js";

export const getTrendingPostsController = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const currentUserId = req.user?._id;
    const result = await ExploreService.getTrendingPosts({ page, limit, currentUserId });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Trending posts fetched",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const getTrendingHashtagsController = async (req, res, next) => {
  try {
    const { limit } = req.query;
    const tags = await ExploreService.getTrendingHashtags(limit);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Trending hashtags fetched",
      data: tags,
    });
  } catch (err) {
    next(err);
  }
};

export const getPostsByHashtagController = async (req, res, next) => {
  try {
    const { tag } = req.params;
    const { page, limit } = req.query;
    const currentUserId = req.user?._id;

    const result = await ExploreService.getPostsByHashtag(tag, {
      page,
      limit,
      currentUserId,
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: `Posts for #${tag} fetched`,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const globalSearchController = async (req, res, next) => {
  try {
    const { q } = req.query;
    const currentUserId = req.user?._id;
    const result = await ExploreService.globalSearch(q, currentUserId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Search completed",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};
