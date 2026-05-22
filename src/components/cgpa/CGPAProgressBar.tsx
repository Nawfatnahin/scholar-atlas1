'use client';

import React from 'react';

interface CGPAProgressBarProps {
  current: number;
  target: number;
  label?: string;
  showValues?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function CGPAProgressBar({
  current,
  target,
  label,
  showValues = true,
  size = 'md',
}: CGPAProgressBarProps) {
  const percentage = target > 0 ? Math.min((current / target) * 100, 100) : 0;
  const gap = Math.max(target - current, 0);
  const isOnTrack = current >= target;

  const heightClass = size === 'sm' ? 'h-2' : size === 'lg' ? 'h-5' : 'h-3';

  // Color based on proximity to target
  const getBarColor = () => {
    if (percentage >= 100) return 'from-emerald-400 to-emerald-600';
    if (percentage >= 75) return 'from-emerald-400 to-green-500';
    if (percentage >= 50) return 'from-amber-400 to-orange-500';
    return 'from-red-400 to-red-600';
  };

  return (
    <div className="w-full">
      {label && (
        <p className="text-[10px] font-black text-ink-3 uppercase tracking-[0.2em] mb-2">
          {label}
        </p>
      )}

      <div className={`w-full ${heightClass} bg-stone-100 rounded-full overflow-hidden relative`}>
        <div
          className={`h-full bg-gradient-to-r ${getBarColor()} rounded-full transition-all duration-1000 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {showValues && (
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-3">
            <span className={`text-lg font-black tracking-tight ${isOnTrack ? 'text-emerald-600' : 'text-ink'}`}>
              {current.toFixed(2)}
            </span>
            <span className="text-xs font-bold text-ink-4">/ {target.toFixed(2)} target</span>
          </div>
          <div>
            {isOnTrack ? (
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-widest">
                On Track ✓
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-[10px] font-black uppercase tracking-widest">
                Gap: {gap.toFixed(2)}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
