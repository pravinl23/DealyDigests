"use client"

import { useState, useEffect } from "react"
import DealCard from "@/components/deal-card"

interface Deal {
  id: string
  title: string
  description: string
  validFrom: string | Date
  validTo: string | Date
  cardRequired: string | null
  categories: string[]
  merchant: string | null
  discountAmount: number
  discountType: "percentage" | "fixed"
  minPurchase: number | null
  score?: number
}

export default function RecommendedDeals() {
  const [deals, setDeals] = useState<Deal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const fetchRecommendedDeals = async () => {
      if (!isMounted) return

      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch("/api/deals/recommended?limit=6")

        if (!isMounted) return

        if (!response.ok) {
          throw new Error("Failed to fetch recommended deals")
        }

        const data = await response.json()

        if (!isMounted) return

        setDeals(data.deals)
      } catch (err) {
        if (!isMounted) return
        console.error("Error fetching recommended deals:", err)
        setError("Failed to load recommended deals. Please try again later.")
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchRecommendedDeals()

    return () => {
      isMounted = false
    }
  }, [])

  const handleClaimDeal = async (dealId: string) => {
    try {
      const response = await fetch(`/api/deals/${dealId}/claim`, {
        method: "POST",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to claim deal")
      }

      return await response.json()
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error("An unknown error occurred")
    }
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="bg-white shadow rounded-lg p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6 mb-4"></div>
            <div className="flex justify-end">
              <div className="h-8 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
        <span className="block sm:inline">{error}</span>
      </div>
    )
  }

  if (deals.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">No recommended deals found. Connect more accounts to get personalized deals.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {deals.map((deal) => (
        <DealCard key={deal.id} deal={deal} onClaim={handleClaimDeal} />
      ))}
    </div>
  )
}

