import type { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'accent';
  className?: string;
}

export default function Badge({
  children,
  variant = 'default',
  className = '',
}: BadgeProps) {
  const variants = {
    default:
      'bg-[var(--color-paper-2)] text-[var(--color-ink-2)]',
    success:
      'bg-[oklch(95%_0.05_145)] text-[var(--color-success)]',
    accent:
      'bg-[var(--color-accent-light)] text-[oklch(45%_0.16_85)]',
  };

  return (
    <span
      className={[
        'inline-flex items-center px-2.5 py-0.5 text-xs font-semibold rounded-[var(--radius-md)]',
        variants[variant],
        className,
      ].join(' ')}
    >
      {children}
    </span>
  );
}
