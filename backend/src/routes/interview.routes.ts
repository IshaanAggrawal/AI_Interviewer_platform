import { Router } from "express";
import multer from "multer";
import * as interviewController from "../controllers/interview.controller";
import { validate } from "../middlewares/validate";
import { createInterviewSchema } from "../validators/interview.validators";
import { cacheMiddleware } from "../middlewares/cache";

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

// POST /api/interviews — Create (init) a new interview session
router.post("/", validate(createInterviewSchema), interviewController.createInterview);

// GET  /api/interviews — List user's interviews
router.get("/", cacheMiddleware(60), interviewController.listInterviews);

// POST /api/interviews/tts — Generate TTS for a given text
router.post("/tts", interviewController.generateTts);

// GET  /api/interviews/:id — Get single interview detail
router.get("/:id", interviewController.getInterview);

// POST /api/interviews/:id/message — Submit an answer (text or audio) & get next question
router.post("/:id/message", upload.single("audio"), interviewController.submitAnswer);

// GET /api/interviews/:id/upload-url — Get presigned URL for recording upload
router.get("/:id/upload-url", interviewController.getUploadUrl);

// POST /api/interviews/:id/end — End interview & trigger evaluation
router.post("/:id/end", interviewController.endInterview);

// GET  /api/interviews/:id/results — Get evaluated results
router.get("/:id/results", interviewController.getResults);

export default router;
