"use client";

import { useUser } from "@auth0/nextjs-auth0/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  InsightIcon,
  RecommendationIcon,
  EntertainmentIcon,
  Tabs,
} from "@/components/tabs";
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
  const [dealsCategory, setDealsCategory] = useState<string>("all");
  const [isDealsLoading, setIsDealsLoading] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/api/auth/login?returnTo=/dashboard");
    }
  }, [user, isLoading, router]);

  // Fetch transactions and chart data
  const fetchTransactions = async () => {
    setIsDataLoading(true);
    try {
      const response = await fetch("/api/transactions");
      const data = await response.json();
      if (data.success) {
        setTransactions(data.transactions);
        setSpendingData(data.chartData);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setIsDataLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user]);

  const handleFormChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.merchant || !formData.amount) {
      alert("Please fill in merchant and amount");
      return;
    }

    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
      console.error("Error adding transaction:", error);
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

  // Define deal categories
  const dealCategories = [
    { id: "all", label: "All Deals" },
    { id: "dining", label: "Dining" },
    { id: "travel", label: "Travel" },
    { id: "shopping", label: "Shopping" },
    { id: "entertainment", label: "Entertainment" },
  ];

  // Sample deals data
  const deals = [
    {
      id: "deal1",
      title: "Earn 5% back on Chase Dining",
      description:
        "Use your Chase Sapphire Reserve for dining purchases and earn 5% back.",
      category: "dining",
      expiryDate: "2025-06-30",
      cardName: "Chase Sapphire Reserve",
      imageUrl: "/images/dining.jpg",
      discountValue: "5%",
      specialTerms:
        "Valid at select restaurants only. Maximum cash back of $50 per month.",
      isLimited: false,
      isNewOffer: true,
    },
    {
      id: "deal2",
      title: "$50 off $200+ at United Airlines",
      description:
        "Book a flight with your Chase Sapphire Reserve and get $50 off.",
      category: "travel",
      expiryDate: "2025-05-15",
      cardName: "Chase Sapphire Reserve",
      imageUrl: "/images/travel.jpg",
      discountValue: "$50",
      specialTerms:
        "Valid for flights booked directly with United Airlines. Minimum purchase of $200.",
      isLimited: true,
      isNewOffer: false,
    },
    {
      id: "deal3",
      title: "10% Back at Amazon",
      description:
        "Limited time offer: Get 10% back on Amazon purchases with your Freedom Unlimited card.",
      category: "shopping",
      expiryDate: "2025-04-30",
      cardName: "Freedom Unlimited",
      imageUrl: "/images/shopping.jpg",
      discountValue: "10%",
      specialTerms:
        "Maximum cash back of $30. Valid for purchases made directly on Amazon.com.",
      isLimited: true,
      isNewOffer: true,
    },
    {
      id: "deal4",
      title: "3 Months Free Disney+",
      description:
        "Subscribe to Disney+ and get 3 months free when you pay with your Chase card.",
      category: "entertainment",
      expiryDate: "2025-07-31",
      cardName: "Any Chase Card",
      imageUrl: "/images/streaming.jpg",
      discountValue: "3 months",
      specialTerms:
        "New Disney+ subscribers only. Subscription will auto-renew after free period.",
      isLimited: false,
      isNewOffer: true,
    },
    {
      id: "deal5",
      title: "2x Points at Gas Stations",
      description:
        "Earn double points on all gas station purchases this month.",
      category: "travel",
      expiryDate: "2025-04-30",
      cardName: "Freedom Unlimited",
      imageUrl: "/images/gas.jpg",
      discountValue: "2x",
      specialTerms:
        "Automatic enrollment. Points awarded within 2 billing cycles.",
      isLimited: true,
      isNewOffer: false,
    },
    {
      id: "deal6",
      title: "15% Off at Whole Foods",
      description: "Get 15% off your entire purchase at Whole Foods Market.",
      category: "shopping",
      expiryDate: "2025-05-31",
      cardName: "Chase Sapphire Reserve",
      imageUrl: "/images/grocery.jpg",
      discountValue: "15%",
      specialTerms: "Maximum discount of $30. In-store purchases only.",
      isLimited: false,
      isNewOffer: true,
    },
    {
      id: "deal7",
      title: "Free Concert Ticket",
      description:
        "Buy one concert ticket and get one free at participating venues.",
      category: "entertainment",
      expiryDate: "2025-08-31",
      cardName: "Any Chase Card",
      imageUrl: "/images/concert.jpg",
      discountValue: "BOGO",
      specialTerms:
        "Available at select venues only. Limit one free ticket per cardholder.",
      isLimited: true,
      isNewOffer: false,
    },
    {
      id: "deal8",
      title: "20% Off at Cheesecake Factory",
      description: "Enjoy 20% off your bill at The Cheesecake Factory.",
      category: "dining",
      expiryDate: "2025-06-15",
      cardName: "Freedom Unlimited",
      imageUrl: "/images/restaurant.jpg",
      discountValue: "20%",
      specialTerms: "Dine-in only. Cannot be combined with other offers.",
      isLimited: false,
      isNewOffer: true,
    },
  ];

  // Format date string to a readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  // Filter deals by category
  const filteredDeals =
    dealsCategory === "all"
      ? deals
      : deals.filter((deal) => deal.category === dealsCategory);

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
                          <h2 className="text-xl font-medium">
                            Recent Transactions
                          </h2>
                          <button
                            onClick={() =>
                              setIsAddingTransaction(!isAddingTransaction)
                            }
                            className="px-3 py-1 bg-primary text-white rounded-md hover:bg-primary-dark"
                          >
                            {isAddingTransaction ? "Cancel" : "Add Transaction"}
                          </button>
                        </div>

                        {isAddingTransaction && (
                          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                            <h3 className="text-lg font-medium mb-3">
                              Add New Transaction
                            </h3>
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
                                  <option value="Entertainment">
                                    Entertainment
                                  </option>
                                  <option value="Transportation">
                                    Transportation
                                  </option>
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
                <div className="card p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-primary">
                      Available Deals
                    </h2>
                    <span className="bg-primary text-white text-sm px-3 py-1 rounded-full">
                      {filteredDeals.length} Offers
                    </span>
                  </div>

                  <p className="text-gray-600">
                    Exclusive offers and discounts based on your spending
                    patterns and card benefits.
                  </p>

                  {/* Categories */}
                  <div className="flex flex-wrap gap-2">
                    {dealCategories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setDealsCategory(category.id)}
                        className={`px-3 py-1 text-sm rounded-full ${
                          dealsCategory === category.id
                            ? "bg-primary text-white"
                            : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                        }`}
                      >
                        {category.label}
                      </button>
                    ))}
                  </div>

                  {/* Deals grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredDeals.map((deal) => (
                      <div
                        key={deal.id}
                        className="border rounded-lg overflow-hidden bg-white hover:shadow-md transition-shadow"
                      >
                        <div className="p-4 border-b">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-lg">
                                {deal.title}
                              </h3>
                              <p className="text-sm text-gray-500">
                                {deal.cardName}
                              </p>
                            </div>
                            <div className="flex flex-col items-end">
                              <span className="font-bold text-primary text-xl">
                                {deal.discountValue}
                              </span>
                              {deal.isNewOffer && (
                                <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full mt-1">
                                  New Offer
                                </span>
                              )}
                              {deal.isLimited && (
                                <span className="bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded-full mt-1">
                                  Limited Time
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="p-4">
                          <p className="text-sm text-gray-600 mb-3">
                            {deal.description}
                          </p>

                          <div className="flex justify-between items-center text-xs text-gray-500 mb-4">
                            <div className="flex items-center">
                              <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1"></span>
                              Active
                            </div>
                            <div>Expires: {formatDate(deal.expiryDate)}</div>
                          </div>

                          <div className="text-xs text-gray-500 mb-4 italic">
                            {deal.specialTerms}
                          </div>

                          <Link
                            href={`/deals/${deal.id}`}
                            className="block w-full bg-primary text-white rounded-lg text-center px-3 py-2 text-sm hover:bg-primary-dark transition-colors"
                          >
                            View Details
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>

                  {filteredDeals.length === 0 && (
                    <div className="text-center py-10 border border-gray-200 rounded-lg">
                      <RecommendationIcon className="h-12 w-12 mx-auto opacity-20 mb-2" />
                      <h3 className="text-lg font-medium">
                        No deals available
                      </h3>
                      <p className="text-gray-500">
                        No deals match your current filter
                      </p>
                      <button
                        onClick={() => setDealsCategory("all")}
                        className="mt-3 px-3 py-1 bg-primary text-white rounded-md hover:bg-primary-dark"
                      >
                        Show all deals
                      </button>
                    </div>
                  )}
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
