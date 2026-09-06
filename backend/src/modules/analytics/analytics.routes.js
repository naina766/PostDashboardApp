import express from "express";
import { getCreatorAnalyticsController } from "./analytics.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/me", getCreatorAnalyticsController);

export default router;
