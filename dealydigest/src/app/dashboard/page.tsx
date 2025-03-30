"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { CardsList } from "@/components/card-display"
import { CreditCardIcon, ReceiptIcon, GiftIcon } from "@/components/stats-card"
import { SpendingChart, MonthlySummary } from "@/components/spending-chart"
import { TransactionsList } from "@/components/transactions-list"
import { Tabs, InsightIcon, ChartIcon, RecommendationIcon } from "@/components/tabs"
import DealCard from "@/components/deal-card"
import MediaHistory from "@/components/media-history"
import FavoriteGenres from "@/components/favorite-genres"
import RecommendedEvents from "@/components/recommended-events"
import RecommendedMerchandise from "@/components/recommended-merchandise"

// Sample data for the dashboard
const user = {
  name: "Alex Johnson",
  email: "alex@example.com",
}

const cards = [
  {
    id: "1",
    type: "credit",
    name: "Black Card",
    last4: "1234",
    expires: "12/25",
    issuer: "American Express",
  },
  {
    id: "2",
    type: "credit",
    name: "Sapphire Reserve",
    last4: "5678",
    expires: "10/24",
    issuer: "Chase",
  },
]

const stats = [
  {
    title: "Active Cards",
    value: "2",
    icon: <CreditCardIcon className="h-5 w-5" />,
  },
  {
    title: "Recent Transactions",
    value: "5",
    icon: <ReceiptIcon className="h-5 w-5" />,
  },
  {
    title: "Available Offers",
    value: "4",
    icon: <GiftIcon className="h-5 w-5" />,
  },
]

const spendingData = [
  {
    category: "Travel",
    amount: 450,
    color: "blue",
  },
  {
    category: "Dining",
    amount: 225,
    color: "amber",
  },
  {
    category: "Shopping",
    amount: 175,
    color: "purple",
  },
]

const monthlySummary = {
  totalSpent: 739.54,
  topCategory: "Travel",
  mostUsedCard: "American Express",
  potentialSavings: 445.00,
}

const transactions = [
  {
    id: "1",
    merchant: "United Airlines",
    amount: 425.50,
    date: "2023-04-15",
    category: "Travel",
    cardName: "Black Card",
    cardIssuer: "American Express",
    cardLast4: "1234",
  },
  {
    id: "2",
    merchant: "Le Bernardin",
    amount: 85.75,
    date: "2023-04-22",
    category: "Dining",
    cardName: "Black Card",
    cardIssuer: "American Express",
    cardLast4: "1234",
  },
  {
    id: "3",
    merchant: "Amazon",
    amount: 120.99,
    date: "2023-04-23",
    category: "Shopping",
    cardName: "Sapphire Reserve",
    cardIssuer: "Chase",
    cardLast4: "5678",
  },
  {
    id: "4",
    merchant: "Uber",
    amount: 65.00,
    date: "2023-04-25",
    category: "Travel",
    cardName: "Sapphire Reserve",
    cardIssuer: "Chase",
    cardLast4: "5678",
  },
  {
    id: "5",
    merchant: "Starbucks",
    amount: 42.30,
    date: "2023-04-27",
    category: "Dining",
    cardName: "Black Card",
    cardIssuer: "American Express",
    cardLast4: "1234",
  },
]

