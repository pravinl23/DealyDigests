import { NextResponse } from "next/server";

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request: Request) {
  try {
    console.log("Received request to create Knot session");

    // Parse the request body
    const body = await request.json();
    console.log("Request body:", body);

    // Make sure we have a userId
    if (!body.userId) {
      console.error("Missing userId in request body");
      return NextResponse.json(
        { error: "Missing userId in request body" },
        { status: 400 }
      );
    }

    // Get product from request or default
    const product = body.product || "card_switcher";
    console.log(`Using product: ${product}`);

    // Get authentication credentials
    const clientId =
      process.env.NEXT_PUBLIC_KNOT_CLIENT_ID ||
      "310a12cb-54c0-4021-b683-3aa5bc38b718";
    const apiSecret =
      process.env.KNOT_API_SECRET || "2f3794159bf842cf872b75c152b15682";

    // Create Basic Auth token
    const authToken = Buffer.from(`${clientId}:${apiSecret}`).toString(
      "base64"
    );
    console.log(`Using client ID: ${clientId}`);
    console.log(
      `Using API secret (first 4 chars): ${apiSecret.substring(0, 4)}...`
    );

    // Create a session using the correct endpoint from the docs
    const apiUrl = "https://development.knotapi.com/session/create";
    console.log("Making API call to:", apiUrl);

    // Create payload according to product type
    let payload: any = {
      type: product,
      external_user_id: body.userId,
      email: "test@example.com",
      phone_number: "+11234567890",
    };

    // Add product-specific fields
    if (product === "card_switcher") {
      payload.card = { blocked: false, has_funds: true };
      payload.card_id = `card-${Date.now()}`;
    } else if (product === "transaction_link") {
      payload.card = { blocked: false, has_funds: true };
      payload.processor_token = `processor-token-${Date.now()}`;
    }

    console.log("Request payload:", JSON.stringify(payload));

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "Knot-Version": "2.0",
        Authorization: `Basic ${authToken}`,
      },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();
    console.log(`Response status: ${response.status}`);
    console.log(
      `Response headers:`,
      Object.fromEntries([...response.headers.entries()])
    );
    console.log(`Response body:`, responseText);

    let responseData;

    try {
      responseData = response.status !== 204 ? JSON.parse(responseText) : {};
    } catch (e) {
      console.error("Error parsing response:", e);
      responseData = { error: "Invalid response format" };
    }

    if (!response.ok) {
      return NextResponse.json(
        {
          error: "Failed to create Knot session",
          details: responseData?.error || response.statusText,
          status: response.status,
          responseText,
        },
        { status: response.status, headers: corsHeaders }
      );
    }

    // Standardize the response to use session_id as the property name
    if (responseData.session && !responseData.session_id) {
      responseData.session_id = responseData.session;
    }

    // Return the session data
    return NextResponse.json(responseData, {
      headers: corsHeaders,
    });
  } catch (error) {
    console.error("Error creating Knot session:", error);
    return NextResponse.json(
      {
        error: "Failed to create Knot session",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
