"use client";

import { useUser } from "@auth0/nextjs-auth0/client";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import {
  ChevronDown,
  Music,
  Video,
  ShoppingBag,
  X,
  Plus,
  Brain,
  BarChart2,
  PieChart,
  TrendingUp,
  Clock,
  CreditCard,
  DollarSign,
  Award,
} from "lucide-react";
import KnotScript from "@/components/knot-script";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";
import { CardsList } from "@/components/card-display";

// Types for Knot SDK
type Product = "card_switcher" | "transaction_link";

// Transaction form type
interface TransactionFormData {
  merchant: string;
  amount: number;
  category: string;
  card: string;
  date: string;
}

// Update deal type to include category
type Deal = {
  id: number;
  title: string;
  type: string;
  card: string;
  amount: string;
  expires: string;
  description: string;
  details: string;
  category: string;
};

// AI Insights types
interface AIInsights {
  spendingByCategory: Record<string, number>;
  spendingByMerchant: Record<string, number>;
  spendingByCard: Record<string, number>;
  timeUsageByService: Record<string, number>;
  timeUsageByContentType: Record<string, number>;
  totalSpending: number;
  totalHoursUsed: number;
  aiInsights: string;
  recommendations: string[];
  topMerchants: Array<{ name: string; amount: number }>;
  topCategories: Array<{ name: string; amount: number }>;
  monthlyTrend: Array<{ date: string; amount: number }>;
  aiScore: number;
}

