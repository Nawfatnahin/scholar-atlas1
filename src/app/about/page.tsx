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
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-bg-base font-body flex flex-col text-text-primary selection:bg-accent/10 selection:text-accent">
      <Navigation />
      
      {isPageLoading ? (
        <main className="flex-1 max-w-5xl mx-auto px-6 py-24 sm:py-32 w-full animate-pulse">
           <div className="h-16 w-3/4 bg-border-default rounded-md mb-8" />
           <div className="h-6 w-1/2 bg-border-default rounded-md mb-24" />
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
             <div className="h-64 bg-border-default rounded-md" />
             <div className="h-64 bg-border-default rounded-md" />
           </div>
        </main>
      ) : (
        <main className="flex-1 max-w-5xl mx-auto px-6 py-20 sm:py-32 w-full fade-in-up">
          
          {/* Header Section */}
          <header className="mb-24 sm:mb-40 max-w-3xl">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-[1px] w-8 bg-text-tertiary/30" />
              <span className="text-xs tracking-[0.2em] uppercase text-text-secondary font-semibold">
                Version {APP_VERSION.current}
              </span>
            </div>
            <h1 className="text-5xl sm:text-7xl font-serif tracking-tight leading-[1.1] mb-8 text-text-primary">
              Clarity in the midst of academic chaos.
            </h1>
            <p className="text-xl sm:text-2xl text-text-secondary font-light leading-relaxed">
              Scholar Atlas is a quiet, powerful workspace designed to track grades, predict outcomes, and manage classes—without the noise of traditional school portals.
            </p>
          </header>

          {/* Philosophy & Bio Section */}
          <section className="mb-32 grid grid-cols-1 md:grid-cols-12 gap-12 sm:gap-20 items-start">
            <div className="md:col-span-5 border-t border-border-default pt-8">
              <h2 className="text-xs font-bold tracking-widest uppercase text-accent mb-6">
                The Architect
              </h2>
              <div className="prose prose-neutral dark:prose-invert">
                <p className="text-lg leading-relaxed text-text-primary">
                  Built by <strong className="font-bold">Nawfat</strong>. A developer who grew exhausted with clunky university spreadsheets and invasive tracking tools. Scholar Atlas was built to be fast, elegant, and fiercely private.
                </p>
              </div>
            </div>
            
            <div className="md:col-span-7 border-t border-border-default pt-8">
               <h2 className="text-xs font-bold tracking-widest uppercase text-accent mb-6">
                Core Philosophy
              </h2>
              <ul className="space-y-8">
                <li className="flex gap-4">
                  <span className="text-accent mt-1"><Lock size={20} strokeWidth={1.5}/></span>
                  <div>
                    <h3 className="text-lg font-serif mb-2 text-text-primary">Absolute Privacy</h3>
                    <p className="text-text-secondary leading-relaxed">Everything happens locally in your browser. Your grades and data are stored on your machine and never sent to our servers. We cannot see it, and we cannot sell it.</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="text-accent mt-1"><Zap size={20} strokeWidth={1.5}/></span>
                  <div>
                    <h3 className="text-lg font-serif mb-2 text-text-primary">Uncompromising Speed</h3>
                    <p className="text-text-secondary leading-relaxed">Because there is no backend database slowing things down, navigating between your dashboard, attendance, and grades is instantaneous.</p>
                  </div>
                </li>
              </ul>
            </div>
          </section>

          {/* How it Works Section */}
          <section className="mb-32">
             <div className="border-t border-border-default pt-16 mb-16 flex justify-between items-end">
               <h2 className="text-3xl sm:text-5xl font-serif tracking-tight text-text-primary">How it works</h2>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {/* Feature 1 */}
               <div className="glass-card rounded-[32px] p-8 flex flex-col justify-between hover:scale-[1.02] transition-all duration-300">
                 <div>
                   <BarChart4 className="mb-8 text-accent" size={28} strokeWidth={1} />
                   <h3 className="text-xl font-serif mb-4 text-text-primary">Grade Engine</h3>
                   <p className="text-sm text-text-secondary leading-relaxed">
                     Input your syllabus weights. Log your assignment scores. The engine instantly calculates what you need on the final to secure your target grade. No guesswork.
                   </p>
                 </div>
               </div>
               
               {/* Feature 2 */}
               <div className="glass-card rounded-[32px] p-8 flex flex-col justify-between hover:scale-[1.02] transition-all duration-300">
                 <div>
                   <CheckCircle2 className="mb-8 text-accent" size={28} strokeWidth={1} />
                   <h3 className="text-xl font-serif mb-4 text-text-primary">Attendance Matrix</h3>
                   <p className="text-sm text-text-secondary leading-relaxed">
                     A precise ledger of your presence. Track cuts, set mandatory attendance thresholds, and receive warnings before you breach university limits.
                   </p>
                 </div>
               </div>

               {/* Feature 3 */}
               <div className="glass-card rounded-[32px] p-8 flex flex-col justify-between hover:scale-[1.02] transition-all duration-300">
                 <div>
                   <Library className="mb-8 text-accent" size={28} strokeWidth={1} />
                   <h3 className="text-xl font-serif mb-4 text-text-primary">Local Utilities</h3>
                   <p className="text-sm text-text-secondary leading-relaxed">
                     Merge, split, and edit PDFs directly inside the browser using your machine&apos;s memory. Your sensitive assignments never touch an external server.
                   </p>
                 </div>
               </div>
             </div>
          </section>

          {/* Simplified Changelog Section */}
          <section className="mb-32">
             <div className="glass-card rounded-[32px] p-12 sm:p-20">
               <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-16 gap-6">
                 <div>
                   <p className="text-xs font-bold tracking-widest uppercase text-accent mb-4">Current Release</p>
                   <h2 className="text-4xl font-serif tracking-tight text-text-primary">Version {currentRelease.version}</h2>
                 </div>
                 <p className="text-sm text-text-tertiary font-mono">
                    {format(new Date(currentRelease.date), "MMMM d, yyyy")}
                 </p>
               </div>
               
               <div className="space-y-4 max-w-2xl">
                 {currentRelease.changes.map((change, i) => (
                   <div key={i} className="flex gap-6 items-start border-b border-border-subtle pb-4 last:border-0 last:pb-0">
                     <span className="text-[10px] font-mono uppercase tracking-widest text-text-tertiary w-20 pt-1">
                       {change.type}
                     </span>
                     <span className="text-base text-text-secondary">
                       {change.description}
                     </span>
                   </div>
                 ))}
               </div>

               <div className="mt-16">
                  <Link href="/about/changelog" className="inline-flex items-center gap-2 text-sm font-semibold tracking-wide text-text-primary hover:text-accent transition-colors">
                     View Historical Logs <ArrowRight size={16} />
                  </Link>
               </div>
             </div>
          </section>

          {/* CTA Section */}
          <section className="text-center py-24 sm:py-32 border-t border-border-default">
             <h2 className="text-4xl sm:text-6xl font-serif tracking-tight mb-8 text-text-primary">
               Ready to begin?
             </h2>
             <p className="text-lg text-text-secondary mb-12 max-w-lg mx-auto">
               Initialize your local workspace today and take absolute control over your academic trajectory.
             </p>
             
             <div className="flex flex-col items-center gap-8">
                <Link 
                  href={loading ? "#" : (user ? "/dashboard" : "/signup")} 
                  className="btn-primary text-sm tracking-widest uppercase py-5 px-10 rounded-2xl flex items-center justify-center gap-3 transition-all duration-300"
                >
                  {loading ? "Checking Status..." : (user ? "Open Dashboard" : "Initialize Workspace")}
                  <ArrowRight className="w-5 h-5" />
                </Link>
                
                <Link href="/" className="btn-secondary inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-text-primary hover:text-accent transition-all">
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
