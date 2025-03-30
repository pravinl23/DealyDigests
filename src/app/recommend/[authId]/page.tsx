"use client";

import { useState } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { useParams } from 'next/navigation';

interface RecommendationResponse {
  cardName: string;
  last4: string;
  reason: string;
}

const containerStyle = {
  width: '100%',
  height: '400px'
};

const defaultCenter = {
  lat: 40.7128,
  lng: -74.0060
};

export default function RecommendPage() {
  const params = useParams();
  const encodedAuthId = params.authId as string;
  const authId = decodeURIComponent(encodedAuthId);
  
  const [selectedLocation, setSelectedLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [mcc, setMcc] = useState('');
  const [recommendation, setRecommendation] = useState<RecommendationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      setSelectedLocation({
        lat: e.latLng.lat(),
        lng: e.latLng.lng()
      });
    }
  };

  const handleSubmit = async () => {
    if (!selectedLocation) {
      setError('Please select a location on the map');
      return;
    }
    if (!mcc) {
      setError('Please enter an MCC code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/recommend-card', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          authId,
          latitude: selectedLocation.lat,
          longitude: selectedLocation.lng,
          mcc: mcc
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.details || 'Failed to get recommendation');
      }

      const data = await response.json();
      setRecommendation(data);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setRecommendation(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Card Recommendation</h1>
      
      <div className="mb-4">
        <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}>
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={defaultCenter}
            zoom={10}
            onClick={handleMapClick}
          >
            {selectedLocation && (
              <Marker position={selectedLocation} />
            )}
          </GoogleMap>
        </LoadScript>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">MCC Code</label>
        <input
          type="text"
          value={mcc}
          onChange={(e) => setMcc(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder="Enter MCC code"
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? 'Loading...' : 'Get Recommendation'}
      </button>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-red-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

      {recommendation && (
        <div className="mt-4 p-4 bg-green-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Recommendation</h2>
          <p><strong>Card:</strong> {recommendation.cardName}</p>
          <p><strong>Last 4:</strong> {recommendation.last4}</p>
          <p><strong>Reason:</strong> {recommendation.reason}</p>
        </div>
      )}
    </div>
  );
} 