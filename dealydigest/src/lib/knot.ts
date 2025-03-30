export class KnotClient {
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  // Create a link token for the frontend to initialize Knot Link
  async createLinkToken(userId: string) {
    // Mock response
    return {
      link_token: "mock-link-token-" + Date.now(),
      expiration: new Date(Date.now() + 3600000).toISOString(),
    }
  }

  // Exchange a public token for an access token
  async exchangePublicToken(publicToken: string) {
    // Mock response
    return {
      access_token: "mock-access-token-" + Date.now(),
      item_id: "mock-item-id",
    }
  }

  // Get transactions for a user
  async getTransactions(accessToken: string, startDate: string, endDate: string) {
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
    }
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
    }
  }
}

// Create a singleton instance
const knotClient = new KnotClient(process.env.KNOT_API_KEY || "mock-api-key")
export default knotClient

