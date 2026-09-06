import express from "express";
import {
  getTrendingPostsController,
  getTrendingHashtagsController,
  getPostsByHashtagController,
  globalSearchController,
} from "./explore.controller.js";
import { optionalAuthMiddleware } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/trending", optionalAuthMiddleware, getTrendingPostsController);
router.get("/hashtags", getTrendingHashtagsController);
router.get("/hashtags/:tag", optionalAuthMiddleware, getPostsByHashtagController);
router.get("/search", optionalAuthMiddleware, globalSearchController);

export default router;
