import { NextResponse } from "next/server"
import knotClient from "@/lib/knot"
import { mockDb } from "@/lib/mock-data"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, merchantName, merchantId } = body

    // Validate input
    if (!userId || !merchantName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Use a default merchant ID if not provided
    const actualMerchantId = merchantId || Math.floor(Math.random() * 100) + 1;

    // Call Knot API to connect the merchant with the updated method signature
    const connectionResult = await knotClient.connectCompany(userId, merchantName, actualMerchantId)

    if (!connectionResult.success) {
      return NextResponse.json({ error: connectionResult.error }, { status: 500 })
    }

    // Update our mock database to mark this merchant as connected
    await mockDb.markCompanyAsKnotConnected(userId, merchantName)

    return NextResponse.json({
      success: true,
      message: `Successfully connected ${merchantName} with Knot`,
      data: connectionResult
    })
  } catch (error) {
    console.error("Error connecting merchant:", error)
    return NextResponse.json(
      { error: "Failed to connect merchant" },
      { status: 500 }
    )
  }
} 