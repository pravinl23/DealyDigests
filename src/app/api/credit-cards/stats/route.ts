import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import { CreditCardOffer, RewardCategory } from "@/lib/models/creditCardOffer";

/**
 * GET /api/credit-cards/stats
 * Get credit card offer statistics
 */
export async function GET(request: NextRequest) {
  try {
    // Connect to the database
    await connectToDatabase();

    // Get the total count
    const totalCount = await CreditCardOffer.countDocuments();

    // Get the count by issuer
    const issuerStats = await CreditCardOffer.aggregate([
      { $group: { _id: "$issuer", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // Get the count by reward category
    const categoryStats = await CreditCardOffer.aggregate([
      { $unwind: "$rewardCategories" },
      { $group: { _id: "$rewardCategories", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Get the count by source
    const sourceStats = await CreditCardOffer.aggregate([
      { $group: { _id: "$source", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Get the count by merchant compatibility
    const merchantStats = await CreditCardOffer.aggregate([
      { $unwind: "$merchantCompatibility" },
      { $group: { _id: "$merchantCompatibility", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // Get the most recent scrape date
    const latestScrape = await CreditCardOffer.findOne()
      .sort({ scrapedAt: -1 })
      .select("scrapedAt");

    return NextResponse.json({
      success: true,
      data: {
        totalCount,
        latestScrape: latestScrape?.scrapedAt,
        issuerStats,
        categoryStats,
        sourceStats,
        merchantStats,
      },
    });
  } catch (error) {
    console.error("Error fetching credit card stats:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch credit card stats" },
      { status: 500 }
    );
  }
}
