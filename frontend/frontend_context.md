# Frontend & API Architecture Plan

This document outlines the detailed UI plan for the frontend and how each page interacts with the backend APIs.

## 1. Landing Page (`/`)
**Purpose:** A stunning, enterprise-grade marketing page to convert visitors.
**UI Components:**
- **Hero Section:** Catchy headline, dynamic background (glassmorphism/gradients), and a clear Call-to-Action (CTA).
- **Features Showcase:** Cards highlighting AI Evaluation, Voice Interviews, and Company-specific mocks.
- **How it Works:** Step-by-step visual guide.
- **Navbar:** Logo, standard links, and Clerk Auth buttons (`Sign In` / `Get Started`).
**Backend APIs:** 
- None required (Static marketing content). Handled by Clerk for Auth.

## 2. User Dashboard (`/dashboard`)
**Purpose:** The central hub for the user to view their progress and start new interviews.
**UI Components:**
- **Stats Overview Cards:** Total Interviews, Average Score, Top Skills.
- **Recent Interviews Table:** List of past mock interviews with date, role, company, and score.
- **"Start New Interview" Button:** Prominent floating action button or hero card.
**Backend APIs:**
- `GET /api/users/me` - Fetch user profile data.
- `GET /api/interviews` - Fetch the user's past interview history.

## 3. Interview Setup & Configuration (`/interviews/new`)
**Purpose:** Form to configure the mock interview.
**UI Components:**
- **Resume Upload Dropzone:** Drag-and-drop area for PDF resumes (to tailor questions).
- **Company Selector:** Dropdown to select target company (Google, Amazon, etc.).
- **Role & Experience:** Inputs for specific role (e.g., Frontend Engineer) and experience level.
- **Mode Selector:** Toggle between Text Chat and Voice Mode.
**Backend APIs:**
- `POST /api/resumes/upload` - Uploads PDF to AWS S3 and queues parsing (BullMQ).
- `POST /api/interviews/init` - Creates a new interview session in PostgreSQL based on selected config.

## 4. The Interview Room (`/interviews/live/:id`)
**Purpose:** The actual AI interviewing interface. Must feel responsive and modern.
**UI Components:**
- **Chat Interface (Text Mode):** Message bubbles for AI questions and User answers. Typing indicators.
- **Voice Visualizer (Voice Mode):** Microphone status, waveform animation when speaking.
- **Timer & Progress Bar:** Showing how much time is left or which round the user is on.
- **Control Bar:** End Interview, Mute, Skip Question.
**Backend APIs:**
- `GET /api/interviews/:id` - Fetch current interview state.
- `POST /api/interviews/:id/message` - Sends user's answer (text) and receives the next AI generated question via Groq.
- *Voice:* Deepgram API (Speech-to-Text) converts voice to text before sending to the backend, or we stream audio to the backend and handle it there.
- `POST /api/interviews/:id/end` - Triggers the background job to generate the final scorecard.

## 5. Scorecard & Feedback Report (`/interviews/:id/results`)
**Purpose:** Detailed post-interview analysis.
**UI Components:**
- **Overall Score Circle:** Big, animated score indicator.
- **Strengths & Weaknesses:** Detailed markdown-rendered feedback from Groq.
- **Q&A Breakdown:** Expandable list showing every question, the user's answer, and AI's specific critique.
- **Export to PDF:** Button to download the report.
**Backend APIs:**
- `GET /api/interviews/:id/results` - Fetch the evaluated feedback and scores.
- `GET /api/reports/:id/download` - Fetch pre-generated PDF from S3.

## 6. Admin Panel (Optional / Phase 4) (`/admin`)
**Purpose:** For you to monitor platform usage.
**UI Components:**
- Platform-wide stats (total users, total interviews conducted).
**Backend APIs:**
- `GET /api/admin/stats` - Aggregated platform metrics.
