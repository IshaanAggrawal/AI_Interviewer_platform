import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/async-handler";
import { AppError } from "../middlewares/error-handler";
import { extractTextFromPdf } from "../services/resume.service";
import { prisma } from "../lib/prisma";
import { getAuth } from "@clerk/express";
import { getOrCreateLocalUser } from "../services/user.service";

/**
 * POST /api/resumes/upload
 * Uploads a resume PDF to AWS S3 and saves the metadata.
 */
export const uploadResume = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = getAuth(req);
  if (!userId) {
    throw new AppError(401, "Unauthorized");
  }

  const file = req.file;
  if (!file) {
    throw new AppError(400, "No resume file provided");
  }

  // Extract text in-memory
  const parsedText = await extractTextFromPdf(file.buffer);

  // Use AI here to extract specific skills from parsedText in the future
  // For now, we'll just save the raw text to the database
  // Get or create the local user to satisfy foreign key constraints
  const localUser = await getOrCreateLocalUser(userId);

  const resume = await prisma.resume.create({
    data: {
      userId: localUser.id,
      fileName: file.originalname,
      s3Key: "in-memory-parsed", // Since we removed S3, we use a placeholder or make it optional in schema
      parsedText,
      status: "PARSED",
    },
  });

  res.status(201).json({
    success: true,
    data: resume,
  });
});

/**
 * GET /api/resumes/:id/download
 * Generates a pre-signed S3 URL for downloading the resume.
 */
export const getDownloadUrl = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  // TODO: Fetch resume metadata from database
  // TODO: Generate pre-signed URL using @aws-sdk/s3-request-presigner

  res.json({
    success: true,
    data: {
      id,
      downloadUrl: "https://s3.amazonaws.com/bucket/resume.pdf?signed=...",
      expiresIn: 3600,
    },
  });
});

/**
 * GET /api/resumes
 * Lists all resumes uploaded by the user.
 */
export const listResumes = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = getAuth(req);
  if (!userId) {
    throw new AppError(401, "Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (!user) {
    return res.json({ success: true, data: [] });
  }

  const resumes = await prisma.resume.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  res.json({
    success: true,
    data: resumes,
  });
});

/**
 * DELETE /api/resumes/:id
 * Deletes a resume.
 */
export const deleteResume = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = getAuth(req);
  if (!userId) {
    throw new AppError(401, "Unauthorized");
  }

  const id = req.params.id as string;
  const localUser = await getOrCreateLocalUser(userId);

  const resume = await prisma.resume.findUnique({
    where: { id },
  });

  if (!resume) {
    throw new AppError(404, "Resume not found");
  }

  if (resume.userId !== localUser.id) {
    throw new AppError(403, "Permission denied");
  }

  await prisma.resume.delete({
    where: { id },
  });

  res.json({
    success: true,
    message: "Resume deleted successfully",
  });
});
