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
      req.user._id
    );

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Post created",
      data: post,
    });
  } catch (err) {
    next(err);
  }
};

export const getPostsController = async (req, res, next) => {
  try {
    const posts = await PostService.getPosts(req.user._id);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Posts fetched",
      data: posts,
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
      image: req.file?.path,
    };

    const post = await PostService.updatePost(req.params.id, data, req.user._id);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Post updated",
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
      message: "Post deleted",
      data: post,
    });
  } catch (err) {
    next(err);
  }
};
