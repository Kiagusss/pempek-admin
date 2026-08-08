import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifySessionToken } from '@/lib/auth-core';
import { rateLimit } from '@/lib/rate-limit';

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']);

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!, // Service key: upload dari server, bukan anon
  { auth: { persistSession: false } },
);

export async function POST(request: NextRequest) {
  // 1) Auth: hanya admin yang boleh upload
  const token = request.cookies.get('admin_session')?.value;
  const authenticated = await verifySessionToken(token);
  if (!authenticated) {
    return NextResponse.json({ message: 'Tidak diizinkan' }, { status: 401 });
  }

  // 2) Rate limit: 30 upload/menit per IP
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';
  const rl = rateLimit(`upload:${ip}`, 30, 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { message: `Terlalu banyak upload. Coba lagi dalam ${rl.retryAfterSec} detik.` },
      { status: 429 },
    );
  }

  // 3) Validasi file
  const formData = await request.formData().catch(() => null);
  const file = formData?.get('file') as File | null;
  if (!file) {
    return NextResponse.json({ message: 'Tidak ada file yang diupload' }, { status: 400 });
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json(
      { message: 'Tipe file tidak didukung. Gunakan JPG, PNG, WebP, GIF, atau AVIF.' },
      { status: 400 },
    );
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ message: 'Ukuran file maksimal 5 MB.' }, { status: 400 });
  }

  // 4) Upload
  const arrayBuffer = await file.arrayBuffer();
  const buffer = new Uint8Array(arrayBuffer);

  // Nama file unik: timestamp + sanitasi nama asli (hindari path traversal)
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 80);
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}`;

  const { data, error } = await supabaseAdmin.storage
    .from('images')
    .upload(fileName, buffer, {
      contentType: file.type,
      upsert: false,
      cacheControl: '3600',
    });

  if (error) {
    console.error('Supabase storage upload error:', error);
    return NextResponse.json({ message: `Gagal mengupload gambar: ${error.message}` }, { status: 500 });
  }

  const { data: publicUrlData } = supabaseAdmin.storage.from('images').getPublicUrl(fileName);
  return NextResponse.json({ url: publicUrlData.publicUrl });
}
