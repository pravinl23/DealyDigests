"use client"

import { useState } from "react"

interface MediaItem {
  id: string
  title: string
  type?: string
  genre: string[]
  date: string
  duration: number
}

interface NetflixItem extends MediaItem {
  type: "movie" | "series"
}

interface SpotifyItem extends MediaItem {
  artist: string
  trackName: string
}

interface MediaHistoryProps {
  netflixHistory: NetflixItem[]
  spotifyHistory: SpotifyItem[]
}

export function MediaHistory({ netflixHistory, spotifyHistory }: MediaHistoryProps) {
  const [activeTab, setActiveTab] = useState<"netflix" | "spotify">("netflix")

  return (
    <div className="bg-zinc-800 rounded-lg p-4">
      <div className="flex border-b border-zinc-700 mb-4">
        <button
          onClick={() => setActiveTab("netflix")}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === "netflix"
              ? "text-white border-b-2 border-indigo-500"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          Netflix
        </button>
        <button
          onClick={() => setActiveTab("spotify")}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === "spotify"
              ? "text-white border-b-2 border-indigo-500"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          Spotify
        </button>
      </div>

      {activeTab === "netflix" ? (
        <div>
          <h3 className="text-lg font-medium text-white mb-4">Recent Netflix Watch History</h3>
          
          {netflixHistory.length === 0 ? (
            <p className="text-zinc-400">No Netflix history found.</p>
          ) : (
            <ul className="space-y-3">
              {netflixHistory.map((item) => (
                <li key={item.id} className="bg-zinc-700 rounded-lg p-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-white font-medium">{item.title}</h4>
                      <p className="text-xs text-zinc-400">
                        {item.type.charAt(0).toUpperCase() + item.type.slice(1)} • {item.genre.join(", ")}
                      </p>
                    </div>
                    <div className="text-xs text-zinc-400">
                      {new Date(item.date).toLocaleDateString()} • {item.duration} min
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <div>
          <h3 className="text-lg font-medium text-white mb-4">Recent Spotify Listen History</h3>
          
          {spotifyHistory.length === 0 ? (
            <p className="text-zinc-400">No Spotify history found.</p>
          ) : (
            <ul className="space-y-3">
              {spotifyHistory.map((item) => (
                <li key={item.id} className="bg-zinc-700 rounded-lg p-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-white font-medium">{item.trackName}</h4>
                      <p className="text-xs text-zinc-400">
                        {item.artist} • {item.genre.join(", ")}
                      </p>
                    </div>
                    <div className="text-xs text-zinc-400">
                      {new Date(item.date).toLocaleDateString()} • {item.duration} min
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

export default MediaHistory 