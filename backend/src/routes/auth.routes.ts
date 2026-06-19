import { Router } from "express";
import { requireAuth } from "../middlewares/require-auth";
import * as authController from "../controllers/auth.controller";

const router = Router();

// POST /api/auth/webhook — Clerk webhook to sync users to our DB (public, verified via headers)
router.post("/webhook", authController.clerkWebhook);

// GET /api/auth/me — Get current user profile (requires auth)
router.get("/me", requireAuth, authController.getMe);

export default router;
