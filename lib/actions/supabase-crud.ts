'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

// Server-only client (service role bypasses RLS)
const serviceClient =
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY
    ? createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_KEY,
        { auth: { persistSession: false } },
      )
    : null;

type Row = Record<string, unknown>;

function toSnake(data: Row): Row {
  const out: Row = {};
  for (const [k, v] of Object.entries(data)) {
    out[k.replace(/[A-Z]/g, (c) => '_' + c.toLowerCase())] = v;
  }
  return out;
}

function toCamel(row: Row): Row {
  const out: Row = {};
  for (const [k, v] of Object.entries(row)) {
    out[k.replace(/_([a-z])/g, (_, c) => c.toUpperCase())] = v;
  }
  return out;
}

export async function sbGet(table: string): Promise<Row[]> {
  if (!serviceClient) return [];
  const { data, error } = await serviceClient.from(table).select('*').order('id', { ascending: false });
  if (error) {
    // Tabel belum dibuat / schema belum dijalankan → jangan crash, return kosong
    if (error.message.includes('Could not find the table') || error.code === '42P01') return [];
    throw new Error(error.message);
  }
  return (data ?? []).map(toCamel);
}

export async function sbGetOne(table: string, id: string | number): Promise<Row | null> {
  if (!serviceClient) return null;
  const { data, error } = await serviceClient.from(table).select('*').eq('id', id).single();
  if (error) throw new Error(error.message);
  return data ? toCamel(data as Row) : null;
}

export async function sbInsert(table: string, data: Row): Promise<Row> {
  if (!serviceClient) throw new Error('Supabase server client belum dikonfigurasi');
  const { data: inserted, error } = await serviceClient
    .from(table)
    .insert(toSnake(data))
    .select()
    .single();
  if (error) throw new Error(error.message);
  revalidatePath('/admin', 'layout');
  return toCamel(inserted as Row);
}

export async function sbUpdate(table: string, id: string | number, data: Row): Promise<Row> {
  if (!serviceClient) throw new Error('Supabase server client belum dikonfigurasi');
  const { data: updated, error } = await serviceClient
    .from(table)
    .update(toSnake({ ...data, updatedAt: new Date().toISOString() }))
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  revalidatePath('/admin', 'layout');
  return toCamel(updated as Row);
}

export async function sbDelete(table: string, id: string | number): Promise<boolean> {
  if (!serviceClient) throw new Error('Supabase server client belum dikonfigurasi');
  const { error } = await serviceClient.from(table).delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin', 'layout');
  return true;
}

// ─── Settings & SEO (single-row tables) ────────────────────
export async function sbGetSettings(table: 'settings' | 'seo'): Promise<Row> {
  if (!serviceClient) return {};
  const { data, error } = await serviceClient.from(table).select('*').eq('id', 1).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? toCamel(data as Row) : {};
}

export async function sbUpsertSettings(table: 'settings' | 'seo', data: Row): Promise<Row> {
  if (!serviceClient) throw new Error('Supabase server client belum dikonfigurasi');
  const { data: saved, error } = await serviceClient
    .from(table)
    .upsert({ id: 1, ...toSnake(data), updated_at: new Date().toISOString() })
    .select()
    .single();
  if (error) throw new Error(error.message);
  revalidatePath('/', 'layout');
  return toCamel(saved as Row);
}
