import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/async-handler";
import { AppError } from "../middlewares/error-handler";
import { getAuth } from "@clerk/express";
import { prisma } from "../lib/prisma";
import * as deepgramService from "../services/deepgram.service";
import * as aiService from "../services/ai.service";
import { getOrCreateLocalUser } from "../services/user.service";

/**
 * POST /api/interviews
 * Creates a new interview session based on company, role, experience, mode.
 */
export const createInterview = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = getAuth(req);
  if (!userId) {
    throw new AppError(401, "Unauthorized");
  }

  const { company, role, experience, mode, resumeId } = req.body;

  if (!company || !role || !experience || !mode) {
    throw new AppError(400, "Missing required fields");
  }

  const localUser = await getOrCreateLocalUser(userId);

  // Enforce tier limits
  const interviewCount = await prisma.interview.count({ where: { userId: localUser.id } });
  if (localUser.tier === "FREE" && interviewCount >= 2) {
    throw new AppError(403, "LIMIT_REACHED_FREE");
  }
  if (localUser.tier === "PRO" && interviewCount >= 10) {
    throw new AppError(403, "LIMIT_REACHED_PRO");
  }

  const interview = await prisma.interview.create({
    data: {
      userId: localUser.id,
      resumeId: resumeId || null,
      company,
      role,
      experience,
      mode: mode === "voice" ? "VOICE" : "TEXT",
      status: "IN_PROGRESS",
    },
  });

  res.status(201).json({ success: true, data: interview });
});

/**
 * GET /api/interviews
 * Lists all interviews for the authenticated user.
 */
export const listInterviews = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = getAuth(req);
  if (!userId) {
    throw new AppError(401, "Unauthorized");
  }

  const localUser = await getOrCreateLocalUser(userId);

  const interviews = await prisma.interview.findMany({
    where: { userId: localUser.id },
    orderBy: { createdAt: "desc" },
  });

  res.json({ success: true, data: interviews, pagination: { page: 1, total: interviews.length } });
});

/**
 * GET /api/interviews/:id
 * Fetches a single interview with its messages.
 */
export const getInterview = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;

  // TODO: Fetch interview from database
  // TODO: Verify ownership

  res.json({ success: true, data: { id, status: "in-progress", messages: [] } });
});

/**
 * POST /api/interviews/:id/message
 * User submits an answer → AI generates the next question.
 */
export const submitAnswer = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const file = req.file;
  let userContent = req.body.content;

  // 1. STT (Speech-to-Text) if audio is uploaded
  if (file) {
    userContent = await deepgramService.transcribeAudio(file.buffer, file.mimetype);
  }

  if (!userContent) {
    throw new AppError(400, "Answer content or audio is required");
  }

  // 2. Fetch Interview and Resume
  const interview = await prisma.interview.findUnique({
    where: { id },
    include: { resume: true, messages: { orderBy: { createdAt: "asc" } } },
  });

  if (!interview) {
    throw new AppError(404, "Interview not found");
  }

  // 3. Save User Message
  await prisma.message.create({
    data: {
      interviewId: id,
      role: "USER",
      content: userContent,
    },
  });

  // 4. Prepare History for AI
  const history = interview.messages.map((m: any) => ({
    role: m.role === "USER" ? "user" : "ai",
    content: m.content,
  })) as { role: "user" | "ai"; content: string }[];
  history.push({ role: "user", content: userContent }); // include the latest

  // 5. AI Generates Next Question
  const context = {
    company: interview.company,
    role: interview.role,
    experienceLevel: interview.experience,
    mode: interview.mode,
  };
  const resumeText = interview.resume?.parsedText || null;
  const aiResponseText = await aiService.generateNextQuestion(context, resumeText, history);

  // 6. Save AI Message
  const aiMessage = await prisma.message.create({
    data: {
      interviewId: id,
      role: "AI",
      content: aiResponseText,
    },
  });

  // 7. TTS (Text-to-Speech) if Voice Mode
  let audioBase64 = null;
  if (interview.mode === "VOICE" || file) {
    const audioBuffer = await deepgramService.generateSpeech(aiResponseText);
    audioBase64 = audioBuffer.toString("base64");
  }

  res.json({
    success: true,
    data: {
      userContent, // Return transcribed text so frontend can display it
      aiMessage: {
        id: aiMessage.id,
        role: "ai",
        content: aiMessage.content,
        timestamp: aiMessage.createdAt.toISOString(),
      },
      audio: audioBase64,
    },
  });
});

/**
 * POST /api/interviews/:id/end
 * Ends the interview and queues the evaluation job.
 */
export const endInterview = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;

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
  const id = req.params.id as string;

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
