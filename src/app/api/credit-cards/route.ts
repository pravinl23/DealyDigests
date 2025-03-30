import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import { CreditCardOffer } from "@/lib/models/creditCardOffer";
import { getServerSession } from "next-auth";

/**
 * GET /api/credit-cards
 * Fetch credit card offers with filters
 */
export async function GET(request: NextRequest) {
  try {
    // Connect to the database
    await connectToDatabase();

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const issuer = searchParams.get("issuer");
    const category = searchParams.get("category");
    const merchant = searchParams.get("merchant");
    const source = searchParams.get("source");
    const limit = Number(searchParams.get("limit") || "20");
    const page = Number(searchParams.get("page") || "1");

    // Build the query
    const query: any = {};

    if (issuer) {
      query.issuer = { $regex: new RegExp(issuer, "i") };
    }

    if (category) {
      query.rewardCategories = category;
    }

    if (merchant) {
      query.merchantCompatibility = { $regex: new RegExp(merchant, "i") };
    }

    if (source) {
      query.source = source;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Fetch data
    const offers = await CreditCardOffer.find(query)
      .sort({ scrapedAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get the total count for pagination
    const total = await CreditCardOffer.countDocuments(query);

    // Add pagination info
    const pagination = {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };

    return NextResponse.json({
      success: true,
      pagination,
      data: offers,
    });
  } catch (error) {
    console.error("Error fetching credit card offers:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch credit card offers" },
      { status: 500 }
    );
  }
}
