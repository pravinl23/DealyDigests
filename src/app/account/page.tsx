"use client"

import { useEffect, useState } from "react"
import Layout from "@/components/layout"
import { mockDb } from "@/lib/mock-data"

// For the preview, we'll use a fixed user ID
const userId = "1" // Demo user ID

export default function AccountPage() {
  const [user, setUser] = useState(null)
  const [bankConnections, setBankConnections] = useState([])
  const [claimedDeals, setClaimedDeals] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    // Load data from mock DB
    // In a real app, this would be API calls
    const userData = mockDb.findUserById(userId)
    const connections = mockDb.findBankConnectionsByUserId(userId)
    const deals = mockDb.findUserDealsByUserId(userId)

    setUser(userData)
    setBankConnections(connections)
    setClaimedDeals(deals)
    setName(userData?.name || "")
    setEmail(userData?.email || "")
    setIsLoading(false)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsUpdating(true)
    setMessage(null)

    try {
      // In a real app, this would be an API call
      // For the preview, we'll just simulate a successful update
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setMessage({
        text: "Account settings updated successfully!",
        type: "success",
      })
    } catch (error) {
      setMessage({
        text: "Failed to update account settings.",
        type: "error",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="space-y-4">
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
            <div className="bg-white shadow rounded-lg p-6">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="space-y-4">
                <div className="h-16 bg-gray-200 rounded"></div>
                <div className="h-16 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-8">
        <div className="border-b border-gray-200 pb-5">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl">Account Settings</h2>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Account Information</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">Personal details and preferences.</p>
            </div>
            <div className="border-t border-gray-200">
              <form onSubmit={handleSubmit} className="px-4 py-5 sm:p-6">
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email address
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <button
                      type="submit"
                      disabled={isUpdating}
                      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      {isUpdating ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                  {message && (
                    <div className={`mt-2 text-sm ${message.type === "success" ? "text-green-600" : "text-red-600"}`}>
                      {message.text}
                    </div>
                  )}
                </div>
              </form>
            </div>
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Connected Accounts</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">Your linked financial accounts.</p>
            </div>
            <div className="border-t border-gray-200">
              <ul className="divide-y divide-gray-200">
                {bankConnections.length === 0 ? (
                  <li className="px-4 py-5 sm:p-6 text-center text-gray-500">
                    No accounts connected yet. Connect an account to get personalized deals.
                  </li>
                ) : (
                  bankConnections.map((connection) => (
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
                        <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                          Remove
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
        </div>

        <div className="border-b border-gray-200 pb-5">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Recently Claimed Deals</h3>
        </div>

        {claimedDeals.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500">You haven't claimed any deals yet. Browse the deals page to find offers.</p>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {claimedDeals.map((userDeal) => (
                <li key={userDeal.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-blue-600 truncate">{userDeal.deal.title}</p>
                      <div className="ml-2 flex-shrink-0 flex">
                        <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Claimed
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          {userDeal.deal.description.substring(0, 100)}
                          {userDeal.deal.description.length > 100 ? "..." : ""}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <p>Claimed on {new Date(userDeal.updatedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Layout>
  )
}

