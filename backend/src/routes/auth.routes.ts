import { Router } from "express";
import * as authController from "../controllers/auth.controller";

const router = Router();

// POST /api/auth/webhook — Clerk webhook to sync users to our DB
router.post("/webhook", authController.clerkWebhook);

// GET /api/auth/me — Get current user profile
router.get("/me", authController.getMe);

export default router;
