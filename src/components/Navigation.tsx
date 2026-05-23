"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, LogOut, LayoutDashboard } from "lucide-react";
import { useSubscription } from "@/components/SubscriptionProvider";

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, loading, logout } = useSubscription();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 py-3 md:py-5 transition-all duration-300 ${
        isScrolled ? "nav-glass shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shadow-md transition-transform group-hover:scale-110">
            <svg viewBox="0 0 20 20" className="w-4 h-4 fill-white">
              <path d="M10 2L3 7v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1V7l-7-5z" />
            </svg>
          </div>
          <span className="text-xl font-bold text-ink">Scholar Atlas</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/#features" className="text-sm font-semibold text-ink-2 hover:text-accent transition-colors">Features</Link>
          <Link href="/#how" className="text-sm font-semibold text-ink-2 hover:text-accent transition-colors">How it works</Link>
          <Link href="/#pricing" className="text-sm font-semibold text-ink-2 hover:text-accent transition-colors">Pricing</Link>
          <Link href="/about" className="text-sm font-semibold text-ink-2 hover:text-accent transition-colors">About</Link>
          <Link href="/tools/pdf" className="text-sm font-semibold text-ink-2 hover:text-accent transition-colors">PDF Tools</Link>
        </div>
        
        <div className="hidden md:flex items-center gap-4">
          {!loading ? (
            user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-4 bg-white/50 border border-border-strong px-4 py-1.5 rounded-full backdrop-blur-sm shadow-sm">
                  <span className="text-xs font-bold truncate max-w-[120px] text-ink">{user.email}</span>
                  <Link href="/dashboard" className="p-2 text-accent hover:bg-accent/10 rounded-full transition-colors">
                    <LayoutDashboard size={18} />
                  </Link>
                  <button onClick={handleLogout} className="p-2 text-ink-3 hover:text-red-600 transition-colors">
                    <LogOut size={18} />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <Link href="/login" className="px-5 py-2 rounded-xl text-sm font-bold text-ink border border-border-strong bg-white/50 backdrop-blur-sm hover:bg-white hover:shadow-md transition-all active:scale-95">Sign in</Link>
              </>
            )
          ) : (
            <div className="w-32 h-9 bg-border-strong animate-pulse rounded-full border border-border-strong/50"></div>
          )}
        </div>

        <button className="md:hidden text-ink" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      
      {/* Mobile Menu */}
      <div 
        className={`md:hidden absolute top-full left-0 right-0 bg-bg backdrop-blur-2xl border-b border-border-strong p-5 flex flex-col gap-1 shadow-2xl no-tap-highlight safe-bottom transition-all duration-300 ease-in-out origin-top ${
          mobileMenuOpen 
            ? "opacity-100 scale-y-100 translate-y-0 visible" 
            : "opacity-0 scale-y-95 -translate-y-2 invisible"
        }`}
      >
        <Link href="/#features" onClick={() => setMobileMenuOpen(false)} className="text-base font-bold py-3.5 border-b border-border-strong/50 flex items-center justify-between text-ink hover:text-accent transition-colors">
          <span>Features</span>
          <span className="text-ink-4">→</span>
        </Link>
        <Link href="/#how" onClick={() => setMobileMenuOpen(false)} className="text-base font-bold py-3.5 border-b border-border-strong/50 flex items-center justify-between text-ink hover:text-accent transition-colors">
          <span>How it works</span>
          <span className="text-ink-4">→</span>
        </Link>
        <Link href="/#pricing" onClick={() => setMobileMenuOpen(false)} className="text-base font-bold py-3.5 border-b border-border-strong/50 flex items-center justify-between text-ink hover:text-accent transition-colors">
          <span>Pricing</span>
          <span className="text-ink-4">→</span>
        </Link>
        <Link href="/tools/pdf" onClick={() => setMobileMenuOpen(false)} className="text-base font-bold py-3.5 border-b border-border-strong/50 flex items-center justify-between text-ink hover:text-accent transition-colors">
          <span>PDF Tools</span>
          <span className="text-ink-4">→</span>
        </Link>
        
        <div className="mt-4 flex flex-col gap-2.5">
          {user ? (
            <>
              <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="btn-primary flex items-center justify-center gap-3 py-3.5 shadow-lg shadow-accent/20">
                <LayoutDashboard size={18} />
                <span className="text-sm">Dashboard</span>
              </Link>
              <button onClick={handleLogout} className="flex items-center justify-center gap-2 py-3 font-bold text-red-600 active:scale-95 transition-all text-[11px] uppercase tracking-widest">
                <LogOut size={16} />
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="btn-primary text-center py-3.5 text-sm shadow-lg shadow-accent/10">Sign in</Link>
              <Link href="/signup" onClick={() => setMobileMenuOpen(false)} className="text-center py-3 font-bold text-ink-2 hover:text-ink transition-colors text-[11px] uppercase tracking-widest">Create Account</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
