import { NextResponse } from "next/server"
import { mockDb } from "@/lib/mock-data"

export async function GET(req: Request) {
  try {
    // For the preview, we'll use a fixed user ID
    const userId = "1" // Demo user ID

    const { searchParams } = new URL(req.url)
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    // Get recommended deals based on user's spending patterns
    const recommendedDeals = mockDb.getRecommendedDeals(userId, limit)

    return NextResponse.json({ deals: recommendedDeals })
  } catch (error) {
    console.error("Error fetching recommended deals:", error)
    return NextResponse.json({ error: "Failed to fetch recommended deals" }, { status: 500 })
  }
}

