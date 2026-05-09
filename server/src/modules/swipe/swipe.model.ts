import mongoose from "mongoose";

/**
 * Swipe Database Model
 *
 * Represents a directional swipe (like or dislike) from one user to another.
 * Moved from the User document array to a dedicated collection to prevent
 * MongoDB BSON 16MB document limits at scale.
 */
const swipeSchema = new mongoose.Schema(
  {
    swiperId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["like", "dislike"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Database Indexes
 * 
 * 1. Explicit Field Indexes: `swiperId` and `targetId` are indexed individually 
 *    in the schema definition (`index: true`). This optimizes queries like
 *    "get all users I swiped on" or "get all users who swiped on me".
 * 2. Compound Unique Index (swiperId, targetId): 
 *    Enforces data integrity to prevent a user from swiping the same person twice,
 *    and supports the core match detection queries.
 */
swipeSchema.index({ swiperId: 1, targetId: 1 }, { unique: true });

const Swipe = mongoose.model("Swipe", swipeSchema);

export default Swipe;
