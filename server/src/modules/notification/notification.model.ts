import mongoose from "mongoose";

/**
 * Notification Database Model
 *
 * Centralized logging for asynchronous user events (likes, matches, messages).
 * 
 * Design Decisions:
 * - `metadata`: Declared as `Schema.Types.Mixed` (unstructured object) to 
 *   accommodate diverse payload requirements across different notification types
 *   (e.g., storing `matchId` vs `messageId`) without schema migrations.
 */
const notificationSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["new_match", "new_message", "profile_like"],
      required: true,
      index: true,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Database Indexes
 * 
 * 1. Compound Index (receiver, isRead, createdAt):
 *    Highly optimized for the most common query: fetching a user's 
 *    unread notifications ordered by recency.
 */
notificationSchema.index({ receiver: 1, isRead: 1, createdAt: -1 });

const Notification = mongoose.model(
  "Notification",
  notificationSchema
);

export default Notification;
