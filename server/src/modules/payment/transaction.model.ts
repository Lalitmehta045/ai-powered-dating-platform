import mongoose from "mongoose";

/**
 * Transaction Database Model
 *
 * Records all financial exchanges on the platform.
 * Used for revenue tracking, refund auditing, and financial reporting.
 */
const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "INR",
    },
    subscriptionType: {
      type: String,
      enum: ["monthly", "yearly"],
      required: true,
    },
    paymentId: {
      type: String,
      required: true,
      unique: true,
    },
    orderId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["success", "failed", "pending"],
      default: "success",
      index: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for revenue aggregation
transactionSchema.index({ timestamp: -1, status: 1 });
transactionSchema.index({ subscriptionType: 1 });

const Transaction = mongoose.model("Transaction", transactionSchema);

export default Transaction;
