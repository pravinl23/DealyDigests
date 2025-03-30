import { NextResponse } from "next/server"
import { mockDb } from "@/lib/mock-data"
import { z } from "zod"

const addTransactionSchema = z.object({
  merchant: z.string(),
  amount: z.number(),
  category: z.string(),
  description: z.string().optional(),
})

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const userId = url.searchParams.get("userId") || "1" // Default to demo user
    
    // Get transactions from the mock database
    const transactions = mockDb.findTransactionsByUserId(userId)
    
    // Format transactions for the client
    const formattedTransactions = transactions.map(transaction => ({
      id: transaction.id,
      merchant: transaction.merchant || transaction.description,
      amount: transaction.amount,
      date: transaction.date.toISOString(),
      category: transaction.category || "Other",
      description: transaction.description,
      createdAt: transaction.createdAt.toISOString(),
    }))
    
    // Group transactions by category for chart data
    const categorySums = {}
    transactions.forEach(transaction => {
      const category = transaction.category || "Other"
      categorySums[category] = (categorySums[category] || 0) + transaction.amount
    })
    
    const chartData = Object.entries(categorySums).map(([category, amount]) => ({
      category,
      amount: Number(amount),
      color: getCategoryColor(category),
    }))
    
    return NextResponse.json({
      success: true,
      transactions: formattedTransactions,
      chartData,
    })
  } catch (error) {
    console.error("Error fetching transactions:", error)
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const userId = "1" // Default to demo user
    
    const body = await request.json()
    const validatedData = addTransactionSchema.parse(body)
    
    // Add transaction to the mock database
    const newTransaction = mockDb.createTransaction({
      userId,
      bankConnectionId: "1", // Default connection
      date: new Date(),
      description: validatedData.description || validatedData.merchant,
      amount: validatedData.amount,
      category: validatedData.category,
      merchant: validatedData.merchant,
      rawData: validatedData,
    })
    
    return NextResponse.json({
      success: true,
      transaction: {
        id: newTransaction.id,
        merchant: newTransaction.merchant || newTransaction.description,
        amount: newTransaction.amount,
        date: newTransaction.date.toISOString(),
        category: newTransaction.category || "Other",
        description: newTransaction.description,
        createdAt: newTransaction.createdAt.toISOString(),
      }
    })
  } catch (error) {
    console.error("Error adding transaction:", error)
    return NextResponse.json(
      { error: "Failed to add transaction" },
      { status: 500 }
    )
  }
}

// Helper function to get color for category
function getCategoryColor(category: string): string {
  switch (category.toLowerCase()) {
    case "travel":
      return "bg-blue-500"
    case "dining":
    case "food and dining":
      return "bg-amber-500"
    case "shopping":
      return "bg-purple-500"
    case "groceries":
      return "bg-green-500"
    case "entertainment":
      return "bg-pink-500"
    case "transportation":
      return "bg-cyan-500"
    default:
      return "bg-gray-500"
  }
} 