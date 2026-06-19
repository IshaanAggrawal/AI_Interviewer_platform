import { Router } from "express";
import * as interviewController from "../controllers/interview.controller";
import { validate } from "../middlewares/validate";
import { createInterviewSchema, submitAnswerSchema } from "../validators/interview.validators";

const router = Router();

// POST /api/interviews — Create (init) a new interview session
router.post("/", validate(createInterviewSchema), interviewController.createInterview);

// GET  /api/interviews — List user's interviews
router.get("/", interviewController.listInterviews);

// GET  /api/interviews/:id — Get single interview detail
router.get("/:id", interviewController.getInterview);

// POST /api/interviews/:id/message — Submit an answer & get next question
router.post("/:id/message", validate(submitAnswerSchema), interviewController.submitAnswer);

// POST /api/interviews/:id/end — End interview & trigger evaluation
router.post("/:id/end", interviewController.endInterview);

// GET  /api/interviews/:id/results — Get evaluated results
router.get("/:id/results", interviewController.getResults);

export default router;
