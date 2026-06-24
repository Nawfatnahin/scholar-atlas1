'use client';

import { Loader2 } from 'lucide-react';

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
}

export function LoadingOverlay({
  isVisible,
  message = 'Analyzing neighborhood...',
}: LoadingOverlayProps) {
  if (!isVisible) return null;

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-[var(--background)]/80 backdrop-blur-sm animate-fade-in">
      <div className="editorial-panel rounded-none border border-[var(--civic-amber)]/30 px-8 py-6 flex flex-col items-center gap-4 animate-scale-in">
        <div className="text-center font-editorial">
          <div className="mb-2 text-2xl animate-pulse opacity-50">§</div>
          <p className="text-sm font-medium tracking-wide text-[var(--paper)]">
            {message}
          </p>
          <p className="text-[10px] uppercase tracking-widest text-[var(--civic-amber)] mt-1.5 opacity-80">
            Querying OpenStreetMap
          </p>
        </div>
      </div>
    </div>
  );
}
