import { NextResponse } from "next/server";
import knotClient from "@/lib/knot";
import { ServiceDataService, UserConnectionService } from "@/lib/db-service";
import { ServiceDataDocument } from "@/models/ServiceData";

export async function GET(request: Request) {
  // Extract userId from the URL query parameters
  const url = new URL(request.url);
  const userId = url.searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  try {
    // First try to get service data from MongoDB
    let serviceData: ServiceDataDocument | null = await ServiceDataService.getServiceData(userId);
    const processedServiceData: Record<string, any> = {};
    
    // If we have service data from MongoDB, extract it
    if (serviceData) {
      if (serviceData.spotify) processedServiceData.spotify = serviceData.spotify;
      if (serviceData.netflix) processedServiceData.netflix = serviceData.netflix;
      if (serviceData.doordash) processedServiceData.doordash = serviceData.doordash;
      if (serviceData.uber) processedServiceData.uber = serviceData.uber;
      if (serviceData.amazon) processedServiceData.amazon = serviceData.amazon;
    } else {
      console.log("No service data found in MongoDB, fetching from Knot API");
    }
    
    // Get user's connections from our MongoDB database
    let userConnections = await UserConnectionService.getUserConnections(userId);
    
    // If no connections in our database, try fetching from Knot API
    if (!userConnections || userConnections.length === 0) {
      console.log("No user connections found in MongoDB, fetching from Knot API");
      const knotConnections = await knotClient.getUserConnections(userId);
      
      // Save Knot connections to our database for future use
      if (knotConnections && knotConnections.length > 0) {
        for (const conn of knotConnections) {
          await UserConnectionService.addUserConnection(
            userId,
            conn.merchant || conn.merchantName,
            conn.merchant_id || conn.merchantId || 0,
            conn.connection_id || conn.connectionId || `knot-${Date.now()}`,
            { source: 'knot-api' }
          );
        }
        
        // Fetch connections again from our database
        userConnections = await UserConnectionService.getUserConnections(userId);
      }
    }
    
    // Map merchant names to service names for consistent comparison
    const serviceNameMap: Record<string, string> = {
      'spotify': 'spotify',
      'netflix': 'netflix',
      'doordash': 'doordash',
      'amazon': 'amazon',
      'uber eats': 'uber',
      'uber': 'uber',
      'walmart': 'walmart',
    };
    
    // Get connected merchants from user connections
    const connectedMerchants = userConnections.map(connection => {
      return (connection.merchantName || '').toLowerCase();
    }).filter(Boolean);
    
    console.log(`Connected merchants:`, connectedMerchants);
    
    // Structure to return to client
    const responseData: any = { 
      serviceData: {} 
    };
    
    // For demo purposes, always include sample data for streaming services
    const alwaysIncludeServices = ['spotify', 'netflix'];
    
    // Process Spotify
    const spotifyConnected = isServiceConnected('spotify', connectedMerchants, serviceNameMap) || 
                          alwaysIncludeServices.includes('spotify');
    console.log(`Spotify connected: ${spotifyConnected}`);
    
    if (spotifyConnected) {
      // Try to get Spotify data from MongoDB first
      if (processedServiceData.spotify) {
        responseData.serviceData.spotify = processedServiceData.spotify;
      } else {
        // Fallback to fetching from Knot API
        try {
          const spotifyData = await knotClient.getSpotifyData(userId);
          responseData.serviceData.spotify = spotifyData;
          
          // Store data in MongoDB for future use
          await ServiceDataService.updateSpotifyData(userId, spotifyData);
        } catch (error) {
          console.error("Error fetching Spotify data:", error);
          responseData.serviceData.spotify = { error: "Failed to fetch Spotify data" };
        }
      }
    }
    
    // Process Netflix
    const netflixConnected = isServiceConnected('netflix', connectedMerchants, serviceNameMap) || 
                          alwaysIncludeServices.includes('netflix');
    console.log(`Netflix connected: ${netflixConnected}`);
    
    if (netflixConnected) {
      // Try to get Netflix data from MongoDB first
      if (processedServiceData.netflix) {
        responseData.serviceData.netflix = processedServiceData.netflix;
      } else {
        // Fallback to fetching from Knot API
        try {
          const netflixData = await knotClient.getNetflixData(userId);
          responseData.serviceData.netflix = netflixData;
          
          // Store data in MongoDB for future use
          await ServiceDataService.updateNetflixData(userId, netflixData);
        } catch (error) {
          console.error("Error fetching Netflix data:", error);
          responseData.serviceData.netflix = { error: "Failed to fetch Netflix data" };
        }
      }
    }
    
    // Process DoorDash
    const doordashConnected = isServiceConnected('doordash', connectedMerchants, serviceNameMap);
    console.log(`DoorDash connected: ${doordashConnected}`);
    
    if (doordashConnected) {
      // Try to get DoorDash data from MongoDB first
      if (processedServiceData.doordash) {
        responseData.serviceData.doordash = processedServiceData.doordash;
      } else {
        // Use mock data for now
        const doordashData = {
          recentOrders: [
            { id: "dd-1", restaurant: "Chipotle", date: "2023-06-15", total: 15.99, items: ["Burrito Bowl", "Chips & Guac"] },
            { id: "dd-2", restaurant: "Shake Shack", date: "2023-06-10", total: 22.50, items: ["ShackBurger", "Fries", "Shake"] },
            { id: "dd-3", restaurant: "Sweetgreen", date: "2023-06-05", total: 14.25, items: ["Custom Salad", "Iced Tea"] }
          ],
          topRestaurants: ["Chipotle", "Shake Shack", "Sweetgreen", "Panera Bread"],
          frequentItems: ["Burrito Bowl", "Salad", "Sandwich", "Fries"],
          upcomingDeals: [
            { id: "deal-1", restaurant: "Chipotle", discount: "20% off", expiryDate: "2023-07-15" },
            { id: "deal-2", restaurant: "Panera Bread", discount: "Free delivery", expiryDate: "2023-07-10" }
          ]
        };
        
        responseData.serviceData.doordash = doordashData;
        
        // Store data in MongoDB for future use
        await ServiceDataService.updateDoorDashData(userId, doordashData);
      }
    }
    
    // Process Uber
    const uberConnected = isServiceConnected('uber', connectedMerchants, serviceNameMap);
    console.log(`Uber connected: ${uberConnected}`);
    
    if (uberConnected) {
      // Try to get Uber data from MongoDB first
      if (processedServiceData.uber) {
        responseData.serviceData.uber = processedServiceData.uber;
      } else {
        // Use mock data for now
        const uberData = {
          recentRides: [
            { id: "uber-1", from: "Home", to: "Work", date: "2023-06-16", cost: 12.50, distance: "3.2 miles" },
            { id: "uber-2", from: "Work", to: "Restaurant", date: "2023-06-14", cost: 8.75, distance: "1.8 miles" },
            { id: "uber-3", from: "Restaurant", to: "Home", date: "2023-06-14", cost: 14.30, distance: "4.1 miles" }
          ],
          frequentDestinations: ["Work", "Home", "Gym", "Airport"],
          upcomingReservations: [
            { id: "res-1", from: "Home", to: "Airport", date: "2023-07-05", time: "08:30 AM" }
          ],
          availablePromotions: [
            { id: "promo-1", code: "SUMMER23", discount: "25% off next ride", expiryDate: "2023-07-31" }
          ]
        };
        
        responseData.serviceData.uber = uberData;
        
        // Store data in MongoDB for future use
        await ServiceDataService.updateUberData(userId, uberData);
      }
    }
    
    // Process Amazon
    const amazonConnected = isServiceConnected('amazon', connectedMerchants, serviceNameMap);
    console.log(`Amazon connected: ${amazonConnected}`);
    
    if (amazonConnected) {
      // Try to get Amazon data from MongoDB first
      if (processedServiceData.amazon) {
        responseData.serviceData.amazon = processedServiceData.amazon;
      } else {
        // Use mock data for now
        const amazonData = {
          recentPurchases: [
            { id: "amz-1", item: "Wireless Headphones", date: "2023-06-12", price: 79.99, status: "Delivered" },
            { id: "amz-2", item: "Smart Home Hub", date: "2023-06-08", price: 129.99, status: "Shipped" },
            { id: "amz-3", item: "Fitness Tracker", date: "2023-06-01", price: 49.99, status: "Delivered" }
          ],
          subscriptions: [
            { id: "sub-1", name: "Amazon Prime", renewalDate: "2023-12-15", price: 14.99 },
            { id: "sub-2", name: "Kindle Unlimited", renewalDate: "2023-07-20", price: 9.99 }
          ],
          recommendations: [
            { id: "rec-1", item: "Bluetooth Speaker", price: 59.99, rating: 4.5 },
            { id: "rec-2", item: "Laptop Stand", price: 29.99, rating: 4.3 },
            { id: "rec-3", item: "Wireless Charger", price: 24.99, rating: 4.7 }
          ],
          upcomingDeliveries: [
            { id: "del-1", item: "Smart Home Hub", estimatedDelivery: "2023-06-20" }
          ]
        };
        
        responseData.serviceData.amazon = amazonData;
        
        // Store data in MongoDB for future use
        await ServiceDataService.updateAmazonData(userId, amazonData);
      }
    }

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error fetching service data:", error);
    return NextResponse.json(
      { error: "Failed to fetch service data" },
      { status: 500 }
    );
  }
}

