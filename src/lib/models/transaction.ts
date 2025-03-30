import mongoose, { Schema, Document } from "mongoose";

export interface ITransaction extends Document {
  user_id: string;
  merchant: string;
  amount: number;
  date: Date;
  card_type: string;
  card_last4: string;
  category: string;
  transaction_id: string;
  description?: string;
  is_pending: boolean;
  created_at: Date;
}

const TransactionSchema: Schema = new Schema({
  user_id: { type: String, required: true, index: true },
  merchant: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: Date, required: true },
  card_type: { type: String, required: true },
  card_last4: { type: String, required: true },
  category: { type: String, required: true },
  transaction_id: { type: String, required: true, unique: true },
  description: { type: String },
  is_pending: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
});

// Create indexes for common queries
TransactionSchema.index({ user_id: 1, date: -1 });
TransactionSchema.index({ user_id: 1, merchant: 1 });
TransactionSchema.index({ user_id: 1, category: 1 });

// Create the model
export const Transaction =
  mongoose.models.Transaction ||
  mongoose.model<ITransaction>("Transaction", TransactionSchema);

export default Transaction;
