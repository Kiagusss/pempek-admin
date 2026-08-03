'use server';

import { supabase } from '@/lib/supabase';
import type { Article } from '@/types';
import { revalidatePath } from 'next/cache';

// Helper to map Supabase row to Article type
function mapRow(r: any): Article {
  return {
    id: String(r.id),
    title: r.title ?? '',
    slug: r.slug ?? '',
    thumbnail: r.thumbnail ?? '',
    category: r.category ?? '',
    content: r.content ?? '',
    author: r.author ?? '',
    date: r.date ?? '',
    status: r.status ?? 'draft',
    seoTitle: r.seo_title ?? undefined,
    seoDescription: r.seo_description ?? undefined,
    metaKeywords: r.meta_keywords ?? undefined,
    createdAt: r.created_at ?? '',
    updatedAt: r.updated_at ?? '',
  };
}

function genSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export async function getArticles(): Promise<Article[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .order('date', { ascending: false });
  if (error) throw error;
  return (data || []).map(mapRow);
}

export async function createArticle(
  data: Omit<Article, 'id' | 'slug' | 'createdAt' | 'updatedAt'>,
): Promise<Article> {
  if (!supabase) throw new Error('Supabase not configured');

  const slug = genSlug(data.title);
  const { data: inserted, error } = await supabase
    .from('articles')
    .insert([{
      title: data.title,
      slug,
      thumbnail: data.thumbnail,
      category: data.category,
      content: data.content,
      author: data.author,
      date: data.date,
      status: data.status,
      seo_title: data.seoTitle || null,
      seo_description: data.seoDescription || null,
      meta_keywords: data.metaKeywords || null,
    }])
    .select()
    .single();

  if (error) throw error;
  revalidatePath('/admin/artikel');
  revalidatePath('/artikel');
  return mapRow(inserted);
}

export async function updateArticle(id: string, data: Partial<Article>): Promise<Article | null> {
  if (!supabase) throw new Error('Supabase not configured');

  const updates: Record<string, unknown> = {};
  if (data.title !== undefined) { updates.title = data.title; updates.slug = genSlug(data.title); }
  if (data.thumbnail !== undefined) updates.thumbnail = data.thumbnail;
  if (data.category !== undefined) updates.category = data.category;
  if (data.content !== undefined) updates.content = data.content;
  if (data.author !== undefined) updates.author = data.author;
  if (data.date !== undefined) updates.date = data.date;
  if (data.status !== undefined) updates.status = data.status;
  if (data.seoTitle !== undefined) updates.seo_title = data.seoTitle || null;
  if (data.seoDescription !== undefined) updates.seo_description = data.seoDescription || null;
  if (data.metaKeywords !== undefined) updates.meta_keywords = data.metaKeywords || null;
  updates.updated_at = new Date().toISOString();

  const { data: updated, error } = await supabase
    .from('articles')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  revalidatePath('/admin/artikel');
  revalidatePath('/artikel');
  return mapRow(updated);
}

export async function deleteArticle(id: string): Promise<boolean> {
  if (!supabase) throw new Error('Supabase not configured');
  const { error } = await supabase.from('articles').delete().eq('id', id);
  if (error) throw error;
  revalidatePath('/admin/artikel');
  revalidatePath('/artikel');
  return true;
}
