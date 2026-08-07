import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// POST /api/track — dicatat dari landing page (sendBeacon).
// Tidak butuh auth: anon boleh insert (RLS), read hanya admin (service key).
export async function POST(request: Request) {
  if (!supabaseAdmin) return new NextResponse(null, { status: 204 });

  let path = '/';
  try {
    const body = await request.json();
    if (typeof body?.path === 'string' && body.path.length <= 200) path = body.path;
  } catch {
    // body tidak valid → tetap catat sebagai '/'
  }

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    '';

  await supabaseAdmin
    .from('page_views')
    .insert({ path, ip, user_agent: request.headers.get('user-agent')?.slice(0, 300) ?? '' });

  return new NextResponse(null, { status: 204 });
}
