'use server';

import { supabaseAdmin } from '@/lib/supabase-admin';
import type { Product } from '@/types';
import { revalidatePath } from 'next/cache';

type Row = Record<string, unknown>;

function mapRow(r: Row): Product {
  return {
    id: String(r.id),
    name: String(r.name ?? ''),
    slug: String(r.slug ?? ''),
    price: Number(r.price ?? 0),
    priceStrikethrough: r.price_strikethrough != null ? Number(r.price_strikethrough) : undefined,
    categoryId: String(r.category_id ?? ''),
    shortDescription: String(r.short_description ?? ''),
    fullDescription: String(r.full_description ?? ''),
    composition: String(r.composition ?? ''),
    stock: Number(r.stock ?? 0),
    weight: Number(r.weight ?? 0),
    status: (r.status as Product['status']) ?? 'draft',
    isBestSeller: Boolean(r.is_best_seller),
    isFeatured: Boolean(r.is_featured),
    order: Number(r.ord ?? 0),
    thumbnail: String(r.thumbnail ?? ''),
    images: Array.isArray(r.images) ? r.images.map(String) : [],
    seoTitle: r.seo_title ? String(r.seo_title) : undefined,
    seoDescription: r.seo_description ? String(r.seo_description) : undefined,
    metaKeywords: r.meta_keywords ? String(r.meta_keywords) : undefined,
    createdAt: String(r.created_at ?? ''),
    updatedAt: String(r.updated_at ?? ''),
  };
}

function genSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function db() {
  if (!supabaseAdmin) throw new Error('Supabase belum dikonfigurasi');
  return supabaseAdmin;
}

// Helper upload gambar ke bucket 'images' dan kembalikan URL publik.
export async function uploadImageToStorage(file: File): Promise<string> {
  if (!supabaseAdmin) throw new Error('Supabase belum dikonfigurasi');
  const fileName = `${Date.now()}-${file.name}`;
  const { data, error } = await supabaseAdmin.storage.from('images').upload(fileName, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type,
  });
  if (error) throw new Error(`Gagal mengupload gambar: ${error.message}`);

  const { data: publicUrl } = supabaseAdmin.storage.from('images').getPublicUrl(fileName);
  return publicUrl.publicUrl;
}

export async function getProducts(): Promise<Product[]> {
  const { data, error } = await db()
    .from('products')
    .select('*')
    .order('ord', { ascending: true });
  if (error) throw error;
  return (data || []).map((r) => mapRow(r as Row));
}

export async function createProduct(
  data: Omit<Product, 'id' | 'slug' | 'createdAt' | 'updatedAt'>,
): Promise<Product> {
  const { data: inserted, error } = await db()
    .from('products')
    .insert({
      name: data.name,
      slug: genSlug(data.name),
      price: data.price,
      price_strikethrough: data.priceStrikethrough ?? null,
      category_id: data.categoryId ? Number(data.categoryId) : null,
      short_description: data.shortDescription,
      full_description: data.fullDescription,
      composition: data.composition,
      stock: data.stock,
      weight: data.weight,
      status: data.status,
      is_best_seller: data.isBestSeller,
      is_featured: data.isFeatured,
      ord: data.order,
      thumbnail: data.thumbnail,
      images: data.images ?? [],
      seo_title: data.seoTitle || null,
      seo_description: data.seoDescription || null,
      meta_keywords: data.metaKeywords || null,
    })
    .select()
    .single();
  if (error) throw error;
  revalidatePath('/admin/produk');
  revalidatePath('/');
  return mapRow(inserted as Row);
}

export async function updateProduct(
  id: string,
  data: Partial<Product>,
): Promise<Product | null> {
  const updates: Row = {};
  if (data.name !== undefined) { updates.name = data.name; updates.slug = genSlug(data.name); }
  if (data.price !== undefined) updates.price = data.price;
  if (data.priceStrikethrough !== undefined) updates.price_strikethrough = data.priceStrikethrough || null;
  if (data.categoryId !== undefined) updates.category_id = data.categoryId ? Number(data.categoryId) : null;
  if (data.shortDescription !== undefined) updates.short_description = data.shortDescription;
  if (data.fullDescription !== undefined) updates.full_description = data.fullDescription;
  if (data.composition !== undefined) updates.composition = data.composition;
  if (data.stock !== undefined) updates.stock = data.stock;
  if (data.weight !== undefined) updates.weight = data.weight;
  if (data.status !== undefined) updates.status = data.status;
  if (data.isBestSeller !== undefined) updates.is_best_seller = data.isBestSeller;
  if (data.isFeatured !== undefined) updates.is_featured = data.isFeatured;
  if (data.order !== undefined) updates.ord = data.order;
  if (data.thumbnail !== undefined) updates.thumbnail = data.thumbnail;
  if (data.images !== undefined) updates.images = data.images;
  if (data.seoTitle !== undefined) updates.seo_title = data.seoTitle || null;
  if (data.seoDescription !== undefined) updates.seo_description = data.seoDescription || null;
  if (data.metaKeywords !== undefined) updates.meta_keywords = data.metaKeywords || null;

  const { data: updated, error } = await db()
    .from('products')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  revalidatePath('/admin/produk');
  revalidatePath('/');
  return mapRow(updated as Row);
}

export async function deleteProduct(id: string): Promise<boolean> {
  const { error } = await db().from('products').delete().eq('id', id);
  if (error) throw error;
  revalidatePath('/admin/produk');
  revalidatePath('/');
  return true;
}