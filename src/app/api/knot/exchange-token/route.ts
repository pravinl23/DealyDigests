import { NextResponse } from "next/server"
import { z } from "zod"
import knotClient from "@/lib/knot"
import { mockDb } from "@/lib/mock-data"

const exchangeSchema = z.object({
  publicToken: z.string(),
  institution: z
    .object({
      name: z.string().optional(),
    })
    .optional(),
  accounts: z
    .array(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        type: z.string().optional(),
        subtype: z.string().optional(),
        mask: z.string().optional(),
      }),
    )
    .optional(),
})

export async function POST(req: Request) {
  try {
    // For the preview, we'll use a fixed user ID
    const userId = "1" // Demo user ID

    const body = await req.json()
    const { publicToken, institution, accounts } = exchangeSchema.parse(body)

    // Exchange public token for access token using user-specific method
    const exchangeResponse = await knotClient.exchangePublicToken(userId, publicToken)
    
    if (!exchangeResponse.success) {
      return NextResponse.json({ error: exchangeResponse.error }, { status: 400 })
    }
    
    const { access_token: accessToken } = exchangeResponse

    // Get account details if not provided
    let accountDetails = accounts
    if (!accountDetails) {
      const accountsResponse = await knotClient.getAccounts(userId)
      if (accountsResponse.success) {
        accountDetails = accountsResponse.accounts
      } else {
        return NextResponse.json({ error: accountsResponse.error }, { status: 500 })
      }
    }

    // Store the connection in the database
    const bankConnection = mockDb.createBankConnection({
      userId,
      aggregatorAccessToken: accessToken,
      institutionName: institution?.name || "Demo Bank",
      cardType: accountDetails?.[0]?.type || "Visa",
      last4: accountDetails?.[0]?.mask || "1234",
    })

    // Fetch initial transactions using user-specific method
    await syncTransactions(bankConnection.id, userId)

    return NextResponse.json({ success: true, connectionId: bankConnection.id })
  } catch (error) {
    console.error("Error exchanging token:", error)
    return NextResponse.json({ error: "Failed to exchange token" }, { status: 500 })
  }
}

// Helper function to sync transactions - updated to use user-specific methods
async function syncTransactions(connectionId: string, userId: string) {
  try {
    // Get transactions for the last 90 days using user ID instead of access token
    const transactionsResponse = await knotClient.getTransactions(userId, { 
      limit: 90, 
      offset: 0 
    })
    
    if (!transactionsResponse.success) {
      console.error("Failed to get transactions:", transactionsResponse.error)
      return 0
    }

    // Store transactions in the database
    const transactions = transactionsResponse.transactions.map((transaction: any) => ({
      userId,
      bankConnectionId: connectionId,
      date: new Date(transaction.date),
      description: transaction.description || transaction.merchant,
      amount: parseFloat(transaction.amount),
      category: transaction.category || "Uncategorized",
      rawData: transaction,
    }))

    mockDb.createManyTransactions(transactions)

    return transactions.length
  } catch (error) {
    console.error("Error syncing transactions:", error)
    throw error
  }
}

