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

// Update the merchant IDs list with all the ones from documentation
const MERCHANT_LIST = [
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
    MERCHANT_LIST[0].id
  );
  const [selectedProduct, setSelectedProduct] =
    useState<Product>("card_switcher");

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
      if (!sdkLoaded) {
        console.warn("SDK not loaded yet");
        return;
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
    [sdkLoaded, selectedMerchant, selectedProduct]
  );

  // Initiate Knot Link flow
  const initiateKnotLink = useCallback(async () => {
    if (!user) {
      setError("You must be logged in to connect with Knot");
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
  }, [user, createSession, openKnotLink]);

  // Handle SDK load
  const handleSdkLoad = useCallback(() => {
    setSdkLoaded(true);
    console.log("Knot SDK loaded");
  }, []);

  return (
    <div className="w-full">
      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mb-6 space-y-4 rounded-md bg-white p-6 shadow-sm">
        <h3 className="text-center text-lg font-medium">Connect your accounts</h3>
        <p className="text-center text-gray-600">
          Securely connect your financial accounts to unlock personalized deals based on your spending habits.
        </p>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Select product:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {PRODUCT_TYPES.map((product) => (
                <button
                  key={product.id}
                  onClick={() => setSelectedProduct(product.id as Product)}
                  className={`rounded-lg border px-4 py-3 text-center transition ${
                    selectedProduct === product.id
                      ? "border-primary bg-blue-50 text-primary"
                      : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {product.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="merchantSelect" className="mb-1 block text-sm font-medium text-gray-700">
              Select a merchant to connect:
            </label>
            <select
              id="merchantSelect"
              value={selectedMerchant}
              onChange={(e) => setSelectedMerchant(Number(e.target.value))}
              className="w-full rounded-lg border border-gray-300 p-3 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {MERCHANT_LIST.map((merchant) => (
                <option key={merchant.id} value={merchant.id}>
                  {merchant.name} (ID: {merchant.id})
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={initiateKnotLink}
          disabled={loading || !sdkLoaded}
          className="w-full rounded-lg bg-primary py-3 text-center font-medium text-white shadow-sm hover:bg-primary-dark disabled:bg-gray-400"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg
                className="mr-2 h-4 w-4 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
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
            </span>
          ) : (
            "Connect Your Accounts with Knot"
          )}
        </button>

        {sessionId && (
          <div className="mt-2 text-xs text-gray-500">
            <p>Client ID: {process.env.NEXT_PUBLIC_KNOT_CLIENT_ID || "310a12cb-54c0-4021-b683-3aa5bc38b718"}</p>
            <p>Product: {selectedProduct}</p>
            <p>Merchant ID: {selectedMerchant}</p>
            <p>Session ID: {sessionId}</p>
          </div>
        )}
      </div>

      <KnotScript onLoad={handleSdkLoad} />
    </div>
  );
};

export default KnotLink;
