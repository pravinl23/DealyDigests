"use client"

import { useState } from "react"

interface Product {
  id: string
  title: string
  category: string
  price: number
  imageUrl?: string
  description: string
  retailerId: string
  retailerName: string
  relevance: "media" | "retail" | "both"
}

interface ProductRecommendationProps {
  products: Product[]
  title?: string
}

export function ProductRecommendation({ products, title = "Recommended Products" }: ProductRecommendationProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedRelevance, setSelectedRelevance] = useState<"media" | "retail" | "both" | null>(null)

  // Get unique categories
  const categories = Array.from(new Set(products.map(product => product.category)))

  // Filter products based on selections
  const filteredProducts = products.filter(product => {
    if (selectedCategory && product.category !== selectedCategory) {
      return false
    }
    if (selectedRelevance && product.relevance !== selectedRelevance) {
      return false
    }
    return true
  })

  // Group by retailer
  const groupedByRetailer: Record<string, Product[]> = {}
  filteredProducts.forEach(product => {
    if (!groupedByRetailer[product.retailerName]) {
      groupedByRetailer[product.retailerName] = []
    }
    groupedByRetailer[product.retailerName].push(product)
  })

  const handleCategoryChange = (category: string | null) => {
    setSelectedCategory(category === selectedCategory ? null : category)
  }

  const handleRelevanceChange = (relevance: "media" | "retail" | "both" | null) => {
    setSelectedRelevance(relevance === selectedRelevance ? null : relevance)
  }

  const RelevanceBadge = ({ type }: { type: "media" | "retail" | "both" }) => {
    const getColor = () => {
      switch (type) {
        case "media":
          return "bg-purple-100 text-purple-800"
        case "retail":
          return "bg-blue-100 text-blue-800"
        case "both":
          return "bg-green-100 text-green-800"
      }
    }

    const getLabel = () => {
      switch (type) {
        case "media":
          return "Based on Media"
        case "retail":
          return "Based on Purchases"
        case "both":
          return "Based on Both"
      }
    }

    return (
      <span className={`text-xs font-medium px-2 py-1 rounded-full ${getColor()}`}>
        {getLabel()}
      </span>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold">{title}</h2>
        <p className="text-gray-500 mt-1">Personalized recommendations based on your history</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="space-y-2">
          <p className="text-sm font-medium">Filter by Category:</p>
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`px-3 py-1 text-sm rounded-full ${
                  selectedCategory === category
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                }`}
              >
                {category}
              </button>
            ))}
            {selectedCategory && (
              <button
                onClick={() => setSelectedCategory(null)}
                className="px-3 py-1 text-sm rounded-full bg-red-100 text-red-800 hover:bg-red-200"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Filter by Source:</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleRelevanceChange("media")}
              className={`px-3 py-1 text-sm rounded-full ${
                selectedRelevance === "media"
                  ? "bg-purple-600 text-white"
                  : "bg-purple-100 text-purple-800 hover:bg-purple-200"
              }`}
            >
              Media
            </button>
            <button
              onClick={() => handleRelevanceChange("retail")}
              className={`px-3 py-1 text-sm rounded-full ${
                selectedRelevance === "retail"
                  ? "bg-blue-600 text-white"
                  : "bg-blue-100 text-blue-800 hover:bg-blue-200"
              }`}
            >
              Purchases
            </button>
            <button
              onClick={() => handleRelevanceChange("both")}
              className={`px-3 py-1 text-sm rounded-full ${
                selectedRelevance === "both"
                  ? "bg-green-600 text-white"
                  : "bg-green-100 text-green-800 hover:bg-green-200"
              }`}
            >
              Both
            </button>
            {selectedRelevance && (
              <button
                onClick={() => setSelectedRelevance(null)}
                className="px-3 py-1 text-sm rounded-full bg-red-100 text-red-800 hover:bg-red-200"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {Object.entries(groupedByRetailer).length === 0 ? (
        <div className="text-center py-10 border border-gray-200 rounded-lg">
          <p className="text-gray-500">No products match your filters.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedByRetailer).map(([retailerName, retailerProducts]) => (
            <div key={retailerName} className="space-y-4">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-medium">{retailerName}</h3>
                <span className="text-sm text-gray-500">({retailerProducts.length} items)</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {retailerProducts.map(product => (
                  <div key={product.id} className="card overflow-hidden">
                    <div className="relative h-48 bg-gray-100">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <span className="text-4xl">🛍️</span>
                        </div>
                      )}
                      <div className="absolute top-2 right-2">
                        <RelevanceBadge type={product.relevance} />
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <h4 className="font-medium">{product.title}</h4>
                      <p className="text-sm text-gray-500 mb-2">{product.category}</p>
                      <p className="text-sm text-gray-700 mb-4">{product.description}</p>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold">${product.price.toFixed(2)}</span>
                        <button className="rounded-lg bg-primary px-3 py-1.5 text-sm text-white hover:bg-primary-light">
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ProductRecommendation 