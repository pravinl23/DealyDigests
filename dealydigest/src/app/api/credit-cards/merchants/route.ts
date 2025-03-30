import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import { CreditCardOffer } from "@/lib/models/creditCardOffer";

/**
 * GET /api/credit-cards/merchants
 * Get all unique merchant compatibility options
 */
export async function GET(request: NextRequest) {
  try {
    // Connect to the database
    await connectToDatabase();

    // Get all unique merchants with their counts
    const merchantStats = await CreditCardOffer.aggregate([
      { $unwind: "$merchantCompatibility" },
      { $group: { _id: "$merchantCompatibility", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Extract just the merchant names
    const merchants = merchantStats.map((stat) => stat._id);

    return NextResponse.json({
      success: true,
      data: merchants,
    });
  } catch (error) {
    console.error("Error fetching merchant compatibility options:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch merchant compatibility options",
      },
      { status: 500 }
    );
  }
}
