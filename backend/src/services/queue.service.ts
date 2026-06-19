import { Queue, Worker, Job } from "bullmq";
import IORedis from "ioredis";
import config from "../config";

// ─── Redis Connection (shared by all queues) ───
const connection = new IORedis({
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password,
  maxRetriesPerRequest: null, // Required by BullMQ
});

// ─── Queue Definitions ───

/** Queue for generating interview feedback reports (heavy AI task) */
export const evaluationQueue = new Queue("evaluation", { connection });

/** Queue for parsing uploaded resumes */
export const resumeParsingQueue = new Queue("resume-parsing", { connection });

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

    // TODO: Fetch all Q&A from database
    // TODO: Call ai.service.generateFeedbackReport()
    // TODO: Save results to database
    // TODO: Notify frontend via WebSocket (optional)

    console.log(`✅ Evaluation complete for interview: ${interviewId}`);
    return { interviewId, status: "completed" };
  },
  { connection, concurrency: 3 }
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
  { connection, concurrency: 2 }
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
