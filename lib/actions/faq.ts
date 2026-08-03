'use server';

import { supabaseAdmin } from '@/lib/supabase-admin';
import type { FAQItem } from '@/types';
import { revalidatePath } from 'next/cache';

type Row = Record<string, unknown>;

function mapRow(r: Row): FAQItem {
  return {
    id: String(r.id),
    question: String(r.question ?? ''),
    answer: String(r.answer ?? ''),
    order: Number(r.ord ?? 0),
    status: (r.status as FAQItem['status']) ?? 'draft',
  };
}

function db() {
  if (!supabaseAdmin) throw new Error('Supabase belum dikonfigurasi');
  return supabaseAdmin;
}

export async function getFAQs(): Promise<FAQItem[]> {
  const { data, error } = await db().from('faqs').select('*').order('ord', { ascending: true });
  if (error) throw error;
  return (data || []).map((r) => mapRow(r as Row));
}

export async function createFAQ(data: Omit<FAQItem, 'id'>): Promise<FAQItem> {
  const { data: inserted, error } = await db()
    .from('faqs')
    .insert({ question: data.question, answer: data.answer, ord: data.order, status: data.status })
    .select()
    .single();
  if (error) throw error;
  revalidatePath('/admin/faq');
  revalidatePath('/');
  return mapRow(inserted as Row);
}

export async function updateFAQ(id: string, data: Partial<FAQItem>): Promise<FAQItem | null> {
  const updates: Row = {};
  if (data.question !== undefined) updates.question = data.question;
  if (data.answer !== undefined) updates.answer = data.answer;
  if (data.order !== undefined) updates.ord = data.order;
  if (data.status !== undefined) updates.status = data.status;
  const { data: updated, error } = await db().from('faqs').update(updates).eq('id', id).select().single();
  if (error) throw error;
  revalidatePath('/admin/faq');
  revalidatePath('/');
  return mapRow(updated as Row);
}

export async function deleteFAQ(id: string): Promise<boolean> {
  const { error } = await db().from('faqs').delete().eq('id', id);
  if (error) throw error;
  revalidatePath('/admin/faq');
  revalidatePath('/');
  return true;
}
