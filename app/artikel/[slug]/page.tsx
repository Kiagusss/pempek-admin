import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Section from '@/components/ui/Section';
import { fetchArticles, fetchArticleBySlug, fetchRelatedArticles } from '@/lib/supabase';
import { SITE_NAME, SITE_URL } from '@/lib/seo';
import type { Article } from '@/types/article';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await fetchArticleBySlug(slug);
  
  if (!article) {
    return { title: 'Artikel Tidak Ditemukan' };
  }
  
  const title = article.seoTitle || article.title;
  const description = article.seoDescription || article.content.slice(0, 160);
  const url = `${SITE_URL}/artikel/${article.slug}`;
  const image = article.thumbnail || `${SITE_URL}/images/hero-pempek.png`;
  
  return {
    title,
    description,
    keywords: article.metaKeywords?.split(',').map(k => k.trim()) || ['pempek', 'artikel', article.category.toLowerCase()],
    openGraph: {
      type: 'article',
      locale: 'id_ID',
      url,
      siteName: SITE_NAME,
      title,
      description,
      images: [{ url: image, width: 1200, height: 630, alt: article.title }],
      publishedTime: article.date,
      authors: [article.author],
      tags: [article.category],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
    alternates: {
      canonical: url,
    },
    other: {
      'article:published_time': article.date,
      'article:author': article.author,
      'article:section': article.category,
    },
  };
}

export async function generateStaticParams() {
  const articles = await fetchArticles();
  return articles
    .filter((a) => a.status === 'published')
    .map((a) => ({ slug: a.slug }));
}

export default async function ArticleDetailPage({ params }: Props) {
  const { slug } = await params;
  const article = await fetchArticleBySlug(slug);
  
  if (!article) {
    notFound();
  }
  
  const relatedArticles = await fetchRelatedArticles(article);
  
  const formattedDate = new Date(article.date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  
  return (
    <>
      <Navbar />
      <main>
        <Section id="artikel-detail" className="py-16 lg:py-24">
          <article className="max-w-3xl mx-auto">
            {/* Breadcrumb */}
            <nav className="mb-8 text-sm" aria-label="Breadcrumb">
              <ol className="flex items-center gap-2 text-[var(--color-ink-3)]">
                <li>
                  <Link href="/" className="hover:text-[var(--color-accent)] transition-colors">
                    Beranda
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li>
                  <Link href="/artikel" className="hover:text-[var(--color-accent)] transition-colors">
                    Artikel
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li className="text-[var(--color-ink)] font-medium" aria-current="page">
                  {article.title}
                </li>
              </ol>
            </nav>
            
            {/* Header */}
            <header className="mb-10">
              <span className="inline-block rounded-[var(--radius-md)] bg-[var(--color-accent-bg)] px-3 py-1 text-xs font-semibold text-[var(--color-accent)] mb-4">
                {article.category}
              </span>
              <h1 className="text-3xl lg:text-4xl font-bold text-[var(--color-ink)] leading-tight mb-4">
                {article.title}
              </h1>
              <div className="flex items-center gap-4 text-sm text-[var(--color-ink-2)]">
                <span>{article.author}</span>
                <span aria-hidden="true">·</span>
                <time dateTime={article.date}>{formattedDate}</time>
              </div>
            </header>
            
            {/* Thumbnail */}
            {article.thumbnail && (
              <div className="relative aspect-video rounded-[var(--radius-xl)] overflow-hidden mb-10 bg-[var(--color-paper-2)]">
                <Image
                  src={article.thumbnail}
                  alt={article.title}
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 800px"
                />
              </div>
            )}
            
            {/* Content */}
            <div className="prose prose-invert prose-lg max-w-none text-[var(--color-ink)]">
              <div 
                className="prose-content"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />
            </div>
            
            {/* Related Articles */}
            {relatedArticles.length > 0 && (
              <section className="mt-16 pt-10 border-t border-[var(--color-paper-3)]">
                <h2 className="text-2xl font-bold text-[var(--color-ink)] mb-6">
                  Artikel Terkait
                </h2>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {relatedArticles.map((related) => (
                    <Link
                      key={related.id}
                      href={`/artikel/${related.slug}`}
                      className="group overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-paper-3)] bg-white transition-all duration-[var(--dur-slow)] hover:shadow-[var(--shadow-md)] hover:-translate-y-0.5"
                    >
                      <div className="relative aspect-[16/9] overflow-hidden bg-[var(--color-paper-2)]">
                        <Image
                          src={related.thumbnail}
                          alt={related.title}
                          fill
                          className="object-cover transition-transform duration-[var(--dur-slow)] group-hover:scale-105"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                        <span className="absolute top-3 left-3 rounded-[var(--radius-md)] bg-white/90 backdrop-blur-sm px-2.5 py-1 text-xs font-medium text-[var(--color-ink-2)]">
                          {related.category}
                        </span>
                      </div>
                      <div className="p-5">
                        <time
                          dateTime={related.date}
                          className="text-xs text-[var(--color-ink-3)]"
                        >
                          {new Date(related.date).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </time>
                        <h3 className="mt-2 text-base font-semibold text-[var(--color-ink)] line-clamp-2 leading-snug group-hover:text-[var(--color-accent)] transition-colors duration-[var(--dur-normal)]">
                          {related.title}
                        </h3>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </article>
        </Section>
      </main>
      <Footer />
    </>
  );
}