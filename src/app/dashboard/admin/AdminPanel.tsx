"use client";

import { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  Mail, 
  Plus, 
  Crown, 
  ArrowLeft,
  Users,
  Search,
  Trash2,
  Monitor,
  Database,
  Zap,
  Cpu,
  Globe,
  Radar,
  ArrowRight,
  Settings,
  Sparkles,
  Activity as ActivityIcon,
  Key,
  RefreshCw,
  Copy,
  Clock,
  CheckCircle2,
  Lock,
  Unlock,
  ListChecks,
  UserCheck
} from "lucide-react";
import { toggleProStatus, deleteSubscription, generateAccessCode, getActiveCode, getAllWaitlistUsers, getAllProAccessList } from "./actions";
import { toast } from "sonner";
import Link from "next/link";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { getJarvisMessage } from "./jarvis-utils";
import Interactive3DBox from "./Interactive3DBox";

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

interface ActiveCodeInfo {
  code?: string;
  usesCount?: number;
  maxUses?: number;
  expiresAt?: string;
  createdAt?: string;
  cooldownDaysLeft?: number;
  canGenerate?: boolean;
}

interface WaitlistUser {
  id: string;
  email: string;
  created_at: string;
}

interface ProAccessUser {
  id: string;
  email: string;
  code_used: string;
  granted_at: string;
}

