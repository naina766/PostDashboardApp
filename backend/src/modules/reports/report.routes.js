import express from "express";
import {
  createReportController,
  getReportsController,
  updateReportStatusController,
} from "./report.controller.js";
import { authMiddleware, roleMiddleware } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/", createReportController);
router.get("/", roleMiddleware("admin", "moderator"), getReportsController);
router.patch("/:id/status", roleMiddleware("admin", "moderator"), updateReportStatusController);

export default router;
