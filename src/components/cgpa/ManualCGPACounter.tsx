'use client';

import React, { useState, useMemo } from 'react';
import { Plus, Pencil, Trash2, Save, X, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import type { ManualCourse, GradeScale, ManualCourseForm } from '@/lib/cgpa/cgpa-types';
import { calculateManualCGPA, calculateWeightedContribution } from '@/lib/cgpa/cgpa-calculator';
import { saveManualCourse, deleteManualCourse } from '@/app/dashboard/cgpa/actions';
import { CGPAProgressBar } from './CGPAProgressBar';

interface ManualCGPACounterProps {
  courses: ManualCourse[];
  targetCGPA: number;
  gradeScales: GradeScale[];
  onCoursesChange: (courses: ManualCourse[]) => void;
}

const emptyForm: ManualCourseForm = {
  course_name: '',
  course_code: '',
  credit_hours: 3,
  grade_point_obtained: '',
};

export function ManualCGPACounter({ courses, targetCGPA, gradeScales, onCoursesChange }: ManualCGPACounterProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ManualCourseForm>(emptyForm);
  const [isSaving, setIsSaving] = useState(false);

  // Get grade point options from global scale
  const gradePointOptions = useMemo(() => {
    const globalScale = gradeScales.find((s) => s.is_global);
    if (!globalScale) return [];
    return [...globalScale.mappings]
      .sort((a, b) => b.gradePoint - a.gradePoint)
      .map((m) => m.gradePoint)
      .filter((v, i, arr) => arr.indexOf(v) === i); // unique values
  }, [gradeScales]);

  // Live CGPA calculation
  const currentCGPA = useMemo(() => calculateManualCGPA(courses), [courses]);
  const totalCredits = useMemo(() => courses.reduce((sum, c) => sum + Number(c.credit_hours), 0), [courses]);

  const handleStartEdit = (course: ManualCourse) => {
    setEditingId(course.id);
    setForm({
      course_name: course.course_name,
      course_code: course.course_code || '',
      credit_hours: course.credit_hours,
      grade_point_obtained: course.grade_point_obtained,
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleSave = async (existingId?: string) => {
    const name = String(form.course_name).trim();
    const credits = Number(form.credit_hours);
    const gradePoint = Number(form.grade_point_obtained);

    if (!name) {
      toast.error('Course name is required, Sir.');
      return;
    }
    if (credits <= 0 || isNaN(credits)) {
      toast.error('Credit hours must be a positive number, Sir.');
      return;
    }
    if (gradePoint < 0 || gradePoint > 4 || isNaN(gradePoint)) {
      toast.error('Grade point must be between 0 and 4.00, Sir.');
      return;
    }

    setIsSaving(true);
    try {
      const res = await saveManualCourse({
        id: existingId,
        course_name: name,
        course_code: String(form.course_code).trim() || undefined,
        credit_hours: credits,
        grade_point_obtained: gradePoint,
      });

      if (res.success) {
        toast.success(existingId ? 'Course updated, Sir.' : 'Course added to your CGPA tracker, Sir.');
        // Optimistic update
        if (existingId) {
          onCoursesChange(
            courses.map((c) =>
              c.id === existingId
                ? { ...c, course_name: name, course_code: form.course_code || null, credit_hours: credits, grade_point_obtained: gradePoint }
                : c
            )
          );
        } else {
          window.location.reload();
        }
        setEditingId(null);
        setIsAdding(false);
        setForm(emptyForm);
      } else {
        toast.error(`Failed: ${res.error}`);
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await deleteManualCourse(id);
      if (res.success) {
        toast.success('Course removed, Sir.');
        onCoursesChange(courses.filter((c) => c.id !== id));
      } else {
        toast.error(`Failed: ${res.error}`);
      }
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Course Table */}
      {courses.length > 0 && (
        <div className="bg-white/70 backdrop-blur-xl rounded-[32px] border border-border-strong shadow-[0_10px_30px_rgba(0,0,0,0.03)] overflow-hidden">
          {/* Table Header */}
          <div className="hidden md:grid grid-cols-[2fr_1.2fr_0.8fr_1fr_1fr_80px] gap-4 px-6 py-4 bg-stone-50/80 border-b border-stone-100">
            <span className="text-[10px] font-black text-ink-3 uppercase tracking-widest">Course</span>
            <span className="text-[10px] font-black text-ink-3 uppercase tracking-widest">Code</span>
            <span className="text-[10px] font-black text-ink-3 uppercase tracking-widest">Credits</span>
            <span className="text-[10px] font-black text-ink-3 uppercase tracking-widest">Grade Point</span>
            <span className="text-[10px] font-black text-ink-3 uppercase tracking-widest">Weighted</span>
            <span></span>
          </div>

          {/* Course Rows */}
          {courses.map((course) => {
            const isEditing = editingId === course.id;
            const weighted = calculateWeightedContribution(course);

            if (isEditing) {
              return (
                <div key={course.id} className="grid grid-cols-1 md:grid-cols-[2fr_1.2fr_0.8fr_1fr_1fr_80px] gap-3 md:gap-4 px-6 py-4 border-b border-stone-50 bg-amber-50/30">
                  <input
                    type="text"
                    value={form.course_name}
                    onChange={(e) => setForm({ ...form, course_name: e.target.value })}
                    className="px-3 py-2 rounded-lg border border-stone-200 bg-white text-sm font-bold outline-none focus:border-[#92400e] transition-all"
                    placeholder="Course Name"
                  />
                  <input
                    type="text"
                    value={form.course_code}
                    onChange={(e) => setForm({ ...form, course_code: e.target.value })}
                    className="px-3 py-2 rounded-lg border border-stone-200 bg-white text-sm font-bold outline-none focus:border-[#92400e] transition-all"
                    placeholder="Code"
                  />
                  <input
                    type="number"
                    value={form.credit_hours}
                    onChange={(e) => setForm({ ...form, credit_hours: e.target.value })}
                    className="px-3 py-2 rounded-lg border border-stone-200 bg-white text-sm font-bold outline-none focus:border-[#92400e] transition-all"
                    min="0.5"
                    max="10"
                    step="0.5"
                  />
                  <select
                    value={form.grade_point_obtained}
                    onChange={(e) => setForm({ ...form, grade_point_obtained: e.target.value })}
                    className="px-3 py-2 rounded-lg border border-stone-200 bg-white text-sm font-bold outline-none focus:border-[#92400e] transition-all"
                  >
                    <option value="">Select</option>
                    {gradePointOptions.map((gp) => (
                      <option key={gp} value={gp}>{gp.toFixed(2)}</option>
                    ))}
                  </select>
                  <div className="flex items-center text-sm font-bold text-ink-3">—</div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleSave(course.id)} disabled={isSaving} className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors">
                      <Save className="w-4 h-4" />
                    </button>
                    <button onClick={handleCancelEdit} className="p-1.5 rounded-lg text-ink-3 hover:bg-stone-100 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <div key={course.id} className="grid grid-cols-1 md:grid-cols-[2fr_1.2fr_0.8fr_1fr_1fr_80px] gap-2 md:gap-4 px-6 py-4 border-b border-stone-50 hover:bg-stone-50/50 transition-colors group">
                <div>
                  <span className="text-sm font-bold text-ink">{course.course_name}</span>
                  <span className="md:hidden text-xs text-ink-3 ml-2">{course.course_code}</span>
                </div>
                <span className="hidden md:block text-sm font-medium text-ink-2">{course.course_code || '—'}</span>
                <span className="text-sm font-bold text-ink">{Number(course.credit_hours).toFixed(1)}</span>
                <span className="text-sm font-black text-[#92400e]">{Number(course.grade_point_obtained).toFixed(2)}</span>
                <span className="text-sm font-bold text-ink-2">{weighted.toFixed(2)}</span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleStartEdit(course)} className="p-1.5 rounded-lg text-ink-3 hover:text-[#92400e] hover:bg-amber-50 transition-colors">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(course.id)} className="p-1.5 rounded-lg text-ink-3 hover:text-red-600 hover:bg-red-50 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}

          {/* Totals row */}
          <div className="grid grid-cols-1 md:grid-cols-[2fr_1.2fr_0.8fr_1fr_1fr_80px] gap-4 px-6 py-4 bg-stone-50/80">
            <span className="text-xs font-black text-ink uppercase tracking-widest">Total</span>
            <span></span>
            <span className="text-sm font-black text-ink">{totalCredits.toFixed(1)}</span>
            <span className="text-sm font-black text-[#92400e]">{currentCGPA.toFixed(2)}</span>
            <span className="text-sm font-bold text-ink-2">
              {courses.reduce((sum, c) => sum + calculateWeightedContribution(c), 0).toFixed(2)}
            </span>
            <span></span>
          </div>
        </div>
      )}

      {/* Add Course Form */}
      {isAdding && (
        <div className="bg-white/80 backdrop-blur-xl rounded-[28px] border border-border-strong p-6 shadow-sm">
          <h4 className="text-sm font-black text-ink uppercase tracking-widest mb-4">New Course</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-ink-3 uppercase tracking-widest">Course Name</label>
              <input
                type="text"
                value={form.course_name}
                onChange={(e) => setForm({ ...form, course_name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 border-stone-100 bg-white font-bold text-sm outline-none focus:border-[#92400e] transition-all"
                placeholder="e.g. Data Structures"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-ink-3 uppercase tracking-widest">Course Code</label>
              <input
                type="text"
                value={form.course_code}
                onChange={(e) => setForm({ ...form, course_code: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 border-stone-100 bg-white font-bold text-sm outline-none focus:border-[#92400e] transition-all"
                placeholder="Optional"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-ink-3 uppercase tracking-widest">Credit Hours</label>
              <input
                type="number"
                value={form.credit_hours}
                onChange={(e) => setForm({ ...form, credit_hours: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 border-stone-100 bg-white font-bold text-sm outline-none focus:border-[#92400e] transition-all"
                min="0.5"
                max="10"
                step="0.5"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-ink-3 uppercase tracking-widest">Grade Point</label>
              <select
                value={form.grade_point_obtained}
                onChange={(e) => setForm({ ...form, grade_point_obtained: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 border-stone-100 bg-white font-bold text-sm outline-none focus:border-[#92400e] transition-all"
              >
                <option value="">Select Grade Point</option>
                {gradePointOptions.map((gp) => (
                  <option key={gp} value={gp}>{gp.toFixed(2)}</option>
                ))}
                {gradePointOptions.length === 0 && (
                  <option disabled>Define a grade scale first</option>
                )}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-5">
            <button
              onClick={() => handleSave()}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#92400e] text-white font-black text-xs uppercase tracking-widest hover:bg-[#78350f] transition-all active:scale-95 shadow-lg shadow-[#92400e]/20 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Course'}
            </button>
            <button
              onClick={() => { setIsAdding(false); setForm(emptyForm); }}
              className="px-6 py-3 rounded-xl text-xs font-bold text-ink-3 hover:text-ink hover:bg-stone-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Add Course Button */}
      {!isAdding && (
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-3 px-6 py-4 rounded-[20px] bg-[#92400e] text-white font-black text-xs uppercase tracking-widest hover:-translate-y-1 transition-all active:scale-95 shadow-xl shadow-[#92400e]/20"
        >
          <Plus className="w-5 h-5" />
          Add Course
        </button>
      )}

      {/* Empty State */}
      {courses.length === 0 && !isAdding && (
        <div className="py-20 text-center bg-white/50 backdrop-blur-xl rounded-[40px] border-4 border-dashed border-border-strong flex flex-col items-center justify-center">
          <BookOpen className="w-12 h-12 text-[#92400e]/30 mb-4" />
          <h3 className="text-xl font-black text-ink mb-2">No Courses Registered</h3>
          <p className="text-ink-3 font-medium max-w-sm mb-6">
            Add your completed courses with their grade points to begin tracking your CGPA, Sir.
          </p>
        </div>
      )}

      {/* CGPA Summary */}
      {courses.length > 0 && (
        <div className="bg-white/70 backdrop-blur-xl rounded-[32px] border border-border-strong p-6 sm:p-8 shadow-[0_10px_30px_rgba(0,0,0,0.03)]">
          <h3 className="text-sm font-black text-[#92400e] uppercase tracking-[0.3em] mb-6">CGPA Summary</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="p-4 rounded-2xl bg-stone-50 border border-border-strong">
              <p className="text-[10px] font-black text-ink-3 uppercase tracking-widest mb-1">Current CGPA</p>
              <p className={`text-3xl font-black tracking-tighter ${currentCGPA >= targetCGPA ? 'text-emerald-600' : 'text-ink'}`}>
                {currentCGPA.toFixed(2)}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-stone-50 border border-border-strong">
              <p className="text-[10px] font-black text-ink-3 uppercase tracking-widest mb-1">Target</p>
              <p className="text-3xl font-black tracking-tighter text-[#92400e]">{targetCGPA.toFixed(2)}</p>
            </div>
            <div className="p-4 rounded-2xl bg-stone-50 border border-border-strong">
              <p className="text-[10px] font-black text-ink-3 uppercase tracking-widest mb-1">Gap</p>
              <p className={`text-3xl font-black tracking-tighter ${currentCGPA >= targetCGPA ? 'text-emerald-600' : 'text-amber-600'}`}>
                {currentCGPA >= targetCGPA ? '+' : ''}{(currentCGPA - targetCGPA).toFixed(2)}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-stone-50 border border-border-strong">
              <p className="text-[10px] font-black text-ink-3 uppercase tracking-widest mb-1">Courses</p>
              <p className="text-3xl font-black tracking-tighter text-ink">{courses.length}</p>
            </div>
          </div>
          <CGPAProgressBar current={currentCGPA} target={targetCGPA} label="Progress Toward Target" />
        </div>
      )}
    </div>
  );
}
