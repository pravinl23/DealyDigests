import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    // Get the Auth0 session
    const res = NextResponse.next();
    const session = await getSession(req as any, res);

    // Return session data for debugging
    return NextResponse.json({
      authenticated: !!session,
      session: session ? {
        user: {
          email: session.user.email,
          name: session.user.name,
          // Don't include sensitive data
        },
        expiresIn: session.expiresIn,
      } : null,
      cookies: req.headers.get('cookie'),
      serverTime: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Debug route error:', error);
    return NextResponse.json({
      error: 'Failed to get session',
      message: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
} 