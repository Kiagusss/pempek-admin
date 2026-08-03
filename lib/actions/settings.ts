'use server';

import { supabaseAdmin } from '@/lib/supabase-admin';
import type { SiteSettings } from '@/types';
import { revalidatePath } from 'next/cache';

type Row = Record<string, unknown>;

function mapRow(r: Row): SiteSettings {
  return {
    logo: String(r.logo ?? ''),
    siteName: String(r.site_name ?? ''),
    address: String(r.address ?? ''),
    whatsapp: String(r.whatsapp ?? ''),
    instagram: String(r.instagram ?? ''),
    facebook: String(r.facebook ?? ''),
    tiktok: String(r.tiktok ?? ''),
    googleMapsEmbed: String(r.google_maps_embed ?? ''),
    email: String(r.email ?? ''),
    operatingHours: String(r.operating_hours ?? ''),
    footerText: String(r.footer_text ?? ''),
    aboutUs: String(r.about_us ?? ''),
  };
}

function db() {
  if (!supabaseAdmin) throw new Error('Supabase belum dikonfigurasi');
  return supabaseAdmin;
}

export async function getSettings(): Promise<SiteSettings> {
  const { data, error } = await db().from('settings').select('*').eq('id', 1).maybeSingle();
  if (error) throw error;
  return data ? mapRow(data as Row) : mapRow({ id: 1 });
}

export async function updateSettings(data: Partial<SiteSettings>): Promise<SiteSettings> {
  const updates: Row = {};
  if (data.logo !== undefined) updates.logo = data.logo;
  if (data.siteName !== undefined) updates.site_name = data.siteName;
  if (data.address !== undefined) updates.address = data.address;
  if (data.whatsapp !== undefined) updates.whatsapp = data.whatsapp;
  if (data.instagram !== undefined) updates.instagram = data.instagram;
  if (data.facebook !== undefined) updates.facebook = data.facebook;
  if (data.tiktok !== undefined) updates.tiktok = data.tiktok;
  if (data.googleMapsEmbed !== undefined) updates.google_maps_embed = data.googleMapsEmbed;
  if (data.email !== undefined) updates.email = data.email;
  if (data.operatingHours !== undefined) updates.operating_hours = data.operatingHours;
  if (data.footerText !== undefined) updates.footer_text = data.footerText;
  if (data.aboutUs !== undefined) updates.about_us = data.aboutUs;
  updates.updated_at = new Date().toISOString();
  const { data: updated, error } = await db().from('settings').update(updates).eq('id', 1).select().single();
  if (error) throw error;
  revalidatePath('/admin/pengaturan');
  revalidatePath('/');
  return mapRow(updated as Row);
}
