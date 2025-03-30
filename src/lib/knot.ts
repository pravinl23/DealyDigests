export class KnotClient {
  private apiKey: string;
  private debug: boolean = true;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    if (this.debug) {
      console.log(
        "KnotClient initialized with API key:",
        apiKey ? `${apiKey.substring(0, 4)}...` : "missing"
      );
    }
  }

  // Create a session for the frontend to initialize Knot Link
  async createSession(userId: string, productType = "employment") {
    try {
      if (this.debug) {
        console.log(`Creating Knot session for user ${userId} with product type ${productType}`);
      }
      
      // In a real implementation, this would make an API request to Knot to create a session
      // For this demo, we'll simulate creating a session with a unique session token
      
      // Generate a unique session ID for this user
      const sessionId = `session-${userId.substring(0, 8)}-${Date.now()}`;
      
      return {
        success: true,
        user_id: userId,
        session_id: sessionId,
        product_type: productType,
        session_token: `knot-session-token-${userId.substring(0, 8)}-${Math.random().toString(36).substring(2, 15)}`,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
        created_at: new Date().toISOString()
      };
    } catch (error) {
      console.error("Error creating Knot session:", error);
      return {
        success: false,
        error: "Failed to create session",
        user_id: userId
      };
    }
  }

  // Create a link token for connecting accounts
  async createLinkToken(userId: string) {
    try {
      if (this.debug) {
        console.log(`Creating link token for user ${userId}`);
      }
      
      // In a real implementation, this would make an API request to Knot to create a link token
      // For this demo, we'll simulate creating a link token
      
      return {
        success: true,
        user_id: userId,
        link_token: `knot-link-token-${userId.substring(0, 8)}-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes from now
        created_at: new Date().toISOString()
      };
    } catch (error) {
      console.error("Error creating link token:", error);
      return {
        success: false,
        error: "Failed to create link token",
        user_id: userId
      };
    }
  }

  // Exchange a public token for an access token
  async exchangePublicToken(userId: string, publicToken: string) {
    try {
      if (this.debug) {
        console.log(`Exchanging public token for user ${userId}: ${publicToken}`);
      }
      
      // In a real implementation, this would exchange the public token via Knot API
      // For this demo, we'll simulate exchanging tokens
      
      // Validate the token format (simple validation for demo)
      if (!publicToken.startsWith('knot-public-') || publicToken.length < 20) {
        return {
          success: false,
          error: "Invalid public token format",
          user_id: userId
        };
      }
      
      return {
        success: true,
        user_id: userId,
        access_token: `knot-access-token-${userId.substring(0, 8)}-${Date.now()}`,
        item_id: `item-${Math.random().toString(36).substring(2, 10)}`,
        created_at: new Date().toISOString()
      };
    } catch (error) {
      console.error("Error exchanging public token:", error);
      return {
        success: false,
        error: "Failed to exchange public token",
        user_id: userId
      };
    }
  }

  // Get transactions for a user from Knot
  async getTransactions(userId: string, options = { limit: 10, offset: 0 }) {
    try {
      if (this.debug) {
        console.log(`Getting transactions for user ${userId} with options:`, options);
      }
      
      const { limit, offset } = options;
      
      // In a real implementation, this would fetch transactions from Knot API
      // For this demo, we'll generate user-specific transactions
      
      // Generate deterministic transactions based on user ID
      const seed = this.hashUserId(userId);
      const transactions = [];
      
      // Generate a deterministic number of transactions (3-12) for this user
      const transactionCount = (seed % 10) + 3;
      
      for (let i = 0; i < transactionCount && i < limit; i++) {
        const amount = ((seed + i) % 500) + 5; // $5-$505
        const date = new Date();
        date.setDate(date.getDate() - (i * 2)); // Every 2 days back
        
        transactions.push({
          id: `tx-${userId.substring(0, 6)}-${i}-${seed % 1000}`,
          amount: amount.toFixed(2),
          description: this.getTransactionDescription(seed + i),
          date: date.toISOString(),
          merchant: this.getTransactionMerchant(seed + i),
          category: this.getTransactionCategory(seed + i),
          status: "completed"
        });
      }
      
      return {
        success: true,
        user_id: userId,
        transactions: transactions,
        total_count: transactionCount,
        limit,
        offset
      };
    } catch (error) {
      console.error("Error getting transactions:", error);
      return {
        success: false,
        error: "Failed to get transactions",
        user_id: userId,
        transactions: []
      };
    }
  }

  // Get accounts for a user from Knot
  async getAccounts(userId: string) {
    try {
      if (this.debug) {
        console.log(`Getting accounts for user ${userId}`);
      }
      
      // In a real implementation, this would fetch accounts from Knot API
      // For this demo, we'll generate user-specific accounts
      
      // Generate deterministic accounts based on user ID
      const seed = this.hashUserId(userId);
      const accounts = [];
      
      // Determine how many accounts this user has (1-3)
      const accountCount = (seed % 3) + 1;
      
      const accountTypes = [
        { type: "checking", name: "Checking" },
        { type: "savings", name: "Savings" },
        { type: "credit", name: "Credit Card" }
      ];
      
      for (let i = 0; i < accountCount; i++) {
        const balance = ((seed + i * 33) % 10000) + 250; // $250-$10,250
        const accountType = accountTypes[i % accountTypes.length];
        
        accounts.push({
          id: `acc-${userId.substring(0, 6)}-${accountType.type}-${seed % 1000}`,
          name: `${accountType.name} Account`,
          type: accountType.type,
          balance: balance.toFixed(2),
          currency: "USD",
          mask: `${((seed + i) % 9000) + 1000}`, // Last 4 digits
          institution: this.getInstitutionName(seed + i),
          status: "active"
        });
      }
      
      return {
        success: true,
        user_id: userId,
        accounts: accounts,
        total_count: accountCount
      };
    } catch (error) {
      console.error("Error getting accounts:", error);
      return {
        success: false,
        error: "Failed to get accounts",
        user_id: userId,
        accounts: []
      };
    }
  }

  // Helper methods for generating consistent data
  private getTransactionDescription(seed: number) {
    const descriptions = [
      "Monthly Subscription",
      "Grocery Purchase",
      "Dining Out",
      "Streaming Service",
      "Online Shopping",
      "Gas Station",
      "Utility Bill",
      "Coffee Shop",
      "Transportation",
      "Entertainment"
    ];
    return descriptions[seed % descriptions.length];
  }

  private getTransactionMerchant(seed: number) {
    const merchants = [
      "Amazon",
      "Walmart",
      "Netflix",
      "Uber",
      "Starbucks",
      "Target",
      "Shell",
      "Spotify",
      "Whole Foods",
      "Apple"
    ];
    return merchants[seed % merchants.length];
  }

  private getTransactionCategory(seed: number) {
    const categories = [
      "Shopping",
      "Groceries",
      "Entertainment",
      "Transportation",
      "Food & Drink",
      "Utilities",
      "Subscription",
      "Travel",
      "Services",
      "Other"
    ];
    return categories[seed % categories.length];
  }

  private getInstitutionName(seed: number) {
    const institutions = [
      "Bank of America",
      "Chase",
      "Wells Fargo",
      "Citibank",
      "Capital One",
      "US Bank",
      "TD Bank",
      "PNC Bank",
      "Ally Bank",
      "Discover"
    ];
    return institutions[seed % institutions.length];
  }

  // New method to mark a company as connected through Knot
  async connectCompany(userId: string, merchantName: string, merchantId: number) {
    try {
      if (this.debug) {
        console.log(`Connecting company for user ${userId}: ${merchantName} (ID: ${merchantId})`);
      }

      // In a real implementation, this would connect to Knot API to establish a connection
      // Here we're simulating adding a connection to a user's profile
      
      // Generate a connection ID based on the merchant and user
      const connectionId = `knot-connection-${merchantName.toLowerCase().replace(/\s+/g, "-")}-${userId.substring(0, 8)}-${Date.now()}`;
      
      // In a real app, save this connection to a database associated with the user
      // For this demo, we'll just return a successful response
      
      return {
        success: true,
        user_id: userId,
        merchant: merchantName,
        merchant_id: merchantId,
        connection_id: connectionId,
        connected_at: new Date().toISOString(),
        message: `Successfully connected ${merchantName} to user account ${userId}`
      };
    } catch (error) {
      console.error("Error connecting company:", error);
      return {
        success: false,
        error: "Failed to connect company",
        user_id: userId,
        merchant: merchantName
      };
    }
  }

  // Get connected companies for user
  async getConnectedCompanies(userId: string) {
    try {
      if (this.debug) {
        console.log("Getting connected companies for user:", userId);
      }

      // In a real implementation, this would fetch from Knot API based on the userId
      // Here we're simulating a database of user connections by using localStorage or a similar mechanism
      
      // For demo purposes, we'll simulate different connections per user by using the userId
      // In a real implementation, you would fetch this data from your database or the Knot API
      
      // Generate a deterministic but unique set of connections based on userId
      // This ensures each user has their own connections that persist between sessions
      const userIdHash = this.hashUserId(userId);
      
      // Empty array for new users - they need to connect their accounts
      if (!userIdHash || userIdHash === 'new-user') {
        return {
          success: true,
          connected_companies: []
        };
      }
      
      // For returning users, provide personalized connections based on their userId
      const connections = this.getUserConnections(userId);
      
      return {
        success: true,
        connected_companies: connections
      };
    } catch (error) {
      console.error("Error fetching connected companies:", error);
      return {
        success: false,
        error: "Failed to fetch connected companies",
        connected_companies: []
      };
    }
  }

  // Helper method to generate a pseudo-hash of userId for demo purposes
  private hashUserId(userId: string): string {
    if (!userId) return 'new-user';
    
    // Simple hash function for demo - in real app use a proper hash or database
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    // If this is a first-time user (determined by hash range for demo)
    // return 'new-user' so they start with no connections
    if (hash % 10 === 0) {
      return 'new-user';
    }
    
    return hash.toString();
  }

  // Helper method to get user connections based on userId
  public getUserConnections(userId: string) {
    if (!userId) return [];
    
    // Generate a number from the userId for demo purposes
    const userNum = this.hashUserId(userId);
    
    // Store of possible merchant connections
    const allMerchants = [
      { name: "DoorDash", id: 19 },
      { name: "Walmart", id: 45 },
      { name: "Netflix", id: 16 },
      { name: "Spotify", id: 13 },
      { name: "Amazon", id: 44 },
      { name: "Uber", id: 10 },
      { name: "Instacart", id: 40 },
      { name: "Target", id: 12 },
      { name: "American Airlines", id: 78 },
      { name: "Airbnb", id: 84 },
      { name: "Uber Eats", id: 36 }
    ];
    
    // If this is a new user, they have no connections unless they've been forced
    if (userNum === 'new-user') {
      // Check for any forced connections in cache
      const forcedConnections = this.getForcedConnectionsFromCache(userId);
      return forcedConnections;
    }
    
    // For existing users, generate a subset of connections based on their userId
    // This simulates different users having different connected services
    const userConnections = [];
    
    // Add the mock connections based on user ID
    const numConnections = parseInt(userNum) % 5; // 0-4 connections
    
    for (let i = 0; i < numConnections; i++) {
      const merchantIndex = (parseInt(userNum) + i) % allMerchants.length;
      const merchant = allMerchants[merchantIndex];
      
      userConnections.push({
        merchant: merchant.name,
        merchant_id: merchant.id,
        connection_id: `knot-connection-${merchant.name.toLowerCase().replace(/\s+/g, "-")}-${userId.substring(0, 8)}`,
        connected_at: new Date(Date.now() - i * 86400000).toISOString(), // Different connection dates
      });
    }
    
    // Add any forced connections from our cache
    const forcedConnections = this.getForcedConnectionsFromCache(userId);
    
    // Merge the connections, avoiding duplicates
    const mergedConnections = [...userConnections];
    
    for (const forcedConn of forcedConnections) {
      // Only add if this merchant isn't already connected
      if (!mergedConnections.some(conn => conn.merchant.toLowerCase() === forcedConn.merchant.toLowerCase())) {
        mergedConnections.push(forcedConn);
      }
    }
    
    return mergedConnections;
  }

  // Get forced connections from browser localStorage (or memory on server)
  private getForcedConnectionsFromCache(userId: string): any[] {
    if (this.debug) {
      console.log(`Getting forced connections for user ${userId}`);
    }
    
    // When running on server, we can't use localStorage
    if (typeof window === 'undefined') {
      // Just return empty array on server
      return [];
    }
    
    try {
      // Attempt to get cached forced connections from localStorage
      const cacheKey = `knot-forced-connections-${userId}`;
      const cachedData = localStorage.getItem(cacheKey);
      
      if (cachedData) {
        return JSON.parse(cachedData);
      }
    } catch (error) {
      console.error("Error getting forced connections from cache:", error);
    }
    
    return [];
  }

  // Method to get Spotify data for a user
  async getSpotifyData(userId: string): Promise<any> {
    console.log(`Getting Spotify data for user ${userId}`);
    try {
      // In a real implementation, we would fetch this data from Spotify API
      // For now, we'll return mock data
      return {
        recentTracks: [
          { 
            id: "track-recent-1", 
            name: "Blinding Lights", 
            artist: "The Weeknd", 
            album: "After Hours", 
            playedAt: "2023-06-18" 
          },
          { 
            id: "track-recent-2", 
            name: "As It Was", 
            artist: "Harry Styles", 
            album: "Harry's House", 
            playedAt: "2023-06-17" 
          },
          { 
            id: "track-recent-3", 
            name: "Bad Habit", 
            artist: "Steve Lacy", 
            album: "Gemini Rights", 
            playedAt: "2023-06-16" 
          }
        ],
        topGenres: ["Pop", "R&B", "Hip-Hop", "Rock", "Indie"],
        topArtists: [
          "The Weeknd", 
          "Taylor Swift", 
          "Harry Styles", 
          "Drake", 
          "Billie Eilish"
        ],
        recommendations: [
          { 
            id: "rec-spotify-1", 
            name: "Heat Waves", 
            artist: "Glass Animals", 
            album: "Dreamland" 
          },
          { 
            id: "rec-spotify-2", 
            name: "Shivers", 
            artist: "Ed Sheeran", 
            album: "=" 
          },
          { 
            id: "rec-spotify-3", 
            name: "Easy On Me", 
            artist: "Adele", 
            album: "30" 
          }
        ]
      };
    } catch (error) {
      console.error("Error fetching Spotify data:", error);
      throw error;
    }
  }

  // Method to get Netflix data for a user
  async getNetflixData(userId: string): Promise<any> {
    console.log(`Getting Netflix data for user ${userId}`);
    try {
      // In a real implementation, we would fetch this data from Netflix API
      // For now, we'll return mock data
      return {
        recentlyWatched: [
          { 
            id: "show-netflix-1", 
            title: "Stranger Things", 
            type: "TV Series", 
            genre: "Sci-Fi & Fantasy", 
            watchedAt: "2023-06-18" 
          },
          { 
            id: "show-netflix-2", 
            title: "Wednesday", 
            type: "TV Series", 
            genre: "Comedy Horror", 
            watchedAt: "2023-06-15" 
          },
          { 
            id: "show-netflix-3", 
            title: "The Queen's Gambit", 
            type: "Limited Series", 
            genre: "Drama", 
            watchedAt: "2023-06-10" 
          }
        ],
        topGenres: ["Drama", "Sci-Fi & Fantasy", "Comedy", "Action & Adventure", "Crime"],
        recommendations: [
          { 
            id: "rec-netflix-1", 
            title: "Black Mirror", 
            type: "TV Series", 
            genre: "Sci-Fi & Fantasy" 
          },
          { 
            id: "rec-netflix-2", 
            title: "Ozark", 
            type: "TV Series", 
            genre: "Crime Drama" 
          },
          { 
            id: "rec-netflix-3", 
            title: "The Witcher", 
            type: "TV Series", 
            genre: "Fantasy" 
          }
        ],
        upcomingReleases: [
          { 
            id: "upcoming-netflix-1", 
            title: "Squid Game Season 2", 
            releaseDate: "2023-12-01", 
            type: "TV Series" 
          },
          { 
            id: "upcoming-netflix-2", 
            title: "Stranger Things Season 5", 
            releaseDate: "2024-03-15", 
            type: "TV Series" 
          }
        ]
      };
    } catch (error) {
      console.error("Error fetching Netflix data:", error);
      throw error;
    }
  }

  // Force a connection to be available for a user (for testing/demo purposes)
  async forceConnectionForUser(userId: string, merchantName: string, merchantId: number) {
    try {
      if (this.debug) {
        console.log(`Forcing connection for user ${userId}: ${merchantName} (ID: ${merchantId})`);
      }
      
      // This method is specifically for the mock implementation
      // It ensures that when a user connects a service, it's immediately available in their list
      
      // Normally this data would be stored in a database
      // For our demo, we'll use localStorage to persist between page refreshes
      
      // Create new connection object
      const newConnection = {
        merchant: merchantName,
        merchant_id: merchantId,
        connection_id: `knot-connection-${merchantName.toLowerCase().replace(/\s+/g, "-")}-${userId.substring(0, 8)}-forced`,
        connected_at: new Date().toISOString()
      };
      
      // Store in localStorage if available (client-side only)
      if (typeof window !== 'undefined') {
        try {
          const cacheKey = `knot-forced-connections-${userId}`;
          let connections = [];
          
          try {
            const existingCache = localStorage.getItem(cacheKey);
            if (existingCache) {
              connections = JSON.parse(existingCache);
            }
          } catch (e) {
            console.error("Error parsing cached connections:", e);
            // Continue with empty connections array
          }
          
          // Add new connection if not already in the cache
          const existingConnection = connections.findIndex(conn => 
            conn.merchant.toLowerCase() === merchantName.toLowerCase()
          );
          
          if (existingConnection >= 0) {
            // Update existing connection
            connections[existingConnection] = newConnection;
          } else {
            // Add new connection
            connections.push(newConnection);
          }
          
          // Save to localStorage
          localStorage.setItem(cacheKey, JSON.stringify(connections));
          console.log(`Saved connection to localStorage: ${merchantName}`);
        } catch (error) {
          console.error("Error storing connection in cache:", error);
        }
      } else {
        console.log("Can't store connection - not in browser environment");
      }
      
      console.log(`Added forced connection for user ${userId}: ${merchantName}`);
      
      return {
        success: true,
        user_id: userId,
        merchant: merchantName,
        merchant_id: merchantId,
        connection_id: newConnection.connection_id,
        connected_at: newConnection.connected_at
      };
    } catch (error) {
      console.error("Error forcing connection:", error);
      return {
        success: false,
        error: "Failed to force connection",
        user_id: userId,
        merchant: merchantName
      };
    }
  }
}

// Export both the class and a singleton instance
export const knotClient = new KnotClient(process.env.KNOT_API_SECRET || "");
export default knotClient;
