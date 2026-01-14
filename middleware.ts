import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isProtectedRoute } from '@/lib/utils';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Redirect root path to /auth
  if (path === '/') {
    const url = request.nextUrl.clone();
    url.pathname = '/auth';
    return NextResponse.redirect(url);
  }

  // Handle protected routes
  if (isProtectedRoute(path)) {
    const url = request.nextUrl.clone();
    url.pathname = '/coming-soon';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',  // Add root path to matcher
    '/image/:path*',
    '/audio/:path*',
    '/video/:path*',
    // '/project/:path*',
    // '/developer/:path*',
    '/changelog/:path*',
  ],
};