"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Download,
  Trophy,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  BarChart3,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const mockResult = {
  overallScore: 85,
  company: "Google",
  role: "Frontend Engineer",
  experience: "Mid-Level",
  date: "June 18, 2026",
  duration: "24:35",
  totalQuestions: 6,
  strengths: [
    "Strong understanding of system design fundamentals",
    "Clear communication of trade-offs",
    "Good use of real-world examples",
  ],
  weaknesses: [
    "Could elaborate more on edge cases",
    "Missed opportunity to discuss monitoring/observability",
    "Time management — spent too long on Q2",
  ],
  categories: [
    { name: "Technical Accuracy", score: 88 },
    { name: "Communication", score: 82 },
    { name: "Problem Solving", score: 90 },
    { name: "System Design", score: 85 },
    { name: "Code Quality", score: 78 },
  ],
  questions: [
    {
      q: "Tell me about yourself and what excites you about this role?",
      a: "I'm a frontend engineer with 3 years of experience building React applications...",
      score: 90,
      feedback:
        "Excellent introduction that highlights relevant experience. Good energy and enthusiasm. Consider mentioning a specific Google product you'd love to work on to make it more targeted.",
    },
    {
      q: "Design a real-time notification system for a social media platform.",
      a: "I would use a pub-sub architecture with WebSockets for real-time delivery and a message queue for reliability...",
      score: 85,
      feedback:
        "Solid approach with pub-sub and WebSockets. You correctly identified the need for persistence. Could have discussed push notification channels (mobile, email) and user preference management.",
    },
    {
      q: "How would you handle offline users for the notification system?",
      a: "I would store pending notifications in a database and deliver them when the user comes back online...",
      score: 80,
      feedback:
        "Good basic answer. Consider discussing TTL for notifications, batching multiple notifications, and the read/unread state synchronization across devices.",
    },
    {
      q: "Implement a rate limiter: N requests per minute per user.",
      a: "I'd use a sliding window algorithm with Redis storing request counts per user...",
      score: 88,
      feedback:
        "Great choice of algorithm. Your Redis implementation approach is production-ready. Could have mentioned distributed rate limiting and how to handle clock skew across nodes.",
    },
  ],
};

function getScoreBadge(score: number) {
  if (score >= 90)
    return { label: "Excellent", color: "text-chart-3 bg-chart-3/10" };
  if (score >= 80)
    return { label: "Great", color: "text-primary bg-primary/10" };
  if (score >= 70)
    return { label: "Good", color: "text-amber-600 bg-amber-50" };
  return { label: "Needs Work", color: "text-red-500 bg-red-50" };
}

function ScoreCircle({ score }: { score: number }) {
  const badge = getScoreBadge(score);
  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex h-40 w-40 items-center justify-center">
      <svg className="-rotate-90" width="140" height="140" viewBox="0 0 120 120">
        <circle
          cx="60"
          cy="60"
          r="54"
          fill="none"
          stroke="#e2e8e4"
          strokeWidth="8"
        />
        <circle
          cx="60"
          cy="60"
          r="54"
          fill="none"
          stroke="url(#scoreGradient)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000 ease-out"
        />
        <defs>
          <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6cc145" />
            <stop offset="100%" stopColor="#4a9e26" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute text-center">
        <p className="text-3xl font-bold">{score}</p>
        <p className={`text-xs font-semibold ${badge.color.split(" ")[0]}`}>
          {badge.label}
        </p>
      </div>
    </div>
  );
}

export default function ResultsPage() {
  const [expandedQ, setExpandedQ] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full"
          >
            <Download className="mr-1.5 h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-10">
        {/* ─── Header ─── */}
        <div className="mb-10 flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
            <Trophy className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Interview Scorecard
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mockResult.company} · {mockResult.role} · {mockResult.date}
          </p>
        </div>

        {/* ─── Overall Score & Category Scores ─── */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Overall Score */}
          <Card className="flex flex-col items-center justify-center rounded-2xl border-border/50 bg-white py-8 shadow-sm">
            <ScoreCircle score={mockResult.overallScore} />
            <p className="mt-3 text-sm text-muted-foreground">
              Overall Performance
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {mockResult.totalQuestions} questions · {mockResult.duration}
            </p>
          </Card>

          {/* Category Breakdown */}
          <Card className="col-span-1 rounded-2xl border-border/50 bg-white shadow-sm lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <BarChart3 className="h-4 w-4 text-primary" />
                Category Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockResult.categories.map((cat) => {
                const badge = getScoreBadge(cat.score);
                return (
                  <div key={cat.name}>
                    <div className="mb-1.5 flex items-center justify-between">
                      <span className="text-sm font-medium">{cat.name}</span>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-xs font-bold",
                          badge.color
                        )}
                      >
                        {cat.score}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary to-chart-3 transition-all duration-700"
                        style={{ width: `${cat.score}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* ─── Strengths & Weaknesses ─── */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card className="rounded-2xl border-border/50 bg-white shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-chart-3">
                <TrendingUp className="h-4 w-4" />
                Strengths
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockResult.strengths.map((s, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-chart-3" />
                  <p className="text-sm leading-relaxed">{s}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border/50 bg-white shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-amber-600">
                <TrendingDown className="h-4 w-4" />
                Areas to Improve
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockResult.weaknesses.map((w, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                  <p className="text-sm leading-relaxed">{w}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* ─── Q&A Breakdown ─── */}
        <Card className="rounded-2xl border-border/50 bg-white shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <MessageSquare className="h-4 w-4 text-primary" />
              Question-by-Question Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {mockResult.questions.map((item, i) => {
              const isOpen = expandedQ === i;
              const badge = getScoreBadge(item.score);
              return (
                <div
                  key={i}
                  className={cn(
                    "overflow-hidden rounded-xl border transition-all",
                    isOpen
                      ? "border-primary/30 bg-primary/5"
                      : "border-border/50 bg-background/30"
                  )}
                >
                  <button
                    onClick={() => setExpandedQ(isOpen ? null : i)}
                    className="flex w-full items-center justify-between p-4 text-left"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-secondary text-xs font-bold text-muted-foreground">
                        {i + 1}
                      </span>
                      <p className="text-sm font-medium leading-tight">
                        {item.q}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-0.5 text-xs font-bold",
                          badge.color
                        )}
                      >
                        {item.score}
                      </span>
                      {isOpen ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </button>
                  {isOpen && (
                    <div className="space-y-3 border-t border-border/40 px-4 pb-4 pt-3">
                      <div>
                        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Your Answer
                        </p>
                        <p className="text-sm leading-relaxed text-foreground/80">
                          {item.a}
                        </p>
                      </div>
                      <Separator />
                      <div>
                        <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
                          <Sparkles className="h-3 w-3" />
                          AI Feedback
                        </p>
                        <p className="text-sm leading-relaxed text-foreground/80">
                          {item.feedback}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* ─── Bottom CTA ─── */}
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link href="/interviews/new">
            <Button className="rounded-full bg-gradient-to-r from-primary to-chart-3 px-8 font-semibold text-white shadow-lg shadow-primary/20">
              Practice Again
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline" className="rounded-full px-8">
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
