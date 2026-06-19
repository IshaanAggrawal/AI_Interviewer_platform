import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/async-handler";
import { AppError } from "../middlewares/error-handler";

/**
 * POST /api/interviews
 * Creates a new interview session based on company, role, experience, mode.
 */
export const createInterview = asyncHandler(async (req: Request, res: Response) => {
  const { company, role, experience, mode } = req.body;

  // TODO: Get userId from auth middleware
  // TODO: Create interview in database via Prisma
  // TODO: Use AI service to generate the first question

  const interview = {
    id: `int_${Date.now()}`,
    company,
    role,
    experience,
    mode,
    status: "in-progress",
    createdAt: new Date().toISOString(),
  };

  res.status(201).json({ success: true, data: interview });
});

/**
 * GET /api/interviews
 * Lists all interviews for the authenticated user.
 */
export const listInterviews = asyncHandler(async (req: Request, res: Response) => {
  // TODO: Get userId from auth middleware
  // TODO: Fetch interviews from database with pagination

  res.json({ success: true, data: [], pagination: { page: 1, total: 0 } });
});

/**
 * GET /api/interviews/:id
 * Fetches a single interview with its messages.
 */
export const getInterview = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  // TODO: Fetch interview from database
  // TODO: Verify ownership

  res.json({ success: true, data: { id, status: "in-progress", messages: [] } });
});

/**
 * POST /api/interviews/:id/message
 * User submits an answer → AI generates the next question.
 */
export const submitAnswer = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { content } = req.body;

  // TODO: Save user message to database
  // TODO: Call AI service to evaluate answer + generate next question
  // TODO: Save AI response to database

  const aiResponse = {
    id: `msg_${Date.now()}`,
    role: "ai",
    content: "That's a great answer. Let me follow up with another question...",
    timestamp: new Date().toISOString(),
  };

  res.json({ success: true, data: aiResponse });
});

/**
 * POST /api/interviews/:id/end
 * Ends the interview and queues the evaluation job.
 */
export const endInterview = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  // TODO: Update interview status to "evaluating"
  // TODO: Queue evaluation job via BullMQ
  // TODO: Return immediately (background worker handles heavy AI evaluation)

  res.json({
    success: true,
    message: "Interview ended. Generating your scorecard...",
    data: { id, status: "evaluating" },
  });
});

/**
 * GET /api/interviews/:id/results
 * Returns the evaluated scorecard and feedback.
 */
export const getResults = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  // TODO: Fetch evaluation results from database
  // TODO: Return 202 if still processing

  res.json({
    success: true,
    data: {
      id,
      overallScore: 85,
      status: "completed",
      categories: [],
      strengths: [],
      weaknesses: [],
      questions: [],
    },
  });
});
