import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Section, { SectionHeader } from '@/components/ui/Section';
import { fetchArticles } from '@/lib/supabase';
import { SITE_NAME, SITE_URL } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Artikel & Tips Pempek Palembang — Resep, Sejarah, dan Cara Menyimpan',
  description:
    'Kumpulan artikel seputar pempek Palembang: resep cuko asli, sejarah pempek, tips menyimpan pempek frozen, dan cara menikmati pempek terbaik.',
  keywords: [
    'artikel pempek',
    'resep pempek',
    'sejarah pempek',
    'cara menyimpan pempek frozen',
    'resep cuko pempek',
    'tips pempek',
  ],
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: `${SITE_URL}/artikel`,
    siteName: SITE_NAME,
    title: 'Artikel & Tips Pempek Palembang',
    description:
      'Resep, sejarah, dan tips seputar pempek Palembang dari dapur kami.',
  },
  alternates: {
    canonical: `${SITE_URL}/artikel`,
  },
};

export default async function ArtikelPage() {
  const articles = (await fetchArticles()).filter(
    (a) => a.status === 'published',
  );

  return (
    <>
      <Navbar />
      <main>
        <Section id="artikel-list">
          <SectionHeader
            title="Artikel & Tips Pempek"
            subtitle="Resep, sejarah, dan cerita seputar pempek Palembang."
          />

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <Link
                key={article.id}
                href={`/artikel/${article.slug}`}
                className="group overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-paper-3)] bg-white transition-all duration-[var(--dur-slow)] hover:shadow-[var(--shadow-md)] hover:-translate-y-0.5"
              >
                <div className="relative aspect-[16/9] overflow-hidden bg-[var(--color-paper-2)]">
                  <Image
                    src={article.thumbnail}
                    alt={article.title}
                    fill
                    className="object-cover transition-transform duration-[var(--dur-slow)] group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <span className="absolute top-3 left-3 rounded-[var(--radius-md)] bg-white/90 backdrop-blur-sm px-2.5 py-1 text-xs font-medium text-[var(--color-ink-2)]">
                    {article.category}
                  </span>
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
                  <h2 className="mt-2 text-base font-semibold text-[var(--color-ink)] line-clamp-2 leading-snug group-hover:text-[var(--color-accent)] transition-colors duration-[var(--dur-normal)]">
                    {article.title}
                  </h2>
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
      </main>
      <Footer />
    </>
  );
}
