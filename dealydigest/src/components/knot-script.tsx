"use client";

import { useEffect, useState } from "react";

interface KnotScriptProps {
  onLoad?: () => void;
}

// This component initializes the Knot SDK
export default function KnotScript({ onLoad }: KnotScriptProps) {
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

          // Create a new instance as shown in the docs
          window.knotapi = new KnotapiJS();

          console.log("KnotapiJS initialized successfully");

          setInitialized(true);
          if (onLoad) onLoad();
        } catch (error) {
          console.error("Error initializing KnotapiJS:", error);
          setError(error instanceof Error ? error : new Error(String(error)));
          // Don't call onLoad if there was an error to prevent further issues
        }
      };

      initKnot();
    }, 500); // 500ms delay to ensure DOM is ready

    return () => {
      clearTimeout(timeoutId);
    };
  }, [initialized, onLoad]);

  return null;
}

// Add type declaration for the Knot SDK
declare global {
  interface Window {
    knotapi?: any;
  }
}
