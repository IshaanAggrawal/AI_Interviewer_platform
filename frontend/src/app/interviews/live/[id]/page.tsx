"use client";

import { useState, useEffect, useRef, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useInterviewStore } from "@/store/interview-store";
import {
  Mic,
  MicOff,
  Send,
  PhoneOff,
  Clock,
  SkipForward,
  BrainCircuit,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useApiClient } from "@/lib/api";
import { useAuth } from "@clerk/nextjs";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";

// Generate a dynamic greeting based on config
const getInitialGreeting = (config: any) => {
  if (config?.role && config?.company) {
    return `Hello! I'm your AI interviewer today. I see you're applying for the ${config.role} position at ${config.company}. To get started, could you tell me a little bit about yourself and your background?`;
  }
  return "Hello! I'm your AI interviewer today. To get started, could you tell me a little bit about yourself and your background?";
};

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export default function InterviewRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const interviewId = resolvedParams.id;
  const router = useRouter();
  const {
    config,
    setConfig,
    messages,
    addMessage,
    clearMessages,
    isAiSpeaking,
    setIsAiSpeaking,
    elapsedSeconds,
    setElapsedSeconds,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    totalQuestions,
  } = useInterviewStore();

  const [inputText, setInputText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Continuous recording refs
  const continuousRecorderRef = useRef<MediaRecorder | null>(null);
  const continuousChunksRef = useRef<Blob[]>([]);
  const [isEnding, setIsEnding] = useState(false);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const mode = config.mode || "text";

  const { getToken } = useAuth();
  const api = useApiClient(getToken);

  const { isRecording, startRecording, stopRecording } = useAudioRecorder();
  const { playBase64Audio, stopAudio } = useAudioPlayer();

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds(elapsedSeconds + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [elapsedSeconds, setElapsedSeconds]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isAiTyping]);

  // Continuous full-session recording
  useEffect(() => {
    let stream: MediaStream | null = null;
    const startContinuousRecording = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        continuousRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) continuousChunksRef.current.push(e.data);
        };

        mediaRecorder.start(1000); // capture in chunks of 1s
      } catch (err) {
        console.error("Continuous recording failed to start:", err);
      }
    };

    startContinuousRecording();

    return () => {
      if (continuousRecorderRef.current && continuousRecorderRef.current.state !== "inactive") {
        continuousRecorderRef.current.stop();
      }
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  // Fetch Interview History on mount
  useEffect(() => {
    let isMounted = true;
    const fetchInterview = async () => {
      try {
        const res = await api.get(`/interviews/${interviewId}`);
        const interviewData = res.data.data;

        if (isMounted) {
          // Restore config if the user reloaded
          setConfig({
            company: interviewData.company,
            role: interviewData.role,
            experience: interviewData.experience,
            mode: interviewData.mode === "VOICE" ? "voice" : "text",
          });

          // Load messages if they exist
          if (interviewData.messages && interviewData.messages.length > 0) {
            clearMessages();
            interviewData.messages.forEach((m: any) => {
              addMessage({ role: m.role.toLowerCase() as "ai" | "user", content: m.content });
            });
            // Approximate current question index based on AI messages
            const aiMessageCount = interviewData.messages.filter((m: any) => m.role === "AI").length;
            setCurrentQuestionIndex(Math.max(1, aiMessageCount));
          } else {
            // New interview: start with first AI question
            if (messages.length === 0) {
              setIsAiTyping(true);
              setIsAiSpeaking(true);
              
              const startGreeting = async () => {
                const greeting = getInitialGreeting(config);
                addMessage({ role: "ai", content: greeting });
                setIsAiTyping(false);
                
                try {
                  if (config.mode === "voice") {
                    const ttsRes = await api.post(`/interviews/tts`, { text: greeting });
                    if (ttsRes.data.data?.audio) {
                      await playBase64Audio(ttsRes.data.data.audio);
                    }
                  }
                } catch (e) {
                  console.error("Failed to play TTS for greeting", e);
                } finally {
                  setIsAiSpeaking(false);
                  setCurrentQuestionIndex(1);
                }
              };

              setTimeout(startGreeting, 1000);
            }
          }
        }
      } catch (error) {
        console.error("Failed to load interview history", error);
      }
    };

    fetchInterview();
    return () => { isMounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interviewId]);

  // Auto-end the interview if the user navigates away or unmounts the component
  useEffect(() => {
    return () => {
      // If we aren't already ending it explicitly via the button, gracefully end it.
      if (!isEnding) {
        api.post(`/interviews/${interviewId}/end`).catch(console.error);
      }
    };
  }, [api, interviewId, isEnding]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;
    const userMsg = inputText.trim();
    addMessage({ role: "user", content: userMsg });
    setInputText("");

    setIsAiTyping(true);
    setIsAiSpeaking(true);
    try {
      const res = await api.post(`/interviews/${interviewId}/message`, { content: userMsg });
      const { aiMessage, audio } = res.data.data;
      addMessage({ role: "ai", content: aiMessage.content });
      setIsAiTyping(false);

      if (audio) {
        await playBase64Audio(audio);
      }
      setIsAiSpeaking(false);
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } catch (e: any) {
      console.error(e);
      alert(`Error from AI: ${e.response?.data?.message || e.message}`);
      setIsAiTyping(false);
      setIsAiSpeaking(false);
    }
  };

  const handleEndInterview = async () => {
    if (isEnding) return;
    setIsEnding(true);

    try {
      let recordingUrl = null;

      if (continuousRecorderRef.current && continuousRecorderRef.current.state !== "inactive") {
        const recordingPromise = new Promise<Blob>((resolve) => {
          continuousRecorderRef.current!.onstop = () => {
            const blob = new Blob(continuousChunksRef.current, { type: "audio/webm" });
            resolve(blob);
          };
          continuousRecorderRef.current!.stop();
        });

        const fullAudioBlob = await recordingPromise;

        try {
          // 1. Get presigned URL
          const urlRes = await api.get(`/interviews/${interviewId}/upload-url`);
          const { url, publicUrl } = urlRes.data.data;

          // 2. Upload to S3 directly
          await fetch(url, {
            method: "PUT",
            body: fullAudioBlob,
            headers: { "Content-Type": "audio/webm" },
          });

          recordingUrl = publicUrl;
        } catch (uploadError) {
          console.error("Failed to upload recording to S3:", uploadError);
          // Don't block ending the interview if the upload fails (e.g., missing CORS)
        }
      }

      // 3. End interview and save URL
      await api.post(`/interviews/${interviewId}/end`, { recordingUrl });
      router.push(`/dashboard`); // Go to dashboard, since results might take time
    } catch (error) {
      console.error("Failed to end interview:", error);
      alert("Failed to end interview and save recording.");
      setIsEnding(false);
    }
  };

  const toggleRecording = async () => {
    if (!isRecording) {
      await startRecording();
    } else {
      const audioBlob = await stopRecording();
      if (audioBlob) {
        setIsAiTyping(true);
        setIsAiSpeaking(true);

        try {
          const formData = new FormData();
          formData.append("audio", audioBlob, "recording.webm");

          const res = await api.post(`/interviews/${interviewId}/message`, formData, {
            headers: { "Content-Type": "multipart/form-data" }
          });
          const { userContent, aiMessage, audio } = res.data.data;

          addMessage({ role: "user", content: userContent });
          addMessage({ role: "ai", content: aiMessage.content });
          setIsAiTyping(false);

          if (audio) {
            await playBase64Audio(audio);
          }
          setIsAiSpeaking(false);
          setCurrentQuestionIndex(currentQuestionIndex + 1);
        } catch (e: any) {
          console.error(e);
          alert(`Error processing audio: ${e.response?.data?.message || e.message}`);
          setIsAiTyping(false);
          setIsAiSpeaking(false);
        }
      }
    }
  };

  return (
    <div className="flex h-screen flex-col bg-[#0f1510] text-white">
      {/* ─── Top Bar ─── */}
      <header className="flex items-center justify-between border-b border-white/10 px-6 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-chart-3 text-xs font-bold">
            AI
          </div>
          <div>
            <p className="text-sm font-semibold">
              {config.company || "Google"} — {config.role || "Frontend Engineer"}
            </p>
            <p className="text-xs text-white/50">
              {config.experience || "Mid-Level"} · Question{" "}
              {Math.min(currentQuestionIndex, totalQuestions)} of{" "}
              {totalQuestions}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Timer */}
          <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-mono">
            <Clock className="h-3.5 w-3.5 text-primary" />
            {formatTime(elapsedSeconds)}
          </div>

          {/* Progress bar */}
          <div className="hidden w-32 items-center gap-2 md:flex">
            <div className="h-1.5 flex-1 rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-chart-3 transition-all duration-500"
                style={{
                  width: `${(Math.min(currentQuestionIndex, totalQuestions) / totalQuestions) * 100}%`,
                }}
              />
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="rounded-full text-white/60 hover:bg-white/10 hover:text-white"
            onClick={() =>
              setCurrentQuestionIndex(currentQuestionIndex + 1)
            }
          >
            <SkipForward className="mr-1 h-4 w-4" />
            Skip
          </Button>

          <Button variant="destructive" onClick={handleEndInterview} disabled={isEnding}>
            <PhoneOff className="mr-2 h-4 w-4" />
            {isEnding ? "Saving Recording..." : "End Interview"}
          </Button>
        </div>
      </header>

      {/* ─── Main Area ─── */}
      <div className="flex flex-1 overflow-hidden">
        {/* ─── Left: Avatars ─── */}
        <div className="hidden w-72 flex-col items-center justify-center gap-12 border-r border-white/10 bg-[#0a110b] lg:flex">
          {/* AI Avatar */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <div
                className={cn(
                  "flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary/30 to-chart-3/30 transition-all",
                  isAiSpeaking && "animate-pulse shadow-lg shadow-primary/20"
                )}
              >
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-chart-3">
                  <BrainCircuit className="h-10 w-10 text-white" />
                </div>
              </div>
              {/* Speaking rings */}
              {isAiSpeaking && (
                <>
                  <div className="absolute inset-0 animate-ping rounded-full border-2 border-primary/30" />
                  <div className="absolute -inset-2 animate-pulse rounded-full border border-primary/15" />
                </>
              )}
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold">AI Interviewer</p>
              <p className="text-xs text-white/40">
                {isAiSpeaking ? (
                  <span className="text-primary">Speaking...</span>
                ) : (
                  "Listening"
                )}
              </p>
            </div>
          </div>

          {/* Separator line */}
          <div className="h-px w-16 bg-white/10" />

          {/* User Avatar */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <div
                className={cn(
                  "flex h-24 w-24 items-center justify-center rounded-full bg-white/10 transition-all",
                  isRecording && "bg-primary/20 shadow-lg shadow-primary/20"
                )}
              >
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/15">
                  <User className="h-10 w-10 text-white/80" />
                </div>
              </div>
              {isRecording && (
                <>
                  <div className="absolute inset-0 animate-ping rounded-full border-2 border-red-400/40" />
                  <div className="absolute -inset-2 animate-pulse rounded-full border border-red-400/20" />
                </>
              )}
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold">You</p>
              <p className="text-xs text-white/40">
                {isRecording ? (
                  <span className="text-red-400">Recording...</span>
                ) : (
                  "Ready"
                )}
              </p>
            </div>
          </div>
        </div>

        {/* ─── Right: Chat / Transcript ─── */}
        <div className="flex flex-1 flex-col">
          {/* Messages */}
          <ScrollArea className="flex-1 p-6" ref={scrollRef}>
            <div className="mx-auto max-w-2xl space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex gap-3",
                    msg.role === "user" ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  {/* Avatar mini */}
                  <div
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                      msg.role === "ai"
                        ? "bg-gradient-to-br from-primary to-chart-3 text-white"
                        : "bg-white/15 text-white/80"
                    )}
                  >
                    {msg.role === "ai" ? (
                      <BrainCircuit className="h-4 w-4" />
                    ) : (
                      <User className="h-4 w-4" />
                    )}
                  </div>

                  {/* Bubble */}
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                      msg.role === "ai"
                        ? "rounded-tl-sm bg-white/10 text-white/90"
                        : "rounded-tr-sm bg-primary/20 text-white/90"
                    )}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {/* AI Typing indicator */}
              {isAiTyping && (
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-chart-3 text-white">
                    <BrainCircuit className="h-4 w-4" />
                  </div>
                  <div className="rounded-2xl rounded-tl-sm bg-white/10 px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <div className="h-2 w-2 animate-bounce rounded-full bg-primary/60 [animation-delay:0ms]" />
                      <div className="h-2 w-2 animate-bounce rounded-full bg-primary/60 [animation-delay:150ms]" />
                      <div className="h-2 w-2 animate-bounce rounded-full bg-primary/60 [animation-delay:300ms]" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* ─── Input Bar ─── */}
          <div className="border-t border-white/10 bg-[#0a110b] p-4">
            <div className="mx-auto flex max-w-2xl items-end gap-3">
              {mode === "voice" ? (
                /* Voice mode controls */
                <div className="flex flex-1 items-center justify-center gap-4">
                  <button
                    onClick={toggleRecording}
                    className={cn(
                      "flex h-16 w-16 items-center justify-center rounded-full transition-all",
                      isRecording
                        ? "bg-red-500 shadow-lg shadow-red-500/30 animate-pulse"
                        : "bg-white/15 hover:bg-white/20"
                    )}
                  >
                    {isRecording ? (
                      <MicOff className="h-7 w-7 text-white" />
                    ) : (
                      <Mic className="h-7 w-7 text-white/80" />
                    )}
                  </button>
                  <p className="text-xs text-white/40">
                    {isRecording
                      ? "Tap to stop recording"
                      : "Tap to start speaking"}
                  </p>
                </div>
              ) : (
                /* Text mode input */
                <>
                  <Textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Type your answer..."
                    className="min-h-[48px] max-h-32 flex-1 resize-none rounded-xl border-white/10 bg-white/10 text-white placeholder:text-white/30 focus-visible:ring-primary"
                    rows={1}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputText.trim()}
                    className="h-12 w-12 shrink-0 rounded-xl bg-gradient-to-r from-primary to-chart-3 text-white shadow-lg shadow-primary/20 transition hover:shadow-xl disabled:opacity-30 disabled:shadow-none"
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
