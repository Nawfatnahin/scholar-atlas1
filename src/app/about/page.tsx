"use client";

import Link from "next/link";
import { format } from "date-fns";
import { APP_VERSION } from "@/lib/version";
import { CHANGELOG } from "@/lib/changelog";
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
  Cpu,
  Star,
  Rocket
} from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

export default function AboutPage() {
  const currentRelease = CHANGELOG[0];

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
          <div className="flex flex-col sm:flex-row sm:items-baseline gap-4 mb-8 justify-center sm:justify-start">
            <h1 className="text-5xl sm:text-8xl font-black tracking-tighter uppercase leading-[0.8] mb-2">
              Scholar <span className="text-accent italic font-serif lowercase tracking-normal">Atlas</span>
            </h1>
            <div className="flex items-center gap-2 px-3 py-1 bg-ink text-white rounded-lg shadow-lg rotate-2 sm:translate-y-[-10px]">
               <span className="text-xs font-black uppercase tracking-tighter">Current</span>
               <span className="text-sm font-bold opacity-80">v{APP_VERSION.current}</span>
            </div>
          </div>
          
          <p className="text-2xl sm:text-4xl font-bold text-ink-2 mb-10 leading-tight italic font-serif max-w-2xl">
            Built by Nawfat, for students navigating the edge of academic chaos.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left max-w-3xl">
            <div className="p-6 bg-white/40 backdrop-blur-md rounded-[32px] border border-white/60 shadow-sm group hover:border-accent/40 transition-all">
              <Zap className="text-accent mb-3 group-hover:scale-110 transition-transform" size={24} />
              <p className="text-ink-2 text-sm leading-relaxed font-medium">
                Scholar Atlas was forged from a singular frustration: existing tools are too slow, too noisy, and too invasive. I needed a tactical map, not a spreadsheet.
              </p>
            </div>
            <div className="p-6 bg-white/40 backdrop-blur-md rounded-[32px] border border-white/60 shadow-sm group hover:border-green-400/40 transition-all">
              <ShieldCheck className="text-green-600 mb-3 group-hover:scale-110 transition-transform" size={24} />
              <p className="text-ink-2 text-sm leading-relaxed font-medium">
                Everything runs in your browser. Your data never leaves your machine. Privacy isn&apos;t a feature here; it&apos;s the foundation of the entire architecture.
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: Motivation (The "Atlas" Mindset) */}
        <section className="mb-32">
          <div className="flex items-center gap-4 mb-16">
            <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent via-border-strong to-transparent" />
            <h2 className="text-[12px] font-black text-ink-4 uppercase tracking-[0.4em] px-4 whitespace-nowrap">The Motivation</h2>
            <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent via-border-strong to-transparent" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-8">
              <div className="relative p-1">
                <div className="absolute -left-6 top-0 bottom-0 w-1.5 bg-accent/20 rounded-full" />
                <p className="text-xl text-ink leading-relaxed font-medium pl-4">
                  Most academic tools assume your semester is static. They log what happened; they don&apos;t tell you what&apos;s coming. I spent too many late nights reverse-engineering my own grade trajectories in a spreadsheet because nothing else did it right.
                </p>
              </div>
              <p className="text-lg text-ink leading-relaxed font-medium">
                Scholar Atlas started as that spreadsheet. The goal was simple: show me, at any point in the semester, exactly what I need to score to finish where I want. No extra clicks, no buried menus. I cared as much about how the numbers were laid out as whether they were correct, because an interface that fights you at 3 AM is useless regardless of what&apos;s underneath.
              </p>
            </div>

            <div className="lg:col-span-5 flex flex-col gap-8">
              <div className="bg-gradient-to-br from-[#fff7ed] to-[#ffedd5] p-10 rounded-[48px] border border-accent/10 shadow-[inset_0_2px_10px_rgba(146,64,14,0.05),0_20px_40px_rgba(146,64,14,0.05)] relative group overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-accent/10 rounded-full blur-2xl -mr-12 -mt-12 group-hover:bg-accent/20 transition-all duration-700" />
                <h4 className="text-xs font-black text-accent uppercase tracking-widest mb-6 flex items-center gap-2">
                   <div className="w-4 h-[2px] bg-accent" />
                   Philosophy
                </h4>
                <ul className="space-y-5">
                  {[
                    "Zero latency interaction",
                    "Local-first data storage",
                    "Aesthetic as a utility",
                    "Open-source transparency"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-4 text-sm font-bold text-amber-900/80">
                      <div className="w-2 h-2 rounded-full bg-accent shadow-[0_0_8px_rgba(146,64,14,0.4)]" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-ink p-10 rounded-[48px] text-white shadow-2xl shadow-ink/20 relative group overflow-hidden">
                <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
                <Cpu className="text-accent mb-6 animate-pulse" size={32} />
                <p className="text-sm font-medium leading-relaxed italic opacity-80">
                  &quot;I believe a tool is only as good as the friction it removes. Scholar Atlas is my attempt to automate the mental load of being a student.&quot;
                </p>
                <div className="mt-6 flex items-center gap-3">
                  <div className="w-8 h-[1px] bg-accent opacity-50" />
                  <p className="text-sm font-black uppercase tracking-[0.3em] text-accent">Nawfat</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Features */}
        <section className="mb-32">
          <h2 className="text-[12px] font-black text-ink-4 uppercase tracking-[0.4em] mb-16 text-center">System Capabilities</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((f, i) => (
              <div key={i} className="bg-white/40 backdrop-blur-xl p-10 rounded-[40px] border border-border-strong hover:border-accent/40 hover:shadow-xl hover:-translate-y-2 transition-all duration-500 group">
                <div className={`w-16 h-16 rounded-[24px] ${f.bg} flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                  <f.icon className={`w-8 h-8 ${f.color}`} />
                </div>
                <h3 className="text-xl font-black text-ink mb-3 uppercase tracking-tight">{f.name}</h3>
                <p className="text-sm text-ink-3 leading-relaxed font-medium opacity-90">{f.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 4: Changelog */}
        <section className="mb-32">
          <h2 className="text-[12px] font-black text-ink-4 uppercase tracking-[0.4em] mb-16">The Roadmap</h2>
          <div className="bg-white/60 backdrop-blur-2xl p-10 sm:p-16 rounded-[64px] border border-border-strong shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -mr-32 -mt-32 group-hover:bg-accent/10 transition-all duration-1000" />
            
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-2">
                 <h3 className="text-4xl font-black tracking-tight">Version {currentRelease.version}</h3>
                 <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              </div>
              <p className="text-sm text-ink-3 font-bold uppercase tracking-[0.2em] opacity-60">
                Deployed {format(new Date(currentRelease.date), "MMMM d, yyyy")}
              </p>
            </div>
            
            <div className="space-y-6">
              {currentRelease.changes.map((change, i) => (
                <div key={i} className="flex items-start gap-6 p-5 rounded-3xl hover:bg-white/60 border border-transparent hover:border-border-strong transition-all group/item">
                  <span className={`px-4 py-1 rounded-xl text-[11px] font-black uppercase tracking-widest shrink-0 shadow-sm ${
                    change.type === 'NEW' ? 'bg-green-500 text-white shadow-green-200' :
                    change.type === 'IMPROVED' ? 'bg-blue-500 text-white shadow-blue-200' :
                    change.type === 'FIXED' ? 'bg-amber-500 text-white shadow-amber-200' :
                    'bg-red-500 text-white shadow-red-200'
                  }`}>
                    {change.type}
                  </span>
                  <span className="text-lg text-ink-2 font-bold tracking-tight opacity-90 group-hover/item:text-ink transition-colors">{change.description}</span>
                </div>
              ))}
            </div>
            
            <div className="mt-16 pt-10 border-t border-border-strong flex justify-center">
               <Link href="/about/changelog" className="group/link flex items-center gap-3 text-[11px] font-black text-ink-3 uppercase tracking-[0.3em] hover:text-accent transition-all">
                  Full version history 
                  <ArrowRight size={16} className="group-hover/link:translate-x-2 transition-transform" />
               </Link>
            </div>
          </div>
        </section>

        {/* Section 5: Stack */}
        <section className="mb-32 text-center">
          <h2 className="text-[11px] font-black text-ink-4 uppercase tracking-[0.5em] mb-16">Core Architecture</h2>
          <div className="flex flex-wrap gap-8 justify-center px-4">
            {[
              { name: "Next.js 15", color: "from-blue-400 to-blue-600", shadow: "shadow-blue-500/20" },
              { name: "Supabase", color: "from-emerald-400 to-emerald-600", shadow: "shadow-emerald-500/20" },
              { name: "TypeScript", color: "from-indigo-400 to-indigo-600", shadow: "shadow-indigo-500/20" },
              { name: "Tailwind CSS", color: "from-cyan-400 to-cyan-600", shadow: "shadow-cyan-500/20" },
              { name: "Cloudflare", color: "from-orange-400 to-orange-600", shadow: "shadow-orange-500/20" }
            ].map((tech, i) => (
              <div 
                key={i} 
                className={`
                  relative px-8 py-5 rounded-[24px] bg-ink text-white font-black text-xs uppercase tracking-[0.2em]
                  shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.1)]
                  hover:-translate-y-2 hover:rotate-2 transition-all duration-500 cursor-default
                  overflow-hidden group
                `}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${tech.color} opacity-0 group-hover:opacity-20 transition-opacity duration-500`} />
                {/* Neon Border Effect */}
                <div className={`absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r ${tech.color} opacity-80 shadow-[0_0_15px_rgba(255,255,255,0.5)]`} />
                <span className="relative z-10">{tech.name}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Section 6: Footer CTA */}
        <section className="relative group overflow-hidden">
           <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-orange-500/5 to-transparent blur-3xl opacity-50 group-hover:opacity-100 transition-opacity duration-1000" />
           
           <div className="relative bg-white/40 backdrop-blur-3xl border border-white/60 p-16 sm:p-24 rounded-[80px] text-center shadow-[0_40px_100px_rgba(0,0,0,0.03)] group-hover:border-accent/20 transition-all duration-700">
             <div className="max-w-xl mx-auto space-y-10">
               <div className="inline-flex items-center justify-center w-20 h-20 bg-accent/10 rounded-[32px] mb-4 shadow-inner">
                  <Rocket size={36} className="text-accent animate-bounce" />
               </div>
               
               <h2 className="text-4xl sm:text-6xl font-black tracking-tight leading-none">
                 Ready to chart your <span className="text-accent italic font-serif lowercase tracking-normal">course?</span>
               </h2>
               
               <p className="text-xl font-bold text-ink-2 italic font-serif leading-relaxed opacity-80 px-4">
                 Join the students who are turning their academic chaos into a tactical advantage. Initialize your Atlas today.
               </p>

               <div className="flex flex-col items-center gap-8 pt-4">
                 <Link href="/signup" className="group/btn relative px-16 py-6 rounded-[32px] bg-ink text-white font-black uppercase tracking-[0.3em] text-sm overflow-hidden shadow-2xl hover:scale-105 active:scale-95 transition-all duration-500">
                   <div className="absolute inset-0 bg-gradient-to-r from-accent to-orange-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500" />
                   <span className="relative z-10">Initialize Atlas</span>
                 </Link>
                 
                 <Link href="/" className="group/base flex items-center gap-3 text-[12px] font-black text-ink-4 uppercase tracking-[0.4em] hover:text-accent transition-all">
                   <ArrowLeft size={16} className="group-hover/base:-translate-x-2 transition-transform" />
                   Return to Base
                 </Link>
               </div>
             </div>
             
             {/* Decorative Corner Icons */}
             <Star className="absolute top-12 left-12 text-accent/20 animate-spin-slow" size={24} />
             <Star className="absolute bottom-12 right-12 text-accent/20 animate-spin-slow" size={24} />
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
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 12s linear infinite;
        }
      `}</style>
    </div>
  );
}
