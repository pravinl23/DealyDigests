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

    const initKnot = async () => {
      try {
        console.log("Initializing KnotapiJS from npm package");

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
  }, [initialized, onLoad]);

  return null;
}

// Add type declaration for the Knot SDK
declare global {
  interface Window {
    knotapi?: any;
  }
}
