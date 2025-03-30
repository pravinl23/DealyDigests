import React from "react"

interface SpendingData {
  category: string
  amount: number
  color: string
}

export function SpendingChart({ data }: { data: SpendingData[] }) {
  // Find the maximum amount for scaling
  const maxAmount = Math.max(...data.map((item) => item.amount));

  // Y-axis labels for money values
  const yAxisLabels = [
    { value: maxAmount, label: `$${maxAmount}` },
    { value: maxAmount * 0.75, label: `$${Math.round(maxAmount * 0.75)}` },
    { value: maxAmount * 0.5, label: `$${Math.round(maxAmount * 0.5)}` },
    { value: maxAmount * 0.25, label: `$${Math.round(maxAmount * 0.25)}` },
    { value: 0, label: "$0" },
  ];

  return (
    <div className="flex flex-col space-y-6">
      <h3 className="text-lg font-medium">Spending Analysis</h3>
      
      <div className="flex space-x-4">
        {/* Y-axis labels */}
        <div className="flex flex-col justify-between pr-2 text-xs text-muted-foreground h-[350px]">
          {yAxisLabels.map((label, index) => (
            <span key={index}>{label.label}</span>
          ))}
        </div>
        
        {/* Chart content */}
        <div className="flex-1 flex items-end">
          <div className="w-full flex h-[350px] items-end">
            {data.map((item, index) => {
              // Calculate height percentage (minimum 1% to be visible)
              const heightPercentage = Math.max((item.amount / maxAmount) * 100, 1);
              
              return (
                <div key={index} className="flex-1 flex flex-col items-center justify-end h-full">
                  <div 
                    className={`chart-bar ${getCategoryBarClass(item.category)}`} 
                    style={{ 
                      height: `${heightPercentage}%`,
                      boxShadow: '0 -1px 3px rgba(0,0,0,0.1)'
                    }}
                  />
                  
                  {/* X-axis labels (categories) */}
                  <div className="pt-2 text-xs text-muted-foreground w-full text-center truncate px-1">
                    {item.category}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs">
        {data.map((item, index) => (
          <div key={index} className="flex items-center space-x-1">
            <div className={`w-3 h-3 rounded-sm ${getCategoryBarClass(item.category)}`} />
            <span>{item.category}: ${item.amount}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function getCategoryBarClass(category: string): string {
  switch (category.toLowerCase()) {
    case "travel":
      return "chart-bar-travel";
    case "dining":
      return "chart-bar-dining";
    case "shopping":
      return "chart-bar-shopping";
    case "groceries":
      return "chart-bar-groceries";
    case "entertainment":
      return "chart-bar-entertainment";
    default:
      return "chart-bar-other";
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