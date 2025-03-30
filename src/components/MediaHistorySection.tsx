'use client'

import React from 'react'
import { MusicIcon, PlayIcon } from 'lucide-react'
import Image from 'next/image'

interface MediaHistorySectionProps {
  spotifyData?: any;
  netflixData?: any;
}

export default function MediaHistorySection({ 
  spotifyData,
  netflixData
}: MediaHistorySectionProps) {
  // Check if data exists for each service
  const hasNetflixData = netflixData && !netflixData.error;
  const hasSpotifyData = spotifyData && !spotifyData.error;

  // Display when no services are connected
  if (!hasNetflixData && !hasSpotifyData) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-semibold mb-2">Media History</h2>
        <p className="text-gray-500">Connect Netflix or Spotify to see your viewing and listening history.</p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {(!netflixData || netflixData.error) && (
            <div className="flex items-center rounded-full bg-red-50 px-4 py-2 text-sm text-red-600">
              <PlayIcon className="mr-2 h-4 w-4" />
              {netflixData?.error || "Netflix not connected"}
            </div>
          )}
          {(!spotifyData || spotifyData.error) && (
            <div className="flex items-center rounded-full bg-green-50 px-4 py-2 text-sm text-green-600">
              <MusicIcon className="mr-2 h-4 w-4" />
              {spotifyData?.error || "Spotify not connected"}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Media History</h2>
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* Netflix History */}
        {hasNetflixData ? (
          <div className="space-y-4">
            <div className="flex items-center">
              <PlayIcon className="h-5 w-5 text-red-600 mr-2" />
              <h3 className="font-medium">Netflix History</h3>
            </div>
            
            <ul className="space-y-3">
              {netflixData.recentWatched.slice(0, 4).map((item: any) => (
                <li key={item.id} className="flex items-start p-3 rounded-lg border border-gray-100">
                  <div className="h-16 w-12 flex-shrink-0 rounded bg-gray-100">
                    {item.imageUrl && (
                      <Image 
                        src={item.imageUrl} 
                        alt={item.title} 
                        width={48} 
                        height={64} 
                        className="rounded object-cover h-16 w-12"
                      />
                    )}
                  </div>
                  <div className="ml-3 overflow-hidden">
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-gray-500">
                      {item.type === "series" 
                        ? `S${item.season} E${item.episode} · ${item.duration} mins` 
                        : `${item.duration} mins`}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Watched on {new Date(item.watchedAt).toLocaleDateString()}
                    </p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {item.genres.slice(0, 2).map((genre: string) => (
                        <span 
                          key={genre} 
                          className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-medium text-red-700"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-6 border border-gray-100 rounded-lg bg-gray-50 text-center">
            <PlayIcon className="h-8 w-8 text-gray-300 mb-2" />
            <h3 className="text-md font-medium">Netflix Not Connected</h3>
            <p className="text-sm text-gray-500 mt-1">
              Connect your Netflix account to see your watching history
            </p>
          </div>
        )}
        
        {/* Spotify History */}
        {hasSpotifyData ? (
          <div className="space-y-4">
            <div className="flex items-center">
              <MusicIcon className="h-5 w-5 text-green-500 mr-2" />
              <h3 className="font-medium">Spotify History</h3>
            </div>
            
            <ul className="space-y-3">
              {spotifyData.recentTracks.slice(0, 5).map((track: any) => (
                <li key={track.id} className="flex items-center p-3 rounded-lg border border-gray-100">
                  <div className="h-10 w-10 flex-shrink-0 rounded bg-gray-100">
                    {track.imageUrl && (
                      <Image 
                        src={track.imageUrl} 
                        alt={track.name} 
                        width={40} 
                        height={40} 
                        className="rounded"
                      />
                    )}
                  </div>
                  <div className="ml-3 overflow-hidden">
                    <p className="text-sm font-medium">{track.name}</p>
                    <p className="text-xs text-gray-500">{track.artist}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(track.playedAt).toLocaleDateString()}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-6 border border-gray-100 rounded-lg bg-gray-50 text-center">
            <MusicIcon className="h-8 w-8 text-gray-300 mb-2" />
            <h3 className="text-md font-medium">Spotify Not Connected</h3>
            <p className="text-sm text-gray-500 mt-1">
              Connect your Spotify account to see your listening history
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 