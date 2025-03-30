import { NextResponse } from "next/server"
import { z } from "zod"
import knotClient from "@/lib/knot"
import { mockDb } from "@/lib/mock-data"

const syncSchema = z.object({
  connectionId: z.string(),
})

export async function POST(req: Request) {
  try {
    // For the preview, we'll use a fixed user ID
    const userId = "1" // Demo user ID

    const body = await req.json()
    const { connectionId } = syncSchema.parse(body)

    // Verify the connection belongs to the user
    const connections = mockDb.findBankConnectionsByUserId(userId)
    const connection = connections.find((conn) => conn.id === connectionId)

    if (!connection) {
      return NextResponse.json({ error: "Connection not found" }, { status: 404 })
    }

    // Get transactions for the last 30 days
    const endDate = new Date().toISOString().split("T")[0]
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]

    const transactionsResponse = await knotClient.getTransactions(connection.aggregatorAccessToken, startDate, endDate)

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

    return NextResponse.json({
      success: true,
      transactionsCount: transactions.length,
    })
  } catch (error) {
    console.error("Error syncing transactions:", error)
    return NextResponse.json({ error: "Failed to sync transactions" }, { status: 500 })
  }
}

