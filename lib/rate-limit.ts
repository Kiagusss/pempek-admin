import 'server-only';

// Rate limiter in-memory sederhana (per-proses).
// ponytail: memory-only — reset saat server restart, tidak shared antar instance.
//           upgrade: pakai Redis/Upstash kalau multi-instance atau butuh persistensi.
const buckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { allowed: boolean; retryAfterSec: number } {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now >= bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSec: 0 };
  }

  bucket.count += 1;
  if (bucket.count > limit) {
    return { allowed: false, retryAfterSec: Math.ceil((bucket.resetAt - now) / 1000) };
  }
  return { allowed: true, retryAfterSec: 0 };
}

// Bersihkan bucket kedaluwarsa agar Map tidak membengkak (jalan tiap 10 menit).
setInterval(() => {
  const now = Date.now();
  buckets.forEach((bucket, key) => {
    if (now >= bucket.resetAt) buckets.delete(key);
  });
}, 10 * 60 * 1000).unref();
