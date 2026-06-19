import { Server, Socket } from "socket.io";
import { prisma } from "../lib/prisma";
import * as deepgramService from "../services/deepgram.service";
import * as aiService from "../services/ai.service";

export const initializeInterviewSocket = (io: Server) => {
  const interviewNamespace = io.of("/interview");

  interviewNamespace.on("connection", (socket: Socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    socket.on("join_interview", (data: { interviewId: string }) => {
      socket.join(data.interviewId);
      console.log(`[Socket] ${socket.id} joined interview ${data.interviewId}`);
    });

    socket.on("send_message", async (data: { interviewId: string, audio?: Buffer, text?: string }) => {
      const { interviewId, audio, text } = data;

      try {
        let userContent = text;

        if (audio) {
          userContent = await deepgramService.transcribeAudio(audio, "audio/webm");
        }

        if (!userContent) {
          socket.emit("error", { message: "Failed to transcribe audio or no text provided." });
          return;
        }

        // Echo transcribed text back so the user sees it immediately
        socket.emit("user_transcript", { text: userContent });

        // 1. Fetch Interview Data
        const interview = await prisma.interview.findUnique({
          where: { id: interviewId },
          include: { resume: true, messages: { orderBy: { createdAt: "asc" } } },
        });

        if (!interview) {
          socket.emit("error", { message: "Interview not found" });
          return;
        }

        // 2. Save User Message
        await prisma.message.create({
          data: {
            interviewId,
            role: "USER",
            content: userContent,
          },
        });

        // 3. Prepare AI Context
        const history = interview.messages.map((m: any) => ({
          role: m.role === "USER" ? "user" : "ai",
          content: m.content,
        })) as { role: "user" | "ai"; content: string }[];
        history.push({ role: "user", content: userContent });

        const context = {
          company: interview.company,
          role: interview.role,
          experienceLevel: interview.experience,
          mode: interview.mode,
        };
        const resumeText = interview.resume?.parsedText || null;

        // 4. Start LLM Stream
        const stream = await aiService.generateNextQuestionStream(context, resumeText, history);
        
        socket.emit("ai_start");

        let fullAiText = "";
        let sentenceBuffer = "";

        // 5. Process Stream and Sentence Boundary TTS
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || "";
          fullAiText += content;
          sentenceBuffer += content;

          // Emit text token immediately for UI typing effect
          socket.emit("text_chunk", { text: content });

          // Basic sentence boundary detection
          if (/[.?!]\s/.test(sentenceBuffer) || sentenceBuffer.length > 150) {
            const sentenceToSpeak = sentenceBuffer.trim();
            sentenceBuffer = ""; // Reset buffer

            if (sentenceToSpeak && (interview.mode === "VOICE" || audio)) {
              // Fire and forget TTS generation (we await it but run it sequentially to keep order)
              try {
                const audioBuffer = await deepgramService.generateSpeech(sentenceToSpeak);
                socket.emit("audio_chunk", { audio: audioBuffer.toString("base64") });
              } catch (ttsErr) {
                console.error("Failed to generate TTS chunk:", ttsErr);
              }
            }
          }
        }

        // Process any remaining text in buffer
        if (sentenceBuffer.trim().length > 0 && (interview.mode === "VOICE" || audio)) {
          try {
            const audioBuffer = await deepgramService.generateSpeech(sentenceBuffer.trim());
            socket.emit("audio_chunk", { audio: audioBuffer.toString("base64") });
          } catch (ttsErr) {
             console.error("Failed to generate TTS chunk:", ttsErr);
          }
        }

        socket.emit("ai_end");

        // 6. Save AI Message
        await prisma.message.create({
          data: {
            interviewId,
            role: "AI",
            content: fullAiText,
          },
        });

      } catch (err: any) {
        console.error("Socket send_message error:", err);
        socket.emit("error", { message: err.message || "An error occurred" });
      }
    });

    socket.on("disconnect", () => {
      console.log(`[Socket] Client disconnected: ${socket.id}`);
    });
  });
};