export default function AdminPanel({
  initialSubscriptions,
  ownerEmail,
  initialCodeInfo,
  initialWaitlist,
  initialProAccessList,
}: {
  initialSubscriptions: Subscription[];
  ownerEmail: string;
  initialCodeInfo: ActiveCodeInfo | null;
  initialWaitlist: WaitlistUser[];
  initialProAccessList: ProAccessUser[];
}) {
  const [subscriptions, setSubscriptions] = useState(initialSubscriptions || []);
  const [newEmail, setNewEmail] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [adminName] = useState(ownerEmail.split('@')[0]);
  const [isEditingName, setIsEditingName] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const [jarvisMessage, setJarvisMessage] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [neuralLogs, setNeuralLogs] = useState<string[]>([]);

  // Code Generator State
  const [codeInfo, setCodeInfo] = useState<ActiveCodeInfo | null>(initialCodeInfo);
  const [isGenerating, setIsGenerating] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);

  // Waitlist & Pro Access State
  const [waitlistUsers, setWaitlistUsers] = useState<WaitlistUser[]>(initialWaitlist || []);
  const [proAccessUsers, setProAccessUsers] = useState<ProAccessUser[]>(initialProAccessList || []);

  // Dynamic calculations
  const totalGmails = (subscriptions || []).length;
  const isActuallyPro = (s: Subscription) => s.plan === 'pro' && (!s.premium_until || new Date(s.premium_until) > new Date());
  const premiumCount = (subscriptions || []).filter(isActuallyPro).length;

  // Simulated real-time metrics for Buddy OS
  const [metrics, setMetrics] = useState({
    cpu: 12,
    ram: 45,
    latency: 24,
    uptime: "99.998%"
  });

  useEffect(() => {
    setMounted(true);
    
    let activityLevel: 'high' | 'idle' | 'normal' = 'normal';
    if (totalGmails > 100) activityLevel = 'high';
    else if (totalGmails < 10) activityLevel = 'idle';
    
    const message = getJarvisMessage(activityLevel);
    setJarvisMessage(message);

    setNeuralLogs([
      "Neural sync established.",
      "Matrix population: " + totalGmails + " nodes.",
      "Security protocol: Active."
    ]);

    setIsTyping(true);
    const timer = setTimeout(() => setIsTyping(false), 2000);

    const metricInterval = setInterval(() => {
      const newCpu = Math.floor(Math.random() * 15) + 5;
      const newRam = Math.floor(Math.random() * 10) + 40;
      setMetrics(prev => ({
        cpu: newCpu,
        ram: newRam,
        latency: Math.floor(Math.random() * 10) + 15,
        uptime: "99.99" + (Math.floor(Math.random() * 9) + 1) + "%"
      }));

      const logs = [
        `CPU throughput: ${newCpu}%`,
        `Memory allocation shifted to ${newRam}%`,
        "Packet integrity verified.",
        "Neural sync pulse: Nominal.",
        "Sub-node status: Synchronized.",
        "Security scan: No threats."
      ];
      setNeuralLogs(prev => [logs[Math.floor(Math.random() * logs.length)], ...prev.slice(0, 4)]);
    }, 3000);

    return () => {
      clearTimeout(timer);
      clearInterval(metricInterval);
    };
  }, [totalGmails]);
  
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
      toast.error("Failed to update account.");
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
    if (!window.confirm(`Remove account ${email}?`)) return;
    try {
      const result = await deleteSubscription(email);
      if (result && !result.success) {
        toast.error(`Error: ${result.error}`);
        return;
      }
      setSubscriptions(subscriptions.filter(s => s.email !== email));
      toast.success(`${email} offline.`);
    } catch {
      toast.error(`Critical error.`);
    }
  };

  const handleGenerateCode = async () => {
    setIsGenerating(true);
    try {
      const result = await generateAccessCode();
      if (result.success && result.code) {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 3);
        setCodeInfo({
          code: result.code,
          usesCount: 0,
          maxUses: 20,
          expiresAt: expiresAt.toISOString(),
          createdAt: new Date().toISOString(),
          cooldownDaysLeft: 3,
          canGenerate: false,
        });
        toast.success("New access code generated.");
      } else if (result.cooldownDaysLeft) {
        toast.error(`Cooldown active. ${result.cooldownDaysLeft} day(s) remaining.`);
      } else {
        toast.error(result.error || "Failed to generate code.");
      }
    } catch {
      toast.error("Code generation failed.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyCode = () => {
    if (!codeInfo?.code) return;
    navigator.clipboard.writeText(codeInfo.code);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const getCodeExpiryDisplay = () => {
    if (!codeInfo?.expiresAt) return null;
    const exp = new Date(codeInfo.expiresAt);
    const now = new Date();
    const diff = exp.getTime() - now.getTime();
    if (diff <= 0) return "Expired";
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days}d ${hours % 24}h remaining`;
    return `${hours}h remaining`;
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen overflow-x-hidden relative bg-bg text-ink font-body">
      
      {/* Subtle Background Decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[100px]" />
         <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-accent/5 rounded-full blur-[80px]" />
      </div>

      {/* Clean Sticky Header */}
      <header className="bg-bg/95 backdrop-blur-xl border-b border-accent/10 py-3 sm:py-6 sticky top-0 z-50">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-8 flex justify-between items-center gap-4">
          <div className="flex items-center gap-3 sm:gap-6">
            <Link href="/dashboard" className="p-2.5 sm:p-3 rounded-2xl bg-accent text-white hover:scale-105 shadow-lg shadow-accent/20 transition-all flex-shrink-0">
              <ArrowLeft className="w-5 h-5 sm:w-6 h-6" />
            </Link>
            <div className="flex items-center gap-4 sm:gap-8">
              <h1 className="text-xl sm:text-2xl font-black text-accent tracking-tight hidden xs:block uppercase tracking-[0.1em]">Admin Panel</h1>
            </div>
          </div>
          
          <div className="hidden lg:flex items-center flex-1 max-w-md mx-8">
            <div className="relative w-full group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-3 w-4 h-4 group-focus-within:text-accent transition-colors" />
              <input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search registry..."
                className="w-full bg-white/60 border border-border-strong rounded-xl py-2.5 pl-12 pr-4 text-sm font-medium outline-none focus:border-accent transition-all text-ink placeholder:text-ink-4 backdrop-blur-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-6">
             <div className="hidden xs:flex items-center px-4 py-1.5 rounded-full bg-accent/5 border border-accent/10">
                <ShieldCheck className="w-3 h-3 text-accent mr-2" />
                <span className="text-[10px] font-black text-accent uppercase tracking-widest">Admin Panel</span>
             </div>

             <div className="flex items-center gap-3">
                <div className="hidden md:flex flex-col items-end mr-2">
                   <span className="text-[10px] font-black text-accent uppercase tracking-widest">Administrator</span>
                   <button onClick={() => setIsEditingName(true)} className="text-sm font-bold text-ink hover:text-accent transition-colors flex items-center gap-2">
                     {adminName}
                     <Settings className="w-3.5 h-3.5 text-ink-4" />
                   </button>
                </div>
                <div className="w-10 h-10 sm:w-12 h-12 rounded-2xl bg-white border border-border-strong flex items-center justify-center text-ink font-bold text-lg shadow-sm overflow-hidden relative group/avatar">
                  {adminName[0].toUpperCase()}
                  <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover/avatar:opacity-100 transition-opacity" />
                </div>
             </div>
          </div>
        </div>
      </header>

      <main className="p-8 lg:p-16 max-w-[1800px] mx-auto w-full space-y-20 relative z-10 font-body">
        
        {/* Stats Pedestals */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
           {[
             { label: 'Network Population', val: totalGmails, icon: Users, accent: 'amber', detail: 'Active Nodes' },
             { label: 'Elite Sub-Nodes', val: premiumCount, icon: Crown, accent: 'amber', detail: 'Pro Access' },
             { label: 'Uptime Matrix', val: metrics.uptime, icon: Globe, accent: 'amber', detail: 'Real-time' },
             { label: 'Security Shield', val: 'MAX', icon: ShieldCheck, accent: 'amber', detail: 'Active' }
           ].map((stat, i) => (
             <Interactive3DBox key={i} className="group">
                <div className="p-8 h-full">
                   <div className="flex justify-between items-start mb-6">
                      <div className="w-12 h-12 rounded-xl bg-accent/5 border border-accent/10 flex items-center justify-center group-hover:bg-accent/10 transition-all">
                        <stat.icon className="w-6 h-6 text-accent" />
                      </div>
                      <div className="text-[10px] font-bold text-ink-3 tracking-widest uppercase">{stat.detail}</div>
                   </div>
                   <div className="space-y-1">
                      <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink-3">{stat.label}</h4>
                      <p className="text-4xl font-serif font-bold text-ink tracking-tight">{stat.val}</p>
                   </div>
                   <div className="mt-6 h-1 w-full bg-accent/5 rounded-full overflow-hidden">
                      <div className="h-full bg-accent w-3/4" />
                   </div>
                </div>
             </Interactive3DBox>
           ))}
        </section>

        <div className="flex flex-col gap-12">
           
           {/* AI Assistant Card */}
           <div className="w-full relative">
              {/* Floating Status Pill */}
              <div className="absolute -top-6 right-12 z-20 animate-float">
                 <div className="bg-white border border-border-strong rounded-2xl px-6 py-3 shadow-xl flex items-center gap-3">
                    <div className="relative w-3 h-3">
                       <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-20" />
                       <div className="w-3 h-3 bg-green-500 rounded-full shadow-[0_0_10px_#22c55e]" />
                    </div>
                    <span className="text-[10px] font-bold text-ink uppercase tracking-widest">Neural Pulse: Optimal</span>
                 </div>
              </div>

              <Interactive3DBox className="group">
                 <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
                 
                 <div className="relative p-12 grid grid-cols-1 lg:grid-cols-12 gap-16">
                    {/* Left: Identity & Critical Stats */}
                    <div className="lg:col-span-4 space-y-12">
                       <div className="flex items-center gap-8">
                          <div className="w-24 h-24 bg-accent/5 border border-accent/10 rounded-full flex items-center justify-center relative">
                             <div className="absolute inset-0 border border-accent/20 rounded-full animate-ping opacity-10" />
                             <div className="w-14 h-14 flex items-center justify-center relative">
                                <div className="absolute inset-0 border-2 border-accent/30 rounded-full animate-spin-slow" />
                                <div className="w-5 h-5 bg-accent rounded-full shadow-[0_0_15px_rgba(146,64,14,0.5)]" />
                             </div>
                          </div>
                          <div>
                             <h2 className="text-4xl font-serif font-bold tracking-tight text-ink group-hover:text-accent transition-colors">LOGGER OS</h2>
                             <div className="flex items-center gap-2.5 mt-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                <span className="text-xs font-bold uppercase tracking-widest text-ink-3">Core Synchronized</span>
                             </div>
                          </div>
                       </div>

                       <div className="space-y-8">
                          {[
                            { label: 'CPU Throughput', val: metrics.cpu, color: 'bg-accent' },
                            { label: 'Neural Memory', val: metrics.ram, color: 'bg-accent' },
                            { label: 'Packet Latency', val: metrics.latency, color: 'bg-accent', max: 50 }
                          ].map((s, i) => (
                            <div key={i} className="space-y-3">
                               <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-[0.2em] text-ink-3">
                                  <span>{s.label}</span>
                                  <span className="text-accent">{s.val}{s.label.includes('Latency') ? 'ms' : '%'}</span>
                               </div>
                               <div className="h-2 w-full bg-accent/5 rounded-full overflow-hidden border border-accent/5">
                                  <div 
                                    className={cn("h-full transition-all duration-1000", s.color)} 
                                    style={{ width: `${(s.val / (s.max || 100)) * 100}%` }} 
                                  />
                               </div>
                            </div>
                          ))}
                       </div>
                    </div>

                    {/* Right: Message & Real-time Neural Stream */}
                    <div className="lg:col-span-8 flex flex-col gap-10">
                       <div className="flex-1 p-10 bg-bg/40 border border-border-strong rounded-[40px] flex items-center relative group-hover:bg-bg/60 transition-colors duration-500">
                          <div className="absolute top-6 left-8 flex gap-2">
                             <div className="w-2.5 h-2.5 rounded-full bg-red-400/40" />
                             <div className="w-2.5 h-2.5 rounded-full bg-amber-400/40" />
                             <div className="w-2.5 h-2.5 rounded-full bg-green-400/40" />
                          </div>
                          <div className="w-full">
                             {isTyping ? (
                                <div className="flex gap-2 items-center py-4">
                                   <div className="w-2.5 h-2.5 bg-accent/30 rounded-full animate-bounce" />
                                   <div className="w-2.5 h-2.5 bg-accent/30 rounded-full animate-bounce [animation-delay:0.2s]" />
                                   <div className="w-2.5 h-2.5 bg-accent/30 rounded-full animate-bounce [animation-delay:0.4s]" />
                                </div>
                             ) : (
                                <p className="text-3xl font-serif font-medium text-ink leading-relaxed tracking-tight">
                                   &quot;{jarvisMessage}&quot;
                                </p>
                             )}
                          </div>
                       </div>
                       
                       {/* Real-time Neural Stream Log */}
                       <div className="bg-white/50 backdrop-blur-sm border border-border-strong rounded-3xl p-6 overflow-hidden relative">
                          <div className="absolute top-0 left-0 w-1 h-full bg-accent/20" />
                          <div className="space-y-2">
                             <p className="text-[10px] font-bold text-accent uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Sparkles className="w-3 h-3" /> Neural Sync Stream
                             </p>
                             <div className="space-y-2">
                                {neuralLogs.map((log, i) => (
                                  <div key={i} className={cn(
                                    "text-xs font-medium text-ink-3 flex items-center gap-3 transition-all duration-500",
                                    i === 0 ? "opacity-100 translate-x-0" : "opacity-40 -translate-x-1"
                                  )}>
                                     <span className="w-1 h-1 bg-accent rounded-full" />
                                     <span className="font-mono text-[10px] opacity-40">[{new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]</span>
                                     {log}
                                  </div>
                                ))}
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>
              </Interactive3DBox>
           </div>

           {/* ── ACCESS CODE GENERATOR ── */}
           <div className="w-full">
              <div className="flex justify-between items-center gap-6 mb-8">
                 <div className="space-y-2">
                    <h2 className="text-4xl font-serif font-bold text-ink tracking-tight flex items-center gap-4">
                       <Key className="w-10 h-10 text-accent" />
                       Access Code Generator
                    </h2>
                    <p className="text-ink-3 font-bold uppercase tracking-widest text-[10px]">8-Character Pro Access Codes · 3-Day Cooldown · 20-Use Limit</p>
                 </div>
              </div>

              <Interactive3DBox className="group">
                 <div className="p-10 grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Left: Code Display */}
                    <div className="space-y-8">
                       <div className="space-y-3">
                          <p className="text-[10px] font-black uppercase tracking-widest text-ink-3">Current Active Code</p>
                          {codeInfo?.code ? (
                             <div className="relative group/code">
                                <div className="bg-bg border-2 border-accent/20 rounded-2xl p-6 flex items-center justify-between gap-4">
                                   <span className="font-mono text-3xl font-black text-accent tracking-[0.3em] select-all">
                                      {codeInfo.code}
                                   </span>
                                   <button
                                      onClick={handleCopyCode}
                                      className="p-3 rounded-xl bg-accent/5 border border-accent/10 hover:bg-accent/10 transition-all active:scale-95"
                                   >
                                      {codeCopied ? (
                                         <CheckCircle2 className="w-5 h-5 text-green-500" />
                                      ) : (
                                         <Copy className="w-5 h-5 text-accent" />
                                      )}
                                   </button>
                                </div>
                             </div>
                          ) : (
                             <div className="bg-bg border-2 border-dashed border-border-strong rounded-2xl p-6 flex items-center justify-center">
                                <span className="text-ink-4 text-sm font-bold uppercase tracking-widest">No Active Code</span>
                             </div>
                          )}
                       </div>

                       {/* Code Stats */}
                       <div className="grid grid-cols-2 gap-4">
                          <div className="bg-bg border border-border-strong rounded-2xl p-5 space-y-2">
                             <p className="text-[10px] font-black uppercase tracking-widest text-ink-3">Uses</p>
                             <div className="flex items-end gap-2">
                                <span className="text-3xl font-serif font-black text-ink">{codeInfo?.usesCount ?? 0}</span>
                                <span className="text-base text-ink-3 font-bold mb-1">/ {codeInfo?.maxUses ?? 20}</span>
                             </div>
                             <div className="h-1.5 w-full bg-accent/5 rounded-full overflow-hidden">
                                <div 
                                   className="h-full bg-accent transition-all duration-700 rounded-full"
                                   style={{ width: `${((codeInfo?.usesCount ?? 0) / (codeInfo?.maxUses ?? 20)) * 100}%` }}
                                />
                             </div>
                          </div>
                          <div className="bg-bg border border-border-strong rounded-2xl p-5 space-y-2">
                             <p className="text-[10px] font-black uppercase tracking-widest text-ink-3">Expiry</p>
                             <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-accent flex-shrink-0" />
                                <span className="text-sm font-bold text-ink">{getCodeExpiryDisplay() ?? "—"}</span>
                             </div>
                             {codeInfo?.expiresAt && (
                                <p className="text-[10px] text-ink-4">{new Date(codeInfo.expiresAt).toLocaleDateString()}</p>
                             )}
                          </div>
                       </div>
                    </div>

                    {/* Right: Generate & Status */}
                    <div className="space-y-8 flex flex-col justify-between">
                       <div className="space-y-6">
                          <div className={cn(
                             "p-5 rounded-2xl border flex items-start gap-4",
                             codeInfo?.canGenerate
                                ? "bg-green-50 border-green-200"
                                : "bg-amber-50 border-amber-200"
                          )}>
                             {codeInfo?.canGenerate ? (
                                <Unlock className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                             ) : (
                                <Lock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                             )}
                             <div>
                                <p className={cn(
                                   "text-xs font-black uppercase tracking-widest",
                                   codeInfo?.canGenerate ? "text-green-700" : "text-amber-700"
                                )}>
                                   {codeInfo?.canGenerate ? "Ready to Generate" : "Cooldown Active"}
                                </p>
                                <p className={cn(
                                   "text-[11px] mt-1",
                                   codeInfo?.canGenerate ? "text-green-600" : "text-amber-600"
                                )}>
                                   {codeInfo?.canGenerate
                                      ? "No active cooldown. A new code can be issued."
                                      : `${codeInfo?.cooldownDaysLeft ?? 3} day(s) remaining before next code can be generated.`
                                   }
                                </p>
                             </div>
                          </div>

                          <div className="space-y-3 text-[11px] text-ink-3 font-medium">
                             <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                                Codes are 8-character alphanumeric
                             </div>
                             <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                                Each code expires after 3 days
                             </div>
                             <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                                Maximum 20 uses per code
                             </div>
                             <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                                Grants permanent Pro access to user
                             </div>
                          </div>
                       </div>

                       <button
                          onClick={handleGenerateCode}
                          disabled={isGenerating || !codeInfo?.canGenerate}
                          className={cn(
                             "w-full py-5 px-8 rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-sm active:scale-95",
                             codeInfo?.canGenerate && !isGenerating
                                ? "bg-accent text-white hover:bg-accent/90 shadow-accent/20"
                                : "bg-border-strong text-ink-4 cursor-not-allowed"
                          )}
                       >
                          {isGenerating ? (
                             <RefreshCw className="w-5 h-5 animate-spin" />
                          ) : (
                             <Key className="w-5 h-5" />
                          )}
                          {isGenerating ? "Generating..." : "Generate New Code"}
                       </button>
                    </div>
                 </div>
              </Interactive3DBox>
           </div>

           {/* ── WAITLIST USERS & PRO ACCESS LIST ── */}
           <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
              {/* Waitlist Users */}
              <div className="space-y-6">
                 <div className="flex justify-between items-center">
                    <div className="space-y-2">
                       <h2 className="text-4xl font-serif font-bold text-ink tracking-tight flex items-center gap-4">
                          <ListChecks className="w-10 h-10 text-accent" />
                          Waitlist Users
                       </h2>
                       <p className="text-ink-3 font-bold uppercase tracking-widest text-[10px]">{waitlistUsers.length} Users Registered</p>
                    </div>
                 </div>
                 <Interactive3DBox className="group">
                    <div className="p-8">
                       {waitlistUsers.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
                             <Mail className="w-12 h-12 text-ink-4" />
                             <p className="text-ink-4 text-sm font-bold uppercase tracking-widest">No waitlist users yet</p>
                          </div>
                       ) : (
                          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                             {waitlistUsers.map((u) => (
                               <div key={u.id} className="p-4 bg-bg/50 border border-border-strong rounded-2xl hover:bg-bg transition-all">
                                  <div className="flex items-center gap-4">
                                     <div className="w-10 h-10 rounded-xl bg-white border border-border-strong flex items-center justify-center font-bold text-ink-3 text-sm">
                                        {u.email[0].toUpperCase()}
                                     </div>
                                     <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-ink truncate">{u.email}</p>
                                        <p className="text-[10px] text-ink-3 mt-0.5">{new Date(u.created_at).toLocaleDateString()}</p>
                                     </div>
                                     <Mail className="w-4 h-4 text-ink-4 flex-shrink-0" />
                                  </div>
                               </div>
                             ))}
                          </div>
                       )}
                       <div className="mt-6 pt-5 border-t border-border-strong flex items-center gap-3">
                          <div className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
                          <span className="text-[9px] font-bold text-ink-3 uppercase tracking-widest">Live Waitlist Feed</span>
                       </div>
                    </div>
                 </Interactive3DBox>
              </div>

              {/* Pro Access List */}
              <div className="space-y-6">
                 <div className="flex justify-between items-center">
                    <div className="space-y-2">
                       <h2 className="text-4xl font-serif font-bold text-ink tracking-tight flex items-center gap-4">
                          <UserCheck className="w-10 h-10 text-accent" />
                          Pro Access List
                       </h2>
                       <p className="text-ink-3 font-bold uppercase tracking-widest text-[10px]">{proAccessUsers.length} Code Redemptions</p>
                    </div>
                 </div>
                 <Interactive3DBox className="group">
                    <div className="p-8">
                       {proAccessUsers.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
                             <Crown className="w-12 h-12 text-ink-4" />
                             <p className="text-ink-4 text-sm font-bold uppercase tracking-widest">No redemptions yet</p>
                          </div>
                       ) : (
                          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                             {proAccessUsers.map((u) => (
                               <div key={u.id} className="p-4 bg-bg/50 border border-border-strong rounded-2xl hover:bg-bg transition-all">
                                  <div className="flex items-center gap-4">
                                     <div className="w-10 h-10 rounded-xl bg-accent/5 border border-accent/10 flex items-center justify-center font-bold text-accent text-sm">
                                        <Crown className="w-4 h-4" />
                                     </div>
                                     <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-ink truncate">{u.email}</p>
                                        <p className="text-[10px] text-ink-3 mt-0.5">Code: <span className="font-mono text-accent">{u.code_used}</span> · {new Date(u.granted_at).toLocaleDateString()}</p>
                                     </div>
                                     <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                                  </div>
                               </div>
                             ))}
                          </div>
                       )}
                       <div className="mt-6 pt-5 border-t border-border-strong flex items-center gap-3">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                          <span className="text-[9px] font-bold text-ink-3 uppercase tracking-widest">Permanent Pro Access Records</span>
                       </div>
                    </div>
                 </Interactive3DBox>
              </div>
           </div>

           <div className="grid grid-cols-1 xl:grid-cols-12 gap-12 items-start">
              {/* Database Console */}
              <div className="xl:col-span-8 space-y-10">
                 <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                    <div className="space-y-2">
                       <h2 className="text-4xl font-serif font-bold text-ink tracking-tight flex items-center gap-4">
                          <Database className="w-10 h-10 text-accent" />
                          Registry
                       </h2>
                       <p className="text-ink-3 font-bold uppercase tracking-widest text-[10px]">Management of Authorized Nodes</p>
                    </div>
                    
                    <button 
                       onClick={() => setIsAdding(!isAdding)}
                       className="bg-accent text-white px-8 py-4 rounded-2xl flex items-center gap-3 hover:bg-accent/90 transition-all shadow-sm active:scale-95"
                    >
                       <Plus className="w-4 h-4" />
                       <span className="font-bold text-xs uppercase tracking-widest">Provision New Node</span>
                    </button>
                 </div>

                 {isAdding && (
                    <form onSubmit={handleAddUser} className="bg-white border border-border-strong p-8 rounded-[30px] flex flex-col md:flex-row gap-4 shadow-sm animate-in slide-in-from-top-4 duration-300">
                       <div className="flex-1 relative">
                          <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-ink-3 w-4 h-4" />
                          <input 
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            placeholder="Input account email..."
                            className="w-full bg-bg border border-border-strong rounded-xl py-4 pl-14 pr-6 text-sm font-medium text-ink outline-none focus:border-accent transition-all"
                            required
                          />
                       </div>
                       <button type="submit" className="bg-accent text-white px-10 py-4 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-accent/90 transition-all shadow-sm">
                          Authorize Access
                       </button>
                    </form>
                 )}

                 {/* Table Box */}
                 <div className="bg-white border border-border-strong rounded-[40px] overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                       <table className="w-full text-left border-collapse">
                          <thead>
                             <tr className="bg-bg border-b border-border-strong">
                                <th className="px-10 py-8 text-[10px] font-bold uppercase tracking-widest text-ink-2">Identity</th>
                                <th className="px-10 py-8 text-[10px] font-bold uppercase tracking-widest text-ink-2">Access Level</th>
                                <th className="px-10 py-8 text-[10px] font-bold uppercase tracking-widest text-ink-2">Status</th>
                                <th className="px-10 py-8 text-[10px] font-bold uppercase tracking-widest text-ink-2 text-right">Actions</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-border-strong">
                             {filteredSubscriptions.map((s) => (
                               <tr key={s.id} className="hover:bg-bg/30 transition-all">
                                  <td className="px-10 py-8">
                                     <div className="flex items-center gap-5">
                                        <div className="w-12 h-12 rounded-xl bg-bg border border-border-strong flex items-center justify-center font-bold text-ink-3 text-sm">
                                           {s.email[0].toUpperCase()}
                                        </div>
                                        <div>
                                           <p className="text-base font-bold text-ink">{s.email}</p>
                                           <span className="text-[10px] font-bold text-ink-3 uppercase tracking-widest">Verified Sector</span>
                                        </div>
                                     </div>
                                  </td>
                                  <td className="px-10 py-8">
                                     <div className={cn(
                                       "inline-flex items-center gap-2.5 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest border",
                                       isActuallyPro(s) 
                                         ? "bg-accent/10 border-accent/20 text-accent" 
                                         : "bg-bg border-border-strong text-ink-3"
                                     )}>
                                        {isActuallyPro(s) ? <Zap className="w-3.5 h-3.5" /> : <Monitor className="w-3.5 h-3.5" />}
                                        {isActuallyPro(s) ? 'Elite Access' : 'Standard'}
                                     </div>
                                  </td>
                                  <td className="px-10 py-8">
                                     <div className="flex items-center gap-2">
                                        <div className={cn("w-2 h-2 rounded-full", isActuallyPro(s) ? "bg-accent" : "bg-ink-4")} />
                                        <span className="text-[10px] font-bold text-ink-3 uppercase tracking-widest">Active</span>
                                     </div>
                                  </td>
                                  <td className="px-10 py-8 text-right">
                                     <div className="flex items-center justify-end gap-5">
                                        <button 
                                           onClick={() => handleTogglePro(s.email, s.plan)}
                                           className={cn(
                                             "px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all active:scale-95",
                                             s.plan === 'pro'
                                               ? "bg-stone-100 border-border-strong text-ink-2 hover:bg-stone-200"
                                               : "bg-accent text-white hover:bg-accent/90"
                                           )}
                                        >
                                           {s.plan === 'pro' ? 'Revoke Elite' : 'Grant Elite'}
                                        </button>
                                        <button 
                                           onClick={() => handleDeleteUser(s.email)}
                                           className="p-2.5 text-ink-4 hover:text-red-600 transition-colors"
                                        >
                                           <Trash2 className="w-5 h-5" />
                                        </button>
                                     </div>
                                  </td>
                               </tr>
                             ))}
                          </tbody>
                       </table>
                    </div>

                    {/* Matrix Controller Footer */}
                    <div className="px-10 py-8 bg-bg border-t border-border-strong flex flex-col md:flex-row items-center justify-between gap-8">
                       <p className="text-[10px] font-bold text-ink-3 uppercase tracking-widest">{filteredSubscriptions.length} System Nodes Identified</p>
                       <div className="flex gap-3">
                          <button className="p-4 border border-border-strong rounded-xl text-ink-3 hover:text-accent transition-all"><ArrowLeft className="w-4 h-4" /></button>
                          <button className="px-6 py-4 border border-border-strong rounded-xl text-ink-3 hover:text-accent transition-all flex items-center gap-3 group">
                             <span className="text-[10px] font-bold uppercase tracking-widest">Next Sector</span>
                             <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </button>
                       </div>
                    </div>
                 </div>
              </div>

              {/* Session History Sidebar */}
              <div className="xl:col-span-4 space-y-10">
                 <div className="flex justify-between items-center gap-6">
                    <div className="space-y-2">
                       <h2 className="text-4xl font-serif font-bold text-ink tracking-tight flex items-center gap-4">
                          <Radar className="w-10 h-10 text-accent" />
                          Logs
                       </h2>
                       <p className="text-ink-3 font-bold uppercase tracking-widest text-[10px]">Temporal Analysis</p>
                    </div>
                    <ActivityIcon className="w-6 h-6 text-ink-4" />
                 </div>

                 <Interactive3DBox className="group">
                    <div className="p-8">
                       <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                          {recentLogins.map((user) => (
                            <div key={user.id} className="p-4 bg-bg/50 border border-border-strong rounded-2xl hover:bg-bg transition-all">
                               <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 rounded-xl bg-white border border-border-strong flex items-center justify-center font-bold text-ink-3 text-sm">
                                     {user.email[0].toUpperCase()}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                     <p className="text-xs font-bold text-ink truncate">{user.email}</p>
                                     <p className="text-[10px] text-ink-3 mt-0.5">{new Date(user.created_at).toLocaleDateString()}</p>
                                  </div>
                                  <div className="text-right">
                                     <p className="text-xs font-bold text-accent">{new Date(user.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                     <span className="text-[8px] font-bold text-ink-4 uppercase tracking-tighter">SECURED</span>
                                  </div>
                               </div>
                            </div>
                          ))}
                       </div>

                       <div className="mt-8 pt-6 border-t border-border-strong">
                          <div className="flex items-center gap-3">
                             <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                             <span className="text-[9px] font-bold text-ink-3 uppercase tracking-widest">Monitoring Nodes</span>
                          </div>
                       </div>
                    </div>
                 </Interactive3DBox>
              </div>
           </div>
        </div>

      </main>

      {/* Industrial Grade Footer */}
      <footer className="mt-40 border-t border-border-strong py-16 px-12 flex flex-col md:flex-row items-center justify-between gap-10 bg-white shadow-sm">
         <div className="flex items-center gap-8">
            <div className="w-12 h-12 bg-bg border border-border-strong rounded-2xl flex items-center justify-center">
               <Cpu className="w-6 h-6 text-accent" />
            </div>
            <div>
               <p className="text-sm font-bold text-ink tracking-tight">JARVIS OS v1.0.0</p>
               <p className="text-xs font-bold text-ink-3 uppercase tracking-widest mt-1">Loyal by choice · Sector 7G</p>
            </div>
         </div>
         <div className="flex items-center gap-12">
            <div className="flex items-center gap-4">
               <div className="w-2 h-2 bg-green-500 rounded-full" />
               <span className="text-sm font-bold text-ink tracking-tight">Neural Link Optimized</span>
            </div>
            <div className="px-6 py-2 border border-border-strong rounded-full text-xs font-bold text-ink-3 uppercase tracking-widest">
               © 2026 JARVIS Systems · Built for Mr. Nawfat
            </div>
         </div>
      </footer>

      {/* Global Style Injector */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(34, 211, 238, 0.01);
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
        @keyframes reverse-spin {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 15s linear infinite;
        }
        .animate-reverse-spin {
          animation: reverse-spin 10s linear infinite;
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .animate-shimmer {
          background: linear-gradient(90deg, transparent, rgba(34, 211, 238, 0.1), transparent);
          background-size: 200% 100%;
          animation: shimmer 4s infinite linear;
        }
        .perspective-2000 {
          perspective: 2000px;
        }
        .transform-gpu {
          transform-style: preserve-3d;
          transition: transform 0.7s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .group:hover .transform-gpu {
          transform: rotateY(-5deg) rotateX(2deg) translateZ(20px);
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.1; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(1.05); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
