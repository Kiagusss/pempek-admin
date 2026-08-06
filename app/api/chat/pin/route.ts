import { NextRequest, NextResponse } from 'next/server';

const PIN = process.env.CHAT_ADMIN_PIN;
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 10 * 60 * 1000;

// Rate limit sederhana per-IP (in-memory — cukup untuk satu instance Vercel).
const attempts = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || now > entry.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_ATTEMPTS;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'Terlalu banyak percobaan. Coba lagi nanti.' },
      { status: 429 },
    );
  }

  const body = (await req.json().catch(() => null)) as
    | { pin?: string }
    | null;

  if (!PIN || !body?.pin || body.pin !== PIN) {
    return NextResponse.json({ error: 'PIN salah.' }, { status: 403 });
  }

  // Sukses → reset counter percobaan IP ini.
  attempts.delete(ip);

  return NextResponse.json({ ok: true });
}
