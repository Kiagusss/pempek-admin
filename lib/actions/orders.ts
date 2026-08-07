'use server';

import { supabaseAdmin } from '@/lib/supabase-admin';
import type { Order } from '@/types';
import { revalidatePath } from 'next/cache';

type Row = Record<string, unknown>;

function mapRow(r: Row): Order {
  return {
    id: String(r.id),
    name: String(r.name ?? ''),
    whatsapp: String(r.whatsapp ?? ''),
    products: Array.isArray(r.products) ? r.products : [],
    notes: String(r.notes ?? ''),
    date: String(r.date ?? ''),
    status: (r.status as Order['status']) ?? 'pending',
  };
}

function db() {
  if (!supabaseAdmin) throw new Error('Supabase belum dikonfigurasi');
  return supabaseAdmin;
}

export async function getOrders(): Promise<Order[]> {
  const { data, error } = await db().from('orders').select('*').order('id', { ascending: false });
  if (error) throw error;
  return (data || []).map((r) => mapRow(r as Row));
}

export async function getOrder(id: string): Promise<Order | null> {
  const { data, error } = await db().from('orders').select('*').eq('id', id).single();
  if (error) return null;
  return mapRow(data as Row);
}

// Create new order (POS)
export async function createOrder(order: {
  name: string;
  whatsapp?: string;
  products: { productId: string; productName: string; quantity: number; price: number }[];
  notes?: string;
}): Promise<Order> {
  // Validasi stok cukup sebelum membuat order
  const { data: products, error: fetchError } = await db()
    .from('products')
    .select('id, stock')
    .in('id', order.products.map((p) => Number(p.productId)));
  if (fetchError) throw fetchError;

  const stockMap = new Map((products || []).map((p) => [String(p.id), Number(p.stock)]));
  for (const item of order.products) {
    const available = stockMap.get(item.productId) ?? 0;
    if (item.quantity > available) {
      throw new Error(`Stok ${item.productName} tidak mencukupi (tersisa ${available})`);
    }
  }

  const { data: inserted, error } = await db()
    .from('orders')
    .insert({
      name: order.name,
      whatsapp: order.whatsapp ?? '',
      products: order.products,
      notes: order.notes ?? '',
      status: 'pending',
    })
    .select()
    .single();
  if (error) throw error;

  // Kurangi stok produk secara atomik (guard di DB cegah oversell)
  for (const item of order.products) {
    const { data: ok, error: stockError } = await db().rpc('decrement_stock', {
      p_product_id: Number(item.productId),
      p_qty: item.quantity,
    });
    if (stockError || ok === false) {
      throw new Error(`Gagal mengurangi stok ${item.productName}`);
    }
  }

  revalidatePath('/admin/pesanan');
  revalidatePath('/admin/produk');
  revalidatePath('/');
  return mapRow(inserted as Row);
}

export async function updateOrder(id: string, data: Partial<Order>): Promise<Order | null> {
  const updates: Row = {};
  if (data.name !== undefined) updates.name = data.name;
  if (data.whatsapp !== undefined) updates.whatsapp = data.whatsapp;
  if (data.products !== undefined) updates.products = data.products;
  if (data.notes !== undefined) updates.notes = data.notes;
  if (data.status !== undefined) updates.status = data.status;
  const { data: updated, error } = await db().from('orders').update(updates).eq('id', id).select().single();
  if (error) throw error;
  revalidatePath('/admin/pesanan');
  return mapRow(updated as Row);
}

export async function updateOrderStatus(id: string, status: Order['status']): Promise<Order | null> {
  return updateOrder(id, { status });
}

export async function deleteOrder(id: string): Promise<boolean> {
  const { error } = await db().from('orders').delete().eq('id', id);
  if (error) throw error;
  revalidatePath('/admin/pesanan');
  return true;
}

export async function getDashboardStats(range: 'today' | 'month' | 'year' = 'month') {
  const now = new Date();
  let startDate = new Date();

  if (range === 'today') {
    startDate.setHours(0, 0, 0, 0);
  } else if (range === 'month') {
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);
  } else if (range === 'year') {
    startDate.setMonth(0, 1);
    startDate.setHours(0, 0, 0, 0);
  }

  const query = db()
    .from('orders')
    .select('products, status, date')
    .gte('date', startDate.toISOString());

  const { data, error } = await query;

  if (error) {
    console.error(error);
    return { orderCount: 0, productCount: 0, totalRevenue: 0, visitorCount: 0 };
  }

  const completedOrders = data.filter((o) => o.status === 'completed');
  const totalRevenue = completedOrders.reduce((sum, order) => {
    return (
      sum +
      (Array.isArray(order.products)
        ? order.products.reduce((acc, p) => acc + p.price * p.quantity, 0)
        : 0)
    );
  }, 0);

  const { count: productCount } = await db()
    .from('products')
    .select('id', { count: 'exact', head: true });

  // Total kunjungan landing page (semua waktu; range tidak relevan utk MVP)
  const { count: visitorCount } = await db()
    .from('page_views')
    .select('id', { count: 'exact', head: true });

  return {
    orderCount: data.length,
    productCount: productCount || 0,
    totalRevenue: totalRevenue,
    visitorCount: visitorCount || 0,
  };
}