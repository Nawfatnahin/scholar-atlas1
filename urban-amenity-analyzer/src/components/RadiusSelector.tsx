'use client';

interface RadiusSelectorProps {
  radius: number;
  onChange: (radius: number) => void;
}

const RADIUS_OPTIONS = [
  { label: '10 min', value: 800, description: '800m' },
  { label: '15 min', value: 1200, description: '1.2km' },
  { label: '20 min', value: 1600, description: '1.6km' },
];

export function RadiusSelector({ radius, onChange }: RadiusSelectorProps) {
  return (
    <div className="flex items-stretch border border-[var(--line)] bg-[rgba(7,7,6,0.82)]">
      {RADIUS_OPTIONS.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`focus-editorial min-w-20 border-r border-[var(--line)] px-3 py-2 text-left text-xs font-semibold uppercase tracking-[0.12em] transition-colors last:border-r-0 ${
            radius === option.value
              ? 'bg-[var(--civic-amber)] text-[var(--ink)]'
              : 'text-[var(--paper-muted)] hover:bg-[rgba(244,239,229,0.06)] hover:text-[var(--paper)]'
          }`}
          id={`radius-${option.value}`}
        >
          <span className="block">{option.label}</span>
          <span className="block text-[9px] font-medium opacity-70">
            {option.description}
          </span>
        </button>
      ))}
    </div>
  );
}
