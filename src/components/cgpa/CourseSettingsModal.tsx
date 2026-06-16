'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Settings,
  Save,
  FlaskConical,
  ClipboardList,
  CalendarCheck,
  FileText,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import type { AutoCourse, GradeScale, AttendanceSubject, CTForm } from '@/lib/cgpa/cgpa-types';
import { saveAutoCourse, saveClassTests } from '@/app/dashboard/cgpa/actions';

interface CourseSettingsModalProps {
  course: AutoCourse;
  gradeScales: GradeScale[];
  attendanceSubjects: AttendanceSubject[];
  onClose: () => void;
  onSaved: (updated: AutoCourse) => void;
}

export function CourseSettingsModal({
  course,
  gradeScales,
  attendanceSubjects,
  onClose,
  onSaved,
}: CourseSettingsModalProps) {
  const [localCourse, setLocalCourse] = useState<AutoCourse>({ ...course });
  const [isSaving, setIsSaving] = useState(false);

  // Initialise CT forms from existing data for weight/total config only
  const [ctForms, setCTForms] = useState<CTForm[]>(() => {
    const existing = course.cgpa_class_tests || [];
    const total = Number(course.ct_total) || 0;
    const forms: CTForm[] = [];
    for (let i = 1; i <= total; i++) {
      const ct = existing.find((c) => c.ct_number === i);
      forms.push({
        ct_number: i,
        marks_obtained: ct ? ct.marks_obtained : '',
        total_marks: ct ? ct.total_marks : '',
      });
    }
    return forms;
  });

  const activeScale = useMemo(() => {
    if (localCourse.grade_scale_id) return gradeScales.find((s) => s.id === localCourse.grade_scale_id);
    return gradeScales.find((s) => s.is_global);
  }, [localCourse.grade_scale_id, gradeScales]);

  const gradePointOptions = useMemo(() => {
    if (!activeScale) return [];
    return [...activeScale.mappings]
      .sort((a, b) => b.gradePoint - a.gradePoint)
      .map((m) => m.gradePoint)
      .filter((v, i, arr) => arr.indexOf(v) === i);
  }, [activeScale]);

  const handleCTTotalChange = (newTotal: number) => {
    const total = Math.max(0, Math.min(20, newTotal));
    setLocalCourse((prev) => ({ ...prev, ct_total: total }));
    const newForms: CTForm[] = [];
    for (let i = 1; i <= total; i++) {
      const existing = ctForms.find((f) => f.ct_number === i);
      newForms.push(existing || { ct_number: i, marks_obtained: '', total_marks: '' });
    }
    setCTForms(newForms);
  };

  const totalWeight = Number(localCourse.ct_weight) + Number(localCourse.assignment_weight) +
    Number(localCourse.attendance_weight) + Number(localCourse.exam_weight);

  const validate = useCallback((): string | null => {
    if (Number(localCourse.ct_best_of) > Number(localCourse.ct_total)) {
      return 'Best-of count cannot exceed total CT count.';
    }
    if (Math.abs(totalWeight - 100) > 0.01) {
      return `Total weights must equal 100%. Currently: ${totalWeight.toFixed(1)}%`;
    }
    return null;
  }, [localCourse, totalWeight]);

  const handleSave = async () => {
    const error = validate();
    if (error) {
      toast.error(error);
      return;
    }

    setIsSaving(true);
    try {
      const courseRes = await saveAutoCourse({
        id: course.id,
        course_name: localCourse.course_name,
        course_code: localCourse.course_code || undefined,
        semester_number: Number(localCourse.semester_number),
        credit_hours: Number(localCourse.credit_hours),
        target_grade_point: Number(localCourse.target_grade_point),
        grade_scale_id: localCourse.grade_scale_id || undefined,
        ct_total: Number(localCourse.ct_total),
        ct_best_of: Number(localCourse.ct_best_of),
        ct_weight: Number(localCourse.ct_weight),
        assignment_total_marks: Number(localCourse.assignment_total_marks),
        assignment_obtained: Number(localCourse.assignment_obtained),
        assignment_weight: Number(localCourse.assignment_weight),
        attendance_linked: localCourse.attendance_linked,
        attendance_course_id: localCourse.attendance_course_id || undefined,
        attendance_total_marks: Number(localCourse.attendance_total_marks),
        attendance_threshold_percentage: Number(localCourse.attendance_threshold_percentage),
        attendance_weight: Number(localCourse.attendance_weight),
        exam_weight: Number(localCourse.exam_weight),
      });

      if (!courseRes.success) {
        toast.error(`Failed to save course: ${courseRes.error}`);
        return;
      }

      // Save CT structural changes (marks remain mostly empty/existing)
      const validCTs = ctForms.map((f) => ({
        ct_number: f.ct_number,
        marks_obtained: Number(f.marks_obtained) || 0,
        total_marks: Number(f.total_marks) || 0, // might be updated through marks modal instead
      }));
      // We only save valid ones that actually have total marks to avoid polluting db with 0-total CTs
      const filterValidCTs = validCTs.filter((c) => c.total_marks > 0);

      if (filterValidCTs.length > 0) {
        const ctRes = await saveClassTests(course.id, filterValidCTs);
        if (!ctRes.success) {
          toast.error(`Course saved, but CTs failed: ${ctRes.error}`);
          return;
        }
      }

      toast.success('Course settings updated, Sir.');
      onSaved({ ...localCourse, cgpa_class_tests: filterValidCTs as any[] });
      onClose();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-md"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          className="relative w-full max-w-2xl bg-bg rounded-[40px] shadow-[0_20px_60px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col max-h-[92vh] border-b-8 border-stone-800"
        >
          <div className="px-8 py-7 border-b border-border-strong flex justify-between items-center bg-white/50 shrink-0">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-stone-800 flex items-center justify-center text-white shadow-lg shadow-stone-800/20">
                <Settings className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-ink truncate max-w-[280px]">Course Settings</h3>
                <p className="text-[10px] font-black text-ink-3 uppercase tracking-widest">{course.course_name}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white rounded-xl transition-colors">
              <X className="w-6 h-6 text-ink-3" />
            </button>
          </div>

          <div className="overflow-y-auto flex-1 p-8 space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-ink-3 uppercase tracking-widest">Course Name</label>
                <input type="text" value={localCourse.course_name} onChange={(e) => setLocalCourse({ ...localCourse, course_name: e.target.value })} className="w-full px-4 py-3 rounded-xl border-2 border-stone-100 bg-white font-bold text-sm outline-none focus:border-stone-800 transition-all" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-ink-3 uppercase tracking-widest">Course Code</label>
                <input type="text" value={localCourse.course_code || ''} onChange={(e) => setLocalCourse({ ...localCourse, course_code: e.target.value })} className="w-full px-4 py-3 rounded-xl border-2 border-stone-100 bg-white font-bold text-sm outline-none focus:border-stone-800 transition-all" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-ink-3 uppercase tracking-widest">Credit Hours</label>
                <input type="number" value={localCourse.credit_hours || ''} onChange={(e) => setLocalCourse({ ...localCourse, credit_hours: Number(e.target.value) })} className="w-full px-4 py-3 rounded-xl border-2 border-stone-100 bg-white font-bold text-sm outline-none focus:border-stone-800 transition-all" min="0.5" max="10" step="0.5" placeholder="0" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-ink-3 uppercase tracking-widest">Target Grade Point</label>
                <select value={localCourse.target_grade_point} onChange={(e) => setLocalCourse({ ...localCourse, target_grade_point: Number(e.target.value) })} className="w-full px-4 py-3 rounded-xl border-2 border-stone-100 bg-white font-bold text-sm outline-none focus:border-stone-800 transition-all">
                  <option value="">Select</option>
                  {gradePointOptions.map((gp) => (
                    <option key={gp} value={gp}>{gp.toFixed(2)}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-ink-3 uppercase tracking-widest">Grade Scale Override (Optional)</label>
              <select value={localCourse.grade_scale_id || ''} onChange={(e) => setLocalCourse({ ...localCourse, grade_scale_id: e.target.value || null })} className="w-full px-4 py-3 rounded-xl border-2 border-stone-100 bg-white font-bold text-sm outline-none focus:border-stone-800 transition-all">
                <option value="">Use Global Scale</option>
                {gradeScales.map((s) => (
                  <option key={s.id} value={s.id}>{s.scale_name} ({s.mappings.length} thresholds)</option>
                ))}
              </select>
            </div>

            {/* CT SETTINGS */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center">
                  <FlaskConical className="w-4 h-4 text-blue-700" />
                </div>
                <h4 className="text-sm font-black text-ink uppercase tracking-widest">Class Tests Configuration</h4>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-ink-3 uppercase tracking-widest">Total CTs</label>
                  <input type="number" value={localCourse.ct_total || ''} onChange={(e) => handleCTTotalChange(Number(e.target.value))} className="w-full px-4 py-3 rounded-xl border-2 border-stone-100 bg-white font-bold text-sm outline-none focus:border-blue-400 transition-all" min="0" max="20" placeholder="0" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-ink-3 uppercase tracking-widest">Best Of</label>
                  <input type="number" value={localCourse.ct_best_of || ''} onChange={(e) => setLocalCourse({ ...localCourse, ct_best_of: Number(e.target.value) })} className="w-full px-4 py-3 rounded-xl border-2 border-stone-100 bg-white font-bold text-sm outline-none focus:border-blue-400 transition-all" min="0" max={Number(localCourse.ct_total)} placeholder="0" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-ink-3 uppercase tracking-widest">CT Weight (%)</label>
                  <input type="number" value={localCourse.ct_weight || ''} onChange={(e) => setLocalCourse({ ...localCourse, ct_weight: Number(e.target.value) })} className="w-full px-4 py-3 rounded-xl border-2 border-stone-100 bg-white font-bold text-sm outline-none focus:border-blue-400 transition-all" min="0" max="100" placeholder="0" />
                </div>
              </div>
            </div>

            {/* ASSIGNMENT SETTINGS */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center">
                  <ClipboardList className="w-4 h-4 text-amber-700" />
                </div>
                <h4 className="text-sm font-black text-ink uppercase tracking-widest">Assignment Configuration</h4>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-ink-3 uppercase tracking-widest">Total Marks</label>
                  <input type="number" value={localCourse.assignment_total_marks || ''} onChange={(e) => setLocalCourse({ ...localCourse, assignment_total_marks: Number(e.target.value) })} className="w-full px-4 py-3 rounded-xl border-2 border-stone-100 bg-white font-bold text-sm outline-none focus:border-amber-400 transition-all" min="0" placeholder="0" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-ink-3 uppercase tracking-widest">Weight (%)</label>
                  <input type="number" value={localCourse.assignment_weight || ''} onChange={(e) => setLocalCourse({ ...localCourse, assignment_weight: Number(e.target.value) })} className="w-full px-4 py-3 rounded-xl border-2 border-stone-100 bg-white font-bold text-sm outline-none focus:border-amber-400 transition-all" min="0" max="100" placeholder="0" />
                </div>
              </div>
            </div>

            {/* ATTENDANCE SETTINGS */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-green-100 flex items-center justify-center">
                    <CalendarCheck className="w-4 h-4 text-green-700" />
                  </div>
                  <h4 className="text-sm font-black text-ink uppercase tracking-widest">Attendance Configuration</h4>
                </div>
                <button
                  onClick={() => setLocalCourse({ ...localCourse, attendance_linked: !localCourse.attendance_linked })}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                >
                  {localCourse.attendance_linked ? (
                    <>
                      <ToggleRight className="w-5 h-5 text-green-600" />
                      <span className="text-green-700">Linked</span>
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="w-5 h-5 text-ink-3" />
                      <span className="text-ink-3">Disabled</span>
                    </>
                  )}
                </button>
              </div>

              {localCourse.attendance_linked && (
                <div className="space-y-4 pl-0 sm:pl-11">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-ink-3 uppercase tracking-widest">Link to Attendance Course</label>
                    <select value={localCourse.attendance_course_id || ''} onChange={(e) => setLocalCourse({ ...localCourse, attendance_course_id: e.target.value || null })} className="w-full px-4 py-3 rounded-xl border-2 border-stone-100 bg-white font-bold text-sm outline-none focus:border-green-400 transition-all">
                      <option value="">Select Course</option>
                      {attendanceSubjects.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} {s.course_code ? `(${s.course_code})` : ''} — {s.attendance_percentage.toFixed(1)}%
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-ink-3 uppercase tracking-widest">Total Marks</label>
                      <input type="number" value={localCourse.attendance_total_marks || ''} onChange={(e) => setLocalCourse({ ...localCourse, attendance_total_marks: Number(e.target.value) })} className="w-full px-4 py-3 rounded-xl border-2 border-stone-100 bg-white font-bold text-sm outline-none focus:border-green-400 transition-all" min="0" placeholder="0" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-ink-3 uppercase tracking-widest">Threshold (%)</label>
                      <input type="number" value={localCourse.attendance_threshold_percentage || ''} onChange={(e) => setLocalCourse({ ...localCourse, attendance_threshold_percentage: Number(e.target.value) })} className="w-full px-4 py-3 rounded-xl border-2 border-stone-100 bg-white font-bold text-sm outline-none focus:border-green-400 transition-all" min="0" max="100" placeholder="0" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-ink-3 uppercase tracking-widest">Weight (%)</label>
                      <input type="number" value={localCourse.attendance_weight || ''} onChange={(e) => setLocalCourse({ ...localCourse, attendance_weight: Number(e.target.value) })} className="w-full px-4 py-3 rounded-xl border-2 border-stone-100 bg-white font-bold text-sm outline-none focus:border-green-400 transition-all" min="0" max="100" placeholder="0" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* EXAM CONFIGURATION */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-violet-100 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-violet-700" />
                </div>
                <h4 className="text-sm font-black text-ink uppercase tracking-widest">Written Exam Configuration</h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-ink-3 uppercase tracking-widest">Exam Weight (%)</label>
                  <input type="number" value={localCourse.exam_weight || ''} onChange={(e) => setLocalCourse({ ...localCourse, exam_weight: Number(e.target.value) })} className="w-full px-4 py-3 rounded-xl border-2 border-stone-100 bg-white font-bold text-sm outline-none focus:border-violet-400 transition-all" min="0" max="100" placeholder="0" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-ink-3 uppercase tracking-widest">Total Weight Check</label>
                  <div className={`px-4 py-3 rounded-xl border-2 font-bold text-sm ${
                    Math.abs(totalWeight - 100) < 0.01
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                      : 'border-red-200 bg-red-50 text-red-700'
                  }`}>
                    {totalWeight.toFixed(1)}% {Math.abs(totalWeight - 100) < 0.01 ? '✓' : `(${totalWeight > 100 ? '+' : ''}${(totalWeight - 100).toFixed(1)}%)`}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="px-8 py-6 bg-white/50 border-t border-border-strong flex justify-end gap-4 shrink-0">
            <button
              onClick={onClose}
              className="px-8 py-3.5 text-xs font-black text-ink-3 hover:text-ink uppercase tracking-widest transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 bg-stone-800 text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-stone-900 transition-all disabled:opacity-50 shadow-xl shadow-stone-800/20 active:scale-95"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
