import Post from "../posts/post.model.js";
import User from "../auth/auth.model.js";
import * as PostService from "../posts/post.service.js";

export const getTrendingPosts = async ({
  page = 1,
  limit = 10,
  currentUserId = null,
} = {}) => {
  return await PostService.getPosts({
    page,
    limit,
    sort: "trending",
    currentUserId,
  });
};

export const getTrendingHashtags = async (limit = 10) => {
  const limitNum = Math.min(30, Math.max(1, parseInt(limit, 10) || 10));

  const tags = await Post.aggregate([
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
  return await PostService.getPosts({
    page,
    limit,
    tag,
    currentUserId,
  });
};

export const globalSearch = async (query = "", currentUserId = null) => {
  const q = String(query).trim();
  if (!q) {
    return { users: [], posts: [], hashtags: [] };
  }

  const regex = new RegExp(q, "i");

  // Search users
  const users = await User.find({
    $or: [{ username: regex }, { name: regex }],
    isSuspended: false,
  })
    .select("name username avatar bio isVerified followersCount")
    .limit(8)
    .lean();

  // Search posts
  const posts = await Post.find({
    $or: [{ title: regex }, { content: regex }, { hashtags: regex }],
  })
    .populate("user", "name username avatar isVerified")
    .sort({ createdAt: -1 })
    .limit(8)
    .lean();

  // Search hashtags
  const hashtags = await Post.aggregate([
    { $unwind: "$hashtags" },
    { $match: { hashtags: regex } },
    {
      $group: {
        _id: "$hashtags",
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 6 },
    {
      $project: {
        tag: "$_id",
        count: 1,
        _id: 0,
      },
    },
  ]);

  return {
    users,
    posts: posts.map((p) => ({
      ...p,
      isLiked: currentUserId
        ? p.likes.some((l) => l.userId?.toString() === currentUserId.toString())
        : false,
    })),
    hashtags,
  };
};
