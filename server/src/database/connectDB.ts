/**
 * MongoDB Connection Bootstrap
 *
 * Establishes the connection pool to the MongoDB replica set/cluster.
 *
 * Architecture Notes:
 * - Called synchronously during application startup (`server.ts`).
 * - Mongoose manages the underlying connection pool automatically,
 *   buffering operations if the connection temporarily drops.
 * - Connection state is exposed via the `/health` endpoint for
 *   orchestrators (like Kubernetes or PM2) to monitor.
 */
import mongoose from "mongoose";
import { env } from "../config/env";
import { logger } from "../logger/logger";

const connectDB = async () => {
  try {
    await mongoose.connect(env.MONGO_URI);

    logger.info("MongoDB connected");
  } catch (error) {
    logger.error("MongoDB connection failed", {
      error: String(error),
    });
  }
};

export default connectDB;