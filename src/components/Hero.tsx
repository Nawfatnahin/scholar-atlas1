"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Check, FileText, CalendarCheck, LayoutList } from "lucide-react";
import { useSubscription } from "@/components/SubscriptionProvider";

export default function Hero() {
  const [activeTab, setActiveTab] = useState<"att" | "tasks" | "pdf">("att");
  const { user } = useSubscription();

  return (
    <section className="pt-32 pb-20 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-[80px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-12 lg:gap-48 items-center">
        <div className="flex flex-col items-start gap-8 lg:-translate-x-8">

          <h1 className="text-[32px] sm:text-[40px] lg:text-[64px] font-serif font-bold text-ink leading-[1.15] tracking-tight">
            Balance your <br />
            <span className="italic text-accent">procrastination</span> <br />
            and progress.
          </h1>
          
          <p className="text-xl text-ink-2 max-w-lg leading-relaxed font-medium">
            All in one platform to manage your subjects, track attendance and stay on top of assignments. 
            Stop worrying about backlogs and start organizing your academic life.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mt-2">
            <Link 
              href="/dashboard" 
              className={`
                flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-bold transition-all duration-300 active:scale-95 w-full sm:w-auto
                ${user 
                  ? "bg-accent text-white shadow-[0_10px_20px_-5px_rgba(146,64,14,0.4),inset_0_1px_1px_rgba(255,255,255,0.3)] hover:shadow-[0_15px_30px_-5px_rgba(146,64,14,0.5)] hover:-translate-y-1" 
                  : "btn-primary"
                }
              `}
            >
              {user ? "Go to Dashboard" : "Get Started Free"}
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="#features" className="px-8 py-4 rounded-2xl font-bold bg-white/50 backdrop-blur-sm border border-border-strong text-ink hover:bg-white hover:shadow-lg transition-all text-center w-full sm:w-auto">Explore Features</Link>
          </div>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-ink-3">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              Free forever
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-ink-3">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              Secure browser processing
            </div>
          </div>
        </div>

        {/* Visual Mockup */}
        <div className="relative animate-float lg:scale-[1.35] xl:scale-[1.5] transition-transform duration-500 origin-center mt-12 lg:mt-0 pb-12 lg:pb-0">
          <div className="absolute -top-4 -right-2 sm:-top-6 sm:-right-6 bg-white border border-border-strong rounded-2xl p-3 sm:p-4 shadow-xl z-20">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                <Check className="w-5 h-5 sm:w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] sm:text-xs text-ink-3 font-medium">Attendance</p>
                <p className="text-base sm:text-lg font-bold text-ink">84%</p>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-[40px] p-6 sm:p-8 aspect-square flex flex-col gap-6 relative overflow-hidden transition-all duration-500 hover:shadow-[0_50px_100px_rgba(0,0,0,0.08)] hover:-rotate-1">
            <div className="flex gap-2 mb-1 sm:mb-2 z-10">
              <div className="w-3 h-3 rounded-full bg-red-400 shadow-sm" />
              <div className="w-3 h-3 rounded-full bg-amber-400 shadow-sm" />
              <div className="w-3 h-3 rounded-full bg-green-400 shadow-sm" />
            </div>

            <div className="flex gap-1.5 bg-stone-200/40 backdrop-blur-md p-1.5 rounded-2xl border border-white/40 z-10">
              <button 
                onClick={() => setActiveTab("att")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 sm:py-2.5 rounded-xl text-[10px] sm:text-sm font-black transition-all duration-300 active:scale-95 ${activeTab === 'att' ? 'bg-white text-accent shadow-[0_4px_12px_rgba(0,0,0,0.03),inset_0_1px_1px_white] border border-white/60' : 'text-ink-3 hover:text-ink hover:bg-white/30'}`}
              >
                <CalendarCheck className="w-3.5 h-3.5 sm:w-4 h-4" />
                <span className="hidden sm:inline">Attendance</span>
                <span className="sm:hidden">Att</span>
              </button>
              <button 
                onClick={() => setActiveTab("tasks")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 sm:py-2.5 rounded-xl text-[10px] sm:text-sm font-black transition-all duration-300 active:scale-95 ${activeTab === 'tasks' ? 'bg-white text-accent shadow-[0_4px_12px_rgba(0,0,0,0.03),inset_0_1px_1px_white] border border-white/60' : 'text-ink-3 hover:text-ink hover:bg-white/30'}`}
              >
                <LayoutList className="w-3.5 h-3.5 sm:w-4 h-4" />
                <span className="hidden sm:inline">Tasks</span>
                <span className="sm:hidden">Tasks</span>
              </button>
              <button 
                onClick={() => setActiveTab("pdf")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 sm:py-2.5 rounded-xl text-[10px] sm:text-sm font-black transition-all duration-300 active:scale-95 ${activeTab === 'pdf' ? 'bg-white text-accent shadow-[0_4px_12px_rgba(0,0,0,0.03),inset_0_1px_1px_white] border border-white/60' : 'text-ink-3 hover:text-ink hover:bg-white/30'}`}
              >
                <FileText className="w-3.5 h-3.5 sm:w-4 h-4" />
                <span className="hidden sm:inline">PDF Tools</span>
                <span className="sm:hidden">PDF</span>
              </button>
            </div>

            <div className="flex-1 overflow-hidden z-10">
              {activeTab === 'att' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                  {[
                    { n: "Data Structures", p: 85, c: "text-green-600", bg: "bg-green-600" },
                    { n: "Algorithm Analysis", p: 72, c: "text-amber-600", bg: "bg-amber-600" },
                    { n: "Discrete Math", p: 58, c: "text-red-600", bg: "bg-red-600" },
                  ].map((s, i) => (
                    <div key={i} className="bg-white/40 backdrop-blur-xl border border-white/60 p-4 rounded-2xl flex justify-between items-center shadow-[0_10px_25px_rgba(0,0,0,0.02),inset_0_1px_1px_white] hover:shadow-[0_15px_30px_rgba(0,0,0,0.05),inset_0_1px_1px_white] hover:-translate-y-1 transition-all duration-300 ease-out group/item">
                      <div className="flex-1">
                        <div className="font-bold text-sm mb-2 text-ink-2 group-hover/item:text-accent transition-colors">{s.n}</div>
                        <div className="h-1.5 w-full bg-stone-200/50 rounded-full overflow-hidden shadow-inner">
                          <div className={`h-full bg-gradient-to-r ${s.bg === 'bg-green-600' ? 'from-green-500 to-green-600' : s.bg === 'bg-amber-600' ? 'from-amber-500 to-amber-600' : 'from-red-500 to-red-600'} rounded-full`} style={{ width: `${s.p}%` }} />
                        </div>
                      </div>
                      <div className={`text-xl font-black ml-6 ${s.c}`}>{s.p}%</div>
                    </div>
                  ))}
                </div>
              )}
              {activeTab === 'tasks' && (
                <div className="space-y-3 animate-in fade-in slide-in-from-right-4">
                  {[
                    { t: "Lab Report #5", p: "High", pc: "bg-red-100 text-red-700", d: "Due Today" },
                    { t: "Quiz Preparation", p: "Medium", pc: "bg-amber-100 text-amber-700", d: "Tomorrow" },
                    { t: "Group Project Intro", p: "Low", pc: "bg-blue-100 text-blue-700", d: "Next Week" },
                  ].map((t, i) => (
                    <div key={i} className="bg-white/40 backdrop-blur-xl border border-white/60 p-4 rounded-2xl flex items-center justify-between shadow-[0_10px_25px_rgba(0,0,0,0.02),inset_0_1px_1px_white] hover:shadow-[0_15px_30px_rgba(0,0,0,0.05),inset_0_1px_1px_white] hover:-translate-y-1 transition-all duration-300 ease-out group/item">
                      <div>
                        <div className="font-bold text-sm mb-1 text-ink-2 group-hover/item:text-accent transition-colors">{t.t}</div>
                        <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${t.pc} shadow-sm`}>{t.p}</span>
                      </div>
                      <div className="text-[10px] font-black text-ink-3 uppercase tracking-wider">{t.d}</div>
                    </div>
                  ))}
                </div>
              )}
              {activeTab === 'pdf' && (
                <div className="h-full flex flex-col gap-4 animate-in fade-in slide-in-from-right-4">
                  <div className="flex-1 border-2 border-dashed border-stone-200/80 rounded-2xl flex flex-col items-center justify-center bg-white/20 backdrop-blur-xl shadow-inner p-6 hover:border-accent/40 transition-colors duration-300">
                    <FileText className="w-10 h-10 text-stone-300 mb-2 group-hover:scale-110 transition-transform" />
                    <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Drop PDFs here</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {["Merge", "Split", "to Images", "to PDF"].map((m) => (
                      <div key={m} className="bg-white/40 backdrop-blur-xl border border-white/60 p-3.5 rounded-xl text-center text-xs font-black text-ink-2 shadow-[0_10px_25px_rgba(0,0,0,0.02),inset_0_1px_1px_white] hover:shadow-[0_15px_30px_rgba(0,0,0,0.05),inset_0_1px_1px_white] hover:-translate-y-1 hover:text-accent transition-all duration-300 ease-out cursor-pointer">
                        {m}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
