export const runtime = 'edge';
import Link from "next/link";
import { forgotPassword } from "../actions";

export default async function ForgotPasswordPage({ searchParams }: { searchParams: Promise<{ error?: string, message?: string }> }) {
  const resolvedParams = await searchParams;
  
  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-bg relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute rounded-full blur-[120px] opacity-10 w-[400px] h-[400px] bg-amber-600 -top-[120px] -right-[80px]" />
      </div>

      <div className="w-full max-w-[420px] glass-card p-8 rounded-[24px] relative z-10 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Link href="/login" className="inline-flex items-center justify-center gap-2 mb-6 text-ink-3 hover:text-ink transition-colors">
          <svg viewBox="0 0 20 20" className="w-4 h-4 fill-current">
            <path d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" />
          </svg>
          <span className="text-[13px] font-bold">Back to login</span>
        </Link>
        <h1 className="font-display text-[28px] font-bold text-ink tracking-tight mb-2">Forgot password?</h1>
        <p className="text-[14px] text-ink-3 mb-8">Enter your email and we&apos;ll send you a reset link</p>

        {resolvedParams?.error && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl mb-6 border border-red-200">
            {resolvedParams.error}
          </div>
        )}
        
        {resolvedParams?.message && (
          <div className="bg-green-50 text-green-700 text-sm p-3 rounded-xl mb-6 border border-green-200">
            {resolvedParams.message}
          </div>
        )}

        <form className="flex flex-col gap-4 text-left">
          <div>
            <label className="block text-[13px] font-bold text-ink-2 mb-1.5 ml-1">Email</label>
            <input
              name="email"
              type="email"
              required
              className="w-full font-body text-[14px] px-4 py-3 rounded-xl border border-border-strong bg-white outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/10"
              placeholder="you@university.edu"
            />
          </div>

          <button formAction={forgotPassword} className="w-full font-body text-[15px] font-semibold text-white bg-ink rounded-xl px-4 py-3.5 mt-2 transition-all hover:bg-ink/90 active:scale-[0.98]">
            Send Reset Link
          </button>
        </form>
      </div>
    </div>
  );
}
