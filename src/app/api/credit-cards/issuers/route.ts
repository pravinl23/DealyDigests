import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import { CreditCardOffer } from "@/lib/models/creditCardOffer";

/**
 * GET /api/credit-cards/issuers
 * Get all unique card issuers
 */
export async function GET(request: NextRequest) {
  try {
    // Connect to the database
    await connectToDatabase();

    // Get all unique issuers with their counts
    const issuerStats = await CreditCardOffer.aggregate([
      { $group: { _id: "$issuer", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Extract just the issuer names
    const issuers = issuerStats.map((stat) => stat._id);

    return NextResponse.json({
      success: true,
      data: issuers,
    });
  } catch (error) {
    console.error("Error fetching card issuers:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch card issuers" },
      { status: 500 }
    );
  }
}
