"use client";

import { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  Mail, 
  Plus, 
  Crown, 
  Edit3, 
  Check, 
  X, 
  ArrowLeft,
  Users,
  Search,
  Activity,
  Trash2,
  Calendar,
  Monitor,
  Database,
  SearchX,
  Zap,
  Cpu,
  Globe,
  Lock,
  Radar
} from "lucide-react";
import { toggleProStatus, deleteSubscription } from "./actions";
import { toast } from "sonner";
import Link from "next/link";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Subscription {
  id: string;
  email: string;
  plan: string;
  premium_until?: string | null;
  created_at: string;
}

export default function AdminPanel({ initialSubscriptions, ownerEmail }: { initialSubscriptions: Subscription[], ownerEmail: string }) {
  const [subscriptions, setSubscriptions] = useState(initialSubscriptions || []);
  const [newEmail, setNewEmail] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [adminName, setAdminName] = useState(ownerEmail.split('@')[0]);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(adminName);
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Dynamic calculations
  const totalGmails = (subscriptions || []).length;
  const isActuallyPro = (s: Subscription) => s.plan === 'pro' && (!s.premium_until || new Date(s.premium_until) > new Date());
  const premiumCount = (subscriptions || []).filter(isActuallyPro).length;
  
  // Filtering
  const filteredSubscriptions = subscriptions
    .filter(s => s.email !== ownerEmail)
    .filter(s => s.email.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // Recent Logins (Simulated/Calculated from creation for past 3 days)
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
  
  const recentLogins = [...(subscriptions || [])]
    .filter(s => new Date(s.created_at) > threeDaysAgo)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 8);

  const handleTogglePro = async (email: string, currentPlan: string) => {
    const isPro = currentPlan === 'pro';
    try {
      let durationMonths: number | null = null;
      if (!isPro) {
        const val = window.prompt("Enter duration in months (leave empty for unlimited):", "1");
        if (val === null) return;
        if (val.trim() !== "") {
          durationMonths = parseInt(val, 10);
          if (isNaN(durationMonths) || durationMonths <= 0) {
            toast.error("Invalid duration");
            return;
          }
        }
      }

      await toggleProStatus(email, !isPro, durationMonths);

      let premium_until = null;
      if (!isPro && durationMonths) {
        const d = new Date();
        d.setMonth(d.getMonth() + durationMonths);
        premium_until = d.toISOString();
      }

      setSubscriptions(subscriptions.map(s => s.email === email ? { ...s, plan: !isPro ? 'pro' : 'free', premium_until } : s));
      toast.success(`${email} logic updated.`);
    } catch {
      toast.error("Failed to update node.");
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;
    try {
      const val = window.prompt("Enter duration in months (leave empty for unlimited):", "1");
      if (val === null) return;
      
      let durationMonths: number | null = null;
      if (val.trim() !== "") {
        durationMonths = parseInt(val, 10);
        if (isNaN(durationMonths) || durationMonths <= 0) {
          toast.error("Invalid duration");
          return;
        }
      }

      await toggleProStatus(newEmail, true, durationMonths);
      
      let premium_until = null;
      if (durationMonths) {
        const d = new Date();
        d.setMonth(d.getMonth() + durationMonths);
        premium_until = d.toISOString();
      }

      const newUser = { id: Math.random().toString(), email: newEmail.toLowerCase(), plan: 'pro', premium_until, created_at: new Date().toISOString() };
      setSubscriptions(prev => [newUser, ...prev.filter(s => s.email !== newEmail.toLowerCase())]);
      
      setNewEmail("");
      setIsAdding(false);
      toast.success(`${newEmail} authorized.`);
    } catch {
      toast.error("Authorization failed.");
    }
  };

  const handleDeleteUser = async (email: string) => {
    if (!window.confirm(`Decommission node ${email}?`)) return;
    try {
      const result = await deleteSubscription(email);
      if (result && !result.success) {
        toast.error(`Error: ${result.error}`);
        return;
      }
      setSubscriptions(subscriptions.filter(s => s.email !== email));
      toast.success(`${email} offline.`);
    } catch (err: unknown) {
      toast.error(`Critical error.`);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#020617] text-cyan-400 font-mono selection:bg-cyan-500/30 selection:text-white overflow-x-hidden">
      
      {/* JARVIS Grid Overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0" style={{ 
        backgroundImage: `linear-gradient(#22d3ee 1px, transparent 1px), linear-gradient(90deg, #22d3ee 1px, transparent 1px)`,
        backgroundSize: '40px 40px'
      }} />

      {/* Holographic Header */}
      <header className="h-28 border-b border-cyan-500/20 sticky top-0 z-50 px-8 flex items-center justify-between bg-black/40 backdrop-blur-3xl shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-10">
          <div className="relative group">
            <div className="absolute -inset-4 bg-cyan-500/20 blur-2xl rounded-full animate-pulse group-hover:bg-cyan-500/40 transition-all" />
            <Link href="/dashboard" className="w-16 h-16 bg-cyan-500/10 border border-cyan-500/30 rounded-full flex items-center justify-center relative overflow-hidden group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(34,211,238,0.2)]">
              <Zap className="text-cyan-400 w-8 h-8 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
              <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 to-transparent animate-spin-slow opacity-30" />
            </Link>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">
                Central <span className="text-cyan-400">Intelligence</span>
              </h1>
              <span className="px-2 py-0.5 bg-cyan-500/10 text-cyan-400 text-[10px] font-black uppercase rounded border border-cyan-500/20 animate-pulse">Live Uplink</span>
            </div>
            <div className="flex items-center gap-6 text-[10px] font-bold uppercase tracking-[0.3em] text-cyan-400/40">
              <span className="flex items-center gap-2"><Globe className="w-3 h-3" /> Satellite Sync 02.4s</span>
              <span className="flex items-center gap-2"><Lock className="w-3 h-3" /> AES-256 Active</span>
            </div>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-12">
          <div className="text-right">
            <p className="text-[10px] text-cyan-500/40 font-black uppercase tracking-widest mb-1">System Administrator</p>
            <div className="flex items-center justify-end gap-3 group cursor-pointer">
              {isEditingName ? (
                 <div className="flex items-center gap-2">
                    <input 
                      value={tempName} 
                      onChange={(e) => setTempName(e.target.value)}
                      className="bg-cyan-500/10 border-b border-cyan-500 outline-none px-2 text-white text-sm"
                      autoFocus
                    />
                    <button onClick={() => { setAdminName(tempName); setIsEditingName(false); }} className="text-green-400"><Check className="w-4 h-4"/></button>
                 </div>
              ) : (
                <>
                  <p className="text-lg font-black text-white italic group-hover:text-cyan-400 transition-colors uppercase" onClick={() => setIsEditingName(true)}>{adminName}</p>
                  <div className="w-12 h-12 bg-cyan-500/10 border border-cyan-500/20 rounded-xl flex items-center justify-center text-cyan-400 font-black text-xl shadow-inner group-hover:border-cyan-400/50 transition-all">
                    {adminName[0].toUpperCase()}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="p-8 lg:p-16 max-w-[1800px] mx-auto w-full space-y-20 relative z-10">
        
        {/* Holographic HUD Stats */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
           {[
             { label: 'Network Nodes', val: totalGmails, icon: Users, color: 'cyan', pct: '+4.2%' },
             { label: 'Elite Threads', val: premiumCount, icon: Crown, color: 'amber', pct: '+12.8%' },
             { label: 'System Uptime', val: '99.9%', icon: Activity, color: 'green', pct: 'Stable' },
             { label: 'Security Level', val: 'Alpha', icon: ShieldCheck, color: 'red', pct: 'High' }
           ].map((stat, i) => (
             <div key={i} className="relative group overflow-hidden bg-white/[0.02] border border-white/10 rounded-[30px] p-8 hover:border-cyan-500/40 transition-all duration-500">
               <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-40 transition-opacity">
                 <stat.icon className="w-12 h-12" />
               </div>
               <div className="relative space-y-6">
                 <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">{stat.label}</p>
                 <div className="flex items-baseline gap-4">
                   <h3 className="text-5xl font-black text-white tracking-tighter">{stat.val}</h3>
                   <span className="text-[10px] font-bold text-cyan-400/60 uppercase">{stat.pct}</span>
                 </div>
                 <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-500/40 w-2/3 animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
                 </div>
               </div>
             </div>
           ))}
        </section>

        {/* 3D Command Console */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
           
           {/* Jarvis User Login Matrix */}
           <div className="xl:col-span-4 space-y-8">
              <div className="bg-white/[0.01] border border-cyan-500/10 rounded-[40px] p-10 relative overflow-hidden group hover:border-cyan-500/30 transition-all">
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-cyan-500/5 blur-[80px] rounded-full" />
                
                <div className="flex items-center justify-between mb-12">
                   <div className="space-y-1">
                      <h3 className="text-xl font-black text-white uppercase italic flex items-center gap-3">
                        <Radar className="w-6 h-6 text-cyan-400 animate-spin-slow" />
                        User Login Matrix
                      </h3>
                      <p className="text-[10px] text-cyan-400/40 font-bold uppercase tracking-widest">Temporal Log: 72 Hours</p>
                   </div>
                </div>

                <div className="space-y-6 relative max-h-[600px] overflow-y-auto pr-4 custom-scrollbar">
                   {recentLogins.map((user, idx) => (
                     <div key={user.id} className="flex gap-6 items-center group/log py-4 border-b border-white/[0.03] last:border-0 hover:bg-white/[0.02] transition-colors rounded-xl px-4">
                        <div className="w-12 h-12 rounded-xl bg-cyan-500/5 border border-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold text-lg group-hover/log:scale-110 group-hover/log:border-cyan-400 transition-all">
                           {user.email[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                           <p className="text-sm font-black text-white/80 truncate group-hover/log:text-cyan-400 transition-colors">{user.email}</p>
                           <div className="flex items-center gap-3 mt-1 text-[10px] font-bold text-cyan-500/40 uppercase tracking-widest">
                              <span className="flex items-center gap-1.5"><Monitor className="w-3 h-3" /> Port 8080</span>
                              <span>•</span>
                              <span>{new Date(user.created_at).toLocaleDateString()}</span>
                           </div>
                        </div>
                        <span className="text-[10px] font-black text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded border border-cyan-500/20">
                          {new Date(user.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                     </div>
                   ))}

                   {recentLogins.length === 0 && (
                     <div className="py-20 text-center space-y-4 opacity-20">
                        <SearchX className="w-12 h-12 mx-auto" />
                        <p className="text-xs uppercase tracking-[0.2em]">No logs recorded</p>
                     </div>
                   )}
                </div>

                <div className="mt-12 p-6 bg-cyan-500/5 border border-cyan-500/10 rounded-2xl flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                   <div className="flex items-center gap-3">
                      <Cpu className="w-4 h-4 text-cyan-500" />
                      Neural Processor Active
                   </div>
                   <span className="text-cyan-500 animate-pulse">Scanning...</span>
                </div>
              </div>
           </div>

           {/* Core Database Matrix */}
           <div className="xl:col-span-8 space-y-10">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-8">
                 <div className="space-y-3">
                    <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase flex items-center gap-5">
                       <Database className="w-10 h-10 text-cyan-400" />
                       Core Data <span className="text-cyan-400">Matrix</span>
                    </h2>
                    <p className="text-cyan-400/40 font-bold uppercase tracking-[0.2em] text-[10px]">Managing Node Permissions and Encryption Keys</p>
                 </div>

                 <div className="relative w-full sm:w-80 group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-cyan-500/50 w-5 h-5 group-hover:text-cyan-400 transition-colors" />
                    <input 
                       value={searchQuery}
                       onChange={(e) => setSearchQuery(e.target.value)}
                       placeholder="Filter Matrix..."
                       className="w-full bg-cyan-500/5 border border-cyan-500/20 rounded-2xl py-4 pl-14 pr-6 text-sm outline-none focus:border-cyan-500/50 focus:bg-cyan-500/10 transition-all text-white font-bold"
                    />
                 </div>
              </div>

              {/* Advanced 3D Table */}
              <div className="relative overflow-hidden bg-white/[0.01] border border-cyan-500/10 rounded-[40px] shadow-2xl">
                 <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/[0.02] to-transparent pointer-events-none" />
                 
                 <div className="overflow-x-auto relative z-10">
                    <table className="w-full text-left border-collapse">
                       <thead>
                          <tr className="bg-cyan-500/[0.03] border-b border-cyan-500/10">
                             <th className="px-10 py-8 text-[11px] font-black uppercase tracking-[0.3em] text-cyan-400/60">Node Identity</th>
                             <th className="px-10 py-8 text-[11px] font-black uppercase tracking-[0.3em] text-cyan-400/60">Tier Protocol</th>
                             <th className="px-10 py-8 text-[11px] font-black uppercase tracking-[0.3em] text-cyan-400/60">Status</th>
                             <th className="px-10 py-8 text-[11px] font-black uppercase tracking-[0.3em] text-cyan-400/60 text-right">Overrides</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-white/[0.03]">
                          {filteredSubscriptions.map((s, idx) => (
                            <tr key={s.id} className="group/row hover:bg-cyan-500/[0.03] transition-all">
                               <td className="px-10 py-8">
                                  <div className="flex items-center gap-6">
                                     <div className="w-14 h-14 rounded-2xl bg-cyan-500/5 border border-cyan-500/20 flex items-center justify-center font-black text-cyan-400 shadow-lg group-hover/row:scale-110 group-hover/row:border-cyan-400 transition-all">
                                        {s.email[0].toUpperCase()}
                                     </div>
                                     <div className="space-y-1">
                                        <p className="text-lg font-black text-white group-hover/row:text-cyan-400 transition-colors truncate max-w-[200px]">{s.email}</p>
                                        <div className="flex items-center gap-2">
                                           <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse" />
                                           <span className="text-[10px] font-black text-cyan-500/30 uppercase tracking-[0.2em]">Verified Node</span>
                                        </div>
                                     </div>
                                  </div>
                               </td>
                               <td className="px-10 py-8">
                                  <div className={cn(
                                    "inline-flex items-center gap-3 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                                    isActuallyPro(s) 
                                      ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)]" 
                                      : "bg-white/[0.03] border-white/10 text-white/20"
                                  )}>
                                     {isActuallyPro(s) ? <Zap className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
                                     {isActuallyPro(s) ? 'Elite Access' : 'Trial Protocol'}
                                  </div>
                               </td>
                               <td className="px-10 py-8">
                                  <div className="space-y-2">
                                     <div className="flex items-center gap-3">
                                        <div className="h-1.5 w-24 bg-white/5 rounded-full overflow-hidden">
                                           <div className={cn("h-full transition-all duration-1000", isActuallyPro(s) ? "bg-cyan-500 w-full shadow-[0_0_8px_#22d3ee]" : "bg-white/20 w-1/4")} />
                                        </div>
                                        <span className="text-[10px] font-black text-white/40">{isActuallyPro(s) ? '100%' : '25%'}</span>
                                     </div>
                                     <p className="text-[9px] font-bold text-cyan-500/30 uppercase tracking-widest">Initialization: {new Date(s.created_at).toLocaleDateString()}</p>
                                  </div>
                               </td>
                               <td className="px-10 py-8 text-right">
                                  <div className="flex items-center justify-end gap-5 opacity-0 group-hover/row:opacity-100 transition-all translate-x-4 group-hover/row:translate-x-0">
                                     <button 
                                        onClick={() => handleTogglePro(s.email, s.plan)}
                                        className={cn(
                                          "px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg",
                                          s.plan === 'pro'
                                            ? "bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20"
                                            : "bg-cyan-500 text-black hover:bg-white hover:text-black"
                                        )}
                                     >
                                        {s.plan === 'pro' ? 'Revoke Access' : 'Upgrade Node'}
                                     </button>
                                     <button 
                                        onClick={() => handleDeleteUser(s.email)}
                                        className="p-3 text-white/20 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                                     >
                                        <Trash2 className="w-6 h-6" />
                                     </button>
                                  </div>
                               </td>
                            </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>

                 {/* Dynamic Table Footer */}
                 <div className="px-10 py-10 bg-white/[0.02] border-t border-white/[0.05] flex flex-col sm:flex-row items-center justify-between gap-10">
                    <div className="flex items-center gap-8">
                       <div className="flex -space-x-4">
                          {filteredSubscriptions.slice(0, 5).map((s, i) => (
                            <div key={i} className="w-12 h-12 rounded-full border-4 border-[#020617] bg-cyan-500/10 flex items-center justify-center text-cyan-400 font-black text-xs shadow-xl">
                               {s.email[0].toUpperCase()}
                            </div>
                          ))}
                       </div>
                       <div className="space-y-1">
                          <p className="text-[11px] font-black text-white/80 uppercase tracking-[0.25em]">Node Population</p>
                          <p className="text-[10px] font-bold text-cyan-400/40 uppercase tracking-widest">{filteredSubscriptions.length} Units Online</p>
                       </div>
                    </div>

                    <div className="flex gap-4">
                       <button className="p-4 border border-white/5 rounded-2xl text-white/20 hover:text-cyan-400 hover:border-cyan-400/50 transition-all"><ArrowLeft className="w-5 h-5" /></button>
                       <button className="p-4 border border-white/5 rounded-2xl text-white/20 hover:text-cyan-400 hover:border-cyan-400/50 transition-all flex items-center gap-3 group">
                          <span className="text-[10px] font-black uppercase tracking-widest">Next Layer</span>
                          <X className="w-4 h-4 rotate-45 group-hover:rotate-0 transition-transform" />
                       </button>
                    </div>
                 </div>
              </div>
           </div>
        </div>

      </main>

      {/* Holographic HUD Corners */}
      <div className="fixed bottom-10 left-10 pointer-events-none opacity-20">
         <div className="w-32 h-32 border-l-2 border-b-2 border-cyan-500/50 rounded-bl-3xl" />
      </div>
      <div className="fixed top-10 right-10 pointer-events-none opacity-20">
         <div className="w-32 h-32 border-r-2 border-t-2 border-cyan-500/50 rounded-tr-3xl" />
      </div>

      {/* Footer System Status */}
      <footer className="py-12 px-10 border-t border-white/[0.03] mt-20 flex flex-col sm:flex-row items-center justify-between gap-8 opacity-40 hover:opacity-100 transition-opacity">
         <div className="flex items-center gap-6">
            <div className="w-10 h-10 bg-cyan-500/10 rounded-full flex items-center justify-center animate-spin-slow">
               <Cpu className="w-5 h-5 text-cyan-400" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white">Jarvis v4.0.2 / Terminal / Root</p>
         </div>
         <div className="flex items-center gap-10">
            <div className="flex items-center gap-3">
               <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
               <span className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400">Core Stable</span>
            </div>
            <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Stark Industries Architecture</p>
         </div>
      </footer>

      {/* Styles for custom scrollbar and animations */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(34, 211, 238, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(34, 211, 238, 0.4);
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 12s linear infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .animate-shimmer {
          background: linear-gradient(90deg, transparent, rgba(34, 211, 238, 0.1), transparent);
          background-size: 200% 100%;
          animation: shimmer 3s infinite linear;
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
