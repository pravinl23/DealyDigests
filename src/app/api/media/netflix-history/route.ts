import { NextResponse } from "next/server"
import { mockDb } from "@/lib/mock-data"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const userId = url.searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Get user's Netflix history from mock database
    const netflixHistory = mockDb.getUserNetflixHistory(userId)

    // Format data for response
    const formattedHistory = netflixHistory.map(item => ({
      id: item.id,
      title: item.title,
      type: item.type,
      genre: item.genre,
      date: item.watchDate.toISOString(),
      duration: item.duration
    }))

    return NextResponse.json({
      success: true,
      netflixHistory: formattedHistory
    })
  } catch (error) {
    console.error("Error fetching Netflix history:", error)
    return NextResponse.json(
      { error: "Failed to fetch Netflix history" },
      { status: 500 }
    )
  }
} 