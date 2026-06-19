# Per-Question Scoring

## Issue
The AI was only giving an overall score and general feedback. The UI had interactive dropdowns for each specific question, but they were empty.

## Solution
1. **Prompt Engineering**: Updated the `EVALUATION_PROMPT` inside `ai.service.ts` to instruct the Llama-3 model to return a `questionsFeedback` array in its JSON payload, containing a 0-100 score and specific feedback for *each individual user answer*.
2. **Database Update**: Updated `evaluationWorker` in `queue.service.ts` to iterate through this array, match the text to the original `Message` records, and save the `score` and `feedback` to the database using `prisma.message.update`.
3. **Frontend UI**: Modified `results/page.tsx` to read `msg.score` and `msg.feedback` while parsing the chat history, populating the individual question cards with badges and targeted AI feedback.
