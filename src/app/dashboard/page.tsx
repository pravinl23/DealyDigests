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
import { 
  MusicIcon, 
  LinkIcon, 
  ShoppingCartIcon, 
  CarIcon, 
  TruckIcon,
  PlayIcon,
  BarChart4Icon,
  TimerIcon,
  CalendarIcon
} from "lucide-react";
import KnotLink from "@/components/knot-link";
import Image from "next/image";

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

interface ConnectedCompany {
  merchant: string;
  connection_id: string;
  connected_at: string;
}

// Add interfaces for service data
interface ServiceData {
  spotify?: {
    recentTracks?: Array<{
      id: string;
      name: string;
      artist: string;
      imageUrl?: string;
      playedAt: string;
    }>;
    topGenres?: string[];
  };
  netflix?: {
    recentWatched?: Array<{
      id: string;
      title: string;
      type: string;
      season?: string;
      episode?: string;
      duration?: string;
      watchedAt: string;
      imageUrl?: string;
      genres: string[];
    }>;
  };
  doordash?: {
    recentOrders?: Array<{
      id: string;
      restaurant: string;
      items: string[];
      total: number;
      date: string;
      rating?: number;
    }>;
  };
  uber?: {
    recentRides?: Array<{
      id: string;
      from: string;
      to: string;
      date: string;
      cost: number;
    }>;
  };
  amazon?: {
    recentOrders?: Array<{
      id: string;
      date: string;
      total: number;
      items?: Array<{
        id: string;
        name: string;
        price: number;
      }>;
    }>;
  };
  [key: string]: any;
}

