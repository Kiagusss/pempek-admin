interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
}

export default function Skeleton({ className = '', variant = 'rectangular' }: SkeletonProps) {
  const baseClass = 'animate-pulse bg-[var(--color-paper-3)]';
  const variantClass = {
    text: 'rounded-[var(--radius-sm)] h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-[var(--radius-lg)]',
  };

  return <div className={`${baseClass} ${variantClass[variant]} ${className}`} aria-hidden="true" />;
}

export function ProductCardSkeleton() {
  return (
    <div className="rounded-[var(--radius-xl)] bg-white p-3">
      <Skeleton className="w-full aspect-[4/3] mb-3" />
      <Skeleton variant="text" className="w-3/4 mb-2" />
      <Skeleton variant="text" className="w-full mb-2" />
      <Skeleton variant="text" className="w-1/3 mb-3" />
      <Skeleton className="w-full h-10" />
    </div>
  );
}
