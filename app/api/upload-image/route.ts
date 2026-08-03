import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!, // <- URL asli (bukan service key)
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, // <- Gunakan public anon key untuk upload
  { auth: { persistSession: false } }
);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    if (!file) {
      return NextResponse.json({ message: 'Tidak ada file yang diupload' }, { status: 400 });
    }

    // Konversi File ke ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // Nama file unik dengan timestamp dan nama asli
    const fileName = `${Date.now()}-${file.name}`;

    // Upload ke Supabase Storage bucket 'images'
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

    // Dapatkan URL publik
    const { data: publicUrlData } = supabaseAdmin.storage.from('images').getPublicUrl(fileName);
    const publicUrl = publicUrlData.publicUrl;

    return NextResponse.json({ url: publicUrl });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ message: 'Terjadi kesalahan saat mengupload gambar' }, { status: 500 });
  }
}