interface ConnectedServicesData {
  spotify?: any;
  netflix?: any;
  doordash?: any;
  uber?: any;
  amazon?: any;
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
  const [connectedCompanies, setConnectedCompanies] = useState<ConnectedCompany[]>([]);
  const [serviceData, setServiceData] = useState<ServiceData>({});
  const [isServiceDataLoading, setIsServiceDataLoading] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/api/auth/login?returnTo=/dashboard");
    }
  }, [user, isLoading, router]);

  // Fetch connected companies
  const fetchConnectedCompanies = async () => {
    if (!user) return;
    
    try {
      const response = await fetch('/api/knot/connected-companies');
      const data = await response.json();
      if (data.success) {
        setConnectedCompanies(data.connected_companies || []);
      }
    } catch (error) {
      console.error('Error fetching connected companies:', error);
    }
  };

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

  // Add a new function to fetch service data
  const fetchServiceData = async () => {
    if (!user) return;
    
    setIsServiceDataLoading(true);
    try {
      const response = await fetch('/api/media/service-data');
      const data = await response.json();
      if (data.success) {
        setServiceData(data.data);
      }
    } catch (error) {
      console.error('Error fetching service data:', error);
    } finally {
      setIsServiceDataLoading(false);
    }
  };

  // Update the useEffect to fetch service data when user is authenticated
  useEffect(() => {
    if (user) {
      fetchConnectedCompanies();
      fetchTransactions();
      fetchServiceData();
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
      description: "Use your Chase Sapphire Reserve for dining purchases and earn 5% back.",
      category: "dining",
      expiryDate: "2025-06-30",
      cardName: "Chase Sapphire Reserve",
      imageUrl: "/images/dining.jpg",
      discountValue: "5%",
      specialTerms: "Valid at select restaurants only. Maximum cash back of $50 per month.",
      isLimited: false,
      isNewOffer: true,
    },
    {
      id: "deal2",
      title: "$50 off $200+ at United Airlines",
      description: "Book a flight with your Chase Sapphire Reserve and get $50 off.",
      category: "travel",
      expiryDate: "2025-05-15",
      cardName: "Chase Sapphire Reserve",
      imageUrl: "/images/travel.jpg",
      discountValue: "$50",
      specialTerms: "Valid for flights booked directly with United Airlines. Minimum purchase of $200.",
      isLimited: true,
      isNewOffer: false,
    },
    {
      id: "deal3",
      title: "10% Back at Amazon",
      description: "Limited time offer: Get 10% back on Amazon purchases with your Freedom Unlimited card.",
      category: "shopping",
      expiryDate: "2025-04-30",
      cardName: "Freedom Unlimited",
      imageUrl: "/images/shopping.jpg",
      discountValue: "10%",
      specialTerms: "Maximum cash back of $30. Valid for purchases made directly on Amazon.com.",
      isLimited: true,
      isNewOffer: true,
    },
    {
      id: "deal4",
      title: "3 Months Free Disney+",
      description: "Subscribe to Disney+ and get 3 months free when you pay with your Chase card.",
      category: "entertainment",
      expiryDate: "2025-07-31",
      cardName: "Any Chase Card",
      imageUrl: "/images/streaming.jpg",
      discountValue: "3 months",
      specialTerms: "New Disney+ subscribers only. Subscription will auto-renew after free period.",
      isLimited: false,
      isNewOffer: true,
    },
    {
      id: "deal5",
      title: "2x Points at Gas Stations",
      description: "Earn double points on all gas station purchases this month.",
      category: "travel",
      expiryDate: "2025-04-30",
      cardName: "Freedom Unlimited",
      imageUrl: "/images/gas.jpg",
      discountValue: "2x",
      specialTerms: "Automatic enrollment. Points awarded within 2 billing cycles.",
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
      description: "Buy one concert ticket and get one free at participating venues.",
      category: "entertainment",
      expiryDate: "2025-08-31",
      cardName: "Any Chase Card",
      imageUrl: "/images/concert.jpg",
      discountValue: "BOGO",
      specialTerms: "Available at select venues only. Limit one free ticket per cardholder.",
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
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  // Filter deals by category
  const filteredDeals = dealsCategory === "all" 
    ? deals 
    : deals.filter(deal => deal.category === dealsCategory);

  // Check if accounts are connected
  const hasConnectedAccounts = connectedCompanies.length > 0;

  // Show empty state if no accounts connected
  if (!hasConnectedAccounts) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Welcome to Your Dashboard</h1>
        
        <div className="mb-8 rounded-xl bg-white p-8 shadow-lg">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-blue-50 text-primary">
              <LinkIcon className="h-10 w-10" />
            </div>
            
            <h2 className="mb-2 text-xl font-semibold text-gray-900">No Connected Accounts</h2>
            
            <p className="mb-6 max-w-md text-gray-600">
              Connect your favorite services to get personalized recommendations and insights based on your usage patterns.
            </p>
            
            <div className="mb-10 w-full max-w-lg rounded-lg bg-blue-50 p-6">
              <h3 className="mb-3 text-lg font-medium text-gray-900">Popular Services to Connect:</h3>
              
              <div className="mb-6 flex flex-wrap justify-center gap-4">
                <ServiceLogo name="DoorDash" />
                <ServiceLogo name="Spotify" />
                <ServiceLogo name="Netflix" />
                <ServiceLogo name="Uber" />
                <ServiceLogo name="Amazon" />
              </div>
              
              <KnotLink />
            </div>
            
            <div className="mt-4 text-sm text-gray-500">
              <p>We use Knot's secure API to connect to your accounts without storing your credentials.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Dashboard</h1>

      <Tabs tabs={navigationTabs} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === "insights" && (
        <div className="space-y-6 mt-6">
          {/* Connected Services */}
          <div className="rounded-xl bg-white p-6 shadow-md">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Connected Services</h2>
              <KnotLink />
            </div>
            
            <div className="flex flex-wrap gap-3">
              {connectedCompanies.map((company) => (
                <div 
                  key={company.connection_id} 
                  className="flex items-center rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-primary"
                >
                  {company.merchant}
                  <span className="ml-2 text-xs text-gray-500">
                    {new Date(company.connected_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Service Data Overview */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {isServiceDataLoading ? (
              <div className="col-span-full flex justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
              </div>
            ) : (
              <>
                {/* Spotify Section */}
                {serviceData.spotify && (
                  <div className="col-span-1 rounded-xl bg-white p-6 shadow-md">
                    <div className="mb-4 flex items-center">
                      <MusicIcon className="mr-2 h-5 w-5 text-green-500" />
                      <h2 className="text-lg font-semibold">Spotify Activity</h2>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium text-gray-500">Recently Played</h3>
                      <ul className="space-y-3">
                        {serviceData.spotify.recentTracks?.slice(0, 3)?.map((track: any) => (
                          <li key={track.id} className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0 rounded bg-gray-100">
                              {track.imageUrl && (
                                <Image 
                                  src={track.imageUrl} 
                                  alt={track.name} 
                                  width={40} 
                                  height={40} 
                                  className="rounded"
                                />
                              )}
                            </div>
                            <div className="ml-3 overflow-hidden">
                              <p className="truncate text-sm font-medium">{track.name}</p>
                              <p className="truncate text-xs text-gray-500">{track.artist}</p>
                            </div>
                          </li>
                        ))}
                        {!serviceData.spotify.recentTracks?.length && (
                          <li className="text-sm text-gray-500">No recent tracks found</li>
                        )}
                      </ul>
                      
                      <div>
                        <h3 className="mb-2 text-sm font-medium text-gray-500">Top Genres</h3>
                        <div className="flex flex-wrap gap-2">
                          {serviceData.spotify.topGenres?.slice(0, 3)?.map((genre: string) => (
                            <span 
                              key={genre} 
                              className="rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700"
                            >
                              {genre}
                            </span>
                          ))}
                          {!serviceData.spotify.topGenres?.length && (
                            <span className="text-sm text-gray-500">No genres found</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Netflix Section */}
                {serviceData.netflix && (
                  <div className="col-span-1 rounded-xl bg-white p-6 shadow-md">
                    <div className="mb-4 flex items-center">
                      <PlayIcon className="mr-2 h-5 w-5 text-red-600" />
                      <h2 className="text-lg font-semibold">Netflix Activity</h2>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium text-gray-500">Recently Watched</h3>
                      <ul className="space-y-3">
                        {serviceData.netflix.recentWatched?.slice(0, 2)?.map((item: any) => (
                          <li key={item.id} className="flex items-start">
                            <div className="h-14 w-10 flex-shrink-0 rounded bg-gray-100">
                              {item.imageUrl && (
                                <Image 
                                  src={item.imageUrl} 
                                  alt={item.title} 
                                  width={40} 
                                  height={56} 
                                  className="rounded object-cover"
                                />
                              )}
                            </div>
                            <div className="ml-3 overflow-hidden">
                              <p className="truncate text-sm font-medium">{item.title}</p>
                              <p className="truncate text-xs text-gray-500">
                                {item.type === "series" 
                                  ? `S${item.season} E${item.episode}` 
                                  : `${item.duration} mins`}
                              </p>
                              <div className="mt-1 flex flex-wrap gap-1">
                                {item.genres?.slice(0, 2)?.map((genre: string) => (
                                  <span 
                                    key={genre} 
                                    className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-medium text-red-700"
                                  >
                                    {genre}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </li>
                        ))}
                        {!serviceData.netflix.recentWatched?.length && (
                          <li className="text-sm text-gray-500">No recent watches found</li>
                        )}
                      </ul>
                    </div>
                  </div>
                )}

                {/* DoorDash Section */}
                {serviceData.doordash && (
                  <div className="col-span-1 rounded-xl bg-white p-6 shadow-md">
                    <div className="mb-4 flex items-center">
                      <TruckIcon className="mr-2 h-5 w-5 text-red-500" />
                      <h2 className="text-lg font-semibold">DoorDash Activity</h2>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium text-gray-500">Recent Orders</h3>
                      <ul className="space-y-3">
                        {serviceData.doordash.recentOrders?.slice(0, 2)?.map((order: any) => (
                          <li key={order.id} className="rounded-lg border border-gray-100 p-3">
                            <div className="flex items-center justify-between">
                              <p className="font-medium">{order.restaurant}</p>
                              <p className="text-sm font-medium">${order.total.toFixed(2)}</p>
                            </div>
                            <p className="mt-1 text-xs text-gray-500">
                              {order.items?.join(", ")}
                            </p>
                            <div className="mt-2 flex items-center justify-between">
                              <p className="text-xs text-gray-500">
                                {new Date(order.date).toLocaleDateString()}
                              </p>
                              <div className="flex items-center">
                                {[...Array(order.rating || 0)].map((_, i) => (
                                  <span key={i} className="text-xs text-yellow-400">★</span>
                                ))}
                              </div>
                            </div>
                          </li>
                        ))}
                        {!serviceData.doordash.recentOrders?.length && (
                          <li className="text-sm text-gray-500">No recent orders found</li>
                        )}
                      </ul>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
          
          {/* Activity Feed */}
          <div className="rounded-xl bg-white p-6 shadow-md">
            <h2 className="mb-4 text-lg font-semibold">Recent Activity</h2>
            
            <div className="space-y-4">
              {isServiceDataLoading ? (
                <div className="flex justify-center py-12">
                  <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute bottom-0 left-4 top-0 w-0.5 bg-gray-200"></div>
                  
                  <ul className="space-y-6">
                    {serviceData.spotify?.recentTracks?.[0] && (
                      <ActivityItem 
                        icon={<MusicIcon className="h-4 w-4 text-green-500" />}
                        title="Listened to Spotify"
                        description={`${serviceData.spotify.recentTracks[0].name} by ${serviceData.spotify.recentTracks[0].artist}`}
                        time={serviceData.spotify.recentTracks[0].playedAt}
                      />
                    )}
                    
                    {serviceData.netflix?.recentWatched?.[0] && (
                      <ActivityItem 
                        icon={<PlayIcon className="h-4 w-4 text-red-600" />}
                        title="Watched on Netflix"
                        description={serviceData.netflix.recentWatched[0].title}
                        time={serviceData.netflix.recentWatched[0].watchedAt}
                      />
                    )}
                    
                    {serviceData.doordash?.recentOrders?.[0] && (
                      <ActivityItem 
                        icon={<TruckIcon className="h-4 w-4 text-red-500" />}
                        title="Ordered from DoorDash"
                        description={`${serviceData.doordash.recentOrders[0].restaurant} - $${serviceData.doordash.recentOrders[0].total.toFixed(2)}`}
                        time={serviceData.doordash.recentOrders[0].date}
                      />
                    )}
                    
                    {serviceData.uber?.recentRides?.[0] && (
                      <ActivityItem 
                        icon={<CarIcon className="h-4 w-4 text-black" />}
                        title="Took an Uber"
                        description={`From ${serviceData.uber.recentRides[0].from} to ${serviceData.uber.recentRides[0].to}`}
                        time={serviceData.uber.recentRides[0].date}
                      />
                    )}
                    
                    {serviceData.amazon?.recentOrders?.[0] && (
                      <ActivityItem 
                        icon={<ShoppingCartIcon className="h-4 w-4 text-orange-500" />}
                        title="Ordered from Amazon"
                        description={`${serviceData.amazon.recentOrders[0].items?.map((i: any) => i.name).join(", ") || "Order placed"}`}
                        time={serviceData.amazon.recentOrders[0].date}
                      />
                    )}
                    
                    {!serviceData.spotify?.recentTracks?.[0] && 
                     !serviceData.netflix?.recentWatched?.[0] && 
                     !serviceData.doordash?.recentOrders?.[0] && 
                     !serviceData.uber?.recentRides?.[0] && 
                     !serviceData.amazon?.recentOrders?.[0] && (
                      <li className="ml-8 text-gray-500">No recent activity found</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>
          
          {/* Cards & Transactions Section */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-xl bg-white p-6 shadow-md">
              <h2 className="mb-4 text-lg font-semibold">Your Cards</h2>
              <CardsList cards={cards} />
            </div>
            
            <div className="rounded-xl bg-white p-6 shadow-md">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Recent Transactions</h2>
                <button
                  onClick={() => setIsAddingTransaction(!isAddingTransaction)}
                  className="rounded bg-primary px-3 py-1 text-sm text-white hover:bg-primary-dark"
                >
                  {isAddingTransaction ? "Cancel" : "Add"}
                </button>
              </div>
              
              {isAddingTransaction && (
                <div className="mb-6 rounded-lg border border-gray-200 p-4">
                  <h3 className="mb-3 text-sm font-medium">Add Transaction</h3>
                  <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="grid gap-3 md:grid-cols-2">
                      <input
                        type="text"
                        name="merchant"
                        value={formData.merchant}
                        onChange={handleFormChange}
                        placeholder="Merchant"
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                      />
                      
                      <input
                        type="number"
                        name="amount"
                        value={formData.amount}
                        onChange={handleFormChange}
                        placeholder="Amount"
                        step="0.01"
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                      />
                      
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleFormChange}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                      >
                        <option value="Dining">Dining</option>
                        <option value="Travel">Travel</option>
                        <option value="Shopping">Shopping</option>
                        <option value="Entertainment">Entertainment</option>
                        <option value="Groceries">Groceries</option>
                      </select>
                      
                      <input
                        type="text"
                        name="description"
                        value={formData.description}
                        onChange={handleFormChange}
                        placeholder="Description (optional)"
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                      />
                    </div>
                    
                    <button
                      type="submit"
                      className="w-full rounded-md bg-primary py-2 text-sm font-medium text-white hover:bg-primary-dark"
                    >
                      Save Transaction
                    </button>
                  </form>
                </div>
              )}
              
              {isDataLoading ? (
                <div className="flex justify-center py-12">
                  <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
                </div>
              ) : (
                <TransactionsList transactions={transactions.slice(0, 5)} />
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "deals" && (
        <div className="mt-6">
          <div className="card p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-primary">Available Deals</h2>
              <span className="bg-primary text-white text-sm px-3 py-1 rounded-full">
                {filteredDeals.length} Offers
              </span>
            </div>
            
            <p className="text-gray-600">
              Exclusive offers and discounts based on your spending patterns and card benefits.
            </p>

            {/* Categories */}
            <div className="flex flex-wrap gap-2">
              {dealCategories.map((category) => (
                <button 
                  key={category.id}
                  onClick={() => setDealsCategory(category.id)}
                  className={`px-3 py-1 text-sm rounded-full ${
                    dealsCategory === category.id
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>

            {/* Deals grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredDeals.map((deal) => (
                <div key={deal.id} className="border rounded-lg overflow-hidden bg-white hover:shadow-md transition-shadow">
                  <div className="p-4 border-b">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{deal.title}</h3>
                        <p className="text-sm text-gray-500">{deal.cardName}</p>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="font-bold text-primary text-xl">{deal.discountValue}</span>
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
                    <p className="text-sm text-gray-600 mb-3">{deal.description}</p>
                    
                    <div className="flex justify-between items-center text-xs text-gray-500 mb-4">
                      <div className="flex items-center">
                        <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1"></span>
                        Active
                      </div>
                      <div>
                        Expires: {formatDate(deal.expiryDate)}
                      </div>
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
                <h3 className="text-lg font-medium">No deals available</h3>
                <p className="text-gray-500">No deals match your current filter</p>
                <button 
                  onClick={() => setDealsCategory("all")}
                  className="mt-3 px-3 py-1 bg-primary text-white rounded-md hover:bg-primary-dark"
                >
                  Show all deals
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "entertainment" && (
        <div className="mt-6">
          <div className="rounded-xl bg-white p-6 shadow-md">
            <div className="space-y-8">
              <MediaHistorySection 
                spotifyData={serviceData.spotify} 
                netflixData={serviceData.netflix} 
              />
              <RecommendationsSection 
                spotifyData={serviceData.spotify} 
                netflixData={serviceData.netflix} 
                amazonData={serviceData.amazon}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ServiceLogo({ name }: { name: string }) {
  return (
    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white p-3 shadow-sm">
      <div className="text-center text-sm font-medium text-gray-700">{name}</div>
    </div>
  );
}

// Add a new component for activity items
function ActivityItem({ 
  icon, 
  title, 
  description, 
  time 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
  time: string; 
}) {
  const timeSince = (date: string) => {
    const now = new Date();
    const then = new Date(date);
    const secondsAgo = Math.floor((now.getTime() - then.getTime()) / 1000);
    
    if (secondsAgo < 60) return 'Just now';
    if (secondsAgo < 3600) return `${Math.floor(secondsAgo / 60)}m ago`;
    if (secondsAgo < 86400) return `${Math.floor(secondsAgo / 3600)}h ago`;
    return `${Math.floor(secondsAgo / 86400)}d ago`;
  };
  
  return (
    <li className="ml-6 relative">
      <div className="absolute -left-10 mt-1.5 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gray-50">
        {icon}
      </div>
      
      <div className="rounded-lg border border-gray-100 bg-white p-3 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">{title}</h3>
          <span className="text-xs text-gray-500">{timeSince(time)}</span>
        </div>
        <p className="mt-1 text-sm text-gray-600">{description}</p>
      </div>
    </li>
  );
}
