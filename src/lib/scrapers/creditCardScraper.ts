import axios from "axios";
import * as cheerio from "cheerio";
import puppeteer from "puppeteer";
import {
  ICreditCardOffer,
  RewardCategory,
  CreditCardOffer,
} from "../models/creditCardOffer";
import { connectToDatabase, disconnectFromDatabase } from "../database";

/**
 * Interface for card data extracted from websites
 */
interface CardData {
  cardName: string;
  issuer: string;
  rewardsRate: string;
  annualFee: string;
  signupBonus: string;
  description: string;
}

/**
 * CreditCardScraper class for extracting credit card offers from various sources
 */
export class CreditCardScraper {
  // Logger setup
  private logger = {
    info: (message: string) => console.log(`[INFO] ${message}`),
    error: (message: string, error?: any) =>
      console.error(`[ERROR] ${message}`, error || ""),
  };

  /**
   * Constructor
   */
  constructor() {
    this.logger.info("CreditCardScraper initialized");
  }

  /**
   * Parse reward categories from a description
   */
  private parseRewardCategories(description: string): RewardCategory[] {
    const categories: RewardCategory[] = [];
    const lowerDesc = description.toLowerCase();

    // Check for each category
    if (
      lowerDesc.includes("travel") ||
      lowerDesc.includes("airline") ||
      lowerDesc.includes("flight") ||
      lowerDesc.includes("hotel")
    ) {
      categories.push(RewardCategory.TRAVEL);
    }

    if (
      lowerDesc.includes("dining") ||
      lowerDesc.includes("restaurant") ||
      lowerDesc.includes("food")
    ) {
      categories.push(RewardCategory.DINING);
    }

    if (lowerDesc.includes("grocer") || lowerDesc.includes("supermarket")) {
      categories.push(RewardCategory.GROCERIES);
    }

    if (
      lowerDesc.includes("gas") ||
      lowerDesc.includes("fuel") ||
      lowerDesc.includes("station")
    ) {
      categories.push(RewardCategory.GAS);
    }

    if (
      lowerDesc.includes("entertainment") ||
      lowerDesc.includes("movie") ||
      lowerDesc.includes("theater")
    ) {
      categories.push(RewardCategory.ENTERTAINMENT);
    }

    if (
      lowerDesc.includes("shop") ||
      lowerDesc.includes("retail") ||
      lowerDesc.includes("store") ||
      lowerDesc.includes("amazon")
    ) {
      categories.push(RewardCategory.SHOPPING);
    }

    if (
      lowerDesc.includes("stream") ||
      lowerDesc.includes("spotify") ||
      lowerDesc.includes("netflix") ||
      lowerDesc.includes("music")
    ) {
      categories.push(RewardCategory.STREAMING);
    }

    if (
      lowerDesc.includes("utility") ||
      lowerDesc.includes("bill") ||
      lowerDesc.includes("electric") ||
      lowerDesc.includes("water")
    ) {
      categories.push(RewardCategory.UTILITY);
    }

    if (
      lowerDesc.includes("transit") ||
      lowerDesc.includes("transport") ||
      lowerDesc.includes("subway") ||
      lowerDesc.includes("train")
    ) {
      categories.push(RewardCategory.TRANSIT);
    }

    if (
      lowerDesc.includes("business") ||
      lowerDesc.includes("office") ||
      lowerDesc.includes("software")
    ) {
      categories.push(RewardCategory.BUSINESS);
    }

    if (
      lowerDesc.includes("pharmacy") ||
      lowerDesc.includes("drug") ||
      lowerDesc.includes("prescription")
    ) {
      categories.push(RewardCategory.PHARMACY);
    }

    // If no categories were found, add OTHER
    if (categories.length === 0) {
      categories.push(RewardCategory.OTHER);
    }

    return categories;
  }

  /**
   * Parse merchant compatibility from a description
   */
  private parseMerchantCompatibility(description: string): string[] {
    const merchants: string[] = [];
    const lowerDesc = description.toLowerCase();

    // Check for common merchants
    const commonMerchants = [
      "amazon",
      "walmart",
      "target",
      "costco",
      "uber",
      "doordash",
      "grubhub",
      "instacart",
      "netflix",
      "spotify",
      "apple",
      "google",
      "disney",
      "hulu",
      "whole foods",
      "starbucks",
      "mcdonalds",
      "chipotle",
      "lyft",
      "airbnb",
      "delta",
      "southwest",
      "american airlines",
      "united airlines",
      "marriott",
      "hilton",
      "hyatt",
    ];

    for (const merchant of commonMerchants) {
      if (lowerDesc.includes(merchant)) {
        // Capitalize first letter of each word
        merchants.push(
          merchant
            .split(" ")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")
        );
      }
    }

    return merchants;
  }

