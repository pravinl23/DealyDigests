import { NextResponse } from "next/server"
import { mockDb } from "@/lib/mock-data"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const category = searchParams.get("category") || undefined

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      )
    }

    // Get product recommendations based on retail and media history
    const recommendations = mockDb.getProductRecommendations(userId, category)

    return NextResponse.json({
      success: true,
      recommendations
    })
  } catch (error) {
    console.error("Error fetching product recommendations:", error)
    return NextResponse.json(
      { error: "Failed to fetch recommendations" },
      { status: 500 }
    )
  }
} 