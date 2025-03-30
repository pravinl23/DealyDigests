import { NextResponse } from "next/server"
import { mockDb } from "@/lib/mock-data"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const userId = url.searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Get user's Spotify history from mock database
    const spotifyHistory = mockDb.getUserSpotifyHistory(userId)

    // Format data for response
    const formattedHistory = spotifyHistory.map(item => ({
      id: item.id,
      title: item.trackName,
      trackName: item.trackName,
      artist: item.artist,
      genre: item.genre,
      date: item.listenDate.toISOString(),
      duration: item.duration
    }))

    return NextResponse.json({
      success: true,
      spotifyHistory: formattedHistory
    })
  } catch (error) {
    console.error("Error fetching Spotify history:", error)
    return NextResponse.json(
      { error: "Failed to fetch Spotify history" },
      { status: 500 }
    )
  }
} 