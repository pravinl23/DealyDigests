// This is a direct test of the Knot API using the correct format
// Run with: node src/scripts/direct-test.js

// CommonJS version for Node.js
const fetch = require("node-fetch");

async function main() {
  try {
    console.log("Starting direct test of Knot API");

    // Setup test parameters
    const userId = "test-user-" + Date.now(); // Unique user ID
    const productType = "transaction_link"; // Product type

    // Try different auth approaches
    const clientId = "310a12cb-54c0-4021-b683-3aa5bc38b718"; // From your code
    const apiSecret = "2f3794159bf842cf872b75c152b15682"; // From your code

    console.log("Using User ID:", userId);
    console.log("Using Product:", productType);
    console.log("Using Client ID:", clientId);
    console.log("Using API Secret:", apiSecret.substring(0, 4) + "...");

    // Create payload based on the example
    const payload = {
      type: productType,
      external_user_id: userId,
      phone_number: "+11234567890",
      email: "test@example.com",
      card: { blocked: false, has_funds: true },
      processor_token: `processor-token-${Date.now()}`,
    };

    console.log("Payload:", JSON.stringify(payload));

    // Try the API endpoint
    const apiUrl = "https://development.knotapi.com/session/create";
    console.log("Making API call to:", apiUrl);

    // Try several authentication approaches
    const authMethods = [
      // Method 1: Basic Auth
      {
        name: "Basic Auth",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "Knot-Version": "2.0",
          Authorization: `Basic ${Buffer.from(
            `${clientId}:${apiSecret}`
          ).toString("base64")}`,
        },
      },
      // Method 2: Bearer Auth with API Secret
      {
        name: "Bearer with API Secret",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "Knot-Version": "2.0",
          Authorization: `Bearer ${apiSecret}`,
        },
      },
      // Method 3: Bearer Auth with Client ID
      {
        name: "Bearer with Client ID",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "Knot-Version": "2.0",
          Authorization: `Bearer ${clientId}`,
        },
      },
      // Method 4: Separate headers for Client-ID and API Key
      {
        name: "Separate headers",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "Knot-Version": "2.0",
          "X-Client-ID": clientId,
          "X-API-Key": apiSecret,
        },
      },
      // Method 5: No Auth, just API version header
      {
        name: "No Auth, just API version",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "Knot-Version": "2.0",
        },
      },
    ];

    // Try each auth method
    for (const method of authMethods) {
      console.log(`\nTrying ${method.name}...`);

      try {
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: method.headers,
          body: JSON.stringify(payload),
        });

        // Log response details
        console.log(`${method.name} - Response status:`, response.status);

        const responseText = await response.text();
        console.log(`${method.name} - Raw response:`, responseText);

        try {
          const responseData = JSON.parse(responseText);

          if (responseData.session_id) {
            console.log(
              `SUCCESS with ${method.name}: Got session ID:`,
              responseData.session_id
            );
            // Exit early on success
            return;
          } else if (responseData.error_message) {
            console.log(
              `ERROR with ${method.name}:`,
              responseData.error_message
            );
          }
        } catch (e) {
          console.error(
            `Could not parse response as JSON for ${method.name}:`,
            e
          );
        }
      } catch (error) {
        console.error(`Request failed for ${method.name}:`, error);
      }
    }
  } catch (error) {
    console.error("Test failed with error:", error);
  }
}

main().catch(console.error);