// Helper function to check if a service is connected
function isServiceConnected(
  serviceName: string, 
  connectedMerchants: string[], 
  serviceNameMap: Record<string, string>
): boolean {
  // Direct match with service name
  if (connectedMerchants.includes(serviceName.toLowerCase())) {
    return true;
  }
  
  // Check if any connected merchant maps to this service
  for (const merchant of connectedMerchants) {
    const normalizedMerchant = merchant.toLowerCase();
    
    // Check exact match in map
    if (serviceNameMap[normalizedMerchant] === serviceName.toLowerCase()) {
      return true;
    }
    
    // Check partial match (legacy support)
    if (normalizedMerchant.includes(serviceName.toLowerCase()) || 
        serviceName.toLowerCase().includes(normalizedMerchant)) {
      return true;
    }
  }
  
  return false;
}

// Mock data functions for each service - these are only returned when a service is connected
function getSpotifyData(userId: string) {
  return {
    recentTracks: [
      { 
        id: "track1", 
        name: "Blinding Lights",
        artist: "The Weeknd",
        album: "After Hours",
        playedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        duration: 201000, // in ms
        imageUrl: "https://i.scdn.co/image/ab67616d0000b273c5649add07ed3720be9d5526"
      },
      { 
        id: "track2", 
        name: "Levitating",
        artist: "Dua Lipa",
        album: "Future Nostalgia",
        playedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        duration: 203000,
        imageUrl: "https://i.scdn.co/image/ab67616d0000b273bd26ede1ae69327010d49946"
      },
      { 
        id: "track3", 
        name: "Save Your Tears",
        artist: "The Weeknd",
        album: "After Hours",
        playedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        duration: 215000,
        imageUrl: "https://i.scdn.co/image/ab67616d0000b273c5649add07ed3720be9d5526"
      }
    ],
    topArtists: [
      { name: "The Weeknd", genres: ["pop", "r&b"], imageUrl: "https://i.scdn.co/image/ab6761610000e5eb94fbdb362091888e6e98de38" },
      { name: "Dua Lipa", genres: ["pop", "dance pop"], imageUrl: "https://i.scdn.co/image/ab6761610000e5eb54e0857769c4a5c0f53d00be" },
      { name: "Taylor Swift", genres: ["pop", "pop country"], imageUrl: "https://i.scdn.co/image/ab6761610000e5eb5a00969a4698c3132a15fbb0" }
    ],
    topGenres: ["pop", "r&b", "dance pop", "indie pop", "rock"],
    recommendations: [
      { type: "track", name: "Take My Breath", artist: "The Weeknd" },
      { type: "artist", name: "Post Malone", similarity: "based on your listening to The Weeknd" },
      { type: "playlist", name: "Dance Pop Hits", description: "Based on your top genres" }
    ]
  };
}

