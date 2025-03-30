import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import mongoose from "mongoose";
import Transaction from "@/lib/models/transaction";
import { auth } from "@/lib/auth";

// Ensure mongoose connection
async function ensureConnection() {
  if (mongoose.connection.readyState !== 1) {
    await connectToDatabase();
  }
}

export async function GET(request: Request) {
  try {
    // Verify user is authenticated
    const session = await auth.getSession();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await ensureConnection();

    // Get query parameters
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get("limit") || "20");
    const skip = parseInt(url.searchParams.get("skip") || "0");
    const userId = url.searchParams.get("user_id") || session.user.id;
    const category = url.searchParams.get("category") || null;
    const merchant = url.searchParams.get("merchant") || null;
    const startDate = url.searchParams.get("start_date") || null;
    const endDate = url.searchParams.get("end_date") || null;

    // Build query
    const query: any = { user_id: userId };

    if (category) {
      query.category = category;
    }

    if (merchant) {
      query.merchant = { $regex: merchant, $options: "i" }; // Case-insensitive search
    }

    if (startDate || endDate) {
      query.date = {};

      if (startDate) {
        query.date.$gte = new Date(startDate);
      }

      if (endDate) {
        query.date.$lte = new Date(endDate);
      }
    }

    // Fetch transactions
    const transactions = await Transaction.find(query)
      .sort({ date: -1 })
      .limit(limit)
      .skip(skip);

    // Count total transactions for pagination
    const totalTransactions = await Transaction.countDocuments(query);

    // Get unique merchants for filters
    const uniqueMerchants = await Transaction.distinct("merchant", {
      user_id: userId,
    });

    // Get unique categories for filters
    const uniqueCategories = await Transaction.distinct("category", {
      user_id: userId,
    });

    // Get total spent by category
    const categoryAggregation = await Transaction.aggregate([
      { $match: { user_id: userId } },
      { $group: { _id: "$category", total: { $sum: "$amount" } } },
      { $sort: { total: -1 } },
    ]);

    // Get recent spending trend (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const spendingTrend = await Transaction.aggregate([
      {
        $match: {
          user_id: userId,
          date: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return NextResponse.json({
      success: true,
      data: {
        transactions,
        filters: {
          merchants: uniqueMerchants,
          categories: uniqueCategories,
        },
        analytics: {
          categorySpending: categoryAggregation,
          recentTrend: spendingTrend,
        },
        pagination: {
          total: totalTransactions,
          limit,
          skip,
          hasMore: skip + transactions.length < totalTransactions,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
