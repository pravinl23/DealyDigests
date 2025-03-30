import { NextResponse } from "next/server"
import { mockDb } from "@/lib/mock-data"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const userId = url.searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Get user's favorite genres from mock database
    const favoriteGenres = mockDb.getUserFavoriteGenres(userId)

    return NextResponse.json({
      success: true,
      favoriteGenres
    })
  } catch (error) {
    console.error("Error fetching favorite genres:", error)
    return NextResponse.json(
      { error: "Failed to fetch favorite genres" },
      { status: 500 }
    )
  }
} 