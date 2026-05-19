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
    none: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400',
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
    <div className={`group relative bg-white dark:bg-zinc-900 rounded-[32px] border-l-4 ${healthColors[stats.healthStatus]} shadow-sm overflow-hidden transition-all hover:shadow-md h-fit`}>
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${dotColors[stats.healthStatus]}`} />
            <div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{subject.name}</h3>
              {subject.course_code && (
                <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{subject.course_code}</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setIsSimulatorOpen(true)}
              className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl text-zinc-400 hover:text-cyan-500 transition-all"
              title="Simulate"
            >
              <Flame className="w-5 h-5" />
            </button>
            <button 
              onClick={handleDelete}
              className="p-2 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl text-zinc-300 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
              title="Delete"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm font-bold mb-2">
            <span className={stats.currentPercentage < stats.requiredThreshold ? 'text-red-500' : 'text-green-500'}>
              {stats.currentPercentage.toFixed(1)}%
            </span>
            <span className="text-zinc-400">Target: {stats.personalTarget ?? stats.requiredThreshold}%</span>
          </div>
          <div className="relative h-3 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div 
              className={`absolute top-0 left-0 h-full transition-all duration-500 ${
                stats.healthStatus === 'danger' ? 'bg-red-500' : stats.healthStatus === 'caution' ? 'bg-amber-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(100, stats.currentPercentage)}%` }}
            />
            {/* Threshold marker */}
            <div 
              className="absolute top-0 h-full w-0.5 bg-zinc-400 dark:bg-zinc-600" 
              style={{ left: `${stats.requiredThreshold}%` }}
            />
          </div>
        </div>

        {/* Batch Mark Row */}
        {isBatchMode && (
          <div className="mb-6">
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3">Recent 7 Days</p>
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
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50">
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Skips Left</p>
            <p className={`text-lg font-bold ${
              stats.safeSkipsLeft !== null && stats.safeSkipsLeft <= 1 ? 'text-red-500' : stats.safeSkipsLeft === 2 ? 'text-amber-500' : 'text-green-500'
            }`}>
              {stats.safeSkipsLeft ?? '—'}
            </p>
          </div>
          <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50">
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Classes Left</p>
            <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{stats.remainingClasses ?? '—'}</p>
          </div>
        </div>

        {stats.currentPercentage < stats.requiredThreshold && stats.classesNeededToRecover && (
          <div className="mb-4 p-3 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <p className="text-xs font-bold text-red-700 dark:text-red-400">
              Attend {stats.classesNeededToRecover} more classes to recover
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 mb-6">
          <button 
            onClick={() => handleMark('present')}
            className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-white rounded-2xl font-bold transition-all active:scale-95 shadow-lg shadow-green-500/20 text-sm"
          >
            Present
          </button>
          <button 
            onClick={() => handleMark('unexcused')}
            className="flex-1 py-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-2xl font-bold transition-all active:scale-95 text-sm"
          >
            Absent
          </button>
        </div>

        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-center gap-2 text-xs font-black text-zinc-400 uppercase tracking-widest hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
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
            className="overflow-hidden bg-zinc-50 dark:bg-zinc-800/20 border-t border-zinc-100 dark:border-zinc-800"
          >
            <div className="p-6 space-y-6">
              <div>
                <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4">Attendance Trend</h4>
                <AttendanceTrendChart 
                  records={subject.attendance_records || []} 
                  threshold={stats.requiredThreshold}
                  target={stats.personalTarget}
                />
              </div>

              {stats.projectedFinalPercentage !== null && (
                <div className="flex justify-between items-center p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                  <span className="text-xs font-bold text-zinc-500">Projected Final Score</span>
                  <span className="text-lg font-black text-cyan-500">{stats.projectedFinalPercentage.toFixed(1)}%</span>
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
