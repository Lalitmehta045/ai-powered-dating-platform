import { Router } from "express";
import { analyticsController } from "./analytics.controller";
import { verifyAdmin, requireRole } from "../../../middleware/admin.auth";

const router = Router();

/**
 * Protected Admin Analytics Routes
 * Only accessible by super_admin and moderator
 */
router.use(verifyAdmin as any);
router.use(requireRole(["super_admin", "moderator"]) as any);

router.get("/overview", analyticsController.getOverview);
router.get("/realtime", analyticsController.getRealtime);

export default router;
