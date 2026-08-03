interface StarRatingProps {
  rating: number;
  max?: number;
  size?: 'sm' | 'md';
  className?: string;
}

export default function StarRating({
  rating,
  max = 5,
  size = 'md',
  className = '',
}: StarRatingProps) {
  const sizeMap = { sm: 14, md: 18 };
  const px = sizeMap[size];

  return (
    <div className={`flex gap-0.5 ${className}`} role="img" aria-label={`Rating ${rating} dari ${max} bintang`}>
      {Array.from({ length: max }, (_, i) => (
        <svg
          key={i}
          width={px}
          height={px}
          viewBox="0 0 20 20"
          fill={i < rating ? 'var(--color-accent)' : 'var(--color-paper-3)'}
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path d="M10 1.5l2.47 5.01 5.53.8-4 3.9.94 5.49L10 14.26 5.06 16.7 6 11.21l-4-3.9 5.53-.8L10 1.5z" />
        </svg>
      ))}
    </div>
  );
}
