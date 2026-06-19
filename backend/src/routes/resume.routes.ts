import { Router } from "express";
import * as resumeController from "../controllers/resume.controller";

const router = Router();

// POST /api/resumes/upload — Upload a resume to S3
router.post("/upload", resumeController.uploadResume);

// GET  /api/resumes/:id/download — Get a pre-signed download URL
router.get("/:id/download", resumeController.getDownloadUrl);

export default router;
