import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // If the user is accessing the home page and is logged in, redirect to dashboard
  if (path === '/') {
    const response = NextResponse.next();
    
    try {
      // We can only get the session client-side, not in middleware
      // So instead, we'll rely on the client-side redirect we added
      // to the home page component
      return response;
    } catch (error) {
      console.error('Error in middleware:', error);
      return response;
    }
  }

  // Handle post-login redirects
  if (path.includes('/api/auth/callback')) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
}

// See: https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
export const config = {
  matcher: ['/', '/api/auth/callback/:path*'],
}; 