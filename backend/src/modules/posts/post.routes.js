import express from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { 
  createPostController, 
  getPostsController, 
  updatePostController, 
  deletePostController,
  likePostController,
  commentPostController
} from "./post.controller.js";
import upload from "../../middlewares/upload.middleware.js";

const router = express.Router();

router.get("/", getPostsController);
router.post("/", authMiddleware, upload.single("image"), createPostController);
router.put("/:id", authMiddleware, upload.single("image"), updatePostController);
router.delete("/:id", authMiddleware, deletePostController);
router.post("/:id/like", authMiddleware, likePostController);
router.post("/:id/comments", authMiddleware, commentPostController);

export default router;

