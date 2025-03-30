"use client"

import { useState, useEffect } from "react"
import { mockDb } from "@/lib/mock-data"

interface SpendingInsightsProps {
  userId: string
}

export default function SpendingInsights({ userId }: SpendingInsightsProps) {
  const [topCategories, setTopCategories] = useState<string[]>([])
  const [topMerchants, setTopMerchants] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // In a real app, this would be an API call
    // For the preview, we'll use the mock data directly
    setTopCategories(mockDb.getUserTopCategories(userId))
    setTopMerchants(mockDb.getUserTopMerchants(userId))
    setIsLoading(false)
  }, [userId])

  if (isLoading) {
    return (
      <div className="bg-white shadow rounded-lg p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Spending Insights</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-sm font-medium text-gray-500 mb-2">Top Spending Categories</h4>
          <ul className="space-y-2">
            {topCategories.map((category, index) => (
              <li key={index} className="flex items-center">
                <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-800 text-xs font-medium mr-2">
                  {index + 1}
                </span>
                <span className="text-gray-700">{category}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-500 mb-2">Top Merchants</h4>
          <ul className="space-y-2">
            {topMerchants.map((merchant, index) => (
              <li key={index} className="flex items-center">
                <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-green-100 text-green-800 text-xs font-medium mr-2">
                  {index + 1}
                </span>
                <span className="text-gray-700">{merchant}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

