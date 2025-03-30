import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

interface RequestBody {
  mcc: string;
  latitude: number;
  longitude: number;
}

export async function POST(request: Request) {
  try {
    const body: RequestBody = await request.json();
    const { mcc, latitude, longitude } = body;

    if (!mcc || !latitude || !longitude) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Call Google Maps Places API to get nearby places
    const placesResponse = await fetch(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=10&key=${process.env.GOOGLE_MAPS_API_KEY}`
    );

    const placesData = await placesResponse.json();

    if (placesData.status !== 'OK' || !placesData.results.length) {
      return NextResponse.json(
        { error: 'No places found at the specified location' },
        { status: 404 }
      );
    }

    // Format places for Gemini analysis
    const places = placesData.results.map((place: any) => ({
      name: place.name,
      types: place.types,
      vicinity: place.vicinity,
    }));

    // Use Gemini to analyze the places and MCC code
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `
      Based on the following information, identify the most likely store where a purchase was made:
      
      MCC Code: ${mcc}
      Nearby Places:
      ${JSON.stringify(places, null, 2)}
      
      Please analyze the MCC code and the nearby places to determine which store is most likely where the purchase was made.
      Return only the name of the most likely store.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const storeName = response.text().trim();

    return NextResponse.json({ storeName });
  } catch (error) {
    console.error('Error identifying store:', error);
    return NextResponse.json(
      { error: 'Failed to identify store' },
      { status: 500 }
    );
  }
} 