import { Router } from "express";
import multer from "multer";
import * as resumeController from "../controllers/resume.controller";

const upload = multer({ storage: multer.memoryStorage() });

const router = Router();

// POST /api/resumes/upload — Upload a resume (Parsed in-memory)
router.post("/upload", upload.single("file"), resumeController.uploadResume);

// GET /api/resumes — List all user resumes
router.get("/", resumeController.listResumes);

// GET  /api/resumes/:id/download — Get a pre-signed download URL
router.get("/:id/download", resumeController.getDownloadUrl);

export default router;
