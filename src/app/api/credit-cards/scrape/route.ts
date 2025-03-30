import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { runCreditCardScraper } from "@/lib/scheduler";

/**
 * POST /api/credit-cards/scrape
 * Manually trigger the credit card scraper
 */
export async function POST(request: NextRequest) {
  try {
    // In production, you might want to authenticate this route or limit it to admins
    // const session = await getServerSession();
    // if (!session) {
    //   return NextResponse.json(
    //     { success: false, error: 'Authentication required' },
    //     { status: 401 }
    //   );
    // }

    // Run the scraper
    const count = await runCreditCardScraper();

    return NextResponse.json({
      success: true,
      message: `Scraper completed successfully. Scraped ${count} offers.`,
      count,
    });
  } catch (error) {
    console.error("Error running credit card scraper:", error);
    return NextResponse.json(
      { success: false, error: "Failed to run credit card scraper" },
      { status: 500 }
    );
  }
}
