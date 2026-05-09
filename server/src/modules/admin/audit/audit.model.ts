import mongoose from "mongoose";

/**
 * Audit Log Model
 * 
 * Tracks all administrative actions for accountability and security audits.
 */
const auditLogSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
      index: true,
    },
    action: {
      type: String,
      required: true,
      index: true,
      // e.g. USER_BAN, REPORT_RESOLVE, PREMIUM_ADJUST, BROADCAST_SEND
    },
    targetType: {
      type: String,
      required: true,
      // User, Report, Admin, etc.
    },
    targetId: {
      type: mongoose.Schema.Types.Mixed,
      required: false,
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false, // We use our own timestamp field
  }
);

const AuditLog = mongoose.model("AuditLog", auditLogSchema);

export default AuditLog;
