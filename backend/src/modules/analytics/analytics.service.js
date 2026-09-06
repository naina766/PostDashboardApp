import mongoose from "mongoose";
import Post from "../posts/post.model.js";
import User from "../auth/auth.model.js";
import ApiError from "../../utils/ApiError.js";

export const getCreatorAnalytics = async (userId) => {
  const user = await User.findById(userId).select("followersCount followingCount postsCount");
  if (!user) throw new ApiError(404, "User not found");

  const objectId = new mongoose.Types.ObjectId(userId);

  // Aggregate stats across all posts by this user
  const stats = await Post.aggregate([
    { $match: { user: objectId } },
    {
      $group: {
        _id: null,
        totalPosts: { $sum: 1 },
        totalLikes: { $sum: "$likesCount" },
        totalComments: { $sum: "$commentsCount" },
        totalSaves: { $sum: "$savesCount" },
        textPosts: { $sum: { $cond: [{ $eq: ["$postType", "TEXT"] }, 1, 0] } },
        imagePosts: { $sum: { $cond: [{ $eq: ["$postType", "IMAGE"] }, 1, 0] } },
        pollPosts: { $sum: { $cond: [{ $eq: ["$postType", "POLL"] }, 1, 0] } },
        linkPosts: { $sum: { $cond: [{ $eq: ["$postType", "LINK"] }, 1, 0] } },
      },
    },
  ]);

  const summary = stats[0] || {
    totalPosts: 0,
    totalLikes: 0,
    totalComments: 0,
    totalSaves: 0,
    textPosts: 0,
    imagePosts: 0,
    pollPosts: 0,
    linkPosts: 0,
  };

  const totalEngagements = summary.totalLikes + summary.totalComments + summary.totalSaves;
  const engagementRate = summary.totalPosts > 0
    ? Number((totalEngagements / summary.totalPosts).toFixed(1))
    : 0;

  // Top 5 posts by engagement
  const topPosts = await Post.find({ user: objectId })
    .sort({ trendingScore: -1, likesCount: -1 })
    .limit(5)
    .select("title content postType likesCount commentsCount savesCount createdAt")
    .lean();

  // Posts timeline by month (last 6 months)
  const timeline = await Post.aggregate([
    { $match: { user: objectId } },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
        count: { $sum: 1 },
        likes: { $sum: "$likesCount" },
        comments: { $sum: "$commentsCount" },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
    { $limit: 6 },
  ]);

  return {
    followersCount: user.followersCount || 0,
    followingCount: user.followingCount || 0,
    totalPosts: summary.totalPosts,
    totalLikes: summary.totalLikes,
    totalComments: summary.totalComments,
    totalSaves: summary.totalSaves,
    engagementRate,
    breakdown: {
      text: summary.textPosts,
      image: summary.imagePosts,
      poll: summary.pollPosts,
      link: summary.linkPosts,
    },
    topPosts,
    timeline,
  };
};
