import { NextResponse } from "next/server"
import { mockDb } from "@/lib/mock-data"
import { z } from "zod"
import { getUser } from "@/lib/utils"
import { knotClient } from "@/lib/knot"

const addTransactionSchema = z.object({
  merchant: z.string(),
  amount: z.number(),
  category: z.string(),
  description: z.string().optional(),
})

// Sample data for chart visualization
const sampleChartData = [
  { category: "Dining", amount: 450, color: "#FF6384" },
  { category: "Shopping", amount: 300, color: "#36A2EB" },
  { category: "Travel", amount: 250, color: "#FFCE56" },
  { category: "Entertainment", amount: 200, color: "#4BC0C0" },
  { category: "Utilities", amount: 180, color: "#9966FF" },
  { category: "Other", amount: 120, color: "#FF9F40" },
];

// Sample transaction data
const sampleTransactions = [
  {
    id: "txn1",
    merchant: "Netflix",
    amount: 15.99,
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    category: "Entertainment",
    description: "Monthly subscription",
    cardName: "Chase Sapphire Reserve",
    cardIssuer: "Chase",
    cardLast4: "4567",
  },
  {
    id: "txn2",
    merchant: "Starbucks",
    amount: 7.35,
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    category: "Dining",
    description: "Coffee and breakfast",
    cardName: "Freedom Unlimited",
    cardIssuer: "Chase",
    cardLast4: "8901",
  },
  {
    id: "txn3",
    merchant: "Amazon",
    amount: 49.99,
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    category: "Shopping",
    description: "Books and electronics",
    cardName: "Chase Sapphire Reserve",
    cardIssuer: "Chase",
    cardLast4: "4567",
  },
  {
    id: "txn4",
    merchant: "Uber",
    amount: 24.50,
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    category: "Travel",
    description: "Ride to airport",
    cardName: "Freedom Unlimited",
    cardIssuer: "Chase",
    cardLast4: "8901",
  },
  {
    id: "txn5",
    merchant: "DoorDash",
    amount: 35.20,
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    category: "Dining",
    description: "Dinner delivery",
    cardName: "Chase Sapphire Reserve",
    cardIssuer: "Chase",
    cardLast4: "4567",
  },
];

export async function GET() {
  try {
    // Get the authenticated user
    const user = await getUser()
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Use the user's sub/id as userId
    const userId = user.sub || user.id
    
    // Check if the user has connected any accounts
    const connectedCompaniesResponse = await knotClient.getConnectedCompanies(userId)
    const hasConnectedAccounts = connectedCompaniesResponse.connected_companies.length > 0
    
    // If no accounts are connected, return an error
    if (!hasConnectedAccounts) {
      return NextResponse.json({
        success: false,
        error: "No connected accounts. Please connect your accounts to see transactions.",
        transactions: [],
        chartData: []
      })
    }
    
    // Otherwise, return sample data (in a real app, this would fetch real data from connected services)
    return NextResponse.json({
      success: true,
      transactions: sampleTransactions,
      chartData: sampleChartData
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
    const body = await request.json()
    const { merchant, amount, category, description } = body
    
    // Validate required fields
    if (!merchant || !amount) {
      return NextResponse.json(
        { error: "Merchant and amount are required" },
        { status: 400 }
      )
    }
    
    // Get the authenticated user
    const user = await getUser()
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    // Create a new transaction (in a real app, this would save to a database)
    const newTransaction = {
      id: `txn-${Date.now()}`,
      merchant,
      amount: parseFloat(amount),
      date: new Date().toISOString(),
      category: category || "Uncategorized",
      description: description || "",
      cardName: "Chase Sapphire Reserve", // Default for demo
      cardIssuer: "Chase", // Default for demo
      cardLast4: "4567", // Default for demo
    }
    
    // Normally, we would add this to a database. For the demo, we just return success.
    return NextResponse.json({
      success: true,
      transaction: newTransaction,
      message: "Transaction added successfully"
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