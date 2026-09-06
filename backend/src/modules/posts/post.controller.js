import * as PostService from "./post.service.js";
import sendResponse from "../../utils/sendResponse.js";

export const createPostController = async (req, res, next) => {
  try {
    const post = await PostService.createPost(
      {
        title: req.body.title,
        content: req.body.content,
        image: req.file?.path || "",
      },
      req.user
    );

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Post created successfully",
      data: post,
    });
  } catch (err) {
    next(err);
  }
};

export const getPostsController = async (req, res, next) => {
  try {
    const { page, limit, search, sort } = req.query;
    const result = await PostService.getPosts({ page, limit, search, sort });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Posts fetched successfully",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const updatePostController = async (req, res, next) => {
  try {
    const data = {
      title: req.body.title,
      content: req.body.content,
      ...(req.file?.path ? { image: req.file.path } : {}),
    };

    const post = await PostService.updatePost(
      req.params.id,
      data,
      req.user._id
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Post updated successfully",
      data: post,
    });
  } catch (err) {
    next(err);
  }
};

export const deletePostController = async (req, res, next) => {
  try {
    const post = await PostService.deletePost(req.params.id, req.user._id);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Post deleted successfully",
      data: post,
    });
  } catch (err) {
    next(err);
  }
};

export const likePostController = async (req, res, next) => {
  try {
    const result = await PostService.toggleLike(req.params.id, req.user);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: result.liked ? "Post liked" : "Post unliked",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const commentPostController = async (req, res, next) => {
  try {
    const result = await PostService.addComment(
      req.params.id,
      req.user,
      req.body.text
    );
    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Comment added successfully",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

