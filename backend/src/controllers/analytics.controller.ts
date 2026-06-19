import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/async-handler";

/**
 * GET /api/analytics/dashboard
 * Returns stats for the authenticated user's dashboard.
 */
export const getDashboardStats = asyncHandler(async (req: Request, res: Response) => {
  // TODO: Get userId from auth middleware
  // TODO: Aggregate interview data from database

  res.json({
    success: true,
    data: {
      totalInterviews: 24,
      averageScore: 86,
      topSkill: "System Design",
      weeklyScores: [72, 85, 65, 90, 78, 95, 88],
      recentInterviews: [],
    },
  });
});

/**
 * GET /api/analytics/admin
 * Returns platform-wide stats (admin only).
 */
export const getAdminStats = asyncHandler(async (req: Request, res: Response) => {
  // TODO: Verify admin role
  // TODO: Aggregate platform-wide data

  res.json({
    success: true,
    data: {
      totalUsers: 1250,
      totalInterviews: 8400,
      averagePlatformScore: 78,
      activeToday: 42,
    },
  });
});
