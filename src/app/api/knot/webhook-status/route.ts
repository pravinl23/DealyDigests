import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import mongoose from "mongoose";
import KnotWebhook from "@/lib/models/knotWebhook";
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
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const skip = parseInt(url.searchParams.get("skip") || "0");
    const userId = url.searchParams.get("user_id") || session.user.id; // Use user ID if not specified

    // Fetch webhook data
    const webhooks = await KnotWebhook.find({ user_id: userId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .skip(skip);

    // Count total webhooks for pagination
    const totalWebhooks = await KnotWebhook.countDocuments({ user_id: userId });

    return NextResponse.json({
      success: true,
      data: {
        webhooks,
        pagination: {
          total: totalWebhooks,
          limit,
          skip,
          hasMore: skip + webhooks.length < totalWebhooks,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching webhook status:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
