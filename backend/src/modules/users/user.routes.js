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
  blockUserController,
  unblockUserController,
  muteUserController,
  unmuteUserController,
  changePasswordController,
  updateSettingsController,
  deleteAccountController,
} from "./user.controller.js";
import { authMiddleware, optionalAuthMiddleware } from "../../middlewares/auth.middleware.js";
import upload from "../../middlewares/upload.middleware.js";

const router = express.Router();

// Account Settings & Security
router.put("/settings", authMiddleware, updateSettingsController);
router.post("/change-password", authMiddleware, changePasswordController);
router.post("/delete-account", authMiddleware, deleteAccountController);

// Suggestions
router.get("/suggestions", authMiddleware, getSuggestionsController);

// Profile
router.get("/profile/:username", optionalAuthMiddleware, getProfileController);
router.put("/profile", authMiddleware, updateProfileController);
router.post("/avatar", authMiddleware, upload.single("avatar"), updateAvatarController);
router.post("/cover", authMiddleware, upload.single("coverImage"), updateCoverController);

// Social Relationships & Graph
router.post("/:id/follow", authMiddleware, followUserController);
router.delete("/:id/follow", authMiddleware, unfollowUserController);
router.get("/:id/followers", optionalAuthMiddleware, getFollowersController);
router.get("/:id/following", optionalAuthMiddleware, getFollowingController);

// Safety & Blocking
router.post("/:id/block", authMiddleware, blockUserController);
router.delete("/:id/block", authMiddleware, unblockUserController);
router.post("/:id/mute", authMiddleware, muteUserController);
router.delete("/:id/mute", authMiddleware, unmuteUserController);

export default router;
