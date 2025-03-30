import { NextResponse } from "next/server"
import { mockDb } from "@/lib/mock-data"

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    // For the preview, we'll use a fixed user ID
    const userId = "1" // Demo user ID

    const dealId = params.id

    // Check if the deal exists
    const deal = mockDb.findDealById(dealId)

    if (!deal) {
      return NextResponse.json({ error: "Deal not found" }, { status: 404 })
    }

    // Check if the deal is still valid
    if (deal.validTo < new Date()) {
      return NextResponse.json({ error: "This deal has expired" }, { status: 400 })
    }

    // Record that the user claimed the deal
    const userDeal = mockDb.createOrUpdateUserDeal({
      userId,
      dealId,
      clicked: true,
      claimed: true,
    })

    return NextResponse.json({ success: true, userDeal })
  } catch (error) {
    console.error("Error claiming deal:", error)
    return NextResponse.json({ error: "Failed to claim deal" }, { status: 500 })
  }
}

