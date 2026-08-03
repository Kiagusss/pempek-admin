import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import AdminShell from '@/components/admin/AdminShell';
import PageHeader from '@/components/admin/PageHeader';
import Badge from '@/components/ui/Badge';
import { fetchArticleBySlug } from '@/lib/supabase';
import type { Article } from '@/types';

interface Props {
  params: Promise<{ slug: string }>;
}

export const metadata: Metadata = {
  title: 'Preview SEO Artikel',
};

export default async function ArticleSeoPreviewPage({ params }: Props) {
  const { slug } = await params;
  const article = await fetchArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const seoTitle = article.seoTitle || article.title;
  const seoDescription = article.seoDescription || article.content.slice(0, 160).replace(/<[^>]*>/g, '');
  const url = `https://pempekpalembang.com/artikel/${article.slug}`;
  const image = article.thumbnail || '/images/hero-pempek.png';
  const keywords = article.metaKeywords?.split(',').map(k => k.trim()) || ['pempek', 'artikel', article.category.toLowerCase()];

  return (
    <AdminShell>
      <PageHeader
        title="Preview SEO Artikel"
        description={`Pratinjau meta tags untuk: ${article.title}`}
        action={
          <Link href={`/artikel/${article.slug}`} target="_blank" rel="noopener noreferrer">
            <button className="rounded-[var(--radius-md)] border border-[var(--color-paper-3)] px-3 py-1.5 text-sm hover:bg-[var(--color-paper-2)] transition-colors flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              Buka Halaman Publik
            </button>
          </Link>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Panel Kiri: Preview Google Search */}
        <section className="rounded-[var(--radius-xl)] border border-[var(--color-paper-3)] bg-white p-6">
          <h3 className="text-lg font-semibold text-[var(--color-ink)] mb-4 flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--color-accent)]">
              <path d="M21 10V4a2 2 0 0 0-2-2h-4" />
              <polyline points="14 10 18 10" />
              <path d="M3.5 20.5A2.5 2.5 0 0 1 2 18c0-1.38 2-1.4 2-1.4a2.5 2.5 0 0 1 3.81 1.48" />
              <path d="M7 16V6" />
              <line x1="8" y1="4" x2="8" y2="20" />
            </svg>
            Preview Google Search
          </h3>
          <div className="space-y-3 font-sans">
            <div className="text-[var(--color-accent)] text-sm leading-none">{url}</div>
            <h4 className="text-lg font-normal text-[var(--color-ink)] leading-snug max-w-xs truncate">{seoTitle}</h4>
            <p className="text-[var(--color-ink-2)] text-sm line-clamp-3 leading-relaxed">{seoDescription}</p>
          </div>
        </section>

        {/* Panel Kanan: Preview Social Share (OpenGraph/Twitter) */}
        <section className="rounded-[var(--radius-xl)] border border-[var(--color-paper-3)] bg-white p-6">
          <h3 className="text-lg font-semibold text-[var(--color-ink)] mb-4 flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--color-accent)]">
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
            Preview Social Share (OpenGraph / Twitter)
          </h3>
          <div className="rounded-[var(--radius-lg)] border border-[var(--color-paper-3)] bg-[var(--color-paper)] p-4 space-y-3">
            <div className="relative aspect-video rounded-[var(--radius-md)] overflow-hidden bg-[var(--color-paper-2)]">
              <span className="absolute inset-0 flex items-center justify-center text-[var(--color-ink-3)] text-sm">
                Thumbnail: {article.thumbnail || '(default hero)'}
              </span>
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-[var(--color-ink)] line-clamp-1">{seoTitle}</p>
              <p className="text-sm text-[var(--color-ink-2)] line-clamp-2">{seoDescription}</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {keywords.map((k, i) => (
                <Badge key={i} variant="default" className="text-xs">{k}</Badge>
              ))}
            </div>
          </div>
        </section>

        {/* Panel Bawah: Raw Meta Tags */}
        <section className="lg:col-span-2 rounded-[var(--radius-xl)] border border-[var(--color-paper-3)] bg-white p-6">
          <h3 className="text-lg font-semibold text-[var(--color-ink)] mb-4">Meta Tags Lengkap (Raw HTML)</h3>
          <div className="rounded-[var(--radius-md)] bg-[var(--color-paper)] p-4 overflow-x-auto">
            <pre className="text-xs text-[var(--color-ink-2)] font-mono leading-relaxed whitespace-pre-wrap"><code>{`<title>${seoTitle}</title>
<meta name="description" content="${seoDescription}" />
<meta name="keywords" content="${keywords.join(', ')}" />

<!-- OpenGraph -->
<meta property="og:type" content="article" />
<meta property="og:url" content="${url}" />
<meta property="og:site_name" content="Pempek Palembang" />
<meta property="og:title" content="${seoTitle}" />
<meta property="og:description" content="${seoDescription}" />
<meta property="og:image" content="${image}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="article:published_time" content="${article.date}" />
<meta property="article:author" content="${article.author}" />
<meta property="article:section" content="${article.category}" />

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${seoTitle}" />
<meta name="twitter:description" content="${seoDescription}" />
<meta name="twitter:image" content="${image}" />

<!-- Canonical -->
<link rel="canonical" href="${url}" />`}</code></pre>
          </div>
        </section>

        {/* Panel: Artikel Detail */}
        <section className="lg:col-span-2 rounded-[var(--radius-xl)] border border-[var(--color-paper-3)] bg-white p-6">
          <h3 className="text-lg font-semibold text-[var(--color-ink)] mb-4">Data Artikel Lengkap</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-xs text-[var(--color-ink-3)]">ID</p>
              <p className="font-mono text-sm text-[var(--color-ink)]">{article.id}</p>
            </div>
            <div>
              <p className="text-xs text-[var(--color-ink-3)]">Slug</p>
              <p className="font-mono text-sm text-[var(--color-ink)]">{article.slug}</p>
            </div>
            <div>
              <p className="text-xs text-[var(--color-ink-3)]">Kategori</p>
              <p className="text-sm text-[var(--color-ink)]">{article.category}</p>
            </div>
            <div>
              <p className="text-xs text-[var(--color-ink-3)]">Status</p>
              <p className="text-sm">
                <Badge variant={article.status === 'published' ? 'success' : 'default'}>
                  {article.status === 'published' ? 'Terbit' : 'Draft'}
                </Badge>
              </p>
            </div>
            <div>
              <p className="text-xs text-[var(--color-ink-3)]">Penulis</p>
              <p className="text-sm text-[var(--color-ink)]">{article.author}</p>
            </div>
            <div>
              <p className="text-xs text-[var(--color-ink-3)]">Tanggal</p>
              <p className="text-sm text-[var(--color-ink)]">{new Date(article.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
            <div>
              <p className="text-xs text-[var(--color-ink-3)]">Dibuat</p>
              <p className="text-sm text-[var(--color-ink)]">{new Date(article.createdAt).toLocaleString('id-ID')}</p>
            </div>
            <div>
              <p className="text-xs text-[var(--color-ink-3)]">Diupdate</p>
              <p className="text-sm text-[var(--color-ink)]">{new Date(article.updatedAt).toLocaleString('id-ID')}</p>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-[var(--color-paper-3)]">
            <p className="text-xs text-[var(--color-ink-3)] mb-2">Konten (Preview 500 karakter)</p>
            <div className="prose prose-sm prose-invert max-w-none bg-[var(--color-paper)] rounded-[var(--radius-md)] p-4">
              <div dangerouslySetInnerHTML={{ __html: article.content.slice(0, 500) }} />
            </div>
          </div>
        </section>
      </div>
    </AdminShell>
  );
}