  /**
   * Scrape NerdWallet credit card offers
   */
  async scrapeNerdWallet(): Promise<ICreditCardOffer[]> {
    this.logger.info("Starting NerdWallet scraper");
    const url = "https://www.nerdwallet.com/best/credit-cards/rewards";
    const source = "NerdWallet";
    const offers: Partial<ICreditCardOffer>[] = [];

    try {
      const { data } = await axios.get(url);
      const $ = cheerio.load(data);

      // NerdWallet uses a specific structure for their cards
      $("._2QL9LA9M._1pFzK91U div._2WcCBQvP").each((i, element) => {
        try {
          // Extract card details
          const cardName = $(element).find("h3._2IcLBNHx").text().trim();
          const issuerEl = $(element).find("div._1KmZYNsI span").first();
          const issuer = issuerEl.text().trim();

          const rewardsRateEl = $(element).find("div._2M4olwUu");
          const rewardsRate = rewardsRateEl.text().trim();

          // Sometimes annual fee is in a different element
          const annualFeeEl = $(element).find("div._2zTNvvnm").first();
          const annualFee = annualFeeEl.text().replace("Annual Fee", "").trim();

          // Get sign-up bonus if available
          const signupBonusEl = $(element).find(
            'div._2M4olwUu:contains("welcome bonus")'
          );
          const signupBonus = signupBonusEl.length
            ? signupBonusEl.text().trim()
            : "";

          // Get the full description
          const descriptionEl = $(element).find("p._3jXSMQY0");
          const description = descriptionEl.text().trim();

          // Parse reward categories and merchant compatibility
          const rewardCategories = this.parseRewardCategories(description);
          const merchantCompatibility =
            this.parseMerchantCompatibility(description);

          // Create the offer object
          const offer: Partial<ICreditCardOffer> = {
            cardName,
            issuer,
            rewardsRate,
            annualFee,
            signupBonus,
            rewardCategories,
            merchantCompatibility,
            source,
            sourceUrl: url,
            scrapedAt: new Date(),
          };

          // Only add valid offers
          if (cardName && issuer) {
            offers.push(offer);
          }
        } catch (innerError) {
          this.logger.error(
            `Error parsing NerdWallet card item: ${innerError}`
          );
        }
      });

      this.logger.info(`Scraped ${offers.length} offers from NerdWallet`);
      return offers as ICreditCardOffer[];
    } catch (error) {
      this.logger.error("Error scraping NerdWallet:", error);
      return [];
    }
  }

  /**
   * Scrape Bankrate credit card offers using Puppeteer
   */
  async scrapeBankrate(): Promise<ICreditCardOffer[]> {
    this.logger.info("Starting Bankrate scraper with Puppeteer");
    const url =
      "https://www.bankrate.com/finance/credit-cards/best-credit-cards/";
    const source = "Bankrate";
    const offers: Partial<ICreditCardOffer>[] = [];

    let browser;
    try {
      // Launch a headless browser
      browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });

      const page = await browser.newPage();
      await page.goto(url, { waitUntil: "networkidle2" });

      // Wait for the content to load
      await page.waitForSelector(".BkrTrophyCARD");

      // Extract data from the page
      const cardData = await page.evaluate(() => {
        const cards: Array<{
          cardName: string;
          issuer: string;
          rewardsRate: string;
          annualFee: string;
          signupBonus: string;
          description: string;
        }> = [];

        // Select all card elements
        document.querySelectorAll(".BkrTrophyCARD").forEach((card) => {
          // Extract card name
          const cardNameEl = card.querySelector(".BkrTrophyCARD__title");
          const cardName = cardNameEl?.textContent?.trim() || "";

          // Extract issuer
          const issuerEl = card.querySelector(".BkrTrophyCARD__issuer");
          const issuer = issuerEl?.textContent?.trim() || "";

          // Extract rewards rate
          const rewardsRateEl = card.querySelector(".BkrTrophyCARD__rewards");
          const rewardsRate = rewardsRateEl?.textContent?.trim() || "";

          // Extract annual fee
          const annualFeeEl = card.querySelector(".BkrTrophyCARD__annualFee");
          const annualFee = annualFeeEl?.textContent?.trim() || "";

          // Extract sign-up bonus
          const signupBonusEl = card.querySelector(
            ".BkrTrophyCARD__welcomeOffer"
          );
          const signupBonus = signupBonusEl?.textContent?.trim() || "";

          // Extract description
          const descriptionEl = card.querySelector(
            ".BkrTrophyCARD__description"
          );
          const description = descriptionEl?.textContent?.trim() || "";

          cards.push({
            cardName,
            issuer,
            rewardsRate,
            annualFee,
            signupBonus,
            description,
          });
        });

        return cards;
      });

      // Process the extracted data
      for (const card of cardData) {
        if (card.cardName && card.issuer) {
          const rewardCategories = this.parseRewardCategories(card.description);
          const merchantCompatibility = this.parseMerchantCompatibility(
            card.description
          );

          offers.push({
            cardName: card.cardName,
            issuer: card.issuer,
            rewardsRate: card.rewardsRate,
            annualFee: card.annualFee,
            signupBonus: card.signupBonus,
            rewardCategories,
            merchantCompatibility,
            source,
            sourceUrl: url,
            scrapedAt: new Date(),
          });
        }
      }

