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

    // Exchange public token for access token
    const exchangeResponse = await knotClient.exchangePublicToken(publicToken)
    const { access_token: accessToken } = exchangeResponse

    // Get account details if not provided
    let accountDetails = accounts
    if (!accountDetails) {
      const accountsResponse = await knotClient.getAccounts(accessToken)
      accountDetails = accountsResponse.accounts
    }

    // Store the connection in the database
    const bankConnection = mockDb.createBankConnection({
      userId,
      aggregatorAccessToken: accessToken,
      institutionName: institution?.name || "Demo Bank",
      cardType: accountDetails?.[0]?.subtype || "Visa",
      last4: accountDetails?.[0]?.mask || "1234",
    })

    // Fetch initial transactions
    await syncTransactions(bankConnection.id, accessToken, userId)

    return NextResponse.json({ success: true, connectionId: bankConnection.id })
  } catch (error) {
    console.error("Error exchanging token:", error)
    return NextResponse.json({ error: "Failed to exchange token" }, { status: 500 })
  }
}

// Helper function to sync transactions
async function syncTransactions(connectionId: string, accessToken: string, userId: string) {
  try {
    // Get transactions for the last 90 days
    const endDate = new Date().toISOString().split("T")[0]
    const startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]

    const transactionsResponse = await knotClient.getTransactions(accessToken, startDate, endDate)

    // Store transactions in the database
    const transactions = transactionsResponse.transactions.map((transaction: any) => ({
      userId,
      bankConnectionId: connectionId,
      date: new Date(transaction.date),
      description: transaction.name,
      amount: transaction.amount,
      category: transaction.category?.[0] || "Uncategorized",
      rawData: transaction,
    }))

    mockDb.createManyTransactions(transactions)

    return transactions.length
  } catch (error) {
    console.error("Error syncing transactions:", error)
    throw error
  }
}

