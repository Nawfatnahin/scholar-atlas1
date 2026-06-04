"use client";

import Link from "next/link";
import { format } from "date-fns";
import { CHANGELOG } from "@/lib/changelog";
import { ArrowLeft, Sparkles, Clock } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

export default function ChangelogPage() {
  return (
    <div className="about-section min-h-screen bg-bg font-body flex flex-col relative overflow-hidden text-ink">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/5 blur-[120px] rounded-full pointer-events-none" />
      
      <Navigation />
      
      <main className="flex-1 max-w-5xl mx-auto px-6 py-20 sm:py-32 relative z-10">
        {/* Header */}
        <section className="mb-16">
          <Link href="/about" className="inline-flex items-center gap-2 text-xs font-black text-ink-4 uppercase tracking-[0.2em] hover:text-accent transition-colors mb-12">
            <ArrowLeft size={14} /> Back to About
          </Link>
          
          <div className="flex flex-col sm:flex-row sm:items-baseline gap-4 mb-6">
            <h1 className="text-4xl sm:text-6xl font-black tracking-tighter uppercase leading-none">
              Version <span className="text-accent italic font-serif lowercase tracking-normal">History</span>
            </h1>
          </div>
          <p className="text-lg text-ink-3 leading-relaxed font-medium max-w-xl">
            A complete record of every deployment, feature addition, and bug fix since the inception of Scholar Atlas.
          </p>
        </section>

        {/* Timeline */}
        <div className="space-y-12">
          {CHANGELOG.map((entry, i) => (
            <section key={entry.version} className="relative pl-8 sm:pl-12 border-l border-border-strong group">
              {/* Timeline Dot */}
              <div className="absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-border-strong group-hover:bg-accent transition-colors border-4 border-bg box-content" />
              
              <div className="bg-white/40 backdrop-blur-xl p-8 rounded-[32px] border border-border-strong shadow-sm group-hover:border-accent/30 transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="text-2xl font-black tracking-tight">v{entry.version}</h2>
                      {i === 0 && (
                        <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest bg-accent text-white">Latest</span>
                      )}
                    </div>
                    <p className="text-sm font-bold text-ink-3 uppercase tracking-widest flex items-center gap-2">
                      <Clock size={12} />
                      {format(new Date(entry.date), "MMMM d, yyyy")}
                    </p>
                  </div>
                </div>

                <p className="text-base text-ink-2 font-bold italic font-serif mb-8">
                  &quot;{entry.summary}&quot;
                </p>

                <div className="space-y-4">
                  {entry.changes.map((change, idx) => (
                    <div key={idx} className="flex items-start gap-4">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter mt-1 shrink-0 ${
                        change.type === 'NEW' ? 'bg-green-100 text-green-700' :
                        change.type === 'IMPROVED' ? 'bg-blue-100 text-blue-700' :
                        change.type === 'FIXED' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {change.type}
                      </span>
                      <span className="text-sm text-ink-2 font-medium leading-relaxed">{change.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          ))}
        </div>

        {/* Footer Note */}
        <section className="mt-24 pt-16 border-t border-border-strong text-center">
          <p className="text-xs font-bold text-ink-4 uppercase tracking-[0.3em]">
            Looking for something specific? 
          </p>
          <p className="text-sm text-ink-3 mt-4 font-medium">
            Contact <span className="text-ink font-bold">Nawfat</span> for deep architectural inquiries.
          </p>
        </section>
      </main>

      <Footer />

      <style jsx>{`
        .font-serif {
          font-family: var(--font-playfair), serif;
        }
        .font-black {
          font-family: var(--font-manrope), sans-serif;
          font-weight: 900;
        }
      `}</style>
    </div>
  );
}
