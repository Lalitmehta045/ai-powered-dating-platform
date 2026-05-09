import mongoose from "mongoose";

/**
 * Match Database Model
 *
 * Represents a mutual like between two users. 
 * While the relational aspect is stored on the User document (`matches` array),
 * this specific entity is used to track the *moment* of the match, generate
 * unique Match IDs, and act as a foundation for future extensions (e.g. unmatching, 
 * reporting, or archiving matches).
 */
const matchSchema = new mongoose.Schema(
  {
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    matchedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

matchSchema.index({ users: 1 });

const Match = mongoose.model("Match", matchSchema);

export default Match;