// Script to test Knot session creation directly
const fetch = require("node-fetch");

async function testKnotSessionApi() {
  try {
    console.log("Testing Knot session creation API...");

    // API Key from the .env file
    const apiKey = "2f3794159bf842cf872b75c152b15682";
    console.log(
      `Using API Key: ${apiKey.substring(0, 4)}...${apiKey.substring(
        apiKey.length - 4
      )}`
    );

    // Test user ID
    const userId = "test-user-" + Date.now();
    console.log(`Using User ID: ${userId}`);

    // Try different API endpoints
    const endpoints = [
      "https://api.knotapi.com/api/products/card_switcher/session",
      "https://api.knotapi.io/api/products/card_switcher/session",
      "https://api.knotapi.com/api/card_switcher/session",
      "https://api.knotapi.io/api/card_switcher/session",
    ];

    // Try different auth methods
    const authMethods = [
      { name: "Bearer token", headers: { Authorization: `Bearer ${apiKey}` } },
      { name: "API key in header", headers: { "X-API-Key": apiKey } },
      { name: "No auth", headers: {} },
    ];

    // Try all combinations
    for (const endpoint of endpoints) {
      console.log(`\nTrying endpoint: ${endpoint}`);

      for (const auth of authMethods) {
        console.log(`\n  Using auth method: ${auth.name}`);

        try {
          const response = await fetch(endpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              ...auth.headers,
            },
            body: JSON.stringify({
              user_id: userId,
            }),
          });

          console.log(`  Response status: ${response.status}`);
          console.log(
            `  Response headers:`,
            Object.fromEntries([...response.headers.entries()])
          );

          const responseText = await response.text();
          console.log(`  Response body: ${responseText}`);

          if (response.ok) {
            try {
              const data = JSON.parse(responseText);
              if (data.session_id) {
                console.log(`  ✅ SUCCESS! Session ID: ${data.session_id}`);
                console.log(
                  `  Working configuration: ${endpoint} with ${auth.name}`
                );
              } else {
                console.log(`  ⚠️ Response OK but no session_id in response`);
              }
            } catch (e) {
              console.log(`  ⚠️ Response OK but not valid JSON`);
            }
          } else {
            console.log(`  ❌ Request failed`);
          }
        } catch (err) {
          console.log(`  ❌ Error making request: ${err.message}`);
        }
      }
    }

    console.log("\nTest complete");
  } catch (error) {
    console.error("Test failed:", error);
  }
}

testKnotSessionApi();
