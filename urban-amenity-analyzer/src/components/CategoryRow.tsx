'use client';

import type { CategoryScore } from '@/lib/types';

interface CategoryRowProps {
  category: CategoryScore;
}

export function CategoryRow({ category }: CategoryRowProps) {
  const barWidth = Math.max(0, Math.min(100, category.score));

  const formatDistance = (meters: number): string => {
    if (!isFinite(meters)) return '—';
    if (meters >= 1000) return `${(meters / 1000).toFixed(1)} km`;
    return `${meters} m`;
  };

  const formatWalkTime = (minutes: number): string => {
    if (!isFinite(minutes)) return '—';
    if (minutes < 1) return '<1 min';
    return `~${Math.round(minutes)} min`;
  };

  return (
    <div
      className={`group border-b border-[var(--line)] py-3 transition-all duration-200 last:border-b-0 ${
        category.isGap
          ? 'bg-[rgba(239,68,68,0.05)] pl-3 border-l-2 border-l-red-500'
          : 'hover:bg-[rgba(244,239,229,0.02)]'
      }`}
    >
      <div className="flex items-center gap-4">
        {/* Icon */}
        <div className="flex h-8 w-8 shrink-0 items-center justify-center border border-[var(--line)] bg-[rgba(244,239,229,0.04)] text-sm opacity-80">
          {category.icon}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-editorial text-sm font-medium tracking-wide text-[var(--paper)]">
              {category.label}
            </span>
            <span
              className="text-xs font-semibold tabular-nums tracking-wider"
              style={{ color: category.isGap ? '#ef4444' : 'var(--civic-amber)' }}
            >
              {category.score}
            </span>
          </div>

          {/* Score bar */}
          <div className="h-0.5 w-full bg-[rgba(244,239,229,0.1)]">
            <div
              className="h-full transition-all duration-700 ease-out"
              style={{
                width: `${barWidth}%`,
                backgroundColor: category.isGap ? '#ef4444' : 'var(--civic-amber)',
                opacity: category.isGap ? 0.5 : 1,
              }}
            />
          </div>

          {/* Stats */}
          <div className="mt-2 flex items-center gap-2 text-[10px] uppercase tracking-wider text-[var(--paper-muted)]">
            {category.isGap ? (
              <span className="text-red-400">No amenities found nearby</span>
            ) : (
              <>
                <span>
                  {formatDistance(category.nearestMeters)} · {formatWalkTime(category.nearestMinutes)}
                </span>
                <span className="opacity-30">|</span>
                <span>{category.count} locs</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
