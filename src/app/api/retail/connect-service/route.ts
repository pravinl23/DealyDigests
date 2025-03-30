import { NextResponse } from "next/server"
import { mockDb } from "@/lib/mock-data"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, serviceId } = body

    if (!userId || !serviceId) {
      return NextResponse.json(
        { error: "User ID and Service ID are required" },
        { status: 400 }
      )
    }

    // Connect retail service in mock database
    const success = mockDb.connectRetailService(userId, serviceId)
    
    if (!success) {
      return NextResponse.json(
        { error: "Service not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Service connected successfully"
    })
  } catch (error) {
    console.error("Error connecting retail service:", error)
    return NextResponse.json(
      { error: "Failed to connect retail service" },
      { status: 500 }
    )
  }
} 