'use client';

import React from 'react';
import { format } from 'date-fns';
import { Check, X, Clock } from 'lucide-react';
import { markAttendance } from '@/app/dashboard/attendance/actions';
import { toast } from 'sonner';

interface TodayScheduleProps {
  subjects: any[];
}

export const TodaySchedule: React.FC<TodayScheduleProps> = ({ subjects }) => {
  const today = new Date();
  const dayName = format(today, 'EEEE');

  const todaysSubjects = subjects.filter(s => 
    s.schedule_days?.includes(dayName)
  );

  const handleQuickMark = async (subjectId: string, type: 'present' | 'unexcused') => {
    try {
      const res = await markAttendance({
        subjectId,
        absenceType: type,
        classDate: format(today, 'yyyy-MM-dd')
      });

      if (res.success) {
        toast.success(`Marked as ${type}`);
      } else if (res.requiresConfirmation) {
        // Trigger modal logic (this would need to be handled by a parent or via state)
        toast.info('Attendance requires confirmation due to low percentage');
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="bg-zinc-950 rounded-[40px] p-8 border border-white/5 mb-10 overflow-hidden relative">
      <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
        <Clock className="w-24 h-24 text-white" />
      </div>

      <div className="relative z-10">
        <h3 className="text-sm font-black text-zinc-500 uppercase tracking-[0.3em] mb-4">
          Today — {format(today, 'EEEE, MMMM do')}
        </h3>

        {todaysSubjects.length === 0 ? (
          <p className="text-zinc-400 font-medium">No classes scheduled for today, Sir.</p>
        ) : (
          <div className="flex flex-wrap gap-4">
            {todaysSubjects.map(subject => (
              <div 
                key={subject.id}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex flex-col gap-4 min-w-[240px]"
              >
                <div>
                  <h4 className="font-bold text-white mb-1">{subject.name}</h4>
                  <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">
                    {subject.schedule_time || 'No time set'}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => handleQuickMark(subject.id, 'present')}
                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-green-500/20 text-green-400 border border-green-500/20 rounded-xl hover:bg-green-500 hover:text-white transition-all"
                  >
                    <Check className="w-4 h-4" />
                    <span className="text-xs font-black uppercase">Present</span>
                  </button>
                  <button 
                    onClick={() => handleQuickMark(subject.id, 'unexcused')}
                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                  >
                    <X className="w-4 h-4" />
                    <span className="text-xs font-black uppercase">Absent</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
