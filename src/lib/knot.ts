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
  async createSession(
    userId: string,
    product: "card_switcher" | "transaction_link" = "card_switcher"
  ) {
    try {
      const apiKey = this.apiKey;

      if (this.debug) {
        console.log(
          "Creating session with API key:",
          apiKey ? `${apiKey.substring(0, 4)}...` : "missing"
        );
        console.log("User ID:", userId);
        console.log("Product:", product);
      }

      if (!apiKey) {
        throw new Error("API key is required to create a Knot session");
      }

      // Use the correct Knot API endpoint according to docs
      const apiUrl = "https://development.knotapi.com/session/create";

      if (this.debug) {
        console.log("Making API call to:", apiUrl);
      }

      // Prepare request payload based on product type
      const payload: any = {
        type: product,
        external_user_id: userId,
        // Default values
        email: "user@example.com",
        phone_number: "+11234567890",
      };

      // Add card_id if product is card_switcher
      if (product === "card_switcher") {
        payload.card_id = `card-${Date.now()}`;
      }

      if (this.debug) {
        console.log("Request payload:", JSON.stringify(payload));
      }

      // Try server-side request with fetch
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          Accept: "application/json",
          "Knot-Version": "2.0",
        },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();

      if (this.debug) {
        console.log("Response status:", response.status);
        console.log(
          "Response headers:",
          JSON.stringify(Object.fromEntries([...response.headers.entries()]))
        );
        console.log("Response body:", responseText);
      }

      if (!response.ok) {
        console.error(
          "Knot session creation failed:",
          response.status,
          responseText
        );
        throw new Error(
          `Failed to create Knot session: ${response.status} ${response.statusText}`
        );
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error("Failed to parse response as JSON:", e);
        throw new Error("Invalid JSON response from Knot API");
      }

      if (!data.session_id) {
        console.error("No session_id in response:", data);
        throw new Error("Invalid response: No session_id returned");
      }

      console.log("Knot session created successfully:", data);
      return data;
    } catch (error) {
      console.error("Error creating Knot session:", error);

      // For development/testing, don't return mock data anymore
      throw error;
    }
  }

  // Create a link token for the frontend to initialize Knot Link
  async createLinkToken(userId: string) {
    // Mock response
    return {
      link_token: "mock-link-token-" + Date.now(),
      expiration: new Date(Date.now() + 3600000).toISOString(),
    };
  }

  // Exchange a public token for an access token
  async exchangePublicToken(publicToken: string) {
    // Mock response
    return {
      access_token: "mock-access-token-" + Date.now(),
      item_id: "mock-item-id",
    };
  }

  // Get transactions for a user
  async getTransactions(
    accessToken: string,
    startDate: string,
    endDate: string
  ) {
    // Mock response
    return {
      transactions: [
        {
          transaction_id: "tx1",
          account_id: "acc1",
          date: new Date().toISOString().split("T")[0],
          name: "Starbucks",
          amount: 4.75,
          category: ["Food and Drink", "Coffee Shop"],
        },
        {
          transaction_id: "tx2",
          account_id: "acc1",
          date: new Date(Date.now() - 86400000).toISOString().split("T")[0],
          name: "Amazon",
          amount: 25.99,
          category: ["Shopping", "Online"],
        },
        {
          transaction_id: "tx3",
          account_id: "acc1",
          date: new Date(Date.now() - 172800000).toISOString().split("T")[0],
          name: "Uber",
          amount: 12.5,
          category: ["Transportation", "Ride Share"],
        },
      ],
    };
  }

  // Get account information
  async getAccounts(accessToken: string) {
    // Mock response
    return {
      accounts: [
        {
          account_id: "acc1",
          name: "Chase Freedom Unlimited",
          type: "credit",
          subtype: "credit card",
          mask: "1234",
        },
      ],
    };
  }

  // New method to mark a company as connected through Knot
  async connectCompany(userId: string, merchantName: string) {
    // In a real implementation, this would connect to Knot API to establish a connection
    // Here we're just returning a mock success response
    return {
      success: true,
      user_id: userId,
      merchant: merchantName,
      connection_id: `knot-connection-${merchantName
        .toLowerCase()
        .replace(/\s+/g, "-")}-${Date.now()}`,
      connected_at: new Date().toISOString(),
    };
  }

  // Get connected companies for user
  async getConnectedCompanies(userId: string) {
    // In a real implementation, this would fetch from Knot API
    // For now, return hardcoded data based on our mock userDeals
    return {
      success: true,
      connected_companies: [
        {
          merchant: "DoorDash",
          connection_id: `knot-connection-doordash-${Date.now()}`,
          connected_at: new Date("2025-03-10").toISOString(),
        },
        {
          merchant: "Walmart",
          connection_id: `knot-connection-walmart-${Date.now()}`,
          connected_at: new Date("2025-03-15").toISOString(),
        },
        {
          merchant: "Netflix",
          connection_id: `knot-connection-netflix-${Date.now()}`,
          connected_at: new Date("2025-03-16").toISOString(),
        },
        {
          merchant: "Spotify",
          connection_id: `knot-connection-spotify-${Date.now()}`,
          connected_at: new Date("2025-03-17").toISOString(),
        },
      ],
    };
  }
}

// Export both the class and a singleton instance
export const knotClient = new KnotClient(process.env.KNOT_API_SECRET || "");
export default knotClient;
