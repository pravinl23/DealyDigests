"use client"

import { useState } from "react"

interface MerchandiseCardProps {
  item: {
    id: string
    title: string
    type: "figurine" | "clothing" | "poster" | "collectible" | "accessory"
    description: string
    price: number
    imageUrl?: string
  }
  onPurchase?: (itemId: string) => Promise<void>
}

export function MerchandiseCard({ item, onPurchase }: MerchandiseCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isPurchased, setIsPurchased] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePurchase = async () => {
    if (!onPurchase) return

    setIsLoading(true)
    setError(null)

    try {
      await onPurchase(item.id)
      setIsPurchased(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to purchase item")
    } finally {
      setIsLoading(false)
    }
  }

  const getTypeIcon = () => {
    switch(item.type) {
      case "figurine":
        return "🧸";
      case "clothing":
        return "👕";
      case "poster":
        return "🖼️";
      case "collectible":
        return "💿";
      case "accessory":
        return "🎧";
      default:
        return "🎁";
    }
  }

  return (
    <div className="bg-zinc-800 rounded-lg overflow-hidden shadow-md">
      <div className="relative h-48 bg-zinc-700">
        {item.imageUrl ? (
          <img 
            src={item.imageUrl} 
            alt={item.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="h-full flex items-center justify-center">
            <span className="text-4xl">{getTypeIcon()}</span>
          </div>
        )}
        <div className="absolute top-2 right-2 bg-zinc-900 bg-opacity-75 px-2 py-1 rounded text-xs font-bold text-white">
          {item.type.toUpperCase()}
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-medium text-white mb-2">{item.title}</h3>
        
        <div className="mb-4 text-sm text-zinc-400">
          <p>{item.description}</p>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-lg font-bold text-white">${item.price.toFixed(2)}</span>
          
          <button
            type="button"
            onClick={handlePurchase}
            disabled={isLoading || isPurchased || !onPurchase}
            className={`px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${
              isPurchased
                ? "bg-green-700"
                : "bg-indigo-600 hover:bg-indigo-500"
            } focus:outline-none`}
          >
            {isLoading 
              ? "Processing..." 
              : isPurchased 
                ? "Purchased" 
                : "Buy Now"}
          </button>
        </div>
        
        {error && (
          <p className="mt-2 text-sm text-red-500">{error}</p>
        )}
      </div>
    </div>
  )
}

export default MerchandiseCard 