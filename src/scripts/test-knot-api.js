// This script tests the Knot API directly without going through Next.js
// Run it with: node src/scripts/test-knot-api.js

const fetch = require("node-fetch");

async function testKnotAPI() {
  const apiKey = "2f3794159bf842cf872b75c152b15682";
  const clientId = "310a12cb-54c0-4021-b683-3aa5bc38b718";
  const userId = "test-user-" + Date.now(); // Use a unique user ID

  console.log("Testing Knot API with:");
  console.log("- API Key:", apiKey.substring(0, 4) + "...");
  console.log("- Client ID:", clientId);
  console.log("- User ID:", userId);

  // Try different possible domains for the Knot API
  const possibleEndpoints = [
    "https://api.knotapi.com/api/products/card_switcher/session",
    "https://api.knotapi.io/api/products/card_switcher/session",
    "https://api.knot.com/api/products/card_switcher/session",
    "https://api.knot.io/api/products/card_switcher/session",
    "https://api.knotapi.com/v1/products/card_switcher/session",
    "https://knotapi.com/api/products/card_switcher/session",
  ];

  for (const apiEndpoint of possibleEndpoints) {
    try {
      // 1. Create a session
      console.log(`\nTrying endpoint: ${apiEndpoint}`);

      const sessionResponse = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
        }),
        // Set a shorter timeout to avoid waiting too long for failed endpoints
        timeout: 5000,
      });

      console.log("Response status:", sessionResponse.status);

      if (!sessionResponse.ok) {
        const errorText = await sessionResponse.text();
        console.error(
          "Session creation failed:",
          sessionResponse.status,
          errorText
        );
        continue;
      }

      const sessionData = await sessionResponse.json();
      console.log("Session created successfully:");
      console.log(sessionData);

      console.log("\nWorking endpoint found! Use this configuration:");
      console.log(`API Endpoint: ${apiEndpoint}`);
      console.log(`sessionId: "${sessionData.session_id}",`);
      console.log(`clientId: "${clientId}",`);

      // If we get a successful response, break the loop
      return;
    } catch (error) {
      console.error(`Error with endpoint ${apiEndpoint}:`, error.message);
    }
  }

  console.log(
    "\nAll endpoints failed. Please check your API credentials or network connection."
  );
}

testKnotAPI();
