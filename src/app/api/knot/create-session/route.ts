import { NextResponse } from "next/server";
import { getSession } from "@auth0/nextjs-auth0";

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

    // Get Auth0 session if available
    const res = NextResponse.next();
    const session = await getSession(request as any, res);

    // Make sure we have a userId
    const userId = body.userId || session?.user?.sub;
    if (!userId) {
      console.error("Missing userId in request body and no active session");
      return NextResponse.json(
        { error: "Missing userId in request body and no active session" },
        { status: 400 }
      );
    }

    // Get product from request or default
    const product = body.product || "card_switcher";
    console.log(`Using product: ${product}`);

    // Get authentication credentials
    const clientId =
      process.env.KNOT_CLIENT_ID || "310a12cb-54c0-4021-b683-3aa5bc38b718";
    const apiSecret =
      process.env.KNOT_CLIENT_SECRET || "2f3794159bf842cf872b75c152b15682";

    // Create Basic Auth token (base64 encoding of "clientId:apiSecret")
    const authToken = Buffer.from(`${clientId}:${apiSecret}`).toString(
      "base64"
    );

    console.log(
      `Using client ID (first 4 chars): ${clientId.substring(0, 4)}...`
    );
    console.log(
      `Using API secret (first 4 chars): ${apiSecret.substring(0, 4)}...`
    );

    // Create a session using the correct endpoint from the docs
    const apiUrl = "https://development.knotapi.com/session/create";
    console.log("Making API call to:", apiUrl);

    // Create payload according to Knot API requirements
    const payload: any = {
      external_user_id: userId,
      type: product,
    };

    // Add email from user session if available
    if (session?.user?.email) {
      payload.email = session.user.email;
    }

    // Add required card_id field for card_switcher product type
    if (product === "card_switcher") {
      payload.card_id = `card-${Date.now()}`;
    }

    console.log("Request payload:", JSON.stringify(payload));

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
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
