import { NextResponse } from "next/server"
import { z } from "zod"
import { mockDb } from "@/lib/mock-data"

// Define validation schema
const userSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, password } = userSchema.parse(body)

    // Check if user already exists
    const existingUser = mockDb.findUserByEmail(email)

    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 400 })
    }

    // In a real app, we'd hash the password
    // For the preview, we'll just store it as is
    const user = mockDb.createUser({
      name,
      email,
      password,
    })

    // Return user without password
    const { password: _, ...userWithoutPassword } = user
    return NextResponse.json(userWithoutPassword, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

