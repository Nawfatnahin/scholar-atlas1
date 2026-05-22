'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Save,
  Trash2,
  FlaskConical,
  ClipboardList,
  CalendarCheck,
  FileText,
  Target,
  AlertTriangle,
  PartyPopper,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { toast } from 'sonner';
import type { AutoCourse, ClassTest, GradeScale, AttendanceSubject, CTForm } from '@/lib/cgpa/cgpa-types';
import {
  processClassTests,
  calculateCourseBreakdown,
} from '@/lib/cgpa/cgpa-calculator';
import { saveAutoCourse, saveClassTests, deleteAutoCourse } from '@/app/dashboard/cgpa/actions';

interface AutoCourseCardProps {
  course: AutoCourse;
  gradeScales: GradeScale[];
  attendanceSubjects: AttendanceSubject[];
  onCourseChange: (course: AutoCourse) => void;
  onCourseDelete: (id: string) => void;
}

export function AutoCourseCard({
  course,
  gradeScales,
  attendanceSubjects,
  onCourseChange,
  onCourseDelete,
}: AutoCourseCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Local editable state
  const [localCourse, setLocalCourse] = useState<AutoCourse>({ ...course });
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

  // Regenerate CT forms when ct_total changes
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

  // Get the active grade scale for this course
  const activeScale = useMemo(() => {
    if (localCourse.grade_scale_id) {
      return gradeScales.find((s) => s.id === localCourse.grade_scale_id);
    }
    return gradeScales.find((s) => s.is_global);
  }, [localCourse.grade_scale_id, gradeScales]);

  // Get attendance percentage for linked course
  const linkedAttendance = useMemo(() => {
    if (!localCourse.attendance_linked || !localCourse.attendance_course_id) return 0;
    const subject = attendanceSubjects.find((s) => s.id === localCourse.attendance_course_id);
    return subject?.attendance_percentage || 0;
  }, [localCourse.attendance_linked, localCourse.attendance_course_id, attendanceSubjects]);

  // Process CT results
  const ctProcessed = useMemo(() => {
    const classTests: ClassTest[] = ctForms
      .filter((f) => f.marks_obtained !== '' && f.total_marks !== '')
      .map((f) => ({
        id: '',
        course_id: course.id,
        ct_number: f.ct_number,
        marks_obtained: Number(f.marks_obtained),
        total_marks: Number(f.total_marks),
        is_counted: false,
      }));
    return processClassTests(classTests, Number(localCourse.ct_best_of) || 0);
  }, [ctForms, localCourse.ct_best_of, course.id]);

  // Full course breakdown
  const breakdown = useMemo(() => {
    const classTests: ClassTest[] = ctForms
      .filter((f) => f.marks_obtained !== '' && f.total_marks !== '')
      .map((f) => ({
        id: '',
        course_id: course.id,
        ct_number: f.ct_number,
        marks_obtained: Number(f.marks_obtained),
        total_marks: Number(f.total_marks),
        is_counted: false,
      }));

    return calculateCourseBreakdown(
      localCourse,
      classTests,
      linkedAttendance,
      activeScale?.mappings || []
    );
  }, [localCourse, ctForms, linkedAttendance, activeScale, course.id]);

  // Validation
  const validate = useCallback((): string | null => {
    if (Number(localCourse.ct_best_of) > Number(localCourse.ct_total)) {
      return 'Best-of count cannot exceed total CT count.';
    }
    if (Number(localCourse.assignment_obtained) > Number(localCourse.assignment_total_marks)) {
      return 'Assignment marks obtained cannot exceed total marks.';
    }
    const totalWeight = Number(localCourse.ct_weight) + Number(localCourse.assignment_weight) +
      Number(localCourse.attendance_weight) + Number(localCourse.exam_weight);
    if (Math.abs(totalWeight - 100) > 0.01) {
      return `Total weights must equal 100%. Currently: ${totalWeight.toFixed(1)}%`;
    }
    for (const ct of ctForms) {
      if (ct.marks_obtained !== '' && ct.total_marks !== '') {
        if (Number(ct.marks_obtained) > Number(ct.total_marks)) {
          return `CT ${ct.ct_number}: marks obtained cannot exceed total marks.`;
        }
        if (Number(ct.marks_obtained) < 0 || Number(ct.total_marks) < 0) {
          return `CT ${ct.ct_number}: marks cannot be negative.`;
        }
      }
    }
    return null;
  }, [localCourse, ctForms]);

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

      // Save CTs
      const validCTs = ctForms
        .filter((f) => f.total_marks !== '' && Number(f.total_marks) > 0)
        .map((f) => ({
          ct_number: f.ct_number,
          marks_obtained: Number(f.marks_obtained) || 0,
          total_marks: Number(f.total_marks),
        }));

      const ctRes = await saveClassTests(course.id, validCTs);
      if (!ctRes.success) {
        toast.error(`Course saved, but CTs failed: ${ctRes.error}`);
        return;
      }

      toast.success('Course data saved with precision, Sir.');
      onCourseChange({ ...localCourse });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      const res = await deleteAutoCourse(course.id);
      if (res.success) {
        toast.success('Course removed, Sir.');
        onCourseDelete(course.id);
      } else {
        toast.error(`Failed: ${res.error}`);
      }
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const gradePointOptions = useMemo(() => {
    if (!activeScale) return [];
    return [...activeScale.mappings]
      .sort((a, b) => b.gradePoint - a.gradePoint)
      .map((m) => m.gradePoint)
      .filter((v, i, arr) => arr.indexOf(v) === i);
  }, [activeScale]);

  // Remaining weight auto-calc hint
  const totalWeight = Number(localCourse.ct_weight) + Number(localCourse.assignment_weight) + Number(localCourse.attendance_weight) + Number(localCourse.exam_weight);

  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-[32px] border border-border-strong shadow-[0_10px_30px_rgba(0,0,0,0.03)] overflow-hidden">
      {/* Card Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-6 sm:p-8 hover:bg-stone-50/50 transition-colors text-left"
      >
        <div className="flex items-center gap-4 min-w-0">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
            !breakdown.targetAchievable ? 'bg-red-100' :
            breakdown.targetAlreadyAchieved ? 'bg-emerald-100' :
            'bg-amber-100'
          }`}>
            {breakdown.targetAlreadyAchieved ? (
              <PartyPopper className="w-5 h-5 text-emerald-700" />
            ) : !breakdown.targetAchievable ? (
              <AlertTriangle className="w-5 h-5 text-red-700" />
            ) : (
              <Target className="w-5 h-5 text-amber-700" />
            )}
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-black text-ink tracking-tight truncate">{localCourse.course_name}</h3>
            <p className="text-xs font-medium text-ink-3">
              {localCourse.course_code && `${localCourse.course_code} · `}
              {Number(localCourse.credit_hours).toFixed(1)} credits · Target: {Number(localCourse.target_grade_point).toFixed(2)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0 ml-4">
          {breakdown.targetAlreadyAchieved ? (
            <span className="hidden sm:inline px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-widest">Achieved</span>
          ) : !breakdown.targetAchievable ? (
            <span className="hidden sm:inline px-3 py-1 rounded-full bg-red-50 text-red-700 text-[10px] font-black uppercase tracking-widest">At Risk</span>
          ) : (
            <span className="hidden sm:inline px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-[10px] font-black uppercase tracking-widest">
              Need {Math.max(0, breakdown.requiredExamPercentage).toFixed(1)}%
            </span>
          )}
          {expanded ? <ChevronUp className="w-5 h-5 text-ink-3" /> : <ChevronDown className="w-5 h-5 text-ink-3" />}
        </div>
      </button>

      {/* Expanded Content */}
      {expanded && (
        <div className="px-6 sm:px-8 pb-6 sm:pb-8 space-y-8">
          {/* Course Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-ink-3 uppercase tracking-widest">Course Name</label>
              <input type="text" value={localCourse.course_name} onChange={(e) => setLocalCourse({ ...localCourse, course_name: e.target.value })} className="w-full px-4 py-3 rounded-xl border-2 border-stone-100 bg-white font-bold text-sm outline-none focus:border-[#92400e] transition-all" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-ink-3 uppercase tracking-widest">Course Code</label>
              <input type="text" value={localCourse.course_code || ''} onChange={(e) => setLocalCourse({ ...localCourse, course_code: e.target.value })} className="w-full px-4 py-3 rounded-xl border-2 border-stone-100 bg-white font-bold text-sm outline-none focus:border-[#92400e] transition-all" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-ink-3 uppercase tracking-widest">Credit Hours</label>
              <input type="number" value={localCourse.credit_hours} onChange={(e) => setLocalCourse({ ...localCourse, credit_hours: Number(e.target.value) })} className="w-full px-4 py-3 rounded-xl border-2 border-stone-100 bg-white font-bold text-sm outline-none focus:border-[#92400e] transition-all" min="0.5" max="10" step="0.5" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-ink-3 uppercase tracking-widest">Target Grade Point</label>
              <select value={localCourse.target_grade_point} onChange={(e) => setLocalCourse({ ...localCourse, target_grade_point: Number(e.target.value) })} className="w-full px-4 py-3 rounded-xl border-2 border-stone-100 bg-white font-bold text-sm outline-none focus:border-[#92400e] transition-all">
                <option value="">Select</option>
                {gradePointOptions.map((gp) => (
                  <option key={gp} value={gp}>{gp.toFixed(2)}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Optional custom grade scale */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-ink-3 uppercase tracking-widest">Grade Scale Override (Optional)</label>
            <select value={localCourse.grade_scale_id || ''} onChange={(e) => setLocalCourse({ ...localCourse, grade_scale_id: e.target.value || null })} className="w-full px-4 py-3 rounded-xl border-2 border-stone-100 bg-white font-bold text-sm outline-none focus:border-[#92400e] transition-all">
              <option value="">Use Global Scale</option>
              {gradeScales.map((s) => (
                <option key={s.id} value={s.id}>{s.scale_name} ({s.mappings.length} thresholds)</option>
              ))}
            </select>
          </div>

          {/* ── CT SECTION ── */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center">
                <FlaskConical className="w-4 h-4 text-blue-700" />
              </div>
              <h4 className="text-sm font-black text-ink uppercase tracking-widest">Class Tests</h4>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-ink-3 uppercase tracking-widest">Total CTs</label>
                <input type="number" value={localCourse.ct_total} onChange={(e) => handleCTTotalChange(Number(e.target.value))} className="w-full px-4 py-3 rounded-xl border-2 border-stone-100 bg-white font-bold text-sm outline-none focus:border-blue-400 transition-all" min="0" max="20" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-ink-3 uppercase tracking-widest">Best Of</label>
                <input type="number" value={localCourse.ct_best_of} onChange={(e) => setLocalCourse({ ...localCourse, ct_best_of: Number(e.target.value) })} className="w-full px-4 py-3 rounded-xl border-2 border-stone-100 bg-white font-bold text-sm outline-none focus:border-blue-400 transition-all" min="0" max={Number(localCourse.ct_total)} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-ink-3 uppercase tracking-widest">CT Weight (%)</label>
                <input type="number" value={localCourse.ct_weight} onChange={(e) => setLocalCourse({ ...localCourse, ct_weight: Number(e.target.value) })} className="w-full px-4 py-3 rounded-xl border-2 border-stone-100 bg-white font-bold text-sm outline-none focus:border-blue-400 transition-all" min="0" max="100" />
              </div>
            </div>

            {/* CT Input Rows */}
            {ctForms.length > 0 && (
              <div className="rounded-2xl border border-stone-100 overflow-hidden">
                <div className="grid grid-cols-[60px_1fr_1fr_80px] gap-0 bg-stone-50 px-4 py-2.5">
                  <span className="text-[10px] font-black text-ink-3 uppercase tracking-widest">CT #</span>
                  <span className="text-[10px] font-black text-ink-3 uppercase tracking-widest">Obtained</span>
                  <span className="text-[10px] font-black text-ink-3 uppercase tracking-widest">Total</span>
                  <span className="text-[10px] font-black text-ink-3 uppercase tracking-widest text-right">%</span>
                </div>
                {ctForms.map((ct, i) => {
                  const processed = ctProcessed.results.find((r) => r.ct_number === ct.ct_number);
                  const isCounted = processed?.is_counted || false;
                  const pct = processed?.percentage;

                  return (
                    <div
                      key={ct.ct_number}
                      className={`grid grid-cols-[60px_1fr_1fr_80px] gap-0 px-4 py-2 border-t border-stone-50 items-center transition-colors ${
                        isCounted ? 'bg-emerald-50/60' : processed && !isCounted ? 'bg-stone-50/60 opacity-60' : ''
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
                        className="px-3 py-1.5 rounded-lg border border-stone-100 bg-white text-sm font-bold outline-none focus:border-blue-400 transition-all mr-2 w-full"
                        min="0"
                        placeholder="—"
                      />
                      <input
                        type="number"
                        value={ct.total_marks}
                        onChange={(e) => {
                          const updated = [...ctForms];
                          updated[i] = { ...updated[i], total_marks: e.target.value };
                          setCTForms(updated);
                        }}
                        className="px-3 py-1.5 rounded-lg border border-stone-100 bg-white text-sm font-bold outline-none focus:border-blue-400 transition-all mr-2 w-full"
                        min="0"
                        placeholder="—"
                      />
                      <span className={`text-sm font-bold text-right ${isCounted ? 'text-emerald-700' : 'text-ink-3'}`}>
                        {pct !== undefined ? `${pct.toFixed(1)}%` : '—'}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {ctProcessed.results.length > 0 && (
              <p className="text-xs font-bold text-ink-3">
                CT Average (Best {Number(localCourse.ct_best_of)} of {ctProcessed.results.length}):{' '}
                <span className="text-blue-700 font-black">{ctProcessed.average.toFixed(2)}%</span>
              </p>
            )}
          </div>

          {/* ── ASSIGNMENT SECTION ── */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center">
                <ClipboardList className="w-4 h-4 text-amber-700" />
              </div>
              <h4 className="text-sm font-black text-ink uppercase tracking-widest">Assignments</h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-ink-3 uppercase tracking-widest">Total Marks</label>
                <input type="number" value={localCourse.assignment_total_marks} onChange={(e) => setLocalCourse({ ...localCourse, assignment_total_marks: Number(e.target.value) })} className="w-full px-4 py-3 rounded-xl border-2 border-stone-100 bg-white font-bold text-sm outline-none focus:border-amber-400 transition-all" min="0" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-ink-3 uppercase tracking-widest">Marks Obtained</label>
                <input type="number" value={localCourse.assignment_obtained} onChange={(e) => setLocalCourse({ ...localCourse, assignment_obtained: Number(e.target.value) })} className="w-full px-4 py-3 rounded-xl border-2 border-stone-100 bg-white font-bold text-sm outline-none focus:border-amber-400 transition-all" min="0" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-ink-3 uppercase tracking-widest">Weight (%)</label>
                <input type="number" value={localCourse.assignment_weight} onChange={(e) => setLocalCourse({ ...localCourse, assignment_weight: Number(e.target.value) })} className="w-full px-4 py-3 rounded-xl border-2 border-stone-100 bg-white font-bold text-sm outline-none focus:border-amber-400 transition-all" min="0" max="100" />
              </div>
            </div>

            {Number(localCourse.assignment_total_marks) > 0 && (
              <p className="text-xs font-bold text-ink-3">
                Assignment Contribution:{' '}
                <span className="text-amber-700 font-black">{breakdown.assignmentScore.toFixed(2)}</span>
                <span className="text-ink-4"> / {Number(localCourse.assignment_weight).toFixed(0)}</span>
              </p>
            )}
          </div>

          {/* ── ATTENDANCE SECTION ── */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-green-100 flex items-center justify-center">
                  <CalendarCheck className="w-4 h-4 text-green-700" />
                </div>
                <h4 className="text-sm font-black text-ink uppercase tracking-widest">Attendance</h4>
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
                    <label className="text-[10px] font-black text-ink-3 uppercase tracking-widest">Attendance Total Marks</label>
                    <input type="number" value={localCourse.attendance_total_marks} onChange={(e) => setLocalCourse({ ...localCourse, attendance_total_marks: Number(e.target.value) })} className="w-full px-4 py-3 rounded-xl border-2 border-stone-100 bg-white font-bold text-sm outline-none focus:border-green-400 transition-all" min="0" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-ink-3 uppercase tracking-widest">Threshold (%)</label>
                    <input type="number" value={localCourse.attendance_threshold_percentage} onChange={(e) => setLocalCourse({ ...localCourse, attendance_threshold_percentage: Number(e.target.value) })} className="w-full px-4 py-3 rounded-xl border-2 border-stone-100 bg-white font-bold text-sm outline-none focus:border-green-400 transition-all" min="0" max="100" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-ink-3 uppercase tracking-widest">Weight (%)</label>
                    <input type="number" value={localCourse.attendance_weight} onChange={(e) => setLocalCourse({ ...localCourse, attendance_weight: Number(e.target.value) })} className="w-full px-4 py-3 rounded-xl border-2 border-stone-100 bg-white font-bold text-sm outline-none focus:border-green-400 transition-all" min="0" max="100" />
                  </div>
                </div>

                {linkedAttendance > 0 && (
                  <p className="text-xs font-bold text-ink-3">
                    Attendance: <span className="text-green-700 font-black">{linkedAttendance.toFixed(1)}%</span>
                    {' · '}Marks Earned: <span className="text-green-700 font-black">{breakdown.attendanceMarks.toFixed(2)}</span>
                    <span className="text-ink-4"> / {Number(localCourse.attendance_total_marks).toFixed(0)}</span>
                  </p>
                )}
              </div>
            )}
          </div>

          {/* ── EXAM PREDICTION ── */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-violet-100 flex items-center justify-center">
                <FileText className="w-4 h-4 text-violet-700" />
              </div>
              <h4 className="text-sm font-black text-ink uppercase tracking-widest">Written Exam Prediction</h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-ink-3 uppercase tracking-widest">Exam Weight (%)</label>
                <input type="number" value={localCourse.exam_weight} onChange={(e) => setLocalCourse({ ...localCourse, exam_weight: Number(e.target.value) })} className="w-full px-4 py-3 rounded-xl border-2 border-stone-100 bg-white font-bold text-sm outline-none focus:border-violet-400 transition-all" min="0" max="100" />
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

            {/* Prediction Result */}
            <div className={`p-5 rounded-2xl border-2 ${
              breakdown.targetAlreadyAchieved
                ? 'border-emerald-200 bg-emerald-50'
                : !breakdown.targetAchievable
                  ? 'border-red-200 bg-red-50'
                  : 'border-amber-200 bg-amber-50'
            }`}>
              {breakdown.targetAlreadyAchieved ? (
                <div className="flex items-center gap-3">
                  <PartyPopper className="w-6 h-6 text-emerald-600 shrink-0" />
                  <div>
                    <p className="text-sm font-black text-emerald-800">Target Already Achieved!</p>
                    <p className="text-xs font-medium text-emerald-600 mt-1">
                      Your target grade point is already achieved regardless of exam performance.
                    </p>
                  </div>
                </div>
              ) : !breakdown.targetAchievable ? (
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-6 h-6 text-red-600 shrink-0" />
                  <div>
                    <p className="text-sm font-black text-red-800">Target Not Achievable</p>
                    <p className="text-xs font-medium text-red-600 mt-1">
                      You would need {breakdown.requiredExamPercentage.toFixed(1)}% in the exam, which exceeds 100%.
                      Consider adjusting your target grade point.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3">
                  <Target className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-black text-amber-800">
                      You need <span className="text-lg">{breakdown.requiredExamPercentage.toFixed(1)}%</span> in the written exam
                    </p>
                    <p className="text-xs font-medium text-amber-600 mt-1">
                      to achieve your target grade point of {Number(localCourse.target_grade_point).toFixed(2)}.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── COURSE SUMMARY ── */}
          <div className="bg-stone-50/80 rounded-2xl p-5 border border-stone-100 space-y-3">
            <h4 className="text-[10px] font-black text-ink-3 uppercase tracking-[0.3em]">Course Breakdown</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <p className="text-[10px] font-black text-ink-4 uppercase tracking-widest">CT Avg</p>
                <p className="text-lg font-black text-blue-700">{breakdown.ctAverage.toFixed(2)}%</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-ink-4 uppercase tracking-widest">Assignment</p>
                <p className="text-lg font-black text-amber-700">{breakdown.assignmentScore.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-ink-4 uppercase tracking-widest">Attendance</p>
                <p className="text-lg font-black text-green-700">
                  {localCourse.attendance_linked ? `${breakdown.attendanceMarks.toFixed(2)}` : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-black text-ink-4 uppercase tracking-widest">Weighted Score</p>
                <p className="text-lg font-black text-ink">{breakdown.currentWeightedScore.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-ink-4 uppercase tracking-widest">Required Exam</p>
                <p className={`text-lg font-black ${
                  breakdown.targetAlreadyAchieved ? 'text-emerald-700' :
                  !breakdown.targetAchievable ? 'text-red-700' :
                  'text-violet-700'
                }`}>
                  {breakdown.targetAlreadyAchieved ? '0%' :
                   !breakdown.targetAchievable ? '>100%' :
                   `${breakdown.requiredExamPercentage.toFixed(1)}%`}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-black text-ink-4 uppercase tracking-widest">Predicted GP</p>
                <p className="text-lg font-black text-[#92400e]">{breakdown.predictedGradePoint.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#92400e] text-white font-black text-xs uppercase tracking-widest hover:bg-[#78350f] transition-all active:scale-95 shadow-lg shadow-[#92400e]/20 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Course'}
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
