"use client";

import { useState, useEffect } from "react";
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
import { useSubscription } from "@/components/SubscriptionProvider";

export default function AboutPage() {
  const { user, loading } = useSubscription();
  const currentRelease = CHANGELOG[0];
  const [isPageLoading, setIsPageLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);


  return (
    <div className="min-h-screen bg-bg font-body flex flex-col relative overflow-hidden text-ink">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />
      
      <Navigation />
      
      {isPageLoading ? (
        <main className="flex-1 max-w-[920px] mx-auto px-6 py-20 sm:py-32 relative z-10 w-full animate-fade-in">
          {/* Section 1: Hero Skeleton */}
          <section className="mb-32 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-4 mb-8">
              <div className="h-16 w-80 bg-stone-200 dark:bg-stone-800 rounded-2xl animate-pulse" />
              <div className="h-8 w-24 bg-stone-200 dark:bg-stone-800 rounded-lg animate-pulse" />
            </div>
            
            <div className="h-10 w-2/3 bg-stone-200 dark:bg-stone-800 rounded-xl animate-pulse mb-10" />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left max-w-3xl">
              <div className="p-6 bg-stone-100 dark:bg-stone-900/40 rounded-[32px] border border-border-strong animate-pulse h-40 space-y-4">
                <div className="w-10 h-10 bg-stone-200 dark:bg-stone-800 rounded-full" />
                <div className="h-4 w-full bg-stone-200 dark:bg-stone-800 rounded-md" />
                <div className="h-4 w-5/6 bg-stone-200 dark:bg-stone-800 rounded-md" />
              </div>
              <div className="p-6 bg-stone-100 dark:bg-stone-900/40 rounded-[32px] border border-border-strong animate-pulse h-40 space-y-4">
                <div className="w-10 h-10 bg-stone-200 dark:bg-stone-800 rounded-full" />
                <div className="h-4 w-full bg-stone-200 dark:bg-stone-800 rounded-md" />
                <div className="h-4 w-5/6 bg-stone-200 dark:bg-stone-800 rounded-md" />
              </div>
            </div>
          </section>

          {/* Section 2: Redesigned Main Layout Skeleton */}
          <section className="mb-32">
            <div className="flex items-center gap-4 mb-16">
              <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent via-border-strong to-transparent" />
              <div className="h-4 w-40 bg-stone-200 dark:bg-stone-800 rounded-md animate-pulse" />
              <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent via-border-strong to-transparent" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              {/* Left Column Skeleton */}
              <div className="lg:col-span-7 space-y-8">
                <div className="space-y-4">
                  <div className="h-10 w-5/6 bg-stone-200 dark:bg-stone-800 rounded-xl animate-pulse" />
                  <div className="h-10 w-2/3 bg-stone-200 dark:bg-stone-800 rounded-xl animate-pulse" />
                </div>
                
                <div className="space-y-3">
                  <div className="h-4 w-full bg-stone-200 dark:bg-stone-800 rounded-md animate-pulse" />
                  <div className="h-4 w-11/12 bg-stone-200 dark:bg-stone-800 rounded-md animate-pulse" />
                  <div className="h-4 w-full bg-stone-200 dark:bg-stone-800 rounded-md animate-pulse" />
                  <div className="h-4 w-4/5 bg-stone-200 dark:bg-stone-800 rounded-md animate-pulse" />
                </div>

                <div className="flex gap-4">
                  <div className="h-8 w-24 bg-stone-200 dark:bg-stone-800 rounded-lg animate-pulse" />
                  <div className="h-8 w-24 bg-stone-200 dark:bg-stone-800 rounded-lg animate-pulse" />
                  <div className="h-8 w-24 bg-stone-200 dark:bg-stone-800 rounded-lg animate-pulse" />
                </div>

                <div className="grid grid-cols-3 gap-6 pt-10 border-t border-stone-200 dark:border-stone-800">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="space-y-3 text-center">
                      <div className="w-8 h-8 bg-stone-200 dark:bg-stone-800 rounded-full mx-auto animate-pulse" />
                      <div className="h-5 w-12 bg-stone-200 dark:bg-stone-800 rounded-md mx-auto animate-pulse" />
                      <div className="h-3 w-16 bg-stone-200 dark:bg-stone-800 rounded-md mx-auto animate-pulse" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column Skeleton */}
              <div className="lg:col-span-5 flex flex-col gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-4 p-5 bg-stone-100 dark:bg-stone-900/40 rounded-[24px] border border-border-strong animate-pulse">
                    <div className="w-12 h-12 bg-stone-200 dark:bg-stone-800 rounded-xl shrink-0" />
                    <div className="flex-1 space-y-3">
                      <div className="h-4 w-28 bg-stone-200 dark:bg-stone-800 rounded-md" />
                      <div className="h-3 w-full bg-stone-200 dark:bg-stone-800 rounded-md" />
                      <div className="h-3 w-5/6 bg-stone-200 dark:bg-stone-800 rounded-md" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>
      ) : (
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

        {/* Section 2: Redesigned About & Core Capabilities Grid (WANDER.ph Layout) */}
        <section className="mb-32">
          <div className="flex items-center gap-4 mb-16">
            <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent via-border-strong to-transparent" />
            <h2 className="text-[12px] font-black text-ink-4 uppercase tracking-[0.4em] px-4 whitespace-nowrap">Core Philosophy</h2>
            <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent via-border-strong to-transparent" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left Column: Story & Developer Background */}
            <div className="lg:col-span-7 space-y-8">
              <h2 className="text-3xl sm:text-5xl font-black tracking-tight uppercase leading-tight text-ink">
                Engineered for Academic Control
              </h2>
              
              <p className="text-lg text-ink-2 leading-relaxed font-medium">
                Designed and built by Nawfat, Scholar Atlas replaces sluggish spreadsheets with a fast, client-side utility workspace. Combining attendance trackers, grade simulators, and local PDF tools, it runs entirely within your browser environment.
              </p>

              <p className="text-base text-ink-3 leading-relaxed font-medium">
                By leveraging Next.js 15, TypeScript, Supabase RLS, and Cloudflare Workers, the platform processes calculations on your hardware without exporting log metrics. It is optimized to eliminate interface latency so you can analyze metrics instantly at any hour.
              </p>

              {/* Developer Links */}
              <div className="flex flex-wrap gap-4 pt-2">
                <Link 
                  href="https://github.com/Nawfatnahin" 
                  target="_blank" 
                  className="flex items-center gap-2 px-4 py-2 border border-border-strong rounded-xl text-xs font-black uppercase tracking-wider text-ink-2 hover:text-accent hover:border-accent/40 bg-bg-surface hover:bg-bg transition-all"
                >
                  <Cpu size={14} /> GitHub Profile
                </Link>
                <Link 
                  href="https://x.com/Nawfat" 
                  target="_blank" 
                  className="flex items-center gap-2 px-4 py-2 border border-border-strong rounded-xl text-xs font-black uppercase tracking-wider text-ink-2 hover:text-accent hover:border-accent/40 bg-bg-surface hover:bg-bg transition-all"
                >
                  <Zap size={14} /> Twitter / X
                </Link>
                <Link 
                  href="mailto:contact@scholaratlas.com" 
                  className="flex items-center gap-2 px-4 py-2 border border-border-strong rounded-xl text-xs font-black uppercase tracking-wider text-ink-2 hover:text-accent hover:border-accent/40 bg-bg-surface hover:bg-bg transition-all"
                >
                  <FileText size={14} /> Contact
                </Link>
              </div>

              {/* Stats Pedestal Grid */}
              <div className="grid grid-cols-3 gap-6 pt-10 border-t border-border-strong mt-10">
                <div className="text-center sm:text-left space-y-1">
                  <div className="w-10 h-10 rounded-full bg-accent/5 flex items-center justify-center mx-auto sm:mx-0 mb-3 text-accent dark:bg-accent/10 dark:text-orange-400">
                    <Cpu size={18} />
                  </div>
                  <h4 className="text-2xl sm:text-3xl font-black text-ink leading-none">100%</h4>
                  <p className="text-[10px] font-black uppercase tracking-widest text-ink-4">Client-Side</p>
                </div>
                <div className="text-center sm:text-left space-y-1">
                  <div className="w-10 h-10 rounded-full bg-accent/5 flex items-center justify-center mx-auto sm:mx-0 mb-3 text-accent dark:bg-accent/10 dark:text-orange-400">
                    <Zap size={18} />
                  </div>
                  <h4 className="text-2xl sm:text-3xl font-black text-ink leading-none">&lt; 0.1s</h4>
                  <p className="text-[10px] font-black uppercase tracking-widest text-ink-4">Execution Latency</p>
                </div>
                <div className="text-center sm:text-left space-y-1">
                  <div className="w-10 h-10 rounded-full bg-accent/5 flex items-center justify-center mx-auto sm:mx-0 mb-3 text-accent dark:bg-accent/10 dark:text-orange-400">
                    <ShieldCheck size={18} />
                  </div>
                  <h4 className="text-2xl sm:text-3xl font-black text-ink leading-none">0</h4>
                  <p className="text-[10px] font-black uppercase tracking-widest text-ink-4">Logs Uploaded</p>
                </div>
              </div>
            </div>

            {/* Right Column: Stacked Cards (WANDER.ph style) */}
            <div className="lg:col-span-5 flex flex-col gap-6 w-full">
              {/* Card 1: Dynamic Grade Simulator (Dark/Accent color style) */}
              <div className="flex gap-5 p-6 rounded-[24px] shadow-md border border-transparent bg-accent text-white dark:bg-accent/20 dark:border-accent/30 dark:text-white transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-white/10 text-white dark:bg-accent/20 dark:text-orange-400 flex items-center justify-center shrink-0 shadow-sm">
                  <GraduationCap size={22} />
                </div>
                <div className="flex-1 space-y-1">
                  <h4 className="font-black uppercase tracking-wider text-sm">
                    Grade Simulator
                  </h4>
                  <p className="text-xs leading-relaxed opacity-90">
                    Predict final semester outcomes with a custom simulation engine. Test various grade inputs and understand exactly what marks you need to hit your targets.
                  </p>
                </div>
              </div>

              {/* Card 2: Attendance Tracker (Warm/Mid-tone style) */}
              <div className="flex gap-5 p-6 rounded-[24px] border border-accent/10 bg-accent-light/50 text-ink dark:bg-zinc-900/40 dark:border-zinc-800 dark:text-white transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-accent/10 text-accent dark:bg-zinc-800 dark:text-orange-400 flex items-center justify-center shrink-0">
                  <CalendarCheck size={22} />
                </div>
                <div className="flex-1 space-y-1">
                  <h4 className="font-black uppercase tracking-wider text-sm text-ink">
                    Attendance Health
                  </h4>
                  <p className="text-xs leading-relaxed text-ink-2 dark:text-ink-2 opacity-95">
                    Monitor classes and predict if you will fall below threshold levels before it is too late, complete with custom timetable placeholders.
                  </p>
                </div>
              </div>

              {/* Card 3: PDF Suite (Light Glass style) */}
              <div className="flex gap-5 p-6 rounded-[24px] border border-white/60 bg-white/40 text-ink dark:bg-black/40 dark:border-zinc-900 dark:text-white transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-stone-200/50 text-ink-2 dark:bg-zinc-950 dark:text-ink-3 flex items-center justify-center shrink-0">
                  <FileText size={22} />
                </div>
                <div className="flex-1 space-y-1">
                  <h4 className="font-black uppercase tracking-wider text-sm text-ink">
                    Local PDF Tools
                  </h4>
                  <p className="text-xs leading-relaxed text-ink-2 dark:text-ink-2 opacity-95">
                    Merge, split, and convert documents locally in the browser. Zero server uploads, guaranteeing total document privacy.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Changelog */}
        <section className="mb-32">
          <div className="flex items-center gap-4 mb-16">
            <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent via-border-strong to-transparent" />
            <h2 className="text-[12px] font-black text-ink-4 uppercase tracking-[0.4em] px-4 whitespace-nowrap">The Roadmap</h2>
            <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent via-border-strong to-transparent" />
          </div>
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
          <div className="flex items-center gap-4 mb-16">
            <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent via-border-strong to-transparent" />
            <h2 className="text-[11px] font-black text-ink-4 uppercase tracking-[0.5em] px-4 whitespace-nowrap">Core Architecture</h2>
            <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent via-border-strong to-transparent" />
          </div>
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
                  <Link 
                    href={loading ? "#" : (user ? "/dashboard" : "/signup")} 
                    className="group/btn relative px-16 py-6 rounded-[32px] bg-ink text-white font-black uppercase tracking-[0.3em] text-sm overflow-hidden shadow-2xl hover:scale-105 active:scale-95 transition-all duration-500"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-accent to-orange-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500" />
                    <span className="relative z-10">
                      {loading ? "Checking Status..." : (user ? "Go to Dashboard" : "Initialize Atlas")}
                    </span>
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
      )}

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
