import Post from "./post.model.js";
import ApiError from "../../utils/ApiError.js";

export const createPost = async (data, userId) => {
  if (!data.title || !data.content) throw new ApiError(400, "Title & content required");
  const post = await Post.create({ ...data, user: userId });
  return post;
};

export const getPosts = async (userId) => {
  return await Post.find({ user: userId }).sort({ createdAt: -1 });
};

export const updatePost = async (postId, data, userId) => {
  const post = await Post.findOne({ _id: postId, user: userId });
  if (!post) throw new ApiError(404, "Post not found");

  post.title = data.title ?? post.title;
  post.content = data.content ?? post.content;
  if (data.image) post.image = data.image;

  return await post.save();
};

export const deletePost = async (postId, userId) => {
  const post = await Post.findOne({ _id: postId, user: userId });
  if (!post) throw new ApiError(404, "Post not found");

  await post.deleteOne();
  return post;
};
