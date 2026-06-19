# Deepgram TTS for Initial Greeting

## Issue
Speech-To-Text (STT) and Text-To-Speech (TTS) worked perfectly for all mid-interview messages via the `/message` endpoint, but the AI's *first* greeting wasn't being spoken out loud in Voice Mode.

## Solution
1. **New TTS Route**: Added a dedicated `POST /api/interviews/tts` endpoint in `interview.controller.ts` that takes any text and returns Deepgram-generated audio.
2. **Frontend Wiring**: Updated the initial mounting logic in `live/[id]/page.tsx` so that when the interview starts in `voice` mode, it immediately fetches the TTS for the dynamic greeting and plays it using the `playBase64Audio` hook.
