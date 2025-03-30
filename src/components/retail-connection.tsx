"use client"

import { useState } from "react"

interface RetailService {
  id: string
  name: string
  logo: string
  connected: boolean
  purchaseHistory?: {
    items: {
      name: string
      category: string
      purchaseDate: string
    }[]
  }
}

interface RetailConnectionProps {
  services: RetailService[]
  onConnect: (serviceId: string) => Promise<void>
}

export function RetailConnection({ services, onConnect }: RetailConnectionProps) {
  const [connecting, setConnecting] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [expandedService, setExpandedService] = useState<string | null>(null)

  const handleConnect = async (serviceId: string) => {
    try {
      setConnecting(serviceId)
      setError(null)
      await onConnect(serviceId)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect service")
    } finally {
      setConnecting(null)
    }
  }

  const toggleExpand = (serviceId: string) => {
    setExpandedService(expandedService === serviceId ? null : serviceId)
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold mb-4">Retail Connections</h2>
      <p className="text-gray-500 mb-6">Connect your retail accounts to get personalized recommendations based on your purchase history.</p>
      
      <div className="grid grid-cols-1 gap-4">
        {services.map((service) => (
          <div key={service.id} className="card p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-md bg-gray-100 flex items-center justify-center overflow-hidden">
                  {service.logo ? (
                    <img src={service.logo} alt={service.name} className="h-10 w-10 object-contain" />
                  ) : (
                    <span className="text-xl font-bold text-gray-400">{service.name.charAt(0)}</span>
                  )}
                </div>
                <div>
                  <h3 className="font-medium">{service.name}</h3>
                  <p className="text-sm text-gray-500">
                    {service.connected ? "Connected" : "Not connected"}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {service.connected && (
                  <button
                    type="button"
                    onClick={() => toggleExpand(service.id)}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    {expandedService === service.id ? "Hide history" : "View history"}
                  </button>
                )}
                
                <button
                  onClick={() => handleConnect(service.id)}
                  disabled={connecting === service.id || service.connected}
                  className={`rounded-lg px-3 py-1.5 text-sm ${
                    service.connected
                      ? "bg-green-100 text-green-700"
                      : "bg-primary text-white hover:bg-primary-light"
                  }`}
                >
                  {connecting === service.id
                    ? "Connecting..."
                    : service.connected
                    ? "Connected"
                    : "Connect"}
                </button>
              </div>
            </div>
            
            {expandedService === service.id && service.purchaseHistory && (
              <div className="mt-4 border-t pt-4">
                <h4 className="text-sm font-medium mb-2">Recent Purchases</h4>
                {service.purchaseHistory.items.length > 0 ? (
                  <ul className="space-y-2">
                    {service.purchaseHistory.items.map((item, index) => (
                      <li key={index} className="text-sm bg-gray-50 p-2 rounded">
                        <span className="font-medium">{item.name}</span>
                        <span className="text-gray-500 text-xs"> • {item.category} • {new Date(item.purchaseDate).toLocaleDateString()}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">No recent purchases found.</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      
      {error && (
        <div className="mt-4 text-sm text-red-500">{error}</div>
      )}
    </div>
  )
}

export default RetailConnection 