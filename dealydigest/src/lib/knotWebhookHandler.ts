import mongoose from "mongoose";
import { connectToDatabase } from "./mongodb";
import KnotWebhook from "./models/knotWebhook";
import Transaction from "./models/transaction";
import { knotClient } from "./knot";

// Function to update user's cards based on CARD_UPDATED event
export async function handleCardUpdatedEvent(webhookId: string) {
  try {
    // Ensure MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      await connectToDatabase();
    }

    // Find the webhook data
    const webhook = await KnotWebhook.findById(webhookId);
    if (!webhook) {
      throw new Error(`Webhook with ID ${webhookId} not found`);
    }

    const { raw_data: data, user_id } = webhook;

    // Process card data
    // In a real implementation, you would fetch the card data from Knot API
    // and update the user's cards in your database
    console.log(`Processing card update for user ${user_id}`);

    // Update the webhook to mark it as processed
    webhook.status = "processed";
    await webhook.save();

    return { success: true };
  } catch (error) {
    console.error("Error handling card updated event:", error);
    return { success: false, error };
  }
}

// Function to handle merchant status update
export async function handleMerchantStatusUpdate(webhookId: string) {
  try {
    // Ensure MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      await connectToDatabase();
    }

    // Find the webhook data
    const webhook = await KnotWebhook.findById(webhookId);
    if (!webhook) {
      throw new Error(`Webhook with ID ${webhookId} not found`);
    }

    const { raw_data: data, merchant_id } = webhook;

    // Process merchant status update
    console.log(
      `Processing merchant status update for merchant ${merchant_id}`
    );

    // Update the webhook to mark it as processed
    webhook.status = "processed";
    await webhook.save();

    return { success: true };
  } catch (error) {
    console.error("Error handling merchant status update:", error);
    return { success: false, error };
  }
}

// Function to process transaction data
async function processTransactions(userId: string, transactions: any[]) {
  try {
    // Process each transaction
    const processedTransactions = [];

    for (const tx of transactions) {
      try {
        // Map Knot transaction data to our model
        const transactionData = {
          user_id: userId,
          merchant: tx.merchant_name || "Unknown Merchant",
          amount: tx.amount || 0,
          date: new Date(tx.transaction_date || Date.now()),
          card_type: tx.card_type || "Unknown Card",
          card_last4: tx.last4 || "0000",
          category: tx.category || "Uncategorized",
          transaction_id:
            tx.transaction_id ||
            `tx-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          description: tx.description || "",
          is_pending: tx.pending || false,
        };

        // Check if transaction already exists
        const existingTransaction = await Transaction.findOne({
          transaction_id: transactionData.transaction_id,
        });

        if (existingTransaction) {
          // Update existing transaction
          Object.assign(existingTransaction, transactionData);
          await existingTransaction.save();
          processedTransactions.push(existingTransaction);
        } else {
          // Create new transaction
          const newTransaction = new Transaction(transactionData);
          await newTransaction.save();
          processedTransactions.push(newTransaction);
        }
      } catch (err) {
        console.error("Error processing individual transaction:", err);
        // Continue with next transaction
      }
    }

    return processedTransactions;
  } catch (error) {
    console.error("Error in transaction processing:", error);
    throw error;
  }
}

// Function to handle transaction sync completion
export async function handleTransactionSyncComplete(webhookId: string) {
  try {
    // Ensure MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      await connectToDatabase();
    }

    // Find the webhook data
    const webhook = await KnotWebhook.findById(webhookId);
    if (!webhook) {
      throw new Error(`Webhook with ID ${webhookId} not found`);
    }

    const { raw_data: data, session_id, user_id } = webhook;

    console.log(
      `Processing transaction sync completion for session ${session_id} and user ${user_id}`
    );

    // In a real implementation, you would fetch the transaction data from Knot API
    // For this implementation, we'll use sample data if it's in the webhook or mock it
    let transactions = [];

    if (data.transactions && Array.isArray(data.transactions)) {
      transactions = data.transactions;
    } else {
      // Try to fetch transactions from Knot using the session_id
      try {
        // This is a mock implementation - in a real app, you'd use the Knot API
        // to fetch transactions for the given session
        const currentDate = new Date();
        const startDate = new Date(currentDate);
        startDate.setDate(startDate.getDate() - 30); // Last 30 days

        // Use the mock data from the client for now
        // In a real implementation, use the Knot API to fetch transaction data
        const transactionData = await knotClient.getTransactions(
          "mock-session",
          startDate.toISOString().split("T")[0],
          currentDate.toISOString().split("T")[0]
        );

        transactions = transactionData.transactions || [];
      } catch (err) {
        console.error("Error fetching transactions from Knot:", err);
      }
    }

    // Process transactions into our database
    if (transactions.length > 0) {
      const processedTransactions = await processTransactions(
        user_id,
        transactions
      );
      console.log(
        `Processed ${processedTransactions.length} transactions for user ${user_id}`
      );
    } else {
      console.log(`No transactions found for session ${session_id}`);
    }

    // Update the webhook to mark it as processed
    webhook.status = "processed";
    await webhook.save();

    return { success: true, transactionCount: transactions.length };
  } catch (error) {
    console.error("Error handling transaction sync completion:", error);
    return { success: false, error };
  }
}

// Generic webhook handler that routes to specific handlers based on event type
export async function processWebhook(webhookId: string) {
  try {
    // Ensure MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      await connectToDatabase();
    }

    // Find the webhook data
    const webhook = await KnotWebhook.findById(webhookId);
    if (!webhook) {
      throw new Error(`Webhook with ID ${webhookId} not found`);
    }

    // Process webhook based on event type
    switch (webhook.event) {
      case "CARD_UPDATED":
        return handleCardUpdatedEvent(webhookId);

      case "MERCHANT_STATUS_UPDATE":
        return handleMerchantStatusUpdate(webhookId);

      case "TRANSACTION_SYNC_COMPLETE":
        return handleTransactionSyncComplete(webhookId);

      default:
        console.log(`Unhandled webhook event type: ${webhook.event}`);
        return {
          success: false,
          error: `Unhandled event type: ${webhook.event}`,
        };
    }
  } catch (error) {
    console.error("Error processing webhook:", error);
    return { success: false, error };
  }
}
