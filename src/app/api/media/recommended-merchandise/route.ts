import { NextResponse } from "next/server"
import { mockDb } from "@/lib/mock-data"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const userId = url.searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Get recommended merchandise based on user's media consumption
    const recommendedMerchandise = mockDb.getRecommendedMerchandise(userId)

    return NextResponse.json({
      success: true,
      recommendedMerchandise
    })
  } catch (error) {
    console.error("Error fetching recommended merchandise:", error)
    return NextResponse.json(
      { error: "Failed to fetch recommended merchandise" },
      { status: 500 }
    )
  }
} 