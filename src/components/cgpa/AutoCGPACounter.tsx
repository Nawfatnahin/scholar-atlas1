'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  Plus, X, Save, Cpu, TrendingUp, TrendingDown,
  FlaskConical, ClipboardList, CalendarCheck, FileText,
  Settings2, GraduationCap, Layers, Lock,
  ToggleLeft, ToggleRight, Link2,
} from 'lucide-react';
import { toast } from 'sonner';
import type { AutoCourse, GradeScale, AttendanceSubject, SemesterSetup } from '@/lib/cgpa/cgpa-types';
import { calculateCourseBreakdown, calculateAutoCGPA } from '@/lib/cgpa/cgpa-calculator';
import { saveAutoCourse } from '@/app/dashboard/cgpa/actions';
import { AutoCourseCard } from './AutoCourseCard';
import { CGPAProgressBar } from './CGPAProgressBar';
import { InitManagerModal } from './InitManagerModal';
import { SemesterSettingsPanel } from './SemesterSettingsPanel';
import { SemesterTabs } from './SemesterTabs';
import { DegreeProgressBar } from './DegreeProgressBar';
import { CGPASummaryCard } from './CGPASummaryCard';

interface AutoCGPACounterProps {
  courses: AutoCourse[];
  targetCGPA: number;
  gradeScales: GradeScale[];
  attendanceSubjects: AttendanceSubject[];
  onCoursesChange: (courses: AutoCourse[]) => void;
  semesterSetup: SemesterSetup | null;
  onSetupChange: (setup: SemesterSetup | null) => void;
  isFreeTier?: boolean;
}

