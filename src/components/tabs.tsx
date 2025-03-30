import React from "react"
import { ChartBarIcon, ShoppingBagIcon, MusicIcon } from "lucide-react"

interface Tab {
  id: string
  label: string
  icon?: React.ReactNode
}

interface TabsProps {
  tabs: Tab[]
  activeTab: string
  onChange: (id: string) => void
}

export function Tabs({ tabs, activeTab, onChange }: TabsProps) {
  return (
    <div className="flex space-x-1 border-b border-gray-200">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`flex items-center px-4 py-2 text-sm font-medium transition-colors
            ${
              activeTab === tab.id
                ? "border-b-2 border-primary text-primary"
                : "text-gray-500 hover:text-gray-700"
            }
          `}
        >
          {tab.icon && <span className="mr-2">{tab.icon}</span>}
          {tab.label}
        </button>
      ))}
    </div>
  )
}

// Icon components for tabs
export function InsightIcon({ className }: { className?: string }) {
  return <ChartBarIcon className={className} />
}

export function RecommendationIcon({ className }: { className?: string }) {
  return <ShoppingBagIcon className={className} />
}

export function EntertainmentIcon({ className }: { className?: string }) {
  return <MusicIcon className={className} />
} 