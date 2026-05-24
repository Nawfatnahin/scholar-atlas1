"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CheckCircle2, BarChart3, Clock, BookOpen, Zap, Award, Calendar, TrendingUp } from "lucide-react";
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

  const Skeleton = () => (
    <div className="h-[120px] w-full bg-white dark:bg-bg-surface/50 border border-border-strong/40 animate-pulse rounded-2xl flex items-center justify-center p-4 shadow-sm">
      <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider">Syncing dashboard data...</span>
    </div>
  );

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
    <div className="w-full bg-gradient-to-b from-bg-surface to-bg-surface/95 dark:from-bg-elevated dark:to-bg-surface border border-border-strong/60 rounded-[32px] p-6 mb-8 relative overflow-hidden shadow-[0_16px_40px_-10px_rgba(0,0,0,0.06)] dark:shadow-[0_24px_64px_-16px_rgba(0,0,0,0.4)] transition-all duration-500 hover:shadow-[0_20px_48px_-8px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_32px_80px_-12px_rgba(0,0,0,0.6)] group">
      {/* Decorative 3D Ambient Glowing Orbs */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-accent/15 via-accent/5 to-transparent blur-[80px] rounded-full -mr-24 -mt-24 pointer-events-none transition-all duration-700 group-hover:scale-110 group-hover:opacity-80" />
      <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-gradient-to-tr from-accent/10 via-transparent to-transparent blur-[80px] rounded-full pointer-events-none" />
      
      {/* 3D Glass Reflection Edge Highlight */}
      <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-accent/30 dark:via-accent/40 to-transparent pointer-events-none" />

      {/* Header */}
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div>
          <h2 className="text-2xl font-black text-text-primary">
            {getGreeting()}, <span className="text-accent">{userName}</span>
          </h2>
        </div>
        <div className="text-sm font-bold text-text-secondary">
          {format(new Date(), "EEEE, d MMMM")}
        </div>
      </div>

      {/* Semester Progress Bar */}
      {!loadingSettings && !errorSettings && progress && (
        <div className="mb-8 relative z-10">
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-text-secondary uppercase tracking-wider">
              <span>Week {progress.currentWeek} of {progress.totalWeeks}</span>
              <span>{progress.percent}% complete</span>
            </div>
            <div className="h-2 w-full bg-border-subtle rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-accent/70 to-accent rounded-full transition-none dark:opacity-85"
                style={{ width: `${progress.percent}%` }}
              />
            </div>
          </div>
        </div>
      )}
      {loadingSettings && (
        <div className="mb-8 relative z-10 animate-pulse">
          <div className="h-8 w-full bg-border-subtle rounded-lg" />
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
        {/* Quick Stats Card */}
        <div className="bg-white dark:bg-bg-surface/40 border border-border-strong/50 backdrop-blur-md p-5 rounded-2xl relative overflow-hidden group/card shadow-[0_8px_20px_-6px_rgba(0,0,0,0.03)] dark:shadow-[0_8px_20px_-6px_rgba(0,0,0,0.2)] hover:shadow-[0_16px_32px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_16px_32px_rgba(0,0,0,0.3)] hover:-translate-y-0.5 hover:border-border-strong/80 transition-all duration-300">
          <div className="flex items-center gap-2 mb-4">
            <span className="p-1.5 rounded-lg bg-accent/10 text-accent dark:bg-accent/20">
              <BarChart3 size={14} className="stroke-[2.5]" />
            </span>
            <p className="text-[11px] font-bold text-text-tertiary uppercase tracking-[0.08em]">Quick Stats</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {/* Chip 1: CGPA */}
            <div className="bg-bg-surface/90 dark:bg-bg-elevated/40 border border-border-strong/40 p-3.5 rounded-xl shadow-[inset_0_-2px_4px_rgba(0,0,0,0.02),0_2px_4px_rgba(0,0,0,0.01)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.02),0_4px_12px_rgba(0,0,0,0.2)] hover:scale-[1.03] hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between min-h-[95px] relative overflow-hidden group/tile border-l-4 border-l-amber-500">
              <div className="flex justify-between items-start">
                <p className="text-[10px] text-text-tertiary">Current CGPA</p>
                <Award size={14} className="text-amber-500 opacity-60 group-hover/tile:opacity-100 transition-opacity" />
              </div>
              <p className="text-[22px] font-black text-text-primary mt-2">
                {loadingCGPA ? "..." : errorCGPA || latestCGPA === null ? "—" : latestCGPA.toFixed(2)}
              </p>
            </div>
            {/* Chip 2: Attendance */}
            <div className={`bg-bg-surface/90 dark:bg-bg-elevated/40 border border-border-strong/40 p-3.5 rounded-xl shadow-[inset_0_-2px_4px_rgba(0,0,0,0.02),0_2px_4px_rgba(0,0,0,0.01)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.02),0_4px_12px_rgba(0,0,0,0.2)] hover:scale-[1.03] hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between min-h-[95px] relative overflow-hidden group/tile border-l-4 ${avgAttendance !== null ? (avgAttendance >= 75 ? 'border-l-green-500' : avgAttendance >= 60 ? 'border-l-amber-500' : 'border-l-red-500') : 'border-l-text-tertiary'}`}>
              <div className="flex justify-between items-start">
                <p className="text-[10px] text-text-tertiary">Avg Attendance</p>
                <TrendingUp size={14} className={`${avgAttendance !== null ? (avgAttendance >= 75 ? 'text-green-500' : avgAttendance >= 60 ? 'text-amber-500' : 'text-red-500') : 'text-text-tertiary'} opacity-60 group-hover/tile:opacity-100 transition-opacity`} />
              </div>
              <p className={`text-[22px] font-black mt-2 ${avgAttendance !== null ? attendanceColor(avgAttendance) : "text-text-primary"}`}>
                {loadingSubjects ? "..." : errorSubjects || avgAttendance === null ? "—" : `${Math.round(avgAttendance)}%`}
              </p>
            </div>
            {/* Chip 3: Due This Week */}
            <div className="bg-bg-surface/90 dark:bg-bg-elevated/40 border border-border-strong/40 p-3.5 rounded-xl shadow-[inset_0_-2px_4px_rgba(0,0,0,0.02),0_2px_4px_rgba(0,0,0,0.01)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.02),0_4px_12px_rgba(0,0,0,0.2)] hover:scale-[1.03] hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between min-h-[95px] relative overflow-hidden group/tile border-l-4 border-l-red-500">
              <div className="flex justify-between items-start">
                <p className="text-[10px] text-text-tertiary">Due This Week</p>
                <Clock size={14} className="text-red-500 opacity-60 group-hover/tile:opacity-100 transition-opacity" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <p className="text-[22px] font-black text-text-primary">
                  {loadingTasks ? "..." : errorTasks ? "—" : tasksDueThisWeekCount}
                </p>
                {!loadingTasks && overdueTasksCount > 0 && (
                  <span className="text-[9px] font-black uppercase tracking-wider bg-red-500/10 text-red-600 dark:text-red-400 px-1.5 py-0.5 rounded border border-red-500/20 animate-pulse">
                    {overdueTasksCount} Overdue
                  </span>
                )}
              </div>
            </div>
            {/* Chip 4: Subjects */}
            <div className="bg-bg-surface/90 dark:bg-bg-elevated/40 border border-border-strong/40 p-3.5 rounded-xl shadow-[inset_0_-2px_4px_rgba(0,0,0,0.02),0_2px_4px_rgba(0,0,0,0.01)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.02),0_4px_12px_rgba(0,0,0,0.2)] hover:scale-[1.03] hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between min-h-[95px] relative overflow-hidden group/tile border-l-4 border-l-blue-500">
              <div className="flex justify-between items-start">
                <p className="text-[10px] text-text-tertiary">Subjects</p>
                <BookOpen size={14} className="text-blue-500 opacity-60 group-hover/tile:opacity-100 transition-opacity" />
              </div>
              <p className="text-[22px] font-black text-text-primary mt-2">
                {loadingSubjects ? "..." : errorSubjects ? "—" : subjects.length}
              </p>
            </div>
          </div>
        </div>

        {/* Upcoming Card */}
        <div className="bg-white dark:bg-bg-surface/40 border border-border-strong/50 backdrop-blur-md p-5 rounded-2xl relative overflow-hidden group/card shadow-[0_8px_20px_-6px_rgba(0,0,0,0.03)] dark:shadow-[0_8px_20px_-6px_rgba(0,0,0,0.2)] hover:shadow-[0_16px_32px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_16px_32px_rgba(0,0,0,0.3)] hover:-translate-y-0.5 hover:border-border-strong/80 transition-all duration-300 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="p-1.5 rounded-lg bg-accent/10 text-accent dark:bg-accent/20">
                <Calendar size={14} className="stroke-[2.5]" />
              </span>
              <p className="text-[11px] font-bold text-text-tertiary uppercase tracking-[0.08em]">Upcoming</p>
            </div>
            {loadingTasks ? (
              <Skeleton />
            ) : errorTasks ? (
              <p className="text-sm text-text-tertiary">Could not load</p>
            ) : upcomingTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-text-tertiary select-none">
                <p className="text-sm italic">No deadlines this week</p>
              </div>
            ) : (
              <div className="space-y-2">
                {upcomingTasks.map(task => (
                  <div key={task.id} className="flex items-center justify-between p-2.5 rounded-xl bg-bg-base/40 dark:bg-bg-elevated/10 border border-border-strong/30 hover:border-border-strong/80 hover:bg-bg-base/80 dark:hover:bg-bg-elevated/30 hover:shadow-sm transition-all duration-200 group/row hover:-translate-x-0.5">
                    <div className="flex items-center gap-3 border-l-[3.5px] pl-3" style={{ borderLeftColor: task.subject_id ? (COLOR_MAP[subjects.find(s => s.id === task.subject_id)?.color_tag || ''] || subjects.find(s => s.id === task.subject_id)?.color || '#e5e7eb') : '#e5e7eb' }}>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-text-primary truncate max-w-[150px] sm:max-w-[200px]">{task.title.substring(0, 36)}</span>
                        <span className="text-[10px] font-medium text-text-tertiary uppercase tracking-wider">{getDueDateLabel(task.due_date)}</span>
                      </div>
                    </div>
                    <input 
                      type="checkbox" 
                      onChange={() => updateTaskStatus(task.id)}
                      className="w-4 h-4 rounded border-border-subtle text-accent focus:ring-accent cursor-pointer dark:bg-bg-surface transition-transform duration-200 hover:scale-110" 
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="mt-4 pt-4 border-t border-border-subtle">
            <Link href="/dashboard/tasks" className="text-[11px] font-black text-accent uppercase tracking-widest hover:underline flex items-center gap-1">
              View calendar →
            </Link>
          </div>
        </div>

        {/* Subjects Card */}
        <div className="bg-white dark:bg-bg-surface/40 border border-border-strong/50 backdrop-blur-md p-5 rounded-2xl relative overflow-hidden group/card shadow-[0_8px_20px_-6px_rgba(0,0,0,0.03)] dark:shadow-[0_8px_20px_-6px_rgba(0,0,0,0.2)] hover:shadow-[0_16px_32px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_16px_32px_rgba(0,0,0,0.3)] hover:-translate-y-0.5 hover:border-border-strong/80 transition-all duration-300 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="p-1.5 rounded-lg bg-accent/10 text-accent dark:bg-accent/20">
                <BookOpen size={14} className="stroke-[2.5]" />
              </span>
              <p className="text-[11px] font-bold text-text-tertiary uppercase tracking-[0.08em]">Subjects</p>
            </div>
            {loadingSubjects ? (
              <Skeleton />
            ) : errorSubjects ? (
              <p className="text-sm text-text-tertiary">Could not load</p>
            ) : (
              <div className="space-y-2">
                {sortedSubjects.map(s => {
                  const pct = (s.attended_classes / (s.total_classes || 1)) * 100;
                  const colorHex = COLOR_MAP[s.color_tag || ''] || s.color || '#92400e';
                  return (
                    <Link href="/dashboard/attendance" key={s.id} className={`flex items-center justify-between p-2.5 rounded-xl bg-bg-base/40 dark:bg-bg-elevated/10 border border-border-strong/30 hover:border-border-strong/80 hover:bg-bg-base/80 dark:hover:bg-bg-elevated/30 hover:shadow-sm transition-all duration-200 ${pct < 75 ? 'border-l-2 border-red-500' : ''}`}>
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full animate-pulse-slow" style={{ backgroundColor: colorHex, boxShadow: `0 0 8px ${colorHex}` }} />
                        <span className="text-sm font-bold text-text-primary truncate max-w-[120px]">{s.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-[60px] h-1.5 bg-border-subtle rounded-full overflow-hidden shadow-inner">
                          <div className={`h-full ${attendanceBg(pct)} rounded-full transition-all duration-500`} style={{ width: `${pct}%`, boxShadow: `0 0 8px currentColor` }} />
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
          </div>
          <div className="mt-4 pt-4 border-t border-border-subtle">
            <Link href="/dashboard/attendance" className="text-[11px] font-black text-accent uppercase tracking-widest hover:underline flex items-center gap-1">
              View all →
            </Link>
          </div>
        </div>

        {/* Action Needed Card */}
        <div className="bg-white dark:bg-bg-surface/40 border border-border-strong/50 backdrop-blur-md p-5 rounded-2xl relative overflow-hidden group/card shadow-[0_8px_20px_-6px_rgba(0,0,0,0.03)] dark:shadow-[0_8px_20px_-6px_rgba(0,0,0,0.2)] hover:shadow-[0_16px_32px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_16px_32px_rgba(0,0,0,0.3)] hover:-translate-y-0.5 hover:border-border-strong/80 transition-all duration-300">
          <div className="flex items-center gap-2 mb-4">
            <span className="p-1.5 rounded-lg bg-accent/10 text-accent dark:bg-accent/20">
              <Zap size={14} className="stroke-[2.5]" />
            </span>
            <p className="text-[11px] font-bold text-text-tertiary uppercase tracking-[0.08em]">Action Needed</p>
          </div>
          {loadingSettings || loadingSubjects || loadingTasks || loadingCGPA ? (
            <Skeleton />
          ) : atRiskIssues.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-green-600/90 dark:text-green-400/90 select-none">
              <div className="relative flex items-center justify-center w-14 h-14 mb-4">
                {/* Multi-layered pulsing glowing rings */}
                <span className="animate-ping absolute inline-flex h-10 w-10 rounded-full bg-green-500/20 opacity-75"></span>
                <span className="animate-pulse absolute inline-flex h-12 w-12 rounded-full bg-green-500/10 opacity-50"></span>
                <div className="relative rounded-full p-2.5 bg-green-500/10 border border-green-500/30 text-green-600 dark:text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.2)]">
                  <CheckCircle2 size={24} className="stroke-[2.5]" />
                </div>
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-green-600/85 dark:text-green-400/85 bg-green-500/5 px-3 py-1 rounded-full border border-green-500/10 shadow-[0_2px_10px_rgba(34,197,94,0.05)]">
                ALL GOOD — NOTHING URGENT
              </p>
            </div>
          ) : (
            <ul className="space-y-2.5">
              {atRiskIssues.slice(0, 4).map((issue, i) => (
                <li key={i} className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-red-500/5 transition-colors border border-transparent hover:border-red-500/10">
                  <span className="text-red-500 dark:text-[#DC5050] mt-1 font-bold">•</span>
                  <Link href={issue.link} className={`text-xs font-semibold hover:underline ${issue.critical ? 'text-red-600 dark:text-[#DC5050]' : 'text-text-secondary'}`}>
                    {issue.label}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
