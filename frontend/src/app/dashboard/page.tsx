"use client";

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
} from "lucide-react";
import Link from "next/link";

const scoreData = [
  { name: "Mon", score: 72 },
  { name: "Tue", score: 85 },
  { name: "Wed", score: 65 },
  { name: "Thu", score: 90 },
  { name: "Fri", score: 78 },
  { name: "Sat", score: 95 },
  { name: "Sun", score: 88 },
];

const recentInterviews = [
  {
    id: "1",
    role: "Senior Frontend Engineer",
    company: "Google",
    score: 92,
    date: "Today",
    status: "completed",
  },
  {
    id: "2",
    role: "Fullstack Developer",
    company: "Amazon",
    score: 85,
    date: "Yesterday",
    status: "completed",
  },
  {
    id: "3",
    role: "React Developer",
    company: "Meta",
    score: 78,
    date: "3 days ago",
    status: "completed",
  },
  {
    id: "4",
    role: "Backend Engineer",
    company: "Microsoft",
    score: 88,
    date: "5 days ago",
    status: "completed",
  },
];

const stats = [
  {
    label: "Total Interviews",
    value: "24",
    sub: "+4 this week",
    icon: BrainCircuit,
    trend: "+20%",
  },
  {
    label: "Average Score",
    value: "86%",
    sub: "Top 12% of candidates",
    icon: Trophy,
    trend: "+5%",
  },
  {
    label: "Top Skill",
    value: "System Design",
    sub: "Consistently scoring 90+",
    icon: Target,
    trend: null,
  },
];

function getScoreColor(score: number) {
  if (score >= 90) return "text-chart-3 bg-chart-3/10";
  if (score >= 75) return "text-primary bg-primary/10";
  return "text-amber-600 bg-amber-50";
}

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* ─── Header ─── */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome back, Ishaan 👋
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Here&apos;s an overview of your interview performance.
        </p>
      </div>

      {/* ─── Stats ─── */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {stats.map((s) => (
          <Card
            key={s.label}
            className="rounded-2xl border-border/50 bg-white shadow-sm"
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {s.label}
                  </p>
                  <p className="mt-2 text-2xl font-bold">{s.value}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{s.sub}</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <s.icon className="h-5 w-5 text-primary" />
                </div>
              </div>
              {s.trend && (
                <div className="mt-3 flex items-center gap-1 text-xs font-medium text-chart-3">
                  <TrendingUp className="h-3 w-3" />
                  {s.trend} from last week
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ─── Chart & Recent ─── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Bar Chart */}
        <Card className="col-span-1 rounded-2xl border-border/50 bg-white shadow-sm lg:col-span-3">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">
                Score Progression
              </CardTitle>
              <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">
                This Week
              </span>
            </div>
          </CardHeader>
          <CardContent className="h-[300px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={scoreData}
                margin={{ top: 5, right: 5, left: -25, bottom: 0 }}
                barSize={28}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e2e8e4"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#9ca3af", fontSize: 12 }}
                  dy={8}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#9ca3af", fontSize: 12 }}
                  domain={[0, 100]}
                />
                <Tooltip
                  cursor={{ fill: "rgba(108,193,69,0.06)" }}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                    fontSize: "13px",
                  }}
                />
                <Bar
                  dataKey="score"
                  fill="#1a4d1a"
                  radius={[6, 6, 0, 0]}
                  animationDuration={800}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Interviews */}
        <Card className="col-span-1 rounded-2xl border-border/50 bg-white shadow-sm lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">
                Recent Interviews
              </CardTitle>
              <Link
                href="/dashboard/history"
                className="text-xs font-medium text-primary transition hover:underline"
              >
                View all
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentInterviews.map((iv) => (
              <Link
                key={iv.id}
                href={`/interviews/${iv.id}/results`}
                className="group block"
              >
                <div className="flex items-center justify-between rounded-xl border border-border/40 bg-background/50 p-3.5 transition-all hover:border-primary/20 hover:bg-background hover:shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold leading-tight">
                        {iv.role}
                      </p>
                      <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{iv.company}</span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {iv.date}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-bold ${getScoreColor(iv.score)}`}
                    >
                      {iv.score}
                    </span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition group-hover:opacity-100" />
                  </div>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
