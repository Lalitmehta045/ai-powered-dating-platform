import mongoose from "mongoose";

/**
 * Chat Message Database Model
 *
 * Stores immutable chat history between two users.
 */
const chatMessageSchema = new mongoose.Schema(
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
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    isFlagged: {
      type: Boolean,
      default: false,
    },
    toxicityScore: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Database Indexes
 * 
 * 1. Compound Index (sender, receiver, createdAt): 
 *    Optimizes the `$or` query used to fetch the complete, paginated bidirectional
 *    conversation thread between two users. It supports sorting by `createdAt`.
 * 2. Compound Index (receiver, isRead):
 *    Critically optimizes the global "unread badges" aggregation pipeline,
 *    allowing the DB to instantly group unread messages without collection scans.
 * 3. Compound Index (receiver, sender, isRead, createdAt):
 *    Highly specific index covering sub-queries for targeted conversation updates.
 */
chatMessageSchema.index({ sender: 1, receiver: 1, createdAt: -1 });
chatMessageSchema.index({ receiver: 1, isRead: 1 });
chatMessageSchema.index({ receiver: 1, sender: 1, isRead: 1, createdAt: -1 });

const ChatMessage = mongoose.model("ChatMessage", chatMessageSchema);

export default ChatMessage;
