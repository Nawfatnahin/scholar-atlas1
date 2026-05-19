export const runtime = 'edge';
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { FileText, CalendarCheck, LayoutList, Home, ArrowRight, BookOpen, Clock, Crown } from "lucide-react";
import DashboardGreeting from "@/components/dashboard/DashboardGreeting";
import TodaysClasses from "@/components/dashboard/TodaysClasses";
import SignOutButton from "@/components/dashboard/SignOutButton";
import UserBadge from "@/components/dashboard/UserBadge";
import { getTodaysSessions } from "./attendance/actions";
import { ADMIN_EMAILS } from "@/lib/constants";

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data?.user;

  const isAdmin = user?.email ? ADMIN_EMAILS.includes(user.email) : false;

  const displayName = user ? (user.user_metadata?.display_name || user.email?.split('@')[0] || "Student") : "Guest";

  interface SubjectSummary {
    id: string;
    name: string;
    target_percentage: number;
    class_sessions: { status: string }[];
  }

  interface TaskSummary {
    id: string;
  }

  interface ClassSession {
    id: string;
    status: 'present' | 'absent' | 'unexcused' | 'cancelled' | 'upcoming' | 'holiday';
    date: string;
    subjects: {
      name: string;
      course_code: string | null;
    } | null;
  }


  // Fetch summary data for the dashboard with error handling
  let subjects: SubjectSummary[] = [];
  let tasks: TaskSummary[] = [];
  let todaysSessions: ClassSession[] = [];

  if (user) {
    try {
      const [subjectsRes, tasksRes, todaysSessionsRes] = await Promise.all([
        supabase.from('subjects').select('id, name, target_percentage, class_sessions(status)').in('class_sessions.status', ['present', 'absent']),
        supabase.from('tasks').select('id').eq('status', 'todo'),
        getTodaysSessions(),
      ]);

      if (subjectsRes.error) console.error("Error fetching subjects:", subjectsRes.error);
      if (tasksRes.error) console.error("Error fetching tasks:", tasksRes.error);

      subjects = (subjectsRes.data as unknown as SubjectSummary[]) || [];
      tasks = tasksRes.data || [];
      todaysSessions = (todaysSessionsRes as unknown as ClassSession[]) || [];
    } catch (err) {
      console.error("Critical dashboard fetch error:", err);
    }
  }

  const stats = subjects.map(s => {
    const sessions = s.class_sessions || [];
    const logged = sessions.filter(l => l.status === 'present' || l.status === 'absent');
    const present = logged.filter(l => l.status === 'present').length;
    const total = logged.length;
    
    return { 
      name: s.name, 
      percentage: total === 0 ? 0 : Math.round((present / total) * 100),
      target: s.target_percentage || 75
    };
  });

  const lowAttendance = stats.filter(s => s.percentage < s.target);

  return (
    <div className="min-h-screen bg-bg flex flex-col font-body">
      <header className="bg-bg/95 backdrop-blur-xl border-b border-[#92400e]/10 py-3 sm:py-6 sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-8 flex justify-between items-center gap-4">
          <div className="flex items-center gap-3 sm:gap-6">
            <Link href="/" className="p-2.5 sm:p-3 rounded-2xl bg-[#92400e] text-white hover:scale-105 shadow-lg shadow-[#92400e]/20 transition-all flex-shrink-0">
              <Home className="w-5 h-5 sm:w-6 h-6" />
            </Link>
            <div className="flex items-center gap-4 sm:gap-8">
              <h1 className="text-xl sm:text-2xl font-black text-[#92400e] tracking-tight hidden xs:block uppercase tracking-[0.1em]">Dashboard</h1>
              {isAdmin && (
                <Link 
                  href="/dashboard/admin" 
                  className="group relative flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 shadow-[0_4px_0_rgb(180,83,9)] hover:shadow-[0_6px_0_rgb(180,83,9)] hover:-translate-y-0.5 active:shadow-none active:translate-y-1 transition-all border border-amber-300/30"
                >
                  <Crown className="w-3.5 h-3.5 sm:w-4 h-4 text-white drop-shadow-md" />
                  <span className="text-white font-black text-[10px] sm:text-xs uppercase tracking-widest drop-shadow-sm">Admin</span>
                  <div className="absolute -inset-1 bg-amber-400/20 blur opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
                </Link>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-3 sm:gap-8">
            {user ? (
              <div className="flex items-center gap-3">
                <UserBadge email={user.email || ""} />
                <SignOutButton />
              </div>
            ) : (
              <Link href="/login" className="flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2.5 sm:py-3 rounded-2xl text-xs sm:text-sm font-bold text-white bg-[#92400e] hover:bg-[#78350f] hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-95 shadow-lg shadow-[#92400e]/20 flex-shrink-0">
                <span>Sign in</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 py-10 sm:py-20 px-4 sm:px-8">
        <div className="max-w-[1600px] mx-auto">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-10 sm:gap-12 mb-12 sm:mb-20">
            <DashboardGreeting initialName={displayName} />
            
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">
              <div className="bg-white/60 backdrop-blur-xl px-6 md:px-12 py-6 md:py-10 rounded-3xl md:rounded-[50px] border border-border-strong shadow-[0_20px_50px_rgba(0,0,0,0.04)] md:min-w-[240px] group hover:-translate-y-1 transition-transform border-[#92400e]/10">
                <p className="text-[10px] md:text-[12px] font-black text-blue-600 uppercase tracking-[0.2em] md:tracking-[0.25em] mb-2 md:mb-4 opacity-60">Pending Tasks</p>
                <p className="text-4xl md:text-7xl font-black text-blue-600 tracking-tighter">{tasks?.length || 0}</p>
              </div>
              <div className="bg-white/60 backdrop-blur-xl px-6 md:px-12 py-6 md:py-10 rounded-3xl md:rounded-[50px] border border-border-strong shadow-[0_20px_50px_rgba(0,0,0,0.04)] md:min-w-[240px] group hover:-translate-y-1 transition-transform border-[#92400e]/10">
                <p className="text-[10px] md:text-[12px] font-black text-red-600 uppercase tracking-[0.2em] md:tracking-[0.25em] mb-2 md:mb-4 opacity-60">Low Attendance</p>
                <p className="text-4xl md:text-7xl font-black text-red-600 tracking-tighter">{lowAttendance.length}</p>
              </div>
            </div>
          </div>

          <div className="mb-12">
            <TodaysClasses initialSessions={todaysSessions} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* PDF Tools */}
            <Link href="/tools/pdf" className="group relative bg-white/70 backdrop-blur-xl p-6 sm:p-10 rounded-[30px] sm:rounded-[50px] border border-border-strong shadow-sm hover:shadow-[0_40px_80px_rgba(146,64,14,0.08)] hover:-translate-y-2 transition-all duration-500 overflow-hidden">
              <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-amber-500/5 blur-[30px] sm:blur-[40px] rounded-full -mr-12 sm:-mr-16 -mt-12 sm:-mt-16 group-hover:bg-amber-500/10 transition-colors" />
              <div className="w-12 sm:w-16 h-12 sm:h-16 rounded-[18px] sm:rounded-[24px] bg-amber-100 flex items-center justify-center mb-6 sm:mb-8 shadow-inner shadow-amber-900/5 group-hover:scale-110 transition-transform">
                <FileText className="w-6 sm:w-8 h-6 sm:h-8 text-amber-700" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-ink mb-2 sm:mb-3 tracking-tight">PDF Toolkit</h3>
              <p className="text-ink-2 text-sm sm:text-base leading-relaxed mb-6 sm:mb-10 font-medium">Professional grade tools to merge, split and convert your lecture materials.</p>
              <div className="flex items-center gap-3 text-amber-700 font-black text-[12px] sm:text-sm uppercase tracking-widest">
                <span>Launch Tools</span>
                <ArrowRight className="w-4 sm:w-5 h-4 sm:h-5 group-hover:translate-x-2 transition-transform" />
              </div>
            </Link>

            {/* Attendance */}
            <Link href={user ? "/dashboard/attendance" : "/login"} className="group relative bg-white/70 backdrop-blur-xl p-6 sm:p-10 rounded-[30px] sm:rounded-[50px] border border-border-strong shadow-sm hover:shadow-[0_40px_80px_rgba(22,163,74,0.08)] hover:-translate-y-2 transition-all duration-500 overflow-hidden">
              <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-green-500/5 blur-[30px] sm:blur-[40px] rounded-full -mr-12 sm:-mr-16 -mt-12 sm:-mt-16 group-hover:bg-green-500/10 transition-colors" />
              {!user && (
                <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] z-10 flex items-center justify-center">
                  <div className="bg-[#92400e] text-white px-6 py-2 rounded-full font-black text-xs uppercase tracking-widest shadow-lg">Login Required</div>
                </div>
              )}
              <div className="w-12 sm:w-16 h-12 sm:h-16 rounded-[18px] sm:rounded-[24px] bg-green-100 flex items-center justify-center mb-6 sm:mb-8 shadow-inner shadow-green-900/5 group-hover:scale-110 transition-transform">
                <CalendarCheck className="w-6 sm:w-8 h-6 sm:h-8 text-green-700" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-ink mb-2 sm:mb-3 tracking-tight">Attendance</h3>
              <p className="text-ink-2 text-sm sm:text-base leading-relaxed mb-6 sm:mb-10 font-medium">Smart monitoring system for your classes with real time target forecasting.</p>
              <div className="flex items-center gap-3 text-green-700 font-black text-[12px] sm:text-sm uppercase tracking-widest">
                <span>{user ? "View Stats" : "Login to View"}</span>
                <ArrowRight className="w-4 sm:w-5 h-4 sm:h-5 group-hover:translate-x-2 transition-transform" />
              </div>
            </Link>

            {/* Task Tracker */}
            <Link href={user ? "/dashboard/tasks" : "/login"} className="group relative bg-white/70 backdrop-blur-xl p-6 sm:p-10 rounded-[30px] sm:rounded-[50px] border border-border-strong shadow-sm hover:shadow-[0_40px_80px_rgba(37,99,235,0.08)] hover:-translate-y-2 transition-all duration-500 overflow-hidden">
              <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-blue-500/5 blur-[30px] sm:blur-[40px] rounded-full -mr-12 sm:-mr-16 -mt-12 sm:-mt-16 group-hover:bg-blue-500/10 transition-colors" />
              {!user && (
                <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] z-10 flex items-center justify-center">
                  <div className="bg-[#92400e] text-white px-6 py-2 rounded-full font-black text-xs uppercase tracking-widest shadow-lg">Login Required</div>
                </div>
              )}
              <div className="w-12 sm:w-16 h-12 sm:h-16 rounded-[18px] sm:rounded-[24px] bg-blue-100 flex items-center justify-center mb-6 sm:mb-8 shadow-inner shadow-blue-900/5 group-hover:scale-110 transition-transform">
                <LayoutList className="w-6 sm:w-8 h-6 sm:h-8 text-blue-700" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-ink mb-2 sm:mb-3 tracking-tight">Task Board</h3>
              <p className="text-ink-2 text-sm sm:text-base leading-relaxed mb-6 sm:mb-10 font-medium">High performance Kanban board to organize and crush your academic goals.</p>
              <div className="flex items-center gap-3 text-blue-700 font-black text-[12px] sm:text-sm uppercase tracking-widest">
                <span>{user ? "Manage Workflow" : "Login to Manage"}</span>
                <ArrowRight className="w-4 sm:w-5 h-4 sm:h-5 group-hover:translate-x-2 transition-transform" />
              </div>
            </Link>
          </div>

          <div className="mt-12 sm:mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10">
            <div className="bg-white/80 backdrop-blur-xl p-6 sm:p-10 rounded-[30px] sm:rounded-[50px] border border-border-strong shadow-[0_10px_30px_rgba(0,0,0,0.02)]">
              <div className="flex items-center justify-between mb-8 sm:mb-10">
                <h3 className="text-xl sm:text-2xl font-black text-ink tracking-tight flex items-center gap-3">
                  <BookOpen className="w-5 sm:w-6 h-5 sm:h-6 text-[#92400e]" />
                  Analytics Overview
                </h3>
                <span className="px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-[#92400e]/5 text-[#92400e] text-[9px] sm:text-[10px] font-black uppercase tracking-widest">Real time</span>
              </div>
              {stats.length > 0 ? (
                <div className="space-y-4 sm:space-y-6">
                  {stats.slice(0, 4).map((s, i) => (
                    <div key={i} className="flex items-center justify-between p-3 sm:p-4 rounded-2xl sm:rounded-3xl hover:bg-stone-50 transition-colors">
                      <span className="text-sm sm:text-base font-bold text-ink-2 truncate max-w-[140px] sm:max-w-none">{s.name}</span>
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="w-20 sm:w-32 h-1.5 sm:h-2 bg-stone-100 rounded-full overflow-hidden hidden xs:block">
                          <div className={`h-full ${s.percentage < 75 ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${s.percentage}%` }} />
                        </div>
                        <span className={`text-base sm:text-lg font-black min-w-[50px] sm:min-w-[60px] text-right ${s.percentage < 75 ? 'text-red-600' : 'text-green-600'}`}>
                          {s.percentage}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-10 text-center">
                  <p className="text-base sm:text-lg text-ink-3 font-medium">No active subjects detected.</p>
                  <Link href="/dashboard/attendance" className="text-[#92400e] font-black text-xs sm:text-sm uppercase tracking-widest hover:underline mt-4 inline-block">Initialize Tracker</Link>
                </div>
              )}
            </div>

            <div className="bg-white/80 backdrop-blur-xl p-6 sm:p-10 rounded-[30px] sm:rounded-[50px] border border-border-strong shadow-[0_10px_30px_rgba(0,0,0,0.02)]">
              <h3 className="text-xl sm:text-2xl font-black text-ink mb-8 sm:mb-10 tracking-tight flex items-center gap-3">
                <Clock className="w-5 sm:w-6 h-5 sm:h-6 text-[#92400e]" />
                Optimization Tips
              </h3>
              <ul className="space-y-4 sm:space-y-6">
                {[
                  "Consolidate lecture PDFs using the Merge tool to enable global keyword searching across all slides.",
                  "Maintain a buffer of at least 5% above your attendance targets to account for unforeseen emergencies.",
                  "Utilize priority tags on your Task Board to distinguish between minor homework and high stakes projects."
                ].map((tip, i) => (
                  <li key={i} className="flex gap-3 sm:gap-4 p-3 sm:p-4 rounded-2xl sm:rounded-3xl hover:bg-stone-50 transition-colors">
                    <span className="w-6 sm:w-8 h-6 sm:h-8 rounded-full bg-[#92400e]/10 text-[#92400e] flex items-center justify-center font-bold text-xs sm:text-sm shrink-0">{i+1}</span>
                    <p className="text-ink-3 text-sm sm:text-base leading-relaxed font-medium">{tip}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
