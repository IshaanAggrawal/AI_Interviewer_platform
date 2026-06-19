"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Clock,
  BarChart3,
  Settings,
  Plus,
  Mic,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "History", href: "/dashboard/history", icon: Clock },
  { label: "Resumes", href: "/dashboard/resumes", icon: BarChart3 },
  { label: "Pricing", href: "/dashboard/pricing", icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-background text-foreground selection:bg-primary/30 selection:text-primary-foreground">
      {/* ─── Sidebar ─── */}
      <aside className="sticky top-0 flex h-screen w-[280px] shrink-0 flex-col border-r border-white/10 bg-[#0A0A0A]">
        {/* Logo */}
        <div className="flex h-20 items-center px-8">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-emerald-700 text-sm font-bold text-black shadow-lg shadow-primary/20 transition-transform group-hover:scale-105">
              <Mic className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              Interviewer
            </span>
          </Link>
        </div>

        {/* New Interview CTA */}
        <div className="px-6 pt-4 pb-6">
          <Link href="/interviews/new">
            <Button className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(16,185,129,0.3)]">
              <Plus className="mr-2 h-5 w-5" />
              New Interview
            </Button>
          </Link>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 space-y-2 px-4">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium transition-all",
                  isActive
                    ? "bg-primary/10 text-primary shadow-sm"
                    : "text-muted-foreground hover:bg-white/5 hover:text-white"
                )}
              >
                <item.icon className={cn("h-5 w-5", isActive ? "text-primary" : "text-muted-foreground")} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Profile */}
        <div className="border-t border-white/10 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <UserButton
               showName={true}
               appearance={{
                 elements: {
                   userButtonBox: "flex-row-reverse w-full justify-between gap-3",
                   userButtonOuterIdentifier: "text-sm font-semibold text-white truncate",
                   userButtonAvatarBox: "h-9 w-9 border border-white/10"
                 },
               }}
             />
          </div>
        </div>
      </aside>

      {/* ─── Main Content ─── */}
      <main className="flex-1 overflow-y-auto relative bg-[#09090b]">
        {/* Subtle glow effect in the background */}
        <div className="pointer-events-none absolute left-0 top-0 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-[120px]" />
        
        <div className="relative z-10 mx-auto max-w-6xl p-10 min-h-[calc(100vh-80px)]">
          {children}
        </div>

        {/* Global Dashboard Footer */}
        <footer className="border-t border-white/5 py-6 px-10 text-sm text-muted-foreground flex justify-between items-center relative z-10 bg-[#0A0A0A]">
          <span>© 2026 AI Interviewer</span>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white transition">Support</a>
            <a href="#" className="hover:text-white transition">Docs</a>
          </div>
        </footer>
      </main>
    </div>
  );
}
