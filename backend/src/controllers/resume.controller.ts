import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/async-handler";

/**
 * POST /api/resumes/upload
 * Uploads a resume PDF to AWS S3 and saves the metadata.
 */
export const uploadResume = asyncHandler(async (req: Request, res: Response) => {
  // TODO: Use multer to extract file from multipart form
  // TODO: Upload to S3 using aws-sdk
  // TODO: Queue resume parsing job via BullMQ
  // TODO: Save resume metadata in database

  res.status(201).json({
    success: true,
    data: {
      id: `resume_${Date.now()}`,
      fileName: "resume.pdf",
      s3Key: "resumes/user_123/resume.pdf",
      status: "parsing",
    },
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
