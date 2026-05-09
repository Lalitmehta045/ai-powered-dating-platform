import mongoose from "mongoose";

/**
 * User Database Model
 *
 * Defines the schema for the central User entity.
 * Contains core profile data, matchmaking preferences, relationship
 * graph edges (likes/matches), and premium subscription state.
 */

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
    },

    age: Number,

    gender: String,

    bio: {
      type: String,
      default: "",
    },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point"
      },
      coordinates: {
        type: [Number],
        default: [0, 0]
      }
    },
      
    interestedIn: String,
      
    photos: {
      type: [String],
      default: [],
    },

    interests: [String],


    // Premium Features State
    isPremium: {
      type: Boolean,
      default: false,
    },

    premiumExpiresAt: {
      type: Date,
      default: null,
    },

    subscriptionType: {
      type: String,
      enum: ["free", "monthly", "yearly"],
      default: "free",
    },
    
    settings: {
      notificationsEnabled: {
        type: Boolean,
        default: true,
      },
      theme: {
        type: String,
        enum: ["light", "dark"],
        default: "dark",
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for profileImage (compatibility with client)
userSchema.virtual("profileImage").get(function() {
  return this.photos && this.photos.length > 0 ? this.photos[0] : null;
});

/**
 * Database Indexes
 * 
 * 1. email (unique): Prevents duplicate accounts and speeds up auth lookups.
 * 2. interests: Optimizes aggregate `$setIntersection` for shared-interest recommendation algorithms.
 * 3. createdAt: Speeds up sorting new profiles (e.g., "Newest Users" feeds).
 * 4. Compound Index: Optimizes the primary recommendation engine query filtering
 *    by gender, target gender preference, and age simultaneously.
 * 5. isPremium: Speeds up filtering premium users for boost features or analytics.
 * 6. location (2dsphere): Future-proofs the schema for geo-spatial queries, enabling
 *    distance filtering and nearby user discovery algorithms.
 */
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ interests: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ gender: 1, interestedIn: 1, age: 1, createdAt: -1 });
userSchema.index({ isPremium: 1 });
userSchema.index({ location: "2dsphere" });

const User = mongoose.model("User", userSchema);

export default User;