export function AutoCGPACounter({
  courses,
  targetCGPA,
  gradeScales,
  attendanceSubjects,
  onCoursesChange,
  semesterSetup,
  onSetupChange,
  isFreeTier,
}: AutoCGPACounterProps) {
  const isInitialized = !!semesterSetup?.initialized;

  const [showInitModal, setShowInitModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeSemester, setActiveSemester] = useState<number>(
    semesterSetup?.current_semester ?? 1
  );

  // Sync activeSemester when setup changes
  React.useEffect(() => {
    if (semesterSetup?.current_semester) {
      setActiveSemester(semesterSetup.current_semester);
    }
  }, [semesterSetup?.current_semester]);

  const [newCourse, setNewCourse] = useState({
    course_name: '',
    course_code: '',
    credit_hours: '3',
    target_grade_point: '',
    ct_total: '',
    ct_best_of: '',
    ct_weight: '',
    assignment_total_marks: '',
    assignment_weight: '',
    attendance_linked: false,
    attendance_course_id: '',
    attendance_total_marks: '',
    attendance_threshold_percentage: '75',
    attendance_weight: '',
    exam_weight: '',
  });

  const globalScale = gradeScales.find((s) => s.is_global);

  const gradePointOptions = useMemo(() => {
    if (!globalScale) return [];
    return [...globalScale.mappings]
      .sort((a, b) => b.gradePoint - a.gradePoint)
      .map((m) => m.gradePoint)
      .filter((v, i, arr) => arr.indexOf(v) === i);
  }, [globalScale]);

  // Courses in the currently active semester tab
  const activeTabCourses = useMemo(
    () => courses.filter(c => c.semester_number === activeSemester),
    [courses, activeSemester]
  );

  // Determine which past semesters have courses stored (enable full management)
  const semestersWithCourses = useMemo(() => {
    const s = new Set<number>();
    courses.forEach(c => s.add(c.semester_number));
    return s;
  }, [courses]);

  // Whether the active tab is read-only (past sem with no courses, only stored GPA)
  const isReadOnlyTab = useMemo(() => {
    if (!semesterSetup) return false;
    const isFuture = activeSemester > semesterSetup.current_semester;
    const isPastWithNoCoursesButHasGPA =
      activeSemester < semesterSetup.current_semester &&
      !semestersWithCourses.has(activeSemester) &&
      semesterSetup.previous_gpas[String(activeSemester)] !== undefined;
    return isFuture || isPastWithNoCoursesButHasGPA;
  }, [activeSemester, semesterSetup, semestersWithCourses]);

  // Per-course breakdowns for the active semester
  const courseBreakdowns = useMemo(() => {
    return activeTabCourses.map((course) => {
      const activeScale = course.grade_scale_id
        ? gradeScales.find((s) => s.id === course.grade_scale_id)
        : globalScale;
      const linkedSubject =
        course.attendance_linked && course.attendance_course_id
          ? attendanceSubjects.find((s) => s.id === course.attendance_course_id)
          : null;
      const breakdown = calculateCourseBreakdown(
        course,
        course.cgpa_class_tests || [],
        linkedSubject?.attendance_percentage || 0,
        activeScale?.mappings || []
      );
      return {
        course,
        breakdown,
        predictedGradePoint: breakdown.predictedGradePoint,
        creditHours: Number(course.credit_hours),
        onTrack:
          breakdown.targetAchievable && !breakdown.targetAlreadyAchieved
            ? breakdown.requiredExamPercentage <= 80
            : breakdown.targetAlreadyAchieved,
      };
    });
  }, [activeTabCourses, gradeScales, globalScale, attendanceSubjects]);

  // Current semester GPA (from active tab courses only)
  const currentSemesterGPA = useMemo(() => {
    if (!semesterSetup) return 0;
    const currentCoursesBreakdowns = courses
      .filter(c => c.semester_number === semesterSetup.current_semester)
      .map(course => {
        const activeScale = course.grade_scale_id
          ? gradeScales.find(s => s.id === course.grade_scale_id)
          : globalScale;
        const linkedSubject =
          course.attendance_linked && course.attendance_course_id
            ? attendanceSubjects.find(s => s.id === course.attendance_course_id)
            : null;
        const breakdown = calculateCourseBreakdown(
          course,
          course.cgpa_class_tests || [],
          linkedSubject?.attendance_percentage || 0,
          activeScale?.mappings || []
        );
        return { creditHours: Number(course.credit_hours), predictedGradePoint: breakdown.predictedGradePoint };
      });
    return calculateAutoCGPA(currentCoursesBreakdowns);
  }, [courses, semesterSetup, gradeScales, globalScale, attendanceSubjects]);

  // Overall CGPA — equal weight per semester
  const { overallCGPA, totalCredits, missingGPASemesters } = useMemo(() => {
    if (!semesterSetup) return { overallCGPA: 0, totalCredits: 0, missingGPASemesters: [] };

    const { total_semesters, current_semester, previous_gpas } = semesterSetup;
    const missing: number[] = [];

    let gpasSum = 0;
    let semesterCount = 0;

    // Previous semesters
    for (let sem = 1; sem < current_semester; sem++) {
      // If courses exist for this sem, use computed GPA
      const semCourses = courses.filter(c => c.semester_number === sem);
      if (semCourses.length > 0) {
        const semGPA = calculateAutoCGPA(
          semCourses.map(c => {
            const scale = c.grade_scale_id ? gradeScales.find(s => s.id === c.grade_scale_id) : globalScale;
            const linked = c.attendance_linked && c.attendance_course_id
              ? attendanceSubjects.find(s => s.id === c.attendance_course_id) : null;
            const bd = calculateCourseBreakdown(c, c.cgpa_class_tests || [], linked?.attendance_percentage || 0, scale?.mappings || []);
            return { creditHours: Number(c.credit_hours), predictedGradePoint: bd.predictedGradePoint };
          })
        );
        gpasSum += semGPA;
        semesterCount++;
      } else {
        // Use stored GPA
        const stored = previous_gpas[String(sem)];
        if (stored !== undefined && stored !== null) {
          gpasSum += stored;
          semesterCount++;
        } else {
          missing.push(sem);
          // Still count the semester in the denominator but use 0 (will show warning)
        }
      }
    }

    // Current semester
    if (currentSemesterGPA > 0) {
      gpasSum += currentSemesterGPA;
      semesterCount++;
    }

    const overallCGPA = semesterCount > 0 ? gpasSum / semesterCount : 0;

    // Total credits from current semester courses
    const totalCredits = courses
      .filter(c => c.semester_number <= current_semester)
      .reduce((sum, c) => sum + Number(c.credit_hours), 0);

    return { overallCGPA, totalCredits, missingGPASemesters: missing };
  }, [semesterSetup, courses, gradeScales, globalScale, attendanceSubjects, currentSemesterGPA]);

  const onTrackCount = courseBreakdowns.filter(cb => cb.onTrack).length;
  const needsImprovementCount = courseBreakdowns.filter(cb => !cb.onTrack).length;

  const handleAddCourse = async () => {
    const name = newCourse.course_name.trim();
    if (!name) { toast.error('Course name is required, Sir.'); return; }
    if (!newCourse.target_grade_point) { toast.error('Target grade point is required, Sir.'); return; }

    const totalWeight =
      Number(newCourse.ct_weight) + Number(newCourse.assignment_weight) +
      Number(newCourse.attendance_weight) + Number(newCourse.exam_weight);
    if (Math.abs(totalWeight - 100) > 0.01 && totalWeight > 0) {
      toast.error(`Total weights must equal 100%. Currently: ${totalWeight.toFixed(1)}%`);
      return;
    }

    setIsSaving(true);
    try {
      const res = await saveAutoCourse({
        course_name: name,
        course_code: newCourse.course_code.trim() || undefined,
        credit_hours: Number(newCourse.credit_hours),
        target_grade_point: Number(newCourse.target_grade_point),
        ct_total: Number(newCourse.ct_total) || 0,
        ct_best_of: Number(newCourse.ct_best_of) || 0,
        ct_weight: Number(newCourse.ct_weight) || 0,
        assignment_total_marks: Number(newCourse.assignment_total_marks) || 0,
        assignment_obtained: 0,
        assignment_weight: Number(newCourse.assignment_weight) || 0,
        attendance_linked: newCourse.attendance_linked,
        attendance_course_id: newCourse.attendance_linked && newCourse.attendance_course_id
          ? newCourse.attendance_course_id
          : undefined,
        attendance_total_marks: Number(newCourse.attendance_total_marks) || 0,
        attendance_threshold_percentage: Number(newCourse.attendance_threshold_percentage) || 75,
        attendance_weight: Number(newCourse.attendance_weight) || 0,
        exam_weight: Number(newCourse.exam_weight) || 0,
        semester_number: activeSemester,
      });

      if (res.success) {
        toast.success('Course initialized for prediction, Sir.');
        setIsAdding(false);
        setNewCourse({
          course_name: '', course_code: '', credit_hours: '3', target_grade_point: '',
          ct_total: '', ct_best_of: '', ct_weight: '', assignment_total_marks: '', assignment_weight: '',
          attendance_linked: false, attendance_course_id: '', attendance_total_marks: '',
          attendance_threshold_percentage: '75', attendance_weight: '', exam_weight: '',
        });
        window.location.reload();
      } else {
        toast.error(`Failed: ${res.error}`);
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCourseChange = (updatedCourse: AutoCourse) => {
    onCoursesChange(courses.map((c) => (c.id === updatedCourse.id ? updatedCourse : c)));
  };

  const handleCourseDelete = (id: string) => {
    onCoursesChange(courses.filter((c) => c.id !== id));
  };

  // ─── NOT INITIALIZED ─────────────────────────────────────────────────────────
  if (!isInitialized) {
    return (
      <>
        <div
          className="py-20 text-center bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl rounded-[40px] border-4 border-dashed border-stone-200 dark:border-zinc-700 flex flex-col items-center justify-center cursor-pointer group hover:border-[#92400e]/40 dark:hover:border-amber-700/40 transition-all duration-300"
          onClick={() => setShowInitModal(true)}
        >
          <div className="w-20 h-20 rounded-3xl bg-[#92400e]/8 dark:bg-[#92400e]/15 border-2 border-dashed border-[#92400e]/20 dark:border-amber-700/30 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
            <GraduationCap className="w-9 h-9 text-[#92400e]/40 dark:text-amber-600/40 group-hover:text-[#92400e]/70 dark:group-hover:text-amber-500 transition-colors" />
          </div>
          <h3 className="text-xl font-black text-stone-700 dark:text-zinc-200 mb-2">Initialize Manager</h3>
          <p className="text-stone-400 dark:text-zinc-500 font-medium max-w-sm mb-7 text-sm leading-relaxed">
            Set up your degree structure — number of semesters, current semester, and past GPAs — to begin smart CGPA tracking.
          </p>
          <button
            onClick={e => { e.stopPropagation(); setShowInitModal(true); }}
            className="flex items-center gap-3 px-8 py-4 rounded-[22px] bg-[#92400e] text-white font-black text-sm uppercase tracking-widest hover:-translate-y-1 transition-all active:scale-95 shadow-xl shadow-[#92400e]/25"
          >
            <Layers className="w-5 h-5" />
            Begin Setup
          </button>
        </div>

        <InitManagerModal
          isOpen={showInitModal}
          onClose={() => setShowInitModal(false)}
          onComplete={(setup) => {
            onSetupChange(setup);
            setActiveSemester(setup.current_semester);
            setShowInitModal(false);
          }}
        />
      </>
    );
  }

  // ─── INITIALIZED — MAIN INTERFACE ─────────────────────────────────────────────
  const setup = semesterSetup!;

  return (
    <div className="space-y-6">
      {/* Semester Header Band */}
      <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl rounded-[28px] border border-stone-200 dark:border-zinc-700/60 p-5 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.2)] space-y-4">
        {/* Label row */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-stone-400 dark:text-zinc-500 uppercase tracking-widest mb-0.5">Currently Tracking</p>
            <h3 className="text-lg font-black text-stone-900 dark:text-white tracking-tight">
              Semester <span className="text-[#92400e] dark:text-amber-400">{setup.current_semester}</span>{' '}
              <span className="font-medium text-stone-400 dark:text-zinc-500">of {setup.total_semesters}</span>
            </h3>
          </div>
          <button
            onClick={() => setShowSettings(true)}
            className="p-2.5 rounded-2xl text-stone-400 dark:text-zinc-500 hover:text-stone-700 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-zinc-800 border border-stone-200 dark:border-zinc-700 transition-all"
            title="Semester Settings"
          >
            <Settings2 className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Degree Progress Bar */}
        <DegreeProgressBar
          currentSemester={setup.current_semester}
          totalSemesters={setup.total_semesters}
        />

        {/* Semester Tabs */}
        <SemesterTabs
          totalSemesters={setup.total_semesters}
          currentSemester={setup.current_semester}
          activeSemester={activeSemester}
          onTabChange={setActiveSemester}
          previousGPAs={setup.previous_gpas}
          semestersWithCourses={semestersWithCourses}
        />
      </div>

      {/* Overall Summary (when current sem has courses) */}
      {courses.filter(c => c.semester_number === setup.current_semester).length > 0 && (
        <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl rounded-[32px] border border-stone-200 dark:border-zinc-700/60 p-6 sm:p-8 shadow-[0_10px_30px_rgba(0,0,0,0.03)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.2)]">
          <h3 className="text-sm font-black text-[#92400e] dark:text-amber-500 uppercase tracking-[0.3em] mb-6">
            Predicted CGPA Overview
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-zinc-800 border border-stone-100 dark:border-zinc-700">
              <p className="text-[10px] font-black text-stone-400 dark:text-zinc-500 uppercase tracking-widest mb-1">Predicted CGPA</p>
              <p className={`text-3xl font-black tracking-tighter ${overallCGPA >= targetCGPA ? 'text-emerald-600 dark:text-emerald-400' : 'text-stone-800 dark:text-white'}`}>
                {overallCGPA > 0 ? overallCGPA.toFixed(2) : '—'}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-zinc-800 border border-stone-100 dark:border-zinc-700">
              <p className="text-[10px] font-black text-stone-400 dark:text-zinc-500 uppercase tracking-widest mb-1">Target</p>
              <p className="text-3xl font-black tracking-tighter text-[#92400e] dark:text-amber-400">{targetCGPA.toFixed(2)}</p>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/40">
              <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-widest mb-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> On Track
              </p>
              <p className="text-3xl font-black tracking-tighter text-emerald-600 dark:text-emerald-400">{onTrackCount}</p>
            </div>
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40">
              <p className="text-[10px] font-black text-amber-600 dark:text-amber-500 uppercase tracking-widest mb-1 flex items-center gap-1">
                <TrendingDown className="w-3 h-3" /> Needs Work
              </p>
              <p className="text-3xl font-black tracking-tighter text-amber-600 dark:text-amber-400">{needsImprovementCount}</p>
            </div>
          </div>
          <CGPAProgressBar current={overallCGPA} target={targetCGPA} label="Progress Toward Target" />
        </div>
      )}

      {/* Read-only past semester GPA view */}
      {isReadOnlyTab && activeSemester !== setup.current_semester && (
        <div className="py-16 text-center bg-stone-50/80 dark:bg-zinc-900/50 backdrop-blur-xl rounded-[36px] border-2 border-dashed border-stone-200 dark:border-zinc-700 flex flex-col items-center justify-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-[#92400e]/10 dark:bg-[#92400e]/20 flex items-center justify-center">
            <Lock className="w-6 h-6 text-[#92400e]/50 dark:text-amber-600/60" />
          </div>
          <div>
            <p className="font-black text-stone-700 dark:text-zinc-200 text-lg">Semester {activeSemester}</p>
            {setup.previous_gpas[String(activeSemester)] !== undefined ? (
              <>
                <p className="text-5xl font-black text-[#92400e] dark:text-amber-400 mt-2">
                  {Number(setup.previous_gpas[String(activeSemester)]).toFixed(2)}
                </p>
                <p className="text-sm text-stone-400 dark:text-zinc-500 font-medium mt-1">Stored GPA</p>
              </>
            ) : (
              <p className="text-stone-400 dark:text-zinc-500 font-medium mt-1 text-sm">No GPA recorded yet</p>
            )}
          </div>
          <button
            onClick={() => setShowSettings(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black text-[#92400e] dark:text-amber-400 bg-[#92400e]/10 dark:bg-[#92400e]/20 hover:bg-[#92400e]/20 dark:hover:bg-[#92400e]/30 transition-colors"
          >
            <Settings2 className="w-3.5 h-3.5" /> Edit in Settings
          </button>
        </div>
      )}

      {/* Course Cards for active tab */}
      {!isReadOnlyTab && activeTabCourses.map((course) => (
        <AutoCourseCard
          key={course.id}
          course={course}
          gradeScales={gradeScales}
          attendanceSubjects={attendanceSubjects}
          onCourseChange={handleCourseChange}
          onCourseDelete={handleCourseDelete}
        />
      ))}

      {/* Empty state for current/manageable tab */}
      {!isReadOnlyTab && activeTabCourses.length === 0 && !isAdding && (
        <div className="py-16 text-center bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl rounded-[40px] border-4 border-dashed border-stone-200 dark:border-zinc-700 flex flex-col items-center justify-center gap-2">
          <Cpu className="w-10 h-10 text-[#92400e]/25 dark:text-amber-800/40 mb-2" />
          <h3 className="text-lg font-black text-stone-700 dark:text-zinc-300">No Courses for Semester {activeSemester}</h3>
          <p className="text-stone-400 dark:text-zinc-500 font-medium max-w-sm text-sm">
            Add a course below to begin CGPA prediction for this semester, Sir.
          </p>
        </div>
      )}

      {/* Add Course Form */}
      {!isReadOnlyTab && isAdding && (
        <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-[28px] border border-stone-200 dark:border-zinc-700 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-black text-stone-800 dark:text-white uppercase tracking-widest">
              New Course — Semester {activeSemester}
            </h4>
            <button onClick={() => setIsAdding(false)} className="p-1.5 rounded-lg text-stone-400 dark:text-zinc-500 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-stone-400 dark:text-zinc-500 uppercase tracking-widest">Course Name</label>
              <input type="text" value={newCourse.course_name} onChange={e => setNewCourse({ ...newCourse, course_name: e.target.value })} className="w-full px-4 py-3 rounded-xl border-2 border-stone-100 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-bold text-sm text-stone-900 dark:text-white outline-none focus:border-[#92400e] dark:focus:border-amber-600 transition-all" placeholder="e.g. Data Structures" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-stone-400 dark:text-zinc-500 uppercase tracking-widest">Course Code</label>
              <input type="text" value={newCourse.course_code} onChange={e => setNewCourse({ ...newCourse, course_code: e.target.value })} className="w-full px-4 py-3 rounded-xl border-2 border-stone-100 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-bold text-sm text-stone-900 dark:text-white outline-none focus:border-[#92400e] dark:focus:border-amber-600 transition-all" placeholder="Optional" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-stone-400 dark:text-zinc-500 uppercase tracking-widest">Credit Hours</label>
              <input type="number" value={newCourse.credit_hours} onChange={e => setNewCourse({ ...newCourse, credit_hours: e.target.value })} className="w-full px-4 py-3 rounded-xl border-2 border-stone-100 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-bold text-sm text-stone-900 dark:text-white outline-none focus:border-[#92400e] dark:focus:border-amber-600 transition-all" min="0.5" max="10" step="0.5" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-stone-400 dark:text-zinc-500 uppercase tracking-widest">Target Grade Point</label>
              <select value={newCourse.target_grade_point} onChange={e => setNewCourse({ ...newCourse, target_grade_point: e.target.value })} className="w-full px-4 py-3 rounded-xl border-2 border-stone-100 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-bold text-sm text-stone-900 dark:text-white outline-none focus:border-[#92400e] dark:focus:border-amber-600 transition-all">
                <option value="">Select</option>
                {gradePointOptions.map(gp => <option key={gp} value={gp}>{gp.toFixed(2)}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3 p-4 bg-blue-50/50 dark:bg-blue-950/20 rounded-2xl border border-blue-100 dark:border-blue-900/40">
              <div className="flex items-center gap-2"><FlaskConical className="w-4 h-4 text-blue-700 dark:text-blue-400"/><h5 className="text-xs font-black text-blue-800 dark:text-blue-400 uppercase">CTs</h5></div>
              <div className="grid grid-cols-3 gap-2">
                <div><label className="text-[10px] font-bold text-stone-400 dark:text-zinc-500">Total</label><input type="number" placeholder="0" value={newCourse.ct_total} onChange={e => setNewCourse({...newCourse, ct_total: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-bold text-stone-800 dark:text-white" /></div>
                <div><label className="text-[10px] font-bold text-stone-400 dark:text-zinc-500">Best Of</label><input type="number" placeholder="0" value={newCourse.ct_best_of} onChange={e => setNewCourse({...newCourse, ct_best_of: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-bold text-stone-800 dark:text-white" /></div>
                <div><label className="text-[10px] font-bold text-stone-400 dark:text-zinc-500">Weight %</label><input type="number" placeholder="0" value={newCourse.ct_weight} onChange={e => setNewCourse({...newCourse, ct_weight: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-bold text-stone-800 dark:text-white" /></div>
              </div>
            </div>
            <div className="space-y-3 p-4 bg-amber-50/50 dark:bg-amber-950/20 rounded-2xl border border-amber-100 dark:border-amber-900/40">
              <div className="flex items-center gap-2"><ClipboardList className="w-4 h-4 text-amber-700 dark:text-amber-400"/><h5 className="text-xs font-black text-amber-800 dark:text-amber-400 uppercase">Assignments</h5></div>
              <div className="grid grid-cols-2 gap-2">
                <div><label className="text-[10px] font-bold text-stone-400 dark:text-zinc-500">Total Marks</label><input type="number" placeholder="0" value={newCourse.assignment_total_marks} onChange={e => setNewCourse({...newCourse, assignment_total_marks: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-bold text-stone-800 dark:text-white" /></div>
                <div><label className="text-[10px] font-bold text-stone-400 dark:text-zinc-500">Weight %</label><input type="number" placeholder="0" value={newCourse.assignment_weight} onChange={e => setNewCourse({...newCourse, assignment_weight: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-bold text-stone-800 dark:text-white" /></div>
              </div>
            </div>
            <div className="space-y-3 p-4 bg-green-50/50 dark:bg-green-950/20 rounded-2xl border border-green-100 dark:border-green-900/40">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CalendarCheck className="w-4 h-4 text-green-700 dark:text-green-400"/>
                  <h5 className="text-xs font-black text-green-800 dark:text-green-400 uppercase">Attendance</h5>
                </div>
                {/* Link toggle — only shown when weight > 0 */}
                {Number(newCourse.attendance_weight) > 0 && attendanceSubjects.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setNewCourse(prev => ({
                      ...prev,
                      attendance_linked: !prev.attendance_linked,
                      attendance_course_id: !prev.attendance_linked ? prev.attendance_course_id : '',
                    }))}
                    className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider transition-colors"
                  >
                    {newCourse.attendance_linked ? (
                      <><ToggleRight className="w-4 h-4 text-green-600" /><span className="text-green-700 dark:text-green-400">Linked</span></>
                    ) : (
                      <><ToggleLeft className="w-4 h-4 text-stone-400" /><span className="text-stone-400">Link Tracker</span></>
                    )}
                  </button>
                )}
              </div>

              {/* Core marks + threshold + weight row */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-stone-400 dark:text-zinc-500">Total Marks</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={newCourse.attendance_total_marks}
                    onChange={e => setNewCourse({...newCourse, attendance_total_marks: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-bold text-stone-800 dark:text-white"
                    min="0"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-stone-400 dark:text-zinc-500">Threshold %</label>
                  <input
                    type="number"
                    placeholder="75"
                    value={newCourse.attendance_threshold_percentage}
                    onChange={e => setNewCourse({...newCourse, attendance_threshold_percentage: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-bold text-stone-800 dark:text-white"
                    min="0" max="100"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-stone-400 dark:text-zinc-500">Weight %</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={newCourse.attendance_weight}
                    onChange={e => setNewCourse({...newCourse, attendance_weight: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-bold text-stone-800 dark:text-white"
                    min="0" max="100"
                  />
                </div>
              </div>

              {/* Attendance Tracker Subject Linker */}
              {newCourse.attendance_linked && Number(newCourse.attendance_weight) > 0 && (
                <div className="space-y-1 pt-1">
                  <label className="text-[10px] font-bold text-stone-400 dark:text-zinc-500 flex items-center gap-1">
                    <Link2 className="w-3 h-3" /> Link to Attendance Tracker Subject
                  </label>
                  {attendanceSubjects.length > 0 ? (
                    <select
                      value={newCourse.attendance_course_id}
                      onChange={e => setNewCourse({...newCourse, attendance_course_id: e.target.value})}
                      className="w-full px-3 py-2 rounded-lg border border-green-200 dark:border-green-900/60 bg-white dark:bg-zinc-800 text-sm font-bold text-stone-800 dark:text-white outline-none focus:border-green-500 transition-all"
                    >
                      <option value="">Select subject…</option>
                      {attendanceSubjects.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.name}{s.course_code ? ` (${s.course_code})` : ''} — {s.attendance_percentage.toFixed(1)}%
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-[11px] text-stone-400 dark:text-zinc-500 font-medium">
                      No subjects found in Attendance Tracker. Add some there first.
                    </p>
                  )}
                  {newCourse.attendance_course_id && (() => {
                    const linked = attendanceSubjects.find(s => s.id === newCourse.attendance_course_id);
                    return linked ? (
                      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-50 dark:bg-green-950/40 border border-green-100 dark:border-green-900/30">
                        <CalendarCheck className="w-3.5 h-3.5 text-green-600 shrink-0" />
                        <span className="text-xs font-bold text-green-700 dark:text-green-400">
                          Live attendance: {linked.attendance_percentage.toFixed(1)}%
                        </span>
                      </div>
                    ) : null;
                  })()}
                </div>
              )}
            </div>
            <div className="space-y-3 p-4 bg-violet-50/50 dark:bg-violet-950/20 rounded-2xl border border-violet-100 dark:border-violet-900/40">
              <div className="flex items-center gap-2"><FileText className="w-4 h-4 text-violet-700 dark:text-violet-400"/><h5 className="text-xs font-black text-violet-800 dark:text-violet-400 uppercase">Written Exam</h5></div>
              <div><label className="text-[10px] font-bold text-stone-400 dark:text-zinc-500">Exam Weight %</label><input type="number" placeholder="0" value={newCourse.exam_weight} onChange={e => setNewCourse({...newCourse, exam_weight: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-bold text-stone-800 dark:text-white" /></div>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-5 pt-4 border-t border-stone-100 dark:border-zinc-800">
            <button onClick={handleAddCourse} disabled={isSaving} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#92400e] text-white font-black text-xs uppercase tracking-widest hover:bg-[#78350f] transition-all active:scale-95 shadow-lg shadow-[#92400e]/20 disabled:opacity-50">
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Initialize Course'}
            </button>
            <button onClick={() => setIsAdding(false)} className="px-6 py-3 rounded-xl text-xs font-bold text-stone-400 dark:text-zinc-500 hover:text-stone-700 dark:hover:text-white hover:bg-stone-50 dark:hover:bg-zinc-800 transition-colors">Cancel</button>
          </div>
        </div>
      )}

      {/* Add Course Button — visible only for current/manageable tabs, when not adding */}
      {!isReadOnlyTab && !isAdding && (
        <div className="flex flex-col items-start gap-2">
          <button
            onClick={() => {
              if (isFreeTier && courses.length >= 5) {
                toast.error('Free tier is limited to 5 subjects, Sir.');
                return;
              }
              setIsAdding(true);
            }}
            disabled={isFreeTier && courses.length >= 5}
            className="flex items-center gap-3 px-6 py-4 rounded-[20px] bg-[#92400e] text-white font-black text-xs uppercase tracking-widest hover:-translate-y-1 transition-all active:scale-95 shadow-xl shadow-[#92400e]/20 disabled:opacity-50 disabled:hover:-translate-y-0"
          >
            <Plus className="w-5 h-5" />
            Add Course
          </button>
          {isFreeTier && courses.length >= 5 && (
            <p className="text-xs text-red-600 dark:text-red-400 font-bold px-2">Limit of 5 subjects reached for free tier.</p>
          )}
        </div>
      )}

      {/* CGPA Summary Card — shown below courses when there are any */}
      {courses.length > 0 && (
        <CGPASummaryCard
          currentSemesterGPA={currentSemesterGPA}
          overallCGPA={overallCGPA}
          totalCreditsCompleted={totalCredits}
          targetCGPA={targetCGPA}
          currentSemester={setup.current_semester}
          totalSemesters={setup.total_semesters}
          missingGPASemesters={missingGPASemesters}
          onFillMissingGPA={() => setShowSettings(true)}
        />
      )}

      {/* Modals */}
      {showSettings && semesterSetup && (
        <SemesterSettingsPanel
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          setup={semesterSetup}
          onUpdate={onSetupChange}
          onReset={() => onSetupChange(null)}
        />
      )}
    </div>
  );
}
