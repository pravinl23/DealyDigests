"use client"

import { useState } from "react"

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

interface DealCardProps {
  deal: Deal
  onClaim?: (dealId: string) => Promise<void>
}

export default function DealCard({ deal, onClaim }: DealCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isClaimed, setIsClaimed] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const validToDate = new Date(deal.validTo)
  const isExpired = validToDate < new Date()

  const handleClaim = async () => {
    if (!onClaim) return

    setIsLoading(true)
    setError(null)

    try {
      await onClaim(deal.id)
      setIsClaimed(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to claim deal")
    } finally {
      setIsLoading(false)
    }
  }

  const discountText =
    deal.discountType === "percentage"
      ? `${deal.discountAmount}% off`
      : deal.discountAmount === 0
        ? "Free"
        : `$${deal.discountAmount} off`

  return (
    <div className="bg-zinc-800 rounded-lg overflow-hidden">
      {/* Merchant logo or category thumbnail */}
      <div className="h-24 bg-zinc-700 flex items-center justify-center">
        {deal.merchant ? (
          <span className="text-xl font-medium text-white">{deal.merchant}</span>
        ) : (
          <span className="text-xl font-medium text-white">{deal.categories[0] || "Deal"}</span>
        )}
      </div>
      
      <div className="p-4">
        {deal.categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {deal.categories.slice(0, 2).map((category) => (
              <span
                key={category}
                className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-zinc-700 text-zinc-200"
              >
                {category}
              </span>
            ))}
          </div>
        )}

        <div className="mb-2">
          <h3 className="text-lg font-medium text-white">{deal.title}</h3>
          <span className="inline-block mt-1 px-2 py-0.5 rounded-md text-xs font-medium bg-zinc-700 text-white">
            {discountText}
          </span>
        </div>

        <div className="mt-2 text-sm text-zinc-400">
          <p>{deal.description}</p>
        </div>

        <div className="mt-4 text-xs text-zinc-500">
          {deal.merchant && <p>Merchant: {deal.merchant}</p>}
          {deal.cardRequired && <p>Required card: {deal.cardRequired}</p>}
          {deal.minPurchase && <p>Min purchase: ${deal.minPurchase}</p>}
          <p>Valid until: {validToDate.toLocaleDateString()}</p>
        </div>

        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

        <div className="mt-4">
          <button
            type="button"
            onClick={handleClaim}
            disabled={isLoading || isClaimed || isExpired || !onClaim}
            className={`w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${
              isClaimed
                ? "bg-zinc-700 text-zinc-300"
                : isExpired
                  ? "bg-zinc-700 text-zinc-500 cursor-not-allowed"
                  : "bg-zinc-600 hover:bg-zinc-500"
            } focus:outline-none`}
          >
            {isLoading ? "Claiming..." : isClaimed ? "Claimed" : isExpired ? "Expired" : "Claim Deal"}
          </button>
        </div>
      </div>
    </div>
  )
}

