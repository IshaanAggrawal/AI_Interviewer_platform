"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useApiClient } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Calendar, Building2, ArrowRight } from "lucide-react";
import Link from "next/link";

function getScoreColor(score: number) {
  if (score >= 90) return "text-primary bg-primary/10 border-primary/20";
  if (score >= 75) return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
  return "text-amber-500 bg-amber-500/10 border-amber-500/20";
}

export default function HistoryPage() {
  const { getToken } = useAuth();
  const api = useApiClient(getToken);
  const [interviews, setInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const res = await api.get("/interviews");
        setInterviews(res.data.data);
      } catch (error) {
        console.error("Failed to fetch interviews", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInterviews();
  }, [api]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Interview History</h1>
        <p className="mt-2 text-base text-muted-foreground">Review your past interviews and track your progress.</p>
      </div>

      {loading ? (
        <div className="flex h-[40vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : interviews.length === 0 ? (
        <Card className="rounded-3xl border border-white/10 bg-[#111111] shadow-xl p-12 text-center flex flex-col items-center">
          <div className="h-16 w-16 rounded-2xl bg-white/5 flex items-center justify-center mb-6">
            <Building2 className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">No history yet</h2>
          <p className="text-muted-foreground mb-6">Complete an interview to see it listed here.</p>
          <Link href="/interviews/new" className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
            Start Mock Interview
          </Link>
        </Card>
      ) : (
        <div className="grid gap-4">
          {interviews.map((iv) => (
            <Link key={iv.id} href={`/interviews/${iv.id}/results`} className="group block">
              <Card className="rounded-2xl border border-white/5 bg-[#111111] transition-all hover:border-primary/30 hover:bg-white/5 hover:shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
                <CardContent className="p-5 flex items-center justify-between">
                  <div className="flex items-center gap-5">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/5 border border-white/10 group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                      <Building2 className="h-6 w-6 text-muted-foreground group-hover:text-primary" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-white leading-tight">{iv.role}</p>
                      <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="font-medium text-emerald-100/70">{iv.company}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(iv.createdAt).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                        <span>•</span>
                        <span>{iv.mode}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <span className={`rounded-full border px-4 py-1.5 text-sm font-bold ${getScoreColor(iv.overallScore || 0)}`}>
                      {iv.status === "IN_PROGRESS" ? "In Progress" : iv.overallScore || "N/A"}
                    </span>
                    <ArrowRight className="h-5 w-5 text-muted-foreground opacity-0 transition-all transform group-hover:opacity-100 group-hover:translate-x-1" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
