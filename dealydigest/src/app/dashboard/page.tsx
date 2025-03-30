"use client"

import React from "react"
import { useEffect, useState } from "react"
import Layout from "@/components/layout"
import { mockDb } from "@/lib/mock-data"
import BankConnection from "@/components/bank-connection"
import DealCard from "@/components/deal-card"
import { Icons } from "@/components/icons"

// For the preview, we'll use a fixed user ID
const userId = "1" // Demo user ID

// Tab components
const DashboardTab = ({ stats, topMerchants, isLoading }) => {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-xl bg-zinc-800 p-4">
          <div className="text-sm text-zinc-400">Total Transactions</div>
          <div className="text-2xl font-bold text-white">
            {isLoading ? (
              <div className="h-8 w-16 animate-pulse rounded bg-zinc-700" />
            ) : (
              stats.total_transactions
            )}
          </div>
        </div>
        <div className="rounded-xl bg-zinc-800 p-4">
          <div className="text-sm text-zinc-400">Recent Transactions</div>
          <div className="text-2xl font-bold text-white">
            {isLoading ? (
              <div className="h-8 w-16 animate-pulse rounded bg-zinc-700" />
            ) : (
              stats.recent_transactions
            )}
          </div>
        </div>
        <div className="rounded-xl bg-zinc-800 p-4">
          <div className="text-sm text-zinc-400">Merchants</div>
          <div className="text-2xl font-bold text-white">
            {isLoading ? (
              <div className="h-8 w-16 animate-pulse rounded bg-zinc-700" />
            ) : (
              stats.merchants
            )}
          </div>
        </div>
        <div className="rounded-xl bg-zinc-800 p-4">
          <div className="text-sm text-zinc-400">Total Spent</div>
          <div className="text-2xl font-bold text-white">
            {isLoading ? (
              <div className="h-8 w-16 animate-pulse rounded bg-zinc-700" />
            ) : (
              `$${stats.total_spent}`
            )}
          </div>
        </div>
      </div>

      {/* Top Spending Insights */}
      <div className="rounded-xl bg-zinc-800 p-6">
        <h3 className="mb-4 text-lg font-medium text-white">Top Spending Insights</h3>
        <div className="space-y-3">
          <div>
            <h4 className="mb-2 text-sm text-zinc-400">Top Merchants</h4>
            <div className="flex flex-wrap gap-2">
              {isLoading ? (
                Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <div
                      key={i}
                      className="h-8 w-24 animate-pulse rounded-full bg-zinc-700"
                    />
                  ))
              ) : (
                topMerchants.map((merchant) => (
                  <div
                    key={merchant}
                    className="rounded-full bg-zinc-700 px-3 py-1 text-sm text-white"
                  >
                    {merchant}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const DealsTab = ({ recommendedDeals, isLoading }) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-white">Recommended Deals</h3>
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array(3)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="h-64 animate-pulse rounded-xl bg-zinc-800"
              />
            ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {recommendedDeals.map((deal) => (
            <DealCard key={deal.id} deal={deal} />
          ))}
        </div>
      )}
    </div>
  )
}

