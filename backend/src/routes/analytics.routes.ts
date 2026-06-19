import { Router } from "express";
import * as analyticsController from "../controllers/analytics.controller";

const router = Router();

// GET /api/analytics/dashboard — Get dashboard stats for current user
router.get("/dashboard", analyticsController.getDashboardStats);

// GET /api/analytics/admin — Get platform-wide admin stats
router.get("/admin", analyticsController.getAdminStats);

export default router;
