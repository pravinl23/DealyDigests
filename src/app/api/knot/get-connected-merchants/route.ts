import { NextResponse } from "next/server"
import knotClient from "@/lib/knot"
import { mockDb } from "@/lib/mock-data"

export async function GET(request: Request) {
  try {
    // Get userId from the query parameters
    const url = new URL(request.url)
    const userId = url.searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Get connected companies from Knot
    const connectedCompanies = await knotClient.getConnectedCompanies(userId)
    
    // Also get connected companies from our database
    const dbConnectedMerchants = mockDb.getUserKnotConnections(userId)

    // Combine and deduplicate results
    const allMerchants = new Set([
      ...connectedCompanies.connected_companies.map(company => company.merchant),
      ...dbConnectedMerchants
    ])

    return NextResponse.json({
      success: true,
      connected_merchants: Array.from(allMerchants),
      data: connectedCompanies
    })
  } catch (error) {
    console.error("Error getting connected merchants:", error)
    return NextResponse.json(
      { error: "Failed to get connected merchants" },
      { status: 500 }
    )
  }
} 