const EntertainmentTab = ({ entertainmentEvents, mediaStats, isLoading }) => {
  return (
    <div className="space-y-6">
      {/* Media Stats */}
      <div className="rounded-xl bg-zinc-800 p-6">
        <h3 className="mb-4 text-lg font-medium text-white">Your Media Preferences</h3>
        
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <h4 className="text-sm text-zinc-400">Recently Watched</h4>
            {isLoading ? (
              <div className="h-24 animate-pulse rounded bg-zinc-700" />
            ) : (
              <div className="space-y-2">
                {mediaStats.netflix.slice(0, 3).map((item) => (
                  <div key={item.id} className="flex items-center gap-2 rounded-lg bg-zinc-900 p-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded bg-red-600">
                      <Icons.play className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">{item.title}</div>
                      <div className="text-xs text-zinc-400">{item.type === "movie" ? "Movie" : "Series"}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <h4 className="text-sm text-zinc-400">Recently Played</h4>
            {isLoading ? (
              <div className="h-24 animate-pulse rounded bg-zinc-700" />
            ) : (
              <div className="space-y-2">
                {mediaStats.spotify.slice(0, 3).map((item) => (
                  <div key={item.id} className="flex items-center gap-2 rounded-lg bg-zinc-900 p-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded bg-green-600">
                      <Icons.music className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">{item.trackName}</div>
                      <div className="text-xs text-zinc-400">{item.artist}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div>
          <h4 className="mb-2 text-sm text-zinc-400">Your Favorite Genres</h4>
          <div className="flex flex-wrap gap-2">
            {isLoading ? (
              Array(5).fill(0).map((_, i) => (
                <div key={i} className="h-8 w-20 animate-pulse rounded-full bg-zinc-700" />
              ))
            ) : (
              mediaStats.favoriteGenres.map((genre) => (
                <div key={genre} className="rounded-full bg-zinc-700 px-3 py-1 text-sm text-white">
                  {genre}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recommended Events */}
      <h3 className="text-lg font-medium text-white">Recommended Events</h3>
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="h-64 animate-pulse rounded-xl bg-zinc-800" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {entertainmentEvents.map((event) => (
            <div key={event.id} className="flex flex-col rounded-xl bg-zinc-800 p-4 transition-all hover:bg-zinc-700">
              <div className="mb-2 flex items-center justify-between">
                <div className="rounded-full bg-zinc-700 px-2 py-0.5 text-xs font-medium text-white">
                  {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                </div>
                <div className="text-sm font-medium text-white">${event.price}</div>
              </div>
              <h4 className="mb-1 text-lg font-medium text-white">{event.title}</h4>
              <p className="mb-2 text-sm text-zinc-400">{event.venue}</p>
              <p className="mb-4 text-xs text-zinc-500">{new Date(event.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</p>
              <p className="mb-3 line-clamp-2 text-sm text-zinc-400">{event.description}</p>
              <div className="mt-auto flex flex-wrap gap-1">
                {event.genres.map((genre) => (
                  <div key={genre} className="rounded-full bg-zinc-700 px-2 py-0.5 text-xs text-zinc-300">
                    {genre}
                  </div>
                ))}
              </div>
              <button className="mt-4 rounded-lg bg-blue-600 p-2 text-sm font-medium text-white transition-colors hover:bg-blue-700">
                Get Tickets
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const AccountsTab = ({ bankConnections, isLoading }) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-white">Your Accounts</h3>
      {isLoading ? (
        <div className="h-64 animate-pulse rounded-xl bg-zinc-800" />
      ) : bankConnections.length === 0 ? (
        <BankConnection />
      ) : (
        <div className="space-y-4">
          {bankConnections.map((connection) => (
            <div
              key={connection.id}
              className="flex flex-col rounded-xl bg-zinc-800 p-4 md:flex-row md:items-center md:justify-between"
            >
              <div className="mb-4 flex items-center md:mb-0">
                <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                  <Icons.creditCard className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-white">
                    {connection.institutionName}
                  </div>
                  <div className="text-xs text-zinc-400">
                    {connection.cardType} •••• {connection.last4}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="inline-flex items-center justify-center rounded-md border border-zinc-700 px-3 py-1.5 text-xs text-white hover:bg-zinc-700">
                  <Icons.refresh className="mr-1 h-3 w-3" /> Sync
                </button>
                <button className="inline-flex items-center justify-center rounded-md border border-zinc-700 px-3 py-1.5 text-xs text-white hover:bg-zinc-700">
                  <Icons.settings className="mr-1 h-3 w-3" /> Manage
                </button>
              </div>
            </div>
          ))}
          <BankConnection />
        </div>
      )}
    </div>
  )
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [stats, setStats] = useState({
    total_transactions: 0,
    recent_transactions: 0,
    merchants: 0,
    total_spent: "0.00",
  })
  const [topCategories, setTopCategories] = useState<string[]>([])
  const [topMerchants, setTopMerchants] = useState<string[]>([])
  const [bankConnections, setBankConnections] = useState([])
  const [recommendedDeals, setRecommendedDeals] = useState([])
  const [entertainmentEvents, setEntertainmentEvents] = useState([])
  const [mediaStats, setMediaStats] = useState({
    netflix: [],
    spotify: [],
    favoriteGenres: []
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load data from mock DB
    // In a real app, this would be API calls
    const user = mockDb.findUserById(userId)
    const connections = mockDb.findBankConnectionsByUserId(userId)
    const userStats = mockDb.getUserTransactionStats(userId)
    const categories = mockDb.getUserTopCategories(userId)
    const merchants = mockDb.getUserTopMerchants(userId)
    const deals = mockDb.getRecommendedDeals(userId, 6)
    const events = mockDb.getRecommendedEvents(userId)

    setBankConnections(connections)
    setStats(userStats)
    setTopCategories(categories)
    setTopMerchants(merchants)
    setRecommendedDeals(deals)
    setEntertainmentEvents(events)
    setMediaStats({
      netflix: mockDb.getUserNetflixHistory(userId),
      spotify: mockDb.getUserSpotifyHistory(userId),
      favoriteGenres: mockDb.getUserFavoriteGenres(userId)
    })
    setIsLoading(false)
  }, [])

  // Listen for tab changes from layout
  useEffect(() => {
    const handleTabChange = (e) => {
      if (e.detail && e.detail.tab) {
        setActiveTab(e.detail.tab)
      }
    }
    
    window.addEventListener('tabChange', handleTabChange)
    return () => window.removeEventListener('tabChange', handleTabChange)
  }, [])

  if (isLoading) {
    return (
      <Layout>
        <div className="animate-pulse p-8 space-y-6">
          <div className="h-8 bg-zinc-800 rounded w-1/4"></div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-zinc-800 rounded-lg p-6">
                <div className="h-4 bg-zinc-700 rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-zinc-700 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout initialTab={activeTab}>
      {activeTab === "dashboard" && (
        <DashboardTab 
          stats={stats} 
          topMerchants={topMerchants}
          isLoading={isLoading} 
        />
      )}
      {activeTab === "deals" && (
        <DealsTab 
          recommendedDeals={recommendedDeals} 
          isLoading={isLoading} 
        />
      )}
      {activeTab === "entertainment" && (
        <EntertainmentTab 
          entertainmentEvents={entertainmentEvents} 
          mediaStats={mediaStats}
          isLoading={isLoading} 
        />
      )}
      {activeTab === "accounts" && (
        <AccountsTab 
          bankConnections={bankConnections} 
          isLoading={isLoading} 
        />
      )}
    </Layout>
  )
} 