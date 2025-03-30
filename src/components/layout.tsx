"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const pathname = usePathname()
  const [activeTab, setActiveTab] = useState("dashboard")

  // Dispatch tab change event for child components to listen
  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    // Create and dispatch a custom event for tab change
    const event = new CustomEvent('tabChange', { detail: { tab } })
    window.dispatchEvent(event)
  }

  // Initialize active tab based on the pathname
  useEffect(() => {
    switch (pathname) {
      case '/dashboard':
        setActiveTab('dashboard')
        break
      case '/deals':
        setActiveTab('deals')
        break
      case '/account':
        setActiveTab('accounts')
        break
      default:
        setActiveTab('dashboard')
    }
  }, [pathname])

  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      <header className="border-b border-zinc-800 bg-zinc-900">
        <div className="container mx-auto flex h-16 items-center px-4">
          <div className="mr-4 flex items-center">
            <span className="text-2xl font-bold">DealsDigest</span>
          </div>
          <div className="flex-1"></div> {/* Spacer */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-zinc-700"></div>
              <div className="text-sm">
                <div className="font-medium">Demo User</div>
                <div className="text-xs text-zinc-400">demo@example.com</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="container mx-auto p-4">
          <div className="mb-6 flex justify-center">
            <div className="inline-flex rounded-lg bg-zinc-900 p-1">
              <button
                className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === "dashboard"
                    ? "bg-zinc-800 text-white"
                    : "text-zinc-400 hover:text-white"
                }`}
                onClick={() => handleTabChange("dashboard")}
              >
                Dashboard
              </button>
              <button
                className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === "deals"
                    ? "bg-zinc-800 text-white"
                    : "text-zinc-400 hover:text-white"
                }`}
                onClick={() => handleTabChange("deals")}
              >
                Deals
              </button>
              <button
                className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === "entertainment"
                    ? "bg-zinc-800 text-white"
                    : "text-zinc-400 hover:text-white"
                }`}
                onClick={() => handleTabChange("entertainment")}
              >
                Entertainment
              </button>
              <button
                className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === "accounts"
                    ? "bg-zinc-800 text-white"
                    : "text-zinc-400 hover:text-white"
                }`}
                onClick={() => handleTabChange("accounts")}
              >
                Cards
              </button>
            </div>
          </div>
          {children}
        </div>
      </main>
      
      <footer className="border-t border-zinc-800 bg-zinc-900 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-zinc-500">
          <p>© 2025 DealsDigest. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

