import { z } from "zod";

export const createInterviewSchema = z.object({
  company: z.string().min(1, "Company is required"),
  role: z.string().min(1, "Role is required"),
  experience: z.string().min(1, "Experience level is required"),
  mode: z.enum(["text", "voice"]).default("text"),
  resumeId: z.string().optional(),
});

export const submitAnswerSchema = z.object({
  content: z.string().min(1, "Answer content is required"),
});

export type CreateInterviewInput = z.infer<typeof createInterviewSchema>;
export type SubmitAnswerInput = z.infer<typeof submitAnswerSchema>;
