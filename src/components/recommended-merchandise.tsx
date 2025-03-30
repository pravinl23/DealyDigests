"use client"

import { useState } from "react"
import MerchandiseCard from "./merchandise-card"

interface MerchandiseItem {
  id: string
  title: string
  type: "figurine" | "clothing" | "poster" | "collectible" | "accessory"
  description: string
  price: number
  imageUrl?: string
}

interface RecommendedMerchandiseProps {
  items: MerchandiseItem[]
  title?: string
  onPurchase?: (itemId: string) => Promise<void>
}

export function RecommendedMerchandise({ 
  items, 
  title = "Recommended Merchandise", 
  onPurchase 
}: RecommendedMerchandiseProps) {
  const [purchasedItemIds, setPurchasedItemIds] = useState<Set<string>>(new Set())

  const handlePurchase = async (itemId: string) => {
    if (!onPurchase) return
    
    await onPurchase(itemId)
    setPurchasedItemIds(prev => new Set([...prev, itemId]))
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-white">{title}</h3>
      
      {items.length === 0 ? (
        <p className="text-zinc-400">No recommended merchandise found.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <MerchandiseCard 
              key={item.id} 
              item={item} 
              onPurchase={handlePurchase}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default RecommendedMerchandise 