import { NextResponse } from 'next/server';
import { getUserByEmail, updateUserCreditCards, connectToDatabase } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    // Ensure database connection
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = await getUserByEmail(email);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
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

    const body = await request.json();
    const { email, creditCards } = body;

    if (!email || !creditCards) {
      return NextResponse.json({ error: 'Email and credit cards are required' }, { status: 400 });
    }

    const success = await updateUserCreditCards(email, creditCards);
    
    if (!success) {
      return NextResponse.json({ error: 'Failed to update cards' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating cards:', error);
    return NextResponse.json({ error: 'Failed to update cards' }, { status: 500 });
  }
} 