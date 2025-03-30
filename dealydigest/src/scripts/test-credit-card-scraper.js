// Script to test the credit card scraper
// Run with: node src/scripts/test-credit-card-scraper.js

// Set up environment - import esm modules
require("dotenv").config();

async function main() {
  try {
    console.log("Starting credit card scraper test...");

    // Dynamically import ESM modules
    const { CreditCardScraper } = await import(
      "../lib/scrapers/creditCardScraper.js"
    );
    const { connectToDatabase, disconnectFromDatabase } = await import(
      "../lib/database.js"
    );

    // Connect to MongoDB
    console.log("Connecting to MongoDB...");
    await connectToDatabase();

    // Initialize the scraper
    console.log("Initializing scraper...");
    const scraper = new CreditCardScraper();

    // Choose a scraping method to test
    // Uncomment the one you want to test:

    // Option 1: Test a specific source
    // const offers = await scraper.scrapeNerdWallet();
    // console.log(`Scraped ${offers.length} offers from NerdWallet`);

    // Option 2: Test scraping all sources
    console.log("Running full scraper...");
    const allOffers = await scraper.scrapeAll();
    console.log(
      `Scraped a total of ${allOffers.length} offers from all sources`
    );

    // Print a sample of the results
    if (allOffers.length > 0) {
      console.log("\nSample credit card:");
      console.log(JSON.stringify(allOffers[0], null, 2));
    }

    // Disconnect from MongoDB
    await disconnectFromDatabase();

    console.log("Test completed successfully!");
  } catch (error) {
    console.error("Error during credit card scraper test:", error);
  }
}

// Run the test
main();
