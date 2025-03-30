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

    // Disconnect retail service in mock database
    const success = mockDb.disconnectRetailService(userId, serviceId)
    
    if (!success) {
      return NextResponse.json(
        { error: "Service not found or not connected" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Service disconnected successfully"
    })
  } catch (error) {
    console.error("Error disconnecting retail service:", error)
    return NextResponse.json(
      { error: "Failed to disconnect retail service" },
      { status: 500 }
    )
  }
} 