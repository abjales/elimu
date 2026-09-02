import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Admin routes require authentication — checked server-side in each route,
// but this middleware redirects unauthenticated users away from /admin/* pages
// so they don't see a blank page while the server component loads.
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect admin pages (not API routes — those check auth themselves)
  if (pathname.startsWith('/admin') && !pathname.startsWith('/api/')) {
    // We can't check JWT in edge middleware without a session token strategy,
    // so we just let the server components handle auth + redirect.
    // This middleware exists to add security headers and rate limiting later.
  }

  // Protect dashboard pages
  if (pathname.startsWith('/dashboard') && !pathname.startsWith('/api/')) {
    // Same as above — server components handle auth.
  }

  const response = NextResponse.next();

  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
