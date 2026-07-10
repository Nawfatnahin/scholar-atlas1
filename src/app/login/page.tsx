"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        const msg = typeof authError.message === 'string' && authError.message.length > 0
          ? authError.message
          : "Unable to connect to the authentication server. Please try again later.";
        setError(msg);
        setLoading(false);
      } else if (data?.session) {
        // Wait briefly to ensure cookies are written before navigating
        setTimeout(() => {
          router.replace("/dashboard");
          router.refresh();
        }, 100);
      } else {
        setError("Unexpected error: No session returned.");
        setLoading(false);
      }
    } catch (err: unknown) {
      const raw = (err as Error)?.message;
      const msg = typeof raw === 'string' && raw.length > 0 && raw !== '{}'
        ? raw
        : "Unable to connect to the authentication server. Please try again later.";
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-stone-50 dark:bg-[#0a0a0a] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute rounded-full blur-[120px] opacity-10 w-[400px] h-[400px] bg-amber-600 dark:bg-amber-500 -top-[120px] -right-[80px]" />
      </div>

      <div className="w-full max-w-[420px] bg-white dark:bg-[#111111] border border-stone-200 dark:border-white/10 shadow-xl p-8 rounded-[24px] relative z-10 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Link href="/" className="inline-flex items-center justify-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg bg-amber-800 flex items-center justify-center shadow-sm">
            <svg viewBox="0 0 20 20" className="w-4 h-4 fill-white">
              <path d="M10 2L3 7v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1V7l-7-5z" />
            </svg>
          </div>
        </Link>
        <h1 className="text-[28px] font-bold text-stone-900 dark:text-white tracking-tight mb-2">Welcome back</h1>
        <p className="text-[11px] text-amber-700 dark:text-amber-400 mb-8 font-bold bg-amber-50 dark:bg-amber-900/20 py-2 rounded-lg border border-amber-100 dark:border-amber-500/30">
          NOTE: Save the password in Google Password Manager or your browser.
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl mb-6 border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-4 text-left">
          <div>
            <label className="block text-[13px] font-bold text-stone-700 dark:text-stone-300 mb-1.5 ml-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full text-[14px] px-4 py-3 rounded-xl border border-stone-200 dark:border-white/10 bg-white dark:bg-[#1a1a1a] text-stone-900 dark:text-white outline-none transition-colors focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-1.5 ml-1">
              <label className="block text-[13px] font-bold text-stone-700 dark:text-stone-300">Password</label>
              <Link href="/login/forgot-password" hidden className="text-[12px] font-semibold text-amber-600 dark:text-amber-500 hover:underline">
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full text-[14px] px-4 py-3 rounded-xl border border-stone-200 dark:border-white/10 bg-white dark:bg-[#1a1a1a] text-stone-900 dark:text-white outline-none transition-colors focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10"
              placeholder="••••••••"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full text-[15px] font-semibold text-white dark:text-stone-900 bg-stone-900 dark:bg-white rounded-xl px-4 py-3.5 mt-2 transition-all hover:bg-stone-800 dark:hover:bg-stone-200 disabled:bg-stone-400 dark:disabled:bg-stone-700 active:scale-[0.98]"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-stone-100 dark:border-white/10">
          <p className="text-[13px] text-stone-500 dark:text-stone-400">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-bold text-stone-900 dark:text-white hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
