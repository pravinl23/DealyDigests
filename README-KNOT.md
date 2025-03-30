# Setting Up Knot Integration in DealyDigest

This guide provides instructions on how to set up the Knot SDK integration in the DealyDigest application based on the official [Knot Web SDK Documentation](https://docs.knotapi.com/docs/web).

## Prerequisites

1. A Knot account and access to the [Customer Dashboard](https://docs.knotapi.com/docs/customer-dashboard)
2. Client ID and Secret from your Knot dashboard (for both development and production environments)
3. Your domains allowlisted in the Knot dashboard

## Setup Steps

### 1. Environment Variables

Add the following variables to your `.env.local` file:

```
NEXT_PUBLIC_KNOT_CLIENT_ID=your_knot_client_id_here
KNOT_API_SECRET=your_knot_api_secret_here
```

Replace `your_knot_client_id_here` with your actual Knot Client ID and `your_knot_api_secret_here` with your Knot API Secret.

### 2. Domain Allowlisting (For Web Integration)

In your Knot Customer Dashboard:

1. Go to the Configuration section
2. Add your domains to the allowlist for both development and production environments

### 3. Install the Knot SDK

Install the Knot SDK using npm:

```bash
npm install knotapi-js@next --save
```

### 4. Import and Initialize the SDK

Import and initialize the SDK in your React component:

```typescript
import KnotapiJS from "knotapi-js";

// Initialize the SDK
const knotapi = new KnotapiJS();

// Open the Knot UI
knotapi.open({
  sessionId: "your_session_id",
  clientId: "your_client_id",
  environment: "development", // or "production"
  product: "card_switcher", // or "transaction_link"
  entryPoint: "onboarding",
  useCategories: true,
  useSearch: true,
  merchantIds: [17], // Optional, for specific merchants
  onSuccess: (product, details) => { ... },
  onError: (product, errorCode, message) => { ... },
  onExit: (product) => { ... },
  onEvent: (product, event, merchant, payload, taskId) => { ... }
});
```

## How It Works

1. When a user signs in, they see a "Connect Your Accounts with Knot" button
2. Clicking this button initiates the Knot Link flow:
   - The frontend requests a session from our API
   - Our API calls Knot's API to create a session
   - The session ID is returned to the frontend
   - The Knot SDK is initialized with this session ID and opens the Knot Link interface
3. The user authenticates with their financial providers through Knot
4. On successful connection, the onSuccess callback is triggered

## Creating a Session

For a production implementation, your server needs to create a session:

```typescript
async createSession(userId: string) {
  const response = await fetch('https://api.knotapi.com/api/products/card_switcher/session', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      user_id: userId,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to create session: ${response.statusText}`);
  }

  return await response.json();
}
```

## Event Handling

The SDK provides several events you can handle:

### `onSuccess`

Called when a user successfully logs in to a merchant and their card is switched:

```javascript
onSuccess: (product, details) => {
  console.log("Merchant connected:", details.merchantName);
};
```

### `onError`

Called when an error occurs during SDK initialization:

```javascript
onError: (product, errorCode, message) => {
  console.error("Error:", errorCode, message);
};
```

Common error codes:

- `Session_Not_Found`: The session ID is invalid
- `Session_Expired`: The session has expired
- `Client_ID_Not_Found`: The client ID is invalid
- `Merchant_ID_Not_Found`: The merchant ID is required for transaction_link

### `onExit`

Called when a user closes the SDK:

```javascript
onExit: (product) => {
  console.log("User exited the flow");
};
```

### `onEvent`

Called for various events during the SDK flow:

```javascript
onEvent: (product, event, merchant, payload, taskId) => {
  console.log("Event:", event, "for merchant:", merchant);
};
```

## Troubleshooting

### Session_Not_Found Error

If you're receiving a "Session_Not_Found" error:

1. Make sure your server successfully creates a session with the Knot API
2. Verify that the session ID returned from the API is correctly passed to the SDK
3. Check that the session hasn't expired
4. Make sure you're using the correct API endpoint: `https://api.knotapi.com/api/products/card_switcher/session`

### SDK Loading Issues

Make sure the SDK is properly installed and imported:

```javascript
// Check if the SDK is available
try {
  const KnotapiJS = await import("knotapi-js");
  const knotapi = new KnotapiJS.default();
  // SDK is loaded and initialized
} catch (error) {
  console.error("Error loading Knot SDK:", error);
}
```

## Testing

To test with real credentials:

1. Implement the actual API calls to Knot as described above
2. For testing merchant logins, refer to the [Testing Merchant Logins](https://docs.knotapi.com/docs/testing-merchant-logins) documentation

## Resources

- [Knot Web SDK Documentation](https://docs.knotapi.com/docs/web)
- [Knot API Documentation](https://docs.knotapi.com/reference)
- [Testing Merchant Logins](https://docs.knotapi.com/docs/testing-merchant-logins)
