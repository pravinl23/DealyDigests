"use client";

import { useUser } from "@auth0/nextjs-auth0/client";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { ChevronDown, Music, Video, ShoppingBag } from "lucide-react";
import KnotScript from "@/components/knot-script";

// Types for Knot SDK
type Product = "card_switcher" | "transaction_link";

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

  // Sample connected services
  const connectedServices = [
    { id: 1, name: "American Airlines", date: "3/30/2025" },
    { id: 2, name: "Airbnb", date: "3/29/2025" },
  ];

  // Sample transactions
  const transactions = [
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
  const deals = [
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
    },
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

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/api/auth/login?returnTo=/dashboard");
    }

    // Close dropdown when clicking outside
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [user, isLoading, router]);

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
            8 Offers
          </span>
        </div>
        <p className="mb-4 text-gray-600">
          Exclusive offers and discounts based on your spending patterns and
          card benefits.
        </p>

        <div className="flex gap-2 mb-6">
          <button className="bg-slate-900 text-white px-4 py-2 rounded-full text-sm">
            All Deals
          </button>
          <button className="bg-transparent border border-gray-300 px-4 py-2 rounded-full text-sm">
            Dining
          </button>
          <button className="bg-transparent border border-gray-300 px-4 py-2 rounded-full text-sm">
            Travel
          </button>
          <button className="bg-transparent border border-gray-300 px-4 py-2 rounded-full text-sm">
            Shopping
          </button>
          <button className="bg-transparent border border-gray-300 px-4 py-2 rounded-full text-sm">
            Entertainment
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {deals.map((deal) => (
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
                    {deal.type === "Limited Time" && (
                      <div>
                        Valid at select restaurants only. Maximum cash back of
                        $50 per month.
                      </div>
                    )}
                    <div>Expires: {deal.expires}</div>
                  </div>
                  <button className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <div className="flex space-x-8">
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
              Insights
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
                <button
                  onClick={fetchUserCards}
                  className="text-blue-500 text-sm hover:underline"
                >
                  Refresh
                </button>
              </div>
              <div className="border border-gray-200 rounded-lg p-6 min-h-[200px]">
                {cardsLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                  </div>
                ) : cardsError ? (
                  <div className="flex items-center justify-center h-full text-red-500">
                    {cardsError}
                  </div>
                ) : userCards.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <p>No cards found</p>
                    <p className="text-sm mt-2">
                      Connect with Knot to add your cards
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userCards.map((card, index) => (
                      <div
                        key={index}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-medium">
                              {card.name || "Credit Card"}
                            </div>
                            <div className="text-sm text-gray-500">
                              •••• {card.last4 || "****"}
                              {card.expiry && ` • Expires: ${card.expiry}`}
                            </div>
                          </div>
                          <div className="text-sm font-medium">
                            {card.card_type || "Card"}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Recent Transactions</h2>
                <button className="bg-slate-900 text-white px-3 py-1 rounded-lg text-sm">
                  Add
                </button>
              </div>

              <h2 className="mb-2 font-medium">Recent Transactions</h2>

              <div className="space-y-4">
                {transactions.map((tx) => (
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
      {activeTab === "entertainment" && (
        <div className="py-8 text-center">
          <h2 className="text-xl font-semibold mb-4">
            Entertainment Recommendations
          </h2>
          <p>
            Coming soon! Entertainment recommendations based on your spending
            habits.
          </p>
        </div>
      )}

      {/* Include Knot Script */}
      <KnotScript onLoad={handleSdkLoad} onError={handleSdkError} />
    </div>
  );
}
