'use server';

import { supabaseAdmin } from '@/lib/supabase-admin';
import type { Category } from '@/types';
import { revalidatePath } from 'next/cache';

type Row = Record<string, unknown>;

function mapRow(r: Row): Category {
  return {
    id: String(r.id),
    name: String(r.name ?? ''),
    slug: String(r.slug ?? ''),
    icon: r.icon ? String(r.icon) : undefined,
    order: Number(r.ord ?? 0),
    status: (r.status as Category['status']) ?? 'draft',
  };
}

function genSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function db() {
  if (!supabaseAdmin) throw new Error('Supabase belum dikonfigurasi');
  return supabaseAdmin;
}

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await db().from('categories').select('*').order('ord', { ascending: true });
  if (error) throw error;
  return (data || []).map((r) => mapRow(r as Row));
}

export async function createCategory(data: Omit<Category, 'id' | 'slug'>): Promise<Category> {
  const { data: inserted, error } = await db()
    .from('categories')
    .insert({ name: data.name, slug: genSlug(data.name), icon: data.icon ?? null, ord: data.order, status: data.status })
    .select().single();
  if (error) throw error;
  revalidatePath('/admin/kategori');
  return mapRow(inserted as Row);
}

export async function updateCategory(id: string, data: Partial<Category>): Promise<Category | null> {
  const updates: Row = {};
  if (data.name !== undefined) { updates.name = data.name; updates.slug = genSlug(data.name); }
  if (data.icon !== undefined) updates.icon = data.icon ?? null;
  if (data.order !== undefined) updates.ord = data.order;
  if (data.status !== undefined) updates.status = data.status;
  const { data: updated, error } = await db().from('categories').update(updates).eq('id', id).select().single();
  if (error) throw error;
  revalidatePath('/admin/kategori');
  return mapRow(updated as Row);
}

export async function deleteCategory(id: string): Promise<boolean> {
  const { error } = await db().from('categories').delete().eq('id', id);
  if (error) throw error;
  revalidatePath('/admin/kategori');
  return true;
}
