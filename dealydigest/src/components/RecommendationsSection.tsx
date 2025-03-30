'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { CalendarIcon, ShoppingBagIcon, MusicIcon, VideoIcon } from 'lucide-react'

interface Event {
  id: string
  title: string
  type: string
  performers: string[]
  venue: string
  date: string
  price: number
  genres: string[]
  imageUrl: string
  description: string
}

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

export default function RecommendationsSection() {
  const [events, setEvents] = useState<Event[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [activeTab, setActiveTab] = useState<'events' | 'products'>('events')
  const [activeCategory, setActiveCategory] = useState<string | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchRecommendations = async () => {
      setIsLoading(true)
      try {
        // Fetch event recommendations
        const eventsResponse = await fetch('/api/recommendations/events?userId=1')
        const eventsData = await eventsResponse.json()
        
        // Fetch product recommendations
        const productsResponse = await fetch(`/api/recommendations/products?userId=1${activeCategory ? `&category=${activeCategory}` : ''}`)
        const productsData = await productsResponse.json()
        
        if (eventsData.success) {
          setEvents(eventsData.recommendations)
        }
        
        if (productsData.success) {
          setProducts(productsData.recommendations)
        }
      } catch (error) {
        console.error('Error fetching recommendations:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchRecommendations()
  }, [activeCategory])

  const categories = [
    { id: undefined, name: 'All' },
    { id: 'Electronics', name: 'Electronics' },
    { id: 'Music', name: 'Music' },
    { id: 'Books', name: 'Books' },
    { id: 'Accessories', name: 'Accessories' },
  ]

  // Format date string to a readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date)
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
        <h2 className="text-2xl font-bold text-primary">Your Personalized Recommendations</h2>
      </div>
      
      <div className="border-b border-gray-200">
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveTab('events')}
            className={`flex items-center px-4 py-2 text-sm font-medium ${
              activeTab === 'events'
                ? 'border-b-2 border-primary text-primary'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            Events
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center px-4 py-2 text-sm font-medium ${
              activeTab === 'products'
                ? 'border-b-2 border-primary text-primary'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <ShoppingBagIcon className="mr-2 h-4 w-4" />
            Products
          </button>
        </div>
      </div>

      <div className="mt-4">
        {activeTab === 'events' && (
          <div className="space-y-4">
            <p className="text-gray-500">Based on your Netflix and Spotify history, we think you might enjoy these events:</p>
            
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-64 bg-gray-100 rounded-lg"></div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {events.map((event) => (
                  <div key={event.id} className="border rounded-lg overflow-hidden">
                    <div className="w-full h-40 relative bg-gray-100">
                      {event.imageUrl && (
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                      )}
                      <div className="absolute bottom-2 left-2 z-20">
                        <span className="bg-primary text-white px-2 py-1 rounded-md text-xs">
                          {event.type}
                        </span>
                        {event.genres.slice(0, 2).map((genre) => (
                          <span key={genre} className="ml-1 text-white border border-white/50 px-2 py-1 rounded-md text-xs">
                            {genre}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between items-start">
                        <h3 className="text-lg font-medium">{event.title}</h3>
                        <div className="text-right">
                          <span className="font-bold text-primary">${event.price}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                        <CalendarIcon className="h-3 w-3" />
                        {formatDate(event.date)}
                      </div>

                      <div className="text-sm text-gray-500 mt-2 line-clamp-2">{event.description}</div>
                      <div className="mt-1 text-xs font-medium">{event.venue}</div>

                      <button className="mt-4 w-full bg-primary text-white rounded-lg px-3 py-1.5 text-sm hover:bg-primary-dark">
                        View Event
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'products' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-gray-500">Products you might like based on your shopping and media history:</p>
              
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button 
                    key={category.name}
                    onClick={() => setActiveCategory(category.id)}
                    className={`px-3 py-1 text-sm rounded-full ${
                      activeCategory === category.id
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
            
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-pulse">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-64 bg-gray-100 rounded-lg"></div>
                ))}
              </div>
            ) : (
              <div>
                {Object.entries(
                  products.reduce<Record<string, Product[]>>((acc, product) => {
                    if (!acc[product.retailerName]) {
                      acc[product.retailerName] = [];
                    }
                    acc[product.retailerName].push(product);
                    return acc;
                  }, {})
                ).length === 0 ? (
                  <div className="text-center py-10 border border-gray-200 rounded-lg">
                    <p className="text-gray-500">No products match your filters.</p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {Object.entries(
                      products.reduce<Record<string, Product[]>>((acc, product) => {
                        if (!acc[product.retailerName]) {
                          acc[product.retailerName] = [];
                        }
                        acc[product.retailerName].push(product);
                        return acc;
                      }, {})
                    ).map(([retailerName, retailerProducts]) => (
                      <div key={retailerName} className="space-y-4">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-medium">{retailerName}</h3>
                          <span className="text-sm text-gray-500">({retailerProducts.length} items)</span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {retailerProducts.map((product) => (
                            <div key={product.id} className="border rounded-lg overflow-hidden">
                              <div className="relative h-48 bg-gray-100 flex items-center justify-center">
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
                                <p className="text-sm text-gray-700 mb-4 line-clamp-2">{product.description}</p>
                                
                                <div className="flex items-center justify-between">
                                  <span className="text-lg font-bold">${product.price.toFixed(2)}</span>
                                  <button className="rounded-lg bg-primary px-3 py-1.5 text-sm text-white hover:bg-primary-dark">
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
            )}
            
            {products.length === 0 && !isLoading && (
              <div className="text-center py-8">
                <ShoppingBagIcon className="h-12 w-12 mx-auto opacity-20 mb-2" />
                <h3 className="text-lg font-medium">No products found</h3>
                <p className="text-gray-500">Try a different category or check back later</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
} 