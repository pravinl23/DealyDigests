import React from "react"

interface StatsCardProps {
  title: string
  value: string | number
  icon?: React.ReactNode
}

export function StatsCard({ title, value, icon }: StatsCardProps) {
  return (
    <div className="card p-6">
      <div className="flex justify-between">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        {icon && <div className="text-gray-400">{icon}</div>}
      </div>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
    </div>
  )
}

export function StatsCardGroup({ 
  stats 
}: { 
  stats: {
    title: string
    value: string | number
    icon?: React.ReactNode
  }[] 
}) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat, index) => (
        <StatsCard key={index} {...stat} />
      ))}
    </div>
  )
}

// Icon components for stats cards
export function CreditCardIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <line x1="2" x2="22" y1="10" y2="10" />
    </svg>
  )
}

export function ReceiptIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1Z" />
      <path d="M16 8h-6" />
      <path d="M16 12h-6" />
      <path d="M16 16h-6" />
    </svg>
  )
}

export function GiftIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="3" y="8" width="18" height="4" rx="1" />
      <path d="M12 8v13" />
      <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
      <path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5" />
    </svg>
  )
} 