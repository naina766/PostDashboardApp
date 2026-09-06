import mongoose from "mongoose";
import Post from "./post.model.js";
import User from "../auth/auth.model.js";
import Bookmark from "../bookmarks/bookmark.model.js";
import Notification from "../notifications/notification.model.js";
import { deliverNotification } from "../notifications/notificationDelivery.service.js";
import { getFeed } from "./feed.service.js";
import ApiError from "../../utils/ApiError.js";
import deleteImage from "../../config/clodinaryDelete.js";

// Helper: Extract Hashtags
export const extractHashtags = (text) => {
  if (!text) return [];
  const matches = text.match(/(?:^|\s)#([a-zA-Z0-9_\u00c0-\u024f]+)/g);
  if (!matches) return [];
  return [...new Set(matches.map((m) => m.trim().replace(/^#/, "").toLowerCase()))];
};

// Helper: Extract Mentions
export const extractMentions = (text) => {
  if (!text) return [];
  const matches = text.match(/(?:^|\s)@([a-zA-Z0-9_]+)/g);
  if (!matches) return [];
  return [...new Set(matches.map((m) => m.trim().replace(/^@/, "").toLowerCase()))];
};

// Helper: Calculate deterministic trending score
export const calculateTrendingScore = (post) => {
  const likes = post.likesCount || (post.likes ? post.likes.length : 0);
  const comments = post.commentsCount || (post.comments ? post.comments.length : 0);
  const shares = post.sharesCount || 0;
  const saves = post.savesCount || 0;

  const ageInHours = Math.max(
    0.1,
    (Date.now() - new Date(post.createdAt || Date.now()).getTime()) / (1000 * 60 * 60)
  );

  const recencyBonus = Math.max(0, 100 - ageInHours * 1.5);
  return Math.round(likes * 1 + comments * 3 + shares * 4 + saves * 3 + recencyBonus);
};

export const createPost = async (data, user) => {
  const content = data.content ? data.content.trim() : "";
  const title = data.title ? data.title.trim() : "";
  let image = data.image ? data.image.trim() : "";
  let media = Array.isArray(data.media) ? data.media : [];

  if (image && media.length === 0) {
    media = [{ url: image, publicId: "" }];
  } else if (media.length > 0 && !image) {
    image = media[0].url;
  }

  let postType = data.postType || "TEXT";
  if (data.poll && data.poll.question && Array.isArray(data.poll.options) && data.poll.options.length >= 2) {
    postType = "POLL";
  } else if (media.length > 0 || image) {
    postType = "IMAGE";
  } else if (data.linkPreview && data.linkPreview.url) {
    postType = "LINK";
  }

  const status = ["PUBLISHED", "DRAFT", "ARCHIVED"].includes(data.status) ? data.status : "PUBLISHED";

  if (!content && !image && media.length === 0 && postType !== "POLL" && status !== "DRAFT") {
    throw new ApiError(400, "Post must contain text, an image, or both.");
  }

  const hashtags = extractHashtags(`${title} ${content}`);
  const mentions = extractMentions(`${title} ${content}`);

  let pollData = undefined;
  if (postType === "POLL" && data.poll) {
    const validOptions = data.poll.options
      .map((opt) => (typeof opt === "string" ? { text: opt.trim(), votes: [] } : { text: String(opt.text || "").trim(), votes: [] }))
      .filter((opt) => opt.text.length > 0);

    if (validOptions.length < 2) {
      throw new ApiError(400, "Polls must contain at least 2 valid options");
    }

    pollData = {
      question: data.poll.question.trim(),
      options: validOptions,
      expiresAt: data.poll.expiresAt ? new Date(data.poll.expiresAt) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    };
  }

  const post = await Post.create({
    user: user._id,
    username: user.name,
    userAvatar: user.avatar || "",
    title,
    content,
    image,
    media,
    postType,
    status,
    poll: pollData,
    linkPreview: data.linkPreview || undefined,
    hashtags,
    mentions,
    likes: [],
    comments: [],
    likesCount: 0,
    commentsCount: 0,
    sharesCount: 0,
    savesCount: 0,
    trendingScore: 100,
  });

  if (status === "PUBLISHED") {
    await User.findByIdAndUpdate(user._id, { $inc: { postsCount: 1 } });

    // Mentions notification delivery
    if (mentions.length > 0) {
      const mentionedUsers = await User.find({ username: { $in: mentions } }).select("_id");
      for (const mUser of mentionedUsers) {
        await deliverNotification({
          recipientId: mUser._id,
          actorId: user._id,
          type: "MENTION",
          postId: post._id,
          message: "mentioned you in a post",
        });
      }
    }
  }

  return post;
};

export const getPosts = async ({
  page = 1,
  cursor = null,
  limit = 10,
  search = "",
  sort = "latest",
  feedType = "forYou",
  tag = "",
  authorId = "",
  currentUserId = null,
} = {}) => {
  // If cursor is provided, use FeedService cursor seek
  if (cursor) {
    return await getFeed({
      feedType,
      cursor,
      limit,
      tag,
      authorId,
      search,
      currentUserId,
    });
  }

  // Offset-based pagination
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
  const skip = (pageNum - 1) * limitNum;

  const match = {
    status: "PUBLISHED",
    isDeleted: false,
  };

  if (search && search.trim()) {
    const regex = new RegExp(search.trim(), "i");
    match.$or = [
      { username: regex },
      { title: regex },
      { content: regex },
      { hashtags: regex },
    ];
  }

  if (tag && tag.trim()) {
    match.hashtags = tag.trim().toLowerCase();
  }

  if (authorId && mongoose.Types.ObjectId.isValid(authorId)) {
    match.user = new mongoose.Types.ObjectId(authorId);
  }

  // Filter blocked users if logged in
  if (currentUserId) {
    const currUser = await User.findById(currentUserId).select("blockedUsers mutedUsers");
    if (currUser && (currUser.blockedUsers?.length > 0 || currUser.mutedUsers?.length > 0)) {
      const excluded = [...(currUser.blockedUsers || []), ...(currUser.mutedUsers || [])];
      match.user = { ...(match.user || {}), $nin: excluded };
    }
  }

  const total = await Post.countDocuments(match);
  let query = Post.find(match).populate("user", "name username avatar isVerified role");

  if (sort === "trending" || feedType === "trending") {
    query = query.sort({ trendingScore: -1, createdAt: -1 });
  } else if (sort === "likes") {
    query = query.sort({ likesCount: -1, createdAt: -1 });
  } else if (sort === "comments") {
    query = query.sort({ commentsCount: -1, createdAt: -1 });
  } else {
    query = query.sort({ createdAt: -1 });
  }

  const rawPosts = await query.skip(skip).limit(limitNum).lean();

  let userBookmarks = new Set();
  if (currentUserId && rawPosts.length > 0) {
    const postIds = rawPosts.map((p) => p._id);
    const bookmarks = await Bookmark.find({
      user: currentUserId,
      post: { $in: postIds },
    }).select("post");
    bookmarks.forEach((b) => userBookmarks.add(b.post.toString()));
  }

  const posts = rawPosts.map((post) => {
    const isLiked = currentUserId
      ? post.likes?.some((l) => l.userId?.toString() === currentUserId.toString())
      : false;
    const isSaved = currentUserId ? userBookmarks.has(post._id.toString()) : false;

    let userVotedOption = null;
    if (post.poll && post.poll.options && currentUserId) {
      post.poll.options.forEach((opt, idx) => {
        if (opt.votes && opt.votes.some((v) => v.toString() === currentUserId.toString())) {
          userVotedOption = idx;
        }
      });
    }

    return {
      ...post,
      isLiked,
      isSaved,
      userVotedOption,
    };
  });

  const totalPages = Math.ceil(total / limitNum) || 1;
  const hasNextPage = pageNum < totalPages;

  return {
    items: posts,
    posts,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages,
      hasNextPage,
      hasMore: hasNextPage,
    },
  };
};

export const getPostById = async (postId, currentUserId = null) => {
  if (!mongoose.Types.ObjectId.isValid(postId)) {
    throw new ApiError(400, "Invalid Post ID");
  }

  const post = await Post.findOne({ _id: postId, isDeleted: false })
    .populate("user", "name username avatar isVerified bio role")
    .lean();
  if (!post) throw new ApiError(404, "Post not found");

  const isLiked = currentUserId
    ? post.likes?.some((l) => l.userId?.toString() === currentUserId.toString())
    : false;

  let isSaved = false;
  if (currentUserId) {
    isSaved = Boolean(await Bookmark.exists({ user: currentUserId, post: postId }));
  }

  let userVotedOption = null;
  if (post.poll && post.poll.options && currentUserId) {
    post.poll.options.forEach((opt, idx) => {
      if (opt.votes && opt.votes.some((v) => v.toString() === currentUserId.toString())) {
        userVotedOption = idx;
      }
    });
  }

  return {
    ...post,
    isLiked,
    isSaved,
    userVotedOption,
  };
};

export const getMyPosts = async (userId, { status = "PUBLISHED", page = 1, limit = 10 } = {}) => {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
  const skip = (pageNum - 1) * limitNum;

  const filter = {
    user: userId,
    isDeleted: false,
  };
  if (status && status !== "ALL") {
    filter.status = status.toUpperCase();
  }

  const total = await Post.countDocuments(filter);
  const posts = await Post.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum)
    .lean();

  return {
    items: posts,
    posts,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
      hasNextPage: pageNum * limitNum < total,
    },
  };
};

export const archivePost = async (postId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(postId)) throw new ApiError(400, "Invalid Post ID");
  const post = await Post.findOne({ _id: postId, user: userId });
  if (!post) throw new ApiError(404, "Post not found or unauthorized");

  post.status = post.status === "ARCHIVED" ? "PUBLISHED" : "ARCHIVED";
  await post.save();

  return { status: post.status, message: `Post ${post.status.toLowerCase()} successfully` };
};

export const updatePost = async (postId, data, userId) => {
  if (!mongoose.Types.ObjectId.isValid(postId)) {
    throw new ApiError(400, "Invalid Post ID");
  }

  const post = await Post.findById(postId);
  if (!post) throw new ApiError(404, "Post not found");

  if (post.user.toString() !== userId.toString()) {
    throw new ApiError(403, "You are not authorized to edit this post");
  }

  const newTitle = data.title !== undefined ? data.title.trim() : post.title;
  const newContent = data.content !== undefined ? data.content.trim() : post.content;
  const newImage = data.image !== undefined ? data.image : post.image;

  if (!newContent && !newImage && (!post.media || post.media.length === 0) && post.postType !== "POLL") {
    throw new ApiError(400, "Post must contain text, an image, or both.");
  }

  if (data.image && post.image && data.image !== post.image) {
    await deleteImage(post.image);
  }

  post.title = newTitle;
  post.content = newContent;
  post.image = newImage;
  post.editedAt = new Date();
  post.hashtags = extractHashtags(`${newTitle} ${newContent}`);
  post.mentions = extractMentions(`${newTitle} ${newContent}`);

  await post.save();
  return post;
};

export const deletePost = async (postId, userId, userRole = "user") => {
  if (!mongoose.Types.ObjectId.isValid(postId)) {
    throw new ApiError(400, "Invalid Post ID");
  }

  const post = await Post.findById(postId);
  if (!post) throw new ApiError(404, "Post not found");

  const isOwner = post.user.toString() === userId.toString();
  const isAdminOrMod = ["admin", "moderator"].includes(userRole);

  if (!isOwner && !isAdminOrMod) {
    throw new ApiError(403, "You are not authorized to delete this post");
  }

  if (post.image) {
    await deleteImage(post.image);
  }

  await User.findByIdAndUpdate(post.user, { $inc: { postsCount: -1 } });
  await Bookmark.deleteMany({ post: postId });
  await Notification.deleteMany({ post: postId });

  await post.deleteOne();
  return post;
};

export const toggleLike = async (postId, user) => {
  if (!mongoose.Types.ObjectId.isValid(postId)) {
    throw new ApiError(400, "Invalid Post ID");
  }

  const post = await Post.findById(postId);
  if (!post) throw new ApiError(404, "Post not found");

  const alreadyLiked = post.likes?.some(
    (l) => l.userId?.toString() === user._id.toString()
  );

  let updatedPost;
  let liked = false;

  if (alreadyLiked) {
    updatedPost = await Post.findByIdAndUpdate(
      postId,
      {
        $pull: { likes: { userId: user._id } },
        $inc: { likesCount: -1 },
      },
      { new: true }
    );
    liked = false;
  } else {
    updatedPost = await Post.findByIdAndUpdate(
      postId,
      {
        $addToSet: {
          likes: { userId: user._id, username: user.name },
        },
        $inc: { likesCount: 1 },
      },
      { new: true }
    );
    liked = true;

    await deliverNotification({
      recipientId: post.user,
      actorId: user._id,
      type: "LIKE",
      postId: post._id,
      message: "liked your post",
    });
  }

  const trendingScore = calculateTrendingScore(updatedPost);
  await Post.findByIdAndUpdate(postId, { trendingScore });

  return { liked, likesCount: Math.max(0, updatedPost.likesCount) };
};

export const addComment = async (postId, user, text) => {
  if (!mongoose.Types.ObjectId.isValid(postId)) {
    throw new ApiError(400, "Invalid Post ID");
  }

  if (!text || !text.trim()) {
    throw new ApiError(400, "Comment cannot be empty");
  }

  if (text.trim().length > 500) {
    throw new ApiError(400, "Comment cannot exceed 500 characters");
  }

  const newComment = {
    userId: user._id,
    username: user.name,
    userAvatar: user.avatar || "",
    text: text.trim(),
    likes: [],
    replies: [],
    createdAt: new Date(),
  };

  const updatedPost = await Post.findByIdAndUpdate(
    postId,
    {
      $push: { comments: newComment },
      $inc: { commentsCount: 1 },
    },
    { new: true }
  );

  if (!updatedPost) throw new ApiError(404, "Post not found");

  const addedComment = updatedPost.comments[updatedPost.comments.length - 1];
  const trendingScore = calculateTrendingScore(updatedPost);
  await Post.findByIdAndUpdate(postId, { trendingScore });

  await deliverNotification({
    recipientId: updatedPost.user,
    actorId: user._id,
    type: "COMMENT",
    postId: updatedPost._id,
    message: "commented on your post",
  });

  return {
    comment: addedComment,
    commentsCount: updatedPost.commentsCount,
  };
};

export const deleteComment = async (postId, commentId, user, userRole = "user") => {
  if (!mongoose.Types.ObjectId.isValid(postId) || !mongoose.Types.ObjectId.isValid(commentId)) {
    throw new ApiError(400, "Invalid ID provided");
  }

  const post = await Post.findById(postId);
  if (!post) throw new ApiError(404, "Post not found");

  const comment = post.comments.id(commentId);
  if (!comment) throw new ApiError(404, "Comment not found");

  const isCommentOwner = comment.userId.toString() === user._id.toString();
  const isPostOwner = post.user.toString() === user._id.toString();
  const isAdminOrMod = ["admin", "moderator"].includes(userRole);

  if (!isCommentOwner && !isPostOwner && !isAdminOrMod) {
    throw new ApiError(403, "Not authorized to delete this comment");
  }

  const repliesCount = comment.replies ? comment.replies.length : 0;
  const totalDec = 1 + repliesCount;

  comment.deleteOne();
  post.commentsCount = Math.max(0, (post.commentsCount || post.comments.length) - totalDec);
  post.trendingScore = calculateTrendingScore(post);
  await post.save();

  return { commentsCount: post.commentsCount };
};

export const addReply = async (postId, commentId, user, text) => {
  if (!mongoose.Types.ObjectId.isValid(postId) || !mongoose.Types.ObjectId.isValid(commentId)) {
    throw new ApiError(400, "Invalid ID provided");
  }

  if (!text || !text.trim()) {
    throw new ApiError(400, "Reply cannot be empty");
  }

  if (text.trim().length > 500) {
    throw new ApiError(400, "Reply cannot exceed 500 characters");
  }

  const post = await Post.findById(postId);
  if (!post) throw new ApiError(404, "Post not found");

  const comment = post.comments.id(commentId);
  if (!comment) throw new ApiError(404, "Comment not found");

  const newReply = {
    userId: user._id,
    username: user.name,
    userAvatar: user.avatar || "",
    text: text.trim(),
    createdAt: new Date(),
  };

  comment.replies.push(newReply);
  post.commentsCount = (post.commentsCount || 0) + 1;
  post.trendingScore = calculateTrendingScore(post);
  await post.save();

  const addedReply = comment.replies[comment.replies.length - 1];

  await deliverNotification({
    recipientId: comment.userId,
    actorId: user._id,
    type: "REPLY",
    postId: post._id,
    message: "replied to your comment",
  });

  return {
    reply: addedReply,
    commentsCount: post.commentsCount,
  };
};

export const toggleCommentLike = async (postId, commentId, user) => {
  if (!mongoose.Types.ObjectId.isValid(postId) || !mongoose.Types.ObjectId.isValid(commentId)) {
    throw new ApiError(400, "Invalid ID provided");
  }

  const post = await Post.findById(postId);
  if (!post) throw new ApiError(404, "Post not found");

  const comment = post.comments.id(commentId);
  if (!comment) throw new ApiError(404, "Comment not found");

  const likedIndex = comment.likes.indexOf(user._id);
  let liked = false;

  if (likedIndex > -1) {
    comment.likes.splice(likedIndex, 1);
    liked = false;
  } else {
    comment.likes.push(user._id);
    liked = true;
  }

  await post.save();
  return { liked, likesCount: comment.likes.length };
};

export const votePoll = async (postId, optionIndex, user) => {
  if (!mongoose.Types.ObjectId.isValid(postId)) {
    throw new ApiError(400, "Invalid Post ID");
  }

  const post = await Post.findById(postId);
  if (!post) throw new ApiError(404, "Post not found");
  if (post.postType !== "POLL" || !post.poll) {
    throw new ApiError(400, "This post is not a poll");
  }

  if (post.poll.expiresAt && new Date() > new Date(post.poll.expiresAt)) {
    throw new ApiError(400, "This poll has expired");
  }

  const optIdx = parseInt(optionIndex, 10);
  if (isNaN(optIdx) || optIdx < 0 || optIdx >= post.poll.options.length) {
    throw new ApiError(400, "Invalid poll option index");
  }

  post.poll.options.forEach((opt) => {
    opt.votes = opt.votes.filter((v) => v.toString() !== user._id.toString());
  });

  post.poll.options[optIdx].votes.push(user._id);
  await post.save();

  return {
    poll: post.poll,
    userVotedOption: optIdx,
  };
};

export const toggleSavePost = async (postId, user) => {
  if (!mongoose.Types.ObjectId.isValid(postId)) {
    throw new ApiError(400, "Invalid Post ID");
  }

  const post = await Post.findById(postId);
  if (!post) throw new ApiError(404, "Post not found");

  const existing = await Bookmark.findOne({ user: user._id, post: postId });
  let saved = false;

  if (existing) {
    await existing.deleteOne();
    saved = false;
    await Post.findByIdAndUpdate(postId, { $inc: { savesCount: -1 } });
  } else {
    await Bookmark.create({ user: user._id, post: postId });
    saved = true;
    await Post.findByIdAndUpdate(postId, { $inc: { savesCount: 1 } });

    await deliverNotification({
      recipientId: post.user,
      actorId: user._id,
      type: "SAVE",
      postId: post._id,
      message: "saved your post",
    });
  }

  const updatedPost = await Post.findById(postId);
  const trendingScore = calculateTrendingScore(updatedPost);
  await Post.findByIdAndUpdate(postId, { trendingScore });

  return { saved, savesCount: Math.max(0, updatedPost.savesCount) };
};

export const getSavedPosts = async (userId, { page = 1, limit = 10 } = {}) => {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
  const skip = (pageNum - 1) * limitNum;

  const total = await Bookmark.countDocuments({ user: userId });
  const bookmarks = await Bookmark.find({ user: userId })
    .populate({
      path: "post",
      populate: { path: "user", select: "name username avatar isVerified role" },
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum)
    .lean();

  const posts = bookmarks
    .map((b) => b.post)
    .filter((p) => p && !p.isDeleted && p.status === "PUBLISHED")
    .map((post) => ({
      ...post,
      isLiked: post.likes ? post.likes.some((l) => l.userId?.toString() === userId.toString()) : false,
      isSaved: true,
    }));

  const totalPages = Math.ceil(total / limitNum) || 1;

  return {
    items: posts,
    posts,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages,
      hasNextPage: pageNum < totalPages,
    },
  };
};
