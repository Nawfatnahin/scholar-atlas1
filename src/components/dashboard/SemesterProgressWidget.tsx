"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { format, addDays, isBefore, isAfter, startOfDay, differenceInWeeks } from "date-fns";

interface UserSettings {
  semester_start_date: string;
  semester_total_weeks: number;
  target_cgpa: number;
}

interface Subject {
  id: string;
  name: string;
  color?: string;
  color_tag?: string;
  attended_classes: number;
  total_classes: number;
}

const COLOR_MAP: Record<string, string> = {
  blue: "#3b82f6",
  green: "#22c55e",
  amber: "#f59e0b",
  red: "#ef4444",
  violet: "#8b5cf6",
  rose: "#f43f5e",
  orange: "#f97316",
  stone: "#78716c",
};

interface Task {
  id: string;
  title: string;
  due_date: string;
  status: string;
  subject_id: string;
}

interface CGPAEntry {
  cgpa: number;
}

export default function SemesterProgressWidget() {
  const supabase = createClient();
  const [userName, setUserName] = useState("Student");
  
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [loadingCGPA, setLoadingCGPA] = useState(true);

  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [latestCGPA, setLatestCGPA] = useState<number | null>(null);

  const [errorSettings, setErrorSettings] = useState(false);
  const [errorSubjects, setErrorSubjects] = useState(false);
  const [errorTasks, setErrorTasks] = useState(false);
  const [errorCGPA, setErrorCGPA] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserName(user.user_metadata?.display_name || user.email?.split('@')[0] || "Student");
      }

      const today = startOfDay(new Date());
      const todayIso = format(today, "yyyy-MM-dd'T'HH:mm:ssxxx");
      const nextWeekIso = format(addDays(today, 7), "yyyy-MM-dd'T'HH:mm:ssxxx");

      Promise.all([
        // 1. User settings
        supabase.from('user_settings').select('semester_start_date, semester_total_weeks, target_cgpa').single()
          .then(({ data, error }) => {
            if (error) setErrorSettings(true);
            else setSettings(data);
            setLoadingSettings(false);
          }),

        // 2. Subjects list
        supabase.from('subjects').select('id, name, color, color_tag, attended_classes, total_classes')
          .then(({ data, error }) => {
            if (error) setErrorSubjects(true);
            else setSubjects(data || []);
            setLoadingSubjects(false);
          }),

        // 3. Tasks
        supabase.from('tasks')
          .select('id, title, due_date, status, subject_id')
          .or(`due_date.lte.${nextWeekIso},and(status.neq.done,due_date.lt.${todayIso})`)
          .then(({ data, error }) => {
            if (error) setErrorTasks(true);
            else setTasks(data || []);
            setLoadingTasks(false);
          }),

        // 4. Latest CGPA entry
        supabase.from('cgpa_entries').select('cgpa').order('created_at', { ascending: false }).limit(1).single()
          .then(({ data, error }) => {
            if (error) setErrorCGPA(true);
            else if (data) setLatestCGPA(data.cgpa);
            setLoadingCGPA(false);
          })
      ]);
    }

    fetchData();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Good morning";
    if (hour >= 12 && hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const updateTaskStatus = async (taskId: string) => {
    // Optimistic update
    setTasks(prev => prev.filter(t => t.id !== taskId));
    await supabase.from('tasks').update({ status: 'done' }).eq('id', taskId);
  };

  const getDueDateLabel = (dueDate: string) => {
    const date = startOfDay(new Date(dueDate));
    const today = startOfDay(new Date());
    
    if (isBefore(date, today)) return <span className="text-red-600 font-bold">Overdue</span>;
    if (format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')) return "Today";
    if (format(date, 'yyyy-MM-dd') === format(addDays(today, 1), 'yyyy-MM-dd')) return "Tomorrow";
    
    const diff = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return `in ${diff} days`;
  };

  const avgAttendance = subjects.length > 0 
    ? (subjects.reduce((acc, s) => acc + (s.attended_classes / (s.total_classes || 1)), 0) / subjects.length) * 100 
    : null;

  const attendanceColor = (val: number) => {
    if (val >= 75) return "text-green-600";
    if (val >= 60) return "text-amber-600";
    return "text-red-600";
  };

  const attendanceBg = (val: number) => {
    if (val >= 75) return "bg-green-600";
    if (val >= 60) return "bg-amber-600";
    return "bg-red-600";
  };

  const overdueTasksCount = tasks.filter(t => t.status !== 'done' && isBefore(new Date(t.due_date), startOfDay(new Date()))).length;
  const tasksDueThisWeekCount = tasks.filter(t => t.status !== 'done' && !isBefore(new Date(t.due_date), startOfDay(new Date())) && !isAfter(new Date(t.due_date), addDays(startOfDay(new Date()), 7))).length;

  const atRiskIssues = [];
  subjects.forEach(s => {
    const pct = (s.attended_classes / (s.total_classes || 1)) * 100;
    if (pct < 75) atRiskIssues.push({ label: `${s.name} — attendance at ${Math.round(pct)}%`, link: "/dashboard/attendance", critical: true });
  });
  if (overdueTasksCount > 0) atRiskIssues.push({ label: `${overdueTasksCount} overdue tasks`, link: "/dashboard/tasks", critical: true });
  if (latestCGPA !== null && settings?.target_cgpa && latestCGPA < settings.target_cgpa) {
    atRiskIssues.push({ label: `CGPA ${latestCGPA.toFixed(2)} below target ${settings.target_cgpa.toFixed(2)}`, link: "/dashboard/cgpa", critical: true });
  }

  const sortedSubjects = [...subjects].sort((a, b) => {
    const aPct = (a.attended_classes / (a.total_classes || 1)) * 100;
    const bPct = (b.attended_classes / (b.total_classes || 1)) * 100;
    if (aPct < 75 && bPct >= 75) return -1;
    if (aPct >= 75 && bPct < 75) return 1;
    return 0;
  }).slice(0, 4);

  const upcomingTasks = tasks
    .filter(t => t.status !== 'done' && !isAfter(new Date(t.due_date), addDays(startOfDay(new Date()), 7)))
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
    .slice(0, 5);

  const Skeleton = () => <div className="h-full w-full bg-stone-200 animate-pulse rounded-xl min-h-[100px]" />;

  const semesterProgress = () => {
    if (!settings?.semester_start_date || !settings?.semester_total_weeks) return null;
    const start = new Date(settings.semester_start_date);
    const today = new Date();
    const currentWeek = differenceInWeeks(today, start) + 1;
    const totalWeeks = settings.semester_total_weeks;
    const percent = Math.min(100, Math.max(0, Math.round((currentWeek / totalWeeks) * 100)));
    return { currentWeek, totalWeeks, percent };
  };

  const progress = semesterProgress();

  return (
    <div className="w-full bg-white dark:bg-stone-900 border border-border-strong rounded-3xl p-6 mb-8 relative overflow-hidden">
      {/* Decorative Brand Accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 blur-3xl rounded-full -mr-16 -mt-16 pointer-events-none" />

      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-black text-ink">
            {getGreeting()}, <span className="text-accent">{userName}</span>
          </h2>
        </div>
        <div className="text-sm font-bold text-ink-2">
          {format(new Date(), "EEEE, d MMMM")}
        </div>
      </div>

      {/* Semester Progress Bar */}
      <div className="mb-8">
        {loadingSettings ? (
          <div className="h-8 w-full bg-stone-100 animate-pulse rounded-lg" />
        ) : errorSettings || !progress ? (
          <div className="flex items-center gap-2 text-sm font-medium text-ink-3">
            <span>Configure your semester in Settings to see progress</span>
            <Link href="/dashboard/settings" className="text-accent font-bold hover:underline">Settings</Link>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-ink-2 uppercase tracking-wider">
              <span>Week {progress.currentWeek} of {progress.totalWeeks}</span>
              <span>{progress.percent}% complete</span>
            </div>
            <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-accent/70 to-accent rounded-full transition-none"
                style={{ width: `${progress.percent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-stone-100 dark:bg-stone-800 relative">
        {/* Pseudo-borders for grid dividers */}
        <div className="bg-white dark:bg-stone-900 p-4 md:pr-6 md:pb-6 relative overflow-hidden group">
          <p className="text-[11px] font-bold text-ink-3 uppercase tracking-[0.08em] mb-4">Quick Stats</p>
          <div className="grid grid-cols-2 gap-3">
            {/* Chip 1: CGPA */}
            <div className="bg-white dark:bg-stone-800 border border-border-strong p-3 rounded-xl">
              <p className="text-[10px] text-ink-3 mb-1">Current CGPA</p>
              <p className="text-[22px] font-black text-ink">
                {loadingCGPA ? "..." : errorCGPA || latestCGPA === null ? "—" : latestCGPA.toFixed(2)}
              </p>
            </div>
            {/* Chip 2: Attendance */}
            <div className="bg-white dark:bg-stone-800 border border-border-strong p-3 rounded-xl">
              <p className="text-[10px] text-ink-3 mb-1">Avg Attendance</p>
              <p className={`text-[22px] font-black ${avgAttendance !== null ? attendanceColor(avgAttendance) : "text-ink"}`}>
                {loadingSubjects ? "..." : errorSubjects || avgAttendance === null ? "—" : `${Math.round(avgAttendance)}%`}
              </p>
            </div>
            {/* Chip 3: Due This Week */}
            <div className="bg-white dark:bg-stone-800 border border-border-strong p-3 rounded-xl">
              <p className="text-[10px] text-ink-3 mb-1">Due This Week</p>
              <p className="text-[22px] font-black text-ink">
                {loadingTasks ? "..." : errorTasks ? "—" : tasksDueThisWeekCount}
              </p>
              {!loadingTasks && overdueTasksCount > 0 && (
                <p className="text-[10px] font-bold text-red-600 mt-0.5">{overdueTasksCount} overdue</p>
              )}
            </div>
            {/* Chip 4: Subjects */}
            <div className="bg-white dark:bg-stone-800 border border-border-strong p-3 rounded-xl">
              <p className="text-[10px] text-ink-3 mb-1">Subjects</p>
              <p className="text-[22px] font-black text-ink">
                {loadingSubjects ? "..." : errorSubjects ? "—" : subjects.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-stone-900 p-4 md:pl-6 md:pb-6">
          <p className="text-[11px] font-bold text-ink-3 uppercase tracking-[0.08em] mb-4">Upcoming</p>
          {loadingTasks ? <Skeleton /> : errorTasks ? <p className="text-sm text-ink-3">Could not load</p> : upcomingTasks.length === 0 ? (
            <p className="text-sm text-ink-3 text-center py-8 italic">No deadlines this week</p>
          ) : (
            <div className="space-y-2">
              {upcomingTasks.map(task => (
                <div key={task.id} className="flex items-center justify-between group/row">
                  <div className="flex items-center gap-3 border-l-[3px] pl-3" style={{ borderLeftColor: task.subject_id ? (COLOR_MAP[subjects.find(s => s.id === task.subject_id)?.color_tag || ''] || subjects.find(s => s.id === task.subject_id)?.color || '#e5e7eb') : '#e5e7eb' }}>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-ink truncate max-w-[150px] sm:max-w-[200px]">{task.title.substring(0, 36)}</span>
                      <span className="text-[10px] font-medium text-ink-3 uppercase tracking-wider">{getDueDateLabel(task.due_date)}</span>
                    </div>
                  </div>
                  <input 
                    type="checkbox" 
                    onChange={() => updateTaskStatus(task.id)}
                    className="w-4 h-4 rounded border-stone-300 text-accent focus:ring-accent cursor-pointer" 
                  />
                </div>
              ))}
            </div>
          )}
          <div className="mt-4 pt-4 border-t border-stone-50">
            <Link href="/dashboard/tasks" className="text-[11px] font-black text-accent uppercase tracking-widest hover:underline flex items-center gap-1">
              View calendar →
            </Link>
          </div>
        </div>

        <div className="bg-white dark:bg-stone-900 p-4 md:pr-6 md:pt-6">
          <p className="text-[11px] font-bold text-ink-3 uppercase tracking-[0.08em] mb-4">Subjects</p>
          {loadingSubjects ? <Skeleton /> : errorSubjects ? <p className="text-sm text-ink-3">Could not load</p> : (
            <div className="space-y-3">
              {sortedSubjects.map(s => {
                const pct = (s.attended_classes / (s.total_classes || 1)) * 100;
                return (
                  <Link href="/dashboard/attendance" key={s.id} className={`flex items-center justify-between p-2 rounded-xl hover:bg-stone-50 transition-colors ${pct < 75 ? 'border-l-2 border-red-500' : ''}`}>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLOR_MAP[s.color_tag || ''] || s.color || '#92400e' }} />
                      <span className="text-sm font-bold text-ink truncate max-w-[120px]">{s.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-[60px] h-1 bg-stone-100 rounded-full overflow-hidden">
                        <div className={`h-full ${attendanceBg(pct)}`} style={{ width: `${pct}%` }} />
                      </div>
                      <span className={`text-xs font-black min-w-[30px] text-right ${attendanceColor(pct)}`}>
                        {Math.round(pct)}%
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
          <div className="mt-4 pt-4 border-t border-stone-50">
            <Link href="/dashboard/attendance" className="text-[11px] font-black text-accent uppercase tracking-widest hover:underline">
              View all →
            </Link>
          </div>
        </div>

        <div className="bg-white dark:bg-stone-900 p-4 md:pl-6 md:pt-6">
          <p className="text-[11px] font-bold text-ink-3 uppercase tracking-[0.08em] mb-4">Action Needed</p>
          {loadingSettings || loadingSubjects || loadingTasks || loadingCGPA ? <Skeleton /> : atRiskIssues.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-green-600/70">
              <CheckCircle2 size={24} className="mb-2" />
              <p className="text-[11px] font-bold uppercase tracking-widest">All good — nothing urgent</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {atRiskIssues.slice(0, 4).map((issue, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-ink-3 mt-1">•</span>
                  <Link href={issue.link} className={`text-xs font-medium hover:underline ${issue.critical ? 'text-red-600' : 'text-ink-2'}`}>
                    {issue.label}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <style jsx>{`
        @media (min-width: 768px) {
          .grid > div:nth-child(1)::after {
            content: '';
            position: absolute;
            right: 0;
            top: 1.5rem;
            bottom: 1.5rem;
            width: 0.5px;
            background: rgba(0,0,0,0.08);
          }
          .grid > div:nth-child(1)::before {
            content: '';
            position: absolute;
            left: 1.5rem;
            right: 1.5rem;
            bottom: 0;
            height: 0.5px;
            background: rgba(0,0,0,0.08);
          }
          .grid > div:nth-child(2)::after {
            content: '';
            position: absolute;
            left: 1.5rem;
            right: 1.5rem;
            bottom: 0;
            height: 0.5px;
            background: rgba(0,0,0,0.08);
          }
          .grid > div:nth-child(3)::after {
            content: '';
            position: absolute;
            right: 0;
            top: 1.5rem;
            bottom: 1.5rem;
            width: 0.5px;
            background: rgba(0,0,0,0.08);
          }
        }
        @media (max-width: 767px) {
          .grid > div:not(:last-child) {
            border-bottom: 0.5px solid rgba(0,0,0,0.08);
          }
        }
      `}</style>
    </div>
  );
}
