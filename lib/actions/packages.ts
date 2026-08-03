'use server';

import { supabaseAdmin } from '@/lib/supabase-admin';
import type { Package, PackageItem } from '@/types';
import { revalidatePath } from 'next/cache';

type Row = Record<string, unknown>;

function parseItems(raw: unknown): PackageItem[] {
  if (Array.isArray(raw)) return raw as PackageItem[];
  if (typeof raw === 'string') {
    try {
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? (arr as PackageItem[]) : [];
    } catch {
      return [];
    }
  }
  return [];
}

function mapRow(r: Row): Package {
  return {
    id: String(r.id),
    name: String(r.name ?? ''),
    description: String(r.description ?? ''),
    items: parseItems(r.items),
    price: Number(r.price ?? 0),
    originalPrice: r.original_price != null ? Number(r.original_price) : undefined,
    badge: r.badge ? String(r.badge) : undefined,
    isFeatured: Boolean(r.is_featured),
  };
}

function db() {
  if (!supabaseAdmin) throw new Error('Supabase belum dikonfigurasi');
  return supabaseAdmin;
}

export async function getPackages(): Promise<Package[]> {
  const { data, error } = await db().from('packages').select('*').order('id', { ascending: true });
  if (error) throw error;
  return (data || []).map((r) => mapRow(r as Row));
}

export async function createPackage(data: Omit<Package, 'id'>): Promise<Package> {
  const { data: inserted, error } = await db()
    .from('packages')
    .insert({
      name: data.name,
      description: data.description,
      items: data.items,
      price: data.price,
      original_price: data.originalPrice ?? null,
      badge: data.badge ?? null,
      is_featured: data.isFeatured,
    })
    .select()
    .single();
  if (error) throw error;
  revalidatePath('/admin/paket');
  revalidatePath('/');
  return mapRow(inserted as Row);
}

export async function updatePackage(id: string, data: Partial<Package>): Promise<Package | null> {
  const updates: Row = {};
  if (data.name !== undefined) updates.name = data.name;
  if (data.description !== undefined) updates.description = data.description;
  if (data.items !== undefined) updates.items = data.items;
  if (data.price !== undefined) updates.price = data.price;
  if (data.originalPrice !== undefined) updates.original_price = data.originalPrice ?? null;
  if (data.badge !== undefined) updates.badge = data.badge ?? null;
  if (data.isFeatured !== undefined) updates.is_featured = data.isFeatured;
  const { data: updated, error } = await db().from('packages').update(updates).eq('id', id).select().single();
  if (error) throw error;
  revalidatePath('/admin/paket');
  revalidatePath('/');
  return mapRow(updated as Row);
}

export async function deletePackage(id: string): Promise<boolean> {
  const { error } = await db().from('packages').delete().eq('id', id);
  if (error) throw error;
  revalidatePath('/admin/paket');
  revalidatePath('/');
  return true;
}
