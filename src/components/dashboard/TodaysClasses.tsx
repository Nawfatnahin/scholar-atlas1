"use client";

import React, { useState } from "react";
import { Clock, ArrowRight, CheckCircle2, XCircle, MinusCircle, CalendarX, BookOpen } from "lucide-react";
import { useRouter } from "next/navigation";

interface Session {
  id: string;
  status: 'present' | 'absent' | 'cancelled' | 'upcoming' | 'holiday' | 'unexcused';
  subjects: {
    name: string;
    course_code: string | null;
  };
}

const statusConfig = {
  present: {
    label: 'Present',
    icon: CheckCircle2,
    bg: 'bg-green-500',
    pill: 'bg-green-100 text-green-700 border-green-200',
    glow: 'shadow-green-500/20',
    border: 'border-green-200 dark:border-green-900/40',
    dot: 'bg-green-400',
  },
  absent: {
    label: 'Absent',
    icon: XCircle,
    bg: 'bg-red-500',
    pill: 'bg-red-100 text-red-700 border-red-200',
    glow: 'shadow-red-500/20',
    border: 'border-red-200 dark:border-red-900/40',
    dot: 'bg-red-400',
  },
  unexcused: {
    label: 'Absent',
    icon: XCircle,
    bg: 'bg-red-500',
    pill: 'bg-red-100 text-red-700 border-red-200',
    glow: 'shadow-red-500/20',
    border: 'border-red-200 dark:border-red-900/40',
    dot: 'bg-red-400',
  },
  cancelled: {
    label: 'Cancelled',
    icon: MinusCircle,
    bg: 'bg-amber-500',
    pill: 'bg-amber-100 text-amber-700 border-amber-200',
    glow: 'shadow-amber-500/20',
    border: 'border-amber-200 dark:border-amber-900/40',
    dot: 'bg-amber-400',
  },
  holiday: {
    label: 'Holiday',
    icon: CalendarX,
    bg: 'bg-blue-500',
    pill: 'bg-blue-100 text-blue-700 border-blue-200',
    glow: 'shadow-blue-500/20',
    border: 'border-blue-200 dark:border-blue-900/40',
    dot: 'bg-blue-400',
  },
  upcoming: {
    label: 'Upcoming',
    icon: Clock,
    bg: 'bg-stone-400',
    pill: 'bg-stone-100 text-stone-600 border-stone-200',
    glow: 'shadow-stone-400/10',
    border: 'border-stone-200 dark:border-stone-700',
    dot: 'bg-stone-400',
  },
};

function ClassCard({ session }: { session: Session }) {
  const router = useRouter();
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const config = statusConfig[session.status] ?? statusConfig.upcoming;
  const StatusIcon = config.icon;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const tiltX = ((y - centerY) / centerY) * -10;
    const tiltY = ((x - centerX) / centerX) * 10;
    setTilt({ x: tiltX, y: tiltY });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setIsHovered(false);
  };

  const handleClick = () => {
    router.push('/dashboard/attendance');
  };

  return (
    <div
      className="cursor-pointer select-none"
      style={{ perspective: '800px' }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      <div
        className={`
          relative bg-white/80 backdrop-blur-xl rounded-[28px] border
          ${config.border}
          shadow-lg ${isHovered ? `shadow-xl ${config.glow}` : 'shadow-black/5'}
          transition-shadow duration-300 overflow-hidden
          p-5 sm:p-6 flex flex-col gap-4
        `}
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) ${isHovered ? 'scale(1.02)' : 'scale(1)'}`,
          transition: isHovered
            ? 'transform 0.1s ease-out, shadow 0.3s'
            : 'transform 0.4s ease-out, shadow 0.3s',
          transformStyle: 'preserve-3d',
          willChange: 'transform',
        }}
      >
        {/* Sheen overlay */}
        <div
          className="absolute inset-0 rounded-[28px] pointer-events-none"
          style={{
            background: isHovered
              ? `radial-gradient(circle at ${50 + tilt.y * 2}% ${50 - tilt.x * 2}%, rgba(255,255,255,0.25) 0%, transparent 70%)`
              : 'none',
            transition: 'background 0.1s ease-out',
          }}
        />

        {/* Status accent bar */}
        <div className={`absolute top-0 left-0 right-0 h-1 ${config.bg} opacity-80`} />

        {/* Top row */}
        <div className="flex items-start justify-between gap-3 pt-1">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-9 h-9 rounded-xl ${config.bg} flex items-center justify-center shadow-md ${config.glow} flex-shrink-0`}
              style={{ transform: 'translateZ(8px)' }}
            >
              <StatusIcon className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <h4
                className="font-black text-stone-900 text-base sm:text-lg leading-tight truncate"
                style={{ transform: 'translateZ(6px)' }}
              >
                {session.subjects.name}
              </h4>
              {session.subjects.course_code && (
                <p className="text-[10px] font-bold text-[#92400e]/70 uppercase tracking-widest mt-0.5">
                  {session.subjects.course_code}
                </p>
              )}
            </div>
          </div>

          {/* Status pill */}
          <span
            className={`
              flex-shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full
              border text-[10px] font-black uppercase tracking-widest
              ${config.pill}
            `}
            style={{ transform: 'translateZ(10px)' }}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${config.dot} inline-block`} />
            {config.label}
          </span>
        </div>

        {/* CTA row */}
        <div
          className="flex items-center justify-between mt-1"
          style={{ transform: 'translateZ(4px)' }}
        >
          <p className="text-xs text-stone-400 font-medium">
            {session.status === 'upcoming'
              ? 'Tap to mark attendance'
              : 'Tap to update in tracker'}
          </p>
          <div
            className={`
              flex items-center gap-1 text-xs font-black uppercase tracking-widest
              text-[#92400e] transition-transform duration-200
              ${isHovered ? 'translate-x-1' : ''}
            `}
          >
            <span>Open</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TodaysClasses({ initialSessions }: { initialSessions: Session[] }) {
  if (initialSessions.length === 0) {
    return (
      <div className="bg-white/40 backdrop-blur-xl p-8 sm:p-10 rounded-[40px] border border-border-strong flex flex-col items-center justify-center text-center gap-4">
        <div className="w-14 h-14 bg-stone-100 rounded-2xl flex items-center justify-center">
          <BookOpen className="w-7 h-7 text-stone-300" />
        </div>
        <div>
          <h4 className="font-bold text-ink text-base">No classes today</h4>
          <p className="text-sm text-ink-3 mt-1">Enjoy your free time, Sir.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl sm:text-2xl font-black text-ink tracking-tight flex items-center gap-3">
          <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-[#92400e]" />
          Today&apos;s Classes
        </h3>
        <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">
          {initialSessions.length} {initialSessions.length === 1 ? 'class' : 'classes'}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {initialSessions.map((session) => (
          <ClassCard key={session.id} session={session} />
        ))}
      </div>
    </div>
  );
}
