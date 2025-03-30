"use client"

import { useState } from "react"
import EventCard from "./event-card"

interface Event {
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

interface RecommendedEventsProps {
  events: Event[]
  title?: string
  onTicketPurchase?: (eventId: string) => Promise<void>
}

export function RecommendedEvents({ 
  events, 
  title = "Events Based on Your Media", 
  onTicketPurchase 
}: RecommendedEventsProps) {
  const [purchasedEventIds, setPurchasedEventIds] = useState<Set<string>>(new Set())

  const handlePurchase = async (eventId: string) => {
    if (!onTicketPurchase) return
    
    await onTicketPurchase(eventId)
    setPurchasedEventIds(prev => new Set([...prev, eventId]))
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-white">{title}</h3>
      
      {events.length === 0 ? (
        <p className="text-zinc-400">No recommended events found.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <EventCard 
              key={event.id} 
              event={event} 
              onTicketPurchase={handlePurchase}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default RecommendedEvents 