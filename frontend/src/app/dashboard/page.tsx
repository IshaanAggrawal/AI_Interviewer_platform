"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useApiClient } from "@/lib/api";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  BrainCircuit,
  Trophy,
  Target,
  TrendingUp,
  ArrowRight,
  Calendar,
  Building2,
  Loader2,
} from "lucide-react";
import Link from "next/link";

function getScoreColor(score: number) {
  if (score >= 90) return "text-primary bg-primary/10 border-primary/20";
  if (score >= 75) return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
  return "text-amber-500 bg-amber-500/10 border-amber-500/20";
}

export default function DashboardPage() {
  const { getToken } = useAuth();
  const api = useApiClient(getToken);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/analytics/dashboard");
        setData(res.data.data);
      } catch (error) {
        console.error("Failed to fetch analytics", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [api]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const stats = [
    {
      label: "Total Interviews",
      value: data?.totalInterviews || "0",
      sub: "All time",
      icon: BrainCircuit,
    },
    {
      label: "Average Score",
      value: `${data?.averageScore || 0}%`,
      sub: "Across all mocks",
      icon: Trophy,
    },
    {
      label: "Top Skill",
      value: data?.topSkill || "N/A",
      sub: "Highest performing area",
      icon: Target,
    },
  ];

  const renderUsage = () => {
    if (!data) return null;
    const { userTier = "FREE", totalInterviews = 0 } = data;
    const limit = userTier === "FREE" ? 2 : userTier === "PRO" ? 10 : "Unlimited";
    const percent = limit === "Unlimited" ? 100 : Math.min(100, (totalInterviews / (limit as number)) * 100);
    
    return (
      <div className="rounded-2xl border border-white/10 bg-[#111111] p-4 min-w-[250px] shadow-xl">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-white">Plan Usage ({userTier})</span>
          <span className="text-xs text-muted-foreground">{totalInterviews} / {limit} Mocks</span>
        </div>
        <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
          <div 
            className={`h-full ${percent >= 100 ? "bg-red-500" : "bg-primary"} transition-all`} 
            style={{ width: `${limit === "Unlimited" ? 0 : percent}%` }}
          />
        </div>
        {(percent >= 100 || userTier !== "PRO_MAX") && limit !== "Unlimited" && (
          <div className="mt-3 text-right">
            <Link href="/dashboard/pricing" className="text-xs text-primary font-bold hover:underline flex items-center justify-end gap-1">
              Upgrade Plan <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* ─── Header ─── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Overview
          </h1>
          <p className="mt-2 text-base text-muted-foreground">
            Welcome back. Here&apos;s a detailed breakdown of your interview performance.
          </p>
        </div>
        
        {/* Usage Tracker */}
        <div>
          {renderUsage()}
        </div>
      </div>

      {/* ─── Stats ─── */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {stats.map((s) => (
          <Card
            key={s.label}
            className="rounded-3xl border border-white/10 bg-[#111111] shadow-xl overflow-hidden relative group"
          >
            {/* Subtle top glow */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {s.label}
                  </p>
                  <p className="mt-3 text-4xl font-extrabold text-white">{s.value}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{s.sub}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 border border-white/10 group-hover:bg-primary/10 group-hover:border-primary/30 transition-colors">
                  <s.icon className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ─── Chart & Recent ─── */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
        {/* Bar Chart */}
        <Card className="col-span-1 rounded-3xl border border-white/10 bg-[#111111] shadow-xl lg:col-span-3 overflow-hidden">
          <CardHeader className="pb-2 border-b border-white/5 px-6 pt-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold text-white">
                Score Progression
              </CardTitle>
              <span className="rounded-full bg-white/5 border border-white/10 px-3 py-1 text-xs font-medium text-muted-foreground">
                Recent Mocks
              </span>
            </div>
          </CardHeader>
          <CardContent className="h-[350px] p-6">
            {data?.scoreData && data.scoreData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.scoreData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  barSize={32}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#ffffff10"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#a1a1aa", fontSize: 12, fontWeight: 500 }}
                    dy={12}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#a1a1aa", fontSize: 12, fontWeight: 500 }}
                    domain={[0, 100]}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(255,255,255,0.03)" }}
                    contentStyle={{
                      backgroundColor: "#000000",
                      borderRadius: "16px",
                      border: "1px solid rgba(255,255,255,0.1)",
                      boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
                      fontSize: "13px",
                      color: "#fff"
                    }}
                    itemStyle={{ color: "#10b981", fontWeight: "bold" }}
                  />
                  <Bar
                    dataKey="score"
                    fill="#10b981"
                    radius={[6, 6, 0, 0]}
                    animationDuration={1500}
                    animationEasing="ease-out"
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No score data available yet.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Interviews */}
        <Card className="col-span-1 rounded-3xl border border-white/10 bg-[#111111] shadow-xl lg:col-span-2 overflow-hidden flex flex-col">
          <CardHeader className="pb-3 border-b border-white/5 px-6 pt-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold text-white">
                Recent Interviews
              </CardTitle>
              <Link
                href="/dashboard/history"
                className="text-sm font-semibold text-primary transition hover:text-emerald-400"
              >
                View all
              </Link>
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-4 space-y-2 overflow-y-auto">
            {(!data?.recentInterviews || data.recentInterviews.length === 0) ? (
              <div className="flex h-full flex-col items-center justify-center text-center p-6">
                <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center mb-4">
                  <BrainCircuit className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-white mb-1">No interviews yet</p>
                <p className="text-xs text-muted-foreground mb-4">Start your first mock interview to see analytics.</p>
                <Link href="/interviews/new">
                  <Button size="sm" className="rounded-full bg-primary text-primary-foreground font-semibold">
                    Start Mock
                  </Button>
                </Link>
              </div>
            ) : (
              data.recentInterviews.map((iv: any) => (
                <Link
                  key={iv.id}
                  href={`/interviews/${iv.id}/results`}
                  className="group block"
                >
                  <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 p-4 transition-all hover:border-primary/30 hover:bg-white/10 hover:shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 border border-white/10 group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                        <Building2 className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-white truncate leading-tight">
                          {iv.role}
                        </p>
                        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="font-medium text-emerald-100/70">{iv.company}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            {new Date(iv.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-4">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-bold ${getScoreColor(iv.overallScore || 0)}`}
                      >
                        {iv.status === "IN_PROGRESS" ? "In Progress" : iv.overallScore || "N/A"}
                      </span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-all transform group-hover:opacity-100 group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
