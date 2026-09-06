import mongoose from "mongoose";
import Post from "./post.model.js";
import User from "../auth/auth.model.js";
import Follow from "../users/follow.model.js";
import Bookmark from "../bookmarks/bookmark.model.js";

/**
 * Modular Feed Engine for PostHub 3.0
 * Supports Cursor-based pagination ($O(1) seek) and Explainable Community Discovery.
 */
export const getFeed = async ({
  feedType = "forYou", // forYou, following, trending, latest
  cursor = null, // timestamp ISO string or ObjectId for cursor pagination
  limit = 10,
  tag = "",
  authorId = "",
  search = "",
  currentUserId = null,
} = {}) => {
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));

  // Base Match Query
  const match = {
    status: "PUBLISHED",
    isDeleted: false,
  };

  // Exclude blocked or muting users if logged in
  let blockedUserIds = [];
  let followingUserIds = [];

  if (currentUserId) {
    const currUser = await User.findById(currentUserId).select("blockedUsers mutedUsers");
    if (currUser) {
      blockedUserIds = [
        ...(currUser.blockedUsers || []),
        ...(currUser.mutedUsers || []),
      ];
    }
    // Also find users who have blocked the current user
    const usersBlockingMe = await User.find({ blockedUsers: currentUserId }).distinct("_id");
    blockedUserIds = [...new Set([...blockedUserIds, ...usersBlockingMe])];

    if (blockedUserIds.length > 0) {
      match.user = { $nin: blockedUserIds };
    }

    followingUserIds = await Follow.find({ follower: currentUserId }).distinct("following");
  }

  // Tag filter
  if (tag && tag.trim()) {
    match.hashtags = tag.trim().toLowerCase();
  }

  // Author filter
  if (authorId && mongoose.Types.ObjectId.isValid(authorId)) {
    match.user = new mongoose.Types.ObjectId(authorId);
  }

  // Keyword search
  if (search && search.trim()) {
    const regex = new RegExp(search.trim(), "i");
    match.$or = [
      { username: regex },
      { title: regex },
      { content: regex },
      { hashtags: regex },
    ];
  }

  // Feed-specific filters
  if (feedType === "following") {
    if (!currentUserId || followingUserIds.length === 0) {
      return {
        items: [],
        pagination: { hasMore: false, nextCursor: null },
      };
    }
    match.user = { $in: followingUserIds };
  }

  // Cursor-based seek: fetch posts created strictly before cursor timestamp
  if (cursor) {
    const cursorDate = new Date(cursor);
    if (!isNaN(cursorDate.getTime())) {
      match.createdAt = { $lt: cursorDate };
    }
  }

  // Sorting logic
  let sortQuery = { createdAt: -1 };
  if (feedType === "trending") {
    sortQuery = { trendingScore: -1, createdAt: -1 };
  }

  // Query one extra document to determine hasMore
  const rawPosts = await Post.find(match)
    .sort(sortQuery)
    .limit(limitNum + 1)
    .populate("user", "name username avatar isVerified role")
    .lean();

  const hasMore = rawPosts.length > limitNum;
  const posts = hasMore ? rawPosts.slice(0, limitNum) : rawPosts;
  const nextCursor = posts.length > 0 ? posts[posts.length - 1].createdAt.toISOString() : null;

  // Compute interaction states & explainability signals
  let userBookmarks = new Set();
  if (currentUserId && posts.length > 0) {
    const postIds = posts.map((p) => p._id);
    const bookmarks = await Bookmark.find({
      user: currentUserId,
      post: { $in: postIds },
    }).select("post");
    bookmarks.forEach((b) => userBookmarks.add(b.post.toString()));
  }

  const enhancedPosts = posts.map((post) => {
    const isLiked = currentUserId
      ? post.likes?.some((l) => l.userId?.toString() === currentUserId.toString())
      : false;
    const isSaved = currentUserId ? userBookmarks.has(post._id.toString()) : false;

    // Check user poll vote
    let userVotedOption = null;
    if (post.poll && post.poll.options && currentUserId) {
      post.poll.options.forEach((opt, idx) => {
        if (opt.votes && opt.votes.some((v) => v.toString() === currentUserId.toString())) {
          userVotedOption = idx;
        }
      });
    }

    // Explainable Discovery Reason (Phase 39)
    const discoveryReason = calculateDiscoveryReason(post, { followingUserIds, currentUserId });

    return {
      ...post,
      isLiked,
      isSaved,
      userVotedOption,
      discoveryReason,
    };
  });

  return {
    items: enhancedPosts,
    posts: enhancedPosts, // Backward compatibility
    pagination: {
      hasMore,
      nextCursor,
      limit: limitNum,
    },
  };
};

export const calculateDiscoveryReason = (post, { followingUserIds = [], currentUserId = null } = {}) => {
  let discoveryReason = "Recently published";
  const authorIdStr = post.user?._id?.toString() || post.user?.toString();

  if (currentUserId && followingUserIds.some((id) => id.toString() === authorIdStr)) {
    return "Because you follow this creator";
  }
  if (post.trendingScore > 130) {
    return post.hashtags?.length > 0 ? `Trending in #${post.hashtags[0]}` : "Trending topic";
  }
  if ((post.likesCount || 0) > 5) {
    return "Popular in your network";
  }
  return discoveryReason;
};

