import express from "express";
import {
  authMiddleware,
  optionalAuthMiddleware,
} from "../../middlewares/auth.middleware.js";
import {
  createPostController,
  getPostsController,
  getMyPostsController,
  archivePostController,
  getPostByIdController,
  updatePostController,
  deletePostController,
  likePostController,
  commentPostController,
  deleteCommentController,
  addReplyController,
  toggleCommentLikeController,
  votePollController,
  toggleSavePostController,
  getSavedPostsController,
} from "./post.controller.js";
import upload from "../../middlewares/upload.middleware.js";

const router = express.Router();

const postUpload = upload.fields([
  { name: "image", maxCount: 1 },
  { name: "images", maxCount: 4 },
]);

// Saved posts & My posts - defined before :id route
router.get("/saved/me", authMiddleware, getSavedPostsController);
router.get("/me", authMiddleware, getMyPostsController);

// Post CRUD
router.get("/", optionalAuthMiddleware, getPostsController);
router.post("/", authMiddleware, postUpload, createPostController);
router.get("/:id", optionalAuthMiddleware, getPostByIdController);
router.put("/:id", authMiddleware, postUpload, updatePostController);
router.delete("/:id", authMiddleware, deletePostController);

// Lifecycle: Archive / Restore
router.patch("/:id/archive", authMiddleware, archivePostController);

// Likes & Saves
router.post("/:id/like", authMiddleware, likePostController);
router.post("/:id/save", authMiddleware, toggleSavePostController);

// Poll Voting
router.post("/:id/vote", authMiddleware, votePollController);

// Comments & Replies
router.post("/:id/comments", authMiddleware, commentPostController);
router.delete("/:id/comments/:commentId", authMiddleware, deleteCommentController);
router.post("/:id/comments/:commentId/replies", authMiddleware, addReplyController);
router.post("/:id/comments/:commentId/like", authMiddleware, toggleCommentLikeController);

export default router;
