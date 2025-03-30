import { NextResponse } from "next/server"
import { mockDb } from "@/lib/mock-data"

export async function GET(req: Request) {
  try {
    // For the preview, we'll use a fixed user ID
    const userId = "1" // Demo user ID

    const { searchParams } = new URL(req.url)
    const category = searchParams.get("category")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const offset = (page - 1) * limit

    // Get deals
    const { deals, total } = mockDb.findAllDeals({
      category: category || undefined,
      limit,
      offset,
    })

    return NextResponse.json({
      deals,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    })
  } catch (error) {
    console.error("Error fetching deals:", error)
    return NextResponse.json({ error: "Failed to fetch deals" }, { status: 500 })
  }
}

