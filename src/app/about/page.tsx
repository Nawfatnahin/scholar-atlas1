"use client";

import Link from "next/link";
import { format } from "date-fns";
import { APP_VERSION } from "@/lib/version";
import { RELEASES } from "@/lib/changelog";
import { 
  CalendarCheck, 
  LayoutList, 
  GraduationCap, 
  FileText, 
  LayoutDashboard, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle2,
  Calendar,
  Sparkles,
  Zap,
  ShieldCheck,
  Cpu
} from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

export default function AboutPage() {
  const currentRelease = RELEASES[0];

  const features = [
    {
      icon: CalendarCheck,
      name: "Attendance Tracker",
      description: "Log classes and predict if you'll fall below the threshold before it's too late.",
      color: "text-green-600",
      bg: "bg-green-100"
    },
    {
      icon: LayoutList,
      name: "Task Management",
      description: "Kanban board for assignments, quizzes, and project deadlines.",
      color: "text-blue-600",
      bg: "bg-blue-100"
    },
    {
      icon: GraduationCap,
      name: "CGPA Manager",
      description: "Track your grades per subject and simulate what you need to hit your target.",
      color: "text-violet-600",
      bg: "bg-violet-100"
    },
    {
      icon: FileText,
      name: "PDF Tools",
      description: "Merge, split, and convert PDFs directly in the browser. No uploads, no servers.",
      color: "text-amber-600",
      bg: "bg-amber-100"
    },
    {
      icon: Calendar,
      name: "Timetable Builder",
      description: "Build your weekly class schedule once; attendance placeholders are created automatically.",
      color: "text-rose-600",
      bg: "bg-rose-100"
    },
    {
      icon: LayoutDashboard,
      name: "Semester Dashboard",
      description: "One-screen morning briefing: attendance health, upcoming deadlines, CGPA at a glance.",
      color: "text-indigo-600",
      bg: "bg-indigo-100"
    }
  ];

  return (
    <div className="min-h-screen bg-bg font-body flex flex-col relative overflow-hidden text-ink">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />
      
      <Navigation />
      
      <main className="flex-1 max-w-[920px] mx-auto px-6 py-20 sm:py-32 relative z-10">
        {/* Section 1: Hero */}
        <section className="mb-32 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-[10px] font-black uppercase tracking-[0.2em] border border-accent/20 mb-8">
            <Sparkles size={12} />
            <span>Redefining Academic Clarity</span>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-baseline gap-4 mb-8 justify-center sm:justify-start">
            <h1 className="text-5xl sm:text-7xl font-black tracking-tighter uppercase leading-[0.85]">
              Scholar <span className="text-accent italic font-serif lowercase tracking-normal">Atlas</span>
            </h1>
            <span className="text-ink-3 font-bold text-lg opacity-40">v{APP_VERSION.current}</span>
          </div>
          
          <p className="text-2xl sm:text-3xl font-bold text-ink-2 mb-10 leading-tight italic font-serif max-w-2xl">
            Built by Nawfat, for students navigating the edge of academic chaos.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left max-w-3xl">
            <div className="p-6 bg-white/40 backdrop-blur-md rounded-2xl border border-white/60 shadow-sm">
              <Zap className="text-accent mb-3" size={24} />
              <p className="text-ink-2 text-sm leading-relaxed font-medium">
                Scholar Atlas was forged from a singular frustration: existing tools are too slow, too noisy, and too invasive. I needed a tactical map, not a spreadsheet.
              </p>
            </div>
            <div className="p-6 bg-white/40 backdrop-blur-md rounded-2xl border border-white/60 shadow-sm">
              <ShieldCheck className="text-green-600 mb-3" size={24} />
              <p className="text-ink-2 text-sm leading-relaxed font-medium">
                Everything runs in your browser. Your data never leaves your machine. Privacy isn&apos;t a feature here; it&apos;s the foundation of the entire architecture.
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: Motivation (The "Atlas" Mindset) */}
        <section className="mb-32">
          <div className="flex items-center gap-4 mb-12">
            <div className="h-px flex-1 bg-border-strong" />
            <h2 className="text-[11px] font-bold text-ink-4 uppercase tracking-[0.3em]">The Motivation</h2>
            <div className="h-px flex-1 bg-border-strong" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-7 space-y-8">
              <div className="group relative">
                <div className="absolute -left-4 top-0 bottom-0 w-1 bg-accent/20 rounded-full group-hover:bg-accent transition-colors" />
                <p className="text-xl text-ink-2 leading-relaxed font-medium pl-4">
                  I&apos;ve always been driven by efficiency. I loathe redundant clicks and bloated interfaces that feel like they were designed in the early 2000s. As a student, I found myself constantly calculating "skip budgets" and "minimum marks" manually because no app treated academic life as a dynamic, evolving environment.
                </p>
              </div>
              <p className="text-lg text-ink-3 leading-relaxed font-medium">
                My approach to building Scholar Atlas reflects my own behavior: direct, goal-oriented, and slightly obsessed with visual harmony. I don&apos;t just want to track data; I want to see the future of my semester. I want to know exactly where I stand at 3:00 AM before a deadline.
              </p>
            </div>

            <div className="md:col-span-5 flex flex-col gap-6">
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-8 rounded-[40px] border border-amber-200/50 shadow-inner">
                <h4 className="text-xs font-black text-amber-900 uppercase tracking-widest mb-4">Philosophy</h4>
                <ul className="space-y-4">
                  {[
                    "Zero latency interaction",
                    "Local-first data storage",
                    "Aesthetic as a utility",
                    "Open-source transparency"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm font-bold text-amber-800/80">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-stone-900 p-8 rounded-[40px] text-white shadow-xl shadow-stone-900/20">
                <Cpu className="text-accent mb-4" size={28} />
                <p className="text-xs font-medium text-stone-400 leading-relaxed italic">
                  &quot;I believe a tool is only as good as the friction it removes. Scholar Atlas is my attempt to automate the mental load of being a student.&quot;
                </p>
                <p className="text-sm font-black mt-4 uppercase tracking-[0.2em] text-accent">— Nawfat</p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Features */}
        <section className="mb-32">
          <h2 className="text-[11px] font-bold text-ink-4 uppercase tracking-[0.3em] mb-12 text-center">System Capabilities</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((f, i) => (
              <div key={i} className="bg-white/40 backdrop-blur-xl p-8 rounded-[32px] border border-border-strong hover:border-accent/30 transition-all group">
                <div className={`w-14 h-14 rounded-2xl ${f.bg} flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform`}>
                  <f.icon className={`w-7 h-7 ${f.color}`} />
                </div>
                <h3 className="text-lg font-black text-ink mb-2 uppercase tracking-tight">{f.name}</h3>
                <p className="text-sm text-ink-3 leading-relaxed font-medium">{f.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 4: Changelog */}
        <section className="mb-32">
          <h2 className="text-[11px] font-bold text-ink-4 uppercase tracking-[0.3em] mb-12">The Roadmap</h2>
          <div className="bg-white/60 backdrop-blur-xl p-8 sm:p-12 rounded-[48px] border border-border-strong shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -mr-16 -mt-16" />
            
            <div className="mb-10">
              <h3 className="text-3xl font-black tracking-tight">Version {currentRelease.version}</h3>
              <p className="text-sm text-ink-3 font-bold uppercase tracking-widest mt-2">
                Deployed {format(new Date(currentRelease.date), "MMMM d, yyyy")}
              </p>
            </div>
            
            <div className="space-y-6">
              {currentRelease.changes.map((change, i) => (
                <div key={i} className="flex items-start gap-4 p-4 rounded-2xl hover:bg-white/40 transition-colors">
                  <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shrink-0 ${
                    change.type === 'NEW' ? 'bg-green-100 text-green-700' :
                    change.type === 'IMPROVED' ? 'bg-blue-100 text-blue-700' :
                    change.type === 'FIXED' ? 'bg-amber-100 text-amber-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {change.type}
                  </span>
                  <span className="text-base text-ink-2 font-bold tracking-tight">{change.description}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 5: Stack */}
        <section className="mb-32 text-center">
          <h2 className="text-[10px] font-black text-ink-4 uppercase tracking-[0.4em] mb-10">Core Technologies</h2>
          <div className="flex flex-wrap gap-4 justify-center">
            {["Next.js 15", "Supabase", "TypeScript", "Tailwind CSS", "Vercel"].map((tech, i) => (
              <span key={i} className="px-6 py-3 rounded-2xl bg-white/50 backdrop-blur-sm border border-border-strong text-xs font-black text-ink-3 uppercase tracking-[0.2em] shadow-sm hover:border-accent/50 transition-colors">
                {tech}
              </span>
            ))}
          </div>
        </section>

        {/* Section 6: Footer CTA */}
        <section className="text-center py-24 border-t border-border-strong bg-white/30 backdrop-blur-sm rounded-[60px]">
          <p className="text-2xl font-bold text-ink-2 mb-10 italic font-serif max-w-md mx-auto leading-tight">
            Ready to chart your course through the semester?
          </p>
          <div className="flex flex-col items-center gap-8">
            <Link href="/signup" className="px-12 py-5 rounded-2xl bg-stone-900 text-white font-black uppercase tracking-[0.2em] hover:bg-stone-800 hover:scale-105 transition-all shadow-xl shadow-stone-900/20 active:scale-95 text-xs">
              Initialize Atlas
            </Link>
            <Link href="/" className="text-[10px] font-black text-ink-4 uppercase tracking-[0.3em] hover:text-accent transition-colors flex items-center gap-2">
              <ArrowLeft size={14} /> Return to Base
            </Link>
          </div>
        </section>
      </main>

      <Footer />
      
      <style jsx>{`
        .font-serif {
          font-family: var(--font-lora), serif;
        }
        .font-black {
          font-family: var(--font-space-grotesk), sans-serif;
          font-weight: 900;
        }
      `}</style>
    </div>
  );
}
