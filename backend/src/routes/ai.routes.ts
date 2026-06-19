import { Router } from "express";
import * as aiController from "../controllers/ai.controller";

const router = Router();

// POST /api/ai/generate-question — Generate the next interview question
router.post("/generate-question", aiController.generateQuestion);

// POST /api/ai/evaluate-answer — Evaluate a single answer
router.post("/evaluate-answer", aiController.evaluateAnswer);

// POST /api/ai/generate-feedback — Generate full interview feedback report
router.post("/generate-feedback", aiController.generateFeedback);

export default router;
