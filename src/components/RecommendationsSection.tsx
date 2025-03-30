'use client'

import React from 'react'
import Image from 'next/image'
import { MusicIcon, PlayIcon, ShoppingCartIcon, TicketIcon } from 'lucide-react'

interface RecommendationsSectionProps {
  spotifyData?: any;
  netflixData?: any;
  amazonData?: any;
}

export default function RecommendationsSection({ 
  spotifyData,
  netflixData,
  amazonData
}: RecommendationsSectionProps) {
  // Check if data exists for each service
  const hasNetflixData = netflixData && !netflixData.error;
  const hasSpotifyData = spotifyData && !spotifyData.error;
  const hasAmazonData = amazonData && !amazonData.error;

  if (!hasNetflixData && !hasSpotifyData && !hasAmazonData) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-semibold mb-2">Recommendations</h2>
        <p className="text-gray-500">Connect services to get personalized recommendations.</p>
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
          {(!amazonData || amazonData.error) && (
            <div className="flex items-center rounded-full bg-orange-50 px-4 py-2 text-sm text-orange-600">
              <ShoppingCartIcon className="mr-2 h-4 w-4" />
              {amazonData?.error || "Amazon not connected"}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Recommendations For You</h2>
      
      <div className="space-y-6">
        {/* Media Recommendations */}
        {(hasNetflixData || hasSpotifyData) && (
          <div>
            <h3 className="text-lg font-medium mb-4">Entertainment Recommendations</h3>
            
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {/* Netflix Recommendations */}
              {hasNetflixData && netflixData.recommendations && netflixData.recommendations.slice(0, 2).map((item: any, index: number) => (
                <div key={`netflix-${index}`} className="rounded-lg border border-gray-100 overflow-hidden">
                  <div className="bg-red-50 p-3">
                    <div className="flex items-center">
                      <PlayIcon className="h-4 w-4 text-red-600 mr-2" />
                      <span className="text-sm font-medium">Netflix Recommendation</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="font-medium">{item.title}</p>
                    <p className="text-xs text-gray-500 mt-1">{item.type}</p>
                    <div className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded">
                      {item.reason}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Spotify Recommendations */}
              {hasSpotifyData && spotifyData.recommendations && spotifyData.recommendations.slice(0, 2).map((item: any, index: number) => (
                <div key={`spotify-${index}`} className="rounded-lg border border-gray-100 overflow-hidden">
                  <div className="bg-green-50 p-3">
                    <div className="flex items-center">
                      <MusicIcon className="h-4 w-4 text-green-600 mr-2" />
                      <span className="text-sm font-medium">Spotify Recommendation</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="font-medium">
                      {item.type === "track" ? item.name : item.type === "artist" ? item.name : item.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {item.type === "track" ? `Track by ${item.artist}` : 
                       item.type === "artist" ? "Artist" : "Playlist"}
                    </p>
                    <div className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded">
                      {item.similarity || item.description || "Based on your music preferences"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Product Recommendations */}
        {hasAmazonData && amazonData.recommendations && (
          <div>
            <h3 className="text-lg font-medium mb-4">Product Recommendations</h3>
            
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {amazonData.recommendations.slice(0, 3).map((item: any, index: number) => (
                <div key={`product-${index}`} className="rounded-lg border border-gray-100 overflow-hidden">
                  <div className="bg-orange-50 p-3">
                    <div className="flex items-center">
                      <ShoppingCartIcon className="h-4 w-4 text-orange-600 mr-2" />
                      <span className="text-sm font-medium">Amazon Recommendation</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-primary font-medium mt-1">${item.price.toFixed(2)}</p>
                    <div className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded">
                      {item.reason}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}