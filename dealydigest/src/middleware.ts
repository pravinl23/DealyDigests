import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';

export async function middleware(request: NextRequest) {
  // Skip auth check for public routes and auth-related routes
  if (
    request.nextUrl.pathname.startsWith('/api/auth/') ||
    request.nextUrl.pathname === '/' ||
    request.nextUrl.pathname.startsWith('/_next/') ||
    request.nextUrl.pathname.includes('/static/')
  ) {
    return NextResponse.next();
  }

  try {
    const res = NextResponse.next();
    const session = await getSession(request as any, res);
    
    // Debug session state
    console.log('Middleware session check:', 
      session ? `User ${session.user.email} is authenticated` : 'No session found');

    // If there's no session and we're trying to access protected routes
    if (!session) {
      const returnTo = encodeURIComponent(request.nextUrl.pathname);
      return NextResponse.redirect(new URL(`/api/auth/login?returnTo=${returnTo}`, request.url));
    }

    return res;
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.redirect(new URL('/api/auth/login', request.url));
  }
}

// Update the matcher to exclude Auth0 callback routes and specifically include the dashboard
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/:path*',
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
}; 