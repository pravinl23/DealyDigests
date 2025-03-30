import { NextResponse } from "next/server";
import { knotClient } from "@/lib/knot";
import { getUser } from "@/lib/utils";

export async function GET(request: Request) {
  try {
    // Get the authenticated user
    const user = await getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Use the user's sub/id as userId
    const userId = user.sub || user.id;
    
    // Get connected companies from Knot
    const connectedCompanies = await knotClient.getConnectedCompanies(userId);
    
    return NextResponse.json({
      success: true,
      connected_companies: connectedCompanies.connected_companies
    });
  } catch (error) {
    console.error("Error fetching connected companies:", error);
    return NextResponse.json(
      { error: "Failed to fetch connected companies" },
      { status: 500 }
    );
  }
} 