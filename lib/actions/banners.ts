'use server';

import { supabaseAdmin } from '@/lib/supabase-admin';
import type { Banner } from '@/types';
import { revalidatePath } from 'next/cache';

type Row = Record<string, unknown>;

function mapRow(r: Row): Banner {
  return {
    id: String(r.id),
    title: String(r.title ?? ''),
    subtitle: String(r.subtitle ?? ''),
    buttonText: String(r.button_text ?? ''),
    buttonLink: String(r.button_link ?? ''),
    backgroundImage: String(r.background_image ?? ''),
    status: (r.status as Banner['status']) ?? 'draft',
  };
}

function db() {
  if (!supabaseAdmin) throw new Error('Supabase belum dikonfigurasi');
  return supabaseAdmin;
}

export async function getBanners(): Promise<Banner[]> {
  const { data, error } = await db().from('banners').select('*').order('id', { ascending: true });
  if (error) throw error;
  return (data || []).map((r) => mapRow(r as Row));
}

export async function createBanner(data: Omit<Banner, 'id'>): Promise<Banner> {
  const { data: inserted, error } = await db()
    .from('banners')
    .insert({ title: data.title, subtitle: data.subtitle, button_text: data.buttonText, button_link: data.buttonLink, background_image: data.backgroundImage, status: data.status })
    .select().single();
  if (error) throw error;
  revalidatePath('/admin/banner');
  revalidatePath('/');
  return mapRow(inserted as Row);
}

export async function updateBanner(id: string, data: Partial<Banner>): Promise<Banner | null> {
  const updates: Row = {};
  if (data.title !== undefined) updates.title = data.title;
  if (data.subtitle !== undefined) updates.subtitle = data.subtitle;
  if (data.buttonText !== undefined) updates.button_text = data.buttonText;
  if (data.buttonLink !== undefined) updates.button_link = data.buttonLink;
  if (data.backgroundImage !== undefined) updates.background_image = data.backgroundImage;
  if (data.status !== undefined) updates.status = data.status;
  const { data: updated, error } = await db().from('banners').update(updates).eq('id', id).select().single();
  if (error) throw error;
  revalidatePath('/admin/banner');
  revalidatePath('/');
  return mapRow(updated as Row);
}

export async function deleteBanner(id: string): Promise<boolean> {
  const { error } = await db().from('banners').delete().eq('id', id);
  if (error) throw error;
  revalidatePath('/admin/banner');
  revalidatePath('/');
  return true;
}
