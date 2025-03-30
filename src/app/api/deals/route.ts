import { NextResponse } from "next/server"
import { mockDb } from "@/lib/mock-data"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const userId = url.searchParams.get("userId")
    const category = url.searchParams.get("category") || undefined
    const limit = url.searchParams.get("limit") ? parseInt(url.searchParams.get("limit")!) : undefined
    const offset = url.searchParams.get("offset") ? parseInt(url.searchParams.get("offset")!) : undefined

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Get deals from the mock database
    const dealsResult = mockDb.findAllDeals({ category, limit, offset })

    // Get user deals to check which ones are already claimed
    const userDeals = mockDb.findUserDealsByUserId(userId)
    const claimedDealIds = new Set(userDeals.map(ud => ud.dealId))

    // Format deals for the client
    const formattedDeals = dealsResult.deals.map(deal => ({
      ...deal,
      validFrom: deal.validFrom.toISOString(),
      validTo: deal.validTo.toISOString(),
      createdAt: deal.createdAt.toISOString(),
      updatedAt: deal.updatedAt.toISOString(),
      isClaimed: claimedDealIds.has(deal.id),
    }))

    return NextResponse.json({
      success: true,
      deals: formattedDeals,
      total: dealsResult.total
    })
  } catch (error) {
    console.error("Error fetching deals:", error)
    return NextResponse.json(
      { error: "Failed to fetch deals" },
      { status: 500 }
    )
  }
}

