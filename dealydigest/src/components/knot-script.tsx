"use client";

import { useEffect, useState } from "react";

interface KnotScriptProps {
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

// This component initializes the Knot SDK
export default function KnotScript({ onLoad, onError }: KnotScriptProps) {
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Only run in browser
    if (typeof window === "undefined" || initialized) return;

    // Delay initialization slightly to ensure DOM is fully rendered
    const timeoutId = setTimeout(() => {
      const initKnot = async () => {
        try {
          console.log("Initializing KnotapiJS from npm package");

          // Check if it's already initialized
          if (window.knotapi) {
            console.log("KnotapiJS already initialized");
            setInitialized(true);
            if (onLoad) onLoad();
            return;
          }

          // Import according to their example
          const KnotapiJSModule = await import("knotapi-js");
          const KnotapiJS = KnotapiJSModule.default;

          if (!KnotapiJS) {
            throw new Error("Failed to load KnotapiJS module");
          }

          // Create a new instance as shown in the docs
          window.knotapi = new KnotapiJS();

          console.log("KnotapiJS initialized successfully");

          // Test the instance
          if (!window.knotapi || typeof window.knotapi.open !== "function") {
            throw new Error(
              "KnotapiJS initialized but API methods are missing"
            );
          }

          setInitialized(true);
          if (onLoad) onLoad();
        } catch (err) {
          console.error("Error initializing KnotapiJS:", err);
          const errorObj = err instanceof Error ? err : new Error(String(err));
          setError(errorObj);
          if (onError) onError(errorObj);
        }
      };

      initKnot();
    }, 500); // 500ms delay to ensure DOM is ready

    return () => {
      clearTimeout(timeoutId);
    };
  }, [initialized, onLoad, onError]);

  // Add console error display just for debugging
  useEffect(() => {
    if (error) {
      console.error("KnotScript error:", error);
    }
  }, [error]);

  return null;
}

// Add type declaration for the Knot SDK
declare global {
  interface Window {
    knotapi?: any;
  }
}
