import { scheduleCreditCardScraper } from "@/lib/scheduler";

// Flag to track whether the scheduler has been started
let schedulerStarted = false;

/**
 * Initialize the scheduler for various tasks
 */
export function initializeScheduler() {
  // Only start the scheduler once
  if (schedulerStarted) {
    return;
  }

  console.log("Initializing scheduler for recurring tasks");

  // Schedule the credit card scraper to run daily at midnight
  // Uses cron format: minute hour day month day-of-week
  scheduleCreditCardScraper("0 0 * * *");

  // Mark as started
  schedulerStarted = true;

  console.log("Scheduler initialized successfully");
}
