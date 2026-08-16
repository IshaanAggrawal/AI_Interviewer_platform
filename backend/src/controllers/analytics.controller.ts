import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/async-handler";
import { getAuth } from "@clerk/express";
import { prisma } from "../lib/prisma";
import { AppError } from "../middlewares/error-handler";
import { getOrCreateLocalUser } from "../services/user.service";

/**
 * GET /api/analytics/dashboard
 * Returns stats for the authenticated user's dashboard.
 */
export const getDashboardStats = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = getAuth(req);
  if (!userId) {
    throw new AppError(401, "Unauthorized");
  }

  // Get or create local database user from Clerk ID
  const user = await getOrCreateLocalUser(userId);

  // Get all COMPLETED interviews for the user
  let interviews = await prisma.interview.findMany({
    where: {
      userId: user.id,
      status: "COMPLETED"
    },
    include: {
      evaluation: {
        include: {
          categories: true
        }
      }
    },
    orderBy: { createdAt: "desc" },
  });

  // Do not inject mock interviews anymore

  const totalInterviews = interviews.length;
  let averageScore = 0;
  let topSkill = "N/A";

  if (totalInterviews > 0) {
    const totalScore = interviews.reduce((acc: any, curr: any) => acc + (curr.overallScore || 0), 0);
    averageScore = Math.round(totalScore / totalInterviews);

    // Calculate top skill
    const skillScores: Record<string, number[]> = {};
    for (const interview of interviews) {
      if (interview.evaluation) {
        for (const cat of interview.evaluation.categories) {
          if (!skillScores[cat.name]) skillScores[cat.name] = [];
          skillScores[cat.name].push(cat.score);
        }
      }
    }

    let maxAvg = 0;
    for (const [skill, scores] of Object.entries(skillScores)) {
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      if (avg > maxAvg) {
        maxAvg = avg;
        topSkill = skill;
      }
    }
  }

  // Format scoreData for the chart (last 7 interviews)
  const scoreData = interviews
    .slice(0, 7)
    .reverse() // chronologically left-to-right
    .map((inv: any, idx: any) => ({
      name: `Int ${idx + 1}`,
      score: inv.overallScore || 0,
    }));

  res.json({
    success: true,
    data: {
      totalInterviews,
      averageScore: isNaN(averageScore) ? 0 : averageScore,
      topSkill,
      scoreData,
      recentInterviews: interviews.slice(0, 5),
      userTier: user.tier,
      interviewsCount: totalInterviews,
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