function getNetflixData(userId: string) {
  return {
    recentWatched: [
      { 
        id: "show1", 
        title: "Stranger Things",
        type: "series",
        season: 4,
        episode: 9,
        watchedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        duration: 78, // in minutes
        genres: ["Sci-Fi", "Horror", "Drama"],
        imageUrl: "https://occ-0-1001-999.1.nflxso.net/dnm/api/v6/6gmvu2hxdfnQ55LZZjyzYR4kzGk/AAAABV5lteI3eHet1nPBQKC_uEChESjqQfYpRwMWLR0wULt52odnxQtG69JNFDj9N4maZWJWDFdYJ3PDjYEgU80DySSjw7dxQJ1JdWfVr6GQMlZ47jvZKzZEmxdw2tGpkrV3aCQI.jpg"
      },
      { 
        id: "show2", 
        title: "Wednesday",
        type: "series",
        season: 1,
        episode: 8,
        watchedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        duration: 48,
        genres: ["Comedy", "Fantasy", "Mystery"],
        imageUrl: "https://occ-0-1001-999.1.nflxso.net/dnm/api/v6/6gmvu2hxdfnQ55LZZjyzYR4kzGk/AAAABbFF0BUMOPP1CanRvIKFP9AhzKKFNHRJH5ulD4qgkwxEDlm4IY8TMu5GDShAKgFXhkh0SD9GJ8Kx-IRux5nfRNuRyzY9Q8su-En_QdRzdNKrZCKmqDzrqgFhiJOkcg8PrKZ2.jpg"
      },
      { 
        id: "movie1", 
        title: "Glass Onion: A Knives Out Mystery",
        type: "movie",
        watchedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        duration: 139,
        genres: ["Mystery", "Comedy", "Crime"],
        imageUrl: "https://occ-0-1001-999.1.nflxso.net/dnm/api/v6/6gmvu2hxdfnQ55LZZjyzYR4kzGk/AAAABSYeH5flKn-KQJiiEQvpUkZiO5FvK4FQ5mrrOHM7tIKF0-rYZHQ3cOZMvJqnUXJkuuzp5pQYYCT-FWg-9ToQKVVxaBtsYXhYP2yE.jpg"
      }
    ],
    topGenres: ["Sci-Fi", "Comedy", "Mystery", "Drama"],
    recommendations: [
      { title: "Black Mirror", type: "series", reason: "Because you watched Stranger Things" },
      { title: "Murder Mystery", type: "movie", reason: "Because you watched Glass Onion" },
      { title: "The Queen's Gambit", type: "series", reason: "Top pick for you" }
    ],
    upcomingReleases: [
      { title: "Stranger Things 5", releaseDate: "2025-07-01", type: "series" },
      { title: "Squid Game 2", releaseDate: "2025-10-15", type: "series" }
    ]
  };
}

