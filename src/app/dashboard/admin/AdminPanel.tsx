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
  Radar,
  ArrowRight,
  Settings,
  Terminal,
  MessageSquare,
  Sparkles
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

  // Recent Logins
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
      toast.success(`${email} matrix updated.`);
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
    <div className="jarvis-theme min-h-screen overflow-x-hidden relative">
      
      {/* 3D Space Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
         <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
      </div>

      {/* Holographic Sticky Header */}
      <header className="h-28 border-b border-white/5 sticky top-0 z-50 px-8 flex items-center justify-between bg-black/60 backdrop-blur-2xl">
        <div className="flex items-center gap-12">
          <div className="relative group perspective-1000">
            <Link href="/dashboard" className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center transform group-hover:-translate-x-2 transition-all duration-500 hover:border-jarvis-accent/50 shadow-[0_0_30px_rgba(0,0,0,0.5)]" title="Back to Dashboard">
              <ArrowLeft className="text-jarvis-accent w-8 h-8 drop-shadow-[0_0:10px_rgba(34,211,238,0.8)]" />
            </Link>
            <div className="absolute -inset-2 bg-jarvis-accent/10 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          
          <div className="space-y-1.5">
            <h1 className="text-3xl font-semibold tracking-widest text-white  flex items-center gap-4 font-sans">
              <span className="bg-jarvis-accent text-black px-3 py-1 rounded-lg text-xl shadow-[0_0_15px_rgba(34,211,238,0.4)] animate-pulse">ADMIN</span>
              <span className="text-jarvis-accent">OS</span>
              <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_#22c55e]" />
            </h1>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-12">
           <div className="relative w-96 group">
             <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 w-4 h-4 group-focus-within:text-jarvis-accent transition-colors" />
             <input 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               placeholder="Access user registry..."
               className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-14 pr-6 text-sm font-semibold tracking-normal outline-none focus:border-jarvis-accent/30 focus:bg-white/[0.08] transition-all text-white placeholder:text-white/10 font-sans"
             />
           </div>

           <div className="h-10 w-[1px] bg-white/10" />

           <div className="flex items-center gap-5 font-sans">
              <div className="text-right">
                <p className="text-xs text-white/20 font-semibold  tracking-normal mb-1">Authenticated</p>
                <button onClick={() => setIsEditingName(true)} className="text-lg font-semibold text-white hover:text-jarvis-accent transition-colors  tracking-tight flex items-center gap-3">
                  {adminName}
                  <Settings className="w-4 h-4 text-white/20" />
                </button>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-white/10 to-transparent border border-white/20 rounded-2xl flex items-center justify-center text-white font-semibold text-xl shadow-2xl overflow-hidden relative group/avatar">
                {adminName[0].toUpperCase()}
                <div className="absolute inset-0 bg-jarvis-accent/10 opacity-0 group-hover/avatar:opacity-100 transition-opacity" />
              </div>
           </div>
        </div>
      </header>

      <main className="p-8 lg:p-16 max-w-[1800px] mx-auto w-full space-y-24 relative z-10 font-sans">
        
        {/* Intelligence Briefing Section */}
        <section className="relative group">
           <div className="absolute -inset-1 bg-gradient-to-r from-jarvis-accent/20 to-purple-500/20 blur-2xl rounded-[40px] opacity-30 group-hover:opacity-60 transition-opacity" />
           <div className="jarvis-box !p-10 backdrop-blur-3xl overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                 <MessageSquare className="w-40 h-40 text-jarvis-accent" />
              </div>
              <div className="relative space-y-8 max-w-4xl">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-jarvis-accent/10 border border-jarvis-accent/30 rounded-full flex items-center justify-center">
                       <Sparkles className="w-6 h-6 text-jarvis-accent animate-pulse" />
                    </div>
                    <h2 className="text-base font-semibold  tracking-normal text-jarvis-accent shadow-[0_0_10px_rgba(34,211,238,0.3)]">BuddyOS Intelligence</h2>
                 </div>
                 <div className="space-y-4">
                    <p className="text-3xl sm:text-4xl font-semibold text-white leading-tight">
                       Sir, all systems are at your disposal. The ecosystem is currently hosting <span className="text-jarvis-accent">{totalGmails} units</span> with <span className="text-amber-500">{premiumCount} elite threads</span> active.
                    </p>
                    <p className="text-white/40 font-medium text-lg leading-relaxed border-l-2 border-jarvis-accent/30 pl-6">
                       Network latency is within nominal bounds. I have prepared the latest user registries and session logs for your review. How shall we proceed with the matrix today, Sir?
                    </p>
                 </div>
                 <div className="flex items-center gap-8 pt-4">
                    <div className="flex items-center gap-3">
                       <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_#22c55e]" />
                       <span className="text-sm font-semibold  tracking-normal text-white/40">Voice Analysis: Active</span>
                    </div>
                    <div className="flex items-center gap-3">
                       <div className="w-2 h-2 bg-jarvis-accent rounded-full animate-pulse shadow-[0_0_8px_#22d3ee]" />
                       <span className="text-sm font-semibold  tracking-normal text-white/40">Neural Sync: 100%</span>
                    </div>
                 </div>
              </div>
           </div>
        </section>

        {/* Advanced 3D Stats Pedestals */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
           {[
             { label: 'Network Population', val: totalGmails, icon: Users, accent: 'cyan' },
             { label: 'Elite Sub-Nodes', val: premiumCount, icon: Crown, accent: 'amber' },
             { label: 'Uptime Matrix', val: '99.99%', icon: Globe, accent: 'blue' },
             { label: 'Security Shield', val: 'MAX', icon: ShieldCheck, accent: 'green' }
           ].map((stat, i) => (
             <div key={i} className="group relative">
                <div className="absolute inset-0 bg-jarvis-accent/5 blur-[40px] rounded-[40px] group-hover:bg-jarvis-accent/10 transition-all duration-700" />
                
                <div className="jarvis-box !p-10 backdrop-blur-3xl transform transition-all duration-500 hover:-translate-y-4 hover:rotate-2 hover:shadow-[0_40px_80px_rgba(0,0,0,0.6)] group-hover:border-jarvis-accent/30">
                   <div className="flex justify-between items-start mb-8">
                      <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 group-hover:border-jarvis-accent/40 transition-all">
                        <stat.icon className="w-7 h-7 text-white/60 group-hover:text-jarvis-accent transition-colors" />
                      </div>
                      <div className="text-sm font-semibold text-jarvis-accent/40  tracking-normal">{stat.accent}.lvl1</div>
                   </div>
                   <div className="space-y-2">
                      <h4 className="text-sm font-semibold  tracking-normal text-white/30">{stat.label}</h4>
                      <p className="text-6xl font-semibold text-white tracking-tighter group-hover:text-jarvis-accent transition-colors font-sans">{stat.val}</p>
                   </div>
                   <div className="mt-8 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-jarvis-accent/20 w-3/4 animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
                   </div>
                </div>
             </div>
           ))}
        </section>

        {/* 3D Dual-Pane Interface */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-16">
           
           {/* Recessed Login Matrix */}
           <div className="xl:col-span-4 space-y-10">
              <div className="relative group">
                 <div className="absolute inset-x-4 -bottom-4 h-full bg-jarvis-accent/5 blur-3xl rounded-[50px] pointer-events-none" />
                 
                 <div className="jarvis-box !p-10 !rounded-[50px] backdrop-blur-md shadow-2xl group-hover:border-jarvis-accent/20 transition-all">
                    <div className="flex items-center justify-between mb-12">
                       <div className="space-y-1.5">
                          <h3 className="text-xl font-semibold text-white  italic flex items-center gap-3 tracking-tighter font-sans">
                            <Radar className="w-6 h-6 text-jarvis-accent" />
                            Session<span className="text-jarvis-accent">_History</span>
                          </h3>
                          <p className="text-sm text-white/20 font-semibold  tracking-normal">Temporal Log / 72.hrs</p>
                       </div>
                    </div>

                    <div className="space-y-5 max-h-[600px] overflow-y-auto pr-4 custom-scrollbar">
                       {recentLogins.map((user, idx) => (
                         <div key={user.id} className="group/log relative p-5 bg-white/[0.02] border border-white/5 rounded-[25px] hover:bg-white/5 hover:border-jarvis-accent/20 transition-all duration-300">
                            <div className="flex items-center gap-5">
                               <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center font-semibold text-white/20 group-hover/log:text-jarvis-accent transition-colors">
                                  {user.email[0].toUpperCase()}
                               </div>
                               <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-white tracking-tight truncate font-sans">{user.email}</p>
                                  <div className="flex items-center gap-3 mt-1.5 text-xs font-semibold text-white/20  tracking-widest font-sans">
                                     <span className="text-jarvis-accent/40">Initial: {new Date(user.created_at).toLocaleDateString()}</span>
                                  </div>
                               </div>
                               <div className="text-right">
                                  <p className="text-sm font-semibold text-jarvis-accent mb-0.5 font-sans">{new Date(user.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                  <span className="text-xs font-bold text-white/10 font-sans">GMT+6</span>
                               </div>
                            </div>
                         </div>
                       ))}
                    </div>

                    <div className="mt-12 pt-8 border-t border-white/5 flex items-center justify-between">
                       <div className="flex items-center gap-4">
                          <div className="w-3 h-3 bg-jarvis-accent rounded-full animate-pulse shadow-[0_0_10px_#22d3ee]" />
                          <span className="text-sm font-semibold text-white/40  tracking-normal">Neural Engine Running</span>
                       </div>
                       <button className="text-sm font-semibold text-jarvis-accent hover:text-white transition-colors  tracking-widest">Refine Matrix</button>
                    </div>
                 </div>
              </div>
           </div>

           {/* Elevated Database Console */}
           <div className="xl:col-span-8 space-y-12">
              <div className="flex flex-col md:flex-row justify-between items-end gap-10">
                 <div className="space-y-4">
                    <h2 className="text-5xl font-semibold text-white tracking-tighter  flex items-center gap-6 font-sans">
                       <Users className="w-12 h-12 text-jarvis-accent" />
                       User<span className="text-jarvis-accent">_Types</span>
                    </h2>
                    <p className="text-white/20 font-semibold  tracking-normal text-sm">Strategic Management of Encrypted Student Nodes</p>
                 </div>
                 
                 <div className="relative group">
                    <div className="absolute inset-0 bg-jarvis-accent/20 blur-2xl rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    <button 
                       onClick={() => setIsAdding(!isAdding)}
                       className="relative bg-white border border-white/10 px-10 py-5 rounded-[22px] flex items-center gap-4 group-hover:bg-jarvis-accent group-hover:border-jarvis-accent transition-all duration-500 shadow-2xl"
                    >
                       <Plus className="w-5 h-5 text-black group-hover:rotate-90 transition-transform" />
                       <span className="text-black font-semibold text-base  tracking-widest">Provision New Node</span>
                    </button>
                 </div>
              </div>

              {isAdding && (
                 <div className="relative animate-in slide-in-from-top-10 duration-700">
                    <div className="absolute inset-0 bg-jarvis-accent/10 blur-3xl rounded-[40px] pointer-events-none" />
                    <form onSubmit={handleAddUser} className="relative bg-white/[0.03] border border-jarvis-accent/20 p-10 rounded-[40px] backdrop-blur-2xl flex flex-col md:flex-row gap-6 shadow-2xl">
                       <div className="flex-1 relative">
                          <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-jarvis-accent/40 w-5 h-5" />
                          <input 
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            placeholder="Input node identity (email)..."
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-16 pr-8 text-sm font-semibold text-white tracking-normal outline-none focus:border-jarvis-accent focus:bg-white/10 transition-all font-sans"
                            required
                          />
                       </div>
                       <button type="submit" className="bg-jarvis-accent text-black px-12 py-5 rounded-2xl font-semibold text-base  tracking-widest hover:bg-white transition-all shadow-xl shadow-jarvis-accent/20 active:scale-95">
                          Authorize Status
                       </button>
                    </form>
                 </div>
              )}

              {/* 3D Interactive Table Box */}
              <div className="relative group/matrix">
                 <div className="absolute -inset-4 bg-jarvis-accent/5 blur-[80px] rounded-[50px] pointer-events-none" />
                 
                 <div className="jarvis-box !p-0 !rounded-[50px] overflow-hidden backdrop-blur-3xl shadow-2xl group-hover/matrix:border-white/10 transition-all duration-700">
                    <div className="overflow-x-auto">
                       <table className="w-full text-left border-collapse">
                          <thead>
                             <tr className="bg-white/[0.08] border-b border-white/10">
                                <th className="px-12 py-10 text-sm font-semibold  tracking-normal text-jarvis-accent border-r border-white/5">
                                   <div className="flex items-center gap-2">
                                      <div className="w-2 h-2 bg-jarvis-accent rounded-full shadow-[0_0_8px_#22d3ee]" />
                                      Identity ID
                                   </div>
                                </th>
                                <th className="px-12 py-10 text-sm font-semibold  tracking-normal text-jarvis-accent border-r border-white/5">
                                   <div className="flex items-center gap-2">
                                      <div className="w-2 h-2 bg-jarvis-accent rounded-full shadow-[0_0_8px_#22d3ee]" />
                                      Access Key
                                   </div>
                                </th>
                                <th className="px-12 py-10 text-sm font-semibold  tracking-normal text-jarvis-accent border-r border-white/5">
                                   <div className="flex items-center gap-2">
                                      <div className="w-2 h-2 bg-jarvis-accent rounded-full shadow-[0_0_8px_#22d3ee]" />
                                      Sync Status
                                   </div>
                                </th>
                                <th className="px-12 py-10 text-sm font-semibold  tracking-normal text-jarvis-accent text-right">
                                   <div className="flex items-center justify-end gap-2">
                                      <div className="w-2 h-2 bg-jarvis-accent rounded-full shadow-[0_0_8px_#22d3ee]" />
                                      Overrides
                                   </div>
                                </th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-white/[0.04] font-sans">
                             {filteredSubscriptions.map((s, idx) => (
                               <tr key={s.id} className="group/row hover:bg-white/[0.03] transition-all">
                                  <td className="px-12 py-10">
                                     <div className="flex items-center gap-6">
                                        <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center font-semibold text-white/20 group-hover/row:scale-110 group-hover/row:border-jarvis-accent/40 group-hover/row:text-jarvis-accent transition-all font-sans">
                                           {s.email[0].toUpperCase()}
                                        </div>
                                        <div className="space-y-1.5">
                                           <p className="text-lg font-semibold text-white tracking-tight group-hover/row:text-jarvis-accent transition-colors font-sans">{s.email}</p>
                                           <span className="text-xs font-semibold text-white/10  tracking-widest flex items-center gap-2 font-sans">
                                              <div className="w-1.5 h-1.5 bg-green-500 rounded-full" /> Node_Online
                                           </span>
                                        </div>
                                     </div>
                                  </td>
                                  <td className="px-12 py-10">
                                     <div className={cn(
                                       "inline-flex items-center gap-3 px-6 py-3 rounded-2xl text-sm font-semibold  tracking-normal border shadow-2xl transition-all font-sans",
                                       isActuallyPro(s) 
                                         ? "bg-jarvis-accent/10 border-jarvis-accent/30 text-jarvis-accent shadow-jarvis-accent/10" 
                                         : "bg-white/5 border-white/10 text-white/20"
                                     )}>
                                        {isActuallyPro(s) ? <Zap className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
                                        {isActuallyPro(s) ? 'Elite Node' : 'Basic Node'}
                                     </div>
                                  </td>
                                  <td className="px-12 py-10">
                                     <div className="space-y-3">
                                        <div className="h-1.5 w-32 bg-white/5 rounded-full overflow-hidden">
                                           <div className={cn("h-full transition-all duration-1000", isActuallyPro(s) ? "bg-jarvis-accent w-full shadow-[0_0_15px_#22d3ee]" : "bg-white/20 w-1/3")} />
                                        </div>
                                        <p className="text-xs font-semibold text-white/20  tracking-normal font-sans text-white/40">Registered: {new Date(s.created_at).toLocaleDateString()}</p>
                                     </div>
                                  </td>
                                  <td className="px-12 py-10 text-right">
                                     <div className="flex items-center justify-end gap-6 opacity-0 group-hover/row:opacity-100 transition-all translate-x-4 group-hover/row:translate-x-0">
                                        <div className="relative group/btn">
                                           <div className={cn("absolute inset-0 blur-xl opacity-0 group-hover/btn:opacity-60 transition-opacity", s.plan === 'pro' ? "bg-red-500" : "bg-jarvis-accent")} />
                                           <button 
                                              onClick={() => handleTogglePro(s.email, s.plan)}
                                              className={cn(
                                                "relative px-6 py-3 rounded-xl text-sm font-semibold  tracking-widest border transition-all active:scale-90",
                                                s.plan === 'pro'
                                                  ? "bg-red-500/10 border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white"
                                                  : "bg-white text-black hover:bg-jarvis-accent"
                                              )}
                                           >
                                              {s.plan === 'pro' ? 'Terminate' : 'Upgrade'}
                                           </button>
                                        </div>
                                        <button 
                                           onClick={() => handleDeleteUser(s.email)}
                                           className="p-3 text-white/10 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all hover:rotate-12 active:scale-75"
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

                    {/* Matrix Controller Footer */}
                    <div className="px-12 py-10 bg-white/[0.02] border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-10">
                       <div className="flex items-center gap-8">
                          <div className="flex -space-x-4">
                             {[...Array(5)].map((_, i) => (
                               <div key={i} className="w-12 h-12 rounded-full border-4 border-black bg-white/5 flex items-center justify-center font-semibold text-xs text-white/10 font-sans">
                                  {i + 1}
                               </div>
                             ))}
                          </div>
                          <p className="text-sm font-semibold text-white/30  tracking-normal">{filteredSubscriptions.length} Active Database Fragments</p>
                       </div>
                       
                       <div className="flex gap-4">
                          <div className="relative group/btn">
                             <div className="absolute inset-0 bg-cyan-500/20 blur-xl opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                             <button className="relative p-5 border border-white/10 rounded-2xl text-white/20 hover:text-cyan-400 hover:border-cyan-400 transition-all"><ArrowLeft className="w-5 h-5" /></button>
                          </div>
                          <div className="relative group/btn">
                             <div className="absolute inset-0 bg-cyan-500/20 blur-xl opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                             <button className="relative px-8 py-5 border border-white/10 rounded-2xl text-white/20 hover:text-cyan-400 hover:border-cyan-400 transition-all flex items-center gap-4 group">
                                <span className="text-sm font-semibold  tracking-normal">Next Matrix</span>
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                             </button>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>

      </main>

      {/* Persistent System Overlay Icons */}
      <div className="fixed top-1/2 left-8 -translate-y-1/2 flex flex-col gap-10 opacity-20 hover:opacity-100 transition-opacity hidden 2xl:flex">
         <div className="p-3 bg-white/5 border border-white/10 rounded-xl cursor-help" title="SYSTEM RADAR"><Radar className="w-5 h-5" /></div>
         <div className="p-3 bg-white/5 border border-white/10 rounded-xl cursor-help" title="NEURAL LINK"><Zap className="w-5 h-5" /></div>
         <div className="p-3 bg-white/5 border border-white/10 rounded-xl cursor-help" title="CORE DATABASE"><Database className="w-5 h-5" /></div>
      </div>

      {/* 3D HUD Decorative Borders */}
      <div className="fixed top-0 left-0 w-64 h-64 pointer-events-none opacity-20 border-t-2 border-l-2 border-white/10 rounded-tl-[60px] m-8" />
      <div className="fixed bottom-0 right-0 w-64 h-64 pointer-events-none opacity-20 border-b-2 border-r-2 border-white/10 rounded-br-[60px] m-8" />

      {/* Industrial Grade Footer */}
      <footer className="mt-40 border-t border-white/5 py-16 px-12 flex flex-col md:flex-row items-center justify-between gap-10 opacity-30 hover:opacity-100 transition-all duration-700 bg-white/[0.01]">
         <div className="flex items-center gap-8">
            <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center animate-spin-slow">
               <Cpu className="w-6 h-6 text-white/40" />
            </div>
            <div>
               <p className="text-sm font-semibold text-white  tracking-normal">Jarvis Protocol v4.0.8</p>
               <p className="text-xs font-bold text-cyan-500/40  tracking-widest mt-1 font-sans">Stark Unified Architecture · Terminal 7</p>
            </div>
         </div>
         <div className="flex items-center gap-12 font-sans">
            <div className="flex items-center gap-4">
               <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]" />
               <span className="text-sm font-semibold  tracking-normal text-white">Cloud Link Active</span>
            </div>
            <div className="px-6 py-2 border border-white/10 rounded-full text-xs font-semibold  tracking-normal text-white/30">
               © 2026 Stark Industries Global
            </div>
         </div>
      </footer>

      {/* Global Style Injector */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.01);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(34, 211, 238, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(34, 211, 238, 0.3);
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 15s linear infinite;
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .animate-shimmer {
          background: linear-gradient(90deg, transparent, rgba(34, 211, 238, 0.05), transparent);
          background-size: 200% 100%;
          animation: shimmer 4s infinite linear;
        }
      `}</style>
    </div>
  );
}
