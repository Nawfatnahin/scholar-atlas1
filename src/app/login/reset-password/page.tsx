export const runtime = 'edge';
import { updatePassword } from "../actions";

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const resolvedParams = await searchParams;
  
  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-bg relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute rounded-full blur-[120px] opacity-10 w-[400px] h-[400px] bg-amber-600 -top-[120px] -right-[80px]" />
      </div>

      <div className="w-full max-w-[420px] glass-card p-8 rounded-[24px] relative z-10 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
        <h1 className="font-display text-[28px] font-bold text-ink tracking-tight mb-2">Reset password</h1>
        <p className="text-[14px] text-ink-3 mb-8">Enter your new password below</p>

        {resolvedParams?.error && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl mb-6 border border-red-200">
            {resolvedParams.error}
          </div>
        )}

        <form className="flex flex-col gap-4 text-left">
          <div>
            <label className="block text-[13px] font-bold text-ink-2 mb-1.5 ml-1">New Password</label>
            <input
              name="password"
              type="password"
              required
              className="w-full font-body text-[14px] px-4 py-3 rounded-xl border border-border-strong bg-white outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/10"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="block text-[13px] font-bold text-ink-2 mb-1.5 ml-1">Confirm New Password</label>
            <input
              name="confirmPassword"
              type="password"
              required
              className="w-full font-body text-[14px] px-4 py-3 rounded-xl border border-border-strong bg-white outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/10"
              placeholder="••••••••"
            />
          </div>

          <button formAction={updatePassword} className="w-full font-body text-[15px] font-semibold text-white bg-ink rounded-xl px-4 py-3.5 mt-2 transition-all hover:bg-ink/90 active:scale-[0.98]">
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
}
