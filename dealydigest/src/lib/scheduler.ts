import schedule from "node-schedule";
import { CreditCardScraper } from "./scrapers/creditCardScraper";
import { connectToDatabase, disconnectFromDatabase } from "./database";

// Store the scheduled jobs
const scheduledJobs: Record<string, schedule.Job> = {};

/**
 * Schedule the credit card scraper to run daily
 */
export function scheduleCreditCardScraper(cronExpression = "0 0 * * *"): void {
  // Cancel any existing job
  if (scheduledJobs["creditCardScraper"]) {
    scheduledJobs["creditCardScraper"].cancel();
    console.log("Canceled existing credit card scraper job");
  }

  // Schedule the new job
  const job = schedule.scheduleJob(
    "creditCardScraper",
    cronExpression,
    async () => {
      console.log(
        `[${new Date().toISOString()}] Running scheduled credit card scraper`
      );

      try {
        // Connect to the database
        await connectToDatabase();

        // Run the scraper
        const scraper = new CreditCardScraper();
        const offers = await scraper.scrapeAll();

        console.log(
          `[${new Date().toISOString()}] Credit card scraper completed, scraped ${
            offers.length
          } offers`
        );
      } catch (error) {
        console.error(
          `[${new Date().toISOString()}] Error running credit card scraper:`,
          error
        );
      } finally {
        // Disconnect from the database
        await disconnectFromDatabase();
      }
    }
  );

  // Store the job
  scheduledJobs["creditCardScraper"] = job;

  console.log(`Scheduled credit card scraper with cron: ${cronExpression}`);
  console.log(`Next run: ${job.nextInvocation().toISOString()}`);
}

/**
 * Cancel the credit card scraper schedule
 */
export function cancelCreditCardScraper(): void {
  if (scheduledJobs["creditCardScraper"]) {
    scheduledJobs["creditCardScraper"].cancel();
    delete scheduledJobs["creditCardScraper"];
    console.log("Canceled credit card scraper job");
  }
}

/**
 * Get all scheduled jobs
 */
export function getScheduledJobs(): Record<string, schedule.Job> {
  return scheduledJobs;
}

/**
 * Run the credit card scraper immediately
 */
export async function runCreditCardScraper(): Promise<number> {
  console.log(
    `[${new Date().toISOString()}] Running credit card scraper manually`
  );

  try {
    // Connect to the database
    await connectToDatabase();

    // Run the scraper
    const scraper = new CreditCardScraper();
    const offers = await scraper.scrapeAll();

    console.log(
      `[${new Date().toISOString()}] Credit card scraper completed, scraped ${
        offers.length
      } offers`
    );
    return offers.length;
  } catch (error) {
    console.error(
      `[${new Date().toISOString()}] Error running credit card scraper:`,
      error
    );
    throw error;
  } finally {
    // Disconnect from the database
    await disconnectFromDatabase();
  }
}
