'use server';

import { cookies } from 'next/headers';
import { signSession } from '@/lib/auth-core';
import { redirect } from 'next/navigation';

const SESSION_COOKIE = 'admin_session';

async function createSession() {
  const token = await signSession();
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 hari
  });
}

async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

async function verifyPassword(password: string): Promise<boolean> {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || expected.length < 8) {
    throw new Error('ADMIN_PASSWORD belum di-set (minimal 8 karakter)');
  }
  return password === expected;
}

export async function login(prevState: { error?: string } | undefined, formData: FormData) {
  const password = formData.get('password');
  if (typeof password !== 'string' || password.length === 0) {
    return { error: 'Password wajib diisi.' };
  }

  try {
    const valid = await verifyPassword(password);
    if (!valid) {
      return { error: 'Password salah. Coba lagi.' };
    }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Terjadi kesalahan.' };
  }

  await createSession();
  redirect('/admin');
}

export async function logout() {
  await destroySession();
  redirect('/admin/login');
}
