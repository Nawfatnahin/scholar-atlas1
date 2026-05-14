"use client";

import { useState } from "react";
import { 
  UserCheck, 
  ShieldCheck, 
  Mail, 
  Plus, 
  Crown, 
  Edit3, 
  Check, 
  X, 
  ArrowLeft,
  Users,
  Bell,
  Search,
  Activity,
  Trash2,
  Calendar,
  ChevronRight,
  Monitor,
  Database,
  SearchX
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

  // Dynamic calculations with safety checks
  const totalGmails = (subscriptions || []).length;
  const isActuallyPro = (s: Subscription) => s.plan === 'pro' && (!s.premium_until || new Date(s.premium_until) > new Date());
  const premiumCount = (subscriptions || []).filter(isActuallyPro).length;
  
  // Filtering
  const filteredSubscriptions = subscriptions
    .filter(s => s.email !== ownerEmail)
    .filter(s => s.email.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // Dynamic Activity: Get actual users sorted by creation date (newest first)
  const recentUsers = [...(subscriptions || [])]
    .filter(s => s.email !== ownerEmail)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5); // Show last 5 signups

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
      toast.success(`${email} is now ${!isPro ? 'Pro' : 'Free'}. They may need to refresh their page to see the changes.`);
    } catch {
      toast.error("Failed to update status. Ensure you have the necessary database permissions.");
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

      if (!subscriptions.find(s => s.email === newEmail.toLowerCase())) {
        const newUser = { id: Math.random().toString(), email: newEmail.toLowerCase(), plan: 'pro', premium_until, created_at: new Date().toISOString() };
        setSubscriptions([newUser, ...subscriptions]);
      } else {
        setSubscriptions(subscriptions.map(s => s.email === newEmail.toLowerCase() ? { ...s, plan: 'pro', premium_until } : s));
      }
      setNewEmail("");
      setIsAdding(false);
      toast.success(`${newEmail} added as Pro. They may need to refresh their page.`);
    } catch {
      toast.error("Failed to add user. Ensure you are authorized and the database is reachable.");
    }
  };

  const handleDeleteUser = async (email: string) => {
    if (!window.confirm(`Are you sure you want to delete ${email} from the subscription database? This cannot be undone.`)) {
      return;
    }
    try {
      const result = await deleteSubscription(email);
      if (result && !result.success) {
        toast.error(`Failed: ${result.error || 'Unknown error'}`);
        return;
      }
      setSubscriptions(subscriptions.filter(s => s.email !== email));
      toast.success(`${email} deleted successfully`);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      toast.error(`Failed to delete ${email}: ${errorMessage || 'Error'}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfaf7] flex flex-col font-sans selection:bg-orange-100 selection:text-orange-900">
      
      {/* Dynamic Header */}
      <header className="h-24 bg-white/70 backdrop-blur-2xl border-b border-orange-100/50 sticky top-0 z-50 px-6 sm:px-12 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="w-12 h-12 bg-gradient-to-tr from-orange-600 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20 hover:scale-110 active:scale-95 transition-all duration-300">
            <Crown className="text-white w-7 h-7 drop-shadow-sm" />
          </Link>
          <div className="hidden xs:block">
            <h1 className="font-display font-black text-2xl text-ink tracking-tight flex items-center gap-1">
              Admin<span className="text-orange-600">Buddy</span>
              <span className="ml-2 px-2 py-0.5 bg-orange-100 text-orange-600 text-[10px] font-black uppercase rounded-lg tracking-widest border border-orange-200/50">v2.0</span>
            </h1>
          </div>
        </div>

        <div className="flex-1 max-w-2xl hidden md:flex relative mx-12">
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
            <Search className="text-stone-400 w-5 h-5" />
          </div>
          <input 
            type="text" 
            placeholder="Search users by email address..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-stone-50 border border-stone-200/60 rounded-[20px] focus:outline-none focus:ring-4 focus:ring-orange-500/5 focus:bg-white focus:border-orange-500/30 transition-all text-sm font-medium"
          />
        </div>

        <div className="flex items-center gap-4 sm:gap-8">
          <div className="h-10 w-[1px] bg-stone-200/60 hidden lg:block" />
          <div className="flex items-center gap-5">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-black text-ink leading-tight flex items-center justify-end gap-2">
                {adminName}
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              </p>
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-1">Super Admin Account</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-100 to-amber-100 border-2 border-white shadow-xl flex items-center justify-center text-orange-600 font-black text-xl overflow-hidden transform hover:rotate-3 transition-transform cursor-pointer">
              {adminName[0].toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      <main className="p-6 sm:p-10 lg:p-16 max-w-[1800px] mx-auto w-full space-y-16">
        
        {/* Welcome Dashboard */}
        <section className="relative group overflow-hidden rounded-[50px] bg-white border border-stone-100 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)]">
          <div className="absolute top-0 right-0 -mr-40 -mt-40 w-[600px] h-[600px] bg-gradient-to-br from-orange-500/5 to-amber-500/5 blur-[120px] rounded-full" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-orange-500/5 blur-[100px] rounded-full" />
          
          <div className="relative p-10 sm:p-20 flex flex-col lg:flex-row items-center justify-between gap-16">
            <div className="space-y-8 text-center lg:text-left flex-1 max-w-3xl">
              <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-green-50 text-green-700 text-[11px] font-black uppercase tracking-[0.2em] border border-green-100 shadow-sm">
                  <span className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                  Full System Protocol Active
                </div>
                <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-orange-50 text-orange-700 text-[11px] font-black uppercase tracking-[0.2em] border border-orange-100 shadow-sm">
                  <Monitor className="w-3.5 h-3.5" />
                  {subscriptions.length} Nodes Connected
                </div>
              </div>
              
              <div className="space-y-6">
                <h2 className="text-5xl sm:text-7xl font-black text-ink tracking-tight flex flex-wrap items-center gap-x-6 justify-center lg:justify-start">
                  G&apos;day, 
                  {isEditingName ? (
                    <div className="flex items-center gap-3 animate-in fade-in zoom-in-95 duration-300">
                      <input 
                        type="text" 
                        value={tempName} 
                        onChange={(e) => setTempName(e.target.value)}
                        className="bg-stone-50 border-b-4 border-orange-500 focus:outline-none px-6 py-2 text-orange-600 w-full max-w-[300px] font-black italic shadow-inner rounded-t-2xl"
                        autoFocus
                      />
                      <div className="flex items-center gap-2">
                        <button onClick={() => { setAdminName(tempName); setIsEditingName(false); }} className="p-3 bg-green-500 text-white rounded-2xl shadow-lg shadow-green-500/30 hover:bg-green-600 transition-all hover:scale-105 active:scale-95"><Check className="w-6 h-6"/></button>
                        <button onClick={() => { setTempName(adminName); setIsEditingName(false); }} className="p-3 bg-red-500 text-white rounded-2xl shadow-lg shadow-red-500/30 hover:bg-red-600 transition-all hover:scale-105 active:scale-95"><X className="w-6 h-6"/></button>
                      </div>
                    </div>
                  ) : (
                    <span className="text-orange-600 italic relative group/name flex items-center gap-4">
                      {adminName}
                      <button onClick={() => setIsEditingName(true)} className="opacity-0 group-hover/name:opacity-100 transition-all p-3 rounded-2xl bg-orange-50 text-orange-400 hover:text-orange-600 hover:scale-110 active:scale-90">
                        <Edit3 className="w-6 h-6" />
                      </button>
                    </span>
                  )}
                </h2>
                <p className="text-stone-500 font-medium text-xl max-w-2xl leading-relaxed">
                  The ecosystem is humming. All student trackers are synchronized and performing within optimal parameters. You have complete architectural oversight over the entire buddy network.
                </p>
              </div>

              <div className="flex flex-wrap gap-5 justify-center lg:justify-start">
                <Link href="/dashboard" className="px-8 py-4 bg-ink text-white rounded-[22px] font-black text-[13px] uppercase tracking-widest shadow-2xl shadow-ink/20 hover:bg-orange-600 hover:scale-105 active:scale-95 transition-all flex items-center gap-4 group">
                  <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                  Terminal Dashboard
                </Link>
                <button 
                   onClick={() => setIsAdding(true)}
                   className="px-8 py-4 bg-white border-2 border-stone-100 text-ink rounded-[22px] font-black text-[13px] uppercase tracking-widest hover:border-orange-500 hover:text-orange-600 hover:shadow-xl transition-all flex items-center gap-4 group"
                >
                  <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                  Provision Node
                </button>
              </div>
            </div>

            <div className="relative group/orb lg:mr-10">
              <div className="absolute inset-0 bg-orange-500/30 blur-[100px] rounded-full animate-pulse group-hover/orb:bg-orange-500/50 transition-colors" />
              <div className="w-64 h-64 sm:w-80 sm:h-80 rounded-[60px] bg-gradient-to-tr from-orange-500 to-amber-500 shadow-[0_50px_100px_-20px_rgba(249,115,22,0.4)] flex items-center justify-center border-[12px] border-white relative z-10 animate-float">
                <Crown className="w-32 h-32 text-white drop-shadow-2xl" />
                <div className="absolute -bottom-8 -right-8 bg-white p-6 rounded-[30px] shadow-2xl border border-orange-50 animate-bounce-slow">
                  <div className="w-16 h-2 bg-green-500 rounded-full mb-2" />
                  <div className="w-10 h-2 bg-green-200 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Analytics Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          <div className="bg-white rounded-[40px] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-stone-100 group hover:-translate-y-3 transition-all duration-500">
            <div className="flex justify-between items-start mb-10">
              <div className="w-16 h-16 rounded-[22px] flex items-center justify-center bg-blue-50 text-blue-600 shadow-inner group-hover:scale-110 transition-transform">
                <Users className="w-8 h-8" />
              </div>
              <span className="px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest bg-blue-50 text-blue-600 border border-blue-100 uppercase">Registered Nodes</span>
            </div>
            <div className="space-y-1">
              <p className="text-stone-400 font-bold text-xs uppercase tracking-[0.2em]">Total Ecosystem Users</p>
              <div className="flex items-baseline gap-3">
                <p className="text-6xl font-black text-ink tracking-tighter">{totalGmails}</p>
                <span className="text-green-500 text-sm font-black">+4%</span>
              </div>
            </div>
            <div className="mt-10 flex items-end gap-2 h-16">
              {[...Array(15)].map((_, i) => (
                <div key={i} className="flex-1 bg-blue-100/50 rounded-full group-hover:bg-blue-400 transition-all duration-700" style={{ height: `${30 + Math.random() * 70}%`, transitionDelay: `${i * 30}ms` }} />
              ))}
            </div>
          </div>

          <div className="bg-white rounded-[40px] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-stone-100 group hover:-translate-y-3 transition-all duration-500">
            <div className="flex justify-between items-start mb-10">
              <div className="w-16 h-16 rounded-[22px] flex items-center justify-center bg-orange-50 text-orange-600 shadow-inner group-hover:scale-110 transition-transform">
                <Crown className="w-8 h-8" />
              </div>
              <span className="px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest bg-orange-50 text-orange-600 border border-orange-100 uppercase">Premium Matrix</span>
            </div>
            <div className="space-y-1">
              <p className="text-stone-400 font-bold text-xs uppercase tracking-[0.2em]">Active Elite Members</p>
              <div className="flex items-baseline gap-3">
                <p className="text-6xl font-black text-ink tracking-tighter">{premiumCount}</p>
                <span className="text-orange-500 text-sm font-black">+12%</span>
              </div>
            </div>
            <div className="mt-10 flex items-end gap-2 h-16">
              {[...Array(15)].map((_, i) => (
                <div key={i} className="flex-1 bg-orange-100/50 rounded-full group-hover:bg-orange-400 transition-all duration-700" style={{ height: `${30 + Math.random() * 70}%`, transitionDelay: `${i * 30}ms` }} />
              ))}
            </div>
          </div>

          <div className="bg-ink rounded-[40px] p-10 shadow-[0_30px_60px_rgba(0,0,0,0.15)] group hover:-translate-y-3 transition-all duration-500 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-40 h-40 bg-orange-500/10 blur-3xl rounded-full" />
            <div className="flex justify-between items-start mb-10 relative z-10">
              <div className="w-16 h-16 rounded-[22px] flex items-center justify-center bg-white/10 text-orange-500 shadow-inner group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <span className="px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest bg-white/10 text-orange-400 border border-white/10 uppercase">System Integrity</span>
            </div>
            <div className="space-y-4 relative z-10">
              <div>
                <p className="text-white/40 font-bold text-xs uppercase tracking-[0.2em] mb-2">Master Credentials</p>
                <p className="text-xl font-black text-white truncate max-w-[250px]">{ownerEmail}</p>
              </div>
              <div className="pt-4 flex items-center gap-4">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.8)]" />
                <p className="text-[11px] font-black text-white/60 uppercase tracking-[0.25em]">Superuser Level 10 Access</p>
              </div>
            </div>
          </div>
        </div>

        {/* Database Management */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Left: Recent Activity Feed */}
          <div className="lg:col-span-1 space-y-10">
            <div className="bg-white rounded-[40px] p-10 border border-stone-100 shadow-[0_20px_50px_rgba(0,0,0,0.03)] h-full">
              <div className="flex items-center justify-between mb-12">
                <h3 className="font-display font-black text-2xl text-ink">Ecosystem Pulse</h3>
                <div className="px-3 py-1 bg-green-50 rounded-full border border-green-100 animate-pulse">
                   <span className="text-[9px] font-black text-green-700 uppercase tracking-widest">Streaming Live</span>
                </div>
              </div>

              <div className="space-y-10 relative">
                <div className="absolute left-[27px] top-2 bottom-2 w-0.5 bg-stone-50" />
                
                {recentUsers.map((user, idx) => (
                  <div key={user.id} className="flex gap-6 relative z-10 group/item animate-in slide-in-from-left-4 duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                    <div className={cn(
                      "w-14 h-14 rounded-[18px] bg-white border-2 flex items-center justify-center shadow-sm transition-all duration-300 group-hover/item:scale-115 group-hover/item:rotate-3",
                      user.plan === 'pro' ? "border-orange-200" : "border-stone-100"
                    )}>
                      {user.plan === 'pro' ? (
                        <Crown className="w-6 h-6 text-orange-500" />
                      ) : (
                        <Mail className="w-6 h-6 text-stone-300" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-4">
                        <div className="min-w-0">
                          <p className="font-black text-ink tracking-tight truncate group-hover/item:text-orange-600 transition-colors">
                            {user.email}
                          </p>
                          <p className="text-[11px] text-stone-400 font-bold uppercase tracking-widest mt-1">Node Initialization Complete</p>
                        </div>
                        <span className="text-[9px] font-black text-stone-400 uppercase tracking-widest bg-stone-50 px-3 py-1.5 rounded-lg shrink-0">
                          {new Date(user.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                {recentUsers.length === 0 && (
                  <div className="py-24 text-center">
                    <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Activity className="w-10 h-10 text-stone-200" />
                    </div>
                    <p className="font-black uppercase tracking-widest text-[10px] text-stone-300">No activity detected</p>
                  </div>
                )}
              </div>

              <div className="mt-14 p-8 bg-[#fcfaf7] rounded-[35px] border border-orange-100/30 flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-sm border border-stone-100">
                    <Database className="w-7 h-7 text-orange-500" />
                  </div>
                  <div>
                    <p className="font-black text-ink text-sm">Matrix Capacity</p>
                    <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mt-0.5">Automated Backups Running</p>
                  </div>
                </div>
                <div className="flex gap-1.5 h-8 items-end">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="w-1.5 bg-orange-400/30 rounded-full animate-pulse" style={{ height: `${40 + Math.random() * 60}%`, animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Subscription Database */}
          <div className="lg:col-span-2 space-y-10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-8">
              <div className="space-y-2">
                <h3 className="font-display font-black text-3xl text-ink tracking-tight">Subscription Matrix</h3>
                <p className="text-stone-400 font-medium">Provision nodes and manage access tiers across the ecosystem.</p>
              </div>
              <button 
                onClick={() => setIsAdding(!isAdding)}
                className="group flex items-center gap-4 px-8 py-4 bg-orange-600 text-white rounded-[22px] shadow-2xl shadow-orange-600/20 hover:bg-ink transition-all hover:scale-105 active:scale-95 font-black text-[13px] uppercase tracking-widest whitespace-nowrap"
              >
                <Plus className={cn("w-5 h-5 transition-transform duration-500", isAdding && "rotate-45")} />
                {isAdding ? 'Decline Operation' : 'Provision Pro Access'}
              </button>
            </div>

            {isAdding && (
              <form onSubmit={handleAddUser} className="relative group animate-in slide-in-from-top-6 duration-700 ease-out">
                <div className="absolute -inset-1.5 bg-gradient-to-r from-orange-600 to-amber-500 rounded-[35px] blur opacity-25 group-hover:opacity-40 transition-opacity" />
                <div className="relative bg-white p-10 rounded-[35px] border border-orange-100 shadow-2xl flex flex-col sm:flex-row gap-6">
                  <div className="flex-1 relative">
                    <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-stone-300 w-6 h-6" />
                    <input 
                      type="email" 
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="Enter target email address..."
                      className="w-full pl-16 pr-8 py-5 rounded-2xl bg-stone-50 border-2 border-transparent focus:border-orange-500 focus:bg-white transition-all font-bold text-ink"
                      required
                    />
                  </div>
                  <button type="submit" className="px-12 py-5 bg-ink text-white rounded-2xl font-black shadow-xl hover:bg-orange-600 transition-all uppercase tracking-widest text-[13px] active:scale-95">
                    Authorize Elite Status
                  </button>
                </div>
              </form>
            )}

            <div className="bg-white rounded-[45px] overflow-hidden border border-stone-100 shadow-[0_30px_70px_-20px_rgba(0,0,0,0.06)] group/table">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-stone-50/50 border-b border-stone-100">
                      <th className="px-10 py-8 text-[11px] font-black uppercase tracking-[0.25em] text-stone-400">Target Node</th>
                      <th className="px-10 py-8 text-[11px] font-black uppercase tracking-[0.25em] text-stone-400">Access Matrix</th>
                      <th className="px-10 py-8 text-[11px] font-black uppercase tracking-[0.25em] text-stone-400">Initialization</th>
                      <th className="px-10 py-8 text-[11px] font-black uppercase tracking-[0.25em] text-stone-400 text-right">Overrides</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSubscriptions.map((s, idx) => (
                      <tr key={s.id} className={cn("group/row transition-all hover:bg-orange-50/30", idx % 2 === 0 ? "bg-white" : "bg-[#fcfaf7]/40")}>
                        <td className="px-10 py-8">
                          <div className="flex items-center gap-5">
                            <div className="w-12 h-12 rounded-[16px] bg-white border-2 border-stone-100 flex items-center justify-center font-black text-stone-300 group-hover/row:border-orange-200 group-hover/row:text-orange-500 transition-all group-hover/row:scale-110 shadow-sm">
                              {s.email[0].toUpperCase()}
                            </div>
                            <div className="min-w-0">
                               <p className="font-black text-ink truncate max-w-[200px] text-lg">{s.email}</p>
                               <div className="flex items-center gap-2 mt-1">
                                 <span className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_5px_rgba(34,197,94,0.5)]" />
                                 <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Active Link</span>
                               </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-10 py-8">
                          <div className={cn(
                            "inline-flex items-center gap-2.5 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm border",
                            isActuallyPro(s) 
                              ? "bg-gradient-to-r from-orange-600 to-amber-500 text-white border-orange-400" 
                              : "bg-white text-stone-400 border-stone-100"
                          )}>
                            {isActuallyPro(s) ? <Crown className="w-3.5 h-3.5" /> : <Monitor className="w-3.5 h-3.5" />}
                            {isActuallyPro(s) ? 'Elite Status' : 'Standard Node'}
                          </div>
                          {isActuallyPro(s) && s.premium_until && (
                            <div className="flex items-center gap-2 text-[10px] text-orange-600/60 font-black mt-2.5 uppercase tracking-widest px-1">
                              <Calendar className="w-3 h-3" />
                              Expires: {new Date(s.premium_until).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </div>
                          )}
                          {s.plan === 'pro' && !isActuallyPro(s) && (
                            <div className="inline-flex items-center gap-1.5 text-[10px] text-red-500 font-black mt-2.5 uppercase tracking-[0.2em] bg-red-50 px-2 py-0.5 rounded-lg border border-red-100">
                              <SearchX className="w-3 h-3" />
                              Expired Logic
                            </div>
                          )}
                        </td>
                        <td className="px-10 py-8">
                          <span className="text-sm font-bold text-stone-500 bg-stone-100/50 px-3 py-1.5 rounded-xl border border-stone-200/50">
                            {new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </td>
                        <td className="px-10 py-8 text-right">
                          <div className="flex items-center justify-end gap-4 opacity-0 group-hover/row:opacity-100 transition-all translate-x-4 group-hover/row:translate-x-0">
                            <button 
                              onClick={() => handleTogglePro(s.email, s.plan)}
                              className={cn(
                                "px-6 py-2.5 rounded-[14px] text-[11px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95",
                                s.plan === 'pro'
                                  ? "bg-red-50 text-red-500 hover:bg-red-500 hover:text-white shadow-red-500/10"
                                  : "bg-orange-600 text-white hover:bg-ink shadow-orange-600/20"
                              )}
                            >
                              {s.plan === 'pro' ? 'Terminate Elite' : 'Elevate Tier'}
                            </button>
                            <button 
                              onClick={() => handleDeleteUser(s.email)}
                              className="p-3 text-stone-300 hover:text-red-600 hover:bg-red-50 rounded-[14px] transition-all hover:rotate-12 active:scale-75"
                              title="Delete Resource"
                            >
                              <Trash2 className="w-6 h-6" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    
                    {filteredSubscriptions.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-10 py-40 text-center">
                          <div className="flex flex-col items-center gap-8 animate-in zoom-in-95 duration-500">
                            <div className="w-24 h-24 bg-stone-50 rounded-[35px] flex items-center justify-center border border-stone-100 shadow-inner">
                              <SearchX className="w-12 h-12 text-stone-200" />
                            </div>
                            <div className="space-y-2">
                              <p className="font-black text-2xl text-stone-300 uppercase tracking-tighter">Zero Nodes Detected</p>
                              <p className="text-stone-400 font-medium text-sm">No users match your current search criteria.</p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              <div className="px-10 py-10 bg-stone-50/50 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-8">
                <div className="flex items-center gap-5">
                   <div className="flex -space-x-3">
                      {filteredSubscriptions.slice(0, 4).map((s, i) => (
                        <div key={i} className="w-10 h-10 rounded-full border-4 border-white bg-stone-100 flex items-center justify-center font-black text-[10px] text-stone-400 shadow-sm">
                           {s.email[0].toUpperCase()}
                        </div>
                      ))}
                   </div>
                   <p className="text-[11px] font-black text-stone-400 uppercase tracking-widest">Managing {filteredSubscriptions.length} Target User Nodes</p>
                </div>
                <div className="flex gap-4">
                  <button className="px-6 py-3 rounded-2xl border-2 border-stone-100 text-stone-400 font-black text-[11px] uppercase tracking-widest disabled:opacity-30 hover:bg-white hover:border-stone-200 transition-all active:scale-95" disabled>Previous Layer</button>
                  <button className="px-6 py-3 rounded-2xl border-2 border-stone-100 text-ink font-black text-[11px] uppercase tracking-widest hover:border-orange-500 hover:text-orange-600 hover:shadow-xl hover:bg-white transition-all active:scale-95">Next Layer</button>
                </div>
              </div>
            </div>
          </div>
        </div>

      </main>
      
      {/* Footer Branded Bar */}
      <footer className="mt-auto py-10 px-6 sm:px-12 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-6 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
         <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-ink rounded-lg flex items-center justify-center">
               <Crown className="w-5 h-5 text-white" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-ink">BackLogger Buddy System Control Center</p>
         </div>
         <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">© 2026 Architectural Engineering Division</p>
      </footer>
    </div>
  );
}
