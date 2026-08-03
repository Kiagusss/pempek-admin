import type { ReactNode } from 'react';

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  trend?: { value: string; positive: boolean };
}

export default function StatsCard({ label, value, icon, trend }: StatsCardProps) {
  return (
    <div className="rounded-[var(--radius-xl)] border border-[var(--color-paper-3)] bg-white p-5 transition-all duration-[var(--dur-slow)] hover:shadow-[var(--shadow-sm)]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-[var(--color-ink-3)]">{label}</p>
          <p className="mt-1 text-2xl font-bold text-[var(--color-ink)] tabular-nums">{value}</p>
          {trend && (
            <p className={`mt-1 text-xs font-medium ${trend.positive ? 'text-[var(--color-success)]' : 'text-[var(--color-error)]'}`}>
              {trend.positive ? '↑' : '↓'} {trend.value}
            </p>
          )}
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--color-accent-light)] text-[var(--color-accent)]">
          {icon}
        </div>
      </div>
    </div>
  );
}
