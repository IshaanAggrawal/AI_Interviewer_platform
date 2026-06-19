import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/async-handler";

/**
 * POST /api/ai/generate-question
 * Uses Groq to generate the next interview question based on context.
 */
export const generateQuestion = asyncHandler(async (req: Request, res: Response) => {
  const { company, role, experience, previousMessages, questionIndex } = req.body;

  // TODO: Build system prompt based on company/role/experience
  // TODO: Call Groq API with conversation history
  // TODO: Return generated question

  res.json({
    success: true,
    data: {
      question: "Can you explain how you would design a URL shortener?",
      questionIndex: questionIndex + 1,
    },
  });
});

/**
 * POST /api/ai/evaluate-answer
 * Evaluates a single answer using Groq.
 */
export const evaluateAnswer = asyncHandler(async (req: Request, res: Response) => {
  const { question, answer, company, role } = req.body;

  // TODO: Call Groq with evaluation prompt
  // TODO: Parse structured response (score, feedback)

  res.json({
    success: true,
    data: {
      score: 85,
      feedback: "Good answer with solid technical depth...",
      followUp: "How would you handle cache invalidation in this system?",
    },
  });
});

/**
 * POST /api/ai/generate-feedback
 * Generates a comprehensive feedback report for the entire interview.
 * This is typically called by a BullMQ worker, not directly by the user.
 */
export const generateFeedback = asyncHandler(async (req: Request, res: Response) => {
  const { interviewId } = req.body;

  // TODO: Fetch all Q&A pairs from the database
  // TODO: Call Groq to generate comprehensive feedback
  // TODO: Save evaluation results to database

  res.json({
    success: true,
    data: {
      interviewId,
      overallScore: 85,
      strengths: [],
      weaknesses: [],
      categories: [],
    },
  });
});
