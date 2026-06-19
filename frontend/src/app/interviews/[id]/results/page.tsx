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
  Loader2,
} from "lucide-react";
import { useState, useEffect, use } from "react";
import { useAuth } from "@clerk/nextjs";
import { useApiClient } from "@/lib/api";
import { cn } from "@/lib/utils";

// Removed mockResult

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

export default function ResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { getToken } = useAuth();
  const api = useApiClient(getToken);

  const [expandedQ, setExpandedQ] = useState<number | null>(0);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEvaluating, setIsEvaluating] = useState(true);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const fetchResults = async () => {
      try {
        const res = await api.get(`/interviews/${id}/results`);
        
        if (res.status === 202 || res.data.data.status === "evaluating") {
          setIsEvaluating(true);
          timeoutId = setTimeout(fetchResults, 3000);
        } else {
          setResult(res.data.data);
          setIsEvaluating(false);
        }
      } catch (error) {
        console.error("Failed to fetch results", error);
        setIsEvaluating(false);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();

    return () => clearTimeout(timeoutId);
  }, [id, api]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isEvaluating) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background text-center px-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-6" />
        <h1 className="text-2xl font-bold mb-2 text-foreground">AI is evaluating your interview...</h1>
        <p className="text-muted-foreground max-w-md">
          This usually takes about 10-30 seconds depending on the length of your interview. Please wait, this page will automatically refresh when your scorecard is ready.
        </p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background text-center">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h1 className="text-2xl font-bold mb-2">Results not found</h1>
        <Link href="/dashboard">
          <Button variant="outline" className="mt-4">Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  // Format Q&A from raw messages
  const qna: any[] = [];
  let currentQ: any = null;
  (result.questions || []).forEach((msg: any) => {
    if (msg.role === "AI") {
      if (currentQ) qna.push(currentQ);
      currentQ = { q: msg.content, a: "Did not answer", score: null, feedback: null };
    } else if (msg.role === "USER" && currentQ) {
      currentQ.a = msg.content;
      currentQ.score = msg.score !== undefined ? msg.score : null;
      currentQ.feedback = msg.feedback || null;
    }
  });
  if (currentQ) qna.push(currentQ);

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
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
            Interview Review
          </p>
          {result.recordingUrl && (
            <div className="mt-6 w-full max-w-md">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Full Session Recording
              </p>
              <audio controls className="w-full" src={result.recordingUrl} />
            </div>
          )}
        </div>

        {/* ─── Overall Score & Category Scores ─── */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Overall Score */}
          <Card className="flex flex-col items-center justify-center rounded-2xl border-border/50 bg-card py-8 shadow-sm">
            <ScoreCircle score={result.overallScore || 0} />
            <p className="mt-3 text-sm text-muted-foreground">
              Overall Performance
            </p>
          </Card>

          {/* Category Breakdown */}
          <Card className="col-span-1 rounded-2xl border-border/50 bg-card shadow-sm lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <BarChart3 className="h-4 w-4 text-primary" />
                Category Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(result.categories || []).map((cat: any) => {
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
          <Card className="rounded-2xl border-border/50 bg-card shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-chart-3">
                <TrendingUp className="h-4 w-4" />
                Strengths
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(result.strengths || []).map((s: string, i: number) => (
                <div key={i} className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-chart-3" />
                  <p className="text-sm leading-relaxed">{s}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border/50 bg-card shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-amber-600">
                <TrendingDown className="h-4 w-4" />
                Areas to Improve
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(result.weaknesses || []).map((w: string, i: number) => (
                <div key={i} className="flex items-start gap-2.5">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                  <p className="text-sm leading-relaxed">{w}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* ─── Q&A Breakdown ─── */}
        <Card className="rounded-2xl border-border/50 bg-card shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <MessageSquare className="h-4 w-4 text-primary" />
              Question-by-Question Breakdown
            </CardTitle>
          </CardHeader>
            <CardContent className="space-y-3">
            {qna.map((item, i) => {
              const isOpen = expandedQ === i;
              const badge = item.score !== null ? getScoreBadge(item.score) : null;
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
                      {badge && (
                        <span
                          className={cn(
                            "rounded-full px-2.5 py-0.5 text-xs font-bold",
                            badge.color
                          )}
                        >
                          {item.score}
                        </span>
                      )}
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
                        <p className="text-sm leading-relaxed text-foreground/80 whitespace-pre-wrap">
                          {item.a}
                        </p>
                      </div>
                      {item.feedback && (
                        <>
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
                        </>
                      )}
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
