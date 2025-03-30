import React from "react"
import Link from "next/link"

interface CardDisplayProps {
  card: {
    id: string
    type: string
    name: string
    last4: string
    expires: string
    issuer: string
    color?: string
  }
}

export function CardDisplay({ card }: CardDisplayProps) {
  const bgColorClass = getBgColorClass(card.issuer)
  
  return (
    <div className={`relative rounded-xl ${bgColorClass} p-5 text-white shadow-md`}>
      <div className="mb-6 flex items-center justify-between">
        <span className="text-sm font-medium">{card.issuer}</span>
        <CardIcon className="h-6 w-6" />
      </div>

      <h3 className="mb-1 text-xl font-bold">{card.name}</h3>
      <div className="mb-8 flex items-baseline gap-1">
        <span className="text-sm opacity-80">••••</span>
        <span className="text-sm">{card.last4}</span>
      </div>
      
      <div className="absolute bottom-5 right-5 text-sm">
        Expires {card.expires}
      </div>
    </div>
  )
}

export function CardsList({ cards }: { cards: CardDisplayProps['card'][] }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-medium">Your Cards</h2>
        <span className="text-gray-500">Manage your connected payment cards</span>
      </div>
      
      <div className="space-y-4">
        {cards.map((card) => (
          <CardDisplay key={card.id} card={card} />
        ))}
        
        <Link 
          href="/add-card"
          className="flex items-center justify-center rounded-xl border-2 border-dashed border-gray-300 p-5 text-gray-500 hover:border-gray-400 hover:text-gray-700"
        >
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
              <PlusIcon className="h-5 w-5" />
            </div>
            <span className="font-medium">Connect a New Card</span>
          </div>
        </Link>
      </div>
    </div>
  )
}

function CardIcon(props: React.SVGProps<SVGSVGElement>) {
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

function PlusIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <line x1="12" x2="12" y1="5" y2="19" />
      <line x1="5" x2="19" y1="12" y2="12" />
    </svg>
  )
}

function getBgColorClass(issuer: string): string {
  switch (issuer.toLowerCase()) {
    case 'american express':
      return 'bg-blue-900'
    case 'chase':
      return 'bg-blue-600'
    case 'citi':
      return 'bg-indigo-700'
    case 'capital one':
      return 'bg-red-800'
    case 'discover':
      return 'bg-orange-600'
    default:
      return 'bg-gray-800'
  }
} 