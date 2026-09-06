import express from "express";
import {
  getDashboardStatsController,
  getUsersController,
  toggleUserSuspensionController,
  updateUserRoleController,
  adminDeletePostController,
  getAuditLogsController,
} from "./admin.controller.js";
import { authMiddleware, roleMiddleware } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.use(authMiddleware);
router.use(roleMiddleware("admin", "moderator"));

router.get("/stats", getDashboardStatsController);
router.get("/users", getUsersController);
router.patch("/users/:id/suspend", roleMiddleware("admin"), toggleUserSuspensionController);
router.patch("/users/:id/role", roleMiddleware("admin"), updateUserRoleController);
router.delete("/posts/:id", adminDeletePostController);
router.get("/audit-logs", getAuditLogsController);

export default router;
