'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Trash2,
  Settings,
  BookOpen,
  Library,
  GraduationCap,
  Target,
  AlertTriangle,
  PartyPopper,
  BarChart2,
} from 'lucide-react';
import { toast } from 'sonner';
import type { AutoCourse, ClassTest, GradeScale, AttendanceSubject, CTForm } from '@/lib/cgpa/cgpa-types';
import {
  processClassTests,
  calculateCourseBreakdown,
} from '@/lib/cgpa/cgpa-calculator';
import { deleteAutoCourse } from '@/app/dashboard/cgpa/actions';
import { MarksEntryModal } from './MarksEntryModal';
import { CourseSettingsModal } from './CourseSettingsModal';

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
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isMarksModalOpen, setIsMarksModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Get the active grade scale for this course
  const activeScale = useMemo(() => {
    if (course.grade_scale_id) {
      return gradeScales.find((s) => s.id === course.grade_scale_id);
    }
    return gradeScales.find((s) => s.is_global);
  }, [course.grade_scale_id, gradeScales]);

  // Get attendance percentage for linked course
  const linkedAttendance = useMemo(() => {
    if (!course.attendance_linked || !course.attendance_course_id) return 0;
    const subject = attendanceSubjects.find((s) => s.id === course.attendance_course_id);
    return subject?.attendance_percentage || 0;
  }, [course.attendance_linked, course.attendance_course_id, attendanceSubjects]);

  // Full course breakdown
  const breakdown = useMemo(() => {
    const classTests: ClassTest[] = (course.cgpa_class_tests || [])
      .map((f) => ({
        id: '',
        course_id: course.id,
        ct_number: f.ct_number,
        marks_obtained: Number(f.marks_obtained),
        total_marks: Number(f.total_marks),
        is_counted: false,
      }));

    return calculateCourseBreakdown(
      course,
      classTests,
      linkedAttendance,
      activeScale?.mappings || []
    );
  }, [course, linkedAttendance, activeScale]);

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
      return;
    }
    setIsDeleting(true);
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
    } finally {
      setIsDeleting(false);
      setConfirmDelete(false);
    }
  };

  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-[32px] border border-border-strong shadow-[0_10px_30px_rgba(0,0,0,0.03)] overflow-hidden">
      {/* Card Header */}
      <div className="w-full flex items-center justify-between p-6 sm:p-8">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex-1 flex items-center gap-4 min-w-0 text-left hover:opacity-80 transition-opacity"
        >
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
            !breakdown.targetAchievable ? 'bg-red-100' :
            breakdown.targetAlreadyAchieved ? 'bg-emerald-100' :
            'bg-indigo-100'
          }`}>
            <BookOpen className={`w-5 h-5 ${
              breakdown.targetAlreadyAchieved ? 'text-emerald-700' :
              !breakdown.targetAchievable ? 'text-red-700' :
              'text-indigo-700'
            }`} />
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-black text-ink tracking-tight truncate">{course.course_name}</h3>
            <p className="text-xs font-medium text-ink-3">
              {course.course_code && `${course.course_code} · `}
              {Number(course.credit_hours).toFixed(1)} credits · Target: {Number(course.target_grade_point).toFixed(2)}
            </p>
          </div>
        </button>
        <div className="flex items-center gap-2 shrink-0 ml-4">
          {breakdown.targetAlreadyAchieved ? (
            <span className="hidden sm:inline px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-widest">Achieved</span>
          ) : !breakdown.targetAchievable ? (
            <span className="hidden sm:inline px-3 py-1 rounded-full bg-red-50 text-red-700 text-[10px] font-black uppercase tracking-widest">At Risk</span>
          ) : (
            <span className="hidden sm:inline px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-[10px] font-black uppercase tracking-widest">
              Need {Math.max(0, (breakdown.requiredExamPercentage / 100) * breakdown.examWeight).toFixed(1)} / {breakdown.examWeight}
            </span>
          )}
          <button
            onClick={() => setIsMarksModalOpen(true)}
            title="Update marks"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 text-[#92400e] hover:bg-[#92400e]/10"
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Marks</span>
          </button>
          <button
            onClick={() => setIsSettingsModalOpen(true)}
            title="Course Settings"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 text-stone-600 hover:bg-stone-100"
          >
            <Settings className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Settings</span>
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            title={confirmDelete ? 'Click again to confirm deletion' : 'Delete course'}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 ${
              confirmDelete
                ? 'bg-red-600 text-white shadow-lg shadow-red-500/20 animate-pulse'
                : 'text-red-400 hover:bg-red-50 hover:text-red-600'
            } disabled:opacity-50`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isDeleting ? 'Removing...' : confirmDelete ? 'Confirm?' : 'Delete'}</span>
          </button>
          <button onClick={() => setExpanded(!expanded)} className="p-2 rounded-xl hover:bg-stone-100 transition-colors">
            {expanded ? <ChevronUp className="w-5 h-5 text-ink-3" /> : <ChevronDown className="w-5 h-5 text-ink-3" />}
          </button>
        </div>
      </div>

      {/* Marks Entry Modal */}
      {isMarksModalOpen && (
        <MarksEntryModal
          course={course}
          gradeScales={gradeScales}
          attendanceSubjects={attendanceSubjects}
          onClose={() => setIsMarksModalOpen(false)}
          onSaved={(updated) => onCourseChange(updated)}
        />
      )}

      {/* Settings Modal */}
      {isSettingsModalOpen && (
        <CourseSettingsModal
          course={course}
          gradeScales={gradeScales}
          attendanceSubjects={attendanceSubjects}
          onClose={() => setIsSettingsModalOpen(false)}
          onSaved={(updated) => onCourseChange(updated)}
        />
      )}

      {/* Expanded Content: Just the breakdown summary now */}
      {expanded && (
        <div className="px-6 sm:px-8 pb-6 sm:pb-8 space-y-8">
          {/* ── COURSE SUMMARY ── */}
          <div className="bg-stone-50/80 rounded-2xl p-5 border border-stone-100 space-y-3">
            <h4 className="text-[10px] font-black text-ink-3 uppercase tracking-[0.3em]">Course Breakdown</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <p className="text-[10px] font-black text-ink-4 uppercase tracking-widest">CT Avg</p>
                <p className="text-lg font-black text-blue-700">{breakdown.ctAverage.toFixed(2)}%</p>
                <p className="text-[10px] font-bold text-ink-3">Weight: {course.ct_weight}%</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-ink-4 uppercase tracking-widest">Assignment</p>
                <p className="text-lg font-black text-amber-700">{breakdown.assignmentScore.toFixed(2)}</p>
                <p className="text-[10px] font-bold text-ink-3">Marks: {course.assignment_obtained} / {course.assignment_total_marks}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-ink-4 uppercase tracking-widest">Attendance</p>
                <p className="text-lg font-black text-green-700">
                  {course.attendance_linked || course.attendance_weight > 0 ? `${breakdown.attendanceMarks.toFixed(2)}` : 'N/A'}
                </p>
                {course.attendance_weight > 0 && <p className="text-[10px] font-bold text-ink-3">Marks: {breakdown.attendanceMarks.toFixed(2)} / {course.attendance_total_marks}</p>}
              </div>
              <div>
                <p className="text-[10px] font-black text-ink-4 uppercase tracking-widest">Weighted Score</p>
                <p className="text-lg font-black text-ink">{breakdown.currentWeightedScore.toFixed(2)}</p>
                <p className="text-[10px] font-bold text-ink-3">Pre-Exam Marks</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-ink-4 uppercase tracking-widest">Required Exam</p>
                <p className={`text-lg font-black ${
                  breakdown.targetAlreadyAchieved ? 'text-emerald-700' :
                  !breakdown.targetAchievable ? 'text-red-700' :
                  'text-violet-700'
                }`}>
                  {breakdown.targetAlreadyAchieved ? `0.0 / ${breakdown.examWeight}` :
                   !breakdown.targetAchievable ? `>${breakdown.examWeight} / ${breakdown.examWeight}` :
                   `${Math.max(0, (breakdown.requiredExamPercentage / 100) * breakdown.examWeight).toFixed(1)} / ${breakdown.examWeight}`}
                </p>
                <p className="text-[10px] font-bold text-ink-3">Percentage: {breakdown.targetAlreadyAchieved ? '0%' : !breakdown.targetAchievable ? 'N/A' : `${breakdown.requiredExamPercentage.toFixed(1)}%`}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-ink-4 uppercase tracking-widest">Predicted GP</p>
                <p className="text-lg font-black text-[#92400e]">{breakdown.predictedGradePoint.toFixed(2)}</p>
                <p className="text-[10px] font-bold text-ink-3">Target: {Number(course.target_grade_point).toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
