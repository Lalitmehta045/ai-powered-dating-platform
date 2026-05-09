import mongoose from "mongoose";

/**
 * User Database Model
 *
 * Defines the schema for the central User entity.
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

    // Administrative State
    status: {
      type: String,
      enum: ["active", "suspended", "banned"],
      default: "active",
    },
    suspensionExpiresAt: {
      type: Date,
      default: null,
    },
    riskScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 1,
    },
    reportCount: {
      type: Number,
      default: 0,
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

// Virtual for profileImage
userSchema.virtual("profileImage").get(function() {
  return this.photos && this.photos.length > 0 ? this.photos[0] : null;
});

// Indexes
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ interests: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ gender: 1, interestedIn: 1, age: 1, createdAt: -1 });
userSchema.index({ isPremium: 1 });
userSchema.index({ status: 1 });
userSchema.index({ riskScore: -1 });
userSchema.index({ location: "2dsphere" });

const User = mongoose.model("User", userSchema);

export default User;