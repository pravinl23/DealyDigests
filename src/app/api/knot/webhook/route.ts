import { NextResponse } from "next/server";
import { 
  ServiceDataService, 
  UserConnectionService 
} from "@/lib/db-service";
import knotClient from "@/lib/knot";

// Process incoming webhook from Knot
export async function POST(request: Request) {
  try {
    // Verify webhook signature if Knot provides one
    // const signature = request.headers.get('x-knot-signature');
    
    // Parse webhook payload
    const payload = await request.json();
    console.log('Received Knot webhook:', JSON.stringify(payload, null, 2));
    
    // Extract relevant information from the payload
    const { event, user_id, merchant, data } = payload;
    
    if (!user_id) {
      return NextResponse.json({ error: 'Missing user ID' }, { status: 400 });
    }
    
    // Handle different webhook event types
    switch (event) {
      case 'connection.created':
        await handleConnectionCreated(user_id, merchant, data);
        break;
        
      case 'connection.updated':
        await handleConnectionUpdated(user_id, merchant, data);
        break;
        
      case 'connection.deleted':
        await handleConnectionDeleted(user_id, merchant);
        break;
        
      case 'data.spotify':
        await handleSpotifyData(user_id, data);
        break;
        
      case 'data.netflix':
        await handleNetflixData(user_id, data);
        break;
        
      case 'data.doordash':
        await handleDoorDashData(user_id, data);
        break;
        
      case 'data.uber':
        await handleUberData(user_id, data);
        break;
        
      case 'data.amazon':
        await handleAmazonData(user_id, data);
        break;
        
      default:
        console.log(`Unhandled webhook event type: ${event}`);
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}

// Handle new connection event
async function handleConnectionCreated(userId: string, merchant: any, data: any) {
  try {
    console.log(`Adding new connection for user ${userId}: ${merchant.name}`);
    
    // Store the connection in MongoDB
    await UserConnectionService.addUserConnection(
      userId,
      merchant.name,
      merchant.id,
      data.connection_id,
      { raw: data }
    );
    
    // Immediately fetch initial data for this service
    await fetchInitialServiceData(userId, merchant.name);
    
    console.log(`Successfully added connection for ${merchant.name}`);
  } catch (error) {
    console.error(`Error handling connection created for ${merchant.name}:`, error);
  }
}

// Handle updated connection event
async function handleConnectionUpdated(userId: string, merchant: any, data: any) {
  try {
    console.log(`Updating connection for user ${userId}: ${merchant.name}`);
    
    // Update the connection in MongoDB
    await UserConnectionService.addUserConnection(
      userId,
      merchant.name,
      merchant.id,
      data.connection_id,
      { raw: data, updatedAt: new Date() }
    );
    
    console.log(`Successfully updated connection for ${merchant.name}`);
  } catch (error) {
    console.error(`Error handling connection updated for ${merchant.name}:`, error);
  }
}

// Handle deleted connection event
async function handleConnectionDeleted(userId: string, merchant: any) {
  try {
    console.log(`Removing connection for user ${userId}: ${merchant.name}`);
    
    // Mark the connection as inactive in MongoDB
    await UserConnectionService.removeUserConnection(
      userId,
      merchant.name
    );
    
    console.log(`Successfully removed connection for ${merchant.name}`);
  } catch (error) {
    console.error(`Error handling connection deleted for ${merchant.name}:`, error);
  }
}

// Handle Spotify data webhook
async function handleSpotifyData(userId: string, data: any) {
  try {
    console.log(`Received Spotify data for user ${userId}`);
    
    // Process and store the Spotify data in MongoDB
    await ServiceDataService.updateSpotifyData(userId, data);
    
    console.log(`Successfully updated Spotify data for user ${userId}`);
  } catch (error) {
    console.error(`Error handling Spotify data for user ${userId}:`, error);
  }
}

// Handle Netflix data webhook
async function handleNetflixData(userId: string, data: any) {
  try {
    console.log(`Received Netflix data for user ${userId}`);
    
    // Process and store the Netflix data in MongoDB
    await ServiceDataService.updateNetflixData(userId, data);
    
    console.log(`Successfully updated Netflix data for user ${userId}`);
  } catch (error) {
    console.error(`Error handling Netflix data for user ${userId}:`, error);
  }
}

// Handle DoorDash data webhook
async function handleDoorDashData(userId: string, data: any) {
  try {
    console.log(`Received DoorDash data for user ${userId}`);
    
    // Process and store the DoorDash data in MongoDB
    await ServiceDataService.updateDoorDashData(userId, data);
    
    console.log(`Successfully updated DoorDash data for user ${userId}`);
  } catch (error) {
    console.error(`Error handling DoorDash data for user ${userId}:`, error);
  }
}

// Handle Uber data webhook
async function handleUberData(userId: string, data: any) {
  try {
    console.log(`Received Uber data for user ${userId}`);
    
    // Process and store the Uber data in MongoDB
    await ServiceDataService.updateUberData(userId, data);
    
    console.log(`Successfully updated Uber data for user ${userId}`);
  } catch (error) {
    console.error(`Error handling Uber data for user ${userId}:`, error);
  }
}

// Handle Amazon data webhook
async function handleAmazonData(userId: string, data: any) {
  try {
    console.log(`Received Amazon data for user ${userId}`);
    
    // Process and store the Amazon data in MongoDB
    await ServiceDataService.updateAmazonData(userId, data);
    
    console.log(`Successfully updated Amazon data for user ${userId}`);
  } catch (error) {
    console.error(`Error handling Amazon data for user ${userId}:`, error);
  }
}

// Fetch initial data when a new connection is created
async function fetchInitialServiceData(userId: string, merchantName: string) {
  try {
    const normalizedMerchant = merchantName.toLowerCase();
    
    // Based on the merchant name, fetch the appropriate data
    if (normalizedMerchant.includes('spotify')) {
      const spotifyData = await knotClient.getSpotifyData(userId);
      await ServiceDataService.updateSpotifyData(userId, spotifyData);
    } 
    else if (normalizedMerchant.includes('netflix')) {
      const netflixData = await knotClient.getNetflixData(userId);
      await ServiceDataService.updateNetflixData(userId, netflixData);
    }
    // Add other services as needed
    
    console.log(`Successfully fetched initial data for ${merchantName}`);
  } catch (error) {
    console.error(`Error fetching initial data for ${merchantName}:`, error);
  }
} 