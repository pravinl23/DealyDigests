import { NextResponse } from "next/server"
import { mockDb } from "@/lib/mock-data"

export async function GET(req: Request) {
  try {
    // For the preview, we'll use a fixed user ID
    const userId = "1" // Demo user ID

    const topCategories = mockDb.getUserTopCategories(userId)
    const topMerchants = mockDb.getUserTopMerchants(userId)

    return NextResponse.json({
      topCategories,
      topMerchants,
    })
  } catch (error) {
    console.error("Error fetching insights:", error)
    return NextResponse.json({ error: "Failed to fetch insights" }, { status: 500 })
  }
}

