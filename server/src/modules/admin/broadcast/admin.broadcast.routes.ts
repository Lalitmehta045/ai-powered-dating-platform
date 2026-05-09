import { Router } from "express";
import { adminBroadcastController } from "./admin.broadcast.controller";
import { verifyAdmin, requireRole } from "../../../middleware/admin.auth";

const router = Router();

/**
 * Protected Admin Broadcast Routes
 */
router.use(verifyAdmin as any);
router.use(requireRole(["super_admin", "moderator"]) as any);

router.post("/", adminBroadcastController.sendBroadcast);

export default router;
