"use client"

import { useState } from "react"

interface EventCardProps {
  event: {
    id: string
    title: string
    type: "concert" | "musical" | "show" | "movie"
    performers: string[]
    venue: string
    date: string
    price: number
    genres: string[]
    imageUrl?: string
    description: string
  }
  onTicketPurchase?: (eventId: string) => Promise<void>
}

export function EventCard({ event, onTicketPurchase }: EventCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isPurchased, setIsPurchased] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const eventDate = new Date(event.date)
  const isUpcoming = eventDate > new Date()

  const handlePurchase = async () => {
    if (!onTicketPurchase) return

    setIsLoading(true)
    setError(null)

    try {
      await onTicketPurchase(event.id)
      setIsPurchased(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to purchase tickets")
    } finally {
      setIsLoading(false)
    }
  }

  const getEventTypeIcon = () => {
    switch(event.type) {
      case "concert":
        return "🎵";
      case "musical":
        return "🎭";
      case "show":
        return "🎪";
      case "movie":
        return "🎬";
      default:
        return "🎟️";
    }
  }

  return (
    <div className="bg-zinc-800 rounded-lg overflow-hidden shadow-md">
      <div className="relative h-48 bg-zinc-700">
        {event.imageUrl ? (
          <img 
            src={event.imageUrl} 
            alt={event.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="h-full flex items-center justify-center">
            <span className="text-4xl">{getEventTypeIcon()}</span>
          </div>
        )}
        <div className="absolute top-2 right-2 bg-zinc-900 bg-opacity-75 px-2 py-1 rounded text-xs font-bold text-white">
          {event.type.toUpperCase()}
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex flex-wrap gap-2 mb-3">
          {event.genres.slice(0, 3).map((genre) => (
            <span
              key={genre}
              className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-zinc-700 text-zinc-200"
            >
              {genre}
            </span>
          ))}
        </div>

        <h3 className="text-lg font-medium text-white mb-1">{event.title}</h3>
        
        <div className="mb-3 text-sm text-zinc-300">
          <p className="mb-1">
            <span className="font-medium">Performers:</span> {event.performers.join(", ")}
          </p>
          <p className="mb-1">
            <span className="font-medium">Venue:</span> {event.venue}
          </p>
          <p>
            <span className="font-medium">Date:</span> {eventDate.toLocaleDateString(undefined, { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>

        <div className="mt-2 text-sm text-zinc-400">
          <p>{event.description}</p>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-lg font-bold text-white">${event.price.toFixed(2)}</span>
          
          <button
            type="button"
            onClick={handlePurchase}
            disabled={isLoading || isPurchased || !isUpcoming || !onTicketPurchase}
            className={`px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${
              isPurchased
                ? "bg-green-700"
                : !isUpcoming
                  ? "bg-zinc-700 text-zinc-500 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-500"
            } focus:outline-none`}
          >
            {isLoading 
              ? "Processing..." 
              : isPurchased 
                ? "Tickets Purchased" 
                : !isUpcoming 
                  ? "Event Passed" 
                  : "Get Tickets"}
          </button>
        </div>
        
        {error && (
          <p className="mt-2 text-sm text-red-500">{error}</p>
        )}
      </div>
    </div>
  )
}

export default EventCard 