import { NextResponse } from "next/server"
import knotClient from "@/lib/knot"

export async function POST() {
  try {
    // For the preview, we'll use a fixed user ID
    const userId = "1" // Demo user ID

    const linkToken = await knotClient.createLinkToken(userId)

    return NextResponse.json(linkToken)
  } catch (error) {
    console.error("Error creating link token:", error)
    return NextResponse.json({ error: "Failed to create link token" }, { status: 500 })
  }
}

