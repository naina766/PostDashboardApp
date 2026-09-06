import * as PostService from "./post.service.js";
import sendResponse from "../../utils/sendResponse.js";

export const createPostController = async (req, res, next) => {
  try {
    let media = [];
    let image = "";

    if (req.files) {
      if (Array.isArray(req.files)) {
        media = req.files.map((f) => ({ url: f.path, publicId: f.filename || "" }));
      } else {
        const allFiles = [...(req.files.image || []), ...(req.files.images || [])];
        media = allFiles.map((f) => ({ url: f.path, publicId: f.filename || "" }));
      }
      if (media.length > 0) image = media[0].url;
    } else if (req.file?.path) {
      image = req.file.path;
      media = [{ url: image, publicId: req.file.filename || "" }];
    } else if (req.body.image) {
      image = req.body.image;
      media = [{ url: image, publicId: "" }];
    }

    let poll;
    if (req.body.poll) {
      poll = typeof req.body.poll === "string" ? JSON.parse(req.body.poll) : req.body.poll;
    }

    let linkPreview;
    if (req.body.linkPreview) {
      linkPreview =
        typeof req.body.linkPreview === "string"
          ? JSON.parse(req.body.linkPreview)
          : req.body.linkPreview;
    }

    const post = await PostService.createPost(
      {
        title: req.body.title,
        content: req.body.content,
        image,
        media,
        postType: req.body.postType,
        status: req.body.status,
        poll,
        linkPreview,
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
    const { page, cursor, limit, search, sort, feedType, tag, authorId } = req.query;
    const currentUserId = req.user?._id;

    const result = await PostService.getPosts({
      page,
      cursor,
      limit,
      search,
      sort,
      feedType,
      tag,
      authorId,
      currentUserId,
    });

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

export const getMyPostsController = async (req, res, next) => {
  try {
    const { status, page, limit } = req.query;
    const result = await PostService.getMyPosts(req.user._id, { status, page, limit });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "My posts fetched successfully",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const archivePostController = async (req, res, next) => {
  try {
    const result = await PostService.archivePost(req.params.id, req.user._id);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: result.message,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const getPostByIdController = async (req, res, next) => {
  try {
    const currentUserId = req.user?._id;
    const post = await PostService.getPostById(req.params.id, currentUserId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Post fetched successfully",
      data: post,
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
    const post = await PostService.deletePost(
      req.params.id,
      req.user._id,
      req.user.role
    );
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

export const deleteCommentController = async (req, res, next) => {
  try {
    const result = await PostService.deleteComment(
      req.params.id,
      req.params.commentId,
      req.user,
      req.user.role
    );
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Comment deleted successfully",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const addReplyController = async (req, res, next) => {
  try {
    const result = await PostService.addReply(
      req.params.id,
      req.params.commentId,
      req.user,
      req.body.text
    );
    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Reply added successfully",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const toggleCommentLikeController = async (req, res, next) => {
  try {
    const result = await PostService.toggleCommentLike(
      req.params.id,
      req.params.commentId,
      req.user
    );
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: result.liked ? "Comment liked" : "Comment unliked",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const votePollController = async (req, res, next) => {
  try {
    const result = await PostService.votePoll(
      req.params.id,
      req.body.optionIndex,
      req.user
    );
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Vote recorded",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const toggleSavePostController = async (req, res, next) => {
  try {
    const result = await PostService.toggleSavePost(req.params.id, req.user);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: result.saved ? "Post saved to bookmarks" : "Post removed from bookmarks",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const getSavedPostsController = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const result = await PostService.getSavedPosts(req.user._id, { page, limit });
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Saved posts fetched successfully",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};
