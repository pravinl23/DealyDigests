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
}

interface AllDealsProps {
  initialCategories: string[]
}

export default function AllDeals({ initialCategories }: AllDealsProps) {
  const [deals, setDeals] = useState<Deal[]>([])
  const [categories] = useState<string[]>(initialCategories)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [error, setError] = useState<string | null>(null)

  // Use useEffect to fetch data after component mounts
  useEffect(() => {
    let isMounted = true

    const fetchDeals = async () => {
      if (!isMounted) return

      setIsLoading(true)
      setError(null)

      try {
        const queryParams = new URLSearchParams({
          page: page.toString(),
          limit: "9",
        })

        if (selectedCategory) {
          queryParams.append("category", selectedCategory)
        }

        const response = await fetch(`/api/deals?${queryParams.toString()}`)

        if (!isMounted) return

        if (!response.ok) {
          throw new Error("Failed to fetch deals")
        }

        const data = await response.json()

        if (!isMounted) return

        setDeals(data.deals)
        setTotalPages(data.pagination.pages)
      } catch (err) {
        if (!isMounted) return
        console.error("Error fetching deals:", err)
        setError("Failed to load deals. Please try again later.")
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchDeals()

    return () => {
      isMounted = false
    }
  }, [selectedCategory, page])

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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            selectedCategory === null ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800 hover:bg-gray-300"
          }`}
        >
          All Deals
        </button>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              selectedCategory === category ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {isLoading ? (
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
      ) : deals.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500">No deals found for the selected category.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {deals.map((deal) => (
              <DealCard key={deal.id} deal={deal} onClaim={handleClaimDeal} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <nav className="inline-flex rounded-md shadow">
                <button
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={page === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </>
      )}
    </div>
  )
}

