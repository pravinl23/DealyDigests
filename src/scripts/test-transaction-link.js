// Script to test Knot Transaction Link session creation
const fetch = require("node-fetch");

async function testTransactionLinkApi() {
  try {
    console.log("Testing Knot Transaction Link session creation...");

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

    // Try the transaction_link endpoint
    const endpoint =
      "https://api.knotapi.com/api/products/transaction_link/session";

    console.log(`Making request to: ${endpoint}`);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
        }),
      });

      console.log(`Response status: ${response.status}`);
      console.log(
        `Response headers:`,
        Object.fromEntries([...response.headers.entries()])
      );

      const responseText = await response.text();
      console.log(`Response body: ${responseText}`);

      if (response.ok) {
        try {
          const data = JSON.parse(responseText);
          if (data.session_id) {
            console.log(`✅ SUCCESS! Session ID: ${data.session_id}`);
            console.log(`Session expires at: ${data.expires_at}`);
          } else {
            console.log(`⚠️ Response OK but no session_id in response`);
          }
        } catch (e) {
          console.log(`⚠️ Response OK but not valid JSON`);
        }
      } else {
        console.log(`❌ Request failed`);
      }
    } catch (err) {
      console.log(`❌ Error making request: ${err.message}`);
    }

    console.log("\nTest complete");
  } catch (error) {
    console.error("Test failed:", error);
  }
}

testTransactionLinkApi();