function getDoorDashData(userId: string) {
  return {
    recentOrders: [
      {
        id: "order1",
        restaurant: "Chipotle",
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        items: ["Burrito Bowl", "Chips & Guacamole"],
        total: 18.95,
        rating: 5
      },
      {
        id: "order2",
        restaurant: "Sweetgreen",
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        items: ["Harvest Bowl", "Sparkling Water"],
        total: 15.50,
        rating: 4
      },
      {
        id: "order3",
        restaurant: "Shake Shack",
        date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        items: ["ShackBurger", "Fries", "Chocolate Shake"],
        total: 21.75,
        rating: 5
      }
    ],
    favoriteRestaurants: ["Chipotle", "Sweetgreen", "Shake Shack", "The Cheesecake Factory"],
    favoriteItems: ["Burrito Bowl", "Harvest Bowl", "ShackBurger"],
    foodPreferences: ["Mexican", "Healthy", "Burgers", "Italian"],
    recommendations: [
      { restaurant: "Cava", reason: "Similar to Sweetgreen" },
      { restaurant: "Five Guys", reason: "Because you like Shake Shack" },
      { restaurant: "Qdoba", reason: "Because you like Chipotle" }
    ],
    deals: [
      { restaurant: "Chipotle", deal: "Free delivery on orders $15+", expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString() },
      { restaurant: "Shake Shack", deal: "20% off your next order", expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() }
    ]
  };
}

