import { Router } from "express";
import * as analyticsController from "../controllers/analytics.controller";
import { cacheMiddleware } from "../middlewares/cache";

const router = Router();

// GET /api/analytics/dashboard — Get dashboard stats for current user
router.get("/dashboard", cacheMiddleware(60), analyticsController.getDashboardStats);

// GET /api/analytics/admin — Get platform-wide admin stats
router.get("/admin", analyticsController.getAdminStats);

export default router;
