# Credit Card Offer Scraper System

This system extracts credit card offers from multiple sources, stores them in MongoDB, and provides an API to access the data.

## Features

- **Multi-source scraping**: Extracts data from NerdWallet, Bankrate, and The Points Guy
- **Scheduled execution**: Runs daily to keep data fresh
- **API endpoints**: Allows filtering and searching card offers
- **Database storage**: Persists scraped data in MongoDB
- **Error handling**: Comprehensive error handling and logging

## Data Structure

For each credit card, the system extracts:

- Card name
- Issuer (Amex, Chase, etc.)
- Rewards rate (e.g., "5% cash back on travel")
- Annual fee
- Sign-up bonus
- Reward categories (dining, travel, groceries, etc.)
- Merchant compatibility (which online stores the card works best with)
- Source website
- Scrape timestamp

## API Endpoints

### Get Credit Card Offers

```
GET /api/credit-cards
```

Query parameters:

- `issuer` - Filter by card issuer (e.g., "Amex")
- `category` - Filter by reward category (e.g., "travel")
- `merchant` - Filter by merchant compatibility (e.g., "Amazon")
- `source` - Filter by source website (e.g., "NerdWallet")
- `limit` - Number of results to return (default: 20)
- `page` - Page number for pagination (default: 1)

Example response:

```json
{
  "success": true,
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "pages": 5
  },
  "data": [
    {
      "cardName": "Chase Sapphire Preferred",
      "issuer": "Chase",
      "rewardsRate": "5x on travel through Chase Ultimate Rewards",
      "annualFee": "$95",
      "signupBonus": "60,000 points after $4,000 spend in first 3 months",
      "rewardCategories": ["travel", "dining"],
      "merchantCompatibility": ["Lyft", "Doordash"],
      "source": "NerdWallet",
      "sourceUrl": "https://www.nerdwallet.com/best/credit-cards/rewards",
      "scrapedAt": "2025-03-30T06:00:00.000Z"
    }
    // ... more cards
  ]
}
```

### Get Credit Card Statistics

```
GET /api/credit-cards/stats
```

Returns statistics about the credit card offers in the database.

Example response:

```json
{
  "success": true,
  "data": {
    "totalCount": 120,
    "latestScrape": "2025-03-30T06:00:00.000Z",
    "issuerStats": [
      { "_id": "Chase", "count": 25 },
      { "_id": "American Express", "count": 20 }
      // ... more issuers
    ],
    "categoryStats": [
      { "_id": "travel", "count": 65 },
      { "_id": "dining", "count": 50 }
      // ... more categories
    ],
    "sourceStats": [
      { "_id": "NerdWallet", "count": 40 },
      { "_id": "Bankrate", "count": 35 }
      // ... more sources
    ],
    "merchantStats": [
      { "_id": "Amazon", "count": 30 },
      { "_id": "Walmart", "count": 25 }
      // ... more merchants
    ]
  }
}
```

### Trigger Manual Scrape

```
POST /api/credit-cards/scrape
```

Manually triggers the credit card scraper to run. In production, this should be protected by authentication.

Example response:

```json
{
  "success": true,
  "message": "Scraper completed successfully. Scraped 120 offers.",
  "count": 120
}
```

## Implementation Details

### Files and Structure

- `src/lib/models/creditCardOffer.ts` - MongoDB schema for credit card offers
- `src/lib/scrapers/creditCardScraper.ts` - Main scraper implementation
- `src/lib/scheduler.ts` - Scheduled job management
- `src/lib/database.ts` - MongoDB connection handling
- `src/app/api/credit-cards/route.ts` - API endpoint for fetching offers
- `src/app/api/credit-cards/scrape/route.ts` - API endpoint for triggering scrapes
- `src/app/api/credit-cards/stats/route.ts` - API endpoint for statistics
- `src/app/api/startup.ts` - Initialization of the scheduler
- `README-CREDIT-CARDS.md` - This documentation

### Scraper Class

The `CreditCardScraper` class has methods for each source:

- `scrapeNerdWallet()` - Uses axios and cheerio for HTML parsing
- `scrapeBankrate()` - Uses puppeteer for JavaScript-rendered content
- `scrapePointsGuy()` - Uses axios and cheerio for HTML parsing
- `scrapeAll()` - Runs all scrapers in parallel
- `saveToDatabase()` - Persists offers to MongoDB

### Scheduler

The system uses `node-schedule` to run the scraper daily at midnight. The schedule is initialized when the Next.js application starts.

## Configuration

### Environment Variables

Add these to your `.env` file:

```
MONGODB_URI=mongodb://username:password@host:port/database
```

### MongoDB Setup

Ensure your MongoDB instance is running and accessible. The system will create the necessary collections automatically.

## Testing

To manually test the system:

1. Start your Next.js application
2. Make a POST request to `/api/credit-cards/scrape` to trigger a scrape
3. Once completed, make a GET request to `/api/credit-cards` to view the results

## Maintenance

The web scraper depends on the structure of the source websites. If those websites change their HTML structure, the scraper will need to be updated. Regular monitoring is recommended to ensure it continues to function correctly.
