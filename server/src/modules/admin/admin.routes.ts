import { Router } from "express";
import { adminController } from "./admin.controller";
import { verifyAdmin } from "../../middleware/admin.auth";
import { adminAuthLimiter } from "../../middleware/rateLimiter";
import analyticsRoutes from "./analytics/analytics.routes";
import userManagementRoutes from "./users/admin.user.routes";
import moderationRoutes from "./reports/admin.report.routes";
import aiModerationRoutes from "./ai/ai.moderation.routes";
import premiumRoutes from "./premium/admin.premium.routes";
import healthRoutes from "./monitoring/admin.health.routes";
import broadcastRoutes from "./broadcast/admin.broadcast.routes";
import auditRoutes from "./audit/admin.audit.routes";

const router = Router();

/**
 * Public Admin Routes
 */
router.post("/login", adminAuthLimiter, adminController.login);

/**
 * Protected Admin Routes
 */
router.use(verifyAdmin as any);

router.use("/analytics", analyticsRoutes);
router.use("/users", userManagementRoutes);
router.use("/reports", moderationRoutes);
router.use("/ai-moderation", aiModerationRoutes);
router.use("/premium", premiumRoutes);
router.use("/health", healthRoutes);
router.use("/broadcast", broadcastRoutes);
router.use("/audit", auditRoutes);
router.get("/me", adminController.getMe);
router.post("/logout", adminController.logout);

export default router;
