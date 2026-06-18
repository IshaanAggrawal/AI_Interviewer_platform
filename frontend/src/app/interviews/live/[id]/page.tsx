"use client";

import { useState, useEffect, useRef } from "react";
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
  Volume2,
  BrainCircuit,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Mock AI messages for demo
const mockAIQuestions = [
  "Hi! I'm your AI interviewer today. Let's begin with a warm-up question. Can you tell me about yourself and what excites you about this role?",
  "Great answer. Now let's move to a technical question. Can you explain how you would design a real-time notification system for a social media platform? Think about scale, persistence, and delivery guarantees.",
  "Interesting approach. How would you handle the case where a user is offline when the notification is sent? What storage and retry mechanisms would you use?",
  "Good thinking. Let's switch to a coding problem. Given a stream of events, how would you implement a rate limiter that allows N requests per minute per user?",
];

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export default function InterviewRoomPage() {
  const router = useRouter();
  const {
    config,
    messages,
    addMessage,
    isRecording,
    setIsRecording,
    isAiSpeaking,
    setIsAiSpeaking,
    elapsedSeconds,
    setElapsedSeconds,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    totalQuestions,
  } = useInterviewStore();

  const [inputText, setInputText] = useState("");
  const [isAiTyping, setIsAiTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const mode = config.mode || "text";

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

  // First AI message on mount
  useEffect(() => {
    if (messages.length === 0) {
      setIsAiTyping(true);
      setIsAiSpeaking(true);
      setTimeout(() => {
        addMessage({ role: "ai", content: mockAIQuestions[0] });
        setIsAiTyping(false);
        setIsAiSpeaking(false);
        setCurrentQuestionIndex(1);
      }, 2000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    addMessage({ role: "user", content: inputText.trim() });
    setInputText("");

    // Simulate AI response
    setIsAiTyping(true);
    setIsAiSpeaking(true);
    const nextQ =
      mockAIQuestions[currentQuestionIndex] ||
      "That was the final question. Great job! Let me generate your scorecard now.";
    setTimeout(() => {
      addMessage({ role: "ai", content: nextQ });
      setIsAiTyping(false);
      setIsAiSpeaking(false);
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }, 2500);
  };

  const handleEndInterview = () => {
    router.push("/interviews/mock-session-1/results");
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      // Simulate voice input
      setTimeout(() => {
        addMessage({
          role: "user",
          content:
            "I would design the system using a pub-sub architecture with Redis as the message broker...",
        });
        setIsRecording(false);

        // AI responds
        setIsAiTyping(true);
        setIsAiSpeaking(true);
        const nextQ =
          mockAIQuestions[currentQuestionIndex] ||
          "That concludes our interview. Let me prepare your scorecard.";
        setTimeout(() => {
          addMessage({ role: "ai", content: nextQ });
          setIsAiTyping(false);
          setIsAiSpeaking(false);
          setCurrentQuestionIndex(currentQuestionIndex + 1);
        }, 2500);
      }, 3000);
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

          <Button
            size="sm"
            className="rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30"
            onClick={handleEndInterview}
          >
            <PhoneOff className="mr-1.5 h-4 w-4" />
            End
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
