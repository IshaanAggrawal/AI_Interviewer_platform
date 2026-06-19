import { create } from "zustand";

export type InterviewMode = "text" | "voice";
export type InterviewStatus = "idle" | "setup" | "in-progress" | "evaluating" | "completed";

export interface Message {
  id: string;
  role: "ai" | "user";
  content: string;
  timestamp: Date;
}

export interface InterviewConfig {
  company: string;
  role: string;
  experience: string;
  mode: InterviewMode;
  resumeFile: File | null;
}

export interface InterviewResult {
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  questions: {
    question: string;
    answer: string;
    score: number;
    feedback: string;
  }[];
}

interface InterviewState {
  // Config
  config: InterviewConfig;
  setConfig: (config: Partial<InterviewConfig>) => void;

  // Live interview state
  status: InterviewStatus;
  setStatus: (status: InterviewStatus) => void;
  messages: Message[];
  addMessage: (message: Omit<Message, "id" | "timestamp">) => void;
  updateLastMessage: (content: string) => void;
  clearMessages: () => void;

  // Voice state
  isSpeaking: boolean;
  setIsSpeaking: (isSpeaking: boolean) => void;
  isAiSpeaking: boolean;
  setIsAiSpeaking: (isAiSpeaking: boolean) => void;
  isRecording: boolean;
  setIsRecording: (isRecording: boolean) => void;

  // Timer
  elapsedSeconds: number;
  setElapsedSeconds: (seconds: number) => void;

  // Current question tracking
  currentQuestionIndex: number;
  totalQuestions: number;
  setCurrentQuestionIndex: (index: number) => void;
  setTotalQuestions: (total: number) => void;

  // Results
  result: InterviewResult | null;
  setResult: (result: InterviewResult) => void;

  // Reset
  reset: () => void;
}

const initialConfig: InterviewConfig = {
  company: "",
  role: "",
  experience: "",
  mode: "text",
  resumeFile: null,
};

export const useInterviewStore = create<InterviewState>((set) => ({
  config: initialConfig,
  setConfig: (config) =>
    set((state) => ({ config: { ...state.config, ...config } })),

  status: "idle",
  setStatus: (status) => set({ status }),

  messages: [],
  addMessage: (message) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          ...message,
          id: crypto.randomUUID(),
          timestamp: new Date(),
        },
      ],
    })),
  updateLastMessage: (content) =>
    set((state) => {
      const messages = [...state.messages];
      if (messages.length > 0) {
        messages[messages.length - 1].content += content;
      }
      return { messages };
    }),
  clearMessages: () => set({ messages: [] }),

  isSpeaking: false,
  setIsSpeaking: (isSpeaking) => set({ isSpeaking }),
  isAiSpeaking: false,
  setIsAiSpeaking: (isAiSpeaking) => set({ isAiSpeaking }),
  isRecording: false,
  setIsRecording: (isRecording) => set({ isRecording }),

  elapsedSeconds: 0,
  setElapsedSeconds: (seconds) => set({ elapsedSeconds: seconds }),

  currentQuestionIndex: 0,
  totalQuestions: 8,
  setCurrentQuestionIndex: (index) => set({ currentQuestionIndex: index }),
  setTotalQuestions: (total) => set({ totalQuestions: total }),

  result: null,
  setResult: (result) => set({ result }),

  reset: () =>
    set({
      config: initialConfig,
      status: "idle",
      messages: [],
      isSpeaking: false,
      isAiSpeaking: false,
      isRecording: false,
      elapsedSeconds: 0,
      currentQuestionIndex: 0,
      totalQuestions: 8,
      result: null,
    }),
}));
