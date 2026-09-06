import express from "express";
import {
  getProfileController,
  updateProfileController,
  updateAvatarController,
  updateCoverController,
  followUserController,
  unfollowUserController,
  getFollowersController,
  getFollowingController,
  getSuggestionsController,
} from "./user.controller.js";
import { authMiddleware, optionalAuthMiddleware } from "../../middlewares/auth.middleware.js";
import upload from "../../middlewares/upload.middleware.js";

const router = express.Router();

// Profile Routes
router.get("/profile/:username", optionalAuthMiddleware, getProfileController);
router.put("/profile", authMiddleware, updateProfileController);
router.post("/avatar", authMiddleware, upload.single("avatar"), updateAvatarController);
router.post("/cover", authMiddleware, upload.single("coverImage"), updateCoverController);

// Suggestions
router.get("/suggestions", authMiddleware, getSuggestionsController);

// Follow / Unfollow
router.post("/:id/follow", authMiddleware, followUserController);
router.delete("/:id/follow", authMiddleware, unfollowUserController);
router.get("/:id/followers", optionalAuthMiddleware, getFollowersController);
router.get("/:id/following", optionalAuthMiddleware, getFollowingController);

export default router;
