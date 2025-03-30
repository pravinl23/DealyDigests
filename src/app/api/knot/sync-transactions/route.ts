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

    // Get transactions using the user ID instead of connection access token
    const transactionsResponse = await knotClient.getTransactions(userId, {
      limit: 30,
      offset: 0
    })

    if (!transactionsResponse.success) {
      return NextResponse.json({ error: transactionsResponse.error }, { status: 500 })
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

    return NextResponse.json({
      success: true,
      transactionsCount: transactions.length,
    })
  } catch (error) {
    console.error("Error syncing transactions:", error)
    return NextResponse.json({ error: "Failed to sync transactions" }, { status: 500 })
  }
}

