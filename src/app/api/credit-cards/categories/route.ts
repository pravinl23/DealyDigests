import { NextRequest, NextResponse } from "next/server";
import { RewardCategory } from "@/lib/models/creditCardOffer";

/**
 * GET /api/credit-cards/categories
 * Get all reward categories
 */
export async function GET(request: NextRequest) {
  try {
    // Get all reward categories from the enum
    const categories = Object.values(RewardCategory);

    return NextResponse.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("Error fetching reward categories:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch reward categories" },
      { status: 500 }
    );
  }
}
