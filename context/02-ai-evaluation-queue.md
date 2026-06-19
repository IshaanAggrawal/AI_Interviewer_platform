# AI Evaluation Queue Implementation

## Issue
Generating a full feedback report with Llama-3 takes 10-30 seconds. Performing this synchronously on the Express endpoint (`POST /api/interviews/:id/end`) would cause the request to time out or block the main thread.

## Solution
1. **BullMQ Background Worker**: Created `evaluationWorker` in `queue.service.ts`.
2. **End Interview Controller**: Updated `endInterview` in `interview.controller.ts` to immediately return `status: "evaluating"` and dispatch a job to the `evaluationQueue`.
3. **Queue Logic**: 
   - The worker fetches the full conversation transcript from Prisma.
   - It sends the transcript to Groq (`ai.service.ts` -> `generateFeedbackReport`).
   - It stores the resulting JSON (overallScore, strengths, weaknesses, recommendation, categories) into the `Evaluation` database table.
   - It updates the `Interview` status to `COMPLETED`.
