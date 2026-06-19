"use client";

import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  BrainCircuit,
  Building2,
  Mic,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  BarChart3,
  Shield,
} from "lucide-react";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
  }),
};

const features = [
  {
    icon: BrainCircuit,
    title: "AI-Powered Evaluation",
    desc: "Our AI engine evaluates technical accuracy, communication clarity, and structured thinking in real-time.",
  },
  {
    icon: Building2,
    title: "Company-Specific Mocks",
    desc: "Practice for Google, Meta, Amazon, or any target company with questions tailored to their unique interview style.",
  },
  {
    icon: Mic,
    title: "Voice & Text Modes",
    desc: "Speak naturally with low-latency voice mode powered by Deepgram, or practice your technical logic in text mode.",
  },
  {
    icon: BarChart3,
    title: "Detailed Scorecards",
    desc: "Get granular breakdowns per question with strengths, weaknesses, and actionable improvement tips.",
  },
  {
    icon: Sparkles,
    title: "Resume-Aware Questions",
    desc: "Upload your resume and the AI tailors questions based on your actual skills and experience.",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    desc: "Built with Clerk authentication, encrypted data storage, and enterprise-grade infrastructure.",
  },
];

const steps = [
  {
    num: "01",
    title: "Upload & Configure",
    desc: "Upload your resume, pick a target company, role, and experience level.",
  },
  {
    num: "02",
    title: "Start Interview",
    desc: "Engage in a realistic, multi-round AI-driven interview session.",
  },
  {
    num: "03",
    title: "Get Evaluated",
    desc: "Our AI scores each answer on accuracy, depth, and communication.",
  },
  {
    num: "04",
    title: "Review & Improve",
    desc: "Receive a detailed scorecard with actionable feedback for every question.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      {/* ─── Navbar ─── */}
      <nav className="sticky top-0 z-50 border-b border-border/60 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-chart-3 text-sm font-bold text-white shadow-md shadow-primary/20">
              AI
            </div>
            <span className="text-lg font-bold tracking-tight">
              Interviewer
            </span>
          </Link>

          <div className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
            <a href="#features" className="transition hover:text-foreground">
              Features
            </a>
            <a href="#how" className="transition hover:text-foreground">
              How It Works
            </a>
          </div>

          <div className="flex items-center gap-3">
            <SignedOut>
              <SignInButton mode="modal">
                <Button
                  variant="ghost"
                  className="hidden rounded-full text-sm sm:inline-flex"
                >
                  Sign In
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button className="rounded-full bg-gradient-to-r from-primary to-chart-3 px-5 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition hover:shadow-xl hover:shadow-primary/30">
                  Get Started Free
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard">
                <Button
                  variant="ghost"
                  className="rounded-full text-sm"
                >
                  Dashboard
                </Button>
              </Link>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden pb-24 pt-28">
        {/* background blobs */}
        <div className="pointer-events-none absolute -top-40 left-1/2 h-[700px] w-[700px] -translate-x-1/2 rounded-full bg-primary/8 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-60 right-0 h-[500px] w-[500px] rounded-full bg-chart-5/15 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={0}
          >
            <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Enterprise-Grade AI Interviews
            </span>
          </motion.div>

          <motion.h1
            className="mt-6 text-5xl font-extrabold leading-[1.1] tracking-tight md:text-7xl"
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={1}
          >
            Ace every interview
            <br />
            with{" "}
            <span className="bg-gradient-to-r from-primary to-chart-3 bg-clip-text text-transparent">
              AI coaching
            </span>
          </motion.h1>

          <motion.p
            className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl"
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={2}
          >
            Hyper-realistic mock interviews with real-time voice AI. Practice
            for your target company, get instant scorecards, and land the offer.
          </motion.p>

          <motion.div
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={3}
          >
            <Link href="/interviews/new">
              <Button
                size="lg"
                className="h-14 rounded-full bg-gradient-to-r from-primary to-chart-3 px-8 text-base font-semibold text-white shadow-xl shadow-primary/25 transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/30"
              >
                Start Mock Interview
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <a href="#how">
              <Button
                size="lg"
                variant="outline"
                className="h-14 rounded-full border-border bg-white px-8 text-base"
              >
                See How It Works
              </Button>
            </a>
          </motion.div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section id="features" className="border-t border-border bg-white px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Everything to land the offer
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
              From resume analysis to real-time voice evaluation — every tool
              you need in one platform.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={fadeUp}
                custom={i}
              >
                <Card className="group h-full rounded-2xl border border-border/50 bg-background/40 shadow-none transition-all hover:border-primary/30 hover:bg-background hover:shadow-lg hover:shadow-primary/5">
                  <CardContent className="p-6">
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                      <f.icon className="h-5 w-5" />
                    </div>
                    <h3 className="mb-2 text-base font-bold">{f.title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {f.desc}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section id="how" className="px-6 py-24">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-14 text-center text-3xl font-bold tracking-tight md:text-4xl">
            How it works
          </h2>

          <div className="space-y-6">
            {steps.map((s, i) => (
              <motion.div
                key={s.num}
                className="group flex items-start gap-6 rounded-2xl border border-border/50 bg-white p-6 shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-chart-3 text-lg font-bold text-white shadow-md shadow-primary/20">
                  {s.num}
                </div>
                <div>
                  <h3 className="text-lg font-bold">{s.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {s.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="border-t border-border bg-gradient-to-br from-primary/5 via-background to-chart-5/10 px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Ready to ace your next interview?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
            Join thousands of engineers already using AI Interviewer to land
            offers at top companies.
          </p>
          <Link href="/interviews/new">
            <Button
              size="lg"
              className="mt-8 h-14 rounded-full bg-gradient-to-r from-primary to-chart-3 px-10 text-base font-semibold text-white shadow-xl shadow-primary/25 transition-all hover:scale-[1.02]"
            >
              Get Started — It&apos;s Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-border bg-white px-6 py-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between text-sm text-muted-foreground">
          <span>© 2026 AI Interviewer. All rights reserved.</span>
          <div className="flex gap-6">
            <a href="#" className="transition hover:text-foreground">
              Privacy
            </a>
            <a href="#" className="transition hover:text-foreground">
              Terms
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
