import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Article } from '@/types';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase: SupabaseClient | null =
  url && anonKey ? createClient(url, anonKey) : null;

// Mapping kolom snake_case (Supabase) → camelCase (type Article)
type Row = Record<string, unknown>;
function mapRow(r: Row): Article {
  return {
    id: String(r.id),
    title: String(r.title ?? ''),
    slug: String(r.slug ?? ''),
    thumbnail: String(r.thumbnail ?? ''),
    category: String(r.category ?? ''),
    content: String(r.content ?? ''),
    author: String(r.author ?? ''),
    date: String(r.date ?? ''),
    seoTitle: r.seo_title ? String(r.seo_title) : undefined,
    seoDescription: r.seo_description ? String(r.seo_description) : undefined,
    metaKeywords: r.meta_keywords ? String(r.meta_keywords) : undefined,
    status: (r.status as Article['status']) ?? 'draft',
    createdAt: String(r.created_at ?? r.date ?? ''),
    updatedAt: String(r.updated_at ?? r.date ?? ''),
  };
}

/**
 * Ambil artikel dari Supabase. Jika Supabase belum dikonfigurasi
 * (env kosong) atau tabel belum ada, fallback ke data lokal (lib/data.ts).
 */
export async function fetchArticles(): Promise<Article[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .order('date', { ascending: false });

  if (error || !data) return [];
  return (data as Row[]).map(mapRow);
}

export async function fetchArticleBySlug(slug: string): Promise<Article | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !data) return null;
  return mapRow(data as Row);
}

export async function fetchRelatedArticles(
  article: Article,
  limit = 3,
): Promise<Article[]> {
  const all = await fetchArticles();
  return all
    .filter((a) => a.id !== article.id && a.status === 'published')
    .slice(0, limit);
}
