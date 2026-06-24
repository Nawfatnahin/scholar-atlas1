'use client';

import { AlertTriangle } from 'lucide-react';
import { ScoreGauge } from './ScoreGauge';
import { CategoryRow } from './CategoryRow';
import type { ScoreResult } from '@/lib/types';

interface ScorePanelProps {
  result: ScoreResult | null;
  summary: string;
  placeName: string;
  isLoading: boolean;
  error: string | null;
}

// Skeleton loader component
function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-shimmer rounded-lg ${className}`} />;
}

export function ScorePanel({
  result,
  summary,
  placeName,
  isLoading,
  error,
}: ScorePanelProps) {
  // Loading state
  if (isLoading) {
    return (
      <div className="editorial-panel rounded-none p-6 space-y-6">
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="h-[180px] w-[180px] rounded-full" />
          <Skeleton className="h-6 w-32" />
        </div>
        <Skeleton className="h-12 w-full" />
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="editorial-panel rounded-none p-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-12 w-12 items-center justify-center border border-red-900/30 bg-red-900/10">
            <AlertTriangle className="h-6 w-6 text-red-500" />
          </div>
          <div>
            <h3 className="font-editorial text-lg font-semibold text-[var(--paper)] mb-1">
              Analysis Failed
            </h3>
            <p className="text-sm text-[var(--paper-muted)]">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // No result yet (initial state)
  if (!result) {
    return (
      <div className="editorial-panel rounded-none p-6">
        <div className="flex flex-col items-center gap-4 py-8 text-center">
          <div className="font-editorial text-4xl opacity-50">§</div>
          <div>
            <h3 className="font-editorial text-lg font-semibold text-[var(--paper)] mb-1">
              Select a Location
            </h3>
            <p className="max-w-xs text-sm text-[var(--paper-muted)]">
              Enter a neighborhood or city to generate its urban amenity analysis report.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const gaps = result.perCategory.filter((c) => c.isGap);

  return (
    <div className="editorial-panel rounded-none p-6 space-y-8 animate-fade-in">
      {/* Place name */}
      <div className="text-center">
        <h2 className="font-editorial text-2xl font-bold tracking-tight text-[var(--paper)]">
          {placeName.split(',').slice(0, 2).join(',').trim()}
        </h2>
        <div className="mt-2 flex items-center justify-center gap-2">
          <div className="h-px w-8 bg-[var(--civic-amber)]/50" />
          <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--civic-amber)]">
            Amenity Score
          </span>
          <div className="h-px w-8 bg-[var(--civic-amber)]/50" />
        </div>
      </div>

      {/* Score Gauge */}
      <div className="flex justify-center">
        <ScoreGauge score={result.overall} rating={result.rating} />
      </div>

      {/* Gap Banners */}
      {gaps.length > 0 && (
        <div className="space-y-2">
          {gaps.map((gap) => (
            <div
              key={gap.categoryId}
              className="flex items-center gap-3 border-l-2 border-red-500 bg-[rgba(239,68,68,0.05)] px-4 py-3 text-sm"
            >
              <AlertTriangle className="h-4 w-4 shrink-0 text-red-500" />
              <span className="text-[var(--paper-muted)]">
                <span className="font-medium text-[var(--paper)]">
                  Deficit: No {gap.label.toLowerCase()}
                </span>{' '}
                within{' '}
                {Math.round(gap.nearestMinutes) === Infinity ? '15' : Math.round(gap.nearestMinutes)}{' '}
                min walk
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      {summary && (
        <p className="font-editorial border-l-2 border-[var(--civic-amber)] pl-4 text-lg italic leading-relaxed text-[var(--paper-muted)]">
          &ldquo;{summary}&rdquo;
        </p>
      )}

      {/* Divider */}
      <div className="h-px w-full bg-[var(--line)]" />

      {/* Category Breakdown */}
      <div>
        <h3 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--paper-muted)]">
          Category Breakdown
        </h3>
        <div className="space-y-1">
          {result.perCategory.map((cat) => (
            <CategoryRow key={cat.categoryId} category={cat} />
          ))}
        </div>
      </div>

      {/* Data source note */}
      <p className="text-center text-[10px] leading-relaxed text-[var(--paper-muted)] opacity-60">
        Distances are straight-line estimates (×1.4 detour factor).
        <br />
        Data density varies by region — scores reflect OSM coverage.
      </p>
    </div>
  );
}
