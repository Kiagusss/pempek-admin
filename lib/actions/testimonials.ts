'use server';

import { supabaseAdmin } from '@/lib/supabase-admin';
import type { Testimonial } from '@/types';
import { revalidatePath } from 'next/cache';

type Row = Record<string, unknown>;

function mapRow(r: Row): Testimonial {
  return {
    id: String(r.id),
    name: String(r.name ?? ''),
    photo: String(r.photo ?? ''),
    rating: Number(r.rating ?? 5),
    comment: String(r.comment ?? ''),
    status: (r.status as Testimonial['status']) ?? 'draft',
  };
}

function db() {
  if (!supabaseAdmin) throw new Error('Supabase belum dikonfigurasi');
  return supabaseAdmin;
}

export async function getTestimonials(): Promise<Testimonial[]> {
  const { data, error } = await db().from('testimonials').select('*').order('id', { ascending: false });
  if (error) throw error;
  return (data || []).map((r) => mapRow(r as Row));
}

export async function createTestimonial(data: Omit<Testimonial, 'id'>): Promise<Testimonial> {
  const { data: inserted, error } = await db()
    .from('testimonials')
    .insert({ name: data.name, photo: data.photo, rating: data.rating, comment: data.comment, status: data.status })
    .select()
    .single();
  if (error) throw error;
  revalidatePath('/admin/testimoni');
  revalidatePath('/');
  return mapRow(inserted as Row);
}

export async function updateTestimonial(id: string, data: Partial<Testimonial>): Promise<Testimonial | null> {
  const updates: Row = {};
  if (data.name !== undefined) updates.name = data.name;
  if (data.photo !== undefined) updates.photo = data.photo;
  if (data.rating !== undefined) updates.rating = data.rating;
  if (data.comment !== undefined) updates.comment = data.comment;
  if (data.status !== undefined) updates.status = data.status;
  const { data: updated, error } = await db().from('testimonials').update(updates).eq('id', id).select().single();
  if (error) throw error;
  revalidatePath('/admin/testimoni');
  revalidatePath('/');
  return mapRow(updated as Row);
}

export async function deleteTestimonial(id: string): Promise<boolean> {
  const { error } = await db().from('testimonials').delete().eq('id', id);
  if (error) throw error;
  revalidatePath('/admin/testimoni');
  revalidatePath('/');
  return true;
}
