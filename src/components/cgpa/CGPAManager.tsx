'use client';

import React, { useState, useCallback } from 'react';
import { Target, Save } from 'lucide-react';
import { toast } from 'sonner';
import type {
  GradeScale,
  AutoCourse,
  AttendanceSubject,
  CGPASettings,
  SemesterSetup,
} from '@/lib/cgpa/cgpa-types';
import { saveGlobalTarget } from '@/app/dashboard/cgpa/actions';
import { GradeScaleEditor } from './GradeScaleEditor';
import { AutoCGPACounter } from './AutoCGPACounter';
import { CGPASummaryCard } from './CGPASummaryCard';

interface CGPAManagerProps {
  initialSettings: CGPASettings | null;
  initialGradeScales: GradeScale[];
  initialManualCourses: any[];
  initialAutoCourses: AutoCourse[];
  attendanceSubjects: AttendanceSubject[];
  initialSemesterSetup: SemesterSetup | null;
  isFreeTier?: boolean;
}

interface SummaryData {
  currentSemesterGPA: number;
  overallCGPA: number;
  totalCredits: number;
  missingGPASemesters: number[];
  currentSemester: number;
  totalSemesters: number;
  hasCourses: boolean;
}

export function CGPAManager({
  initialSettings,
  initialGradeScales,
  initialAutoCourses,
  attendanceSubjects,
  initialSemesterSetup,
  isFreeTier,
}: CGPAManagerProps) {
  const [targetCGPA, setTargetCGPA] = useState(initialSettings?.target_cgpa || 3.50);
  const [targetInput, setTargetInput] = useState(String(initialSettings?.target_cgpa || 3.50));
  const [isSavingTarget, setIsSavingTarget] = useState(false);
  const [gradeScales, setGradeScales] = useState<GradeScale[]>(initialGradeScales);
  const [autoCourses, setAutoCourses] = useState<AutoCourse[]>(initialAutoCourses);
  const [semesterSetup, setSemesterSetup] = useState<SemesterSetup | null>(initialSemesterSetup);
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [triggerOpenSettings, setTriggerOpenSettings] = useState(false);

  const handleSaveTarget = async () => {
    const value = parseFloat(targetInput);
    if (isNaN(value) || value < 0 || value > 4) {
      toast.error('Target CGPA must be between 0 and 4.00, Sir.');
      return;
    }

    setIsSavingTarget(true);
    try {
      const res = await saveGlobalTarget(value);
      if (res.success) {
        setTargetCGPA(value);
        toast.success('Target CGPA locked in, Sir.');
      } else {
        toast.error(`Failed: ${res.error}`);
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSavingTarget(false);
    }
  };

  const handleSummaryChange = useCallback((data: SummaryData) => {
    setSummaryData(data);
  }, []);

  const isInitialized = !!semesterSetup?.initialized;

  return (
    <div className="space-y-10 pb-32 text-text-primary">
      {/* ── Top Row: Global Settings + Semester Summary side by side ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Global Settings Panel */}
        <div className="bg-bg-surface/70 backdrop-blur-xl rounded-[44px] p-6 sm:p-8 border border-border-strong shadow-[0_20px_50px_rgba(0,0,0,0.04)] dark:bg-bg-elevated/70 h-full">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 h-full">
            <div className="space-y-1">
              <h3 className="text-sm font-black text-accent uppercase tracking-[0.3em]">
                Global Settings
              </h3>
              <p className="text-xs font-medium text-text-tertiary">
                Set your target CGPA and define the grade scale used across both calculators.
              </p>
            </div>

            {/* Target CGPA Input */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-2 p-4 rounded-3xl bg-bg-base border border-border-strong flex-1 md:flex-none dark:bg-bg-surface">
                <Target className="w-4 h-4 text-accent shrink-0" />
                <div className="flex items-center gap-2">
                  <label className="text-[10px] font-black text-text-tertiary uppercase tracking-widest whitespace-nowrap">
                    Target CGPA
                  </label>
                  <input
                    type="number"
                    value={targetInput}
                    onChange={(e) => setTargetInput(e.target.value)}
                    className="w-24 px-3 py-2 rounded-xl border-2 border-border-subtle bg-bg-surface font-black text-lg text-accent outline-none focus:border-accent transition-all text-center dark:bg-bg-elevated"
                    min="0"
                    max="4"
                    step="any"
                  />
                </div>
              </div>
              <button
                onClick={handleSaveTarget}
                disabled={isSavingTarget}
                className="p-3.5 rounded-2xl bg-accent text-white hover:bg-[#78350f] transition-all active:scale-95 shadow-lg shadow-accent/20 disabled:opacity-50 shrink-0"
                title="Save target"
              >
                <Save className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Semester Summary Card */}
        {isInitialized && summaryData ? (
          <CGPASummaryCard
            currentSemesterGPA={summaryData.currentSemesterGPA}
            overallCGPA={summaryData.overallCGPA}
            totalCreditsCompleted={summaryData.totalCredits}
            targetCGPA={targetCGPA}
            currentSemester={summaryData.currentSemester}
            totalSemesters={summaryData.totalSemesters}
            missingGPASemesters={summaryData.missingGPASemesters}
            onFillMissingGPA={() => setTriggerOpenSettings(true)}
          />
        ) : isInitialized ? (
          <div className="bg-bg-surface/40 dark:bg-bg-elevated/40 backdrop-blur-xl rounded-[44px] border-2 border-dashed border-border-subtle p-8 flex flex-col items-center justify-center gap-2 text-center min-h-[140px]">
            <p className="text-sm font-bold text-text-tertiary">Add courses to see your semester summary</p>
          </div>
        ) : null}
      </div>

      {/* Grade Scale Editor */}
      <GradeScaleEditor scales={gradeScales} onScalesChange={setGradeScales} />

      {/* Auto Counter — semester-aware */}
      <AutoCGPACounter
        courses={autoCourses}
        targetCGPA={targetCGPA}
        gradeScales={gradeScales}
        attendanceSubjects={attendanceSubjects}
        onCoursesChange={setAutoCourses}
        semesterSetup={semesterSetup}
        onSetupChange={setSemesterSetup}
        isFreeTier={isFreeTier}
        onSummaryChange={handleSummaryChange}
        openSettings={triggerOpenSettings}
        onSettingsOpened={() => setTriggerOpenSettings(false)}
      />
    </div>
  );
}
