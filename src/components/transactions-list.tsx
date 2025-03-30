import React from "react"
import { ReceiptIcon, LinkIcon } from "lucide-react"
import Link from "next/link"

interface Transaction {
  id: string
  merchant: string
  amount: number
  date: string
  category: string
  cardName?: string
  cardIssuer?: string
  cardLast4?: string
  description?: string
}

export function TransactionsList({ 
  transactions, 
  error 
}: { 
  transactions: Transaction[],
  error?: string
}) {
  // Show empty state when there's an error or no transactions
  if (error || !transactions || transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <ReceiptIcon className="h-12 w-12 text-gray-300 mb-2" />
        <h3 className="text-lg font-medium">No Transactions</h3>
        <p className="text-sm text-gray-500 mb-4">
          {error ? error : "Connect your accounts to start tracking your transactions"}
        </p>
        <Link 
          href="/dashboard?connectAccounts=true" 
          className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white"
        >
          <LinkIcon className="mr-2 h-4 w-4" /> Connect Accounts
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {transactions.length > 0 && <h2 className="text-xl font-medium">Recent Transactions</h2>}
      
      <div className="space-y-3">
        {transactions.map((transaction) => (
          <TransactionItem key={transaction.id} transaction={transaction} />
        ))}
      </div>
    </div>
  )
}

function TransactionItem({ transaction }: { transaction: Transaction }) {
  const { icon, bgColor } = getCategoryDisplay(transaction.category)
  
  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-4">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${bgColor} text-white`}>
          {icon}
        </div>
        <div>
          <div className="font-medium">{transaction.merchant}</div>
          <div className="text-sm text-gray-500">
            {transaction.cardIssuer ? `${transaction.cardIssuer} ${transaction.cardName} • ` : ''}
            {formatRelativeTime(transaction.date)}
          </div>
        </div>
      </div>
      <div className="text-right">
        <div className="font-medium">${transaction.amount.toFixed(2)}</div>
        <div className="text-sm text-gray-500">{transaction.category}</div>
      </div>
    </div>
  )
}

function getCategoryDisplay(category: string) {
  switch (category.toLowerCase()) {
    case "travel":
      return {
        icon: <PlaneIcon className="h-5 w-5" />,
        bgColor: "bg-blue-500",
      }
    case "dining":
    case "food and dining":
      return {
        icon: <RestaurantIcon className="h-5 w-5" />,
        bgColor: "bg-amber-500",
      }
    case "shopping":
      return {
        icon: <ShoppingBagIcon className="h-5 w-5" />,
        bgColor: "bg-purple-500",
      }
    case "groceries":
      return {
        icon: <ShoppingBagIcon className="h-5 w-5" />,
        bgColor: "bg-green-500",
      }
    case "entertainment":
      return {
        icon: <EntertainmentIcon className="h-5 w-5" />,
        bgColor: "bg-pink-500",
      }
    case "transportation":
      return {
        icon: <TransportIcon className="h-5 w-5" />,
        bgColor: "bg-cyan-500",
      }
    default:
      return {
        icon: <CreditCardIcon className="h-5 w-5" />,
        bgColor: "bg-gray-500",
      }
  }
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays < 1) {
    return "today"
  } else if (diffDays === 1) {
    return "yesterday"
  } else if (diffDays < 7) {
    return `${diffDays} days ago`
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7)
    return `${weeks} ${weeks === 1 ? "week" : "weeks"} ago`
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30)
    return `${months} ${months === 1 ? "month" : "months"} ago`
  } else {
    const years = Math.floor(diffDays / 365)
    return `${years} ${years === 1 ? "year" : "years"} ago`
  }
}

// Icons
function PlaneIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 4 2 2 4 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
    </svg>
  )
}

function RestaurantIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
      <path d="M7 2v20" />
      <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
    </svg>
  )
}

function ShoppingBagIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  )
}

function CreditCardIcon(props: React.SVGProps<SVGSVGElement>) {
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

function EntertainmentIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="m7 2 10 5-10 5z" />
      <path d="M7 12 17 7 7 17Z" />
    </svg>
  )
}

function TransportIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="M5 17h14M5 17a4 4 0 0 1-4-4 4 4 0 0 1 4-4h14a4 4 0 0 1 4 4 4 4 0 0 1-4 4M5 9V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4" />
      <circle cx="8" cy="17" r="2" />
      <circle cx="16" cy="17" r="2" />
    </svg>
  )
} 