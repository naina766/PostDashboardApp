import Post from "../posts/post.model.js";
import * as PostService from "../posts/post.service.js";
import { searchEntities, normalizeQuery } from "./search.service.js";

export const getTrendingPosts = async ({
  page = 1,
  limit = 10,
  currentUserId = null,
} = {}) => {
  return await PostService.getPosts({
    page,
    limit,
    sort: "trending",
    feedType: "trending",
    currentUserId,
  });
};

export const getTrendingHashtags = async (limit = 10) => {
  const limitNum = Math.min(30, Math.max(1, parseInt(limit, 10) || 10));

  const tags = await Post.aggregate([
    { $match: { status: "PUBLISHED", isDeleted: false } },
    { $unwind: "$hashtags" },
    {
      $group: {
        _id: "$hashtags",
        count: { $sum: 1 },
        totalEngagement: { $sum: "$trendingScore" },
      },
    },
    { $sort: { count: -1, totalEngagement: -1 } },
    { $limit: limitNum },
    {
      $project: {
        tag: "$_id",
        count: 1,
        totalEngagement: 1,
        _id: 0,
      },
    },
  ]);

  return tags;
};

export const getPostsByHashtag = async (tag, { page = 1, limit = 10, currentUserId = null } = {}) => {
  const cleanTag = normalizeQuery(tag);
  return await PostService.getPosts({
    page,
    limit,
    tag: cleanTag,
    currentUserId,
  });
};

export const globalSearch = async (query = "", currentUserId = null) => {
  return await searchEntities(query, currentUserId);
};
