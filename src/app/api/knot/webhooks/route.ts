import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { knotClient } from "@/lib/knot";
import KnotWebhook from "@/lib/models/knotWebhook";
import Transaction from "@/lib/models/transaction";
import mongoose from "mongoose";
import { processWebhook } from "@/lib/knotWebhookHandler";

// Ensure mongoose connection
async function ensureConnection() {
  if (mongoose.connection.readyState !== 1) {
    await connectToDatabase();
  }
}

export async function POST(request: Request) {
  try {
    await ensureConnection();

    // Get headers and parse request body
    const signature = request.headers.get("knot-signature");
    if (!signature) {
      console.error("Missing Knot-Signature header");
      return NextResponse.json(
        { success: false, error: "Missing signature" },
        { status: 401 }
      );
    }

    // Get all headers as a Record<string, string>
    const headers: Record<string, string> = {};
    for (const [key, value] of request.headers.entries()) {
      headers[key] = value;
    }

    // Parse body
    const body = await request.json();
    console.log("Received webhook from Knot:", body);

    // Verify signature
    const isVerified = await knotClient.verifyWebhookSignature(
      signature,
      headers,
      body
    );

    // Extract user ID from the body
    // Note: In a real implementation, you should map the session_id or other identifiers to your user IDs
    // For this implementation, we're assuming the external_user_id is included in the webhook payload
    const userId = body.external_user_id || "unknown";

    // Store the webhook data in MongoDB
    const webhookData = new KnotWebhook({
      event: body.event,
      session_id: body.session_id,
      merchant_id: body.merchant_id,
      user_id: userId,
      status: "received",
      raw_data: body,
      signature: signature,
      verified: isVerified,
    });

    await webhookData.save();
    console.log("Webhook data saved to database", webhookData._id);

    // Process webhook asynchronously
    // This allows us to return a quick response to Knot while processing in the background
    // In a production environment, you might want to use a queue for this
    processWebhook(webhookData._id.toString())
      .then((result) => {
        console.log("Webhook processing completed:", result);
      })
      .catch((error) => {
        console.error("Error processing webhook:", error);
      });

    // Return success response immediately
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error processing Knot webhook:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
