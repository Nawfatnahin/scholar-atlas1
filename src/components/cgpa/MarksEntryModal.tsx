'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  FlaskConical,
  ClipboardList,
  CalendarCheck,
  FileText,
  Target,
  AlertTriangle,
  PartyPopper,
  Save,
  BarChart2,
  Lock,
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import type { AutoCourse, GradeScale, AttendanceSubject, ClassTest, CTForm } from '@/lib/cgpa/cgpa-types';
import {
  calculateCourseBreakdown,
  processClassTests,
} from '@/lib/cgpa/cgpa-calculator';
import { saveAutoCourse, saveClassTests } from '@/app/dashboard/cgpa/actions';

interface MarksEntryModalProps {
  course: AutoCourse;
  gradeScales: GradeScale[];
  attendanceSubjects: AttendanceSubject[];
  onClose: () => void;
  onSaved: (updated: AutoCourse) => void;
}

export function MarksEntryModal({
  course,
  gradeScales,
  attendanceSubjects,
  onClose,
  onSaved,
}: MarksEntryModalProps) {
  // -- Initialise CT forms from existing data --
  const [ctForms, setCTForms] = useState<CTForm[]>(() => {
    const existing = course.cgpa_class_tests || [];
    const total = Number(course.ct_total) || 0;
    const forms: CTForm[] = [];
    for (let i = 1; i <= total; i++) {
      const ct = existing.find((c) => c.ct_number === i);
      forms.push({
        ct_number: i,
        marks_obtained: ct && (ct.marks_obtained > 0 || ct.total_marks > 0) ? String(ct.marks_obtained) : '',
        total_marks: ct && ct.total_marks > 0 ? String(ct.total_marks) : '',
      });
    }
    return forms;
  });

  const [assignmentObtained, setAssignmentObtained] = useState<string>(
    course.assignment_obtained > 0 || course.assignment_total_marks > 0 ? String(course.assignment_obtained) : ''
  );
  const [assignmentTotal, setAssignmentTotal] = useState<string>(
    course.assignment_total_marks > 0 ? String(course.assignment_total_marks) : ''
  );

  // Manual attendance % if not linked
  const linkedSubject = course.attendance_linked && course.attendance_course_id
    ? attendanceSubjects.find((s) => s.id === course.attendance_course_id)
    : null;
  const [manualAttendance, setManualAttendance] = useState<string>(
    linkedSubject ? String(linkedSubject.attendance_percentage.toFixed(1)) : ''
  );

  const [isSaving, setIsSaving] = useState(false);

  // -- Active grade scale --
  const activeScale = useMemo(() => {
    if (course.grade_scale_id) return gradeScales.find((s) => s.id === course.grade_scale_id);
    return gradeScales.find((s) => s.is_global);
  }, [course.grade_scale_id, gradeScales]);

  // -- Completeness check --
  const ctsFilled = useMemo(() => {
    if (ctForms.length === 0) return true; // no CTs configured → not blocking
    return ctForms.every(
      (f) => f.marks_obtained !== '' && f.total_marks !== '' &&
             Number(f.total_marks) > 0
    );
  }, [ctForms]);

  const assignmentFilled = useMemo(() => {
    if (Number(course.assignment_weight) <= 0) return true; // not configured → not blocking
    return assignmentObtained !== '' && assignmentTotal !== '' && Number(assignmentTotal) > 0;
  }, [course.assignment_weight, assignmentObtained, assignmentTotal]);

  const attendanceFilled = useMemo(() => {
    if (Number(course.attendance_weight) <= 0) return true; // not configured → not blocking
    if (linkedSubject) return true; // auto-linked → always filled
    return manualAttendance !== '' && Number(manualAttendance) >= 0;
  }, [course.attendance_weight, linkedSubject, manualAttendance]);

  const allFilled = ctsFilled && assignmentFilled && attendanceFilled;

  // -- Build a synthetic course & classTests for calculation --
  const syntheticCourse: AutoCourse = {
    ...course,
    assignment_obtained: assignmentObtained !== '' ? Number(assignmentObtained) : 0,
    assignment_total_marks: assignmentTotal !== '' ? Number(assignmentTotal) : Number(course.assignment_total_marks),
  };

  const syntheticClassTests: ClassTest[] = ctForms
    .filter((f) => f.marks_obtained !== '' && f.total_marks !== '')
    .map((f) => ({
      id: '',
      course_id: course.id,
      ct_number: f.ct_number,
      marks_obtained: Number(f.marks_obtained),
      total_marks: Number(f.total_marks),
      is_counted: false,
    }));

  const attendancePct = linkedSubject
    ? linkedSubject.attendance_percentage
    : (manualAttendance !== '' ? Number(manualAttendance) : 0);

  // -- Live breakdown (only used if allFilled) --
  const breakdown = useMemo(() => {
    if (!allFilled) return null;
    return calculateCourseBreakdown(
      syntheticCourse,
      syntheticClassTests,
      attendancePct,
      activeScale?.mappings || []
    );
  }, [allFilled, syntheticCourse, syntheticClassTests, attendancePct, activeScale]);

  // -- CT processed for display --
  const ctProcessed = useMemo(() => {
    return processClassTests(syntheticClassTests, Number(course.ct_best_of) || 0);
  }, [syntheticClassTests, course.ct_best_of]);

  // -- Missing fields list for user guidance --
  const missingFields: string[] = [];
  if (!ctsFilled && ctForms.length > 0) {
    const missing = ctForms.filter(
      (f) => f.marks_obtained === '' || f.total_marks === ''
    ).length;
    missingFields.push(`${missing} CT mark${missing > 1 ? 's' : ''}`);
  }
  if (!assignmentFilled) missingFields.push('assignment marks');
  if (!attendanceFilled) missingFields.push('attendance %');

  // -- Save handler --
  const handleSave = async () => {
    if (!allFilled) {
      toast.error('Please fill all required marks before saving, Sir.');
      return;
    }
    setIsSaving(true);
    try {
      const courseRes = await saveAutoCourse({
        id: course.id,
        course_name: course.course_name,
        course_code: course.course_code || undefined,
        credit_hours: Number(course.credit_hours),
        target_grade_point: Number(course.target_grade_point),
        grade_scale_id: course.grade_scale_id || undefined,
        ct_total: Number(course.ct_total),
        ct_best_of: Number(course.ct_best_of),
        ct_weight: Number(course.ct_weight),
        assignment_total_marks: Number(assignmentTotal) || Number(course.assignment_total_marks),
        assignment_obtained: Number(assignmentObtained) || 0,
        assignment_weight: Number(course.assignment_weight),
        attendance_linked: course.attendance_linked,
        attendance_course_id: course.attendance_course_id || undefined,
        attendance_total_marks: Number(course.attendance_total_marks),
        attendance_threshold_percentage: Number(course.attendance_threshold_percentage),
        attendance_weight: Number(course.attendance_weight),
        exam_weight: Number(course.exam_weight),
      });

      if (!courseRes.success) {
        toast.error(`Failed to save: ${courseRes.error}`);
        return;
      }

      const validCTs = ctForms
        .filter((f) => f.total_marks !== '' && Number(f.total_marks) > 0)
        .map((f) => ({
          ct_number: f.ct_number,
          marks_obtained: Number(f.marks_obtained) || 0,
          total_marks: Number(f.total_marks),
        }));

      const ctRes = await saveClassTests(course.id, validCTs);
      if (!ctRes.success) {
        toast.error(`Marks saved, but CTs failed: ${ctRes.error}`);
        return;
      }

      toast.success('Marks updated with precision, Sir.');
      onSaved({
        ...syntheticCourse,
        cgpa_class_tests: validCTs.map((ct, i) => ({
          id: String(i),
          course_id: course.id,
          ct_number: ct.ct_number,
          marks_obtained: ct.marks_obtained,
          total_marks: ct.total_marks,
          is_counted: false,
        })),
      });
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
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-md"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          className="relative w-full max-w-2xl bg-bg rounded-[40px] shadow-[0_20px_60px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col max-h-[92vh] border-b-8 border-[#92400e]/10"
        >
          {/* Header */}
          <div className="px-8 py-7 border-b border-border-strong flex justify-between items-center bg-white/50 shrink-0">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#92400e] flex items-center justify-center text-white shadow-lg shadow-[#92400e]/20">
                <BarChart2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-ink truncate max-w-[280px]">{course.course_name}</h3>
                <p className="text-[10px] font-black text-ink-3 uppercase tracking-widest">Update Marks & Predict</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white rounded-xl transition-colors">
              <X className="w-6 h-6 text-ink-3" />
            </button>
          </div>

          {/* Scrollable body */}
          <div className="overflow-y-auto flex-1 p-8 space-y-8">

            {/* ── CT MARKS ── */}
            {ctForms.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                    <FlaskConical className="w-4 h-4 text-blue-700" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-ink uppercase tracking-widest">Class Tests</h4>
                    <p className="text-[10px] text-ink-3 font-medium">
                      Best {Number(course.ct_best_of)} of {Number(course.ct_total)} · Weight: {Number(course.ct_weight)}%
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-border-strong overflow-hidden">
                  <div className="grid grid-cols-[56px_1fr_1fr_72px] gap-0 bg-stone-50 px-4 py-2.5">
                    <span className="text-[10px] font-black text-ink-3 uppercase tracking-widest">CT #</span>
                    <span className="text-[10px] font-black text-ink-3 uppercase tracking-widest">Obtained</span>
                    <span className="text-[10px] font-black text-ink-3 uppercase tracking-widest">Total</span>
                    <span className="text-[10px] font-black text-ink-3 uppercase tracking-widest text-right">%</span>
                  </div>
                  {ctForms.map((ct, i) => {
                    const processed = ctProcessed.results.find((r) => r.ct_number === ct.ct_number);
                    const isCounted = processed?.is_counted || false;
                    const pct = processed?.percentage;
                    const isIncomplete = ct.marks_obtained === '' || ct.total_marks === '';

                    return (
                      <div
                        key={ct.ct_number}
                        className={`grid grid-cols-[56px_1fr_1fr_72px] gap-0 px-4 py-2 border-t border-stone-100 items-center transition-colors ${
                          isCounted ? 'bg-emerald-50/60' :
                          processed && !isCounted ? 'bg-stone-50/40 opacity-60' : ''
                        }`}
                      >
                        <span className={`text-sm font-bold ${isCounted ? 'text-emerald-700' : 'text-ink-3'}`}>
                          CT {ct.ct_number}
                        </span>
                        <input
                          type="number"
                          value={ct.marks_obtained}
                          onChange={(e) => {
                            const updated = [...ctForms];
                            updated[i] = { ...updated[i], marks_obtained: e.target.value };
                            setCTForms(updated);
                          }}
                          className={`px-3 py-1.5 rounded-lg border text-sm font-bold outline-none transition-all mr-2 w-full ${
                            isIncomplete && ct.marks_obtained === ''
                              ? 'border-amber-300 bg-amber-50 focus:border-[#92400e]'
                              : 'border-stone-100 bg-white focus:border-blue-400'
                          }`}
                          min="0"
                          placeholder="0"
                        />
                        <input
                          type="number"
                          value={ct.total_marks}
                          onChange={(e) => {
                            const updated = [...ctForms];
                            updated[i] = { ...updated[i], total_marks: e.target.value };
                            setCTForms(updated);
                          }}
                          className={`px-3 py-1.5 rounded-lg border text-sm font-bold outline-none transition-all mr-2 w-full ${
                            isIncomplete && ct.total_marks === ''
                              ? 'border-amber-300 bg-amber-50 focus:border-[#92400e]'
                              : 'border-stone-100 bg-white focus:border-blue-400'
                          }`}
                          min="0"
                          placeholder="0"
                        />
                        <span className={`text-sm font-bold text-right ${isCounted ? 'text-emerald-700' : 'text-ink-3'}`}>
                          {pct !== undefined ? `${pct.toFixed(1)}%` : '—'}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {ctProcessed.results.length > 0 && (
                  <p className="text-xs font-bold text-ink-3 px-1">
                    CT Average (Best {Number(course.ct_best_of)} of {ctProcessed.results.length}):{' '}
                    <span className="text-blue-700 font-black">{ctProcessed.average.toFixed(2)}%</span>
                  </p>
                )}
              </div>
            )}

            {/* ── ASSIGNMENT MARKS ── */}
            {Number(course.assignment_weight) > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                    <ClipboardList className="w-4 h-4 text-amber-700" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-ink uppercase tracking-widest">Assignments</h4>
                    <p className="text-[10px] text-ink-3 font-medium">Weight: {Number(course.assignment_weight)}%</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-ink-3 uppercase tracking-widest">Marks Obtained</label>
                    <input
                      type="number"
                      value={assignmentObtained}
                      onChange={(e) => setAssignmentObtained(e.target.value)}
                      placeholder="0"
                      className={`w-full px-4 py-3 rounded-xl border-2 text-sm font-bold outline-none transition-all ${
                        assignmentObtained === ''
                          ? 'border-amber-300 bg-amber-50 focus:border-[#92400e]'
                          : 'border-stone-100 bg-white focus:border-amber-400'
                      }`}
                      min="0"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-ink-3 uppercase tracking-widest">Total Marks</label>
                    <input
                      type="number"
                      value={assignmentTotal}
                      onChange={(e) => setAssignmentTotal(e.target.value)}
                      placeholder="0"
                      className={`w-full px-4 py-3 rounded-xl border-2 text-sm font-bold outline-none transition-all ${
                        assignmentTotal === ''
                          ? 'border-amber-300 bg-amber-50 focus:border-[#92400e]'
                          : 'border-stone-100 bg-white focus:border-amber-400'
                      }`}
                      min="0"
                    />
                  </div>
                </div>
                {assignmentObtained !== '' && assignmentTotal !== '' && Number(assignmentTotal) > 0 && (
                  <p className="text-xs font-bold text-ink-3 px-1">
                    Score: <span className="text-amber-700 font-black">
                      {((Number(assignmentObtained) / Number(assignmentTotal)) * 100).toFixed(1)}%
                    </span>
                    {' · '}Contribution: <span className="text-amber-700 font-black">
                      {((Number(assignmentObtained) / Number(assignmentTotal)) * Number(course.assignment_weight)).toFixed(2)}
                    </span> / {course.assignment_weight}
                  </p>
                )}
              </div>
            )}

            {/* ── ATTENDANCE ── */}
            {Number(course.attendance_weight) > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
                    <CalendarCheck className="w-4 h-4 text-green-700" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-ink uppercase tracking-widest">Attendance</h4>
                    <p className="text-[10px] text-ink-3 font-medium">
                      Weight: {Number(course.attendance_weight)}% · Threshold: {Number(course.attendance_threshold_percentage)}%
                    </p>
                  </div>
                </div>
                {linkedSubject ? (
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-green-50 border border-green-100">
                    <CalendarCheck className="w-5 h-5 text-green-600 shrink-0" />
                    <div>
                      <p className="text-sm font-black text-green-800">
                        Auto-linked: {linkedSubject.name}
                      </p>
                      <p className="text-xs font-bold text-green-600">
                        Current attendance: {linkedSubject.attendance_percentage.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-ink-3 uppercase tracking-widest">Attendance %</label>
                    <input
                      type="number"
                      value={manualAttendance}
                      onChange={(e) => setManualAttendance(e.target.value)}
                      placeholder="0"
                      className={`w-full px-4 py-3 rounded-xl border-2 text-sm font-bold outline-none transition-all ${
                        manualAttendance === ''
                          ? 'border-amber-300 bg-amber-50 focus:border-[#92400e]'
                          : 'border-stone-100 bg-white focus:border-green-400'
                      }`}
                      min="0"
                      max="100"
                    />
                  </div>
                )}
              </div>
            )}

            {/* ── PREDICTION RESULT ── */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4 text-violet-700" />
                </div>
                <h4 className="text-sm font-black text-ink uppercase tracking-widest">Exam Prediction</h4>
              </div>

              {!allFilled ? (
                /* LOCKED STATE */
                <div className="p-6 rounded-2xl border-2 border-dashed border-border-strong bg-stone-50/80 flex flex-col items-center justify-center text-center gap-3">
                  <Lock className="w-8 h-8 text-ink-3" />
                  <div>
                    <p className="text-sm font-black text-ink">Prediction Locked</p>
                    <p className="text-xs font-medium text-ink-3 mt-1">
                      Still missing: <span className="font-black text-amber-600">{missingFields.join(', ')}</span>
                    </p>
                    <p className="text-[11px] text-ink-4 mt-1">Fill all fields above to unlock your exam target.</p>
                  </div>
                </div>
              ) : breakdown?.targetAlreadyAchieved ? (
                /* ALREADY ACHIEVED */
                <div className="p-6 rounded-2xl border-2 border-emerald-200 bg-emerald-50 flex items-start gap-4">
                  <PartyPopper className="w-7 h-7 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-base font-black text-emerald-800">Target Already Achieved!</p>
                    <p className="text-xs font-medium text-emerald-600 mt-1">
                      Your current marks already guarantee your target grade point of{' '}
                      <span className="font-black">{Number(course.target_grade_point).toFixed(2)}</span>.
                      Any exam score will do, Sir.
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                      <span className="px-3 py-1.5 rounded-full bg-emerald-200 text-emerald-800 text-xs font-black">
                        Predicted GP: {breakdown.predictedGradePoint.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ) : !breakdown?.targetAchievable ? (
                /* UNREACHABLE */
                <div className="p-6 rounded-2xl border-2 border-red-200 bg-red-50 flex items-start gap-4">
                  <AlertTriangle className="w-7 h-7 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-base font-black text-red-800">Target Not Achievable</p>
                    <p className="text-xs font-medium text-red-600 mt-1">
                      You would need{' '}
                      <span className="font-black text-red-700">
                        {((breakdown?.requiredExamPercentage / 100) * breakdown.examWeight).toFixed(1)} / {breakdown.examWeight}
                      </span>{' '}
                      in the exam — which exceeds 100%. Sir, this goal cannot be reached with the current marks.
                    </p>
                    <p className="text-[11px] text-red-500 mt-2">
                      Consider adjusting your target grade point or reviewing your other assessments.
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                      <span className="px-3 py-1.5 rounded-full bg-red-100 text-red-700 text-xs font-black">
                        Best Possible GP: {breakdown?.predictedGradePoint.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                /* ACHIEVABLE — show required exam score */
                <div className="p-6 rounded-2xl border-2 border-[#92400e]/20 bg-[#92400e]/5 flex items-start gap-4">
                  <Target className="w-7 h-7 text-[#92400e] shrink-0 mt-0.5" />
                  <div className="w-full">
                    <p className="text-base font-black text-[#78350f]">
                      You need{' '}
                      <span className="text-2xl text-[#92400e]">
                        {Math.max(0, (breakdown.requiredExamPercentage / 100) * breakdown.examWeight).toFixed(1)} / {breakdown.examWeight}
                      </span>{' '}
                      in the Written Exam
                    </p>
                    <p className="text-xs font-medium text-[#92400e]/70 mt-1">
                      (equivalent to {breakdown.requiredExamPercentage.toFixed(1)}% of exam weight)
                    </p>
                    <p className="text-xs font-medium text-[#92400e]/70 mt-1">
                      to achieve your target grade point of{' '}
                      <span className="font-black">{Number(course.target_grade_point).toFixed(2)}</span>.
                    </p>

                    {/* Score breakdown mini-table */}
                    <div className="mt-4 grid grid-cols-3 gap-3">
                      <div className="p-3 rounded-xl bg-white border border-border-strong">
                        <p className="text-[10px] font-black text-ink-3 uppercase tracking-widest mb-1">CT Score</p>
                        <p className="text-lg font-black text-blue-700">{breakdown?.ctAverage.toFixed(1)}%</p>
                      </div>
                      <div className="p-3 rounded-xl bg-white border border-border-strong">
                        <p className="text-[10px] font-black text-ink-3 uppercase tracking-widest mb-1">Pre-Exam</p>
                        <p className="text-lg font-black text-ink">{breakdown?.currentWeightedScore.toFixed(2)}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-white border border-border-strong">
                        <p className="text-[10px] font-black text-ink-3 uppercase tracking-widest mb-1">Predicted GP</p>
                        <p className="text-lg font-black text-[#92400e]">{breakdown?.predictedGradePoint.toFixed(2)}</p>
                      </div>
                    </div>

                    {/* Urgency indicator */}
                    <div className="mt-3">
                      {(breakdown?.requiredExamPercentage ?? 0) >= 80 && (
                        <p className="text-xs font-black text-amber-600 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          High exam score required — aim for above {Math.max(0, (breakdown.requiredExamPercentage / 100) * breakdown.examWeight).toFixed(1)} / {breakdown.examWeight}.
                        </p>
                      )}
                      {(breakdown?.requiredExamPercentage ?? 0) < 60 && (
                        <p className="text-xs font-black text-emerald-600 flex items-center gap-1">
                          <PartyPopper className="w-3.5 h-3.5" />
                          You're on track — stay focused, Sir!
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-6 bg-white/50 border-t border-border-strong flex justify-end gap-4 shrink-0">
            <button
              onClick={onClose}
              className="px-8 py-3.5 text-xs font-black text-ink-3 hover:text-ink uppercase tracking-widest transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || !allFilled}
              className="flex items-center gap-2 bg-[#92400e] text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-[#78350f] transition-all disabled:opacity-50 shadow-xl shadow-[#92400e]/20 active:scale-95"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : allFilled ? 'Save Marks' : 'Fill All Fields First'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
