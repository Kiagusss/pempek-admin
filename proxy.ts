import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/auth-core';

const PUBLIC_ADMIN_ROUTES = ['/admin/login'];

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isAdminRoute = pathname === '/admin' || pathname.startsWith('/admin/');
  if (!isAdminRoute) return NextResponse.next();

  const isPublic = PUBLIC_ADMIN_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + '/'),
  );
  if (isPublic) return NextResponse.next();

  const authenticated = await verifySessionToken(req.cookies.get('admin_session')?.value);
  if (!authenticated) {
    const loginUrl = new URL('/admin/login', req.nextUrl);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
