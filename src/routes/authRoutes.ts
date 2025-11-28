import { Router } from "express";
import AuthController from "../controllers/authController.js";
import { verifyAuth } from "../middleware/auth.js";
import { verifyAdmin } from "../middleware/adminAuth.js";

const router = Router();

// Regular routes
router.post("/register", AuthController.register.bind(AuthController));
router.post("/login", AuthController.login.bind(AuthController));
router.get("/profile", verifyAuth, AuthController.getProfile.bind(AuthController));

// Admin route
router.post("/admin", AuthController.adminLogin.bind(AuthController));

export default router;
