import { SignJWT, jwtVerify } from 'jose';

// Pure JWT helpers — safe to import from Proxy (middleware runtime).
// No next/headers, no server-only. Use in proxy.ts.
const secret = new TextEncoder().encode(
  process.env.SESSION_SECRET ?? 'dev-only-secret-change-me',
);

export async function signSession(): Promise<string> {
  return new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);
}

export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  try {
    await jwtVerify(token, secret, {
      algorithms: ['HS256'],
      // Toleransi clock skew: jam server kadang maju/mundur beberapa detik.
      // Default 0 → "JWT issued at future" saat jam tidak sinkron (NTP mati).
      clockTolerance: 60,
    });
    return true;
  } catch {
    return false;
  }
}
