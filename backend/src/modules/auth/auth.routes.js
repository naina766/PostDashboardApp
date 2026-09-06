import express from "express";
import { 
  registerController, 
  loginController, 
  refreshController,
  logoutController,
  logoutAllController,
  getProfileController, 
  updateProfileController 
} from "./auth.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/register", registerController);
router.post("/login", loginController);
router.post("/refresh", refreshController);
router.post("/logout", logoutController);
router.post("/logout-all", authMiddleware, logoutAllController);

router.get("/profile", authMiddleware, getProfileController);
router.put("/profile", authMiddleware, updateProfileController);

export default router;
