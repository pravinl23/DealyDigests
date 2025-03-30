import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { MongoClient } from 'mongodb';

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Helper function to clean JSON response from Gemini
function cleanJsonResponse(text: string): string {
  // Remove markdown code block syntax if present
  text = text.replace(/```json\n/g, '').replace(/```\n/g, '').replace(/```/g, '');
  // Remove any leading/trailing whitespace
  text = text.trim();
  return text;
}

interface RequestBody {
  mcc: string;
  latitude: number;
  longitude: number;
  authId: string;
}

interface UserCard {
  last4: string;
  expiry: string;
  card_type: string;
  name: string;
}

interface CardType {
  name: string;
  rating: string;
  annual_fee: string;
  intro_APR: string;
  regular_APR: string;
  best_for: string;
  pros: string[];
  cons: string[];
  details: {
    intro_offer: string;
    rewards: string[];
    features: string[];
  };
}

interface Card {
  name: string;
  last4: string;
  cardDetails?: CardType;
}

export async function POST(request: Request) {
  try {
    const body: RequestBody = await request.json();
    const { mcc, latitude, longitude, authId } = body;

    if (!mcc || !latitude || !longitude || !authId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // First, identify the store
    const storeResponse = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/identify-store`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mcc, latitude, longitude }),
      }
    );

    const storeData = await storeResponse.json();
    if (!storeData.storeName) {
      return NextResponse.json(
        { error: 'Failed to identify store' },
        { status: 500 }
      );
    }

    // Connect to MongoDB
    const client = new MongoClient(process.env.MONGODB_URI || '');
    await client.connect();
    const db = client.db('swipeDB');
    const usersCollection = db.collection('users');
    const cardTypesCollection = db.collection('cardTypes');

    // Get user's document with their cards
    const user = await usersCollection.findOne({ auth0_id: authId });

    if (!user || !user.credit_cards || user.credit_cards.length === 0) {
      await client.close();
      return NextResponse.json(
        { error: 'No cards found for user' },
        { status: 404 }
      );
    }

    // Process each card
    const cardsWithDetails: Card[] = [];
    for (const card of user.credit_cards as UserCard[]) {
      // Search for card details in cardTypes collection
      const cardDetails = await cardTypesCollection.findOne({ 
        name: { $regex: new RegExp(card.name, 'i') } 
      });

      if (cardDetails) {
        cardsWithDetails.push({
          name: card.name,
          last4: card.last4,
          cardDetails: cardDetails as unknown as CardType
        });
      } else {
        // If card not found in cardTypes, use Gemini to get card details
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash'});
        const prompt = `
          Generate a JSON object (without any markdown formatting) containing details about the ${card.name} credit card in this exact format:
          {
            "name": "card name",
            "rating": "rating out of 5",
            "annual_fee": "annual fee amount",
            "intro_APR": "intro APR details",
            "regular_APR": "regular APR range",
            "best_for": "main benefit category",
            "pros": ["list", "of", "pros"],
            "cons": ["list", "of", "cons"],
            "details": {
              "intro_offer": "signup bonus details",
              "rewards": ["list", "of", "reward", "categories"],
              "features": ["list", "of", "card", "features"]
            }
          }
          Return ONLY the JSON object, with no additional text or formatting.
        `;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const cleanedResponse = cleanJsonResponse(response.text());
        const generatedDetails = JSON.parse(cleanedResponse);
        
        cardsWithDetails.push({
          name: card.name,
          last4: card.last4,
          cardDetails: generatedDetails
        });
      }
    }
    await client.close();

    // Use Gemini to recommend the best card
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const prompt = `
      Based on the following information, recommend the best credit card to use for this purchase.
      Return ONLY a JSON object (no markdown formatting) in this exact format:
      {
        "cardName": "name of the best card",
        "last4": "last 4 digits",
        "reason": "detailed explanation of why this card is best for this purchase, including specific rewards rate or benefits that apply"
      }

      Information to analyze:
      Store: ${storeData.storeName}
      MCC Code: ${mcc}
      Available Cards:
      ${JSON.stringify(cardsWithDetails, null, 2)}

      Consider:
      1. The store type and MCC code
      2. Each card's rewards structure
      3. Any special categories or bonuses that might apply
      4. Current intro offers that could be relevant
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const cleanedResponse = cleanJsonResponse(response.text());
    const recommendation = JSON.parse(cleanedResponse);

    return NextResponse.json(recommendation);
  } catch (error) {
    console.error('Error recommending card:', error);
    return NextResponse.json(
      { error: 'Failed to recommend card', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 