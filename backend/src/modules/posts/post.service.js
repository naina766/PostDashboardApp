import mongoose from "mongoose";
import Post from "./post.model.js";
import ApiError from "../../utils/ApiError.js";
import deleteImage from "../../config/clodinaryDelete.js";

export const createPost = async (data, user) => {
  const content = data.content ? data.content.trim() : "";
  const image = data.image ? data.image.trim() : "";
  const title = data.title ? data.title.trim() : "";

  if (!content && !image) {
    throw new ApiError(400, "Post must contain text, an image, or both.");
  }

  const post = await Post.create({
    user: user._id,
    username: user.name,
    title,
    content,
    image,
    likes: [],
    comments: [],
  });

  return post;
};

export const getPosts = async ({
  page = 1,
  limit = 10,
  search = "",
  sort = "latest",
} = {}) => {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
  const skip = (pageNum - 1) * limitNum;

  const match = {};
  if (search && search.trim()) {
    const regex = new RegExp(search.trim(), "i");
    match.$or = [{ username: regex }, { title: regex }, { content: regex }];
  }

  const total = await Post.countDocuments(match);
  let posts = [];

  if (sort === "likes") {
    posts = await Post.aggregate([
      ...(Object.keys(match).length ? [{ $match: match }] : []),
      {
        $addFields: {
          likesCount: { $size: { $ifNull: ["$likes", []] } },
        },
      },
      { $sort: { likesCount: -1, createdAt: -1 } },
      { $skip: skip },
      { $limit: limitNum },
    ]);
  } else if (sort === "comments") {
    posts = await Post.aggregate([
      ...(Object.keys(match).length ? [{ $match: match }] : []),
      {
        $addFields: {
          commentsCount: { $size: { $ifNull: ["$comments", []] } },
        },
      },
      { $sort: { commentsCount: -1, createdAt: -1 } },
      { $skip: skip },
      { $limit: limitNum },
    ]);
  } else {
    posts = await Post.find(match)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();
  }

  const totalPages = Math.ceil(total / limitNum) || 1;
  const hasNextPage = pageNum < totalPages;

  return {
    posts,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages,
      hasNextPage,
    },
  };
};

export const getPostById = async (postId) => {
  if (!mongoose.Types.ObjectId.isValid(postId)) {
    throw new ApiError(400, "Invalid Post ID");
  }

  const post = await Post.findById(postId);
  if (!post) throw new ApiError(404, "Post not found");
  return post;
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
  const newContent =
    data.content !== undefined ? data.content.trim() : post.content;
  const newImage = data.image !== undefined ? data.image : post.image;

  if (!newContent && !newImage) {
    throw new ApiError(400, "Post must contain text, an image, or both.");
  }

  if (data.image && post.image && data.image !== post.image) {
    await deleteImage(post.image);
  }

  post.title = newTitle;
  post.content = newContent;
  post.image = newImage;

  await post.save();
  return post;
};

export const deletePost = async (postId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(postId)) {
    throw new ApiError(400, "Invalid Post ID");
  }

  const post = await Post.findById(postId);
  if (!post) throw new ApiError(404, "Post not found");

  if (post.user.toString() !== userId.toString()) {
    throw new ApiError(403, "You are not authorized to delete this post");
  }

  if (post.image) {
    await deleteImage(post.image);
  }

  await post.deleteOne();
  return post;
};

export const toggleLike = async (postId, user) => {
  if (!mongoose.Types.ObjectId.isValid(postId)) {
    throw new ApiError(400, "Invalid Post ID");
  }

  const post = await Post.findById(postId);
  if (!post) throw new ApiError(404, "Post not found");

  const alreadyLiked = post.likes.some(
    (l) => l.userId.toString() === user._id.toString()
  );

  let updatedPost;
  if (alreadyLiked) {
    updatedPost = await Post.findByIdAndUpdate(
      postId,
      { $pull: { likes: { userId: user._id } } },
      { new: true }
    );
    return { liked: false, likesCount: updatedPost.likes.length };
  } else {
    updatedPost = await Post.findByIdAndUpdate(
      postId,
      {
        $addToSet: {
          likes: { userId: user._id, username: user.name },
        },
      },
      { new: true }
    );
    return { liked: true, likesCount: updatedPost.likes.length };
  }
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
    text: text.trim(),
    createdAt: new Date(),
  };

  const updatedPost = await Post.findByIdAndUpdate(
    postId,
    { $push: { comments: newComment } },
    { new: true }
  );

  if (!updatedPost) throw new ApiError(404, "Post not found");

  const addedComment =
    updatedPost.comments[updatedPost.comments.length - 1];

  return {
    comment: addedComment,
    commentsCount: updatedPost.comments.length,
  };
};
