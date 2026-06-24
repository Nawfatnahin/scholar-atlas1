'use client';

import { useEffect, useState } from 'react';

interface ScoreGaugeProps {
  score: number;
  rating: string;
  size?: number;
}

export function ScoreGauge({ score, rating, size = 180 }: ScoreGaugeProps) {
  const [animatedScore, setAnimatedScore] = useState(0);

  // Smooth count-up animation
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAnimatedScore(0);
    const duration = 1200;
    const start = performance.now();

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAnimatedScore(Math.round(score * eased));

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    }

    requestAnimationFrame(tick);
  }, [score]);

  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = animatedScore / 100;
  const dashOffset = circumference * (1 - progress);

  // Color based on rating
  const getColor = () => {
    if (animatedScore >= 75) return '#c9942f'; // civic-amber
    if (animatedScore >= 50) return '#b5852a'; // slightly dimmer
    return 'rgba(244,239,229,0.3)'; // red equivalent mapped to greyed out paper
  };

  const getRatingEmoji = () => {
    if (score >= 75) return '🟢';
    if (score >= 50) return '🟡';
    return '🔴';
  };

  const color = getColor();

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Background track */}
        <svg
          width={size}
          height={size}
          className="rotate-[-90deg]"
        >
          {/* Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(201,148,47,0.1)"
            strokeWidth={strokeWidth}
          />
          {/* Progress arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{
              transition: 'stroke 0.5s ease',
              filter: `drop-shadow(0 0 8px ${color}40)`,
            }}
          />
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="font-editorial tabular-nums text-5xl font-bold tracking-tight"
            style={{ color }}
          >
            {animatedScore}
          </span>
          <span className="mt-1 text-[10px] uppercase tracking-[0.2em] text-[var(--paper-muted)]">
            Score
          </span>
        </div>

        {/* Glow effect */}
        <div
          className="absolute inset-0 rounded-full opacity-20 blur-xl"
          style={{ backgroundColor: color }}
        />
      </div>

      {/* Rating label */}
      <div className="mt-2 flex items-center gap-1.5 border border-[var(--civic-amber)]/20 bg-[var(--civic-amber)]/5 px-4 py-1.5">
        <span className="text-sm">{getRatingEmoji()}</span>
        <span className="text-xs font-semibold uppercase tracking-widest" style={{ color }}>
          {rating}
        </span>
      </div>
    </div>
  );
}