export default function DashboardPage() {
  const { user, error, isLoading } = useUser();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("insights");
  const [selectedProduct, setSelectedProduct] =
    useState<Product>("card_switcher");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [knotError, setKnotError] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedMerchant, setSelectedMerchant] = useState<{
    id: number;
    name: string;
  }>({ id: 84, name: "Airbnb" });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [userCards, setUserCards] = useState<any[]>([]);
  const [cardsLoading, setCardsLoading] = useState(true);
  const [cardsError, setCardsError] = useState<string | null>(null);
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [sdkError, setSdkError] = useState<string | null>(null);
  const [connectedMerchants, setConnectedMerchants] = useState([
    { id: 13, name: "Spotify", connected: true },
    { id: 16, name: "Netflix", connected: true },
    { id: 19, name: "DoorDash", connected: true },
  ]);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [transactionForm, setTransactionForm] = useState<TransactionFormData>({
    merchant: "",
    amount: 0,
    category: "Dining",
    card: "",
    date: new Date().toISOString().split("T")[0],
  });
  const [activeDealsFilter, setActiveDealsFilter] = useState("all");
  const [dealsList, setDealsList] = useState<Deal[]>([]);
  const [transactionsList, setTransactionsList] = useState<any[]>([]);
  const [insights, setInsights] = useState<AIInsights>({
    spendingByCategory: {
      Dining: 450.75,
      Entertainment: 250.3,
      Shopping: 850.2,
      Travel: 1200.5,
    },
    spendingByMerchant: {
      Amazon: 450.25,
      Netflix: 15.99,
      Uber: 125.5,
      Starbucks: 85.4,
    },
    spendingByCard: {
      "Chase Sapphire Reserve": 1500.75,
      "Freedom Unlimited": 850.25,
    },
    timeUsageByService: {
      Netflix: 25.5,
      Spotify: 15.2,
      YouTube: 8.5,
    },
    timeUsageByContentType: {
      movies: 18.5,
      music: 15.2,
      series: 12.8,
    },
    totalSpending: 2950.45,
    totalHoursUsed: 49.2,
    aiInsights:
      "Based on your recent activity, you've shown a balanced approach to entertainment spending. Your streaming services usage aligns well with the subscription costs.",
    recommendations: [
      "Consider consolidating streaming subscriptions to maximize value",
      "Look into Chase Sapphire Reserve's entertainment rewards program",
      "Set up alerts for unusual entertainment spending patterns",
    ],
    topMerchants: [
      { name: "Amazon", amount: 450.25 },
      { name: "Netflix", amount: 15.99 },
      { name: "Uber", amount: 125.5 },
    ],
    topCategories: [
      { name: "Travel", amount: 1200.5 },
      { name: "Shopping", amount: 850.2 },
      { name: "Dining", amount: 450.75 },
    ],
    monthlyTrend: [
      { date: "2025-02-05", amount: 150 },
      { date: "2025-02-15", amount: 280 },
      { date: "2025-02-28", amount: 420 },
      { date: "2025-03-10", amount: 350 },
      { date: "2025-03-20", amount: 480 },
      { date: "2025-03-30", amount: 520 },
    ],
    aiScore: 94,
  });
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insightsError, setInsightsError] = useState<string | null>(null);
  const [activeInsightSection, setActiveInsightSection] =
    useState<string>("spending");

  // Entertainment tab state
  const [entertainmentFilter, setEntertainmentFilter] = useState("all");
  const [showMusicRecommendations, setShowMusicRecommendations] =
    useState(true);
  const [showEventsSection, setShowEventsSection] = useState(true);
  const [showMoviesSection, setShowMoviesSection] = useState(true);
  // Animation states
  const [isLoaded, setIsLoaded] = useState(false);
  // Content data
  const [musicHistory, setMusicHistory] = useState([
    {
      id: 1,
      title: "Blinding Lights",
      artist: "The Weeknd",
      album: "After Hours",
      date: "2025-03-30",
      playCount: 201000,
    },
    {
      id: 2,
      title: "Levitating",
      artist: "Dua Lipa",
      album: "Future Nostalgia",
      date: "2025-03-30",
      playCount: 203000,
    },
    {
      id: 3,
      title: "Save Your Tears",
      artist: "The Weeknd",
      album: "After Hours",
      date: "2025-03-29",
      playCount: 215000,
    },
  ]);
  const [videoHistory, setVideoHistory] = useState([
    {
      id: 1,
      title: "Stranger Things",
      season: "S4",
      episode: "E9",
      duration: "78 mins",
      date: "2025-03-29",
      genres: ["Sci-Fi", "Horror", "Drama"],
    },
    {
      id: 2,
      title: "Wednesday",
      season: "S1",
      episode: "E8",
      duration: "48 mins",
      date: "2025-03-27",
      genres: ["Comedy", "Fantasy", "Mystery"],
    },
    {
      id: 3,
      title: "Glass Onion: A Knives Out Mystery",
      duration: "139 mins",
      date: "2025-03-23",
      genres: [],
    },
  ]);

  // Sample connected services
  const connectedServices = [
    { id: 1, name: "American Airlines", date: "3/30/2025" },
    { id: 2, name: "Airbnb", date: "3/29/2025" },
  ];

  // Sample transactions
  const initialTransactions = [
    {
      id: 1,
      merchant: "Netflix",
      amount: 15.99,
      date: "2 days ago",
      card: "Chase Chase Sapphire Reserve",
      category: "Entertainment",
    },
    {
      id: 2,
      merchant: "Starbucks",
      amount: 7.35,
      date: "3 days ago",
      card: "Chase Freedom Unlimited",
      category: "Dining",
    },
    {
      id: 3,
      merchant: "Amazon",
      amount: 49.99,
      date: "5 days ago",
      card: "Chase Chase Sapphire Reserve",
      category: "Shopping",
    },
    {
      id: 4,
      merchant: "Uber",
      amount: 24.5,
      date: "1 week ago",
      card: "Chase Freedom Unlimited",
      category: "Travel",
    },
    {
      id: 5,
      merchant: "DoorDash",
      amount: 35.2,
      date: "yesterday",
      card: "Chase Chase Sapphire Reserve",
      category: "Dining",
    },
    {
      id: 6,
      merchant: "Whole Foods",
      amount: 82.47,
      date: "4 days ago",
      card: "Chase Freedom Unlimited",
      category: "Grocery",
    },
    {
      id: 7,
      merchant: "Apple",
      amount: 249.99,
      date: "1 week ago",
      card: "Chase Chase Sapphire Reserve",
      category: "Technology",
    },
    {
      id: 8,
      merchant: "Delta Airlines",
      amount: 450.0,
      date: "2 weeks ago",
      card: "Chase Chase Sapphire Reserve",
      category: "Travel",
    },
    {
      id: 9,
      merchant: "Target",
      amount: 67.32,
      date: "5 days ago",
      card: "Chase Freedom Unlimited",
      category: "Shopping",
    },
    {
      id: 10,
      merchant: "Cheesecake Factory",
      amount: 94.75,
      date: "3 days ago",
      card: "Chase Chase Sapphire Reserve",
      category: "Dining",
    },
  ];

  // Available merchants list
  const availableMerchants = [
    { id: 84, name: "Airbnb" },
    { id: 78, name: "American Airlines" },
    { id: 45, name: "Walmart" },
    { id: 44, name: "Amazon" },
    { id: 40, name: "Instacart" },
    { id: 36, name: "Uber Eats" },
    { id: 19, name: "DoorDash" },
    { id: 16, name: "Netflix" },
    { id: 13, name: "Spotify" },
    { id: 12, name: "Target" },
    { id: 10, name: "Uber" },
  ];

  // Sample deals for the deals tab
  const initialDeals = [
    {
      id: 1,
      title: "Earn 5% back on Chase Dining",
      type: "New Offer",
      card: "Chase Sapphire Reserve",
      amount: "5%",
      expires: "Jun 29, 2025",
      description:
        "Use your Chase Sapphire Reserve for dining purchases and earn 5% back.",
      details:
        "Valid at select restaurants only. Maximum cash back of $50 per month.",
      category: "dining",
    },
    {
      id: 2,
      title: "$50 off $200+ at United Airlines",
      type: "Limited Time",
      card: "Chase Sapphire Reserve",
      amount: "$50",
      expires: "May 14, 2025",
      description:
        "Book a flight with your Chase Sapphire Reserve and get $50 off.",
      details:
        "Valid for flights booked directly with United Airlines. Minimum purchase of $200.",
      category: "travel",
    },
    {
      id: 3,
      title: "10% Back at Amazon",
      type: "Limited Time",
      card: "Freedom Unlimited",
      amount: "10%",
      expires: "Apr 30, 2025",
      description:
        "Get 10% back on Amazon purchases with your Freedom Unlimited card.",
      details:
        "Maximum cash back of $30. Valid for purchases made directly on Amazon.com.",
      category: "shopping",
    },
    {
      id: 4,
      title: "3 Months Free Disney+",
      type: "New Offer",
      card: "Any Chase Card",
      amount: "3 months",
      expires: "May 31, 2025",
      description:
        "Subscribe to Disney+ and get 3 months free when you pay with your Chase card.",
      details:
        "New Disney+ subscribers only. After 3 months, standard subscription fee applies.",
      category: "entertainment",
    },
    {
      id: 5,
      title: "15% off at Best Buy",
      type: "Limited Time",
      card: "Freedom Unlimited",
      amount: "15%",
      expires: "Jun 15, 2025",
      description:
        "Shop at Best Buy with your Freedom Unlimited card and save 15%.",
      details: "Valid on purchases over $100. Maximum discount of $75.",
      category: "shopping",
    },
    {
      id: 6,
      title: "4X Points on Hotels",
      type: "New Offer",
      card: "Chase Sapphire Reserve",
      amount: "4X",
      expires: "Aug 31, 2025",
      description: "Earn 4X points when booking hotels through Chase Travel.",
      details: "Valid for bookings made directly through Chase Travel portal.",
      category: "travel",
    },
    {
      id: 7,
      title: "20% off at Chipotle",
      type: "New Offer",
      card: "Any Chase Card",
      amount: "20%",
      expires: "Jul 10, 2025",
      description:
        "Get 20% off your order at Chipotle when you pay with any Chase card.",
      details: "Valid for in-store and online orders. Maximum discount of $15.",
      category: "dining",
    },
    {
      id: 8,
      title: "2 Free Months of Spotify Premium",
      type: "Limited Time",
      card: "Chase Sapphire Reserve",
      amount: "2 months",
      expires: "Sep 15, 2025",
      description: "Subscribe to Spotify Premium and get 2 months free.",
      details:
        "New Spotify Premium subscribers only. After 2 months, standard subscription fee applies.",
      category: "entertainment",
    },
  ];

  // Sample deals categories for filtering
  const dealCategories = [
    "all",
    "dining",
    "travel",
    "shopping",
    "entertainment",
  ];

  // Function to fetch user cards
  const fetchUserCards = useCallback(async () => {
    try {
      setCardsLoading(true);
      setCardsError(null);

      const response = await fetch("/api/cards");

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const userData = await response.json();

      if (userData.credit_cards) {
        setUserCards(userData.credit_cards);
      } else {
        setUserCards([]);
      }
    } catch (err) {
      console.error("Error fetching user cards:", err);
      setCardsError("Failed to fetch cards. Please try again later.");
    } finally {
      setCardsLoading(false);
    }
  }, []);

  // Fetch initial data for the dashboard
  const fetchInitialData = () => {
    // Set some initial user cards if they don't exist
    if (userCards.length === 0) {
      setUserCards([
        {
          id: 1,
          name: "Chase Sapphire Reserve",
          lastFour: "4567",
          isPrimary: true,
        },
        {
          id: 2,
          name: "Chase Freedom Unlimited",
          lastFour: "8901",
          isPrimary: false,
        },
        {
          id: 3,
          name: "American Express Gold",
          lastFour: "2345",
          isPrimary: false,
        },
      ]);
      setCardsLoading(false);
    }

    // Generate some deals if they don't exist
    if (dealsList.length === 0) {
      const generatedDeals = Array(5)
        .fill(null)
        .map((_, i) => generateRandomDeal());
      setDealsList(generatedDeals);
    }
  };

  // Fetch dummy transactions for the dashboard
  const fetchDummyTransactions = () => {
    if (transactionsList.length === 0) {
      setTransactionsList(initialTransactions);
    }
  };

  useEffect(() => {
    if (!user && !isLoading) {
      router.push("/");
    }

    // Initial data loading
    fetchInitialData();
    fetchDummyTransactions();
    fetchInsights();
  }, [user, isLoading, router]);

  // Add animation load effect for entertainment tab
  useEffect(() => {
    if (activeTab === "entertainment") {
      // Set isLoaded to false first to trigger animations
      setIsLoaded(false);

      // Small delay to ensure animations trigger properly
      const timer = setTimeout(() => {
        setIsLoaded(true);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [activeTab]);

  // Handle click outside of dropdown
  useEffect(() => {
    // Existing function
  }, []);

  // Fetch user's credit cards
  useEffect(() => {
    if (user) {
      fetchUserCards();
    }
  }, [user, fetchUserCards]);

  // Create a session for Knot
  const createSession = useCallback(async () => {
    if (!user) {
      setKnotError("You must be logged in to connect with Knot");
      return null;
    }

    try {
      setLoading(true);
      setKnotError(null);

      // Get user ID from Auth0
      const userId = user.sub || user.id;
      console.log("Creating Knot session for user:", userId);

      const response = await fetch("/api/knot/create-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userId,
          product: selectedProduct,
        }),
      });

      const text = await response.text();
      let data;

      try {
        data = JSON.parse(text);
      } catch (parseError) {
        console.error("Error parsing response as JSON:", parseError);
        console.error("Raw response:", text);
        throw new Error(
          `Invalid JSON response from server: ${text.substring(0, 100)}`
        );
      }

      if (!response.ok) {
        console.error("Session creation failed:", response.status, data);
        throw new Error(
          `Failed to create Knot session: ${
            data.details || data.error || response.statusText
          }`
        );
      }

      const sessionId = data.session_id || data.session;
      if (!sessionId) {
        console.error("No session_id in response:", data);
        throw new Error("Session ID not found in response");
      }

      console.log("Received session ID:", sessionId);
      setSessionId(sessionId);
      return sessionId;
    } catch (err) {
      console.error("Error creating session:", err);
      setKnotError(
        "Failed to create session: " +
          (err instanceof Error ? err.message : String(err))
      );
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, selectedProduct]);

  // Handle SDK loading
  const handleSdkLoad = useCallback(() => {
    console.log("Knot SDK loaded successfully");
    setSdkLoaded(true);
    setSdkError(null);
  }, []);

  const handleSdkError = useCallback((error: Error) => {
    console.error("Error loading Knot SDK:", error);
    setSdkLoaded(false);
    setSdkError(`Failed to load Knot SDK: ${error.message}`);
  }, []);

  // Connect accounts with Knot
  const connectWithKnot = async () => {
    try {
      setLoading(true);
      setKnotError(null);

      if (!sdkLoaded) {
        setKnotError(
          "Knot SDK not loaded yet. Please wait a moment and try again."
        );
        setLoading(false);
        return;
      }

      // Create a session
      const sid = await createSession();
      if (!sid) {
        setLoading(false);
        return;
      }

      if (typeof window === "undefined" || !window.knotapi) {
        setKnotError(
          "Knot SDK not loaded. Please refresh the page and try again."
        );
        setLoading(false);
        return;
      }

      const clientId =
        process.env.NEXT_PUBLIC_KNOT_CLIENT_ID ||
        "310a12cb-54c0-4021-b683-3aa5bc38b718";

      console.log("Opening Knot with:", {
        sessionId: sid,
        clientId,
        merchantId: selectedMerchant.id,
        product: selectedProduct,
      });

      window.knotapi.open({
        sessionId: sid,
        clientId: clientId,
        environment: "development",
        product: selectedProduct,
        merchantIds: [selectedMerchant.id],
        entryPoint: "onboarding",
        companyName: "DealyDigest",
        useCategories: true,
        useSearch: true,
        onSuccess: (product: any, details: any) => {
          console.log("Knot success:", product, details);
          setLoading(false);
          // Refresh connected services and user cards data
          fetchUserCards();

          // Add the newly connected merchant to the list
          if (!connectedMerchants.some((m) => m.id === selectedMerchant.id)) {
            setConnectedMerchants((prev) => [
              ...prev,
              {
                id: selectedMerchant.id,
                name: selectedMerchant.name,
                connected: true,
              },
            ]);
          }

          // Show success toast or notification
          alert(
            `Successfully connected to ${
              details.merchantName || selectedMerchant.name
            }`
          );
        },
        onError: (product: any, errorCode: any, message: string) => {
          console.error("Knot Link error:", product, errorCode, message);
          setKnotError(`Error during Knot connection: ${message}`);
          setLoading(false);
        },
        onExit: () => {
          console.log("User exited Knot Link");
          setLoading(false);
        },
        onEvent: (product: any, event: any, merchant: any, payload: any) => {
          console.log("Knot event:", product, event, merchant, payload);

          // If there's a card update event, refresh the cards
          if (
            event === "CARD_UPDATED" ||
            event === "TRANSACTION_SYNC_COMPLETE"
          ) {
            fetchUserCards();
          }
        },
      });
    } catch (err) {
      console.error("Error opening Knot Link:", err);
      setKnotError(
        "Failed to open Knot Link: " +
          (err instanceof Error ? err.message : String(err))
      );
      setLoading(false);
    }
  };

  // Generate random content for newly connected merchant
  const generateRandomContentForMerchant = (merchantName: string) => {
    const types = [
      {
        type: "music",
        items: [
          "Blinding Lights",
          "Save Your Tears",
          "Levitating",
          "Stay",
          "Shivers",
          "Bad Habits",
        ],
      },
      {
        type: "movie",
        items: [
          "Stranger Things",
          "Wednesday",
          "The Crown",
          "Squid Game",
          "Ozark",
          "Money Heist",
        ],
      },
      {
        type: "order",
        items: [
          "Burger & Fries",
          "Pizza",
          "Chicken Wings",
          "Salad Bowl",
          "Sushi",
          "Tacos",
        ],
      },
      {
        type: "purchase",
        items: [
          "Echo Dot",
          "Kindle Paperwhite",
          "Airpods",
          "Wireless Charger",
          "Smart Bulbs",
          "Bluetooth Speaker",
        ],
      },
    ];

    const randomType = types[Math.floor(Math.random() * types.length)];
    return {
      type: randomType.type,
      items: randomType.items.slice(0, 3).map((item) => ({
        title: item,
        subtitle:
          randomType.type === "music"
            ? "The Weeknd"
            : randomType.type === "movie"
            ? "S1 E1"
            : "",
      })),
    };
  };

  // Render merchant activity tiles
  const renderMerchantActivityTiles = () => {
    if (activeTab !== "insights") return null;

    return (
      <div className="mt-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Spotify Activity */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Music className="h-5 w-5 text-green-500" />
              <h3 className="text-lg font-semibold">Spotify Activity</h3>
            </div>

            <div className="mb-4">
              <h4 className="text-gray-500 mb-3">Recently Played</h4>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-md"></div>
                  <div>
                    <div className="font-medium">Blinding Lights</div>
                    <div className="text-sm text-gray-500">The Weeknd</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-md"></div>
                  <div>
                    <div className="font-medium">Levitating</div>
                    <div className="text-sm text-gray-500">Dua Lipa</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-md"></div>
                  <div>
                    <div className="font-medium">Save Your Tears</div>
                    <div className="text-sm text-gray-500">The Weeknd</div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-gray-500 mb-2">Top Genres</h4>
              <div className="flex flex-wrap gap-2">
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                  pop
                </span>
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                  r&b
                </span>
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                  dance pop
                </span>
              </div>
            </div>
          </div>

          {/* Netflix Activity */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Video className="h-5 w-5 text-red-500" />
              <h3 className="text-lg font-semibold">Netflix Activity</h3>
            </div>

            <div>
              <h4 className="text-gray-500 mb-3">Recently Watched</h4>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-md flex items-center justify-center text-gray-400">
                    ?
                  </div>
                  <div>
                    <div className="font-medium">Stranger Things</div>
                    <div className="text-sm text-gray-500">S4 E9</div>
                    <div className="flex gap-2 mt-1">
                      <span className="bg-red-100 text-red-800 text-xs px-1 rounded">
                        Sci-Fi
                      </span>
                      <span className="bg-red-100 text-red-800 text-xs px-1 rounded">
                        Horror
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-md flex items-center justify-center text-gray-400">
                    ?
                  </div>
                  <div>
                    <div className="font-medium">Wednesday</div>
                    <div className="text-sm text-gray-500">S1 E8</div>
                    <div className="flex gap-2 mt-1">
                      <span className="bg-red-100 text-red-800 text-xs px-1 rounded">
                        Comedy
                      </span>
                      <span className="bg-red-100 text-red-800 text-xs px-1 rounded">
                        Fantasy
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* DoorDash Activity */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <ShoppingBag className="h-5 w-5 text-red-500" />
              <h3 className="text-lg font-semibold">DoorDash Activity</h3>
            </div>

            <div>
              <h4 className="text-gray-500 mb-3">Recent Orders</h4>
              <div className="flex items-center justify-center h-32 text-gray-400">
                No recent orders found
              </div>
            </div>
          </div>

          {/* Dynamically render tiles for other connected merchants */}
          {connectedMerchants
            .filter(
              (m) => m.id !== 13 && m.id !== 16 && m.id !== 19 && m.connected
            )
            .map((merchant) => {
              // Generate random content for the merchant
              const randomContent = generateRandomContentForMerchant(
                merchant.name
              );

              return (
                <div
                  key={merchant.id}
                  className="bg-white rounded-lg border border-gray-200 p-6"
                >
                  <div className="flex items-center gap-2 mb-4">
                    {randomContent.type === "music" && (
                      <Music className="h-5 w-5 text-blue-500" />
                    )}
                    {randomContent.type === "movie" && (
                      <Video className="h-5 w-5 text-purple-500" />
                    )}
                    {(randomContent.type === "order" ||
                      randomContent.type === "purchase") && (
                      <ShoppingBag className="h-5 w-5 text-orange-500" />
                    )}
                    <h3 className="text-lg font-semibold">
                      {merchant.name} Activity
                    </h3>
                  </div>

                  <div>
                    <h4 className="text-gray-500 mb-3">
                      {randomContent.type === "music" && "Recently Played"}
                      {randomContent.type === "movie" && "Recently Watched"}
                      {randomContent.type === "order" && "Recent Orders"}
                      {randomContent.type === "purchase" && "Recent Purchases"}
                    </h4>

                    {randomContent.items.length > 0 ? (
                      <div className="space-y-4">
                        {randomContent.items.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-200 rounded-md flex items-center justify-center text-gray-400">
                              {randomContent.type === "music" ? "♪" : "?"}
                            </div>
                            <div>
                              <div className="font-medium">{item.title}</div>
                              {item.subtitle && (
                                <div className="text-sm text-gray-500">
                                  {item.subtitle}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-32 text-gray-400">
                        No recent activity found
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    );
  };

  // Render recent activity feed
  const renderRecentActivity = () => {
    if (activeTab !== "insights") return null;

    return (
      <div className="mt-12">
        <h2 className="text-2xl font-semibold mb-6">Recent Activity</h2>

        <div className="space-y-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start gap-4">
              <div className="mt-1 text-green-500">
                <Music className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">Listened to Spotify</h3>
                    <p className="text-gray-600">
                      Blinding Lights by The Weeknd
                    </p>
                  </div>
                  <div className="text-sm text-gray-500">2h ago</div>
                </div>
              </div>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start gap-4">
              <div className="mt-1 text-red-500">
                <Video className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">Watched on Netflix</h3>
                    <p className="text-gray-600">Stranger Things</p>
                  </div>
                  <div className="text-sm text-gray-500">1d ago</div>
                </div>
              </div>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start gap-4">
              <div className="mt-1 text-orange-500">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">Ordered from Amazon</h3>
                    <p className="text-gray-600">
                      Echo Dot (5th Gen), Kindle Paperwhite
                    </p>
                  </div>
                  <div className="text-sm text-gray-500">6d ago</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Initialize deals and transactions on component mount
  useEffect(() => {
    setDealsList(initialDeals);
    setTransactionsList(initialTransactions);
  }, []);

  // Add transaction function
  const addTransaction = () => {
    // Validate form
    if (
      !transactionForm.merchant ||
      transactionForm.amount <= 0 ||
      !transactionForm.card
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    // Create new transaction
    const newTransaction = {
      id: Date.now(),
      merchant: transactionForm.merchant,
      amount: transactionForm.amount,
      date: "just now",
      card: transactionForm.card,
      category: transactionForm.category,
    };

    // Add to transactions list
    setTransactionsList((prev) => [newTransaction, ...prev]);

    // Close modal and reset form
    setShowTransactionModal(false);
    setTransactionForm({
      merchant: "",
      amount: 0,
      category: "Dining",
      card: "",
      date: new Date().toISOString().split("T")[0],
    });

    // Show success toast
    toast.success(
      `Transaction added: ${
        transactionForm.merchant
      } - $${transactionForm.amount.toFixed(2)}`
    );
  };

  // Handle transaction form changes
  const handleTransactionFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setTransactionForm({
      ...transactionForm,
      [name]: name === "amount" ? parseFloat(value) : value,
    });
  };

  // New deal generator
  useEffect(() => {
    if (activeTab === "deals") {
      // Add immediate demo deal for fast feedback
      setTimeout(() => {
        const newDeal = generateRandomDeal();
        setDealsList((prev) => [newDeal, ...prev]);
        toast.info(`New offer found: ${newDeal.title}`, {
          icon: "🎁" as any,
        });
      }, 3000);

      const dealInterval = setInterval(() => {
        // Generate random deal
        const newDeal = generateRandomDeal();

        // Add to deals list
        setDealsList((prev) => [newDeal, ...prev]);

        // Show toast
        toast.info(`New offer found: ${newDeal.title}`, {
          icon: "🎁" as any,
        });
      }, 10000);

      return () => clearInterval(dealInterval);
    }
  }, [activeTab]);

  // Generate random deal
  const generateRandomDeal = () => {
    const dealTypes = ["New Offer", "Limited Time"];
    const cards = [
      "Chase Sapphire Reserve",
      "Freedom Unlimited",
      "Any Chase Card",
    ];
    const categories = ["Dining", "Travel", "Shopping", "Entertainment"];
    const merchants = [
      "Amazon",
      "Uber",
      "Starbucks",
      "Target",
      "Best Buy",
      "Apple",
      "DoorDash",
    ];

    const randomMerchant =
      merchants[Math.floor(Math.random() * merchants.length)];
    const randomCategory =
      categories[Math.floor(Math.random() * categories.length)];
    const randomCard = cards[Math.floor(Math.random() * cards.length)];

    return {
      id: Date.now(),
      title: `${Math.floor(Math.random() * 20) + 5}% back at ${randomMerchant}`,
      type: dealTypes[Math.floor(Math.random() * dealTypes.length)],
      card: randomCard,
      amount: `${Math.floor(Math.random() * 20) + 5}%`,
      expires: `${
        ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"][
          Math.floor(Math.random() * 7)
        ]
      } ${Math.floor(Math.random() * 28) + 1}, 2025`,
      description: `Use your ${randomCard} at ${randomMerchant} and earn extra rewards.`,
      details: `Valid for ${randomCategory.toLowerCase()} purchases. Maximum cash back of $${
        Math.floor(Math.random() * 50) + 10
      }.`,
      category: randomCategory.toLowerCase(),
    };
  };

  // Filter deals by category
  const getFilteredDeals = () => {
    if (activeDealsFilter === "all") {
      return dealsList;
    }
    return dealsList.filter((deal) => deal.category === activeDealsFilter);
  };

  // Handle deal action
  const handleDealAction = (dealId: number) => {
    toast.success(`Deal activated! Check your email for details.`);
    // Mark the deal as activated in the UI if needed
    setDealsList((prev) =>
      prev.map((deal) =>
        deal.id === dealId ? { ...deal, activated: true } : deal
      )
    );
  };

  // Fetch AI insights
  const fetchInsights = async () => {
    if (activeTab !== "ai-insights") return;

    try {
      setInsightsLoading(true);
      setInsightsError(null);

      const response = await fetch("/api/analyze");

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setInsights(data);
    } catch (error) {
      console.error("Error fetching insights:", error);
      setInsightsError("Failed to load insights. Please try again later.");
    } finally {
      setInsightsLoading(false);
    }
  };

  // Fetch insights when AI Insights tab is activated
  useEffect(() => {
    if (activeTab === "ai-insights") {
      fetchInsights();
    }
  }, [activeTab]);

  // Colors for charts
  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884d8",
    "#82ca9d",
  ];

  // Format currency values
  const formatCurrency = (value: number) => {
    return `$${value.toFixed(2)}`;
  };

  // Transform category data for pie chart
  const getCategoryData = () => {
    if (!insights?.spendingByCategory) return [];

    return Object.entries(insights.spendingByCategory).map(([name, value]) => ({
      name,
      value,
    }));
  };

  // Transform merchant data for bar chart
  const getMerchantData = () => {
    if (!insights?.topMerchants) return [];
    return insights.topMerchants;
  };

  // Render AI Insights tab
  const renderAIInsights = () => {
    if (insightsLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="mb-4"
          >
            <Brain className="h-12 w-12 text-slate-900" />
          </motion.div>
          <p className="text-gray-500 animate-pulse">
            Analyzing your financial data...
          </p>
        </div>
      );
    }

    if (insightsError) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="bg-red-100 text-red-800 p-4 rounded-lg max-w-lg">
            <p className="font-medium">Error loading insights</p>
            <p className="text-sm">{insightsError}</p>
            <button
              onClick={fetchInsights}
              className="mt-3 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    if (!insights) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-gray-500">
            No insights available. Connect your accounts to start seeing
            AI-powered financial insights.
          </p>
        </div>
      );
    }

    return (
      <div className="mt-6">
        {/* AI Score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex flex-col items-center">
            <h2 className="text-2xl font-semibold mb-2">
              Financial Wellness Score
            </h2>
            <div className="relative">
              <div className="w-64 h-64 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
                    className="bg-slate-900 text-white h-48 w-48 rounded-full flex flex-col items-center justify-center shadow-lg"
                  >
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.7, duration: 0.5 }}
                    >
                      <div className="text-6xl font-bold">
                        {insights.aiScore}
                      </div>
                      <div className="text-sm mt-1 opacity-80">out of 100</div>
                    </motion.div>
                  </motion.div>
                </div>
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <motion.circle
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: insights.aiScore / 100 }}
                    transition={{ delay: 0.5, duration: 1, type: "spring" }}
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#4ade80"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray="251.2"
                    strokeDashoffset="0"
                    transform="rotate(-90 50 50)"
                    className="drop-shadow-md"
                  />
                </svg>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Navigation for insight sections */}
        <div className="border-b border-gray-200 mb-6">
          <div className="flex space-x-6 overflow-x-auto pb-2">
            <button
              onClick={() => setActiveInsightSection("spending")}
              className={`pb-2 px-1 ${
                activeInsightSection === "spending"
                  ? "border-b-2 border-slate-900 font-medium"
                  : "text-gray-500"
              }`}
            >
              <span className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Spending Analysis
              </span>
            </button>

            <button
              onClick={() => setActiveInsightSection("time")}
              className={`pb-2 px-1 ${
                activeInsightSection === "time"
                  ? "border-b-2 border-slate-900 font-medium"
                  : "text-gray-500"
              }`}
            >
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Time Usage
              </span>
            </button>

            <button
              onClick={() => setActiveInsightSection("trends")}
              className={`pb-2 px-1 ${
                activeInsightSection === "trends"
                  ? "border-b-2 border-slate-900 font-medium"
                  : "text-gray-500"
              }`}
            >
              <span className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Trends
              </span>
            </button>

            <button
              onClick={() => setActiveInsightSection("recommendations")}
              className={`pb-2 px-1 ${
                activeInsightSection === "recommendations"
                  ? "border-b-2 border-slate-900 font-medium"
                  : "text-gray-500"
              }`}
            >
              <span className="flex items-center gap-2">
                <Award className="h-4 w-4" />
                Recommendations
              </span>
            </button>
          </div>
        </div>

        {/* AI Insights */}
        <motion.div
          key={activeInsightSection}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          {activeInsightSection === "spending" && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Spending by Category */}
                <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <PieChart className="h-5 w-5 text-slate-900" />
                    Spending by Category
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={getCategoryData()}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          fill="#8884d8"
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, percent }) =>
                            `${name} ${(percent * 100).toFixed(0)}%`
                          }
                        >
                          {getCategoryData().map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value) => formatCurrency(value as number)}
                        />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Top Merchants */}
                <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <BarChart2 className="h-5 w-5 text-slate-900" />
                    Top Merchants
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={getMerchantData()}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" tickFormatter={formatCurrency} />
                        <YAxis type="category" dataKey="name" width={100} />
                        <Tooltip
                          formatter={(value) => formatCurrency(value as number)}
                        />
                        <Bar
                          dataKey="amount"
                          fill="#4f46e5"
                          radius={[0, 4, 4, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm flex items-center">
                  <div className="mr-4 bg-blue-100 p-3 rounded-full">
                    <DollarSign className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-sm text-gray-500">Total Spending</h4>
                    <div className="text-xl font-semibold">
                      ${insights.totalSpending.toFixed(2)}
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm flex items-center">
                  <div className="mr-4 bg-green-100 p-3 rounded-full">
                    <CreditCard className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="text-sm text-gray-500">Cards Used</h4>
                    <div className="text-xl font-semibold">
                      {Object.keys(insights.spendingByCard).length}
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm flex items-center">
                  <div className="mr-4 bg-purple-100 p-3 rounded-full">
                    <ShoppingBag className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="text-sm text-gray-500">Categories</h4>
                    <div className="text-xl font-semibold">
                      {Object.keys(insights.spendingByCategory).length}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeInsightSection === "time" && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Time Usage by Service */}
                <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Clock className="h-5 w-5 text-slate-900" />
                    Time Usage by Service
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={Object.entries(insights.timeUsageByService).map(
                            ([name, value]) => ({ name, value })
                          )}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          label={({ name, percent }) =>
                            `${name} ${(percent * 100).toFixed(0)}%`
                          }
                          dataKey="value"
                        >
                          {Object.entries(insights.timeUsageByService).map(
                            (entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            )
                          )}
                        </Pie>
                        <Tooltip formatter={(value) => `${value} hours`} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Time Usage by Content Type */}
                <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Video className="h-5 w-5 text-slate-900" />
                    Usage by Content Type
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={Object.entries(
                          insights.timeUsageByContentType
                        ).map(([name, value]) => ({ name, value }))}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis tickFormatter={(value) => `${value}h`} />
                        <Tooltip formatter={(value) => `${value} hours`} />
                        <Bar
                          dataKey="value"
                          fill="#8884d8"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm flex items-center">
                  <div className="mr-4 bg-indigo-100 p-3 rounded-full">
                    <Clock className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <h4 className="text-sm text-gray-500">Total Time Used</h4>
                    <div className="text-xl font-semibold">
                      {insights.totalHoursUsed.toFixed(1)} hours
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm flex items-center">
                  <div className="mr-4 bg-pink-100 p-3 rounded-full">
                    <Music className="h-6 w-6 text-pink-600" />
                  </div>
                  <div>
                    <h4 className="text-sm text-gray-500">
                      Music Listening Time
                    </h4>
                    <div className="text-xl font-semibold">
                      {(insights.timeUsageByContentType["music"] || 0).toFixed(
                        1
                      )}{" "}
                      hours
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm flex items-center">
                  <div className="mr-4 bg-red-100 p-3 rounded-full">
                    <Video className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <h4 className="text-sm text-gray-500">Streaming Time</h4>
                    <div className="text-xl font-semibold">
                      {(
                        (insights.timeUsageByContentType["movies"] || 0) +
                        (insights.timeUsageByContentType["series"] || 0)
                      ).toFixed(1)}{" "}
                      hours
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeInsightSection === "trends" && (
            <div>
              <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm mb-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-slate-900" />
                  Spending Trends
                </h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={insights.monthlyTrend}>
                      <defs>
                        <linearGradient
                          id="colorAmount"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#4f46e5"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="#4f46e5"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" />
                      <YAxis tickFormatter={(value) => `$${value}`} />
                      <CartesianGrid strokeDasharray="3 3" />
                      <Tooltip
                        formatter={(value) => formatCurrency(value as number)}
                      />
                      <Area
                        type="monotone"
                        dataKey="amount"
                        stroke="#4f46e5"
                        fillOpacity={1}
                        fill="url(#colorAmount)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-4">
                  AI Chat Assistant
                </h3>
                <div className="h-96 flex flex-col">
                  <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                    {chatMessages.length === 0 ? (
                      <div className="text-gray-500 text-center py-4">
                        Ask me anything about your financial data and insights!
                      </div>
                    ) : (
                      chatMessages.map((msg, index) => (
                        <div
                          key={index}
                          className={`flex ${
                            msg.role === "user"
                              ? "justify-end"
                              : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg p-3 ${
                              msg.role === "user"
                                ? "bg-blue-500 text-white"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {msg.content}
                          </div>
                        </div>
                      ))
                    )}
                    {isChatLoading && (
                      <div className="flex justify-start">
                        <div className="bg-gray-100 text-gray-800 rounded-lg p-3 animate-pulse">
                          Thinking...
                        </div>
                      </div>
                    )}
                  </div>
                  <form onSubmit={handleChatSubmit} className="flex gap-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Ask about your financial insights..."
                      className="flex-1 border border-gray-300 rounded-lg px-4 py-2"
                    />
                    <button
                      type="submit"
                      disabled={isChatLoading || !chatInput.trim()}
                      className="bg-slate-900 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                    >
                      Send
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {activeInsightSection === "recommendations" && (
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Award className="h-5 w-5 text-slate-900" />
                Recommended Actions
              </h3>

              <div className="space-y-4">
                {insights.recommendations.map((recommendation, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className="p-4 border border-gray-200 rounded-lg flex items-start gap-3"
                  >
                    <div className="bg-blue-100 p-2 rounded-full mt-1">
                      <Award className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-gray-800">{recommendation}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-6 text-center">
                <button className="bg-slate-900 text-white px-6 py-3 rounded-lg text-sm font-medium">
                  Set Up Financial Goals
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    );
  };

  // Entertainment tab functions
  const handleEntertainmentFilter = (filter: string) => {
    setEntertainmentFilter(filter);

    // Update visibility based on filter
    if (filter === "all") {
      setShowMusicRecommendations(true);
      setShowEventsSection(true);
      setShowMoviesSection(true);
    } else if (filter === "concerts") {
      setShowMusicRecommendations(true);
      setShowEventsSection(true);
      setShowMoviesSection(false);
    } else if (filter === "musicals") {
      setShowMusicRecommendations(false);
      setShowEventsSection(true);
      setShowMoviesSection(false);
    } else if (filter === "shows") {
      setShowMusicRecommendations(false);
      setShowEventsSection(false);
      setShowMoviesSection(true);
    } else if (filter === "movies") {
      setShowMusicRecommendations(false);
      setShowEventsSection(false);
      setShowMoviesSection(true);
    }
  };

  const getFilteredLiveEvents = () => {
    const allEvents = [
      {
        id: 1,
        title: "Queen + Adam Lambert - The Rhapsody Tour",
        date: "Mon, Apr 14, 25",
        venue: "Madison Square Garden, New York",
        tags: ["Rock", "Classic Rock"],
        type: "concert",
        price: 120.0,
      },
      {
        id: 2,
        title: "Hamilton - Broadway Musical",
        date: "Sat, Apr 19, 25",
        venue: "Richard Rodgers Theatre, New York",
        tags: ["Musical", "Broadway", "Historical"],
        type: "musical",
        price: 250.0,
      },
      {
        id: 3,
        title: "My Chemical Romance Reunion Tour",
        date: "Wed, Apr 9, 25",
        venue: "Barclays Center, Brooklyn",
        tags: ["Rock", "Alternative", "Emo"],
        type: "concert",
        price: 95.0,
      },
      {
        id: 4,
        title: "La La Land in Concert",
        date: "Thu, Apr 24, 25",
        venue: "Lincoln Center, New York",
        tags: ["Soundtrack", "Jazz", "Musical"],
        type: "musical",
        price: 85.0,
      },
      {
        id: 5,
        title: "Stranger Things: The Experience",
        date: "Mon, Mar 31, 25",
        venue: "Brooklyn Navy Yard, New York",
        tags: ["Sci-Fi", "Immersive", "Interactive"],
        type: "show",
        price: 65.0,
      },
    ];

    if (entertainmentFilter === "all") {
      return allEvents;
    } else if (entertainmentFilter === "concerts") {
      return allEvents.filter((event) => event.type === "concert");
    } else if (entertainmentFilter === "musicals") {
      return allEvents.filter((event) => event.type === "musical");
    } else if (entertainmentFilter === "shows") {
      return allEvents.filter((event) => event.type === "show");
    } else {
      return allEvents;
    }
  };

  const getRecommendedShows = () => {
    const allShows = [
      {
        id: 1,
        title: "The Queen's Gambit",
        platform: "Netflix",
        rating: "4.7/5",
        year: "2020",
        seasons: "1 season",
        tags: ["Drama", "Historical"],
        cast: "Anya Taylor-Joy, Thomas Brodie-Sangster",
        promo: "Free month with Chase Sapphire Reserve",
      },
      {
        id: 2,
        title: "Loki",
        platform: "Disney+",
        rating: "4.5/5",
        year: "2021",
        seasons: "1 season",
        tags: ["Action", "Sci-Fi", "Adventure"],
        cast: "Tom Hiddleston, Owen Wilson",
        promo: "3 months free with Chase card",
      },
      {
        id: 3,
        title: "The Mandalorian",
        platform: "Disney+",
        rating: "4.8/5",
        year: "2019",
        seasons: "2 seasons",
        tags: ["Sci-Fi", "Action", "Space Western"],
        cast: "Pedro Pascal, Grogu",
        promo: "6 months free Disney+ with Freedom card",
      },
      {
        id: 4,
        title: "Dune",
        platform: "HBO Max",
        rating: "4.6/5",
        year: "2021",
        duration: "155 mins",
        tags: ["Sci-Fi", "Adventure", "Drama"],
        cast: "Timothée Chalamet, Zendaya",
        promo: "Free rental with HBO subscription",
      },
      {
        id: 5,
        title: "No Time to Die",
        platform: "Amazon Prime",
        rating: "4.3/5",
        year: "2021",
        duration: "163 mins",
        tags: ["Action", "Adventure", "Thriller"],
        cast: "Daniel Craig, Ana de Armas",
        promo: "40% off rental with Prime",
      },
    ];

    // Filter shows based on selection - shows or movies
    if (entertainmentFilter === "shows") {
      return allShows.filter((show) => show.seasons);
    } else if (entertainmentFilter === "movies") {
      return allShows.filter((show) => show.duration);
    } else {
      return allShows;
    }
  };

  const getMusicRecommendations = () => {
    return [
      {
        id: 1,
        title: "Plastic Hearts",
        artist: "Miley Cyrus",
        tags: ["Rock", "Pop", "Glam Rock"],
        year: "2020",
        tracks: "15",
        price: 9.99,
        promo: "Free download with Apple Card purchase",
      },
      {
        id: 2,
        title: "Justice",
        artist: "Justin Bieber",
        tags: ["Pop", "R&B"],
        year: "2021",
        tracks: "16",
        price: 10.99,
        promo: "Buy 1 Get 1 Free with Chase Freedom card",
      },
      {
        id: 3,
        title: "Future Nostalgia",
        artist: "Dua Lipa",
        tags: ["Pop", "Dance", "Disco"],
        year: "2020",
        tracks: "11",
        price: 8.99,
        promo: "15% cashback with Amazon Prime Visa",
      },
    ];
  };

  // Define type for merchant history items
  type MerchantHistoryItem = {
    id: number;
    title: string;
    subtitle: string;
    date: string;
    amount?: number;
    type?: string;
    category?: string;
  };

  // Add new state for merchant history with proper type
  const [merchantHistory, setMerchantHistory] = useState<MerchantHistoryItem[]>(
    []
  );

  // Update the useEffect to handle merchant selection changes
  useEffect(() => {
    if (selectedMerchant && selectedMerchant.name) {
      // Generate merchant history items
      const items = Array.from({ length: 3 }, (_, i) => {
        const randomDate = new Date();
        randomDate.setDate(
          randomDate.getDate() - Math.floor(Math.random() * 5)
        );
        const dateStr = randomDate.toISOString().split("T")[0];

        return {
          id: i + 1,
          title: `${selectedMerchant.name} ${
            i === 0 ? "Purchase" : i === 1 ? "Booking" : "Transaction"
          }`,
          subtitle: `${
            i === 0
              ? "Premium Plan"
              : i === 1
              ? "Weekend Reservation"
              : "Service Fee"
          }`,
          date: dateStr,
          amount: Math.floor(Math.random() * 200) + 50,
          type: i === 0 ? "subscription" : i === 1 ? "booking" : "purchase",
          category: selectedMerchant.name.toLowerCase().includes("airbnb")
            ? "Travel"
            : selectedMerchant.name.toLowerCase().includes("doordash")
            ? "Food"
            : "Service",
        };
      });

      setMerchantHistory(items);
    }
  }, [selectedMerchant]);

  // Helper function to get icon for merchant
  const getMerchantIcon = (merchantName: string) => {
    if (merchantName.toLowerCase().includes("airbnb")) {
      return <ShoppingBag size={18} />;
    } else if (merchantName.toLowerCase().includes("doordash")) {
      return <ShoppingBag size={18} />;
    } else {
      return <ShoppingBag size={18} />;
    }
  };

  // Helper function to get color for merchant
  const getMerchantColor = (merchantName: string) => {
    if (merchantName.toLowerCase().includes("airbnb")) {
      return "text-pink-600";
    } else if (merchantName.toLowerCase().includes("doordash")) {
      return "text-red-600";
    } else {
      return "text-blue-600";
    }
  };

  const [chatMessages, setChatMessages] = useState<
    Array<{ role: "user" | "assistant"; content: string }>
  >([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Add this before the renderAIInsights function
  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMessage = chatInput.trim();
    setChatInput("");

    // Add user message to chat
    setChatMessages((prev) => [
      ...prev,
      { role: "user", content: userMessage },
    ]);

    setIsChatLoading(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
          insights: insights,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();
      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response },
      ]);
    } catch (error) {
      console.error("Chat error:", error);
      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, I encountered an error processing your request. Please try again.",
        },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        Redirecting to login...
      </div>
    );
  }

  // Render available deals based on the active tab
  const renderDeals = () => {
    return (
      <div className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Available Deals</h2>
          <span className="bg-slate-800 text-white text-sm px-3 py-1 rounded-full">
            {getFilteredDeals().length} Offers
          </span>
        </div>
        <p className="mb-4 text-gray-600">
          Exclusive offers and discounts based on your spending patterns and
          card benefits.
        </p>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {dealCategories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveDealsFilter(category)}
              className={`${
                activeDealsFilter === category
                  ? "bg-slate-900 text-white"
                  : "bg-transparent border border-gray-300"
              } px-4 py-2 rounded-full text-sm whitespace-nowrap`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
              {category === "all" && " Deals"}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {getFilteredDeals().map((deal) => (
            <div
              key={deal.id}
              className="border border-gray-200 rounded-lg overflow-hidden"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{deal.title}</h3>
                    <p className="text-sm text-gray-500">{deal.card}</p>
                  </div>
                  <div className="text-xl font-bold">{deal.amount}</div>
                </div>

                <div className="mb-4">
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      deal.type === "New Offer"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {deal.type}
                  </span>
                </div>

                <p className="mb-4 text-sm">{deal.description}</p>

                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    <div>{deal.details}</div>
                    <div>Expires: {deal.expires}</div>
                  </div>
                  <button
                    className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm"
                    onClick={() => handleDealAction(deal.id)}
                  >
                    Activate Deal
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render transaction modal
  const renderTransactionModal = () => {
    if (!showTransactionModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Add Transaction</h2>
            <button onClick={() => setShowTransactionModal(false)}>
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block mb-1 text-sm">Merchant Name *</label>
              <input
                type="text"
                name="merchant"
                value={transactionForm.merchant}
                onChange={handleTransactionFormChange}
                className="w-full border border-gray-300 rounded-lg p-2"
                placeholder="e.g., Starbucks"
                required
              />
            </div>

            <div>
              <label className="block mb-1 text-sm">Amount *</label>
              <input
                type="number"
                name="amount"
                value={transactionForm.amount || ""}
                onChange={handleTransactionFormChange}
                className="w-full border border-gray-300 rounded-lg p-2"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <label className="block mb-1 text-sm">Category</label>
              <select
                name="category"
                value={transactionForm.category}
                onChange={handleTransactionFormChange}
                className="w-full border border-gray-300 rounded-lg p-2"
              >
                <option value="Dining">Dining</option>
                <option value="Shopping">Shopping</option>
                <option value="Travel">Travel</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block mb-1 text-sm">Card *</label>
              <select
                name="card"
                value={transactionForm.card}
                onChange={handleTransactionFormChange}
                className="w-full border border-gray-300 rounded-lg p-2"
                required
              >
                <option value="">Select a card</option>
                {userCards.length > 0 ? (
                  userCards.map((card, index) => (
                    <option
                      key={index}
                      value={card.name || `Card ending in ${card.last4}`}
                    >
                      {card.name || `Card ending in ${card.last4}`}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="Chase Freedom Unlimited">
                      Chase Freedom Unlimited
                    </option>
                    <option value="Chase Chase Sapphire Reserve">
                      Chase Sapphire Reserve
                    </option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block mb-1 text-sm">Date</label>
              <input
                type="date"
                name="date"
                value={transactionForm.date}
                onChange={handleTransactionFormChange}
                className="w-full border border-gray-300 rounded-lg p-2"
              />
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowTransactionModal(false)}
                className="border border-gray-300 px-4 py-2 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={addTransaction}
                className="bg-slate-900 text-white px-4 py-2 rounded-lg"
              >
                Add Transaction
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 my-12">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <div className="flex space-x-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab("insights")}
            className={`pb-4 px-2 ${
              activeTab === "insights"
                ? "border-b-2 border-slate-900 font-medium"
                : "text-gray-500"
            }`}
          >
            <span className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
              </svg>
              Activity
            </span>
          </button>

          <button
            onClick={() => setActiveTab("deals")}
            className={`pb-4 px-2 ${
              activeTab === "deals"
                ? "border-b-2 border-slate-900 font-medium"
                : "text-gray-500"
            }`}
          >
            <span className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"></path>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                <line x1="12" y1="22.08" x2="12" y2="12"></line>
              </svg>
              Deals
            </span>
          </button>

          <button
            onClick={() => setActiveTab("ai-insights")}
            className={`pb-4 px-2 ${
              activeTab === "ai-insights"
                ? "border-b-2 border-slate-900 font-medium"
                : "text-gray-500"
            }`}
          >
            <span className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              AI Insights
            </span>
          </button>

          <button
            onClick={() => setActiveTab("entertainment")}
            className={`pb-4 px-2 ${
              activeTab === "entertainment"
                ? "border-b-2 border-slate-900 font-medium"
                : "text-gray-500"
            }`}
          >
            <span className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <polygon points="10 8 16 12 10 16 10 8"></polygon>
              </svg>
              Entertainment
            </span>
          </button>
        </div>
      </div>

      {/* Account Connection Section (Only visible on Insights tab) */}
      {activeTab === "insights" && (
        <div className="bg-white rounded-lg border border-gray-200 p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-1">
              <h3 className="text-lg font-semibold mb-2">Connected Services</h3>
              <div className="space-y-1">
                {connectedServices.map((service) => (
                  <div
                    key={service.id}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-lg text-sm inline-block mr-2 mb-2"
                  >
                    {service.name}{" "}
                    <span className="text-xs text-gray-600">
                      {service.date}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="md:col-span-3">
              <h2 className="text-xl font-semibold mb-4">
                Connect your accounts
              </h2>
              <p className="text-gray-600 mb-6">
                Securely connect your financial accounts to unlock personalized
                deals based on your spending habits.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="mb-2">Select product:</div>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      className={`border rounded-lg py-3 px-4 text-center ${
                        selectedProduct === "card_switcher"
                          ? "bg-blue-50 border-blue-200"
                          : "bg-white border-gray-200"
                      }`}
                      onClick={() => setSelectedProduct("card_switcher")}
                    >
                      Card Switcher
                    </button>
                    <button
                      className={`border rounded-lg py-3 px-4 text-center ${
                        selectedProduct === "transaction_link"
                          ? "bg-blue-50 border-blue-200"
                          : "bg-white border-gray-200"
                      }`}
                      onClick={() => setSelectedProduct("transaction_link")}
                    >
                      Transaction Link
                    </button>
                  </div>
                </div>

                <div>
                  <div className="mb-2">Select a merchant to connect:</div>
                  <div className="relative" ref={dropdownRef}>
                    <button
                      className="w-full flex items-center justify-between border border-gray-200 rounded-lg p-3"
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                    >
                      <span>
                        {selectedMerchant.name} (ID: {selectedMerchant.id})
                      </span>
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    </button>

                    {dropdownOpen && (
                      <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {availableMerchants.map((merchant) => (
                          <button
                            key={merchant.id}
                            className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${
                              selectedMerchant.id === merchant.id
                                ? "bg-blue-50"
                                : ""
                            }`}
                            onClick={() => {
                              setSelectedMerchant(merchant);
                              setDropdownOpen(false);
                            }}
                          >
                            {merchant.name} (ID: {merchant.id})
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <button
                className="bg-slate-900 text-white px-6 py-4 rounded-lg font-medium w-full"
                onClick={connectWithKnot}
                disabled={loading || !sdkLoaded}
              >
                {loading
                  ? "Connecting..."
                  : !sdkLoaded
                  ? "Loading Knot SDK..."
                  : "Connect Your Accounts with Knot"}
              </button>

              {knotError && (
                <div className="mt-3 text-red-500 text-sm">{knotError}</div>
              )}

              {sdkError && (
                <div className="mt-3 text-red-500 text-sm">{sdkError}</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab Content */}
      {activeTab === "insights" && (
        <>
          {/* Merchant Activity Tiles */}
          {renderMerchantActivityTiles()}

          {/* Recent Activity Feed */}
          {renderRecentActivity()}

          {/* Transactions Section */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Your Cards</h2>
                  </div>
              <div className="rounded-lg min-h-[200px]">
                <CardsList />
                </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Recent Transactions</h2>
                <button
                  className="bg-slate-900 text-white px-3 py-1 rounded-lg text-sm flex items-center gap-1"
                  onClick={() => setShowTransactionModal(true)}
                >
                  <Plus className="h-4 w-4" /> Add
                </button>
              </div>

              <div className="space-y-4">
                {transactionsList.slice(0, 6).map((tx) => (
                  <div
                    key={tx.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-md bg-purple-500 flex items-center justify-center text-white">
                          {tx.merchant.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium">{tx.merchant}</div>
                          <div className="text-sm text-gray-500">
                            {tx.card} • {tx.date}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          ${tx.amount.toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {tx.category}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === "deals" && renderDeals()}
      {activeTab === "ai-insights" && renderAIInsights()}
      {activeTab === "entertainment" && (
        <div className="py-6">
          <motion.div
            className="bg-white rounded-lg shadow p-6 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <h2 className="text-xl font-semibold mb-4">Media History</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Netflix History */}
              <div>
                <div className="flex items-center mb-3">
                  <div className="text-red-600 mr-2">
                    <Video size={18} />
                  </div>
                  <h3 className="font-medium">Netflix History</h3>
                  <span className="text-gray-500 text-sm ml-auto">
                    {videoHistory.length} items
                  </span>
                </div>

                <div className="space-y-4">
                  {videoHistory.map((item, index) => (
                    <motion.div
                      key={item.id}
                      className={`flex items-start ${
                        index < videoHistory.length - 1 ? "border-b pb-3" : ""
                      }`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{
                        opacity: isLoaded ? 1 : 0,
                        x: isLoaded ? 0 : -10,
                      }}
                      transition={{ duration: 0.3, delay: 0.2 + index * 0.1 }}
                      whileHover={{
                        scale: 1.02,
                        transition: { duration: 0.2 },
                      }}
                    >
                      <div className="w-12 h-12 bg-blue-100 rounded-md flex items-center justify-center mr-3">
                        <span className="text-blue-500 font-bold">?</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{item.title}</h4>
                        <p className="text-sm text-gray-600">
                          {item.season && item.episode
                            ? `${item.season} ${item.episode} • `
                            : ""}
                          {item.duration}
                        </p>
                        <p className="text-sm text-gray-500">{item.date}</p>
                        {item.genres && item.genres.length > 0 && (
                          <div className="flex gap-2 mt-1">
                            {item.genres.map((genre, idx) => (
                              <span
                                key={idx}
                                className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded"
                              >
                                {genre}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Spotify History */}
              <div>
                <div className="flex items-center mb-3">
                  <div className="text-green-600 mr-2">
                    <Music size={18} />
                  </div>
                  <h3 className="font-medium">Spotify History</h3>
                  <span className="text-gray-500 text-sm ml-auto">
                    {musicHistory.length} tracks
                  </span>
                </div>

                <div className="space-y-4">
                  {musicHistory.map((item, index) => (
                    <motion.div
                      key={item.id}
                      className={`flex items-start ${
                        index < musicHistory.length - 1 ? "border-b pb-3" : ""
                      }`}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{
                        opacity: isLoaded ? 1 : 0,
                        x: isLoaded ? 0 : 10,
                      }}
                      transition={{ duration: 0.3, delay: 0.2 + index * 0.1 }}
                      whileHover={{
                        scale: 1.02,
                        transition: { duration: 0.2 },
                      }}
                    >
                      <div className="w-12 h-12 bg-blue-100 rounded-md flex items-center justify-center mr-3">
                        <span className="text-blue-500 font-bold">?</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{item.title}</h4>
                        <p className="text-sm text-gray-600">{item.artist}</p>
                        <p className="text-sm text-gray-500">
                          Album: {item.album}
                        </p>
                        <p className="text-sm text-gray-500">{item.date}</p>
                        <div className="text-right text-sm text-gray-400">
                          {item.playCount}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Selected Merchant History */}
              {selectedMerchant &&
                selectedMerchant.name &&
                merchantHistory.length > 0 && (
                  <div>
                    <div className="flex items-center mb-3">
                      <div
                        className={`${getMerchantColor(
                          selectedMerchant.name
                        )} mr-2`}
                      >
                        {getMerchantIcon(selectedMerchant.name)}
                      </div>
                      <h3 className="font-medium">
                        {selectedMerchant.name} Activity
                      </h3>
                      <span className="text-gray-500 text-sm ml-auto">
                        {merchantHistory.length} items
                      </span>
                    </div>

                    <div className="space-y-4">
                      {merchantHistory.map((item, index) => (
                        <motion.div
                          key={item.id}
                          className={`flex items-start ${
                            index < merchantHistory.length - 1
                              ? "border-b pb-3"
                              : ""
                          }`}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{
                            opacity: isLoaded ? 1 : 0,
                            x: isLoaded ? 0 : 10,
                          }}
                          transition={{
                            duration: 0.3,
                            delay: 0.2 + index * 0.1,
                          }}
                          whileHover={{
                            scale: 1.02,
                            transition: { duration: 0.2 },
                          }}
                        >
                          <div className="w-12 h-12 bg-blue-100 rounded-md flex items-center justify-center mr-3">
                            <span className="text-blue-500 font-bold">?</span>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{item.title}</h4>
                            <p className="text-sm text-gray-600">
                              {item.subtitle}
                            </p>
                            <p className="text-sm text-gray-500">{item.date}</p>
                            {item.amount && (
                              <div className="text-right text-sm text-gray-400">
                                ${item.amount.toFixed(2)}
                              </div>
                            )}
                            {item.category && (
                              <div className="mt-1">
                                <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded">
                                  {item.category}
                                </span>
                                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded ml-1 capitalize">
                                  {item.type}
                                </span>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          </motion.div>

          <motion.div
            className="bg-white rounded-lg shadow p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <h2 className="text-xl font-semibold">Recommended for You</h2>
              <div className="flex space-x-2">
                <motion.button
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    entertainmentFilter === "all"
                      ? "bg-blue-500 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                  onClick={() => handleEntertainmentFilter("all")}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  All
                </motion.button>
                <motion.button
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    entertainmentFilter === "concerts"
                      ? "bg-blue-500 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                  onClick={() => handleEntertainmentFilter("concerts")}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Concerts
                </motion.button>
                <motion.button
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    entertainmentFilter === "musicals"
                      ? "bg-blue-500 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                  onClick={() => handleEntertainmentFilter("musicals")}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Musicals
                </motion.button>
                <motion.button
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    entertainmentFilter === "shows"
                      ? "bg-blue-500 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                  onClick={() => handleEntertainmentFilter("shows")}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Shows
                </motion.button>
                <motion.button
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    entertainmentFilter === "movies"
                      ? "bg-blue-500 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                  onClick={() => handleEntertainmentFilter("movies")}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Movies
                </motion.button>
              </div>
            </div>

            {showEventsSection && (
              <motion.div
                className="mb-6"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: isLoaded ? 1 : 0, height: "auto" }}
                transition={{ duration: 0.4 }}
              >
                <div className="flex items-center mb-2">
                  <div className="text-blue-600 mr-2">
                    <Video size={18} />
                  </div>
                  <h3 className="font-medium">
                    Live Events ({getFilteredLiveEvents().length})
                  </h3>
                  <a
                    href="#"
                    className="text-blue-500 text-sm ml-auto hover:underline"
                  >
                    See all events
                  </a>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                  {getFilteredLiveEvents()
                    .slice(0, 3)
                    .map((event, index) => (
                      <motion.div
                        key={event.id}
                        className="border rounded-lg overflow-hidden"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{
                          opacity: isLoaded ? 1 : 0,
                          y: isLoaded ? 0 : 20,
                        }}
                        transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                        whileHover={{
                          y: -5,
                          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                        }}
                      >
                        <div className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">{event.title}</h4>
                              <p className="text-sm text-gray-500 mt-1">
                                {event.date}
                              </p>
                              <p className="text-sm text-gray-600">
                                {event.venue}
                              </p>
                              <div className="flex gap-2 mt-2">
                                {event.tags.map((tag, idx) => (
                                  <span
                                    key={idx}
                                    className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded capitalize">
                              {event.type}
                            </span>
                          </div>
                          <div className="flex justify-between items-center mt-4">
                            <span className="font-medium text-lg">
                              ${event.price.toFixed(2)}
                            </span>
                            <motion.button
                              className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
                              whileHover={{
                                scale: 1.05,
                                backgroundColor: "#3b82f6",
                              }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() =>
                                toast.success(
                                  `Tickets for ${event.title} added to cart!`
                                )
                              }
                            >
                              Get Tickets
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                </div>
              </motion.div>
            )}

            {showMusicRecommendations && (
              <motion.div
                className="mt-8 mb-6"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: isLoaded ? 1 : 0, height: "auto" }}
                transition={{ duration: 0.4 }}
              >
                <div className="flex items-center mb-2">
                  <div className="text-blue-600 mr-2">
                    <Music size={18} />
                  </div>
                  <h3 className="font-medium">Music Recommendations</h3>
                  <a
                    href="#"
                    className="text-blue-500 text-sm ml-auto hover:underline"
                  >
                    See all music
                  </a>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                  {getMusicRecommendations().map((album, index) => (
                    <motion.div
                      key={album.id}
                      className="border rounded-lg overflow-hidden p-4"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{
                        opacity: isLoaded ? 1 : 0,
                        y: isLoaded ? 0 : 20,
                      }}
                      transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                      whileHover={{
                        y: -5,
                        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                      }}
                    >
                      <div>
                        <h4 className="font-medium">{album.title}</h4>
                        <p className="text-sm text-gray-600">{album.artist}</p>
                        <div className="flex gap-2 mt-2 mb-2">
                          {album.tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        <p className="text-sm text-gray-500">
                          {album.year} • {album.tracks} tracks
                        </p>
                        <div className="flex justify-between items-center mt-4">
                          <span className="font-medium">
                            ${album.price.toFixed(2)}
                          </span>
                          <motion.button
                            className="bg-green-500 text-white px-3 py-1 rounded text-sm"
                            whileHover={{
                              scale: 1.05,
                              backgroundColor: "#22c55e",
                            }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() =>
                              toast.success(
                                `Album ${album.title} added to cart!`
                              )
                            }
                          >
                            Buy Album
                          </motion.button>
                        </div>
                        <p className="text-sm text-blue-500 mt-2">
                          {album.promo}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {showMoviesSection && (
              <motion.div
                className="mt-8"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: isLoaded ? 1 : 0, height: "auto" }}
                transition={{ duration: 0.4 }}
              >
                <div className="flex items-center mb-2">
                  <div className="text-red-600 mr-2">
                    <Video size={18} />
                  </div>
                  <h3 className="font-medium">Shows & Movies For You</h3>
                  <a
                    href="#"
                    className="text-blue-500 text-sm ml-auto hover:underline"
                  >
                    See all recommendations
                  </a>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                  {getRecommendedShows()
                    .slice(0, 3)
                    .map((show, index) => (
                      <motion.div
                        key={show.id}
                        className="border rounded-lg overflow-hidden p-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{
                          opacity: isLoaded ? 1 : 0,
                          y: isLoaded ? 0 : 20,
                        }}
                        transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                        whileHover={{
                          y: -5,
                          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                        }}
                      >
                        <div className="flex items-center mb-2">
                          <div className="text-red-600 mr-2">
                            <Video size={16} />
                          </div>
                          <div>
                            <h4 className="font-medium">{show.title}</h4>
                            <p className="text-xs text-gray-600">
                              {show.platform}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center mb-2">
                          <span className="text-yellow-500 mr-1">★</span>
                          <span className="text-sm">{show.rating}</span>
                          <span className="text-sm text-gray-500 mx-2">•</span>
                          <span className="text-sm text-gray-500">
                            {show.year}
                          </span>
                          <span className="text-sm text-gray-500 mx-2">•</span>
                          <span className="text-sm text-gray-500">
                            {show.seasons || show.duration}
                          </span>
                        </div>
                        <div className="flex gap-2 mb-3 flex-wrap">
                          {show.tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        <p className="text-sm text-gray-600 mb-4">
                          Cast: {show.cast}
                        </p>
                        <p className="text-sm text-blue-500">{show.promo}</p>
                        <motion.button
                          className="mt-3 bg-red-500 text-white px-3 py-1 rounded text-sm w-full"
                          whileHover={{
                            scale: 1.02,
                            backgroundColor: "#ef4444",
                          }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() =>
                            toast.success(
                              `Opening ${show.title} on ${show.platform}!`
                            )
                          }
                        >
                          Watch Now
                        </motion.button>
                      </motion.div>
                    ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      )}

      {/* Include Knot Script */}
      <KnotScript onLoad={handleSdkLoad} onError={handleSdkError} />

      {/* Transaction Modal */}
      {renderTransactionModal()}

      {/* Toast Container */}
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}
