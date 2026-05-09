/**
 * Express Application Configuration
 *
 * Assembles the HTTP request pipeline:
 *   1. Security middleware (helmet, CORS, hpp, sanitization)
 *   2. Body parsing and cookie handling
 *   3. Observability (request logging, compression)
 *   4. Health and readiness endpoints
 *   5. API v1 routes + backward-compatible aliases
 *   6. 404 catch-all and global error handler
 *
 * Request Flow:
 *   Incoming Request
 *     → JSON parsing → CORS → Helmet → Compression
 *     → Cookie parsing → Request logging → Sanitization → HPP
 *     → Route matching → Controller → Service → DB
 *     → Response (or 404 / Error handler)
 *
 * Architecture Notes:
 * - Middleware order matters: security headers and sanitization
 *   run before any route handler touches the request body.
 * - The global error handler MUST be registered last so it
 *   catches errors thrown or forwarded from any layer above.
 * - Backward-compatible `/api/*` routes mirror `/api/v1/*` to
 *   avoid breaking existing clients during API versioning rollout.
 *
 * TODO: Add `/api/v2` namespace when breaking changes are needed.
 * TODO: Integrate request correlation IDs for distributed tracing.
 */
import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import hpp from "hpp";
import mongoose from "mongoose";

import { isRedisConnected } from "./redis/redis";
import { corsConfig } from "./config/cors";
import { sanitizeRequest } from "./middleware/sanitize.middleware";
import { requestLogger } from "./middleware/requestLogger";
import { recordLatency } from "./middleware/latency.middleware";
import { globalErrorHandler } from "./middleware/globalErrorHandler";

// ── Route imports ────────────────────────────────────────────
import authRoutes from "./modules/auth/auth.routes";
import userRoutes from "./modules/user/user.routes";
import matchRoutes from "./modules/match/match.routes";
import swipeRoutes from "./modules/swipe/swipe.routes";
import chatRoutes from "./modules/chat/chat.routes";
import notificationRoutes from "./modules/notification/notification.routes";
import paymentRoutes from "./modules/payment/payment.routes";
import aiRoutes from "./modules/ai/ai.routes";
import adminRoutes from "./modules/admin/admin.routes";
import reportRoutes from "./modules/report/report.routes";

const app = express();

// ── Global middleware ────────────────────────────────────────
// Order: parse → secure → compress → observe → sanitize
app.use(express.json());
app.use(cors(corsConfig));
app.use(helmet());
app.use(compression());
app.use(cookieParser());
app.use(requestLogger);
app.use(recordLatency);
app.use(sanitizeRequest);
app.use(hpp());

// ── Health check ─────────────────────────────────────────────
// Shallow check — use for load balancer / k8s probes.
app.get("/", (_req, res) => {
  res.send("HeartSync API Running...");
});

app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    status: "ok",
    uptime: process.uptime(),
    mongodb:
      mongoose.connection.readyState === 1
        ? "connected"
        : "disconnected",
    redis: isRedisConnected() ? "connected" : "disconnected",
  });
});

// ── API v1 routes ────────────────────────────────────────────
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/swipes", swipeRoutes);
app.use("/api/v1/matches", matchRoutes);
app.use("/api/v1/chat", chatRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/payments", paymentRoutes);
app.use("/api/v1/ai", aiRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/reports", reportRoutes);

// ── Backward-compatible routes (same routers) ────────────────
// These will be deprecated once all clients migrate to /api/v1.
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/swipes", swipeRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/ai", aiRoutes);

// ── 404 catch-all ────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// ── Global error handler (must be last) ──────────────────────
app.use(globalErrorHandler);

export default app;