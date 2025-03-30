import React from "react"

interface SpendingData {
  category: string
  amount: number
  color: string
}

export function SpendingChart({ data }: { data: SpendingData[] }) {
  // Find the maximum amount for scaling the chart
  const maxAmount = Math.max(...data.map((item) => item.amount))
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h2 className="text-xl font-medium">Spending Analysis</h2>
        <p className="text-sm text-gray-500">View your spending by category and time period</p>
      </div>
      
      <div className="h-64 space-y-4">
        <div className="flex justify-between px-2 text-xs text-gray-500">
          {Array.from({ length: 5 }).map((_, i) => {
            const value = Math.round(maxAmount - (i * (maxAmount / 4)))
            return <div key={i}>${value}</div>
          })}
        </div>
        
        <div className="relative flex h-52 items-end justify-around gap-6 p-2">
          {data.map((item) => {
            // Calculate height percentage based on amount relative to max
            const heightPercentage = (item.amount / maxAmount) * 100
            
            return (
              <div key={item.category} className="flex flex-1 flex-col items-center">
                <div 
                  className={`chart-bar w-full ${getCategoryBarClass(item.category)}`}
                  style={{ height: `${heightPercentage}%` }}
                />
                <div className="mt-2 text-center text-sm">
                  {item.category}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function getCategoryBarClass(category: string): string {
  switch (category.toLowerCase()) {
    case 'travel':
      return 'chart-bar-travel'
    case 'dining':
      return 'chart-bar-dining'
    case 'shopping':
      return 'chart-bar-shopping'
    default:
      return 'bg-gray-500'
  }
}

export function MonthlySummary({ 
  data: {
    totalSpent,
    topCategory,
    mostUsedCard,
    potentialSavings
  }
}: { 
  data: {
    totalSpent: number
    topCategory: string
    mostUsedCard: string
    potentialSavings: number
  }
}) {
  return (
    <div className="card p-6">
      <h2 className="mb-4 text-xl font-medium">Monthly Summary</h2>
      <p className="mb-6 text-sm text-gray-500">Your spending overview</p>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Total Spent</span>
          <span className="font-medium">${totalSpent.toFixed(2)}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Top Category</span>
          <span className="font-medium">{topCategory}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Most Used Card</span>
          <span className="font-medium">{mostUsedCard}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Potential Savings</span>
          <span className="font-medium text-success">${potentialSavings.toFixed(2)}</span>
        </div>
      </div>
    </div>
  )
} 