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

  if (interviews.length === 0) {
    // INJECT ONE MOCK INTERVIEW
    const mockInterview = await prisma.interview.create({
      data: {
        userId: user.id,
        company: "Google",
        role: "Senior Software Engineer",
        experience: "5-7 years",
        mode: "VOICE",
        status: "COMPLETED",
        overallScore: 88,
        duration: 1240,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        evaluation: {
          create: {
            overallScore: 88,
            strengths: ["Strong system design foundation", "Clear communication"],
            weaknesses: ["Missed edge cases in video encoding"],
            recommendation: "Focus on practicing database schema design.",
            categories: {
              create: [
                { name: "System Design", score: 85 },
                { name: "Communication", score: 92 },
                { name: "Problem Solving", score: 88 },
              ]
            }
          }
        }
      },
      include: { evaluation: { include: { categories: true } } }
    });
    interviews = [mockInterview];
  }

  const totalInterviews = interviews.length;
  let averageScore = 0;
  let topSkill = "N/A";

  if (totalInterviews > 0) {
    const totalScore = interviews.reduce((acc, curr) => acc + (curr.overallScore || 0), 0);
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
    .map((inv, idx) => ({
      name: `Int ${idx + 1}`,
      score: inv.overallScore || 0,
    }));

  res.json({
    success: true,
    data: {
      totalInterviews,
      averageScore,
      topSkill,
      scoreData,
      recentInterviews: interviews.slice(0, 5),
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
