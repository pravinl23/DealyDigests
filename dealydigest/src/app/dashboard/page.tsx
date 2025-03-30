"use client";

import { useUser } from "@auth0/nextjs-auth0/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { InsightIcon, RecommendationIcon, EntertainmentIcon, Tabs } from "@/components/tabs";
import { SpendingChart } from "@/components/spending-chart";
import { TransactionsList } from "@/components/transactions-list";
import { CardsList } from "@/components/card-display";
import Link from "next/link";
import MediaHistorySection from "@/components/MediaHistorySection";
import RecommendationsSection from "@/components/RecommendationsSection";
import { MusicIcon } from "lucide-react";

// Sample data for the dashboard
const spendingData = [
  { category: "Travel", amount: 750, color: "bg-blue-500" },
  { category: "Dining", amount: 480, color: "bg-amber-500" },
  { category: "Shopping", amount: 350, color: "bg-purple-500" },
  { category: "Groceries", amount: 210, color: "bg-green-500" },
  { category: "Entertainment", amount: 180, color: "bg-pink-500" },
];

type TransactionCategory = "Travel" | "Dining" | "Shopping" | "Other";

const transactions = [
  {
    id: "tx1",
    merchant: "United Airlines",
    amount: 650.0,
    date: "2023-03-28T10:00:00",
    category: "Travel" as TransactionCategory,
    cardName: "Sapphire Reserve",
    cardIssuer: "Chase",
    cardLast4: "4567",
  },
  {
    id: "tx2",
    merchant: "Olive Garden",
    amount: 85.5,
    date: "2023-03-27T19:30:00",
    category: "Dining" as TransactionCategory,
    cardName: "Sapphire Reserve",
    cardIssuer: "Chase",
    cardLast4: "4567",
  },
  {
    id: "tx3",
    merchant: "Amazon",
    amount: 129.99,
    date: "2023-03-25T15:45:00",
    category: "Shopping" as TransactionCategory,
    cardName: "Freedom Unlimited",
    cardIssuer: "Chase",
    cardLast4: "8901",
  },
  {
    id: "tx4",
    merchant: "Walmart",
    amount: 76.25,
    date: "2023-03-24T12:30:00",
    category: "Shopping" as TransactionCategory,
    cardName: "Freedom Unlimited",
    cardIssuer: "Chase",
    cardLast4: "8901",
  },
  {
    id: "tx5",
    merchant: "Shell Gas Station",
    amount: 45.75,
    date: "2023-03-22T08:15:00",
    category: "Other" as TransactionCategory,
    cardName: "Freedom Unlimited",
    cardIssuer: "Chase",
    cardLast4: "8901",
  },
];

const cards = [
  {
    id: "card1",
    type: "credit",
    name: "Sapphire Reserve",
    last4: "4567",
    expires: "03/27",
    issuer: "Chase",
  },
  {
    id: "card2",
    type: "credit",
    name: "Freedom Unlimited",
    last4: "8901",
    expires: "05/26",
    issuer: "Chase",
  },
];

const monthlySummary = {
  totalSpent: 1580.5,
  topCategory: "Travel",
  mostUsedCard: "Chase Sapphire Reserve",
  potentialSavings: 120.25,
};

export default function DashboardPage() {
  const { user, error, isLoading } = useUser();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("insights");

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/api/auth/login?returnTo=/dashboard");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  if (!user) {
    return <div className="text-center py-10">Redirecting to login...</div>;
  }

  // Add a new tab for media recommendations
  const navigationTabs = [
    {
      id: "insights",
      label: "Insights",
      icon: <InsightIcon className="h-4 w-4" />,
    },
    {
      id: "deals",
      label: "Deals",
      icon: <RecommendationIcon className="h-4 w-4" />,
    },
    {
      id: "entertainment",
      label: "Entertainment",
      icon: <EntertainmentIcon className="h-4 w-4" />,
    },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 bg-gray-50 pb-12">
        <div className="container mx-auto px-4 pt-8">
          {/* Welcome section */}
          <div className="mb-8 rounded-xl bg-primary px-8 py-10 text-white">
            <h1 className="mb-2 text-3xl font-semibold">
              Welcome back, {user.name || user.email}
            </h1>
            <p className="text-gray-300">
              Let's maximize your card benefits today
            </p>

            <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-xl bg-primary-light p-6 text-white">
                <h3 className="text-gray-300">Active Cards</h3>
                <p className="mt-2 text-4xl font-bold">{cards.length}</p>
              </div>

              <div className="rounded-xl bg-primary-light p-6 text-white">
                <h3 className="text-gray-300">Recent Transactions</h3>
                <p className="mt-2 text-4xl font-bold">{transactions.length}</p>
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

              {activeTab === "insights" && (
                <>
                  <div className="card mb-8 p-6">
                    <SpendingChart data={spendingData} />
                  </div>

                  <div className="card p-6">
                    <TransactionsList transactions={transactions} />
                  </div>
                </>
              )}

              {activeTab === "deals" && (
                <div className="card p-6">
                  <div className="space-y-6">
                    <h2 className="text-xl font-medium">Available Deals</h2>
                    <p className="text-gray-600">
                      Your personalized deals will appear here based on your
                      spending patterns and card benefits.
                    </p>

                    <div className="space-y-4">
                      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                        <h3 className="mb-2 text-lg font-medium">
                          Earn 5% back on Chase Dining
                        </h3>
                        <p className="mb-4 text-gray-600">
                          Use your Chase Sapphire Reserve for dining purchases
                          and earn 5% back.
                        </p>
                        <Link
                          href="/deals/chase-dining"
                          className="text-primary hover:text-primary-dark"
                        >
                          View Details
                        </Link>
                      </div>

                      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                        <h3 className="mb-2 text-lg font-medium">
                          $50 off $200+ at United Airlines
                        </h3>
                        <p className="mb-4 text-gray-600">
                          Book a flight with your Chase Sapphire Reserve and get
                          $50 off.
                        </p>
                        <Link
                          href="/deals/united-discount"
                          className="text-primary hover:text-primary-dark"
                        >
                          View Details
                        </Link>
                      </div>

                      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                        <h3 className="mb-2 text-lg font-medium">
                          10% Back at Amazon
                        </h3>
                        <p className="mb-4 text-gray-600">
                          Limited time offer: Get 10% back on Amazon purchases
                          with your Freedom Unlimited card.
                        </p>
                        <Link
                          href="/deals/amazon-cashback"
                          className="text-primary hover:text-primary-dark"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "entertainment" && (
                <div className="card p-6">
                  <div className="space-y-8">
                    <MediaHistorySection />
                    <RecommendationsSection />
                  </div>
                </div>
              )}
            </div>

            {/* Right column */}
            <div className="mt-8 w-full lg:mt-0 lg:w-96">
              <div className="card mb-8 p-6">
                <CardsList cards={cards} />
              </div>

              <div className="card p-6">
                <h2 className="mb-6 text-xl font-medium">Monthly Summary</h2>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Spent:</span>
                    <span className="font-medium">
                      ${monthlySummary.totalSpent.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Top Category:</span>
                    <span className="font-medium">
                      {monthlySummary.topCategory}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Most Used Card:</span>
                    <span className="font-medium">
                      {monthlySummary.mostUsedCard}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Potential Savings:</span>
                    <span className="font-bold text-green-600">
                      ${monthlySummary.potentialSavings.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
