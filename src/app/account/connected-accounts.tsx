"use client"

import { useState } from "react"
import type { UserBankConnection } from "@/lib/mock-data"

interface ConnectedAccountsProps {
  connections: UserBankConnection[]
}

export default function ConnectedAccounts({ connections }: ConnectedAccountsProps) {
  const [isRemoving, setIsRemoving] = useState<string | null>(null)

  const handleRemoveConnection = async (connectionId: string) => {
    setIsRemoving(connectionId)

    try {
      // In a real app, this would be an API call to remove the connection
      // For the preview, we'll just simulate a delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // We won't actually remove it from the mock data to keep the demo functional
      alert("This would remove the connection in a real app")
    } finally {
      setIsRemoving(null)
    }
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Connected Accounts</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">Your linked financial accounts.</p>
      </div>
      <div className="border-t border-gray-200">
        <ul className="divide-y divide-gray-200">
          {connections.length === 0 ? (
            <li className="px-4 py-5 sm:p-6 text-center text-gray-500">
              No accounts connected yet. Connect an account to get personalized deals.
            </li>
          ) : (
            connections.map((connection) => (
              <li key={connection.id} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">
                      {connection.institutionName || "Bank Account"}
                    </h4>
                    <p className="mt-1 text-sm text-gray-500">
                      {connection.cardType || "Card"} ending in {connection.last4 || "xxxx"}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      Connected on {new Date(connection.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemoveConnection(connection.id)}
                    disabled={isRemoving === connection.id}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {isRemoving === connection.id ? "Removing..." : "Remove"}
                  </button>
                </div>
              </li>
            ))
          )}
        </ul>
        <div className="px-4 py-4 sm:px-6">
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Connect New Account
          </button>
        </div>
      </div>
    </div>
  )
}