      this.logger.info(`Scraped ${offers.length} offers from Bankrate`);
      return offers as ICreditCardOffer[];
    } catch (error) {
      this.logger.error("Error scraping Bankrate:", error);
      return [];
    } finally {
      // Close the browser
      if (browser) {
        await browser.close();
      }
    }
  }

  /**
   * Scrape The Points Guy credit card offers
   */
  async scrapePointsGuy(): Promise<ICreditCardOffer[]> {
    this.logger.info("Starting The Points Guy scraper");
    const url = "https://thepointsguy.com/cards/";
    const source = "The Points Guy";
    const offers: Partial<ICreditCardOffer>[] = [];

    try {
      const { data } = await axios.get(url);
      const $ = cheerio.load(data);

      // TPG card structure
      $(".tpg-card-item").each((i, element) => {
        try {
          // Extract card details
          const cardName = $(element)
            .find(".tpg-card-item-title")
            .text()
            .trim();

          // Get issuer from card name or specific element
          let issuer = "Unknown";
          const knownIssuers = [
            "Chase",
            "Amex",
            "American Express",
            "Citi",
            "Capital One",
            "Discover",
            "Wells Fargo",
            "Bank of America",
            "U.S. Bank",
          ];

          for (const knownIssuer of knownIssuers) {
            if (cardName.includes(knownIssuer)) {
              issuer = knownIssuer;
              break;
            }
          }

          // Try to get issuer from a specific element if not found
          if (issuer === "Unknown") {
            const issuerEl = $(element).find(".tpg-card-item-issuer");
            if (issuerEl.length) {
              issuer = issuerEl.text().trim();
            }
          }

          // Get the rewards rate
          const rewardsRateEl = $(element).find(".tpg-card-item-reward-rate");
          const rewardsRate = rewardsRateEl.length
            ? rewardsRateEl.text().trim()
            : "Varies";

          // Get annual fee
          const annualFeeEl = $(element).find(".tpg-card-item-annual-fee");
          const annualFee = annualFeeEl.length
            ? annualFeeEl.text().trim()
            : "Unknown";

          // Get sign-up bonus
          const signupBonusEl = $(element).find(".tpg-card-item-bonus");
          const signupBonus = signupBonusEl.length
            ? signupBonusEl.text().trim()
            : "";

          // Get description
          const descriptionEl = $(element).find(".tpg-card-item-description");
          const description = descriptionEl.length
            ? descriptionEl.text().trim()
            : "";

          // Parse reward categories and merchant compatibility
          const rewardCategories = this.parseRewardCategories(description);
          const merchantCompatibility =
            this.parseMerchantCompatibility(description);

          // Create the offer object
          const offer: Partial<ICreditCardOffer> = {
            cardName,
            issuer,
            rewardsRate,
            annualFee,
            signupBonus,
            rewardCategories,
            merchantCompatibility,
            source,
            sourceUrl: url,
            scrapedAt: new Date(),
          };

          // Only add valid offers
          if (cardName) {
            offers.push(offer);
          }
        } catch (innerError) {
          this.logger.error(
            `Error parsing The Points Guy card item: ${innerError}`
          );
        }
      });

      this.logger.info(`Scraped ${offers.length} offers from The Points Guy`);
      return offers as ICreditCardOffer[];
    } catch (error) {
      this.logger.error("Error scraping The Points Guy:", error);
      return [];
    }
  }

  /**
   * Save credit card offers to the database
   */
  async saveToDatabase(offers: ICreditCardOffer[]): Promise<number> {
    if (!offers.length) {
      this.logger.info("No offers to save to database");
      return 0;
    }

    try {
      // Connect to the database
      await connectToDatabase();

      let savedCount = 0;

      // Save each offer, handling duplicates
      for (const offer of offers) {
        try {
          // Use findOneAndUpdate to handle duplicates
          await CreditCardOffer.findOneAndUpdate(
            { cardName: offer.cardName, issuer: offer.issuer },
            { ...offer, scrapedAt: new Date() },
            { upsert: true, new: true }
          );
          savedCount++;
        } catch (error) {
          // Skip duplicate errors
          const mongoError = error as any;
          if (mongoError.code !== 11000) {
            this.logger.error(`Error saving offer: ${offer.cardName}`, error);
          }
        }
      }

      this.logger.info(`Saved ${savedCount} offers to database`);
      return savedCount;
    } catch (error) {
      this.logger.error("Error saving offers to database:", error);
      throw error;
    }
  }

  /**
   * Run all scrapers
   */
  async scrapeAll(): Promise<ICreditCardOffer[]> {
    this.logger.info("Starting to scrape all sources");

    try {
      // Run all scrapers in parallel
      const [nerdWalletOffers, bankrateOffers, pointsGuyOffers] =
        await Promise.all([
          this.scrapeNerdWallet(),
          this.scrapeBankrate(),
          this.scrapePointsGuy(),
        ]);

      // Combine all offers
      const allOffers = [
        ...nerdWalletOffers,
        ...bankrateOffers,
        ...pointsGuyOffers,
      ];

      this.logger.info(
        `Scraped a total of ${allOffers.length} offers from all sources`
      );

      // Save offers to database
      await this.saveToDatabase(allOffers);

      return allOffers;
    } catch (error) {
      this.logger.error("Error during scrape all operation:", error);
      return [];
    }
  }
}
