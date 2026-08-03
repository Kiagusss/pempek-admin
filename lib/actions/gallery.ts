'use server';

import { supabaseAdmin } from '@/lib/supabase-admin';
import type { GalleryItem } from '@/types';
import { revalidatePath } from 'next/cache';

type Row = Record<string, unknown>;

function mapRow(r: Row): GalleryItem {
  return {
    id: String(r.id),
    images: Array.isArray(r.images) ? r.images.map(String) : [],
    caption: String(r.caption ?? ''),
    category: String(r.category ?? ''),
  };
}

function db() {
  if (!supabaseAdmin) throw new Error('Supabase belum dikonfigurasi');
  return supabaseAdmin;
}

export async function getGallery(): Promise<GalleryItem[]> {
  const { data, error } = await db().from('gallery').select('*').order('id', { ascending: false });
  if (error) throw error;
  return (data || []).map((r) => mapRow(r as Row));
}

export async function createGalleryItem(data: Omit<GalleryItem, 'id'>): Promise<GalleryItem> {
  const { data: inserted, error } = await db()
    .from('gallery')
    .insert({ images: data.images, caption: data.caption, category: data.category })
    .select().single();
  if (error) throw error;
  revalidatePath('/admin/galeri');
  return mapRow(inserted as Row);
}

export async function updateGalleryItem(id: string, data: Partial<GalleryItem>): Promise<GalleryItem | null> {
  const updates: Row = {};
  if (data.images !== undefined) updates.images = data.images;
  if (data.caption !== undefined) updates.caption = data.caption;
  if (data.category !== undefined) updates.category = data.category;
  const { data: updated, error } = await db().from('gallery').update(updates).eq('id', id).select().single();
  if (error) throw error;
  revalidatePath('/admin/galeri');
  return mapRow(updated as Row);
}

export async function deleteGalleryItem(id: string): Promise<boolean> {
  const { error } = await db().from('gallery').delete().eq('id', id);
  if (error) throw error;
  revalidatePath('/admin/galeri');
  return true;
}
