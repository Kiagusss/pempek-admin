import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';
import { sbGet } from '@/lib/actions/supabase-crud';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Halaman statis utama
  const staticPages = [
    { url: `${SITE_URL}`, lastModified: now, changeFrequency: 'weekly' as const, priority: 1 },
    { url: `${SITE_URL}/artikel`, lastModified: now, changeFrequency: 'weekly' as const, priority: 0.7 },
  ];

  // Artikel dinamis (kalau tabel ada)
  let articlePages: MetadataRoute.Sitemap = [];
  try {
    const articles = await sbGet('articles');
    articlePages = articles
      .filter((a) => a.status === 'published' || a.is_published === true)
      .map((a) => ({
        url: `${SITE_URL}/artikel/${a.slug}`,
        lastModified: now,
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      }));
  } catch {
    // tabel belum ada → sitemap tetap jalan dengan halaman statis
  }

  return [...staticPages, ...articlePages];
}
