'use client'

import React, { useEffect, useState } from 'react'
import { Clock, VideoIcon, MusicIcon } from 'lucide-react'

interface NetflixItem {
  id: string
  title: string
  type: string
  genre: string[]
  watchDate: string
  duration: number
}

interface SpotifyItem {
  id: string
  trackName: string
  artist: string
  genre: string[]
  listenDate: string
  duration: number
}

export default function MediaHistorySection() {
  const [netflixHistory, setNetflixHistory] = useState<NetflixItem[]>([])
  const [spotifyHistory, setSpotifyHistory] = useState<SpotifyItem[]>([])
  const [activeTab, setActiveTab] = useState<'netflix' | 'spotify'>('netflix')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchMediaHistory = async () => {
      setIsLoading(true)
      try {
        // Simulate API fetch from mock data
        // In a real app, you would use fetch('/api/media/netflix?userId=1') etc.
        
        // For demo, we'll populate with some mock data directly
        const netflixData = [
          {
            id: "n1",
            title: "Stranger Things",
            type: "Series",
            genre: ["Sci-Fi", "Drama", "Horror"],
            watchDate: new Date("2025-03-25").toISOString(),
            duration: 50
          },
          {
            id: "n2",
            title: "The Queen's Gambit",
            type: "Series",
            genre: ["Drama"],
            watchDate: new Date("2025-03-20").toISOString(),
            duration: 60
          },
          {
            id: "n3",
            title: "Hamilton",
            type: "Musical",
            genre: ["Musical", "Drama", "Historical"],
            watchDate: new Date("2025-03-15").toISOString(),
            duration: 160
          },
          {
            id: "n4",
            title: "Black Mirror",
            type: "Series",
            genre: ["Sci-Fi", "Drama", "Thriller"],
            watchDate: new Date("2025-03-27").toISOString(),
            duration: 45
          },
          {
            id: "n5",
            title: "La La Land",
            type: "Movie",
            genre: ["Musical", "Romance", "Drama"],
            watchDate: new Date("2025-03-22").toISOString(),
            duration: 128
          }
        ]
        
        const spotifyData = [
          {
            id: "s1",
            trackName: "Bohemian Rhapsody",
            artist: "Queen",
            genre: ["Rock", "Classic Rock"],
            listenDate: new Date("2025-03-29").toISOString(),
            duration: 6
          },
          {
            id: "s2",
            trackName: "Welcome to the Black Parade",
            artist: "My Chemical Romance",
            genre: ["Rock", "Alternative", "Emo"],
            listenDate: new Date("2025-03-28").toISOString(),
            duration: 5
          },
          {
            id: "s3",
            trackName: "My Shot",
            artist: "Hamilton Cast",
            genre: ["Musical", "Broadway", "Rap"],
            listenDate: new Date("2025-03-26").toISOString(),
            duration: 5
          },
          {
            id: "s4",
            trackName: "City of Stars",
            artist: "Ryan Gosling & Emma Stone",
            genre: ["Soundtrack", "Jazz"],
            listenDate: new Date("2025-03-24").toISOString(),
            duration: 4
          },
          {
            id: "s5",
            trackName: "Running Up That Hill",
            artist: "Kate Bush",
            genre: ["Pop", "Alternative"],
            listenDate: new Date("2025-03-21").toISOString(),
            duration: 5
          }
        ]
        
        setNetflixHistory(netflixData)
        setSpotifyHistory(spotifyData)
      } catch (error) {
        console.error('Error fetching media history:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchMediaHistory()
  }, [])

  // Format date string to a readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
    }).format(date)
  }

  // Format duration from minutes to hours and minutes
  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`
    }
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return `${hours}h ${remainingMinutes > 0 ? `${remainingMinutes}m` : ''}`
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-primary">Your Media History</h2>
      
      <div className="border-b border-gray-200">
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveTab('netflix')}
            className={`flex items-center px-4 py-2 text-sm font-medium ${
              activeTab === 'netflix'
                ? 'border-b-2 border-primary text-primary'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <VideoIcon className="mr-2 h-4 w-4" />
            Netflix
          </button>
          <button
            onClick={() => setActiveTab('spotify')}
            className={`flex items-center px-4 py-2 text-sm font-medium ${
              activeTab === 'spotify'
                ? 'border-b-2 border-primary text-primary'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <MusicIcon className="mr-2 h-4 w-4" />
            Spotify
          </button>
        </div>
      </div>
      
      <div className="mt-4">
        {activeTab === 'netflix' && (
          <div className="space-y-4">
            <p className="text-gray-500">Your recent watches on Netflix:</p>
            
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse"></div>
                ))}
              </div>
            ) : (
              <div className="h-[400px] rounded-md border overflow-auto p-4">
                <div className="space-y-4 pr-4">
                  {netflixHistory.map((item) => (
                    <div key={item.id} className="border rounded-lg overflow-hidden flex">
                      <div className="w-3 bg-red-600"></div>
                      <div className="flex-1 p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{item.title}</h3>
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <span className="inline-block bg-gray-100 px-2 py-0.5 rounded-sm text-xs">
                                {item.type}
                              </span>
                              <span className="mx-1">•</span>
                              <Clock className="h-3 w-3" />
                              {formatDuration(item.duration)}
                            </div>
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatDate(item.watchDate)}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {item.genre.map((genre) => (
                            <span key={genre} className="bg-gray-100 px-2 py-0.5 rounded text-xs text-gray-600">
                              {genre}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {netflixHistory.length === 0 && (
                    <div className="text-center py-8">
                      <VideoIcon className="h-12 w-12 mx-auto opacity-20 mb-2" />
                      <h3 className="text-lg font-medium">No watch history</h3>
                      <p className="text-gray-500">Your recent Netflix watches will appear here</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'spotify' && (
          <div className="space-y-4">
            <p className="text-gray-500">Your recent listens on Spotify:</p>
            
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse"></div>
                ))}
              </div>
            ) : (
              <div className="h-[400px] rounded-md border overflow-auto p-4">
                <div className="space-y-4 pr-4">
                  {spotifyHistory.map((item) => (
                    <div key={item.id} className="border rounded-lg overflow-hidden flex">
                      <div className="w-3 bg-green-500"></div>
                      <div className="flex-1 p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{item.trackName}</h3>
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              {item.artist}
                              <span className="mx-1">•</span>
                              <Clock className="h-3 w-3" />
                              {item.duration}m
                            </div>
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatDate(item.listenDate)}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {item.genre.map((genre) => (
                            <span key={genre} className="bg-gray-100 px-2 py-0.5 rounded text-xs text-gray-600">
                              {genre}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {spotifyHistory.length === 0 && (
                    <div className="text-center py-8">
                      <MusicIcon className="h-12 w-12 mx-auto opacity-20 mb-2" />
                      <h3 className="text-lg font-medium">No listen history</h3>
                      <p className="text-gray-500">Your recent Spotify listens will appear here</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
} 