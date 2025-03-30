import { NextResponse } from "next/server"
import knotClient from "@/lib/knot"
import { mockDb } from "@/lib/mock-data"
import { UserConnectionService } from "@/lib/db-service"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, merchantName, merchantId } = body

    // Validate input
    if (!userId || !merchantName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    console.log(`Connecting merchant for user ${userId}: ${merchantName}`);

    // Map merchant names to standard formats and IDs
    const merchantMap: Record<string, { name: string, id: number }> = {
      "spotify": { name: "Spotify", id: 13 },
      "netflix": { name: "Netflix", id: 16 },
      "doordash": { name: "DoorDash", id: 19 },
      "amazon": { name: "Amazon", id: 44 },
      "uber": { name: "Uber", id: 10 }
    };

    // Get standardized merchant name and ID
    const standardMerchant = 
      merchantMap[merchantName.toLowerCase()] || 
      { name: merchantName, id: merchantId || Math.floor(Math.random() * 100) + 1 };

    // Call Knot API to connect the merchant with the updated method signature
    const connectionResult = await knotClient.connectCompany(
      userId, 
      standardMerchant.name, 
      standardMerchant.id
    );

    if (!connectionResult.success) {
      console.error(`Failed to connect ${merchantName}:`, connectionResult.error);
      return NextResponse.json({ error: connectionResult.error }, { status: 500 })
    }

    console.log(`Successfully connected ${merchantName}:`, connectionResult);

    // Update our mock database to mark this merchant as connected
    await mockDb.markCompanyAsKnotConnected(userId, standardMerchant.name);

    // Force the current user's connection data to include this merchant
    // This is important for the mock implementation to ensure connections are visible
    await knotClient.forceConnectionForUser(userId, standardMerchant.name, standardMerchant.id);
    
    // Save the connection to MongoDB
    try {
      await UserConnectionService.addUserConnection(
        userId,
        standardMerchant.name,
        standardMerchant.id,
        connectionResult.connection_id || `knot-connection-${Date.now()}`,
        {
          source: 'user-initiated',
          createdAt: new Date(),
          connectionData: connectionResult
        }
      );
      console.log(`Successfully saved connection to MongoDB: ${standardMerchant.name}`);
    } catch (dbError) {
      console.error(`Error saving connection to MongoDB: ${standardMerchant.name}`, dbError);
      // Continue despite MongoDB error - we don't want to fail the request
    }
    
    // For demo purposes: When connecting streaming services, connect both Spotify and Netflix
    // This ensures users can see both demo experiences
    if (standardMerchant.name === 'Spotify' || standardMerchant.name === 'Netflix') {
      // Connect both services to ensure a good demo experience
      if (standardMerchant.name === 'Spotify') {
        console.log('Automatically connecting Netflix too for better demo experience');
        const netflixInfo = merchantMap['netflix'];
        await knotClient.forceConnectionForUser(userId, netflixInfo.name, netflixInfo.id);
        await mockDb.markCompanyAsKnotConnected(userId, netflixInfo.name);
        
        // Save Netflix connection to MongoDB as well
        try {
          await UserConnectionService.addUserConnection(
            userId, 
            netflixInfo.name, 
            netflixInfo.id,
            `auto-netflix-${Date.now()}`,
            { 
              source: 'auto-connected-with-spotify',
              createdAt: new Date()
            }
          );
        } catch (dbError) {
          console.error('Error saving auto-connected Netflix to MongoDB', dbError);
        }
      } else {
        console.log('Automatically connecting Spotify too for better demo experience');
        const spotifyInfo = merchantMap['spotify'];
        await knotClient.forceConnectionForUser(userId, spotifyInfo.name, spotifyInfo.id);
        await mockDb.markCompanyAsKnotConnected(userId, spotifyInfo.name);
        
        // Save Spotify connection to MongoDB as well
        try {
          await UserConnectionService.addUserConnection(
            userId, 
            spotifyInfo.name, 
            spotifyInfo.id,
            `auto-spotify-${Date.now()}`,
            { 
              source: 'auto-connected-with-netflix',
              createdAt: new Date()
            }
          );
        } catch (dbError) {
          console.error('Error saving auto-connected Spotify to MongoDB', dbError);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully connected ${standardMerchant.name} with Knot`,
      data: connectionResult,
      merchant: standardMerchant
    })
  } catch (error) {
    console.error("Error connecting merchant:", error)
    return NextResponse.json(
      { error: "Failed to connect merchant" },
      { status: 500 }
    )
  }
} 