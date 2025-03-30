import { mockDb } from "./mock-data"

// Mock session storage
let currentSession: { user: { id: string; email: string; name: string | null } } | null = null

export const auth = {
  // Sign in a user
  signIn: async (email: string, password: string) => {
    const user = mockDb.findUserByEmail(email)

    if (!user) {
      return { error: "User not found" }
    }

    // Simple password check (in a real app, we'd use bcrypt)
    if (password !== "password123") {
      return { error: "Invalid password" }
    }

    // Set the current session
    currentSession = {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    }

    return { success: true }
  },

  // Get the current session
  getSession: async () => {
    // For preview purposes, always return a session if none exists
    if (!currentSession) {
      const demoUser = mockDb.findUserByEmail("demo@example.com")
      if (demoUser) {
        currentSession = {
          user: {
            id: demoUser.id,
            email: demoUser.email,
            name: demoUser.name,
          },
        }
      }
    }

    return currentSession
  },

  // Sign out the current user
  signOut: async () => {
    currentSession = null
    return { success: true }
  },
}

