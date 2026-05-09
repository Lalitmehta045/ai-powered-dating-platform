import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(__dirname, "../../.env") });

/**
 * Production Index Audit & Optimization Script
 *
 * Ensures all MongoDB collections have the correct indexes
 * for high-performance aggregation and query patterns used
 * by the admin portal.
 */
const ensureIndexes = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log("🔌 Connected to MongoDB");

    const db = mongoose.connection.db!;

    // ── AuditLog Indexes ─────────────────────────────────
    const auditLogs = db.collection("auditlogs");
    await auditLogs.createIndex({ timestamp: -1 });
    await auditLogs.createIndex({ adminId: 1, timestamp: -1 });
    await auditLogs.createIndex({ action: 1, timestamp: -1 });
    console.log("✅ AuditLog indexes ensured");

    // ── Transaction Indexes ──────────────────────────────
    const transactions = db.collection("transactions");
    await transactions.createIndex({ timestamp: -1, status: 1 });
    await transactions.createIndex({ userId: 1, timestamp: -1 });
    await transactions.createIndex({ subscriptionType: 1 });
    await transactions.createIndex({ paymentId: 1 }, { unique: true });
    console.log("✅ Transaction indexes ensured");

    // ── Report Indexes ───────────────────────────────────
    const reports = db.collection("reports");
    await reports.createIndex({ status: 1, createdAt: -1 });
    await reports.createIndex({ targetUserId: 1 });
    await reports.createIndex({ reporterId: 1 });
    console.log("✅ Report indexes ensured");

    // ── Notification Indexes ─────────────────────────────
    const notifications = db.collection("notifications");
    await notifications.createIndex({ receiver: 1, createdAt: -1 });
    await notifications.createIndex({ receiver: 1, isRead: 1 });
    console.log("✅ Notification indexes ensured");

    // ── User Indexes (Admin Portal Queries) ──────────────
    const users = db.collection("users");
    await users.createIndex({ isPremium: 1, premiumExpiresAt: 1 });
    await users.createIndex({ status: 1 });
    await users.createIndex({ riskScore: -1 });
    await users.createIndex({ reportCount: -1 });
    await users.createIndex({ gender: 1 });
    console.log("✅ User (admin) indexes ensured");

    // ── Admin Indexes ────────────────────────────────────
    const admins = db.collection("admins");
    await admins.createIndex({ email: 1 }, { unique: true });
    console.log("✅ Admin indexes ensured");

    console.log("\n🎯 All production indexes verified successfully.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Index audit failed:", error);
    process.exit(1);
  }
};

ensureIndexes();
