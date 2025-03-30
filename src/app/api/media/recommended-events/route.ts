import { NextResponse } from "next/server"
import { mockDb } from "@/lib/mock-data"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const userId = url.searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Get recommended events based on user's media consumption
    const recommendedEvents = mockDb.getRecommendedEvents(userId)

    return NextResponse.json({
      success: true,
      recommendedEvents
    })
  } catch (error) {
    console.error("Error fetching recommended events:", error)
    return NextResponse.json(
      { error: "Failed to fetch recommended events" },
      { status: 500 }
    )
  }
} 