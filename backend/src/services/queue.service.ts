import { Queue, Worker, Job } from "bullmq";
import IORedis from "ioredis";
import config from "../config";
import { prisma } from "../lib/prisma";
import * as aiService from "./ai.service";

// ─── Redis Connection (shared by all queues) ───
const connection = new IORedis(config.redisUrl, {
  maxRetriesPerRequest: null, // Required by BullMQ
});

connection.on("error", (err) => {
  console.error("Redis Queue Connection Error:", err.message);
});

// ─── Queue Definitions ───

/** Queue for generating interview feedback reports (heavy AI task) */
export const evaluationQueue = new Queue("evaluation", { connection: connection as any });

/** Queue for parsing uploaded resumes */
export const resumeParsingQueue = new Queue("resume-parsing", { connection: connection as any });

// ─── Worker Definitions ───

/**
 * Evaluation Worker
 * Processes interview evaluation jobs in the background.
 * This prevents the main Express thread from blocking on heavy Groq calls.
 */
export const evaluationWorker = new Worker(
  "evaluation",
  async (job: Job) => {
    const { interviewId } = job.data;
    console.log(`🔄 Processing evaluation for interview: ${interviewId}`);

    // Fetch interview, messages, and resume
    const interview = await prisma.interview.findUnique({
      where: { id: interviewId },
      include: {
        messages: { orderBy: { createdAt: "asc" } },
        resume: true,
      },
    });

    if (!interview) {
      throw new Error("Interview not found");
    }

    const history = interview.messages.map((m: any) => ({
      role: m.role === "USER" ? "user" : "ai",
      content: m.content,
    })) as { role: "user" | "ai"; content: string }[];

    const context = {
      company: interview.company,
      role: interview.role,
      experienceLevel: interview.experience,
      mode: interview.mode,
    };

    const resumeText = interview.resume?.parsedText || null;

    const existingEval = await prisma.evaluation.findUnique({
      where: { interviewId },
    });

    if (existingEval) {
      console.log(`⚠️ Evaluation already exists for interview ${interviewId}, skipping scorecard generation.`);
      await prisma.interview.update({
        where: { id: interviewId },
        data: {
          status: "COMPLETED",
          overallScore: existingEval.overallScore,
        },
      });
      return { interviewId, status: "completed" };
    }

    // Generate feedback report via AI
    console.log(`🧠 Calling Groq to generate scorecard...`);
    const report = await aiService.generateFeedbackReport(context, resumeText, history);

    // Save evaluation results
    const evaluation = await prisma.evaluation.create({
      data: {
        interviewId,
        overallScore: report.overallScore || 0,
        strengths: report.strengths || [],
        weaknesses: report.weaknesses || [],
        recommendation: report.recommendation,
        categories: {
          create: (report.categories || []).map((c: any) => ({
            name: c.name,
            score: c.score,
          })),
        },
      },
    });

    // Update per-message feedback
    if (report.questionsFeedback && Array.isArray(report.questionsFeedback)) {
      const userMessages = interview.messages.filter((m: any) => m.role === "USER");

      for (let i = 0; i < report.questionsFeedback.length; i++) {
        const feedbackItem = report.questionsFeedback[i];
        // Try exact match first
        let matchedMsg = userMessages.find((m: any) => m.content.trim() === feedbackItem.userAnswer?.trim());

        // Fallback to sequential matching if lengths align
        if (!matchedMsg && userMessages.length === report.questionsFeedback.length) {
          matchedMsg = userMessages[i];
        }

        if (matchedMsg) {
          await prisma.message.update({
            where: { id: matchedMsg.id },
            data: {
              score: feedbackItem.score,
              feedback: feedbackItem.feedback
            }
          });
        }
      }
    }

    // Update interview status and score
    await prisma.interview.update({
      where: { id: interviewId },
      data: {
        status: "COMPLETED",
        overallScore: report.overallScore || 0,
      },
    });

    console.log(`✅ Evaluation complete for interview: ${interviewId}`);
    return { interviewId, status: "completed" };
  },
  { connection: connection as any, concurrency: 3 }
);

/**
 * Resume Parsing Worker
 * Parses uploaded PDFs and extracts skills/experience.
 */
export const resumeParsingWorker = new Worker(
  "resume-parsing",
  async (job: Job) => {
    const { resumeId, s3Key } = job.data;
    console.log(`📄 Parsing resume: ${resumeId}`);

    // TODO: Download PDF from S3
    // TODO: Extract text (use pdf-parse library)
    // TODO: Use Groq to extract structured data (skills, experience)
    // TODO: Save parsed data to database

    console.log(`✅ Resume parsed: ${resumeId}`);
    return { resumeId, status: "parsed" };
  },
  { connection: connection as any, concurrency: 2 }
);

// ─── Error Handlers ───
evaluationWorker.on("failed", (job, err) => {
  console.error(`❌ Evaluation job ${job?.id} failed:`, err.message);
});

resumeParsingWorker.on("failed", (job, err) => {
  console.error(`❌ Resume parsing job ${job?.id} failed:`, err.message);
});

// ─── Helper to add jobs ───
export async function queueEvaluation(interviewId: string) {
  await evaluationQueue.add("evaluate", { interviewId }, {
    attempts: 3,
    backoff: { type: "exponential", delay: 2000 },
  });
}

export async function queueResumeParsing(resumeId: string, s3Key: string) {
  await resumeParsingQueue.add("parse", { resumeId, s3Key }, {
    attempts: 3,
    backoff: { type: "exponential", delay: 1000 },
  });
}
