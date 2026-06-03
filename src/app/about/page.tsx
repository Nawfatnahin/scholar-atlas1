"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { APP_VERSION } from "@/lib/version";
import { CHANGELOG } from "@/lib/changelog";
import { 
  ArrowRight, 
  ArrowLeft,
  CheckCircle2,
  Lock,
  Zap,
  BarChart4,
  Library
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
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0A0A0A] font-body flex flex-col text-[#111111] dark:text-[#EDEDED] selection:bg-[#111] selection:text-white dark:selection:bg-[#EDEDED] dark:selection:text-[#111]">
      <Navigation />
      
      {isPageLoading ? (
        <main className="flex-1 max-w-5xl mx-auto px-6 py-24 sm:py-32 w-full animate-pulse">
           <div className="h-16 w-3/4 bg-neutral-200 dark:bg-neutral-800 rounded-md mb-8" />
           <div className="h-6 w-1/2 bg-neutral-200 dark:bg-neutral-800 rounded-md mb-24" />
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
             <div className="h-64 bg-neutral-200 dark:bg-neutral-800 rounded-md" />
             <div className="h-64 bg-neutral-200 dark:bg-neutral-800 rounded-md" />
           </div>
        </main>
      ) : (
        <main className="flex-1 max-w-5xl mx-auto px-6 py-20 sm:py-32 w-full fade-in-up">
          
          {/* Header Section */}
          <header className="mb-24 sm:mb-40 max-w-3xl">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-[1px] w-8 bg-neutral-300 dark:bg-neutral-700" />
              <span className="text-xs tracking-[0.2em] uppercase text-neutral-500 font-semibold">
                Version {APP_VERSION.current}
              </span>
            </div>
            <h1 className="text-5xl sm:text-7xl font-serif tracking-tight leading-[1.1] mb-8 text-[#111] dark:text-[#EDEDED]">
              Clarity in the midst of academic chaos.
            </h1>
            <p className="text-xl sm:text-2xl text-neutral-600 dark:text-neutral-400 font-light leading-relaxed">
              Scholar Atlas is a quiet, powerful workspace designed to track grades, predict outcomes, and manage classes—without the noise of traditional school portals.
            </p>
          </header>

          {/* Philosophy & Bio Section */}
          <section className="mb-32 grid grid-cols-1 md:grid-cols-12 gap-12 sm:gap-20 items-start">
            <div className="md:col-span-5 border-t border-neutral-200 dark:border-neutral-800 pt-8">
              <h2 className="text-sm font-semibold tracking-widest uppercase text-neutral-400 mb-6">
                The Architect
              </h2>
              <div className="prose prose-neutral dark:prose-invert">
                <p className="text-lg leading-relaxed text-neutral-800 dark:text-neutral-200">
                  Built by <strong>Nawfat</strong>. A developer who grew exhausted with clunky university spreadsheets and invasive tracking tools. Scholar Atlas was built to be fast, elegant, and fiercely private.
                </p>
              </div>
            </div>
            
            <div className="md:col-span-7 border-t border-neutral-200 dark:border-neutral-800 pt-8">
               <h2 className="text-sm font-semibold tracking-widest uppercase text-neutral-400 mb-6">
                Core Philosophy
              </h2>
              <ul className="space-y-8">
                <li className="flex gap-4">
                  <span className="text-neutral-300 dark:text-neutral-600 mt-1"><Lock size={20} strokeWidth={1.5}/></span>
                  <div>
                    <h3 className="text-lg font-serif mb-2">Absolute Privacy</h3>
                    <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">Everything happens locally in your browser. Your grades and data are stored on your machine and never sent to our servers. We cannot see it, and we cannot sell it.</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="text-neutral-300 dark:text-neutral-600 mt-1"><Zap size={20} strokeWidth={1.5}/></span>
                  <div>
                    <h3 className="text-lg font-serif mb-2">Uncompromising Speed</h3>
                    <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">Because there is no backend database slowing things down, navigating between your dashboard, attendance, and grades is instantaneous.</p>
                  </div>
                </li>
              </ul>
            </div>
          </section>

          {/* How it Works Section */}
          <section className="mb-32">
             <div className="border-t border-neutral-200 dark:border-neutral-800 pt-16 mb-16 flex justify-between items-end">
               <h2 className="text-3xl sm:text-5xl font-serif tracking-tight">How it works</h2>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {/* Feature 1 */}
               <div className="group border border-neutral-200 dark:border-neutral-800 p-8 hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors bg-white dark:bg-[#111]">
                 <BarChart4 className="mb-8 text-neutral-400 group-hover:text-[#111] dark:group-hover:text-white transition-colors" size={28} strokeWidth={1} />
                 <h3 className="text-xl font-serif mb-4">Grade Engine</h3>
                 <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                   Input your syllabus weights. Log your assignment scores. The engine instantly calculates what you need on the final to secure your target grade. No guesswork.
                 </p>
               </div>
               
               {/* Feature 2 */}
               <div className="group border border-neutral-200 dark:border-neutral-800 p-8 hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors bg-white dark:bg-[#111]">
                 <CheckCircle2 className="mb-8 text-neutral-400 group-hover:text-[#111] dark:group-hover:text-white transition-colors" size={28} strokeWidth={1} />
                 <h3 className="text-xl font-serif mb-4">Attendance Matrix</h3>
                 <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                   A precise ledger of your presence. Track cuts, set mandatory attendance thresholds, and receive warnings before you breach university limits.
                 </p>
               </div>

               {/* Feature 3 */}
               <div className="group border border-neutral-200 dark:border-neutral-800 p-8 hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors bg-white dark:bg-[#111]">
                 <Library className="mb-8 text-neutral-400 group-hover:text-[#111] dark:group-hover:text-white transition-colors" size={28} strokeWidth={1} />
                 <h3 className="text-xl font-serif mb-4">Local Utilities</h3>
                 <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                   Merge, split, and edit PDFs directly inside the browser using your machine&apos;s memory. Your sensitive assignments never touch an external server.
                 </p>
               </div>
             </div>
          </section>

          {/* Simplified Changelog Section */}
          <section className="mb-32">
             <div className="bg-neutral-100 dark:bg-[#111] border border-neutral-200 dark:border-neutral-800 p-12 sm:p-20">
               <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-16 gap-6">
                 <div>
                   <p className="text-xs font-semibold tracking-widest uppercase text-neutral-500 mb-4">Current Release</p>
                   <h2 className="text-4xl font-serif tracking-tight">Version {currentRelease.version}</h2>
                 </div>
                 <p className="text-sm text-neutral-500 font-mono">
                    {format(new Date(currentRelease.date), "MMMM d, yyyy")}
                 </p>
               </div>
               
               <div className="space-y-4 max-w-2xl">
                 {currentRelease.changes.map((change, i) => (
                   <div key={i} className="flex gap-6 items-start border-b border-neutral-200 dark:border-neutral-800 pb-4 last:border-0 last:pb-0">
                     <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 w-20 pt-1">
                       {change.type}
                     </span>
                     <span className="text-base text-neutral-800 dark:text-neutral-300">
                       {change.description}
                     </span>
                   </div>
                 ))}
               </div>

               <div className="mt-16">
                  <Link href="/about/changelog" className="inline-flex items-center gap-2 text-sm font-semibold tracking-wide hover:text-neutral-500 transition-colors">
                     View Historical Logs <ArrowRight size={16} />
                  </Link>
               </div>
             </div>
          </section>

          {/* CTA Section */}
          <section className="text-center py-24 sm:py-32 border-t border-neutral-200 dark:border-neutral-800">
             <h2 className="text-4xl sm:text-6xl font-serif tracking-tight mb-8">
               Ready to begin?
             </h2>
             <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-12 max-w-lg mx-auto">
               Initialize your local workspace today and take absolute control over your academic trajectory.
             </p>
             
             <div className="flex flex-col items-center gap-8">
                <Link 
                  href={loading ? "#" : (user ? "/dashboard" : "/signup")} 
                  className="px-10 py-5 bg-[#111] dark:bg-[#EDEDED] text-white dark:text-[#111] text-sm font-semibold tracking-widest uppercase hover:bg-neutral-800 dark:hover:bg-white transition-colors"
                >
                  {loading ? "Checking Status..." : (user ? "Open Dashboard" : "Initialize Workspace")}
                </Link>
                
                <Link href="/" className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-neutral-500 hover:text-[#111] dark:hover:text-white transition-colors">
                  <ArrowLeft size={14} /> Return to base
                </Link>
             </div>
          </section>
        </main>
      )}

      <Footer />
      
      <style jsx>{`
        .fade-in-up {
          animation: fadeInUp 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
