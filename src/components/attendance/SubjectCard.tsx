'use client';

import React, { useState } from 'react';
import { 
  MoreVertical, 
  Plus, 
  Trash2, 
  ChevronDown, 
  ChevronUp,
  Flame,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import { SubjectAttendanceStats } from '@/lib/attendance/calculator';
import { markAttendance, deleteSubject } from '@/app/dashboard/attendance/actions';
import { AlertModal } from './AlertModal';
import { AttendanceTrendChart } from './AttendanceTrendChart';
import { WhatIfSimulator } from './WhatIfSimulator';
import { toast } from 'sonner';

interface SubjectCardProps {
  subject: any;
  stats: SubjectAttendanceStats;
  isBatchMode?: boolean;
  batchChanges?: Record<string, any>;
  onBatchToggle?: (date: string, currentType: string) => void;
}

export const SubjectCard: React.FC<SubjectCardProps> = ({ 
  subject, 
  stats,
  isBatchMode,
  batchChanges,
  onBatchToggle
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{
    isOpen: boolean;
    level: 'warning' | 'critical' | 'fatal';
    pendingData?: any;
  }>({ isOpen: false, level: 'warning' });

  const last7Days = React.useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return format(d, 'yyyy-MM-dd');
    }).reverse();
  }, []);

  const getAttendanceForDate = (date: string) => {
    const batchType = batchChanges?.[`${subject.id}|${date}`];
    if (batchType) return batchType;
    return subject.attendance_records?.find((r: any) => r.class_date === date)?.absence_type;
  };

  const typeLabels: Record<string, string> = {
    present: 'P',
    unexcused: 'A',
    medical: 'M',
    excused: 'E',
    cancelled: 'C',
  };

  const typeColors: Record<string, string> = {
    present: 'bg-green-500 text-white',
    unexcused: 'bg-red-500 text-white',
    medical: 'bg-amber-500 text-white',
    excused: 'bg-blue-500 text-white',
    cancelled: 'bg-zinc-400 text-white',
    none: 'bg-bg-surface dark:bg-bg-elevated text-text-tertiary',
  };

  const healthColors = {
    safe: 'border-l-green-500',
    caution: 'border-l-amber-500',
    danger: 'border-l-red-500',
    unreachable: 'border-l-red-900',
  };

  const dotColors = {
    safe: 'bg-green-500',
    caution: 'bg-amber-500',
    danger: 'bg-red-500',
    unreachable: 'bg-red-900',
  };

  const statusBadge = {
    safe:        { label: 'SAFE',        cls: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/30' },
    caution:     { label: 'ATTENTION',   cls: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-[#C9831A]/10 dark:text-[#C9831A] dark:border-[#C9831A]/20' },
    danger:      { label: 'CRITICAL',    cls: 'bg-red-100 text-red-700 border-red-200 dark:bg-[#DC5050]/10 dark:text-[#DC5050] dark:border-[#DC5050]/20' },
    unreachable: { label: 'UNREACHABLE', cls: 'bg-red-900 text-white border-red-800 dark:bg-red-950 dark:text-red-400' },
  };

  const handleMark = async (type: 'present' | 'unexcused', confirmed = false) => {
    try {
      const res = await markAttendance({
        subjectId: subject.id,
        absenceType: type,
        classDate: new Date().toISOString().split('T')[0],
        confirmed
      });

      if (res.requiresConfirmation) {
        setAlertConfig({
          isOpen: true,
          level: res.alertLevel as any,
          pendingData: { type }
        });
        return;
      }

      if (res.success) {
        toast.success(`Marked as ${type}`);
        setAlertConfig({ ...alertConfig, isOpen: false });
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${subject.name}? This cannot be undone.`)) return;
    try {
      await deleteSubject(subject.id);
      toast.success("Subject deleted successfully.");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className={`
      group relative 
      bg-white dark:bg-zinc-900 
      rounded-[24px] 
      border-2 border-zinc-200 dark:border-zinc-800 
      border-l-[6px] ${healthColors[stats.healthStatus]}
      shadow-[0_8px_0_0_rgba(0,0,0,0.05)] dark:shadow-[0_8px_0_0_rgba(0,0,0,0.2)]
      hover:-translate-y-1 hover:shadow-[0_12px_0_0_rgba(0,0,0,0.08)] dark:hover:shadow-[0_12px_0_0_rgba(0,0,0,0.3)]
      transition-all duration-300 ease-out
      overflow-hidden h-fit
    `}>
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-2.5 h-2.5 rounded-full ${dotColors[stats.healthStatus]} shrink-0 mt-1`} />
            <div>
              <h3 className="text-xl font-bold text-text-primary">{subject.name}</h3>
              {subject.course_code && (
                <span className="text-xs font-medium text-text-tertiary uppercase tracking-wider">{subject.course_code}</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Status Badge */}
            <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border font-mono ${
              statusBadge[stats.healthStatus].cls
            }`}>
              {statusBadge[stats.healthStatus].label}
            </span>
            <button 
              onClick={() => setIsSimulatorOpen(true)}
              className="p-2 hover:bg-bg-base rounded-xl text-text-tertiary hover:text-accent transition-all dark:hover:bg-bg-surface"
              title="Simulate"
            >
              <Flame className="w-5 h-5" />
            </button>
            <button 
              onClick={handleDelete}
              className="p-2 hover:bg-red-50 rounded-xl text-text-tertiary hover:text-red-500 transition-all opacity-0 group-hover:opacity-100 dark:hover:bg-red-900/20"
              title="Delete"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-5">
          <div className="flex justify-between text-sm font-bold mb-1.5">
            <span className="text-text-primary">
              {stats.currentPercentage.toFixed(1)}%
            </span>
            <span className="text-text-tertiary text-xs">Target: {stats.requiredThreshold}%</span>
          </div>
          <div className="relative h-2.5 bg-border-subtle rounded-full overflow-hidden">
            <div 
              className={`absolute top-0 left-0 h-full transition-all duration-500 dark:opacity-85 ${
                stats.healthStatus === 'danger' || stats.healthStatus === 'unreachable' ? 'bg-red-500' : stats.healthStatus === 'caution' ? 'bg-amber-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(100, stats.currentPercentage)}%` }}
            />
            {/* Threshold marker */}
            <div 
              className="absolute top-0 h-full w-0.5 bg-text-tertiary/20" 
              style={{ left: `${stats.requiredThreshold}%` }}
            />
          </div>
        </div>

        {/* Attendance stats row: held / attended */}
        <div className="flex gap-2 mb-5 text-center">
          <div className="flex-1 p-2.5 rounded-xl bg-bg-base border border-border-strong dark:bg-bg-surface">
            <p className="text-[9px] font-black text-text-tertiary uppercase tracking-widest mb-0.5">Classes Held</p>
            <p className="text-base font-black text-text-primary">{stats.totalClasses}</p>
          </div>
          <div className="flex-1 p-2.5 rounded-xl bg-bg-base border border-border-strong dark:bg-bg-surface">
            <p className="text-[9px] font-black text-text-tertiary uppercase tracking-widest mb-0.5">Attended</p>
            <p className="text-base font-black text-text-primary">{stats.attended}</p>
          </div>
          <div className="flex-1 p-2.5 rounded-xl bg-bg-base border border-border-strong dark:bg-bg-surface">
            <p className="text-[9px] font-black text-text-tertiary uppercase tracking-widest mb-0.5">Target</p>
            <p className="text-base font-black text-text-tertiary">{stats.requiredThreshold}%</p>
          </div>
        </div>

        {/* Batch Mark Row */}
        {isBatchMode && (
          <div className="mb-6">
            <p className="text-[10px] font-black text-text-tertiary uppercase tracking-widest mb-3">Recent 7 Days</p>
            <div className="flex justify-between gap-1">
              {last7Days.map(date => {
                const type = getAttendanceForDate(date);
                return (
                  <button
                    key={date}
                    onClick={() => onBatchToggle?.(date, type)}
                    className={`flex-1 aspect-square rounded-lg flex items-center justify-center text-[10px] font-black transition-all ${typeColors[type || 'none']}`}
                    title={date}
                  >
                    {typeLabels[type] || '—'}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Live Stats Rows */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="p-3 rounded-2xl bg-bg-base border border-border-strong dark:bg-bg-surface">
            <p className="text-[9px] font-black text-text-tertiary uppercase tracking-widest mb-1">Skips Left</p>
            <p className={`text-lg font-black ${
              stats.safeSkipsLeft !== null && stats.safeSkipsLeft <= 1 ? 'text-red-600 dark:text-[#DC5050]' : stats.safeSkipsLeft === 2 ? 'text-amber-600 dark:text-[#C9831A]' : 'text-green-600 dark:text-green-400'
            }`}>
              {stats.safeSkipsLeft !== null ? `${stats.safeSkipsLeft} left` : '—'}
            </p>
          </div>
          <div className="p-3 rounded-2xl bg-bg-base border border-border-strong dark:bg-bg-surface">
            <p className="text-[9px] font-black text-text-tertiary uppercase tracking-widest mb-1">Classes Left</p>
            <p className="text-lg font-black text-text-primary">{stats.remainingClasses ?? '—'}</p>
          </div>
        </div>

        {/* Forecast banner */}
        {stats.currentPercentage >= stats.requiredThreshold && stats.safeSkipsLeft !== null && (
          <div className="mb-4 p-3 rounded-2xl bg-green-50 border border-green-200 flex items-center gap-2 dark:bg-green-900/10 dark:border-green-800/20">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
            <p className="text-xs font-mono text-green-800 dark:text-green-300">
              You can skip <span className="font-black">{stats.safeSkipsLeft}</span> more {stats.safeSkipsLeft === 1 ? 'class' : 'classes'} and stay safe.
            </p>
          </div>
        )}

        {stats.currentPercentage < stats.requiredThreshold && stats.classesNeededToRecover && (
          <div className="mb-4 p-3 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-2 dark:bg-red-900/10 dark:border-red-800/20">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5 dark:text-[#DC5050]" />
            <div>
              <p className="text-xs font-black text-red-700 uppercase tracking-widest dark:text-red-400">Recovery Required</p>
              <p className="text-xs font-mono text-red-600 mt-0.5 dark:text-[#DC5050]">
                Attend next <span className="font-bold text-red-700 dark:text-red-400">{stats.classesNeededToRecover}</span> consecutive classes to recover.
              </p>
            </div>
          </div>
        )}



        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-center gap-2 text-xs font-black text-text-tertiary uppercase tracking-widest hover:text-text-primary transition-colors"
        >
          {isExpanded ? (
            <>Hide Analytics <ChevronUp className="w-4 h-4" /></>
          ) : (
            <>Show Analytics <ChevronDown className="w-4 h-4" /></>
          )}
        </button>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-bg-base border-t border-border-strong dark:bg-bg-surface"
          >
            <div className="p-6 space-y-6">
              <div>
                <h4 className="text-[10px] font-black text-text-tertiary uppercase tracking-widest mb-4">Attendance Trend</h4>
                <AttendanceTrendChart 
                  records={subject.attendance_records || []} 
                  threshold={stats.requiredThreshold}
                  target={stats.personalTarget}
                />
              </div>

              {stats.projectedFinalPercentage !== null && (
                <div className="flex justify-between items-center p-4 rounded-2xl bg-bg-surface border border-border-strong dark:bg-bg-elevated">
                  <span className="text-xs font-bold text-text-tertiary">Projected Final Score</span>
                  <span className="text-lg font-black text-accent">{stats.projectedFinalPercentage.toFixed(1)}%</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AlertModal
        isOpen={alertConfig.isOpen}
        level={alertConfig.level}
        subjectName={subject.name}
        currentPct={stats.currentPercentage}
        projectedPct={alertConfig.pendingData?.type === 'unexcused' ? stats.currentPercentage : undefined} // Simplification
        threshold={stats.requiredThreshold}
        onConfirm={() => handleMark(alertConfig.pendingData?.type, true)}
        onCancel={() => setAlertConfig({ ...alertConfig, isOpen: false })}
      />

      <WhatIfSimulator 
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        subject={subject}
        records={subject.attendance_records || []}
      />
    </div>
  );
};
