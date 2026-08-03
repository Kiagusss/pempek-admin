'use client';

import { useState, useCallback } from 'react';
import Section, { SectionHeader } from '@/components/ui/Section';
import StarRating from '@/components/ui/StarRating';
import type { Testimonial } from '@/types';

export default function Testimoni({ testimonials }: { testimonials: Testimonial[] }) {
  const [current, setCurrent] = useState(0);
  const total = testimonials.length;

  const next = useCallback(() => setCurrent((c) => (c + 1) % total), [total]);
  const prev = useCallback(() => setCurrent((c) => (c - 1 + total) % total), [total]);

  if (total === 0) return null;

  return (
    <Section id="testimoni">
      <SectionHeader
        title="Apa Kata Mereka"
        subtitle="Testimoni dari pelanggan setia kami."
      />

      <div className="relative mx-auto max-w-2xl">
        {/* Testimonial card */}
        <div className="rounded-[var(--radius-xl)] border border-[var(--color-paper-3)] bg-white p-6 sm:p-8">
          <svg
            className="mb-4 text-[var(--color-accent-light)]"
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151C7.563 6.068 6 8.789 6 11h4v10H0z" />
          </svg>

          <p className="text-base leading-relaxed text-[var(--color-ink-2)] sm:text-lg">
            {testimonials[current].comment}
          </p>

          <div className="mt-6 flex items-center gap-4">
            {/* Avatar placeholder */}
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-accent-light)] text-lg font-bold text-[var(--color-accent)]">
              {testimonials[current].name.charAt(0)}
            </div>
            <div>
              <p className="font-semibold text-[var(--color-ink)]">
                {testimonials[current].name}
              </p>
              <StarRating rating={testimonials[current].rating} size="sm" className="mt-0.5" />
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-6 flex items-center justify-center gap-4">
          <button
            onClick={prev}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-paper-3)] text-[var(--color-ink-2)] transition-all duration-[var(--dur-normal)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
            aria-label="Testimoni sebelumnya"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          {/* Dots */}
          <div className="flex gap-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrent(index)}
                className={[
                  'h-2 rounded-full transition-all duration-[var(--dur-normal)]',
                  index === current
                    ? 'w-6 bg-[var(--color-accent)]'
                    : 'w-2 bg-[var(--color-paper-3)] hover:bg-[var(--color-ink-3)]',
                ].join(' ')}
                aria-label={`Testimoni ${index + 1}`}
                aria-current={index === current}
              />
            ))}
          </div>

          <button
            onClick={next}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-paper-3)] text-[var(--color-ink-2)] transition-all duration-[var(--dur-normal)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
            aria-label="Testimoni berikutnya"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </div>
    </Section>
  );
}
