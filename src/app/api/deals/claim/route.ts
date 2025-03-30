import { NextResponse } from "next/server"
import { mockDb } from "@/lib/mock-data"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, dealId } = body

    if (!userId || !dealId) {
      return NextResponse.json({ error: "User ID and Deal ID are required" }, { status: 400 })
    }

    // Check if the deal exists
    const deal = mockDb.findDealById(dealId)
    if (!deal) {
      return NextResponse.json({ error: "Deal not found" }, { status: 404 })
    }

    // Create or update user deal
    const userDeal = mockDb.createOrUpdateUserDeal({
      userId,
      dealId,
      clicked: true,
      claimed: true
    })

    return NextResponse.json({
      success: true,
      message: "Deal claimed successfully",
      userDeal
    })
  } catch (error) {
    console.error("Error claiming deal:", error)
    return NextResponse.json(
      { error: "Failed to claim deal" },
      { status: 500 }
    )
  }
} 