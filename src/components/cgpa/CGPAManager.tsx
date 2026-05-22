'use client';

import React, { useState } from 'react';
import { Calculator, Cpu, Target, Save } from 'lucide-react';
import { toast } from 'sonner';
import type {
  GradeScale,
  ManualCourse,
  AutoCourse,
  AttendanceSubject,
  CGPASettings,
} from '@/lib/cgpa/cgpa-types';
import { saveGlobalTarget } from '@/app/dashboard/cgpa/actions';
import { GradeScaleEditor } from './GradeScaleEditor';
import { ManualCGPACounter } from './ManualCGPACounter';
import { AutoCGPACounter } from './AutoCGPACounter';

type TabType = 'manual' | 'auto';

interface CGPAManagerProps {
  initialSettings: CGPASettings | null;
  initialGradeScales: GradeScale[];
  initialManualCourses: ManualCourse[];
  initialAutoCourses: AutoCourse[];
  attendanceSubjects: AttendanceSubject[];
}

export function CGPAManager({
  initialSettings,
  initialGradeScales,
  initialManualCourses,
  initialAutoCourses,
  attendanceSubjects,
}: CGPAManagerProps) {
  const [activeTab, setActiveTab] = useState<TabType>('manual');
  const [targetCGPA, setTargetCGPA] = useState(initialSettings?.target_cgpa || 3.50);
  const [targetInput, setTargetInput] = useState(String(initialSettings?.target_cgpa || 3.50));
  const [isSavingTarget, setIsSavingTarget] = useState(false);
  const [gradeScales, setGradeScales] = useState<GradeScale[]>(initialGradeScales);
  const [manualCourses, setManualCourses] = useState<ManualCourse[]>(initialManualCourses);
  const [autoCourses, setAutoCourses] = useState<AutoCourse[]>(initialAutoCourses);

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

  return (
    <div className="space-y-10 pb-32">
      {/* Global Settings Panel */}
      <div className="bg-white/70 backdrop-blur-xl rounded-[44px] p-6 sm:p-8 border border-border-strong shadow-[0_20px_50px_rgba(0,0,0,0.04)]">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <h3 className="text-sm font-black text-[#92400e] uppercase tracking-[0.3em]">
              Global Settings
            </h3>
            <p className="text-xs font-medium text-ink-3">
              Set your target CGPA and define the grade scale used across both calculators.
            </p>
          </div>

          {/* Target CGPA Input */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2 p-4 rounded-3xl bg-white border border-border-strong flex-1 md:flex-none">
              <Target className="w-4 h-4 text-[#92400e] shrink-0" />
              <div className="flex items-center gap-2">
                <label className="text-[10px] font-black text-ink-3 uppercase tracking-widest whitespace-nowrap">
                  Target CGPA
                </label>
                <input
                  type="number"
                  value={targetInput}
                  onChange={(e) => setTargetInput(e.target.value)}
                  className="w-20 px-3 py-2 rounded-xl border-2 border-stone-100 bg-stone-50 font-black text-lg text-[#92400e] outline-none focus:border-[#92400e] transition-all text-center"
                  min="0"
                  max="4"
                  step="0.01"
                />
              </div>
            </div>
            <button
              onClick={handleSaveTarget}
              disabled={isSavingTarget}
              className="p-3.5 rounded-2xl bg-[#92400e] text-white hover:bg-[#78350f] transition-all active:scale-95 shadow-lg shadow-[#92400e]/20 disabled:opacity-50 shrink-0"
              title="Save target"
            >
              <Save className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Grade Scale Editor */}
      <GradeScaleEditor scales={gradeScales} onScalesChange={setGradeScales} />

      {/* Tab Switcher */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <button
          onClick={() => setActiveTab('manual')}
          className={`flex items-center justify-center gap-3 px-8 py-5 rounded-[24px] font-black text-sm uppercase tracking-widest transition-all active:scale-95 flex-1 sm:flex-none ${
            activeTab === 'manual'
              ? 'bg-[#92400e] text-white shadow-xl shadow-[#92400e]/20'
              : 'bg-white border border-border-strong text-ink-3 hover:text-ink hover:shadow-md'
          }`}
        >
          <Calculator className="w-5 h-5" />
          Manual Counter
        </button>
        <button
          onClick={() => setActiveTab('auto')}
          className={`flex items-center justify-center gap-3 px-8 py-5 rounded-[24px] font-black text-sm uppercase tracking-widest transition-all active:scale-95 flex-1 sm:flex-none ${
            activeTab === 'auto'
              ? 'bg-[#92400e] text-white shadow-xl shadow-[#92400e]/20'
              : 'bg-white border border-border-strong text-ink-3 hover:text-ink hover:shadow-md'
          }`}
        >
          <Cpu className="w-5 h-5" />
          Auto Counter
        </button>
      </div>

      {/* Active Tab Content */}
      {activeTab === 'manual' ? (
        <ManualCGPACounter
          courses={manualCourses}
          targetCGPA={targetCGPA}
          gradeScales={gradeScales}
          onCoursesChange={setManualCourses}
        />
      ) : (
        <AutoCGPACounter
          courses={autoCourses}
          targetCGPA={targetCGPA}
          gradeScales={gradeScales}
          attendanceSubjects={attendanceSubjects}
          onCoursesChange={setAutoCourses}
        />
      )}
    </div>
  );
}
