import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ADMIN_COOKIE } from '@/lib/admin-cookie';

/**
 * Gate on /admin.
 *
 * The middleware only checks that a cookie is present; the value is verified
 * on the server in the admin layout, which can reach the secret. Keeping the
 * crypto out of here avoids pulling node:crypto into the edge bundle while
 * still bouncing anonymous visitors before any admin markup renders.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith('/admin') || pathname === '/admin/login') {
    return NextResponse.next();
  }
  if (!request.cookies.get(ADMIN_COOKIE)?.value) {
    const url = request.nextUrl.clone();
    url.pathname = '/admin/login';
    url.search = '';
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ['/admin/:path*'] };
