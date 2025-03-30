import { NextResponse } from "next/server"
import { mockDb } from "@/lib/mock-data"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const userId = url.searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Get retail services from mock database
    const retailServices = mockDb.getRetailServices(userId)

    return NextResponse.json({
      success: true,
      retailServices
    })
  } catch (error) {
    console.error("Error fetching retail services:", error)
    return NextResponse.json(
      { error: "Failed to fetch retail services" },
      { status: 500 }
    )
  }
} 