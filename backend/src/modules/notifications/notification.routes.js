import express from "express";
import {
  getNotificationsController,
  markAsReadController,
  markAllAsReadController,
  getUnreadCountController,
} from "./notification.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", getNotificationsController);
router.get("/unread-count", getUnreadCountController);
router.patch("/read-all", markAllAsReadController);
router.patch("/:id/read", markAsReadController);

export default router;
