'use server';

import { supabaseAdmin } from '@/lib/supabase-admin';
import type { SEOSettings } from '@/types';
import { revalidatePath } from 'next/cache';

type Row = Record<string, unknown>;

function mapRow(r: Row): SEOSettings {
  return {
    metaTitle: String(r.meta_title ?? ''),
    metaDescription: String(r.meta_description ?? ''),
    keywords: String(r.keywords ?? ''),
    ogImage: String(r.og_image ?? ''),
    canonicalUrl: String(r.canonical_url ?? ''),
    robots: String(r.robots ?? 'index, follow'),
    googleVerification: String(r.google_verification ?? ''),
    schemaJsonLd: String(r.schema_json_ld ?? ''),
    favicon: String(r.favicon ?? ''),
  };
}

function db() {
  if (!supabaseAdmin) throw new Error('Supabase belum dikonfigurasi');
  return supabaseAdmin;
}

export async function getSEOSettings(): Promise<SEOSettings> {
  return getSEO();
}

export async function getSEO(): Promise<SEOSettings> {
  const { data, error } = await db().from('seo').select('*').eq('id', 1).maybeSingle();
  if (error) throw error;
  return data ? mapRow(data as Row) : mapRow({});
}

export async function updateSEOSettings(data: Partial<SEOSettings>): Promise<SEOSettings> {
  return updateSEO(data);
}

export async function updateSEO(data: Partial<SEOSettings>): Promise<SEOSettings> {
  const updates: Row = {};
  if (data.metaTitle !== undefined) updates.meta_title = data.metaTitle;
  if (data.metaDescription !== undefined) updates.meta_description = data.metaDescription;
  if (data.keywords !== undefined) updates.keywords = data.keywords;
  if (data.ogImage !== undefined) updates.og_image = data.ogImage;
  if (data.canonicalUrl !== undefined) updates.canonical_url = data.canonicalUrl;
  if (data.robots !== undefined) updates.robots = data.robots;
  if (data.googleVerification !== undefined) updates.google_verification = data.googleVerification;
  if (data.schemaJsonLd !== undefined) updates.schema_json_ld = data.schemaJsonLd;
  if (data.favicon !== undefined) updates.favicon = data.favicon;
  updates.updated_at = new Date().toISOString();
  const { data: updated, error } = await db().from('seo').update(updates).eq('id', 1).select().single();
  if (error) throw error;
  revalidatePath('/admin/seo');
  revalidatePath('/');
  return mapRow(updated as Row);
}
