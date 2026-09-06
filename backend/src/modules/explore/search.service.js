import User from "../auth/auth.model.js";
import Post from "../posts/post.model.js";

/**
 * SearchService Abstraction for PostHub 3.0
 * Provides case-folded, whitespace-normalized global search across entities.
 */
export const normalizeQuery = (query = "") => {
  return String(query).toLowerCase().trim().replace(/^[#@]/, "");
};

export const searchEntities = async (query = "", currentUserId = null) => {
  const cleanTerm = normalizeQuery(query);
  if (!cleanTerm) {
    return { users: [], posts: [], hashtags: [] };
  }

  const regex = new RegExp(cleanTerm, "i");

  // Exclude blocked accounts if authenticated
  let blockedUserIds = [];
  if (currentUserId) {
    const user = await User.findById(currentUserId).select("blockedUsers");
    blockedUserIds = user?.blockedUsers || [];
  }

  const [users, posts, hashtags] = await Promise.all([
    // Search Users
    User.find({
      $or: [{ username: regex }, { name: regex }],
      _id: { $nin: blockedUserIds },
      isSuspended: false,
    })
      .select("name username avatar bio isVerified followersCount")
      .limit(8)
      .lean(),

    // Search Posts
    Post.find({
      $or: [{ title: regex }, { content: regex }, { hashtags: regex }],
      status: "PUBLISHED",
      isDeleted: false,
      user: { $nin: blockedUserIds },
    })
      .populate("user", "name username avatar isVerified")
      .sort({ createdAt: -1 })
      .limit(8)
      .lean(),

    // Search Hashtags
    Post.aggregate([
      { $match: { status: "PUBLISHED", isDeleted: false } },
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
    ]),
  ]);

  return {
    users,
    posts: posts.map((p) => ({
      ...p,
      isLiked: currentUserId
        ? p.likes?.some((l) => l.userId?.toString() === currentUserId.toString())
        : false,
    })),
    hashtags,
  };
};
