"use client";

import { useState, useCallback, useEffect } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import KnotScript from "./knot-script";

// Define types for the Knot SDK callbacks
type Product = "card_switcher" | "transaction_link";
type MerchantDetails = { merchantName: string };
type ErrorCode =
  | "Session_Not_Found"
  | "Session_Expired"
  | "Client_ID_Not_Found"
  | "Merchant_ID_Not_Found"
  | string;
type KnotEvent = string;

// Popular merchant IDs for Knot testing
const POPULAR_MERCHANTS = {
  DOORDASH: 19, // Example merchant ID
  UBER_EATS: 36,
  NETFLIX: 16,
  AMAZON: 44,
  SPOTIFY: 13,
};

// Product types with labels
const PRODUCT_TYPES = [
  { id: "card_switcher", label: "Card Switcher" },
  { id: "transaction_link", label: "Transaction Link" },
];

const KnotLink = () => {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [selectedMerchant, setSelectedMerchant] = useState<number>(
    POPULAR_MERCHANTS.DOORDASH
  );
  const [selectedProduct, setSelectedProduct] =
    useState<Product>("card_switcher");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Try to check if SDK is already loaded on mount
    if (typeof window !== "undefined" && window.knotapi) {
      setSdkLoaded(true);
      console.log("Knot SDK already available on mount");
    }
    return () => setMounted(false);
  }, []);

  // Function to create a session from our API
  const createSession = useCallback(async () => {
    if (!user) {
      setError("You must be logged in to connect with Knot");
      return null;
    }

    try {
      setLoading(true);
      setError(null);

      // Get user ID from Auth0
      const userId = user.sub || user.id;
      console.log("Creating Knot session for user:", userId);

      // Debug the request we're about to make
      const requestPayload = {
        userId: userId,
        product: selectedProduct,
      };
      console.log("Request payload:", JSON.stringify(requestPayload));

      const response = await fetch("/api/knot/create-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestPayload),
      });

      // Log the raw response
      console.log("Response status:", response.status);
      console.log(
        "Response headers:",
        Object.fromEntries([...response.headers.entries()])
      );

      const text = await response.text();
      let data;

      try {
        // Try to parse as JSON
        data = JSON.parse(text);
        console.log("Session creation response data:", data);
      } catch (parseError) {
        console.error("Error parsing response as JSON:", parseError);
        console.log("Raw response:", text);
        throw new Error("Invalid JSON response from server");
      }

      if (!response.ok) {
        throw new Error(
          `Failed to create Knot session: ${
            data.details || data.error || response.statusText
          }`
        );
      }

      // Check for session_id in response (API might return it as session or session_id)
      const sessionId = data.session_id || data.session;
      if (!sessionId) {
        throw new Error("Session ID not found in response");
      }

      console.log("Received session ID:", sessionId);
      setSessionId(sessionId);
      return sessionId;
    } catch (err) {
      console.error("Error creating session:", err);
      setError(
        "Failed to create session: " +
          (err instanceof Error ? err.message : String(err))
      );
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, selectedProduct]);

  // Function to open Knot Link with the SDK
  const openKnotLink = useCallback(
    async (sid: string) => {
      if (!mounted) {
        console.warn("Component not mounted yet");
        return;
      }

      if (!sdkLoaded) {
        console.warn("SDK not loaded yet");

        // Retry checking for SDK
        if (typeof window !== "undefined" && window.knotapi) {
          console.log("Found Knot SDK on window object, proceeding...");
          setSdkLoaded(true);
        } else {
          setError(
            "Knot SDK not loaded. Please refresh the page and try again."
          );
          setLoading(false);
          return;
        }
      }

      try {
        setLoading(true);
        setError(null);

        // Get client ID from environment or use hardcoded value
        const clientId =
          process.env.NEXT_PUBLIC_KNOT_CLIENT_ID ||
          "310a12cb-54c0-4021-b683-3aa5bc38b718";

        console.log("Using client ID:", clientId);
        console.log("Using session ID:", sid);
        console.log("Using merchant ID:", selectedMerchant);
        console.log("Using product:", selectedProduct);

        // Using the proper SDK initialization according to docs
        if (window.knotapi) {
          window.knotapi.open({
            // Required parameters according to docs
            sessionId: sid,
            clientId: clientId,
            environment: "development",
            product: selectedProduct,
            merchantIds: [selectedMerchant], // Required for transaction_link

            // Optional parameters
            entryPoint: "onboarding",
            companyName: "DealyDigest",
            useCategories: true,
            useSearch: true,

            // Callbacks
            onSuccess: (product: Product, details: MerchantDetails) => {
              console.log("Knot success:", product, details);
              setLoading(false);

              // Show success message when using the real API
              alert(
                `Successfully connected to ${
                  details.merchantName || "merchant"
                }`
              );
            },
            onError: (
              product: Product,
              errorCode: ErrorCode,
              message: string
            ) => {
              console.error("Knot Link error:", product, errorCode, message);
              // Log detailed debugging info
              console.error("Error details:");
              console.error("- Product used:", product);
              console.error("- Error code:", errorCode);
              console.error("- Error message:", message);
              console.error("- Client ID used:", clientId);
              console.error("- Session ID used:", sid);
              console.error("- Merchant ID used:", selectedMerchant);

              setError(`Error during Knot connection: ${message}`);
              setLoading(false);
            },
            onExit: (product: Product) => {
              console.log("User exited Knot Link:", product);
              setLoading(false);
            },
            onEvent: (
              product: Product,
              event: KnotEvent,
              merchant: string,
              payload: any,
              taskId?: string
            ) => {
              console.log(
                "Knot event:",
                product,
                event,
                merchant,
                payload,
                taskId
              );
            },
          });
        } else {
          throw new Error("Knot SDK not initialized");
        }
      } catch (err) {
        console.error("Error opening Knot Link:", err);
        setError(
          "Failed to open Knot Link: " +
            (err instanceof Error ? err.message : String(err))
        );
        setLoading(false);
      }
    },
    [sdkLoaded, selectedMerchant, selectedProduct, mounted]
  );

  // Initiate Knot Link flow
  const initiateKnotLink = useCallback(async () => {
    if (!user) {
      setError("You must be logged in to connect with Knot");
      return;
    }

    if (!mounted) {
      setError("Component not fully mounted yet. Please try again.");
      return;
    }

    try {
      // Create a session and then open Knot Link
      const sid = await createSession();
      if (sid) {
        await openKnotLink(sid);
      }
    } catch (err) {
      console.error("Error initiating Knot Link flow:", err);
      setError(
        "Failed to initialize Knot: " +
          (err instanceof Error ? err.message : String(err))
      );
      setLoading(false);
    }
  }, [user, createSession, openKnotLink, mounted]);

  // Handle SDK load
  const handleSdkLoad = useCallback(() => {
    setSdkLoaded(true);
    console.log("Knot SDK loaded");
  }, []);

  // Change selected merchant
  const handleMerchantChange = (merchantId: number) => {
    setSelectedMerchant(merchantId);
  };

  // Change selected product
  const handleProductChange = (product: Product) => {
    setSelectedProduct(product);
  };

  return (
    <div className="my-4 w-full max-w-md p-4 bg-white rounded-lg shadow-sm border border-gray-200">
      <KnotScript onLoad={handleSdkLoad} />
      <h3 className="text-lg font-medium mb-2">Connect your accounts</h3>
      <p className="text-sm text-gray-600 mb-4">
        Securely connect your financial accounts to unlock personalized deals
        based on your spending habits.
      </p>

      {/* Product type selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Select product:
        </label>
        <div className="grid grid-cols-2 gap-2">
          {PRODUCT_TYPES.map((product) => (
            <button
              key={product.id}
              onClick={() => handleProductChange(product.id as Product)}
              className={`p-2 rounded border ${
                selectedProduct === product.id
                  ? "bg-blue-100 border-blue-500"
                  : "border-gray-300"
              }`}
            >
              {product.label}
            </button>
          ))}
        </div>
      </div>

      {/* Merchant selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Select a merchant to connect:
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleMerchantChange(POPULAR_MERCHANTS.DOORDASH)}
            className={`p-2 rounded border ${
              selectedMerchant === POPULAR_MERCHANTS.DOORDASH
                ? "bg-blue-100 border-blue-500"
                : "border-gray-300"
            }`}
          >
            DoorDash
          </button>
          <button
            onClick={() => handleMerchantChange(POPULAR_MERCHANTS.UBER_EATS)}
            className={`p-2 rounded border ${
              selectedMerchant === POPULAR_MERCHANTS.UBER_EATS
                ? "bg-blue-100 border-blue-500"
                : "border-gray-300"
            }`}
          >
            UberEats
          </button>
          <button
            onClick={() => handleMerchantChange(POPULAR_MERCHANTS.NETFLIX)}
            className={`p-2 rounded border ${
              selectedMerchant === POPULAR_MERCHANTS.NETFLIX
                ? "bg-blue-100 border-blue-500"
                : "border-gray-300"
            }`}
          >
            Netflix
          </button>
          <button
            onClick={() => handleMerchantChange(POPULAR_MERCHANTS.AMAZON)}
            className={`p-2 rounded border ${
              selectedMerchant === POPULAR_MERCHANTS.AMAZON
                ? "bg-blue-100 border-blue-500"
                : "border-gray-300"
            }`}
          >
            Amazon
          </button>
        </div>
      </div>

      <button
        onClick={initiateKnotLink}
        disabled={loading || !sdkLoaded}
        className="w-full rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-500 disabled:bg-blue-300 flex items-center justify-center"
      >
        {loading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Connecting...
          </>
        ) : !sdkLoaded ? (
          <>Loading Knot SDK...</>
        ) : (
          <>Connect Your Accounts with Knot</>
        )}
      </button>
      {error && <p className="mt-2 text-red-500 text-sm">{error}</p>}
      <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
        <p className="font-mono">SDK Loaded: {sdkLoaded ? "Yes" : "No"}</p>
        <p className="font-mono">
          Client ID:{" "}
          {process.env.NEXT_PUBLIC_KNOT_CLIENT_ID ||
            "310a12cb-54c0-4021-b683-3aa5bc38b718"}
        </p>
        <p className="font-mono">Product: {selectedProduct}</p>
        <p className="font-mono">Merchant ID: {selectedMerchant}</p>
        {sessionId && <p className="font-mono">Session ID: {sessionId}</p>}
      </div>
    </div>
  );
};

export default KnotLink;
