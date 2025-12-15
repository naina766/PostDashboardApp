import express from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { 
  createPostController, 
  getPostsController, 
  updatePostController, 
  deletePostController 
} from "./post.controller.js";
import upload from "../../middlewares/upload.middleware.js";

const router = express.Router();

router.post("/", authMiddleware, upload.single("image"), createPostController);
router.get("/", authMiddleware, getPostsController);
router.put("/:id", authMiddleware, upload.single("image"), updatePostController);
router.delete("/:id", authMiddleware, deletePostController);

export default router;
