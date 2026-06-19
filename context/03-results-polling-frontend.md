# Frontend Results Polling

## Issue
Since the AI evaluation runs in the background, the user is redirected to the Results page immediately after ending the interview, but the data isn't ready yet.

## Solution
1. **API Status Indication**: Updated `GET /api/interviews/:id/results` to return a `202 Accepted` status with `{ data: { status: "evaluating" } }` if the evaluation is still in progress.
2. **Frontend Polling**: Updated `frontend/src/app/interviews/[id]/results/page.tsx` with a `setTimeout` polling mechanism. If the response is `202` or `status === "evaluating"`, it displays a "Evaluating your interview..." loading state and retries the fetch every 3 seconds.
3. Once completed, it seamlessly transitions to the interactive scorecard using the real database records (no more mock data).
