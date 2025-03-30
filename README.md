# DealyDigests

DealyDigests ([dealydigest.tech](dealydigest.tech)) is a smart credit card recommendation platform that helps users maximize their credit card rewards by suggesting the best card to use based on location, merchant category, and their existing card portfolio.

## Features

- **Smart Card Recommendations**: Get personalized credit card recommendations based on:
  - Merchant location (using Google Maps integration)
  - Merchant Category Codes (MCC)
  - Your existing credit card portfolio
  - Real-time reward rate calculations

- **Interactive Map Interface**: Select merchant locations easily using an interactive Google Maps interface

- **Merchant Category Support**:
  - Hotels and Lodging (MCC: 3501-3505, 7011)
  - Restaurants (MCC: 5811-5814)
  - Grocery Stores (MCC: 5411, 5499)
  - Gas Stations (MCC: 5541-5542)
  - And more...

- **Detailed Recommendations**: Each recommendation includes:
  - Best card to use
  - Detailed explanation of why it's the best choice
  - Expected reward rate
  - Card-specific benefits that apply

## Getting Started

### Prerequisites

- Node.js (v15.2.4 or higher)
- MongoDB database
- Google Maps API key
- Auth0 account for authentication

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
MONGODB_URI=your_mongodb_connection_string
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
AUTH0_SECRET=your_auth0_secret
AUTH0_BASE_URL=your_auth0_base_url
AUTH0_ISSUER_BASE_URL=your_auth0_issuer_url
AUTH0_CLIENT_ID=your_auth0_client_id
AUTH0_CLIENT_SECRET=your_auth0_client_secret
```

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/DealyDigests.git
cd DealyDigests
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
npm start
```

## Project Structure

```
dealydigest/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── recommend-card/
│   │   │       └── route.ts
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   └── recommend/
│   │       └── [authId]/
│   │           └── page.tsx
│   ├── components/
│   │   └── card-display.tsx
│   └── types/
│       └── index.ts
├── public/
├── .env.local
└── package.json
```

## API Endpoints

### POST /api/recommend-card

Recommends the best credit card for a specific merchant location and category.

**Request Body:**
```json
{
  "authId": "user_auth_id",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "mcc": "3501"
}
```

**Response:**
```json
{
  "cardName": "Card Name",
  "reason": "Detailed explanation",
  "last4": "1234"
}
```

## Technologies Used

- **Frontend**:
  - Next.js 15.2.4
  - React 19.0.0
  - Google Maps JavaScript API
  - Tailwind CSS

- **Backend**:
  - MongoDB
  - Auth0 Authentication
  - Next.js API Routes

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Google Maps Platform for location services
- Auth0 for authentication
- MongoDB for database services
