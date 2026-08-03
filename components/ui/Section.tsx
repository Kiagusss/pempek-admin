import type { ReactNode } from 'react';

interface SectionProps {
  id?: string;
  children: ReactNode;
  className?: string;
  background?: 'white' | 'gray';
}

export default function Section({
  id,
  children,
  className = '',
  background = 'white',
}: SectionProps) {
  const bgClass = background === 'gray' ? 'bg-[var(--color-paper-2)]' : 'bg-[var(--color-paper)]';

  return (
    <section id={id} className={`py-16 sm:py-20 lg:py-24 ${bgClass} ${className}`}>
      <div className="mx-auto max-w-7xl px-5 sm:px-8">{children}</div>
    </section>
  );
}

export function SectionHeader({
  title,
  subtitle,
  className = '',
}: {
  title: string;
  subtitle?: string;
  className?: string;
}) {
  return (
    <div className={`mb-10 sm:mb-14 ${className}`}>
      <h2
        className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl"
        style={{ color: 'var(--color-ink)' }}
      >
        {title}
      </h2>
      {subtitle && (
        <p className="mt-3 text-[var(--color-ink-2)] text-base sm:text-lg max-w-2xl">
          {subtitle}
        </p>
      )}
    </div>
  );
}
