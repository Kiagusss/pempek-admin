import Image from 'next/image';
import Section, { SectionHeader } from '@/components/ui/Section';
import type { Article } from '@/types';
import Link from 'next/link';

export default function Artikel({ articles }: { articles: Article[] }) {
  const published = articles
    .filter((a) => a.status === 'published')
    .slice(0, 3);

  return (
    <Section id="artikel">
      <SectionHeader
        title="Artikel Terbaru"
        subtitle="Tips, resep, dan cerita seputar pempek Palembang."
      />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {published.map((article) => (
          <Link
            href={`/artikel/${article.slug}`}
            key={article.id}
            className="group overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-paper-3)] bg-white transition-all duration-[var(--dur-slow)] hover:shadow-[var(--shadow-md)] hover:-translate-y-0.5"
          >
            {/* Thumbnail */}
            <div className="relative aspect-[16/9] overflow-hidden bg-[var(--color-paper-2)]">
              <Image
                src={article.thumbnail}
                alt={article.title}
                fill
                className="object-cover transition-transform duration-[var(--dur-slow)] group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
              <div className="absolute top-3 left-3">
                <span className="rounded-[var(--radius-md)] bg-white/90 backdrop-blur-sm px-2.5 py-1 text-xs font-medium text-[var(--color-ink-2)]">
                  {article.category}
                </span>
              </div>
            </div>

            <div className="p-5">
              <time
                dateTime={article.date}
                className="text-xs text-[var(--color-ink-3)]"
              >
                {new Date(article.date).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </time>
              <h3 className="mt-2 text-base font-semibold text-[var(--color-ink)] line-clamp-2 leading-snug group-hover:text-[var(--color-accent)] transition-colors duration-[var(--dur-normal)]">
                {article.title}
              </h3>
              <p className="mt-2 text-sm text-[var(--color-ink-2)] line-clamp-2 leading-relaxed">
                {article.content}
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-[var(--color-accent)]">
                Baca selengkapnya
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </Link>
        ))}
      </div>
    </Section>
  );
}
