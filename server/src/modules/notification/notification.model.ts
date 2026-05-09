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
      required: false, // Optional for system/broadcast notifications
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
      enum: ["new_match", "new_message", "profile_like", "announcement", "moderation_action"],
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
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
 */
notificationSchema.index({ receiver: 1, isRead: 1, createdAt: -1 });

const Notification = mongoose.model(
  "Notification",
  notificationSchema
);

export default Notification;