function getUberData(userId: string) {
  return {
    recentRides: [
      {
        id: "ride1",
        from: "Home",
        to: "Work",
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        price: 14.50,
        distance: 5.2, // miles
        duration: 18 // minutes
      },
      {
        id: "ride2",
        from: "Work",
        to: "Restaurant",
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        price: 9.75,
        distance: 2.8,
        duration: 12
      },
      {
        id: "ride3",
        from: "Restaurant",
        to: "Home",
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        price: 12.25,
        distance: 4.5,
        duration: 15
      }
    ],
    frequentRoutes: [
      { from: "Home", to: "Work", count: 42 },
      { from: "Work", to: "Home", count: 38 },
      { from: "Home", to: "Gym", count: 15 }
    ],
    uberEatsOrders: [
      {
        id: "uberEats1",
        restaurant: "McDonald's",
        date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        items: ["Big Mac", "Fries", "Coke"],
        total: 12.50
      },
      {
        id: "uberEats2",
        restaurant: "Starbucks",
        date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        items: ["Venti Latte", "Blueberry Muffin"],
        total: 9.25
      }
    ],
    recommendations: [
      { type: "restaurant", name: "Burger King", reason: "Because you ordered from McDonald's" },
      { type: "ride", route: { from: "Home", to: "Mall" }, reason: "Popular destination near you" }
    ],
    deals: [
      { type: "ride", deal: "15% off your next ride", expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() },
      { type: "eats", deal: "Free delivery on orders $20+", expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString() }
    ]
  };
}

function getAmazonData(userId: string) {
  return {
    recentOrders: [
      {
        id: "amazon1",
        date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        items: [
          { name: "Echo Dot (5th Gen)", price: 49.99, category: "Electronics" },
          { name: "Kindle Paperwhite", price: 139.99, category: "Electronics" }
        ],
        total: 189.98
      },
      {
        id: "amazon2",
        date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        items: [
          { name: "Atomic Habits", price: 11.98, category: "Books" },
          { name: "The Psychology of Money", price: 14.99, category: "Books" }
        ],
        total: 26.97
      },
      {
        id: "amazon3",
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        items: [
          { name: "Wireless Earbuds", price: 79.99, category: "Electronics" },
          { name: "Phone Charger", price: 19.99, category: "Electronics" }
        ],
        total: 99.98
      }
    ],
    wishlist: [
      { name: "iPad Pro", price: 999.99, category: "Electronics" },
      { name: "Air Fryer", price: 119.99, category: "Home & Kitchen" },
      { name: "Running Shoes", price: 89.99, category: "Clothing" }
    ],
    topCategories: ["Electronics", "Books", "Home & Kitchen"],
    recommendations: [
      { name: "Smart Watch", price: 249.99, reason: "Based on your electronics purchases" },
      { name: "Book: Think Again", price: 16.99, reason: "Because you bought other personal development books" },
      { name: "Bluetooth Speaker", price: 59.99, reason: "Customers who bought Echo Dot also bought this" }
    ],
    deals: [
      { item: "Echo Show", deal: "20% off", price: 69.99, originalPrice: 89.99, expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString() },
      { item: "Kindle Unlimited", deal: "2 months free", expiresAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString() }
    ]
  };
} 