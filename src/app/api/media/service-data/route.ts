import { NextResponse } from "next/server";
import { getUser } from "@/lib/utils";
import { knotClient } from "@/lib/knot";

export async function GET(request: Request) {
  try {
    // Get the authenticated user
    const user = await getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Use the user's sub/id as userId
    const userId = user.sub || user.id;
    
    // First, get the list of connected companies
    const connectedCompaniesResponse = await knotClient.getConnectedCompanies(userId);
    const connectedMerchants = connectedCompaniesResponse.connected_companies.map(
      company => company.merchant.toLowerCase()
    );
    
    // For demo purposes, we're providing mock data ONLY for connected services
    const url = new URL(request.url);
    const service = url.searchParams.get("service");
    
    let serviceData = {};
    
    // Helper function to check if service is connected
    const isServiceConnected = (serviceName: string) => {
      return connectedMerchants.some(merchant => 
        merchant.toLowerCase().includes(serviceName.toLowerCase())
      );
    };
    
    // Only return data for connected services
    if (service) {
      // Requesting a specific service
      switch(service.toLowerCase()) {
        case "spotify":
          serviceData = isServiceConnected("spotify") 
            ? getSpotifyData(userId) 
            : { error: "Spotify not connected", message: "Please connect your Spotify account" };
          break;
        case "netflix":
          serviceData = isServiceConnected("netflix") 
            ? getNetflixData(userId) 
            : { error: "Netflix not connected", message: "Please connect your Netflix account" };
          break;
        case "doordash":
          serviceData = isServiceConnected("doordash") 
            ? getDoorDashData(userId) 
            : { error: "DoorDash not connected", message: "Please connect your DoorDash account" };
          break;
        case "uber":
          serviceData = isServiceConnected("uber") 
            ? getUberData(userId) 
            : { error: "Uber not connected", message: "Please connect your Uber account" };
          break;
        case "amazon":
          serviceData = isServiceConnected("amazon") 
            ? getAmazonData(userId) 
            : { error: "Amazon not connected", message: "Please connect your Amazon account" };
          break;
        default:
          serviceData = { error: "Unknown service", message: "The requested service is not supported" };
      }
    } else {
      // Return data for all services (connected or not)
      serviceData = {
        spotify: isServiceConnected("spotify") 
          ? getSpotifyData(userId) 
          : { error: "Spotify not connected", message: "Please connect your Spotify account" },
        
        netflix: isServiceConnected("netflix") 
          ? getNetflixData(userId) 
          : { error: "Netflix not connected", message: "Please connect your Netflix account" },
        
        doordash: isServiceConnected("doordash") 
          ? getDoorDashData(userId) 
          : { error: "DoorDash not connected", message: "Please connect your DoorDash account" },
        
        uber: isServiceConnected("uber") 
          ? getUberData(userId) 
          : { error: "Uber not connected", message: "Please connect your Uber account" },
        
        amazon: isServiceConnected("amazon") 
          ? getAmazonData(userId) 
          : { error: "Amazon not connected", message: "Please connect your Amazon account" }
      };
    }
    
    return NextResponse.json({
      success: true,
      service: service || "all",
      data: serviceData,
      connected_merchants: connectedMerchants
    });
  } catch (error) {
    console.error("Error fetching service data:", error);
    return NextResponse.json(
      { error: "Failed to fetch service data" },
      { status: 500 }
    );
  }
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