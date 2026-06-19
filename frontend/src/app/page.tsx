"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  BrainCircuit,
  Building2,
  Mic,
  ArrowRight,
  Sparkles,
  BarChart3,
  Shield,
  CheckCircle2,
} from "lucide-react";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.6,
      ease: "easeOut" as const,
    },
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

export default function LandingPage() {
  const { isSignedIn } = useAuth();

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 selection:text-primary-foreground">
      {/* ─── Navbar ─── */}
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-background/60 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-emerald-700 text-sm font-bold text-black shadow-lg shadow-primary/20 transition-transform group-hover:scale-105">
              AI
            </div>
            <span className="text-lg font-bold tracking-tight text-white">
              Interviewer
            </span>
          </Link>

          <div className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
            <a href="#features" className="transition hover:text-white">
              Features
            </a>
            <a href="#how" className="transition hover:text-white">
              How It Works
            </a>
            <a href="#pricing" className="transition hover:text-white">
              Pricing
            </a>
          </div>

          <div className="flex items-center gap-3">
            {!isSignedIn && (
              <>
                <SignInButton mode="modal">
                  <Button
                    variant="ghost"
                    className="hidden rounded-full text-sm sm:inline-flex text-muted-foreground hover:text-white hover:bg-white/5"
                  >
                    Sign In
                  </Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button className="rounded-full bg-primary text-primary-foreground px-6 text-sm font-semibold shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5">
                    Get Started Free
                  </Button>
                </SignUpButton>
              </>
            )}
            {isSignedIn && (
              <>
                <Link href="/dashboard">
                  <Button
                    variant="ghost"
                    className="rounded-full text-sm text-white hover:bg-white/10"
                  >
                    Dashboard
                  </Button>
                </Link>
                <UserButton />
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden pb-32 pt-32">
        {/* Background glow effects */}
        <div className="pointer-events-none absolute left-1/2 top-0 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[120px]" />

        <div className="relative z-10 mx-auto max-w-7xl px-6 flex flex-col lg:flex-row items-center gap-16">
          
          {/* Left: Text Content */}
          <div className="flex-1 text-center lg:text-left">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={0}
            >
              <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                <Sparkles className="h-3.5 w-3.5" />
                Enterprise-Grade AI Interviews
              </span>
            </motion.div>

            <motion.h1
              className="mt-6 text-5xl font-extrabold leading-[1.1] tracking-tight text-white md:text-7xl"
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={1}
            >
              Ace every interview <br />
              with <span className="bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">real-time AI</span>
            </motion.h1>

            <motion.p
              className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl lg:mx-0 mx-auto"
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={2}
            >
              Experience hyper-realistic mock interviews powered by Deepgram Voice AI and Llama-3. Practice for your target company, get instant actionable scorecards, and land your dream offer.
            </motion.p>

            <motion.div
              className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start"
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={3}
            >
              <Link href="/interviews/new">
                <Button
                  size="lg"
                  className="h-14 rounded-full bg-primary px-8 text-base font-semibold text-primary-foreground shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(16,185,129,0.4)]"
                >
                  Start Mock Interview
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </motion.div>
          </div>

          {/* Right: Premium 3D Illustration */}
          <motion.div 
            className="flex-1 w-full relative h-[400px] lg:h-[500px]"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="absolute inset-0 rounded-3xl overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
              <Image 
                src="/images/hero.png" 
                alt="AI Interviewer 3D Illustration" 
                fill 
                className="object-cover"
                priority
              />
            </div>
            {/* Floating glass overlay element */}
            <div className="absolute -bottom-6 -left-6 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl shadow-2xl">
               <div className="flex items-center gap-3">
                 <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-primary">
                   <Mic className="h-5 w-5" />
                 </div>
                 <div>
                   <p className="text-sm font-bold text-white">Voice Mode Active</p>
                   <p className="text-xs text-primary">Listening to response...</p>
                 </div>
               </div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* ─── Bento Grid Features ─── */}
      <section id="features" className="relative border-t border-white/5 bg-[#0a0a0c] px-6 py-32 overflow-hidden">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        
        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="mb-20 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white md:text-5xl">
              Everything to land the offer
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              From sophisticated resume analysis to real-time voice evaluation — every tool you need, beautifully designed in one platform.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            
            {/* Feature 1: Large Feature with Image */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={fadeUp}
              custom={0}
              className="md:col-span-2 group overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm transition-all hover:border-primary/30"
            >
              <div className="flex flex-col md:flex-row h-full">
                <div className="p-10 flex-1 flex flex-col justify-center">
                  <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <BarChart3 className="h-6 w-6" />
                  </div>
                  <h3 className="mb-4 text-2xl font-bold text-white">Actionable Analytics</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Get granular breakdowns per question with extracted strengths, pinpointed weaknesses, and tailored improvement strategies.
                  </p>
                </div>
                <div className="relative h-64 md:h-auto flex-1 min-h-[300px]">
                  <Image 
                    src="/images/analytics.png" 
                    alt="Analytics Dashboard" 
                    fill 
                    className="object-cover border-l border-white/10"
                  />
                </div>
              </div>
            </motion.div>

            {/* Minor Features */}
            {features.slice(0, 4).map((f, i) => (
              <motion.div
                key={f.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={fadeUp}
                custom={i + 1}
              >
                <div className="group h-full rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm transition-all hover:border-primary/30 hover:bg-white/10">
                  <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <f.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-3 text-xl font-bold text-white">{f.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              </motion.div>
            ))}

          </div>
        </div>
      </section>

      {/* ─── Pricing ─── */}
      <section id="pricing" className="relative border-t border-white/5 bg-[#0a0a0c] px-6 py-32 overflow-hidden">
        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="mb-20 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white md:text-5xl">
              Simple, transparent pricing
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              Choose the plan that best fits your interview preparation needs.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* Free */}
            <div className="relative rounded-3xl border border-white/10 bg-white/5 p-8 shadow-xl hover:border-white/20 transition-colors">
              <h3 className="text-2xl font-bold text-white mb-2">Free</h3>
              <div className="mb-4 flex items-baseline text-white">
                <span className="text-4xl font-extrabold tracking-tight">$0</span>
              </div>
              <p className="text-sm text-muted-foreground mb-8 min-h-[40px]">
                Perfect for trying out the platform.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-sm text-gray-300">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                  2 Mock Interviews
                </li>
                <li className="flex items-center gap-3 text-sm text-gray-300">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                  Basic Analytics
                </li>
                <li className="flex items-center gap-3 text-sm text-gray-300">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                  Text Mode Only
                </li>
              </ul>
              <SignUpButton mode="modal">
                <Button className="w-full h-12 rounded-xl bg-white/10 text-white font-bold hover:bg-white/20">
                  Get Started
                </Button>
              </SignUpButton>
            </div>

            {/* Pro */}
            <div className="relative rounded-3xl border border-primary/50 bg-[#111111] p-8 shadow-xl overflow-hidden group hover:border-primary/70 transition-colors">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary to-emerald-700" />
              <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
              <div className="mb-4 flex items-baseline text-white">
                <span className="text-4xl font-extrabold tracking-tight">$9.99</span>
                <span className="text-muted-foreground ml-1">/month</span>
              </div>
              <p className="text-sm text-muted-foreground mb-8 min-h-[40px]">
                Everything you need to land the job.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-sm text-gray-300">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                  10 Mock Interviews
                </li>
                <li className="flex items-center gap-3 text-sm text-gray-300">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                  Detailed AI Feedback
                </li>
                <li className="flex items-center gap-3 text-sm text-gray-300">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                  Voice Mode
                </li>
              </ul>
              <SignUpButton mode="modal">
                <Button className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-emerald-700 text-white font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all">
                  Get Started
                </Button>
              </SignUpButton>
            </div>

            {/* Pro Max */}
            <div className="relative rounded-3xl border border-white/10 bg-white/5 p-8 shadow-xl hover:border-white/20 transition-colors">
              <h3 className="text-2xl font-bold text-white mb-2">Pro Max</h3>
              <div className="mb-4 flex items-baseline text-white">
                <span className="text-4xl font-extrabold tracking-tight">$19.99</span>
                <span className="text-muted-foreground ml-1">/month</span>
              </div>
              <p className="text-sm text-muted-foreground mb-8 min-h-[40px]">
                Unlimited access for serious candidates.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-sm text-gray-300">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                  Unlimited Interviews
                </li>
                <li className="flex items-center gap-3 text-sm text-gray-300">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                  Real-time Voice Analysis
                </li>
                <li className="flex items-center gap-3 text-sm text-gray-300">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                  Advanced Stats
                </li>
              </ul>
              <SignUpButton mode="modal">
                <Button className="w-full h-12 rounded-xl bg-white/10 text-white font-bold hover:bg-white/20">
                  Get Started
                </Button>
              </SignUpButton>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="relative overflow-hidden border-t border-white/5 bg-background px-6 py-32">
        <div className="absolute inset-0 bg-primary/5 blur-[100px]" />
        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <h2 className="text-4xl font-bold tracking-tight text-white md:text-5xl">
            Ready to ace your next interview?
          </h2>
          <p className="mx-auto mt-6 text-xl text-muted-foreground">
            Join the most prepared candidates using AI Interviewer to land offers at top companies.
          </p>
          <Link href="/interviews/new">
            <Button
              size="lg"
              className="mt-10 h-14 rounded-full bg-primary px-10 text-base font-semibold text-primary-foreground shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all hover:scale-[1.05]"
            >
              Get Started — It&apos;s Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-white/5 bg-background px-6 py-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 md:flex-row text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/20 text-xs font-bold text-primary">
              AI
            </div>
            <span className="font-semibold text-white">AI Interviewer Platform</span>
          </div>
          <span>© 2026. All rights reserved.</span>
          <div className="flex gap-6">
            <a href="#" className="transition hover:text-white">
              Privacy
            </a>
            <a href="#" className="transition hover:text-white">
              Terms
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
