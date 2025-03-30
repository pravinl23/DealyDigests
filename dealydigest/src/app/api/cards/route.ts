import { NextResponse } from 'next/server';
import { updateUserCreditCards, connectToDatabase, findOrCreateUser } from '@/lib/mongodb';
import { getSession } from '@auth0/nextjs-auth0';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    // Ensure database connection
    await connectToDatabase();

    // Get Auth0 session to get user ID
    const res = NextResponse.next();
    const session = await getSession(request as any, res);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const auth0Id = session.user.sub; // Auth0 stores user ID in the 'sub' claim
    const email = session.user.email;

    if (!auth0Id) {
      return NextResponse.json({ error: 'Auth0 ID not found in session' }, { status: 400 });
    }

    console.log(`Looking up user with Auth0 ID: ${auth0Id}`);
    const user = await findOrCreateUser(auth0Id, email);
    
    if (!user) {
      return NextResponse.json({ error: 'Failed to find or create user' }, { status: 500 });
    }

    return NextResponse.json(user);
  } catch (error: unknown) {
    console.error('Error fetching user cards:', error);

    return NextResponse.json({ 
        error: 'Failed to fetch user cards', 
        details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // Ensure database connection
    await connectToDatabase();

    // Get Auth0 session to get user ID
    const res = NextResponse.next();
    const session = await getSession(request as any, res);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const auth0Id = session.user.sub;
    
    if (!auth0Id) {
      return NextResponse.json({ error: 'Auth0 ID not found in session' }, { status: 400 });
    }

    const body = await request.json();
    const { creditCards } = body;

    if (!creditCards) {
      return NextResponse.json({ error: 'Credit cards data is required' }, { status: 400 });
    }

    const success = await updateUserCreditCards(auth0Id, creditCards);
    
    if (!success) {
      return NextResponse.json({ error: 'Failed to update cards' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating cards:', error);
    return NextResponse.json({ error: 'Failed to update cards' }, { status: 500 });
  }
} 