"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { useApiClient } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useInterviewStore } from "@/store/interview-store";
import {
  Upload,
  Mic,
  MessageSquare,
  ArrowLeft,
  ArrowRight,
  Building2,
  Briefcase,
  GraduationCap,
  FileText,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const companies = [
  "Google",
  "Amazon",
  "Meta",
  "Microsoft",
  "Apple",
  "Netflix",
  "Spotify",
  "Uber",
  "Stripe",
  "Other",
];

const roles = [
  "Frontend Engineer",
  "Backend Engineer",
  "Fullstack Developer",
  "DevOps Engineer",
  "Data Engineer",
  "ML Engineer",
  "Mobile Developer",
  "System Design",
];

const experienceLevels = [
  "Intern / New Grad",
  "Junior (1-2 years)",
  "Mid-Level (3-5 years)",
  "Senior (5-8 years)",
  "Staff / Principal (8+ years)",
];

export default function NewInterviewPage() {
  const router = useRouter();
  const { getToken } = useAuth();
  const api = useApiClient(getToken);
  const { config, setConfig } = useInterviewStore();
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isValid = config.company && config.role && config.experience;

  const handleFileChange = (file: File | null) => {
    if (file) {
      setFileName(file.name);
      setConfig({ resumeFile: file });
    }
  };

  const handleStart = async () => {
    if (!isValid) return;
    setIsLoading(true);

    try {
      let resumeId = null;

      // 1. Upload Resume if provided
      if (config.resumeFile) {
        const formData = new FormData();
        formData.append("file", config.resumeFile);
        
        const resumeRes = await api.post("/resumes/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        resumeId = resumeRes.data.data.id;
      }

      // 2. Create Interview
      const interviewRes = await api.post("/interviews", {
        company: config.company,
        role: config.role,
        experience: config.experience,
        mode: config.mode,
        resumeId,
      });

      const interviewId = interviewRes.data.data.id;
      
      // 3. Redirect to live session
      router.push(`/interviews/${interviewId}`);
    } catch (error) {
      console.error("Failed to start interview:", error);
      alert("Failed to start interview. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#09090b] text-white">
      {/* Top bar */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0a0a0c]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-6">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-chart-3 text-xs font-bold text-white">
              AI
            </div>
            <span className="text-base font-bold tracking-tight">
              Interviewer
            </span>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="mx-auto w-full max-w-2xl flex-1 px-6 py-12">
        <div className="mb-10 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Configure Your Interview
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Set up your mock interview session. The AI will tailor questions
            based on your selections.
          </p>
        </div>

        <div className="space-y-6">
          {/* Company */}
          <Card className="rounded-3xl border border-white/10 bg-[#111111] shadow-xl overflow-hidden relative group">
            <CardContent className="p-6">
              <label className="mb-2.5 flex items-center gap-2 text-sm font-semibold">
                <Building2 className="h-4 w-4 text-primary" />
                Target Company
              </label>
              <Select
                value={config.company}
                onValueChange={(v) => setConfig({ company: v || undefined })}
              >
                <SelectTrigger className="h-11 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
                  <SelectValue placeholder="Select a company" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Role */}
          <Card className="rounded-3xl border border-white/10 bg-[#111111] shadow-xl overflow-hidden relative group">
            <CardContent className="p-6">
              <label className="mb-2.5 flex items-center gap-2 text-sm font-semibold">
                <Briefcase className="h-4 w-4 text-primary" />
                Role
              </label>
              <Select
                value={config.role}
                onValueChange={(v) => setConfig({ role: v || undefined })}
              >
                <SelectTrigger className="h-11 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Experience */}
          <Card className="rounded-3xl border border-white/10 bg-[#111111] shadow-xl overflow-hidden relative group">
            <CardContent className="p-6">
              <label className="mb-2.5 flex items-center gap-2 text-sm font-semibold">
                <GraduationCap className="h-4 w-4 text-primary" />
                Experience Level
              </label>
              <Select
                value={config.experience}
                onValueChange={(v) => setConfig({ experience: v || undefined })}
              >
                <SelectTrigger className="h-11 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
                  <SelectValue placeholder="Select experience level" />
                </SelectTrigger>
                <SelectContent>
                  {experienceLevels.map((e) => (
                    <SelectItem key={e} value={e}>
                      {e}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Resume Upload */}
          <Card className="rounded-3xl border border-white/10 bg-[#111111] shadow-xl overflow-hidden relative group">
            <CardContent className="p-6">
              <label className="mb-2.5 flex items-center gap-2 text-sm font-semibold">
                <FileText className="h-4 w-4 text-primary" />
                Resume{" "}
                <span className="font-normal text-muted-foreground">
                  (optional)
                </span>
              </label>
              <div
                className={cn(
                  "relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 transition-all",
                  dragActive
                    ? "border-primary bg-primary/10"
                    : "border-white/10 bg-white/5 hover:border-primary/40 hover:bg-white/10"
                )}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragActive(false);
                  handleFileChange(e.dataTransfer.files[0] || null);
                }}
                onClick={() =>
                  document.getElementById("resume-input")?.click()
                }
              >
                <input
                  id="resume-input"
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) =>
                    handleFileChange(e.target.files?.[0] || null)
                  }
                />
                {fileName ? (
                  <>
                    <FileText className="mb-2 h-8 w-8 text-primary" />
                    <p className="text-sm font-semibold text-primary">
                      {fileName}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Click to replace
                    </p>
                  </>
                ) : (
                  <>
                    <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
                    <p className="text-sm font-medium text-muted-foreground">
                      Drop your resume here or{" "}
                      <span className="text-primary">browse</span>
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      PDF, DOC, DOCX — Max 10MB
                    </p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Interview Mode */}
          <Card className="rounded-3xl border border-white/10 bg-[#111111] shadow-xl overflow-hidden relative group">
            <CardContent className="p-6">
              <label className="mb-3 block text-sm font-semibold">
                Interview Mode
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setConfig({ mode: "text" })}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl border p-4 transition-all",
                    config.mode === "text"
                      ? "border-primary bg-primary/10 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                      : "border-white/10 bg-white/5 hover:border-white/20"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-lg",
                      config.mode === "text"
                        ? "bg-primary/15 text-primary"
                        : "bg-secondary text-muted-foreground"
                    )}
                  >
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold">Text Chat</p>
                    <p className="text-xs text-muted-foreground">
                      Type your answers
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => setConfig({ mode: "voice" })}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl border p-4 transition-all",
                    config.mode === "voice"
                      ? "border-primary bg-primary/10 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                      : "border-white/10 bg-white/5 hover:border-white/20"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-lg",
                      config.mode === "voice"
                        ? "bg-primary/15 text-primary"
                        : "bg-secondary text-muted-foreground"
                    )}
                  >
                    <Mic className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold">Voice</p>
                    <p className="text-xs text-muted-foreground">
                      Speak naturally
                    </p>
                  </div>
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Start Button */}
          <Button
            onClick={handleStart}
            disabled={!isValid || isLoading}
            className="h-14 w-full rounded-2xl bg-primary text-base font-semibold text-primary-foreground shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] disabled:opacity-40 disabled:shadow-none disabled:hover:scale-100"
          >
            {isLoading ? "Setting up interview..." : "Start Interview"}
            {!isLoading && <ArrowRight className="ml-2 h-5 w-5" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
