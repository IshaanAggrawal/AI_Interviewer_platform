import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/async-handler";
import { generateNextQuestion, evaluateSingleAnswer, generateFeedbackReport } from "../services/ai.service";
import prisma from "../lib/prisma";

/**
 * POST /api/ai/generate-question
 * Uses Groq to generate the next interview question based on context.
 */
export const generateQuestion = asyncHandler(async (req: Request, res: Response) => {
  const { company, role, experience, previousMessages, questionIndex } = req.body;

  const question = await generateNextQuestion(
    { company, role, experienceLevel: experience, mode: 'TEXT' },
    null,
    previousMessages || []
  );

  res.json({
    success: true,
    data: {
      question,
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

  const evaluation = await evaluateSingleAnswer(company, role, question, answer);

  res.json({
    success: true,
    data: {
      score: evaluation.score,
      feedback: evaluation.feedback,
      followUp: evaluation.followUp,
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

  const interview = await prisma.interview.findUnique({
    where: { id: interviewId },
    include: { messages: true, resume: true }
  });

  if (!interview) {
    return res.status(404).json({ success: false, message: "Interview not found" });
  }

  const context = {
    company: interview.company,
    role: interview.role,
    experienceLevel: interview.experience,
    mode: interview.mode
  };

  const history: { role: "user" | "ai", content: string }[] = interview.messages.map((m: any) => ({
    role: m.role === 'USER' ? 'user' : 'ai',
    content: m.content
  }));

  const report = await generateFeedbackReport(context, interview.resume?.parsedText || null, history);

  // Save evaluation results to database
  const evaluation = await prisma.evaluation.create({
    data: {
      interviewId,
      overallScore: report.overallScore,
      strengths: report.strengths,
      weaknesses: report.weaknesses,
      recommendation: report.recommendation,
      categories: {
        create: report.categories.map((c: any) => ({
          name: c.name,
          score: c.score
        }))
      }
    }
  });

  // Optionally update message scores if `questionsFeedback` is provided by Groq
  if (report.questionsFeedback) {
    for (const qf of report.questionsFeedback) {
      const msg = interview.messages.find((m: any) => m.role === 'USER' && m.content === qf.userAnswer);
      if (msg) {
        await prisma.message.update({
          where: { id: msg.id },
          data: { score: qf.score, feedback: qf.feedback }
        });
      }
    }
  }

  // Update interview overall score
  await prisma.interview.update({
    where: { id: interviewId },
    data: { overallScore: report.overallScore, status: "COMPLETED" }
  });

  res.json({
    success: true,
    data: {
      interviewId,
      overallScore: report.overallScore,
      strengths: report.strengths,
      weaknesses: report.weaknesses,
      categories: report.categories,
    },
  });
});
