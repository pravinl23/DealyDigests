import mongoose, { Schema, Document } from "mongoose";

export interface IKnotWebhook extends Document {
  event: string;
  session_id?: string;
  merchant_id?: number;
  user_id: string;
  status?: string;
  timestamp: Date;
  raw_data: Record<string, any>;
  signature: string;
  verified: boolean;
}

const KnotWebhookSchema: Schema = new Schema({
  event: { type: String, required: true },
  session_id: { type: String },
  merchant_id: { type: Number },
  user_id: { type: String, required: true },
  status: { type: String },
  timestamp: { type: Date, default: Date.now },
  raw_data: { type: Schema.Types.Mixed, required: true },
  signature: { type: String, required: true },
  verified: { type: Boolean, default: false },
});

// Create the model
export const KnotWebhook =
  mongoose.models.KnotWebhook ||
  mongoose.model<IKnotWebhook>("KnotWebhook", KnotWebhookSchema);

export default KnotWebhook;
