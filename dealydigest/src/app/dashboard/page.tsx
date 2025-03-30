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

// Define interfaces
interface SpendingData {
  category: string;
  amount: number;
  color: string;
}

interface Transaction {
  id: string;
  merchant: string;
  amount: number;
  date: string;
  category: string;
  description: string;
  cardName?: string;
  cardIssuer?: string;
  cardLast4?: string;
}

// Default cards data
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
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [spendingData, setSpendingData] = useState<SpendingData[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [isAddingTransaction, setIsAddingTransaction] = useState(false);
  const [formData, setFormData] = useState({
    merchant: "",
    amount: "",
    category: "Dining",
    description: "",
  });

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/api/auth/login?returnTo=/dashboard");
    }
  }, [user, isLoading, router]);

  // Fetch transactions and chart data
  const fetchTransactions = async () => {
    setIsDataLoading(true);
    try {
      const response = await fetch('/api/transactions');
      const data = await response.json();
      if (data.success) {
        setTransactions(data.transactions);
        setSpendingData(data.chartData);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setIsDataLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.merchant || !formData.amount) {
      alert("Please fill in merchant and amount");
      return;
    }
    
    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          merchant: formData.merchant,
          amount: parseFloat(formData.amount),
          category: formData.category,
          description: formData.description,
        }),
      });
      
      const data = await response.json();
      if (data.success) {
        // Clear form
        setFormData({
          merchant: "",
          amount: "",
          category: "Dining",
          description: "",
        });
        
        // Hide form
        setIsAddingTransaction(false);
        
        // Refresh transactions
        fetchTransactions();
      }
    } catch (error) {
      console.error('Error adding transaction:', error);
    }
  };

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
                    {isDataLoading ? (
                      <div className="flex items-center justify-center h-[350px]">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                      </div>
                    ) : (
                      <SpendingChart data={spendingData} />
                    )}
                  </div>

                  <div className="card p-6">
                    {isDataLoading ? (
                      <div className="flex items-center justify-center h-40">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between items-center mb-4">
                          <h2 className="text-xl font-medium">Recent Transactions</h2>
                          <button 
                            onClick={() => setIsAddingTransaction(!isAddingTransaction)}
                            className="px-3 py-1 bg-primary text-white rounded-md hover:bg-primary-dark"
                          >
                            {isAddingTransaction ? "Cancel" : "Add Transaction"}
                          </button>
                        </div>

                        {isAddingTransaction && (
                          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                            <h3 className="text-lg font-medium mb-3">Add New Transaction</h3>
                            <form onSubmit={handleSubmit} className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Merchant
                                </label>
                                <input
                                  type="text"
                                  name="merchant"
                                  value={formData.merchant}
                                  onChange={handleFormChange}
                                  className="w-full p-2 border border-gray-300 rounded-md"
                                  required
                                />
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Amount ($)
                                </label>
                                <input
                                  type="number"
                                  name="amount"
                                  value={formData.amount}
                                  onChange={handleFormChange}
                                  className="w-full p-2 border border-gray-300 rounded-md"
                                  step="0.01"
                                  min="0"
                                  required
                                />
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Category
                                </label>
                                <select
                                  name="category"
                                  value={formData.category}
                                  onChange={handleFormChange}
                                  className="w-full p-2 border border-gray-300 rounded-md"
                                >
                                  <option value="Dining">Dining</option>
                                  <option value="Travel">Travel</option>
                                  <option value="Shopping">Shopping</option>
                                  <option value="Groceries">Groceries</option>
                                  <option value="Entertainment">Entertainment</option>
                                  <option value="Transportation">Transportation</option>
                                  <option value="Other">Other</option>
                                </select>
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Description (Optional)
                                </label>
                                <textarea
                                  name="description"
                                  value={formData.description}
                                  onChange={handleFormChange}
                                  className="w-full p-2 border border-gray-300 rounded-md"
                                  rows={2}
                                />
                              </div>
                              
                              <button
                                type="submit"
                                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
                              >
                                Save Transaction
                              </button>
                            </form>
                          </div>
                        )}
                        
                        <TransactionsList transactions={transactions} />
                      </>
                    )}
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