// For the Knot integration, we need a new component for the deals tab
function DealsTab() {
  const [deals, setDeals] = useState([])
  const [connectedMerchants, setConnectedMerchants] = useState([])
  const [isLoadingDeals, setIsLoadingDeals] = useState(true)
  const [isLoadingConnections, setIsLoadingConnections] = useState(true)
  const [error, setError] = useState(null)

  const userId = "1" // Demo user ID

  // Fetch deals
  useEffect(() => {
    async function fetchDeals() {
      try {
        const response = await fetch(`/api/deals?userId=${userId}`)
        if (!response.ok) throw new Error('Failed to fetch deals')
        const data = await response.json()
        setDeals(data.deals || [])
      } catch (err) {
        setError(err.message)
        // For demo, set some dummy deals if API fails
        setDeals([
          {
            id: "1",
            title: "15% off your next DoorDash order",
            description: "Get 15% off your next DoorDash order when you spend $25 or more.",
            validFrom: "2025-01-01T00:00:00.000Z",
            validTo: "2025-12-31T00:00:00.000Z",
            cardRequired: "AMEX",
            categories: ["Food and Dining", "Delivery"],
            merchant: "DoorDash",
            discountAmount: 15,
            discountType: "percentage",
            minPurchase: 25,
          },
          {
            id: "7",
            title: "1 month free Netflix",
            description: "Get 1 month free when you pay with your linked VISA card.",
            validFrom: "2025-01-01T00:00:00.000Z",
            validTo: "2025-12-31T00:00:00.000Z",
            cardRequired: "VISA",
            categories: ["Entertainment", "Streaming"],
            merchant: "Netflix",
            discountAmount: 100,
            discountType: "percentage",
            minPurchase: null,
          },
          {
            id: "8",
            title: "50% off first 3 months of Spotify Premium",
            description: "New subscribers get 50% off for the first 3 months of Spotify Premium.",
            validFrom: "2025-01-01T00:00:00.000Z",
            validTo: "2025-12-31T00:00:00.000Z",
            cardRequired: "VISA",
            categories: ["Entertainment", "Music"],
            merchant: "Spotify",
            discountAmount: 50,
            discountType: "percentage",
            minPurchase: null,
          },
        ])
      } finally {
        setIsLoadingDeals(false)
      }
    }
    
    fetchDeals()
  }, [userId])

  // Fetch connected merchants
  useEffect(() => {
    async function fetchConnectedMerchants() {
      try {
        const response = await fetch(`/api/knot/get-connected-merchants?userId=${userId}`)
        if (!response.ok) throw new Error('Failed to fetch connected merchants')
        const data = await response.json()
        setConnectedMerchants(data.connected_merchants || [])
      } catch (err) {
        setError(err.message)
        // Set default connected merchants for demo
        setConnectedMerchants(["DoorDash", "Walmart", "Netflix", "Spotify"])
      } finally {
        setIsLoadingConnections(false)
      }
    }
    
    fetchConnectedMerchants()
  }, [userId])

  // Handle claiming a deal
  const handleClaimDeal = async (dealId) => {
    try {
      const response = await fetch('/api/deals/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, dealId })
      })
      
      if (!response.ok) throw new Error('Failed to claim deal')
      return response.json()
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  // Handle connecting a merchant via Knot
  const handleKnotConnect = async (merchantName) => {
    try {
      const response = await fetch('/api/knot/connect-merchant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, merchantName })
      })
      
      if (!response.ok) throw new Error('Failed to connect merchant')
      
      // Update connected merchants list
      setConnectedMerchants(prev => [...prev, merchantName])
      
      return response.json()
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  if (isLoadingDeals || isLoadingConnections) {
    return <div className="py-8 text-center">Loading deals...</div>
  }

  if (error) {
    return <div className="py-8 text-center text-red-500">Error: {error}</div>
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Personalized Deals</h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {deals.map(deal => (
          <DealCard 
            key={deal.id} 
            deal={deal} 
            onClaim={handleClaimDeal}
            isKnotConnected={connectedMerchants.includes(deal.merchant)}
            onKnotConnect={handleKnotConnect}
          />
        ))}
      </div>
    </div>
  )
}

// New component for the Entertainment tab
function EntertainmentTab() {
  const [netflixHistory, setNetflixHistory] = useState([])
  const [spotifyHistory, setSpotifyHistory] = useState([])
  const [favoriteGenres, setFavoriteGenres] = useState([])
  const [recommendedEvents, setRecommendedEvents] = useState([])
  const [recommendedMerchandise, setRecommendedMerchandise] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const userId = "1" // Demo user ID

  // Fetch all media-related data
  useEffect(() => {
    async function fetchMediaData() {
      setIsLoading(true)
      setError(null)
      
      try {
        // Fetch Netflix history
        const netflixResponse = await fetch(`/api/media/netflix-history?userId=${userId}`)
        if (!netflixResponse.ok) throw new Error('Failed to fetch Netflix history')
        const netflixData = await netflixResponse.json()
        setNetflixHistory(netflixData.netflixHistory || [])
        
        // Fetch Spotify history
        const spotifyResponse = await fetch(`/api/media/spotify-history?userId=${userId}`)
        if (!spotifyResponse.ok) throw new Error('Failed to fetch Spotify history')
        const spotifyData = await spotifyResponse.json()
        setSpotifyHistory(spotifyData.spotifyHistory || [])
        
        // Fetch favorite genres
        const genresResponse = await fetch(`/api/media/favorite-genres?userId=${userId}`)
        if (!genresResponse.ok) throw new Error('Failed to fetch favorite genres')
        const genresData = await genresResponse.json()
        setFavoriteGenres(genresData.favoriteGenres || [])
        
        // Fetch recommended events
        const eventsResponse = await fetch(`/api/media/recommended-events?userId=${userId}`)
        if (!eventsResponse.ok) throw new Error('Failed to fetch recommended events')
        const eventsData = await eventsResponse.json()
        setRecommendedEvents(eventsData.recommendedEvents || [])
        
        // Fetch recommended merchandise
        const merchandiseResponse = await fetch(`/api/media/recommended-merchandise?userId=${userId}`)
        if (!merchandiseResponse.ok) throw new Error('Failed to fetch recommended merchandise')
        const merchandiseData = await merchandiseResponse.json()
        setRecommendedMerchandise(merchandiseData.recommendedMerchandise || [])
      } catch (err) {
        setError(err.message)
        console.error('Error fetching media data:', err)
        
        // Set fallback data for demo
        setNetflixHistory([
          {
            id: "n1",
            title: "Stranger Things",
            type: "series",
            genre: ["Sci-Fi", "Horror", "Drama"],
            date: new Date("2025-01-15").toISOString(),
            duration: 50
          },
          {
            id: "n3",
            title: "Hamilton",
            type: "movie",
            genre: ["Musical", "Drama", "History"],
            date: new Date("2025-02-01").toISOString(),
            duration: 160
          }
        ])
        
        setSpotifyHistory([
          {
            id: "s1",
            title: "Bohemian Rhapsody",
            trackName: "Bohemian Rhapsody",
            artist: "Queen",
            genre: ["Rock", "Classic Rock"],
            date: new Date("2025-02-15").toISOString(),
            duration: 6
          },
          {
            id: "s3",
            title: "Alexander Hamilton",
            trackName: "Alexander Hamilton",
            artist: "Hamilton Original Broadway Cast",
            genre: ["Broadway", "Musical", "Rap"],
            date: new Date("2025-02-17").toISOString(),
            duration: 4
          }
        ])
        
        setFavoriteGenres(["Musical", "Rock", "Drama", "Sci-Fi", "Classic Rock"])
        
        setRecommendedEvents([
          {
            id: "e1",
            title: "Queen + Adam Lambert - The Rhapsody Tour",
            type: "concert",
            performers: ["Queen", "Adam Lambert"],
            venue: "Madison Square Garden, New York",
            date: new Date("2025-04-15").toISOString(),
            price: 120,
            genres: ["Rock", "Classic Rock"],
            description: "Experience the legendary music of Queen performed by Adam Lambert and original band members Brian May and Roger Taylor."
          },
          {
            id: "e2",
            title: "Hamilton - Broadway Musical",
            type: "musical",
            performers: ["Broadway Cast"],
            venue: "Richard Rodgers Theatre, New York",
            date: new Date("2025-04-20").toISOString(),
            price: 250,
            genres: ["Musical", "Broadway", "Historical"],
            description: "The story of America's Founding Father Alexander Hamilton, an immigrant from the West Indies who became George Washington's right-hand man during the Revolutionary War."
          }
        ])
        
        setRecommendedMerchandise([
          {
            id: "m1",
            title: "Stranger Things Demogorgon Figurine",
            type: "figurine",
            description: "Detailed collectible figurine of the Demogorgon from Stranger Things. Perfect for fans of the show!",
            price: 29.99
          },
          {
            id: "m2",
            title: "Hamilton Broadway Poster",
            type: "poster",
            description: "Official Broadway poster from the hit musical Hamilton. Signed by the original cast.",
            price: 49.99
          }
        ])
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchMediaData()
  }, [userId])

  // Handle ticket purchase
  const handleTicketPurchase = async (eventId: string) => {
    // In a real app, this would connect to a payment processor
    console.log(`Purchasing tickets for event: ${eventId}`)
    
    // Mock successful purchase
    return new Promise<void>(resolve => {
      setTimeout(() => {
        console.log(`Purchase completed for event: ${eventId}`)
        resolve()
      }, 1000)
    })
  }
  
  // Handle merchandise purchase
  const handleMerchandisePurchase = async (itemId: string) => {
    // In a real app, this would connect to a payment processor
    console.log(`Purchasing merchandise item: ${itemId}`)
    
    // Mock successful purchase
    return new Promise<void>(resolve => {
      setTimeout(() => {
        console.log(`Purchase completed for merchandise: ${itemId}`)
        resolve()
      }, 1000)
    })
  }

  if (isLoading) {
    return <div className="py-8 text-center">Loading entertainment data...</div>
  }

  if (error) {
    return <div className="py-8 text-center text-red-500">Error: {error}</div>
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MediaHistory 
          netflixHistory={netflixHistory} 
          spotifyHistory={spotifyHistory} 
        />
        <FavoriteGenres genres={favoriteGenres} />
      </div>
      
      <div className="mt-10">
        <RecommendedEvents 
          events={recommendedEvents} 
          title="Recommended Events Based on Your Watch & Listen History"
          onTicketPurchase={handleTicketPurchase}
        />
      </div>
      
      <div className="mt-10">
        <RecommendedMerchandise 
          items={recommendedMerchandise} 
          title="Merchandise You Might Like"
          onPurchase={handleMerchandisePurchase}
        />
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("insights")

  // Add a new tab for media recommendations
  const navigationTabs = [
    {
      id: "insights",
      label: "Insights",
      icon: <InsightIcon className="h-4 w-4" />,
    },
    {
      id: "deals",
      label: "Deals",
      icon: <GiftIcon className="h-4 w-4" />,
    },
    {
      id: "entertainment",
      label: "Entertainment",
      icon: <RecommendationIcon className="h-4 w-4" />,
    },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <Header user={user} />
      
      <main className="flex-1 bg-gray-50 pb-12">
        <div className="container mx-auto px-4 pt-8">
          {/* Welcome section */}
          <div className="mb-8 rounded-xl bg-primary px-8 py-10 text-white">
            <h1 className="mb-2 text-3xl font-semibold">Welcome back, {user.name}</h1>
            <p className="text-gray-300">Let's maximize your card benefits today</p>
            
            <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-xl bg-primary-light p-6 text-white">
                <h3 className="text-gray-300">Active Cards</h3>
                <p className="mt-2 text-4xl font-bold">2</p>
              </div>
              
              <div className="rounded-xl bg-primary-light p-6 text-white">
                <h3 className="text-gray-300">Recent Transactions</h3>
                <p className="mt-2 text-4xl font-bold">5</p>
              </div>
              
              <div className="rounded-xl bg-primary-light p-6 text-white">
                <h3 className="text-gray-300">Available Offers</h3>
                <p className="mt-2 text-4xl font-bold">4</p>
              </div>
            </div>
          </div>
          
          {/* Main content */}
          <div className="flex flex-col lg:flex-row lg:gap-8">
            {/* Left column */}
            <div className="flex-1">
              <div className="mb-8">
                <Tabs 
                  tabs={navigationTabs} 
                  activeTab={activeTab} 
                  onChange={setActiveTab} 
                />
              </div>
              
              {activeTab === "insights" && (
                <>
                  <div className="card mb-8 p-6">
                    <SpendingChart data={spendingData} />
                  </div>
                  
                  <div className="card p-6">
                    <TransactionsList transactions={transactions} />
                  </div>
                </>
              )}
              
              {activeTab === "deals" && (
                <div className="card p-6">
                  <DealsTab />
                </div>
              )}
              
              {activeTab === "entertainment" && (
                <div className="card p-6">
                  <EntertainmentTab />
                </div>
              )}
            </div>
            
            {/* Right column */}
            <div className="mt-8 w-full lg:mt-0 lg:w-96">
              <div className="card mb-8 p-6">
                <CardsList cards={cards} />
              </div>
              
              <div className="card p-6">
                <MonthlySummary data={monthlySummary} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 