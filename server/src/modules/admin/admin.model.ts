import mongoose from "mongoose";

/**
 * Admin Database Model
 * 
 * Defines the schema for administrative users.
 * Supports different access levels: super_admin, moderator, and support_admin.
 */

const adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["super_admin", "moderator", "support_admin"],
      default: "support_admin",
    },
    lastLogin: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
adminSchema.index({ email: 1 }, { unique: true });
adminSchema.index({ role: 1 });

const Admin = mongoose.model("Admin", adminSchema);

export default Admin;
