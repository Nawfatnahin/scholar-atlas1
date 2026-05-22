'use client';

import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Calendar, 
  Layout, 
  BookOpen, 
  AlertCircle,
  Hash,
  Info,
  X,
  Layers
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { calculateStats, SubjectAttendanceStats } from '@/lib/attendance/calculator';
import { SubjectCard } from './SubjectCard';
import { TodaySchedule } from './TodaySchedule';
import { HolidayModal } from './HolidayModal';
import { BatchMarkFooter } from './BatchMarkFooter';
import { addSubject, updateSubject, bulkMarkAttendance } from '@/app/dashboard/attendance/actions';

interface AttendanceTrackerProps {
  initialSubjects: any[];
  initialHolidays: any[];
}

export function AttendanceTracker({ initialSubjects, initialHolidays }: AttendanceTrackerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingSubject, setEditingSubject] = useState<any | null>(null);
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [isHolidayModalOpen, setIsHolidayModalOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [batchChanges, setBatchChanges] = useState<Record<string, any>>({});

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    courseCode: '',
    requiredThreshold: 75,
    personalTarget: null as number | null,
    classDays: [] as string[],
    semesterStartDate: format(new Date(), 'yyyy-MM-dd'),
    totalWeeks: 15,
  });

  const subjectsWithStats = useMemo(() => {
    return initialSubjects.map(subject => {
      const records = subject.attendance_records || [];
      const stats = calculateStats(subject, records);
      return { subject, stats };
    });
  }, [initialSubjects]);

  const overallHealth = useMemo(() => {
    if (subjectsWithStats.length === 0) return 0;
    const totalAttended = subjectsWithStats.reduce((sum, s) => sum + s.stats.attended, 0);
    const totalClasses = subjectsWithStats.reduce((sum, s) => sum + s.stats.totalClasses, 0);
    return totalClasses > 0 ? (totalAttended / totalClasses) * 100 : 100;
  }, [subjectsWithStats]);

  const subjectsNeedingAttention = subjectsWithStats.filter(
    s => s.stats.healthStatus === 'caution' || s.stats.healthStatus === 'danger'
  ).length;

  const criticalSubjects = subjectsWithStats.filter(
    s => s.stats.healthStatus === 'unreachable'
  ).length;

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || formData.classDays.length === 0) {
      toast.error("Please fill all required fields, Sir.");
      return;
    }
    setIsPending(true);
    try {
      console.log('[JARVIS]: Dispatching subject configuration to server...');
      const res = await addSubject({
        name: formData.name,
        courseCode: formData.courseCode,
        requiredThreshold: Number(formData.requiredThreshold),
        personalTarget: formData.personalTarget ? Number(formData.personalTarget) : null,
        classDays: formData.classDays,
        semesterStartDate: formData.semesterStartDate,
        totalWeeks: Number(formData.totalWeeks)
      });

      if (res.success) {
        setIsAdding(false);
        setEditingSubject(null);
        setFormData({
          name: '',
          courseCode: '',
          requiredThreshold: 75,
          personalTarget: null,
          classDays: [],
          semesterStartDate: format(new Date(), 'yyyy-MM-dd'),
          totalWeeks: 15,
        });
        toast.success("Academic track initialized with absolute precision, Sir.");
      } else {
        console.error('[JARVIS]: Server Action reported failure:', res.error);
        toast.error(`Configuration Failed: ${res.error}`);
      }
    } catch (error: any) {
      console.error('[JARVIS]: Unexpected network or runtime exception:', error);
      toast.error(`System Anomaly: ${error.message || 'Unknown network error'}`);
    } finally {
      setIsPending(false);
    }
  };

  const handleSaveBatch = async () => {
    setIsPending(true);
    try {
      const records = Object.entries(batchChanges).map(([key, value]) => {
        const [subjectId, classDate] = key.split('|');
        return { subjectId, classDate, absenceType: value };
      });
      await bulkMarkAttendance({ records });
      setBatchChanges({});
      setIsBatchMode(false);
      toast.success("Batch updates finalized, Sir.");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsPending(false);
    }
  };

  const handleBatchToggle = (subjectId: string, date: string, currentType: string) => {
    const key = `${subjectId}|${date}`;
    const types = ['present', 'unexcused', 'medical', 'excused', 'cancelled'];
    const currentIndex = types.indexOf(currentType || 'none');
    const nextType = types[(currentIndex + 1) % types.length];
    
    setBatchChanges(prev => ({
      ...prev,
      [key]: nextType
    }));
  };

  return (
    <div className="space-y-10 pb-32">
      {/* Semester Health Score Header */}
      <div className="bg-white/70 backdrop-blur-xl rounded-[44px] p-8 border border-border-strong shadow-[0_20px_50px_rgba(0,0,0,0.04)]">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <h3 className="text-sm font-black text-[#92400e] uppercase tracking-[0.3em]">Semester Health</h3>
            <div className="flex items-baseline gap-3">
              <span className={`text-5xl font-black tracking-tighter ${
                overallHealth >= 75 ? 'text-green-600' : overallHealth >= 65 ? 'text-amber-600' : 'text-red-600'
              }`}>
                {overallHealth.toFixed(1)}%
              </span>
              <span className="text-xs font-bold text-ink-3 uppercase tracking-widest">Overall Average</span>
            </div>
          </div>

          <div className="flex gap-4 w-full md:w-auto">
            <div className="flex-1 md:flex-none p-4 rounded-3xl bg-white border border-border-strong">
              <p className="text-[10px] font-black text-ink-3 uppercase tracking-widest mb-1">Attention</p>
              <p className="text-2xl font-black text-amber-600">{subjectsNeedingAttention}</p>
            </div>
            <div className="flex-1 md:flex-none p-4 rounded-3xl bg-white border border-border-strong">
              <p className="text-[10px] font-black text-ink-3 uppercase tracking-widest mb-1">Critical</p>
              <p className="text-2xl font-black text-red-600">{criticalSubjects}</p>
            </div>
          </div>
        </div>

        <p className="mt-6 text-xs font-medium text-ink-3 italic">
          * Weighted by class count (subjects with more classes count more)
        </p>
      </div>

      {/* Today's Schedule */}
      <TodaySchedule subjects={initialSubjects} />

      {/* Main Controls */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-ink tracking-tight">Your Courses</h2>
          <p className="text-ink-3 font-medium">Monitoring {initialSubjects.length} active academic tracks.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setIsBatchMode(!isBatchMode)}
            className={`flex items-center gap-3 px-6 py-4 rounded-[20px] font-black uppercase tracking-widest transition-all active:scale-95 ${
              isBatchMode 
                ? 'bg-[#92400e] text-white shadow-lg shadow-[#92400e]/20' 
                : 'bg-white border border-border-strong text-ink-3 hover:text-ink'
            }`}
          >
            <Layers className="w-5 h-5" />
            Batch Mark
          </button>
          <button
            onClick={() => setIsHolidayModalOpen(true)}
            className="flex items-center gap-3 bg-[#92400e]/10 text-[#92400e] px-6 py-4 rounded-[20px] font-black uppercase tracking-widest hover:bg-[#92400e]/20 transition-all active:scale-95"
          >
            <Calendar className="w-5 h-5" />
            Holidays
          </button>
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-3 bg-[#92400e] text-white px-8 py-4 rounded-[20px] font-black uppercase tracking-widest hover:-translate-y-1 transition-all active:scale-95 shadow-xl shadow-[#92400e]/20"
          >
            <Plus className="w-5 h-5" />
            Add Subject
          </button>
        </div>
      </div>

      {/* Subject Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {subjectsWithStats.map(({ subject, stats }) => (
          <SubjectCard 
            key={subject.id} 
            subject={subject} 
            stats={stats} 
            isBatchMode={isBatchMode}
            batchChanges={batchChanges}
            onBatchToggle={(date, currentType) => handleBatchToggle(subject.id, date, currentType)}
          />
        ))}
      </div>

      {/* Empty State */}
      {initialSubjects.length === 0 && (
        <div className="py-32 text-center bg-white/50 backdrop-blur-xl rounded-[60px] border-4 border-dashed border-border-strong flex flex-col items-center justify-center">
          <BookOpen className="w-16 h-16 text-[#92400e]/30 mb-6" />
          <h3 className="text-2xl font-black text-ink mb-2">Academic Void Detected</h3>
          <p className="text-ink-3 font-medium max-w-sm mb-10">Initialize your first course tracking module to begin precision monitoring.</p>
          <button onClick={() => setIsAdding(true)} className="bg-[#92400e] text-white px-12 py-5 rounded-[24px] font-black uppercase tracking-widest shadow-xl shadow-[#92400e]/20 active:scale-95 hover:-translate-y-1 transition-all">
            Initialize Track
          </button>
        </div>
      )}

      {/* Modals & Footers */}
      <HolidayModal 
        isOpen={isHolidayModalOpen} 
        onClose={() => setIsHolidayModalOpen(false)}
        holidays={initialHolidays}
        subjects={initialSubjects}
      />

      <BatchMarkFooter 
        isVisible={isBatchMode}
        changeCount={Object.keys(batchChanges).length}
        onSave={handleSaveBatch}
        onCancel={() => {
          setBatchChanges({});
          setIsBatchMode(false);
        }}
        isPending={isPending}
      />

      {/* Add/Edit Subject Modal */}
      {(isAdding || editingSubject) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in">
          <form onSubmit={handleAddSubject} className="relative w-full max-w-2xl bg-bg rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col max-h-[90vh] border-b-8 border-[#92400e]/10">
            <div className="px-10 py-8 border-b border-border-strong flex justify-between items-center bg-white/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#92400e] flex items-center justify-center text-white shadow-lg shadow-[#92400e]/20">
                  <Layout className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-black text-ink">
                  {editingSubject ? "Module Configuration" : "New Monitoring Track"}
                </h3>
              </div>
              <button type="button" onClick={() => { setIsAdding(false); setEditingSubject(null); }} className="p-2 hover:bg-white rounded-xl transition-colors">
                <X className="w-6 h-6 text-ink-3" />
              </button>
            </div>

            <div className="p-10 space-y-8 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-ink-3 uppercase tracking-widest flex items-center gap-2"><Info className="w-3 h-3" /> Subject Name</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="e.g. Data Structures" className="w-full px-6 py-4 rounded-2xl border-2 border-border-strong bg-white font-bold text-ink outline-none focus:border-[#92400e] transition-all" required />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-ink-3 uppercase tracking-widest flex items-center gap-2"><Hash className="w-3 h-3" /> Course Code</label>
                  <input type="text" value={formData.courseCode} onChange={(e) => setFormData({...formData, courseCode: e.target.value})} placeholder="Optional" className="w-full px-6 py-4 rounded-2xl border-2 border-border-strong bg-white font-bold text-ink outline-none focus:border-[#92400e] transition-all" />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-ink-3 uppercase tracking-widest flex items-center gap-2"><Calendar className="w-3 h-3" /> Active Schedule Days</label>
                <div className="flex flex-wrap gap-2">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                    <button key={day} type="button" onClick={() => {
                      const days = formData.classDays.includes(day) ? formData.classDays.filter(d => d !== day) : [...formData.classDays, day];
                      setFormData({...formData, classDays: days});
                    }} className={`px-5 py-3 rounded-xl text-[11px] font-black transition-all border-b-4 ${formData.classDays.includes(day) ? 'bg-[#92400e] text-white border-[#78350f] shadow-lg shadow-[#92400e]/20' : 'bg-white text-ink-3 border-border-strong hover:text-ink hover:bg-stone-50'}`}>{day.slice(0, 3).toUpperCase()}</button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-ink-3 uppercase tracking-widest">Threshold %</label>
                  <input type="number" value={formData.requiredThreshold} onChange={(e) => setFormData({...formData, requiredThreshold: parseFloat(e.target.value)})} className="w-full px-4 py-3.5 rounded-xl border-2 border-border-strong bg-white font-bold text-ink outline-none focus:border-[#92400e] transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-ink-3 uppercase tracking-widest">Personal %</label>
                  <input type="number" value={formData.personalTarget || ''} onChange={(e) => setFormData({...formData, personalTarget: e.target.value ? parseFloat(e.target.value) : null})} placeholder="75" className="w-full px-4 py-3.5 rounded-xl border-2 border-border-strong bg-white font-bold text-ink outline-none focus:border-[#92400e] transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-ink-3 uppercase tracking-widest">Total Planned</label>
                  <input type="number" value={formData.totalWeeks * formData.classDays.length} readOnly className="w-full px-4 py-3.5 rounded-xl border-2 border-border-strong bg-white/50 font-bold text-ink-3 cursor-not-allowed" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-ink-3 uppercase tracking-widest">Start Date</label>
                  <input type="date" value={formData.semesterStartDate} onChange={(e) => setFormData({...formData, semesterStartDate: e.target.value})} className="w-full px-4 py-3.5 rounded-xl border-2 border-border-strong bg-white font-bold text-ink outline-none focus:border-[#92400e] transition-all" required />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-ink-3 uppercase tracking-widest">Semester Duration (Weeks)</label>
                  <input type="number" value={formData.totalWeeks} onChange={(e) => setFormData({...formData, totalWeeks: parseInt(e.target.value)})} className="w-full px-4 py-3.5 rounded-xl border-2 border-border-strong bg-white font-bold text-ink outline-none focus:border-[#92400e] transition-all" required />
                </div>
              </div>
            </div>

            <div className="px-10 py-8 bg-white/50 border-t border-border-strong flex justify-end gap-4">
              <button type="button" onClick={() => { setIsAdding(false); setEditingSubject(null); }} className="px-8 py-4 text-xs font-black text-ink-3 hover:text-ink uppercase tracking-widest transition-colors">Cancel</button>
              <button type="submit" disabled={isPending} className="bg-[#92400e] text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-[#78350f] transition-all disabled:opacity-50 shadow-xl shadow-[#92400e]/20 active:scale-95">{isPending ? "Configuring..." : (editingSubject ? "Update Track" : "Initialize Track")}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
