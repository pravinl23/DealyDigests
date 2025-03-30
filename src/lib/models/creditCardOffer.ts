import mongoose, { Schema, Document } from "mongoose";

// Define reward categories as an enum
export enum RewardCategory {
  TRAVEL = "travel",
  DINING = "dining",
  GROCERIES = "groceries",
  GAS = "gas",
  ENTERTAINMENT = "entertainment",
  SHOPPING = "shopping",
  STREAMING = "streaming",
  UTILITY = "utility",
  TRANSIT = "transit",
  BUSINESS = "business",
  PHARMACY = "pharmacy",
  OTHER = "other",
}

// Define the interface for credit card offers
export interface ICreditCardOffer extends Document {
  cardName: string;
  issuer: string;
  rewardsRate: string;
  annualFee: string;
  signupBonus: string;
  rewardCategories: RewardCategory[];
  merchantCompatibility: string[];
  source: string;
  sourceUrl: string;
  scrapedAt: Date;
}

// Create the MongoDB schema
const CreditCardOfferSchema: Schema = new Schema(
  {
    cardName: { type: String, required: true },
    issuer: { type: String, required: true },
    rewardsRate: { type: String, required: true },
    annualFee: { type: String, required: true },
    signupBonus: { type: String, default: "" },
    rewardCategories: [{ type: String, enum: Object.values(RewardCategory) }],
    merchantCompatibility: [{ type: String }],
    source: { type: String, required: true },
    sourceUrl: { type: String, required: true },
    scrapedAt: { type: Date, default: Date.now },
  },
  {
    // Add timestamps for createdAt and updatedAt
    timestamps: true,
  }
);

// Add a compound index on cardName and issuer
CreditCardOfferSchema.index({ cardName: 1, issuer: 1 }, { unique: true });

// Check if model already exists (useful for Next.js hot reloading)
export const CreditCardOffer =
  mongoose.models.CreditCardOffer ||
  mongoose.model<ICreditCardOffer>("CreditCardOffer", CreditCardOfferSchema);
