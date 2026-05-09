/**
 * Server Bootstrap
 *
 * Application entry point — orchestrates the startup sequence:
 *   1. Load environment variables (dotenv → Zod validation)
 *   2. Connect to MongoDB and Redis
 *   3. Create HTTP server and attach Socket.IO
 *   4. Bind to the configured port
 *
 * Architecture Notes:
 * - dotenv.config() MUST run before any module that reads `env`,
 *   which is why it's called synchronously at the top.
 * - DB and Redis connections are fire-and-forget; the app
 *   degrades gracefully if Redis is unavailable.
 * - Socket.IO is attached to the raw HTTP server (not Express)
 *   so websocket upgrades bypass Express middleware.
 *
 * TODO: Add graceful shutdown handler (SIGTERM/SIGINT) to close
 *       DB connections and drain active sockets before exit.
 */
import dotenv from "dotenv";
dotenv.config();

// Env must be imported after dotenv.config() loads .env file
import { env } from "./config/env";

import http from "http";
import app from "./app";
import connectDB from "./database/connectDB";
import { initializeSocket } from "./socket";
import { connectRedis } from "./redis/redis";
import { logger } from "./logger/logger";

connectDB();
connectRedis();

const httpServer = http.createServer(app);

initializeSocket(httpServer);

httpServer.listen(env.PORT, () => {
  logger.info(`Server running on port ${env.PORT}`);
});
 
