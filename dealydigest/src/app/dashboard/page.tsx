"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { CardsList } from "@/components/card-display"
import { CreditCardIcon, ReceiptIcon, GiftIcon } from "@/components/stats-card"
import { SpendingChart, MonthlySummary } from "@/components/spending-chart"
import { TransactionsList } from "@/components/transactions-list"
import { Tabs, InsightIcon, ChartIcon, RecommendationIcon } from "@/components/tabs"

// Sample data for the dashboard
const user = {
  name: "Alex Johnson",
  email: "alex@example.com",
}

const cards = [
  {
    id: "1",
    type: "credit",
    name: "Black Card",
    last4: "1234",
    expires: "12/25",
    issuer: "American Express",
  },
  {
    id: "2",
    type: "credit",
    name: "Sapphire Reserve",
    last4: "5678",
    expires: "10/24",
    issuer: "Chase",
  },
]

const stats = [
  {
    title: "Active Cards",
    value: "2",
    icon: <CreditCardIcon className="h-5 w-5" />,
  },
  {
    title: "Recent Transactions",
    value: "5",
    icon: <ReceiptIcon className="h-5 w-5" />,
  },
  {
    title: "Available Offers",
    value: "4",
    icon: <GiftIcon className="h-5 w-5" />,
  },
]

const spendingData = [
  {
    category: "Travel",
    amount: 450,
    color: "blue",
  },
  {
    category: "Dining",
    amount: 225,
    color: "amber",
  },
  {
    category: "Shopping",
    amount: 175,
    color: "purple",
  },
]

const monthlySummary = {
  totalSpent: 739.54,
  topCategory: "Travel",
  mostUsedCard: "American Express",
  potentialSavings: 445.00,
}

const transactions = [
  {
    id: "1",
    merchant: "United Airlines",
    amount: 425.50,
    date: "2023-04-15",
    category: "Travel",
    cardName: "Black Card",
    cardIssuer: "American Express",
    cardLast4: "1234",
  },
  {
    id: "2",
    merchant: "Le Bernardin",
    amount: 85.75,
    date: "2023-04-22",
    category: "Dining",
    cardName: "Black Card",
    cardIssuer: "American Express",
    cardLast4: "1234",
  },
  {
    id: "3",
    merchant: "Amazon",
    amount: 120.99,
    date: "2023-04-23",
    category: "Shopping",
    cardName: "Sapphire Reserve",
    cardIssuer: "Chase",
    cardLast4: "5678",
  },
  {
    id: "4",
    merchant: "Uber",
    amount: 65.00,
    date: "2023-04-25",
    category: "Travel",
    cardName: "Sapphire Reserve",
    cardIssuer: "Chase",
    cardLast4: "5678",
  },
  {
    id: "5",
    merchant: "Starbucks",
    amount: 42.30,
    date: "2023-04-27",
    category: "Dining",
    cardName: "Black Card",
    cardIssuer: "American Express",
    cardLast4: "1234",
  },
]

const navigationTabs = [
  {
    id: "insights",
    label: "Insights",
    icon: <InsightIcon className="h-4 w-4" />,
  },
  {
    id: "spending",
    label: "Spending",
    icon: <ChartIcon className="h-4 w-4" />,
  },
  {
    id: "for-you",
    label: "For You",
    icon: <RecommendationIcon className="h-4 w-4" />,
  },
]

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("insights")

  return (
    <div className="flex min-h-screen flex-col">
      <Header user={user} />
      
      <main className="flex-1 bg-gray-50 pb-12">
        <div className="container mx-auto px-4 pt-8">
          {/* Welcome section */}
          <div className="mb-8 rounded-xl bg-primary px-8 py-10 text-white">
            <h1 className="mb-2 text-3xl font-semibold">Welcome back, {user.name}</h1>
            <p className="text-gray-300">Let's maximize your card benefits today</p>
            
            <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-xl bg-primary-light p-6 text-white">
                <h3 className="text-gray-300">Active Cards</h3>
                <p className="mt-2 text-4xl font-bold">2</p>
              </div>
              
              <div className="rounded-xl bg-primary-light p-6 text-white">
                <h3 className="text-gray-300">Recent Transactions</h3>
                <p className="mt-2 text-4xl font-bold">5</p>
              </div>
              
              <div className="rounded-xl bg-primary-light p-6 text-white">
                <h3 className="text-gray-300">Available Offers</h3>
                <p className="mt-2 text-4xl font-bold">4</p>
              </div>
            </div>
          </div>
          
          {/* Main content */}
          <div className="flex flex-col lg:flex-row lg:gap-8">
            {/* Left column */}
            <div className="flex-1">
              <div className="mb-8">
                <Tabs 
                  tabs={navigationTabs} 
                  activeTab={activeTab} 
                  onChange={setActiveTab} 
                />
              </div>
              
              <div className="card mb-8 p-6">
                <SpendingChart data={spendingData} />
              </div>
              
              <div className="card p-6">
                <TransactionsList transactions={transactions} />
              </div>
            </div>
            
            {/* Right column */}
            <div className="mt-8 w-full lg:mt-0 lg:w-96">
              <div className="space-y-8">
                <div>
                  <CardsList cards={cards} />
                </div>
                
                <MonthlySummary data={monthlySummary} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 