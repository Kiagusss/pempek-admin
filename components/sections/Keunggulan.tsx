import type { ReactNode } from 'react';
import Section from '@/components/ui/Section';

const features = [
  {
    icon: 'fresh',
    title: 'Fresh Setiap Hari',
    description: 'Dibuat segar setiap pagi menggunakan bahan-bahan berkualitas pilihan.',
  },
  {
    icon: 'natural',
    title: 'Tanpa Pengawet',
    description: 'Bebas bahan pengawet, pewarna buatan, dan bahan kimia berbahaya.',
  },
  {
    icon: 'fish',
    title: 'Ikan Pilihan',
    description: 'Menggunakan ikan tenggiri segar grade A untuk cita rasa terbaik.',
  },
  {
    icon: 'delivery',
    title: 'Pengiriman Cepat',
    description: 'Same day delivery untuk area Palembang, 1-3 hari untuk luar kota.',
  },
];

const iconMap: Record<string, ReactNode> = {
  fresh: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" />
    </svg>
  ),
  natural: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
      <path d="M8 14s1.5 2 4 2 4-2 4-2" />
      <line x1="9" y1="9" x2="9.01" y2="9" />
      <line x1="15" y1="9" x2="15.01" y2="9" />
    </svg>
  ),
  fish: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6.5 12c.94-3.46 4.94-6 8.5-6 3.56 0 6.06 2.54 7 6-.94 3.46-3.44 6-7 6-3.56 0-7.56-2.54-8.5-6z" />
      <path d="M2.5 15.5L6.5 12 2.5 8.5" />
      <circle cx="16" cy="12" r="1" />
    </svg>
  ),
  delivery: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="1" y="3" width="15" height="13" rx="1" />
      <path d="M16 8h4l3 3v5h-7V8z" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  ),
};

export default function Keunggulan() {
  return (
    <Section background="gray">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((feature, index) => (
          <div
            key={feature.title}
            className={[
              'group rounded-[var(--radius-xl)] bg-white p-6 transition-all',
              `duration-[var(--dur-slow)]`,
              'hover:shadow-[var(--shadow-md)] hover:-translate-y-0.5',
              `delay-${index + 1}`,
            ].join(' ')}
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--color-accent-light)] transition-colors duration-[var(--dur-normal)] group-hover:bg-[var(--color-accent-bg)]">
              {iconMap[feature.icon]}
            </div>
            <h3 className="text-base font-semibold text-[var(--color-ink)]">
              {feature.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-2)]">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </Section>
  );
}
